import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../core/services/search.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { Medicine, Pharmacy, PrescriptionSearchResult } from '../../../core/models';
import { PharmacyDetailComponent } from './pharmacy-detail/pharmacy-detail.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-medicine-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PharmacyDetailComponent, PaginationComponent],
  templateUrl: './medicine-search.component.html',
  styleUrl: './medicine-search.component.scss'
})
export class MedicineSearchComponent implements OnInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  // Tag input
  selectedMedicines: string[] = [];
  inputValue = '';
  showSuggestions = false;
  filteredSuggestions: string[] = [];

  // All available medicine names for autocomplete
  allMedicineNames: string[] = [];

  // Results
  isLoading = false;
  hasSearched = false;
  isPrescriptionSearch = false;
  singleResults: Medicine[] = [];
  filteredResults: Medicine[] = [];
  prescriptionResults: PrescriptionSearchResult[] = [];

  // Filters
  distanceFilter = '';
  categoryFilter = '';
  priceMin = '';
  priceMax = '';
  sortBy = 'recommended';
  inStockOnly = true;

  // Location
  userLocation = 'Kolkata, WB';

  // Recent searches
  recentSearches: string[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get paginatedResults() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredResults.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  constructor(
    private searchService: SearchService,
    private medicineService: MedicineService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecentSearches();
    this.loadMedicineNames();

    // Check query param from dashboard search
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.selectedMedicines = [params['q']];
        this.onSearch();
      }
    });
  }

  private loadMedicineNames(): void {
    // Load all unique medicine names for autocomplete
    this.medicineService.getMedicinesByPharmacy(1).subscribe(page => {
      const names = new Set<string>();
      // Add known medicines for suggestion
      names.add('Paracetamol 650mg');
      names.add('Paracetamol 500mg');
      names.add('Amoxicillin 250mg');
      names.add('Amoxicillin 500mg');
      names.add('Pantoprazole 40mg');
      names.add('Cetirizine 10mg');
      names.add('Azithromycin 500mg');
      names.add('Metformin 500mg');
      names.add('Omeprazole 20mg');
      names.add('Ibuprofen 400mg');
      names.add('Dolo 650mg');
      names.add('Betadine Ointment');
      names.add('Crocin Advance');
      names.add('Vitamin D3 60K');
      page.content.forEach(m => names.add(m.medicineName));
      this.allMedicineNames = Array.from(names).sort();
    });
  }

  // ─── Tag Input Logic ──────────────────────────────────────────────────────────

  onInputChange(): void {
    const val = this.inputValue.trim().toLowerCase();
    if (val.length > 0) {
      this.filteredSuggestions = this.allMedicineNames
        .filter(name =>
          name.toLowerCase().includes(val) &&
          !this.selectedMedicines.includes(name)
        )
        .slice(0, 6);
      this.showSuggestions = true;
    } else {
      this.filteredSuggestions = [];
      this.showSuggestions = false;
    }
  }

  selectSuggestion(name: string): void {
    if (!this.selectedMedicines.includes(name)) {
      this.selectedMedicines.push(name);
    }
    this.inputValue = '';
    this.filteredSuggestions = [];
    this.showSuggestions = false;
    this.focusInput();
  }

  onEnter(event: Event): void {
    event.preventDefault();
    if (this.filteredSuggestions.length > 0) {
      this.selectSuggestion(this.filteredSuggestions[0]);
    } else if (this.inputValue.trim()) {
      // Add custom entry if no suggestion matched
      const val = this.inputValue.trim();
      if (!this.selectedMedicines.includes(val)) {
        this.selectedMedicines.push(val);
      }
      this.inputValue = '';
      this.filteredSuggestions = [];
    }
  }

  onBackspace(): void {
    if (this.inputValue === '' && this.selectedMedicines.length > 0) {
      this.selectedMedicines.pop();
    }
  }

  removeTag(index: number): void {
    this.selectedMedicines.splice(index, 1);
  }

  focusInput(): void {
    setTimeout(() => {
      this.searchInputRef?.nativeElement?.focus();
    }, 0);
  }

  hideSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  addFromRecent(term: string): void {
    if (!this.selectedMedicines.includes(term)) {
      this.selectedMedicines.push(term);
    }
  }

  // ─── Search Logic ─────────────────────────────────────────────────────────────

  onSearch(): void {
    if (this.selectedMedicines.length === 0 && this.inputValue.trim()) {
      // Add the typed value as a tag first
      this.selectedMedicines.push(this.inputValue.trim());
      this.inputValue = '';
    }

    if (this.selectedMedicines.length === 0) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.saveRecentSearches();

    if (this.selectedMedicines.length === 1) {
      // Single medicine search
      this.isPrescriptionSearch = false;
      this.searchService.searchMedicinesByName(this.selectedMedicines[0]).subscribe(page => {
        this.singleResults = page.content;
        this.applyFilters();
        this.isLoading = false;
      });
    } else {
      // Multiple medicines - prescription search
      this.isPrescriptionSearch = true;
      this.searchService.searchPrescription({
        medicineNames: this.selectedMedicines,
        latitude: 22.5726,
        longitude: 88.3639,
        maxDistanceKm: this.distanceFilter ? +this.distanceFilter : undefined
      }).subscribe(results => {
        this.prescriptionResults = results;
        this.isLoading = false;
      });
    }
  }

  // ─── Filters ──────────────────────────────────────────────────────────────────

  applyFilters(): void {
    let results = [...this.singleResults];

    // Category filter
    if (this.categoryFilter) {
      results = results.filter(m => m.category.categoryName === this.categoryFilter);
    }

    // In stock only
    if (this.inStockOnly) {
      results = results.filter(m => m.stockQuantity > 0);
    }

    // Price filter
    if (this.priceMin) {
      results = results.filter(m => m.price >= +this.priceMin);
    }
    if (this.priceMax) {
      results = results.filter(m => m.price <= +this.priceMax);
    }

    // Sort
    switch (this.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => {
          const rA = this.getPharmacyRating(a.pharmacy.pharmacyId).average;
          const rB = this.getPharmacyRating(b.pharmacy.pharmacyId).average;
          return rB - rA;
        });
        break;
    }

    this.filteredResults = results;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.distanceFilter = '';
    this.categoryFilter = '';
    this.priceMin = '';
    this.priceMax = '';
    this.sortBy = 'recommended';
    this.inStockOnly = true;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.distanceFilter || this.categoryFilter || this.priceMin || this.priceMax || this.sortBy !== 'recommended' || !this.inStockOnly);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  getDiscount(medicine: Medicine): number {
    if (medicine.mrp && medicine.mrp > medicine.price) {
      return Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100);
    }
    return 0;
  }

  getPharmacyRating(pharmacyId: number): { average: number; total: number } {
    return { average: 0, total: 0 };
  }

  detectLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { this.userLocation = 'Kolkata, WB (Detected)'; },
        () => { this.userLocation = 'Kolkata, WB'; }
      );
    }
  }

  // Pharmacy Detail Modal
  showPharmacyDetail = false;
  selectedPharmacy: Pharmacy | null = null;
  selectedMedicine: Medicine | null = null;
  selectedPharmacyRating: { average: number; total: number } = { average: 0, total: 0 };

  // ─── Pharmacy Detail ────────────────────────────────────────────────────────

  openPharmacyDetail(medicine: Medicine): void {
    this.selectedPharmacy = medicine.pharmacy;
    this.selectedMedicine = medicine;
    this.selectedPharmacyRating = this.getPharmacyRating(medicine.pharmacy.pharmacyId);
    this.showPharmacyDetail = true;
  }

  closePharmacyDetail(): void {
    this.showPharmacyDetail = false;
    this.selectedPharmacy = null;
    this.selectedMedicine = null;
  }

  // ─── LocalStorage ─────────────────────────────────────────────────────────────

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recentMedicineSearches');
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  private saveRecentSearches(): void {
    const terms = this.selectedMedicines;
    const existing: string[] = this.recentSearches;
    const updated = [...terms.filter(t => !existing.includes(t)), ...existing].slice(0, 8);
    this.recentSearches = updated;
    localStorage.setItem('recentMedicineSearches', JSON.stringify(updated));
  }
}
