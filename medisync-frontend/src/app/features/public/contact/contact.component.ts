import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  fullName = '';
  phone = '';
  subject = '';
  message = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (!this.fullName || !this.phone || !this.subject || !this.message) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Mock submission (no backend API for contact yet)
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Message sent successfully! We will get back to you soon.';
      this.fullName = '';
      this.phone = '';
      this.subject = '';
      this.message = '';
    }, 800);
  }
}
