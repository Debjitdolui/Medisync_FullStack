import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MasterMedicineService } from '../../../core/services/master-medicine.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { MasterMedicine, MedicineCategory } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-medicine-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './medicine-management.component.html',
  styleUrl: './medicine-management.component.scss'
})
export class MedicineManagementComponent implements OnInit {
  masterMedicines: MasterMedicine[] = [];
  filteredMedicines: MasterMedicine[] = [];
  categories: MedicineCategory[] = [];

  searchTerm = '';
  selectedCategoryFilter = '';

  // Modal
  showModal = false;
  editing: MasterMedicine | null = null;
  form = { medicineName: '', categoryId: 0 };
  formError = '';

  // Delete
  showDeleteModal = false;
  deletingMedicine: MasterMedicine | null = null;

  // Category management
  showCategoryModal = false;
  newCategoryName = '';
  categoryError = '';

  // Bulk upload
  showBulkUploadModal = false;
  bulkUploadFile: File | null = null;
  bulkUploadResult: any = null;
  bulkUploading = false;
  bulkUploadError = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get paginatedMedicines() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMedicines.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) { this.currentPage = page; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  constructor(
    private masterMedicineService: MasterMedicineService,
    private medicineService: MedicineService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.masterMedicineService.getAllAdmin().subscribe(list => {
      this.masterMedicines = list;
      this.filterMedicines();
    });
    this.medicineService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  filterMedicines(): void {
    let result = [...this.masterMedicines];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m => m.medicineName.toLowerCase().includes(term));
    }

    if (this.selectedCategoryFilter) {
      const catId = Number(this.selectedCategoryFilter);
      result = result.filter(m => m.category?.categoryId === catId);
    }

    this.filteredMedicines = result;
    this.currentPage = 1;
  }

  // ─── Add / Edit ───────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.editing = null;
    this.form = { medicineName: '', categoryId: 0 };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(med: MasterMedicine): void {
    this.editing = med;
    this.form = {
      medicineName: med.medicineName,
      categoryId: med.category?.categoryId || 0
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editing = null;
  }

  save(): void {
    if (!this.form.medicineName.trim() || !this.form.categoryId) {
      this.formError = 'Medicine name and category are required.';
      return;
    }

    if (this.editing) {
      this.masterMedicineService.update(this.editing.masterMedicineId, this.form.medicineName.trim(), this.form.categoryId).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => { this.formError = err.error?.error || 'Failed to update.'; }
      });
    } else {
      this.masterMedicineService.create(this.form.medicineName.trim(), this.form.categoryId).subscribe({
        next: () => { this.loadData(); this.closeModal(); },
        error: (err) => { this.formError = err.error?.error || 'Failed to add.'; }
      });
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  confirmDelete(med: MasterMedicine): void {
    this.deletingMedicine = med;
    this.showDeleteModal = true;
  }

  deleteConfirmed(): void {
    if (!this.deletingMedicine) return;
    this.masterMedicineService.delete(this.deletingMedicine.masterMedicineId).subscribe(() => {
      this.loadData();
      this.showDeleteModal = false;
      this.deletingMedicine = null;
    });
  }

  // ─── Category Management ──────────────────────────────────────────────────────

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.categoryError = '';

    this.http.post<MedicineCategory>(`${environment.apiUrl}/admin/categories`, {
      categoryName: this.newCategoryName.trim()
    }).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.newCategoryName = '';
      },
      error: (err) => {
        this.categoryError = err.error?.error || 'Failed to add category.';
      }
    });
  }

  deleteCategory(id: number): void {
    this.http.delete(`${environment.apiUrl}/admin/categories/${id}`).subscribe(() => {
      this.categories = this.categories.filter(c => c.categoryId !== id);
    });
  }

  // ─── Bulk Upload ──────────────────────────────────────────────────────────────

  downloadTemplate(): void {
    this.masterMedicineService.downloadTemplate();
  }

  openBulkUploadModal(): void {
    this.showBulkUploadModal = true;
    this.bulkUploadFile = null;
    this.bulkUploadResult = null;
    this.bulkUploadError = '';
    this.bulkUploading = false;
  }

  closeBulkUploadModal(): void {
    this.showBulkUploadModal = false;
    this.bulkUploadFile = null;
    this.bulkUploadResult = null;
    this.bulkUploadError = '';
  }

  onBulkFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.bulkUploadFile = input.files[0];
      this.bulkUploadError = '';
      this.bulkUploadResult = null;
    }
  }

  uploadBulkFile(): void {
    if (!this.bulkUploadFile) return;
    this.bulkUploading = true;
    this.bulkUploadError = '';

    this.masterMedicineService.bulkUpload(this.bulkUploadFile).subscribe({
      next: (result) => {
        this.bulkUploadResult = result;
        this.bulkUploading = false;
        if (result.added > 0) {
          this.loadData();
        }
      },
      error: (err) => {
        this.bulkUploadError = err.error?.error || 'Failed to upload file.';
        this.bulkUploading = false;
      }
    });
  }
}
