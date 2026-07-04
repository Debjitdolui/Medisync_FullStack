import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { ReviewService } from '../../../core/services/review.service';
import { Medicine } from '../../../core/models';

interface ActivityItem {
  type: string;
  icon: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.scss'
})
export class PharmacyDashboardComponent implements OnInit {
  pharmacyName = '';
  today = '';
  totalMedicines = 0;
  totalStock = 0;
  lowStockCount = 0;
  averageRating = '0.0';
  totalReviews = 0;
  lowStockMedicines: Medicine[] = [];
  recentActivity: ActivityItem[] = [];

  private pharmacyId = 1;

  constructor(
    private pharmacyService: PharmacyService,
    private medicineService: MedicineService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.today = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.pharmacyService.getDashboard().subscribe(dashboard => {
      this.pharmacyName = dashboard.pharmacy.pharmacyName;
      this.pharmacyId = dashboard.pharmacy.pharmacyId;

      // Load rating from reviews
      this.reviewService.getPharmacyReviews(this.pharmacyId).subscribe(page => {
        const reviews = page.content;
        this.totalReviews = page.totalElements;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          this.averageRating = (sum / reviews.length).toFixed(1);
        } else {
          this.averageRating = '0.0';
        }
      });

      this.medicineService.getMedicinesByPharmacy(this.pharmacyId).subscribe(page => {
        const medicines = page.content;
        this.totalMedicines = page.totalElements;
        this.totalStock = medicines.reduce((sum, m) => sum + m.stockQuantity, 0);

        const lowStock = medicines.filter(m => m.stockQuantity < 10);
        this.lowStockCount = lowStock.length;
        this.lowStockMedicines = lowStock.slice(0, 5);

        this.generateRecentActivity(medicines);
      });
    });
  }

  private generateRecentActivity(medicines: Medicine[]): void {
    this.recentActivity = [
      {
        type: 'add',
        icon: 'ti-plus',
        text: `Added "${medicines[0]?.medicineName || 'Medicine'}" to inventory`,
        time: '2 hours ago'
      },
      {
        type: 'stock',
        icon: 'ti-package',
        text: 'Stock updated for Amoxicillin 250mg (+50 units)',
        time: '5 hours ago'
      },
      {
        type: 'alert',
        icon: 'ti-alert-triangle',
        text: 'Low stock alert: Betadine Ointment (5 units left)',
        time: '1 day ago'
      },
      {
        type: 'add',
        icon: 'ti-plus',
        text: 'Added "Cetirizine 10mg" to inventory',
        time: '2 days ago'
      }
    ];
  }
}
