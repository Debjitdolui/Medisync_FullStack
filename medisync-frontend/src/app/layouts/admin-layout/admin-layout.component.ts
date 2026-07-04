import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">
            <i class="ti ti-heartbeat"></i>
          </div>
          <div>
            <span class="logo-name">MediSync</span>
            <span class="logo-tag">{{ roleLabel }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <i class="ti {{item.icon}}"></i>
            <span>{{item.label}}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-row">
            <div class="avatar">{{userName.charAt(0).toUpperCase()}}</div>
            <div>
              <div class="u-name">{{userName}}</div>
              <div class="u-role">{{roleLabel}}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="ti ti-logout"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-area">
        <header class="topbar">
          <span class="topbar-date">{{today}}</span>
          <div class="profile-area">
            <div class="topbar-user" (click)="showProfileMenu = !showProfileMenu">
              <i class="ti ti-user-circle"></i>
              <span>{{userName}}</span>
              <i class="ti ti-chevron-down chevron"></i>
            </div>
            <div class="profile-dropdown" *ngIf="showProfileMenu">
              <a class="dropdown-item" [routerLink]="getSettingsRoute()" (click)="showProfileMenu = false">
                <i class="ti ti-settings"></i> Settings
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" (click)="logout()">
                <i class="ti ti-logout"></i> Logout
              </button>
            </div>
          </div>
        </header>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      width: 258px;
      background: #ffffff;
      border-right: 1px solid #e8eaf0;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 22px 20px 18px;
      border-bottom: 1px solid #e8eaf0;
    }

    .logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
    }

    .logo-name {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      display: block;
    }

    .logo-tag {
      font-size: 10px;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-top: 2px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px 14px;
      border-radius: 10px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .nav-item i { font-size: 19px; }

    .nav-item:hover {
      background: #f5f6fa;
      color: #0f172a;
    }

    .nav-item.active {
      background: #e8f0fe;
      color: #1a73e8;
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 14px;
      border-top: 1px solid #e8eaf0;
    }

    .user-row {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 10px;
      background: #f5f6fa;
    }

    .avatar {
      width: 34px;
      height: 34px;
      background: #e8f0fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #1a73e8;
    }

    .u-name { font-size: 13px; color: #0f172a; font-weight: 600; }
    .u-role { font-size: 11px; color: #94a3b8; }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      margin-top: 8px;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      background: none;
      border: none;
      width: 100%;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    /* Main Area */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      background: #ffffff;
      border-bottom: 1px solid #e8eaf0;
      padding: 0 32px;
      height: 62px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .topbar-date {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f6fa;
      border: 1px solid #e8eaf0;
      border-radius: 10px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      cursor: pointer;
      transition: all 0.2s;
    }

    .topbar-user:hover {
      border-color: #1a73e8;
      background: #e8f0fe;
    }

    .topbar-user i {
      font-size: 18px;
      color: #1a73e8;
    }

    .topbar-user .chevron {
      font-size: 14px;
      color: #94a3b8;
    }

    .profile-area {
      position: relative;
    }

    .profile-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #ffffff;
      border: 1px solid #e8eaf0;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(15,23,42,0.12);
      width: 180px;
      padding: 6px;
      z-index: 200;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #0f172a;
      text-decoration: none;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      font-family: inherit;
      transition: background 0.15s;
    }

    .dropdown-item:hover {
      background: #f5f6fa;
    }

    .dropdown-item i {
      font-size: 16px;
      color: #64748b;
    }

    .dropdown-item.danger {
      color: #dc2626;
    }

    .dropdown-item.danger:hover {
      background: #fef2f2;
    }

    .dropdown-item.danger i {
      color: #dc2626;
    }

    .dropdown-divider {
      height: 1px;
      background: #e8eaf0;
      margin: 4px 0;
    }

    .content-area {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      background: #f5f6fa;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .content-area { padding: 16px; }
      .topbar { padding: 0 16px; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  role: 'admin' | 'pharmacy' | 'nurse' = 'admin';
  userName = 'User';
  today = '';
  navItems: {label: string; icon: string; route: string}[] = [];
  showProfileMenu = false;

  constructor(private authService: AuthService, private router: Router) {}

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
