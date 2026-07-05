import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NurseApiService } from '../../../core/services/nurse.service';
import { ReviewService } from '../../../core/services/review.service';
import { Nurse } from '../../../core/models';

@Component({
  selector: 'app-nurse-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-settings.component.html',
  styleUrl: './nurse-settings.component.scss'
})
export class NurseSettingsComponent implements OnInit {
  nurse: Nurse | null = null;
  nurseInitial = '';
  averageRating = '0.0';
  totalReviews = 0;
  isSaving = false;

  editForm = {
    fullName: '',
    phone: '',
    qualification: '',
    specialization: ''
  };

  passwordForm = {
    current: '',
    newPass: '',
    confirm: ''
  };

  private nurseId = 1;

  constructor(
    private nurseService: NurseApiService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadNurseData();
  }

  private loadNurseData(): void {
    this.nurseService.getMyProfile().subscribe(nurse => {
      this.nurse = nurse;
      this.nurseId = nurse.nurseId;
      this.nurseInitial = nurse.fullName.charAt(0).toUpperCase();
      this.editForm = {
        fullName: nurse.fullName,
        phone: nurse.phone,
        qualification: nurse.qualification,
        specialization: nurse.specialization
      };

      this.reviewService.getNurseReviews(this.nurseId).subscribe(page => {
        const reviews = page.content;
        this.totalReviews = page.totalElements;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          this.averageRating = (sum / reviews.length).toFixed(1);
        } else {
          this.averageRating = '0.0';
        }
      });
    });
  }

  saveProfile(): void {
    this.isSaving = true;
    this.nurseService.updateProfile(this.editForm).subscribe({
      next: (nurse) => {
        this.nurse = nurse;
        this.nurseInitial = nurse.fullName.charAt(0).toUpperCase();
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.newPass !== this.passwordForm.confirm) return;
    this.nurseService.changePassword(this.passwordForm.current, this.passwordForm.newPass).subscribe({
      next: () => {
        this.passwordForm = { current: '', newPass: '', confirm: '' };
      },
      error: () => {
        // Handle error
      }
    });
  }
}
