import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationPanelComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  role: 'admin' | 'pharmacy' | 'nurse' = 'admin';
  userName = 'User';
  today = '';
  navItems: {label: string; icon: string; route: string}[] = [];
  showProfileMenu = false;
  showNotifications = false;
  unreadCount = 0;
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedRole = this.authService.getRole();
    if (storedRole === 'pharmacy' || storedRole === 'nurse' || storedRole === 'admin') {
      this.role = storedRole;
    }
    this.userName = this.authService.getUserName() || 'User';
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    this.navItems = this.getNavItems();

    // Load notification count for nurse and pharmacy (not admin)
    if (this.role !== 'admin') {
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
      this.notificationService.refreshUnreadCount();
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

  getNavItems() {
    switch (this.role) {
      case 'admin':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/admin/dashboard' },
          { label: 'Pharmacies', icon: 'ti-building-hospital', route: '/admin/pharmacies' },
          { label: 'Nurses', icon: 'ti-nurse', route: '/admin/nurses' },
          { label: 'Users', icon: 'ti-users', route: '/admin/users' },
          { label: 'Reports', icon: 'ti-report-analytics', route: '/admin/reports' },
          { label: 'Activity Logs', icon: 'ti-list-details', route: '/admin/logs' },
        ];
      case 'pharmacy':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/pharmacy/dashboard' },
          { label: 'Inventory', icon: 'ti-packages', route: '/pharmacy/inventory' },
          { label: 'Reviews', icon: 'ti-star', route: '/pharmacy/reviews' },
          { label: 'Settings', icon: 'ti-settings', route: '/pharmacy/settings' },
        ];
      case 'nurse':
        return [
          { label: 'Dashboard', icon: 'ti-dashboard', route: '/nurse/dashboard' },
          { label: 'My Requests', icon: 'ti-clipboard-list', route: '/nurse/requests' },
          { label: 'Reviews', icon: 'ti-star', route: '/nurse/reviews' },
          { label: 'Availability', icon: 'ti-clock', route: '/nurse/availability' },
          { label: 'My Profile', icon: 'ti-user', route: '/nurse/settings' },
        ];
      default:
        return [];
    }
  }

  getSettingsRoute(): string {
    switch (this.role) {
      case 'pharmacy': return '/pharmacy/settings';
      case 'nurse': return '/nurse/settings';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
