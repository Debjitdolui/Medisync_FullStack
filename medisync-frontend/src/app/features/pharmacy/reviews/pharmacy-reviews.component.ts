import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../core/services/review.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { PharmacyReview } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-pharmacy-reviews',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './pharmacy-reviews.component.html',
  styleUrl: './pharmacy-reviews.component.scss'
})
export class PharmacyReviewsComponent implements OnInit {
  reviews: PharmacyReview[] = [];
  averageRating = '0.0';
  totalReviews = 0;
  ratingBars: { stars: number; count: number; percent: number }[] = [];

  currentPage = 1;
  pageSize = 10;

  get paginatedReviews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reviews.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  private pharmacyId = 1;

  constructor(
    private reviewService: ReviewService,
    private pharmacyService: PharmacyService
  ) {}

  ngOnInit(): void {
    this.pharmacyService.getDashboard().subscribe(dashboard => {
      this.pharmacyId = dashboard.pharmacy.pharmacyId;

      // Load reviews
      this.reviewService.getPharmacyReviews(this.pharmacyId).subscribe(page => {
        this.reviews = page.content;
        this.totalReviews = page.totalElements;

        // Compute average rating from reviews
        if (this.reviews.length > 0) {
          const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
          this.averageRating = (sum / this.reviews.length).toFixed(1);
        } else {
          this.averageRating = '0.0';
        }

        this.calculateBreakdown(this.reviews);
      });
    });
  }

  private calculateBreakdown(reviews: PharmacyReview[]): void {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });

    const total = reviews.length || 1;
    this.ratingBars = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: counts[stars - 1],
      percent: (counts[stars - 1] / total) * 100
    }));
  }
}
