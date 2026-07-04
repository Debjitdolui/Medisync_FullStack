import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../core/models';

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
    });
  }

  saveProfile(): void {
    if (!this.pharmacy) return;

    const request: any = {
      ...this.pharmacyForm,
      email: this.pharmacy.email,
      password: ''
    };

    this.pharmacyService.updatePharmacy(this.pharmacy.pharmacyId, request).subscribe(() => {
      // Show success feedback
      this.loadPharmacyData();
    });
  }

  changePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) return;
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) return;

    // TODO: Call password change API
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
}
