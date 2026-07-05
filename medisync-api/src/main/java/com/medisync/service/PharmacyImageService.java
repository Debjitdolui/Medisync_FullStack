package com.medisync.service;

import com.medisync.entity.Pharmacy;
import com.medisync.entity.PharmacyImage;
import com.medisync.repository.PharmacyImageRepository;
import com.medisync.repository.PharmacyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PharmacyImageService {

    private final PharmacyImageRepository imageRepository;
    private final PharmacyRepository pharmacyRepository;

    private static final String UPLOAD_DIR = "uploads/pharmacies";
    private static final int MAX_IMAGES = 3;
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp");

    public PharmacyImage uploadImage(Long pharmacyId, MultipartFile file) throws IOException {
        // Validate pharmacy exists
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));

        // Validate max images
        int currentCount = imageRepository.countByPharmacyPharmacyId(pharmacyId);
        if (currentCount >= MAX_IMAGES) {
            throw new RuntimeException("Maximum " + MAX_IMAGES + " images allowed per pharmacy");
        }

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size must be less than 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Only JPG, PNG, and WebP images are allowed");
        }

        // Create directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR, pharmacyId.toString());
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = pharmacyId + "_" + System.currentTimeMillis() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // Save to DB
        PharmacyImage image = new PharmacyImage();
        image.setPharmacy(pharmacy);
        image.setImageUrl("/uploads/pharmacies/" + pharmacyId + "/" + filename);
        image.setDisplayOrder(currentCount + 1);

        return imageRepository.save(image);
    }

    public List<PharmacyImage> getImages(Long pharmacyId) {
        return imageRepository.findByPharmacyPharmacyIdOrderByDisplayOrderAsc(pharmacyId);
    }

    public void deleteImage(Long imageId, String pharmacyEmail) throws IOException {
        PharmacyImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Verify ownership
        if (!image.getPharmacy().getEmail().equals(pharmacyEmail)) {
            throw new RuntimeException("Access denied");
        }

        // Delete file from filesystem
        String relativePath = image.getImageUrl().startsWith("/") ? image.getImageUrl().substring(1) : image.getImageUrl();
        Path filePath = Paths.get(relativePath);
        Files.deleteIfExists(filePath);

        // Delete from DB
        imageRepository.delete(image);
    }
}
