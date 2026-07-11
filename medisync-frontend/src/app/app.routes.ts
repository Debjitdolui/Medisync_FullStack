import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SupportLayoutComponent } from './features/support-panel/support-layout/support-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ─── AUTHENTICATED ROUTES ───────────────────────────────────────────────────

  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'customer' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/user/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'medicine-search', loadComponent: () => import('./features/user/medicine-search/medicine-search.component').then(m => m.MedicineSearchComponent) },
      { path: 'nurse-booking', loadComponent: () => import('./features/user/nurse-booking/nurse-booking.component').then(m => m.NurseBookingComponent) },
      { path: 'feedback', loadComponent: () => import('./features/user/feedback-rating/feedback-rating.component').then(m => m.FeedbackRatingComponent) },
      { path: 'support', loadComponent: () => import('./features/user/help-support/help-support.component').then(m => m.HelpSupportComponent) },
      { path: 'profile', loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  },

  {
    path: 'pharmacy',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'pharmacy' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/pharmacy/dashboard/pharmacy-dashboard.component').then(m => m.PharmacyDashboardComponent) },
      { path: 'inventory', loadComponent: () => import('./features/pharmacy/inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'reviews', loadComponent: () => import('./features/pharmacy/reviews/pharmacy-reviews.component').then(m => m.PharmacyReviewsComponent) },
      { path: 'settings', loadComponent: () => import('./features/pharmacy/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'help-support', loadComponent: () => import('./features/pharmacy/help-support/pharmacy-help-support.component').then(m => m.PharmacyHelpSupportComponent) },
    ]
  },

  {
    path: 'nurse',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'nurse' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/nurse-panel/dashboard/nurse-dashboard.component').then(m => m.NurseDashboardComponent) },
      { path: 'requests', loadComponent: () => import('./features/nurse-panel/requests/nurse-requests.component').then(m => m.NurseRequestsComponent) },
      { path: 'reviews', loadComponent: () => import('./features/nurse-panel/reviews/nurse-reviews.component').then(m => m.NurseReviewsComponent) },
      { path: 'availability', loadComponent: () => import('./features/nurse-panel/availability/availability.component').then(m => m.AvailabilityComponent) },
      { path: 'settings', loadComponent: () => import('./features/nurse-panel/settings/nurse-settings.component').then(m => m.NurseSettingsComponent) },
      { path: 'timetable', loadComponent: () => import('./features/nurse-panel/timetable/nurse-timetable.component').then(m => m.NurseTimetableComponent) },
      { path: 'calendar', loadComponent: () => import('./features/nurse-panel/calendar/nurse-calendar.component').then(m => m.NurseCalendarComponent) },
      { path: 'help-support', loadComponent: () => import('./features/nurse-panel/help-support/nurse-help-support.component').then(m => m.NurseHelpSupportComponent) },
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'pharmacies', loadComponent: () => import('./features/admin/pharmacy-approvals/pharmacy-approvals.component').then(m => m.PharmacyApprovalsComponent) },
      { path: 'nurses', loadComponent: () => import('./features/admin/nurse-approvals/nurse-approvals.component').then(m => m.NurseApprovalsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'medicines', loadComponent: () => import('./features/admin/medicine-management/medicine-management.component').then(m => m.MedicineManagementComponent) },
      { path: 'logs', loadComponent: () => import('./features/admin/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent) },
      { path: 'support-agents', loadComponent: () => import('./features/admin/support-agents/support-agents.component').then(m => m.SupportAgentsComponent) },
      { path: 'escalated-tickets', loadComponent: () => import('./features/admin/escalated-tickets/escalated-tickets.component').then(m => m.EscalatedTicketsComponent) },
    ]
  },

  {
    path: 'support',
    component: SupportLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'support_agent' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/support-panel/dashboard/support-dashboard.component').then(m => m.SupportDashboardComponent) },
      { path: 'tickets', loadComponent: () => import('./features/support-panel/tickets/all-tickets.component').then(m => m.AllTicketsComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./features/support-panel/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'my-tickets', loadComponent: () => import('./features/support-panel/tickets/all-tickets.component').then(m => m.AllTicketsComponent), data: { myOnly: true } },
      { path: 'escalated', loadComponent: () => import('./features/support-panel/tickets/all-tickets.component').then(m => m.AllTicketsComponent), data: { escalatedOnly: true } },
    ]
  },

  // ─── PUBLIC ROUTES (each with explicit path) ────────────────────────────────

  { path: 'home', component: PublicLayoutComponent, children: [
    { path: '', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) }
  ]},
  { path: 'login', component: PublicLayoutComponent, children: [
    { path: '', loadComponent: () => import('./features/public/login/login.component').then(m => m.LoginComponent) }
  ]},
  { path: 'signup', component: PublicLayoutComponent, children: [
    { path: '', loadComponent: () => import('./features/public/signup/signup.component').then(m => m.SignupComponent) }
  ]},
  { path: 'contact', component: PublicLayoutComponent, children: [
    { path: '', loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent) }
  ]},
  { path: 'forgot-password', component: PublicLayoutComponent, children: [
    { path: '', loadComponent: () => import('./features/public/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) }
  ]},

  // Home redirect & wildcard
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
