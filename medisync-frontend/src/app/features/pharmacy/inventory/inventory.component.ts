import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicineService } from '../../../core/services/medicine.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Medicine, MedicineCategory, MedicineRequest } from '../../../core/models';
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
  categories: MedicineCategory[] = [];
  pharmacyId = 1;

  // Filters
  searchTerm = '';
  selectedCategory = '';
  stockFilter = '';

  // Medicine Modal
  showMedicineModal = false;
  editingMedicine: Medicine | null = null;
  medicineForm: MedicineRequest = {
    pharmacyId: 1,
    categoryId: 0,
    medicineName: '',
    manufacturer: '',
    price: 0,
    stockQuantity: 0,
    expiryDate: '',
    description: ''
  };

  // Stock Modal
  showStockModal = false;
  stockMedicine: Medicine | null = null;
  stockQuantity = 0;
  stockAction: 'add' | 'remove' = 'add';

  // Delete Modal
  showDeleteModal = false;
  deleteMedicine: Medicine | null = null;

  constructor(
    private medicineService: MedicineService,
    private pharmacyService: PharmacyService
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

    this.medicineService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  filterMedicines(): void {
    let result = [...this.medicines];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        m.medicineName.toLowerCase().includes(term) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory) {
      const catId = Number(this.selectedCategory);
      result = result.filter(m => m.category.categoryId === catId);
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

  isExpiringSoon(expiryDate: string): boolean {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return new Date(expiryDate) <= thirtyDays;
  }

  // Add Medicine
  openAddModal(): void {
    this.editingMedicine = null;
    this.medicineForm = {
      pharmacyId: this.pharmacyId,
      categoryId: 0,
      medicineName: '',
      manufacturer: '',
      price: 0,
      stockQuantity: 0,
      expiryDate: '',
      description: ''
    };
    this.showMedicineModal = true;
  }

  // Edit Medicine
  openEditModal(med: Medicine): void {
    this.editingMedicine = med;
    this.medicineForm = {
      pharmacyId: this.pharmacyId,
      categoryId: med.category.categoryId,
      medicineName: med.medicineName,
      manufacturer: med.manufacturer || '',
      price: med.price,
      stockQuantity: med.stockQuantity,
      expiryDate: med.expiryDate,
      description: med.description || ''
    };
    this.showMedicineModal = true;
  }

  closeMedicineModal(): void {
    this.showMedicineModal = false;
    this.editingMedicine = null;
  }

  saveMedicine(): void {
    if (!this.medicineForm.medicineName || !this.medicineForm.categoryId || !this.medicineForm.price) {
      return;
    }

    if (this.editingMedicine) {
      this.medicineService.updateMedicine(this.editingMedicine.medicineId, this.medicineForm).subscribe(() => {
        this.loadData();
        this.closeMedicineModal();
      });
    } else {
      this.medicineService.addMedicine(this.medicineForm).subscribe(() => {
        this.loadData();
        this.closeMedicineModal();
      });
    }
  }

  // Stock Update
  openStockModal(med: Medicine): void {
    this.stockMedicine = med;
    this.stockQuantity = 0;
    this.stockAction = 'add';
    this.showStockModal = true;
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.stockMedicine = null;
  }

  updateStock(): void {
    if (!this.stockMedicine || this.stockQuantity <= 0) return;

    this.medicineService.updateStock(this.stockMedicine.medicineId, {
      quantity: this.stockQuantity,
      action: this.stockAction
    }).subscribe(() => {
      this.loadData();
      this.closeStockModal();
    });
  }

  // Delete
  confirmDelete(med: Medicine): void {
    this.deleteMedicine = med;
    this.showDeleteModal = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteMedicine) return;

    this.medicineService.deleteMedicine(this.deleteMedicine.medicineId).subscribe(() => {
      this.loadData();
      this.showDeleteModal = false;
      this.deleteMedicine = null;
    });
  }
}
