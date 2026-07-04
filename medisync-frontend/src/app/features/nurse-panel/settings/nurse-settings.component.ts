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
    this.nurseService.getNurseById(this.nurseId).subscribe(nurse => {
      this.nurse = nurse;
      this.nurseInitial = nurse.fullName.charAt(0).toUpperCase();
      this.editForm = {
        fullName: nurse.fullName,
        phone: nurse.phone,
        qualification: nurse.qualification,
        specialization: nurse.specialization
      };

      const rating = this.reviewService.getNurseRating(this.nurseId);
      this.averageRating = rating.average.toFixed(1);
      this.totalReviews = rating.total;
    });
  }

  saveProfile(): void {
    this.isSaving = true;
    // TODO: Call API to update nurse profile
    setTimeout(() => {
      if (this.nurse) {
        this.nurse.fullName = this.editForm.fullName;
        this.nurse.phone = this.editForm.phone;
        this.nurse.qualification = this.editForm.qualification;
        this.nurse.specialization = this.editForm.specialization;
        this.nurseInitial = this.nurse.fullName.charAt(0).toUpperCase();
      }
      this.isSaving = false;
    }, 500);
  }

  changePassword(): void {
    if (this.passwordForm.newPass !== this.passwordForm.confirm) return;
    // TODO: Call password change API
    this.passwordForm = { current: '', newPass: '', confirm: '' };
  }
}
