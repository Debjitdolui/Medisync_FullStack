import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { AddressService } from '../../../core/services/address.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserAddress, NurseRequest } from '../../../core/models';
import { environment } from '../../../../environments/environment';

declare var Razorpay: any;

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
  newAddress = { addressLine: '', city: '', state: '', pincode: '', isDefault: false };

  // Payment status tracking
  paymentStatus: Map<number, any> = new Map();

  constructor(
    private userService: UserService,
    private addressService: AddressService,
    private nurseRequestService: NurseRequestService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
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
    this.nurseRequestService.getMyRequests().subscribe(b => {
      this.bookings = b;
      this.checkPaymentStatuses();
    });
  }

  private checkPaymentStatuses(): void {
    this.bookings.forEach(booking => {
      if (booking.requestStatus === 'accepted' || booking.requestStatus === 'completed') {
        this.http.get<any>(`${environment.apiUrl}/nurse-requests/${booking.requestId}/payment`).subscribe({
          next: (payment) => {
            this.paymentStatus.set(booking.requestId, payment);
          },
          error: () => {
            this.paymentStatus.set(booking.requestId, { paid: false });
          }
        });
      }
    });
  }

  payNow(booking: NurseRequest): void {
    this.http.post<any>(`${environment.apiUrl}/nurse-requests/${booking.requestId}/pay`, {}).subscribe({
      next: (response) => {
        if (response.dummyMode) {
          // Dummy mode: skip Razorpay popup, directly verify with dummy IDs
          const confirmed = confirm(
            `Complete payment of ₹${response.amount / 100} for ${response.serviceName} with ${response.nurseName}?\n\n(Demo payment - no real money charged)`
          );
          if (confirmed) {
            const dummyPaymentResponse = {
              razorpay_order_id: response.orderId,
              razorpay_payment_id: 'pay_dummy_' + Date.now(),
              razorpay_signature: 'dummy_signature'
            };
            this.verifyPayment(booking.requestId, dummyPaymentResponse);
          }
          return;
        }

        // Real Razorpay checkout
        const options = {
          key: response.keyId,
          amount: response.amount,
          currency: response.currency,
          name: 'MediSync',
          description: `Payment for ${response.serviceName}`,
          order_id: response.orderId,
          handler: (paymentResponse: any) => {
            this.verifyPayment(booking.requestId, paymentResponse);
          },
          prefill: {
            email: this.user?.email || '',
            contact: this.user?.phone || ''
          },
          theme: { color: '#4f46e5' }
        };
        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        alert('Failed to initiate payment. Please try again.');
        console.error('Failed to create payment order', err);
      }
    });
  }

  private verifyPayment(requestId: number, paymentResponse: any): void {
    this.http.post<any>(`${environment.apiUrl}/nurse-requests/${requestId}/pay/verify`, {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    }).subscribe({
      next: (result) => {
        this.paymentStatus.set(requestId, { paid: true, transactionId: paymentResponse.razorpay_payment_id });
      },
      error: (err) => {
        console.error('Payment verification failed', err);
      }
    });
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

  setDefaultAddress(addr: UserAddress): void {
    this.addressService.updateAddress(addr.addressId, {
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: true
    }).subscribe(() => {
      this.addresses.forEach(a => a.isDefault = false);
      addr.isDefault = true;
    });
  }

  addAddress(): void {
    this.addressService.addAddress({
      addressLine: this.newAddress.addressLine,
      city: this.newAddress.city,
      state: this.newAddress.state,
      pincode: this.newAddress.pincode,
      isDefault: this.newAddress.isDefault
    }).subscribe(addr => {
      if (addr.isDefault) {
        this.addresses.forEach(a => a.isDefault = false);
      }
      this.addresses.push(addr);
      this.showAddressForm = false;
      this.newAddress = { addressLine: '', city: '', state: '', pincode: '', isDefault: false };
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
