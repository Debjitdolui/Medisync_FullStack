import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy, PharmacyImage } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  pharmacy: Pharmacy | null = null;

  pharmacyForm = {
    pharmacyName: '',
    ownerName: '',
    licenseNumber: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notifications = {
    lowStock: true,
    expiry: true,
    orders: true,
    email: false
  };

  // Image upload
  pharmacyImages: PharmacyImage[] = [];
  isUploading = false;
  uploadError = '';
  maxImages = 3;

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.loadPharmacyData();
  }

  private loadPharmacyData(): void {
    this.pharmacyService.getDashboard().subscribe(dashboard => {
      this.pharmacy = dashboard.pharmacy;
      this.pharmacyForm = {
        pharmacyName: this.pharmacy.pharmacyName,
        ownerName: this.pharmacy.ownerName,
        licenseNumber: this.pharmacy.licenseNumber,
        phone: this.pharmacy.phone,
        address: this.pharmacy.address,
        city: this.pharmacy.city,
        state: this.pharmacy.state,
        pincode: this.pharmacy.pincode
      };
      this.loadImages();
    });
  }

  // ─── Image Management ─────────────────────────────────────────────────────────

  private loadImages(): void {
    if (!this.pharmacy) return;
    this.pharmacyService.getImages(this.pharmacy.pharmacyId).subscribe(images => {
      this.pharmacyImages = images;
    });
  }

  getImageUrl(image: PharmacyImage): string {
    // Image URL is relative like /uploads/pharmacies/1/filename.jpg
    // Backend serves at http://localhost:8080/uploads/...
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + image.imageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    if (!this.pharmacy) return;

    const file = input.files[0];
    this.uploadError = '';

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      this.uploadError = 'File size must be less than 2MB';
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      this.uploadError = 'Only JPG, PNG, and WebP images are allowed';
      return;
    }
    if (this.pharmacyImages.length >= this.maxImages) {
      this.uploadError = 'Maximum 3 images allowed. Delete an existing image first.';
      return;
    }

    this.isUploading = true;
    this.pharmacyService.uploadImage(this.pharmacy.pharmacyId, file).subscribe({
      next: (image) => {
        this.pharmacyImages.push(image);
        this.isUploading = false;
        input.value = ''; // Reset file input
      },
      error: (err) => {
        this.uploadError = err.error?.error || 'Failed to upload image';
        this.isUploading = false;
        input.value = '';
      }
    });
  }

  deleteImage(image: PharmacyImage): void {
    if (!confirm('Are you sure you want to delete this image?')) return;

    this.pharmacyService.deleteImage(image.imageId).subscribe(() => {
      this.pharmacyImages = this.pharmacyImages.filter(i => i.imageId !== image.imageId);
    });
  }

  // ─── Profile ──────────────────────────────────────────────────────────────────

  saveProfile(): void {
    if (!this.pharmacy) return;

    this.pharmacyService.updatePharmacy(this.pharmacy.pharmacyId, this.pharmacyForm).subscribe(() => {
      this.loadPharmacyData();
    });
  }

  changePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) return;
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) return;

    this.pharmacyService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: () => {
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: () => {
        // Handle error
      }
    });
  }
}
