import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName = '';
  searchQuery = '';
  timeOfDay = '';

  quickActions = [
    {
      title: 'Search Medicine',
      subtitle: 'Find and compare medicines from nearby pharmacies',
      icon: 'ti-pill',
      color: '#1a73e8',
      bgColor: '#e8f0fe',
      route: '/user/medicine-search'
    },
    {
      title: 'Book a Nurse',
      subtitle: 'Verified nurses for home care & assistance',
      icon: 'ti-nurse',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      route: '/user/nurse-booking'
    },
    {
      title: 'Feedback & Rating',
      subtitle: 'Rate pharmacies and nurses you visited',
      icon: 'ti-star',
      color: '#d97706',
      bgColor: '#fffbeb',
      route: '/user/feedback'
    },
    {
      title: 'Help & Support',
      subtitle: 'FAQs, contact support, and get assistance',
      icon: 'ti-lifebuoy',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      route: '/user/support'
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'User';
    this.setTimeOfDay();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/user/medicine-search'], { queryParams: { q: this.searchQuery } });
    }
  }

  searchFor(term: string): void {
    this.searchQuery = term;
    this.onSearch();
  }

  private setTimeOfDay(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.timeOfDay = 'Morning';
    else if (hour < 17) this.timeOfDay = 'Afternoon';
    else this.timeOfDay = 'Evening';
  }
}
