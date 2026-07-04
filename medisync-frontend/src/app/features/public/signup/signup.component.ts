import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      selectedRole: ['user'],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]],
      // Pharmacy fields
      pharmacyName: [''],
      licenseNumber: [''],
      address: [''],
      city: [''],
      state: [''],
      pincode: [''],
      // Nurse fields
      qualification: [''],
      nurseLicense: [''],
      specialization: ['']
    }, { validators: this.passwordMatchValidator });

    // Watch role changes
    this.signupForm.get('selectedRole')!.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });
  }

  get f() { return this.signupForm.controls; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
    if (confirmPassword?.errors) {
      const { passwordMismatch, ...otherErrors } = confirmPassword.errors;
      if (Object.keys(otherErrors).length === 0) {
        confirmPassword.setErrors(null);
      } else {
        confirmPassword.setErrors(otherErrors);
      }
    }
    return null;
  }

  onRoleChange(role: string): void {
    const pharmacyFields = ['pharmacyName', 'licenseNumber', 'address', 'city', 'state', 'pincode'];
    const nurseFields = ['qualification', 'nurseLicense', 'specialization'];

    // Clear all role-specific validators
    [...pharmacyFields, ...nurseFields].forEach(field => {
      this.signupForm.get(field)!.clearValidators();
      this.signupForm.get(field)!.updateValueAndValidity();
    });

    if (role === 'pharmacy') {
      pharmacyFields.forEach(field => {
        this.signupForm.get(field)!.setValidators([Validators.required]);
        this.signupForm.get(field)!.updateValueAndValidity();
      });
    } else if (role === 'nurse') {
      nurseFields.forEach(field => {
        this.signupForm.get(field)!.setValidators([Validators.required]);
        this.signupForm.get(field)!.updateValueAndValidity();
      });
    }
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.signupForm.get('password')!.value;
    if (!password) return 'weak';

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  get passwordValue(): string {
    return this.signupForm.get('password')!.value || '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.signupForm.value;

    switch (formValue.selectedRole) {
      case 'user':
        this.authService.registerUser({
          username: formValue.fullName,
          email: formValue.email,
          password: formValue.password,
          phone: formValue.phone
        }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/user/dashboard']);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err?.error?.error || 'Registration failed';
          }
        });
        break;

      case 'pharmacy':
        this.authService.registerPharmacy({
          ownerName: formValue.fullName,
          email: formValue.email,
          password: formValue.password,
          pharmacyName: formValue.pharmacyName,
          licenseNumber: formValue.licenseNumber,
          address: formValue.address,
          city: formValue.city,
          state: formValue.state,
          pincode: formValue.pincode,
          phone: formValue.phone
        }).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = 'Pharmacy registration submitted! Awaiting admin approval.';
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err?.error?.error || 'Registration failed';
          }
        });
        break;

      case 'nurse':
        this.authService.registerNurse({
          fullName: formValue.fullName,
          email: formValue.email,
          password: formValue.password,
          phone: formValue.phone,
          qualification: formValue.qualification,
          licenseNumber: formValue.nurseLicense,
          specialization: formValue.specialization
        }).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = 'Nurse registration submitted! Awaiting admin approval.';
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err?.error?.error || 'Registration failed';
          }
        });
        break;
    }
  }
}
