import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
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
  activeTab: 'profile' | 'addresses' | 'bookings' | 'payments' | 'security' = 'profile';
  user: User | null = null;
  addresses: UserAddress[] = [];
  bookings: NurseRequest[] = [];
  isEditing = false;
  isLoading = true;

  // Booking pagination
  bookingPage = 1;
  bookingPageSize = 5;

  // Payment history
  payments: any[] = [];
  loadingPayments = false;

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
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Handle fragment navigation (e.g., /user/profile#bookings)
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'bookings' || fragment === 'payments' || fragment === 'addresses' || fragment === 'security') {
        this.activeTab = fragment;
      }
    });

    this.loadProfile();
    this.loadAddresses();
    this.loadBookings();
  }

  get paginatedBookings(): NurseRequest[] {
    const start = (this.bookingPage - 1) * this.bookingPageSize;
    return this.bookings.slice(start, start + this.bookingPageSize);
  }

  get totalBookingPages(): number {
    return Math.ceil(this.bookings.length / this.bookingPageSize);
  }

  nextBookingPage(): void {
    if (this.bookingPage < this.totalBookingPages) this.bookingPage++;
  }

  prevBookingPage(): void {
    if (this.bookingPage > 1) this.bookingPage--;
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

  loadPayments(): void {
    this.loadingPayments = true;
    this.payments = [];
    // Collect payment info from all bookings that have been paid
    this.bookings.forEach(booking => {
      this.http.get<any>(`${environment.apiUrl}/nurse-requests/${booking.requestId}/payment`).subscribe({
        next: (result) => {
          if (result.paid) {
            this.payments.push({
              ...result.payment,
              nurseName: booking.nurse.fullName,
              serviceName: booking.service.serviceName,
              requestDate: booking.requestDate
            });
          }
          this.loadingPayments = false;
        },
        error: () => { this.loadingPayments = false; }
      });
    });
    if (this.bookings.length === 0) this.loadingPayments = false;
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
        this.toastr.error(err?.error?.error || 'Failed to initiate payment. Please try again.', 'Payment Error');
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
        this.toastr.success('Payment completed successfully!', 'Payment');
      },
      error: (err) => {
        this.toastr.error(err?.error?.error || 'Payment verification failed. Please contact support.', 'Payment Error');
      }
    });
  }

  saveProfile(): void {
    this.userService.updateProfile({ username: this.editName, phone: this.editPhone }).subscribe(user => {
      this.user = user;
      this.isEditing = false;
      this.toastr.success('Profile updated successfully!', 'Profile');
    });
  }

  deleteAddress(id: number): void {
    this.addressService.deleteAddress(id).subscribe(() => {
      this.addresses = this.addresses.filter(a => a.addressId !== id);
      this.toastr.success('Address deleted successfully!', 'Address');
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
      this.toastr.success('Address added successfully!', 'Address');
    });
  }

  deactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate your account?')) {
      this.userService.deactivateAccount().subscribe(() => {
        this.toastr.info('Your account has been deactivated.', 'Account');
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
