import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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

  formErrors: any = {};

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Image upload
  pharmacyImages: PharmacyImage[] = [];
  isUploading = false;
  uploadError = '';
  maxImages = 3;

  // Delete modal
  showDeleteModal = false;
  imageToDelete: PharmacyImage | null = null;

  constructor(
    private pharmacyService: PharmacyService,
    private toastr: ToastrService
  ) {}

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
        this.toastr.success('Photo uploaded and saved to your pharmacy profile!', 'Photo Saved');
        input.value = ''; // Reset file input
      },
      error: (err) => {
        this.uploadError = err.error?.error || 'Failed to upload image';
        this.isUploading = false;
        this.toastr.error(this.uploadError, 'Upload Failed');
        input.value = '';
      }
    });
  }

  // ─── Profile ──────────────────────────────────────────────────────────────────

  saveProfile(): void {
    if (!this.pharmacy) return;

    // Field validation
    this.formErrors = {};
    let hasError = false;

    if (!this.pharmacyForm.pharmacyName.trim()) {
      this.formErrors['pharmacyName'] = 'Pharmacy name is required';
      hasError = true;
    }
    if (!this.pharmacyForm.ownerName.trim()) {
      this.formErrors['ownerName'] = 'Owner name is required';
      hasError = true;
    }
    if (!this.pharmacyForm.phone.trim()) {
      this.formErrors['phone'] = 'Phone number is required';
      hasError = true;
    } else if (!/^\d{10}$/.test(this.pharmacyForm.phone.trim())) {
      this.formErrors['phone'] = 'Enter a valid 10-digit phone number';
      hasError = true;
    }
    if (!this.pharmacyForm.address.trim()) {
      this.formErrors['address'] = 'Address is required';
      hasError = true;
    }
    if (!this.pharmacyForm.city.trim()) {
      this.formErrors['city'] = 'City is required';
      hasError = true;
    }
    if (!this.pharmacyForm.state.trim()) {
      this.formErrors['state'] = 'State is required';
      hasError = true;
    }
    if (!this.pharmacyForm.pincode.trim()) {
      this.formErrors['pincode'] = 'Pincode is required';
      hasError = true;
    } else if (!/^\d{6}$/.test(this.pharmacyForm.pincode.trim())) {
      this.formErrors['pincode'] = 'Enter a valid 6-digit pincode';
      hasError = true;
    }

    if (hasError) {
      this.toastr.error('Please fix the highlighted errors before saving', 'Validation Error');
      return;
    }

    this.pharmacyService.updatePharmacy(this.pharmacy.pharmacyId, this.pharmacyForm).subscribe({
      next: () => {
        this.toastr.success('Your pharmacy profile has been saved successfully!', 'Profile Updated');
        this.loadPharmacyData();
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Something went wrong. Please try again.';
        this.toastr.error(msg, 'Save Failed');
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.currentPassword) {
      this.toastr.error('Please enter your current password', 'Missing Field');
      return;
    }
    if (!this.passwordForm.newPassword) {
      this.toastr.error('Please enter a new password', 'Missing Field');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.toastr.error('New password must be at least 6 characters', 'Too Short');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastr.error('New password and confirm password do not match', 'Mismatch');
      return;
    }

    this.pharmacyService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: () => {
        this.toastr.success('Your password has been changed successfully!', 'Password Updated');
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Current password is incorrect';
        this.toastr.error(msg, 'Password Change Failed');
      }
    });
  }

  // ─── Delete Image Modal ────────────────────────────────────────────────────────

  confirmDeleteImage(image: PharmacyImage): void {
    this.imageToDelete = image;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.imageToDelete = null;
  }

  deleteImageConfirmed(): void {
    if (!this.imageToDelete) return;

    this.pharmacyService.deleteImage(this.imageToDelete.imageId).subscribe({
      next: () => {
        this.pharmacyImages = this.pharmacyImages.filter(i => i.imageId !== this.imageToDelete!.imageId);
        this.toastr.success('Photo has been removed from your pharmacy profile', 'Photo Deleted');
        this.showDeleteModal = false;
        this.imageToDelete = null;
      },
      error: () => {
        this.toastr.error('Could not delete the photo. Please try again.', 'Delete Failed');
        this.showDeleteModal = false;
        this.imageToDelete = null;
      }
    });
  }
}
