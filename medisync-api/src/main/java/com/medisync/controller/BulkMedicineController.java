package com.medisync.controller;

import com.medisync.entity.MasterMedicine;
import com.medisync.entity.MedicineCategory;
import com.medisync.repository.MasterMedicineRepository;
import com.medisync.repository.MedicineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/master-medicines")
@RequiredArgsConstructor
public class BulkMedicineController {

    private final MasterMedicineRepository masterMedicineRepository;
    private final MedicineCategoryRepository categoryRepository;

    /**
     * Download Excel template for bulk medicine upload.
     * Template has: Medicine Name, Category (dropdown from existing categories)
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Medicines");

            // ─── Header style ────────────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // ─── Headers ─────────────────────────────────────────────────────
            Row headerRow = sheet.createRow(0);
            Cell cell0 = headerRow.createCell(0);
            cell0.setCellValue("Medicine Name");
            cell0.setCellStyle(headerStyle);

            Cell cell1 = headerRow.createCell(1);
            cell1.setCellValue("Category");
            cell1.setCellStyle(headerStyle);

            // ─── Category dropdown validation ────────────────────────────────
            List<MedicineCategory> categories = categoryRepository.findAll();
            String[] categoryNames = categories.stream()
                    .map(MedicineCategory::getCategoryName)
                    .toArray(String[]::new);

            if (categoryNames.length > 0) {
                // Create a hidden sheet for category list
                XSSFSheet hiddenSheet = workbook.createSheet("Categories_List");
                for (int i = 0; i < categoryNames.length; i++) {
                    hiddenSheet.createRow(i).createCell(0).setCellValue(categoryNames[i]);
                }

                // Create named range for validation
                Name namedRange = workbook.createName();
                namedRange.setNameName("CategoryList");
                namedRange.setRefersToFormula("Categories_List!$A$1:$A$" + categoryNames.length);

                // Apply dropdown validation to Category column (rows 1-1000)
                DataValidationHelper validationHelper = sheet.getDataValidationHelper();
                DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("CategoryList");
                CellRangeAddressList addressList = new CellRangeAddressList(1, 1000, 1, 1);
                DataValidation validation = validationHelper.createValidation(constraint, addressList);
                validation.setShowErrorBox(true);
                validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
                validation.createErrorBox("Invalid Category", "Please select a category from the dropdown list.");
                sheet.addValidationData(validation);

                // Hide the categories sheet
                workbook.setSheetHidden(1, true);
            }

            // ─── Set column widths ───────────────────────────────────────────
            sheet.setColumnWidth(0, 10000);
            sheet.setColumnWidth(1, 7000);

            // ─── Add sample rows ─────────────────────────────────────────────
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("Example: Paracetamol 650mg");
            sampleRow.createCell(1).setCellValue(categoryNames.length > 0 ? categoryNames[0] : "");

            // ─── Write to byte array ─────────────────────────────────────────
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "medicine_upload_template.xlsx");

            return ResponseEntity.ok().headers(headers).body(out.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Bulk upload medicines from Excel file.
     * Expects columns: Medicine Name, Category
     * Skips duplicates and returns a summary.
     */
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only Excel files (.xlsx, .xls) are supported"));
        }

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Load categories into a map for quick lookup
            List<MedicineCategory> categories = categoryRepository.findAll();
            Map<String, MedicineCategory> categoryMap = categories.stream()
                    .collect(Collectors.toMap(
                            c -> c.getCategoryName().toLowerCase().trim(),
                            c -> c,
                            (existing, replacement) -> existing
                    ));

            List<String> added = new ArrayList<>();
            List<String> skipped = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            int rowCount = sheet.getLastRowNum();

            for (int i = 1; i <= rowCount; i++) { // Skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Read medicine name
                Cell nameCell = row.getCell(0);
                String medicineName = getCellValueAsString(nameCell).trim();

                if (medicineName.isEmpty()) continue; // Skip empty rows

                // Read category
                Cell categoryCell = row.getCell(1);
                String categoryName = getCellValueAsString(categoryCell).trim();

                if (categoryName.isEmpty()) {
                    errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Category is missing");
                    continue;
                }

                // Find category
                MedicineCategory category = categoryMap.get(categoryName.toLowerCase());
                if (category == null) {
                    errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Category '" + categoryName + "' not found");
                    continue;
                }

                // Check duplicate
                if (masterMedicineRepository.existsByMedicineNameIgnoreCase(medicineName)) {
                    skipped.add(medicineName);
                    continue;
                }

                // Insert
                MasterMedicine medicine = new MasterMedicine();
                medicine.setMedicineName(medicineName);
                medicine.setCategory(category);
                masterMedicineRepository.save(medicine);
                added.add(medicineName);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("totalProcessed", added.size() + skipped.size() + errors.size());
            result.put("added", added.size());
            result.put("skipped", skipped.size());
            result.put("errors", errors.size());
            result.put("addedMedicines", added);
            result.put("skippedMedicines", skipped);
            result.put("errorDetails", errors);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process file: " + e.getMessage()));
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }
}
