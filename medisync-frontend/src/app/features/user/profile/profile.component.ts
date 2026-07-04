import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AddressService } from '../../../core/services/address.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserAddress, NurseRequest } from '../../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  activeTab: 'profile' | 'addresses' | 'bookings' | 'security' = 'profile';
  user: User | null = null;
  addresses: UserAddress[] = [];
  bookings: NurseRequest[] = [];
  isEditing = false;
  isLoading = true;

  // Edit form
  editName = '';
  editPhone = '';

  // Security
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Address form
  showAddressForm = false;
  newAddress = { addressLine: '', city: '', state: '', pincode: '' };

  constructor(
    private userService: UserService,
    private addressService: AddressService,
    private nurseRequestService: NurseRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddresses();
    this.loadBookings();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe(user => {
      this.user = user;
      this.editName = user.username;
      this.editPhone = user.phone || '';
      this.isLoading = false;
    });
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe(a => this.addresses = a);
  }

  loadBookings(): void {
    this.nurseRequestService.getMyRequests().subscribe(b => this.bookings = b);
  }

  saveProfile(): void {
    this.userService.updateProfile({ username: this.editName, phone: this.editPhone }).subscribe(user => {
      this.user = user;
      this.isEditing = false;
    });
  }

  deleteAddress(id: number): void {
    this.addressService.deleteAddress(id).subscribe(() => {
      this.addresses = this.addresses.filter(a => a.addressId !== id);
    });
  }

  addAddress(): void {
    this.addressService.addAddress({
      addressLine: this.newAddress.addressLine,
      city: this.newAddress.city,
      state: this.newAddress.state,
      pincode: this.newAddress.pincode
    }).subscribe(addr => {
      this.addresses.push(addr);
      this.showAddressForm = false;
      this.newAddress = { addressLine: '', city: '', state: '', pincode: '' };
    });
  }

  deactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate your account?')) {
      this.userService.deactivateAccount().subscribe(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getDefaultAddress(): string {
    const def = this.addresses.find(a => a.isDefault);
    return def ? `${def.addressLine}, ${def.city}, ${def.state} - ${def.pincode}` : 'No address set';
  }
}
