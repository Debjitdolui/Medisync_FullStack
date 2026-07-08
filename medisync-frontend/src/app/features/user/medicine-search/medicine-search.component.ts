import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../core/services/search.service';
import { MedicineService } from '../../../core/services/medicine.service';
import { MasterMedicineService } from '../../../core/services/master-medicine.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { AddressService } from '../../../core/services/address.service';
import { ReviewService } from '../../../core/services/review.service';
import { PrescriptionSearchResult, UserAddress, Pharmacy } from '../../../core/models';
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

  // Results - unified (always prescription search)
  isLoading = false;
  hasSearched = false;
  searchResults: PrescriptionSearchResult[] = [];
  filteredResults: PrescriptionSearchResult[] = [];

  // Expanded pharmacy card (to show medicine details)
  expandedPharmacyId: number | null = null;

  // Filters
  distanceFilter = '';
  priceSort = '';
  allAvailableOnly = false;

  // Location
  userLocation = 'Select Location';
  userLatitude: number | null = null;
  userLongitude: number | null = null;
  showLocationDropdown = false;
  savedAddresses: UserAddress[] = [];
  isDetectingLocation = false;

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
    private masterMedicineService: MasterMedicineService,
    private pharmacyService: PharmacyService,
    private addressService: AddressService,
    private reviewService: ReviewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecentSearches();
    this.loadMedicineNames();
    this.loadSavedAddresses();

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.selectedMedicines = [params['q']];
        this.onSearch();
      }
    });
  }

  // ─── Location Logic ───────────────────────────────────────────────────────────

  private loadSavedAddresses(): void {
    this.addressService.getAddresses().subscribe(addresses => {
      this.savedAddresses = addresses;
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr && defaultAddr.latitude && defaultAddr.longitude) {
        this.userLatitude = defaultAddr.latitude;
        this.userLongitude = defaultAddr.longitude;
        this.userLocation = `${defaultAddr.addressLine}, ${defaultAddr.city}`;
      }
    });
  }

  toggleLocationDropdown(): void {
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  selectAddress(address: UserAddress): void {
    if (address.latitude && address.longitude) {
      this.userLatitude = address.latitude;
      this.userLongitude = address.longitude;
      this.userLocation = `${address.addressLine}, ${address.city}`;
    }
    this.showLocationDropdown = false;
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    this.isDetectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
        this.userLocation = `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
        this.isDetectingLocation = false;
        this.showLocationDropdown = false;
      },
      () => {
        alert('Unable to get your location. Please select a saved address.');
        this.isDetectingLocation = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private loadMedicineNames(): void {
    this.masterMedicineService.getNames().subscribe(names => {
      this.allMedicineNames = names.sort();
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
    setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 0);
  }

  hideSuggestionsDelayed(): void {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  addFromRecent(term: string): void {
    if (!this.selectedMedicines.includes(term)) {
      this.selectedMedicines.push(term);
    }
  }

  // ─── Search Logic (UNIFIED - always prescription search) ──────────────────────

  onSearch(): void {
    if (this.selectedMedicines.length === 0 && this.inputValue.trim()) {
      this.selectedMedicines.push(this.inputValue.trim());
      this.inputValue = '';
    }

    if (this.selectedMedicines.length === 0) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.expandedPharmacyId = null;
    this.saveRecentSearches();

    // Always use prescription search - even for single medicine
    this.searchService.searchPrescription({
      medicineNames: this.selectedMedicines,
      latitude: this.userLatitude ?? undefined,
      longitude: this.userLongitude ?? undefined,
      maxDistanceKm: this.distanceFilter ? +this.distanceFilter : undefined
    }).subscribe(results => {
      this.searchResults = results;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  // ─── Filters ──────────────────────────────────────────────────────────────────

  applyFilters(): void {
    let results = [...this.searchResults];

    if (this.allAvailableOnly) {
      results = results.filter(r => r.hasAllMedicines);
    }

    switch (this.priceSort) {
      case 'price-low':
        results.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'price-high':
        results.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'distance':
        results.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      default:
        // Default: all-available first, then by distance
        results.sort((a, b) => {
          if (a.hasAllMedicines !== b.hasAllMedicines) return a.hasAllMedicines ? -1 : 1;
          return a.distanceKm - b.distanceKm;
        });
    }

    this.filteredResults = results;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.distanceFilter = '';
    this.priceSort = '';
    this.allAvailableOnly = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.distanceFilter || this.priceSort || this.allAvailableOnly);
  }

  // ─── Expand/Collapse ──────────────────────────────────────────────────────────

  toggleExpand(pharmacyId: number): void {
    this.expandedPharmacyId = this.expandedPharmacyId === pharmacyId ? null : pharmacyId;
  }

  // ─── Directions ───────────────────────────────────────────────────────────────

  getDirectionsUrl(result: PrescriptionSearchResult): string {
    const destLat = result.latitude || 0;
    const destLng = result.longitude || 0;
    if (this.userLatitude && this.userLongitude && destLat && destLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${this.userLatitude},${this.userLongitude}&destination=${destLat},${destLng}`;
    }
    if (destLat && destLng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.pharmacyName)}`;
  }

  // ─── Ratings ──────────────────────────────────────────────────────────────────

  private pharmacyRatingsCache: Map<number, { average: number; total: number }> = new Map();

  getPharmacyRating(pharmacyId: number): { average: number; total: number } {
    if (!this.pharmacyRatingsCache.has(pharmacyId)) {
      this.pharmacyRatingsCache.set(pharmacyId, { average: 0, total: 0 });
      this.reviewService.getPharmacyReviews(pharmacyId, { page: 0, size: 100 }).subscribe(page => {
        const reviews = page.content;
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          this.pharmacyRatingsCache.set(pharmacyId, { average: Math.round(avg * 10) / 10, total: reviews.length });
        }
      });
    }
    return this.pharmacyRatingsCache.get(pharmacyId) || { average: 0, total: 0 };
  }

  // ─── Pharmacy Detail Modal ────────────────────────────────────────────────────

  showPharmacyDetail = false;
  selectedResult: PrescriptionSearchResult | null = null;
  selectedPharmacy: Pharmacy | null = null;

  openPharmacyDetail(result: PrescriptionSearchResult): void {
    this.selectedResult = result;
    // Fetch full pharmacy details from backend (includes ownerName, state, pincode, etc.)
    this.pharmacyService.getPharmacyById(result.pharmacyId).subscribe(pharmacy => {
      this.selectedPharmacy = pharmacy;
      this.showPharmacyDetail = true;
    });
  }

  closePharmacyDetail(): void {
    this.showPharmacyDetail = false;
    this.selectedResult = null;
    this.selectedPharmacy = null;
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

  // ─── Medicine Checklist Helpers ────────────────────────────────────────────────

  isMedicineFound(result: PrescriptionSearchResult, name: string): boolean {
    return result.medicines.some(m => m.medicineName.toLowerCase() === name.toLowerCase());
  }

  getMedicinePrice(result: PrescriptionSearchResult, name: string): number {
    const med = result.medicines.find(m => m.medicineName.toLowerCase() === name.toLowerCase());
    return med ? med.price : 0;
  }

  getMedicineBrand(result: PrescriptionSearchResult, name: string): string {
    const med = result.medicines.find(m => m.medicineName.toLowerCase() === name.toLowerCase());
    return med?.brand || '';
  }
}
