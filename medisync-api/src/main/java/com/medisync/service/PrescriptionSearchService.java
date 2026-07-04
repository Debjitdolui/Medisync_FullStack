package com.medisync.service;

import com.medisync.dto.PharmacySearchResult;
import com.medisync.dto.PrescriptionSearchRequest;
import com.medisync.entity.Medicine;
import com.medisync.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionSearchService {

    private final MedicineRepository medicineRepository;

    public List<PharmacySearchResult> search(PrescriptionSearchRequest req) {
        List<String> lowerNames = req.getMedicineNames().stream()
                .map(String::toLowerCase).collect(Collectors.toList());

        List<Medicine> medicines = medicineRepository.findByMedicineNameInAndInStock(lowerNames);

        Map<Long, List<Medicine>> grouped = medicines.stream()
                .collect(Collectors.groupingBy(m -> m.getPharmacy().getPharmacyId()));

        List<PharmacySearchResult> results = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            List<Medicine> meds = entry.getValue();
            var pharmacy = meds.get(0).getPharmacy();

            Set<String> foundNames = meds.stream()
                    .map(m -> m.getMedicineName().toLowerCase())
                    .collect(Collectors.toSet());

            BigDecimal totalPrice = meds.stream()
                    .map(Medicine::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double distance = 0;
            if (req.getLatitude() != null && req.getLongitude() != null
                    && pharmacy.getLatitude() != null && pharmacy.getLongitude() != null) {
                distance = calculateDistance(
                        req.getLatitude().doubleValue(), req.getLongitude().doubleValue(),
                        pharmacy.getLatitude().doubleValue(), pharmacy.getLongitude().doubleValue());
            }

            if (req.getMaxDistanceKm() != null && distance > req.getMaxDistanceKm().doubleValue()) {
                continue;
            }

            int medicinesFound = foundNames.size();
            boolean hasAll = medicinesFound == lowerNames.size();

            results.add(new PharmacySearchResult(
                    pharmacy.getPharmacyId(), pharmacy.getPharmacyName(),
                    totalPrice, distance, medicinesFound, lowerNames.size(), hasAll));
        }

        results.sort(Comparator.comparing(PharmacySearchResult::isHasAllMedicines).reversed()
                .thenComparing(PharmacySearchResult::getDistanceKm));

        return results;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
