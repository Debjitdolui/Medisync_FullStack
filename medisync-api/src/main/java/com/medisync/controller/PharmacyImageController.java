package com.medisync.controller;

import com.medisync.entity.PharmacyImage;
import com.medisync.service.PharmacyImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacyImageController {

    private final PharmacyImageService imageService;

    @PostMapping("/{pharmacyId}/images")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long pharmacyId,
            @RequestParam("file") MultipartFile file) {
        try {
            PharmacyImage image = imageService.uploadImage(pharmacyId, file);
            return ResponseEntity.ok(image);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{pharmacyId}/images")
    public ResponseEntity<List<PharmacyImage>> getImages(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(imageService.getImages(pharmacyId));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId, Authentication auth) {
        try {
            imageService.deleteImage(imageId, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete image"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
