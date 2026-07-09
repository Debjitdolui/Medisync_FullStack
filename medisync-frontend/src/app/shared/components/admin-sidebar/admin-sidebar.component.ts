import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  @Input() role: 'admin' | 'pharmacy' | 'nurse' = 'admin';
  @Input() userName = 'Admin';
  @Input() isOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  get navItems(): NavItem[] {
    switch (this.role) {
      case 'admin':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/admin/dashboard' },
          { label: 'Pharmacy Management', icon: 'ti-building-hospital', route: '/admin/pharmacies' },
          { label: 'Nurse Management', icon: 'ti-nurse', route: '/admin/nurses' },
          { label: 'User Management', icon: 'ti-users', route: '/admin/users' },
          { label: 'Reports', icon: 'ti-report-analytics', route: '/admin/reports' },
          { label: 'Activity Logs', icon: 'ti-list-details', route: '/admin/logs' },
        ];
      case 'pharmacy':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/pharmacy/dashboard' },
          { label: 'Inventory', icon: 'ti-packages', route: '/pharmacy/inventory' },
          { label: 'Settings', icon: 'ti-settings', route: '/pharmacy/settings' },
        ];
      case 'nurse':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/nurse/dashboard' },
          { label: 'My Requests', icon: 'ti-clipboard-list', route: '/nurse/requests' },
          { label: 'Timetable', icon: 'ti-calendar-time', route: '/nurse/timetable' },
          { label: 'Availability', icon: 'ti-clock', route: '/nurse/availability' },
        ];
      default:
        return [];
    }
  }

  get roleLabel(): string {
    switch (this.role) {
      case 'admin': return 'Admin Panel';
      case 'pharmacy': return 'Pharmacy Panel';
      case 'nurse': return 'Nurse Panel';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
