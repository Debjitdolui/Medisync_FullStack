import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationPanelComponent],
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.scss'
})
export class UserNavbarComponent implements OnInit {
  unreadCount = 0;
  showNotifications = false;
  showProfileMenu = false;
  mobileMenuOpen = false;
  userName = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'User';
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.notificationService.refreshUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.showNotifications = false;
      this.showProfileMenu = false;
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  toggleMobile(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobile(): void {
    this.mobileMenuOpen = false;
  }

  closeDropdowns(): void {
    this.showNotifications = false;
    this.showProfileMenu = false;
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
