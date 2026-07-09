package com.medisync.controller;

import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class PharmacyBulkUploadController {

    private final PharmacyRepository pharmacyRepository;
    private final MasterMedicineRepository masterMedicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryLogRepository inventoryLogRepository;

    /**
     * Download Excel template for pharmacy bulk medicine upload.
     * Template has: Medicine Name (dropdown from master list), Brand, Price, Stock Quantity, Description
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate(Authentication auth) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("My Medicines");

            // ─── Header style ────────────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // ─── Headers ─────────────────────────────────────────────────────
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Medicine Name", "Brand", "Price", "Stock Quantity", "Description"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ─── Master medicine dropdown validation ─────────────────────────
            List<MasterMedicine> masterMedicines = masterMedicineRepository.findAll();
            String[] medicineNames = masterMedicines.stream()
                    .map(MasterMedicine::getMedicineName)
                    .sorted()
                    .toArray(String[]::new);

            if (medicineNames.length > 0) {
                // Create a hidden sheet for medicine list
                XSSFSheet hiddenSheet = workbook.createSheet("Medicine_List");
                for (int i = 0; i < medicineNames.length; i++) {
                    hiddenSheet.createRow(i).createCell(0).setCellValue(medicineNames[i]);
                }

                // Create named range for validation
                Name namedRange = workbook.createName();
                namedRange.setNameName("MedicineList");
                namedRange.setRefersToFormula("Medicine_List!$A$1:$A$" + medicineNames.length);

                // Apply dropdown validation to Medicine Name column (rows 1-1000)
                DataValidationHelper validationHelper = sheet.getDataValidationHelper();
                DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("MedicineList");
                CellRangeAddressList addressList = new CellRangeAddressList(1, 1000, 0, 0);
                DataValidation validation = validationHelper.createValidation(constraint, addressList);
                validation.setShowErrorBox(true);
                validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
                validation.createErrorBox("Invalid Medicine", "Please select a medicine from the dropdown list. Only medicines approved by admin are allowed.");
                validation.setShowPromptBox(true);
                validation.createPromptBox("Medicine Name", "Select a medicine from the dropdown list");
                sheet.addValidationData(validation);

                // Hide the medicine list sheet
                workbook.setSheetHidden(1, true);
            }

            // ─── Set column widths ───────────────────────────────────────────
            sheet.setColumnWidth(0, 10000); // Medicine Name
            sheet.setColumnWidth(1, 5000);  // Brand
            sheet.setColumnWidth(2, 3500);  // Price
            sheet.setColumnWidth(3, 4500);  // Stock Quantity
            sheet.setColumnWidth(4, 10000); // Description

            // ─── Add sample row ──────────────────────────────────────────────
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue(medicineNames.length > 0 ? medicineNames[0] : "");
            sampleRow.createCell(1).setCellValue("Cipla");
            sampleRow.createCell(2).setCellValue(85.00);
            sampleRow.createCell(3).setCellValue(100);
            sampleRow.createCell(4).setCellValue("Broad-spectrum antibiotic");

            // ─── Instructions sheet ──────────────────────────────────────────
            XSSFSheet instructionSheet = workbook.createSheet("Instructions");
            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldFont.setFontHeightInPoints((short) 14);
            boldStyle.setFont(boldFont);

            Row r0 = instructionSheet.createRow(0);
            r0.createCell(0).setCellValue("Bulk Medicine Upload Instructions");
            r0.getCell(0).setCellStyle(boldStyle);

            instructionSheet.createRow(2).createCell(0).setCellValue("1. Go to 'My Medicines' sheet");
            instructionSheet.createRow(3).createCell(0).setCellValue("2. Medicine Name: Select from dropdown (only admin-approved medicines)");
            instructionSheet.createRow(4).createCell(0).setCellValue("3. Brand: Enter your brand name (e.g., Cipla, Dolo, Crocin)");
            instructionSheet.createRow(5).createCell(0).setCellValue("4. Price: Enter price in ₹ (must be > 0)");
            instructionSheet.createRow(6).createCell(0).setCellValue("5. Stock Quantity: Enter number of units in stock");
            instructionSheet.createRow(7).createCell(0).setCellValue("6. Description: Optional brief description");
            instructionSheet.createRow(9).createCell(0).setCellValue("Note: Delete the sample row before uploading!");
            instructionSheet.createRow(10).createCell(0).setCellValue("Note: Duplicate entries (same medicine + brand) will be skipped.");

            instructionSheet.setColumnWidth(0, 20000);

            // ─── Write to byte array ─────────────────────────────────────────
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDispositionFormData("attachment", "pharmacy_medicine_template.xlsx");

            return ResponseEntity.ok().headers(responseHeaders).body(out.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Bulk upload medicines for a pharmacy from Excel file.
     * Expects columns: Medicine Name, Brand, Price, Stock Quantity, Description
     */
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(Authentication auth, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only Excel files (.xlsx, .xls) are supported"));
        }

        // Get pharmacy from auth
        Pharmacy pharmacy = pharmacyRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Load master medicines into a map for quick lookup
            List<MasterMedicine> masterMedicines = masterMedicineRepository.findAll();
            Map<String, MasterMedicine> medicineMap = masterMedicines.stream()
                    .collect(Collectors.toMap(
                            m -> m.getMedicineName().toLowerCase().trim(),
                            m -> m,
                            (existing, replacement) -> existing
                    ));

            List<String> added = new ArrayList<>();
            List<String> skipped = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            int rowCount = sheet.getLastRowNum();

            for (int i = 1; i <= rowCount; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Read medicine name
                String medicineName = getCellValueAsString(row.getCell(0)).trim();
                if (medicineName.isEmpty()) continue;

                // Read brand
                String brand = getCellValueAsString(row.getCell(1)).trim();

                // Read price
                BigDecimal price;
                try {
                    double priceVal = getNumericCellValue(row.getCell(2));
                    if (priceVal <= 0) {
                        errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Price must be greater than 0");
                        continue;
                    }
                    price = BigDecimal.valueOf(priceVal);
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Invalid price value");
                    continue;
                }

                // Read stock quantity
                int stockQuantity;
                try {
                    stockQuantity = (int) getNumericCellValue(row.getCell(3));
                    if (stockQuantity < 0) {
                        errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Stock cannot be negative");
                        continue;
                    }
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Invalid stock quantity");
                    continue;
                }

                // Read description
                String description = getCellValueAsString(row.getCell(4)).trim();

                // Find master medicine
                MasterMedicine masterMedicine = medicineMap.get(medicineName.toLowerCase());
                if (masterMedicine == null) {
                    errors.add("Row " + (i + 1) + ": '" + medicineName + "' - Not found in master medicine list");
                    continue;
                }

                // Check if pharmacy already has this medicine + brand combo
                boolean exists = medicineRepository.findByPharmacyPharmacyId(pharmacy.getPharmacyId()).stream()
                        .anyMatch(m -> m.getMasterMedicine() != null
                                && m.getMasterMedicine().getMasterMedicineId().equals(masterMedicine.getMasterMedicineId())
                                && (brand.isEmpty() ? (m.getBrand() == null || m.getBrand().isEmpty())
                                        : brand.equalsIgnoreCase(m.getBrand())));

                if (exists) {
                    skipped.add(medicineName + (brand.isEmpty() ? "" : " (" + brand + ")"));
                    continue;
                }

                // Insert medicine
                Medicine medicine = new Medicine();
                medicine.setPharmacy(pharmacy);
                medicine.setMasterMedicine(masterMedicine);
                medicine.setCategory(masterMedicine.getCategory());
                medicine.setMedicineName(masterMedicine.getMedicineName());
                medicine.setBrand(brand.isEmpty() ? null : brand);
                medicine.setPrice(price);
                medicine.setStockQuantity(stockQuantity);
                medicine.setDescription(description.isEmpty() ? null : description);

                Medicine saved = medicineRepository.save(medicine);

                // Log inventory
                InventoryLog log = new InventoryLog();
                log.setMedicine(saved);
                log.setAction("add");
                log.setQuantityChange(stockQuantity);
                log.setStockAfter(stockQuantity);
                inventoryLogRepository.save(log);

                added.add(medicineName + (brand.isEmpty() ? "" : " (" + brand + ")"));
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
            case NUMERIC: return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }

    private double getNumericCellValue(Cell cell) {
        if (cell == null) return 0;
        switch (cell.getCellType()) {
            case NUMERIC: return cell.getNumericCellValue();
            case STRING:
                try { return Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { throw new RuntimeException("Not a number"); }
            default: return 0;
        }
    }
}
