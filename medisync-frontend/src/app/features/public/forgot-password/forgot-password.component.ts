import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  step: 1 | 2 | 3 = 1;
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  otpMessage = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  sendOtp(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.otpMessage = res.message;
        this.step = 2;
        this.toastr.success('OTP sent to your email!', 'OTP Sent');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'Failed to send OTP. Check your email.';
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }

  resetPassword(): void {
    this.errorMessage = '';
    if (!this.otp || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 3;
        this.toastr.success('Password reset successfully! You can now log in.', 'Success');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'Invalid OTP or reset failed.';
        this.toastr.error(this.errorMessage, 'Reset Failed');
      }
    });
  }
}
