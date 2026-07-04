import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserNavbarComponent } from '../../shared/components/user-navbar/user-navbar.component';
import { UserFooterComponent } from '../../shared/components/user-footer/user-footer.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterModule, UserNavbarComponent, UserFooterComponent],
  template: `
    <app-user-navbar></app-user-navbar>
    <main class="user-content">
      <router-outlet></router-outlet>
    </main>
    <app-user-footer></app-user-footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .user-content {
      flex: 1;
      background: var(--bg);
    }
  `]
})
export class UserLayoutComponent {}
