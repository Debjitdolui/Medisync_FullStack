import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MedicineService } from '../../../core/services/medicine.service';
import { MasterMedicineService } from '../../../core/services/master-medicine.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine, MasterMedicine, MedicineRequest } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  currentPage = 1;
  pageSize = 10;

  get paginatedMedicines() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMedicines.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  masterMedicines: MasterMedicine[] = [];
  pharmacyId = 1;

  // Filters
  searchTerm = '';
  selectedCategory = '';
  stockFilter = '';

  // Medicine Modal
  showMedicineModal = false;
  editingMedicine: Medicine | null = null;
  medicineForm = {
    pharmacyId: 1,
    masterMedicineId: 0,
    brand: '',
    price: 0,
    stockQuantity: 0,
    description: ''
  };

  // Autocomplete for master medicine
  masterSearchTerm = '';
  filteredMasterMedicines: MasterMedicine[] = [];
  showMasterSuggestions = false;
  selectedMasterMedicine: MasterMedicine | null = null;

  // Form validation errors
  formErrors: { masterMedicine?: string; price?: string; stockQuantity?: string } = {};

  // Delete Modal
  showDeleteModal = false;
  deletingMedicine: Medicine | null = null;
  deleteError = '';

  // Bulk Upload
  showBulkUploadModal = false;
  bulkUploadFile: File | null = null;
  bulkUploadResult: any = null;
  bulkUploading = false;
  bulkUploadError = '';

  constructor(
    private medicineService: MedicineService,
    private masterMedicineService: MasterMedicineService,
    private pharmacyService: PharmacyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.pharmacyService.getDashboard().subscribe(dashboard => {
      this.pharmacyId = dashboard.pharmacy.pharmacyId;
      this.medicineForm.pharmacyId = this.pharmacyId;

      this.medicineService.getMedicinesByPharmacy(this.pharmacyId).subscribe(page => {
        this.medicines = page.content;
        this.filteredMedicines = [...page.content];
      });
    });

    this.masterMedicineService.getAll().subscribe(list => {
      this.masterMedicines = list;
    });
  }

  filterMedicines(): void {
    let result = [...this.medicines];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        m.medicineName.toLowerCase().includes(term) ||
        (m.brand && m.brand.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory && this.selectedCategory !== '') {
      const catId = Number(this.selectedCategory);
      if (!isNaN(catId) && catId > 0) {
        result = result.filter(m => m.category?.categoryId === catId);
      }
    }

    if (this.stockFilter) {
      switch (this.stockFilter) {
        case 'low':
          result = result.filter(m => m.stockQuantity > 0 && m.stockQuantity < 10);
          break;
        case 'out':
          result = result.filter(m => m.stockQuantity === 0);
          break;
        case 'normal':
          result = result.filter(m => m.stockQuantity >= 10);
          break;
      }
    }

    this.filteredMedicines = result;
    this.currentPage = 1;
  }

  // ─── Master Medicine Autocomplete ─────────────────────────────────────────────

  onMasterSearch(): void {
    const term = this.masterSearchTerm.trim().toLowerCase();
    if (term.length > 0) {
      this.filteredMasterMedicines = this.masterMedicines
        .filter(m => m.medicineName.toLowerCase().includes(term))
        .slice(0, 8);
      this.showMasterSuggestions = true;
    } else {
      this.filteredMasterMedicines = [];
      this.showMasterSuggestions = false;
    }
  }

  selectMasterMedicine(master: MasterMedicine): void {
    this.selectedMasterMedicine = master;
    this.masterSearchTerm = master.medicineName;
    this.medicineForm.masterMedicineId = master.masterMedicineId;
    this.showMasterSuggestions = false;
  }

  hideMasterSuggestionsDelayed(): void {
    setTimeout(() => this.showMasterSuggestions = false, 200);
  }

  // ─── Add Medicine ─────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.editingMedicine = null;
    this.selectedMasterMedicine = null;
    this.masterSearchTerm = '';
    this.medicineForm = {
      pharmacyId: this.pharmacyId,
      masterMedicineId: 0,
      brand: '',
      price: 0,
      stockQuantity: 0,
      description: ''
    };
    this.showMedicineModal = true;
  }

  // Edit Medicine
  openEditModal(med: Medicine): void {
    this.editingMedicine = med;
    this.selectedMasterMedicine = med.masterMedicine || null;
    this.masterSearchTerm = med.medicineName;
    this.medicineForm = {
      pharmacyId: this.pharmacyId,
      masterMedicineId: med.masterMedicine?.masterMedicineId || 0,
      brand: med.brand || '',
      price: med.price,
      stockQuantity: med.stockQuantity,
      description: med.description || ''
    };
    this.showMedicineModal = true;
  }

  closeMedicineModal(): void {
    this.showMedicineModal = false;
    this.editingMedicine = null;
    this.formErrors = {};
  }

  clearError(field: string): void {
    delete (this.formErrors as any)[field];
  }

  saveMedicine(): void {
    this.formErrors = {};
    let hasError = false;

    if (!this.medicineForm.masterMedicineId) {
      this.formErrors.masterMedicine = 'Please select a medicine from the list.';
      hasError = true;
    }

    if (!this.medicineForm.price || this.medicineForm.price <= 0) {
      this.formErrors.price = 'Price must be greater than 0.';
      hasError = true;
    } else if (this.medicineForm.price < 0) {
      this.formErrors.price = 'Price cannot be negative.';
      hasError = true;
    }

    if (this.medicineForm.stockQuantity < 0) {
      this.formErrors.stockQuantity = 'Stock quantity cannot be negative.';
      hasError = true;
    }

    if (hasError) return;

    const request: MedicineRequest = {
      pharmacyId: this.medicineForm.pharmacyId,
      masterMedicineId: this.medicineForm.masterMedicineId,
      brand: this.medicineForm.brand,
      price: this.medicineForm.price,
      stockQuantity: this.medicineForm.stockQuantity,
      description: this.medicineForm.description
    };

    if (this.editingMedicine) {
      this.medicineService.updateMedicine(this.editingMedicine.medicineId, request).subscribe({
        next: () => {
          this.toastr.success('Medicine updated successfully', 'Updated');
          this.loadData();
          this.closeMedicineModal();
        },
        error: () => {
          this.toastr.error('Failed to update medicine', 'Error');
        }
      });
    } else {
      this.medicineService.addMedicine(request).subscribe({
        next: () => {
          this.toastr.success('Medicine added successfully', 'Added');
          this.loadData();
          this.closeMedicineModal();
        },
        error: () => {
          this.toastr.error('Failed to add medicine', 'Error');
        }
      });
    }
  }

  // Delete
  confirmDelete(med: Medicine): void {
    this.deletingMedicine = med;
    this.showDeleteModal = true;
  }

  deleteConfirmed(): void {
    if (!this.deletingMedicine) return;

    this.medicineService.deleteMedicine(this.deletingMedicine.medicineId).subscribe({
      next: () => {
        this.toastr.success('Medicine deleted successfully', 'Deleted');
        this.loadData();
        this.showDeleteModal = false;
        this.deletingMedicine = null;
      },
      error: () => {
        this.toastr.error('Failed to delete medicine. Please try again.', 'Error');
        this.showDeleteModal = false;
        this.deletingMedicine = null;
      }
    });
  }

  // Get unique categories from loaded medicines
  get categories(): { categoryId: number; categoryName: string }[] {
    const map = new Map<number, string>();
    this.medicines.forEach(m => {
      if (m.category) {
        map.set(m.category.categoryId, m.category.categoryName);
      }
    });
    return Array.from(map.entries()).map(([categoryId, categoryName]) => ({ categoryId, categoryName }));
  }

  // ─── Bulk Upload ──────────────────────────────────────────────────────────────

  downloadTemplate(): void {
    this.medicineService.downloadTemplate();
    this.toastr.info('Template download started', 'Download');
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

    this.medicineService.bulkUpload(this.bulkUploadFile).subscribe({
      next: (result) => {
        this.bulkUploadResult = result;
        this.bulkUploading = false;
        if (result.added > 0) {
          this.toastr.success(`${result.added} medicine(s) uploaded successfully`, 'Bulk Upload');
          this.loadData();
        } else {
          this.toastr.info('No new medicines were added', 'Bulk Upload');
        }
      },
      error: (err) => {
        this.bulkUploadError = err.error?.error || 'Failed to upload file.';
        this.bulkUploading = false;
        this.toastr.error(this.bulkUploadError, 'Upload Failed');
      }
    });
  }
}
