import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NurseApiService } from '../../../core/services/nurse.service';
import { ReviewService } from '../../../core/services/review.service';
import { NurseReview } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-nurse-reviews',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './nurse-reviews.component.html',
  styleUrl: './nurse-reviews.component.scss'
})
export class NurseReviewsComponent implements OnInit {
  reviews: NurseReview[] = [];
  averageRating = 0;
  totalReviews = 0;
  ratingBreakdown: number[] = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 star
  currentPage = 1;
  pageSize = 10;
  private nurseId = 0;

  constructor(
    private nurseService: NurseApiService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.nurseService.getMyProfile().subscribe(nurse => {
      this.nurseId = nurse.nurseId;
      this.loadReviews();
    });
  }

  loadReviews(): void {
    this.reviewService.getNurseReviews(this.nurseId, { page: 0, size: 100 }).subscribe(page => {
      this.reviews = page.content;
      this.totalReviews = page.totalElements;
      if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;

        // Calculate breakdown
        this.ratingBreakdown = [0, 0, 0, 0, 0];
        this.reviews.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) {
            this.ratingBreakdown[r.rating - 1]++;
          }
        });
      }
    });
  }

  getBreakdownPercent(starIndex: number): number {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.ratingBreakdown[starIndex] / this.totalReviews) * 100);
  }

  get paginatedReviews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reviews.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) { this.currentPage = page; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
