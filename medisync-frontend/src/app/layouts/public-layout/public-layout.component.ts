import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicNavbarComponent } from '../../shared/components/public-navbar/public-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule, PublicNavbarComponent, FooterComponent],
  template: `
    <app-public-navbar></app-public-navbar>
    <main class="public-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .public-content {
      flex: 1;
    }
  `]
})
export class PublicLayoutComponent {}
