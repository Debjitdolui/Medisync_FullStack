import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-support-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support-layout.component.html',
  styleUrl: './support-layout.component.scss'
})
export class SupportLayoutComponent implements OnInit {
  userName = 'Agent';
  today = '';
  showProfileMenu = false;
  sidebarOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'ti-dashboard', route: '/support/dashboard' },
    { label: 'All Tickets', icon: 'ti-ticket', route: '/support/tickets' },
    { label: 'My Tickets', icon: 'ti-user-check', route: '/support/my-tickets' },
    { label: 'Escalated', icon: 'ti-alert-triangle', route: '/support/escalated' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Agent';
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
