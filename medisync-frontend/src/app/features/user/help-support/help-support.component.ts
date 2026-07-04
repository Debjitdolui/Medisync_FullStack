import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-support.component.html',
  styleUrl: './help-support.component.scss'
})
export class HelpSupportComponent {
  categories = [
    { title: 'FAQs', subtitle: 'Common questions and answers', icon: 'ti-help-circle', color: '#16a34a' },
    { title: 'Medicines & Prescriptions', subtitle: 'Support related to medicines', icon: 'ti-pill', color: '#1a73e8' },
    { title: 'Nurse Booking', subtitle: 'Get help regarding nurse bookings', icon: 'ti-nurse', color: '#1a73e8' },
    { title: 'Account & Profile', subtitle: 'Help related to your account', icon: 'ti-user', color: '#d97706' }
  ];

  faqs = [
    { question: 'How can I search medicines?', answer: 'Go to Medicine Search from the dashboard. Enter the medicine name in the search bar and click Search. You can filter by distance and price.', open: false },
    { question: 'Can I upload prescription?', answer: 'Currently, you can manually enter medicine names from your prescription. Image upload feature will be available soon.', open: false },
    { question: 'How do I book a nurse?', answer: 'Go to Nurse Booking, select a service type, choose an available nurse, and fill in the booking details.', open: false },
    { question: 'How to cancel a booking?', answer: 'Go to your Profile > My Bookings tab. Find the booking and click Cancel if it is still in pending status.', open: false },
    { question: 'Is my data safe?', answer: 'Yes, MediSync uses encrypted storage for all sensitive data. Your personal information is protected.', open: false }
  ];

  selectedCategory = '';

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
