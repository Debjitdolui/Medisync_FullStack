import { Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pharmacy, Medicine } from '../../../../core/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-pharmacy-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pharmacy-detail.component.html',
  styleUrl: './pharmacy-detail.component.scss'
})
export class PharmacyDetailComponent implements AfterViewInit, OnDestroy {
  @Input() pharmacy!: Pharmacy;
  @Input() medicine: Medicine | null = null;
  @Input() rating: { average: number; total: number } = { average: 0, total: 0 };
  @Input() userLatitude: number | null = null;
  @Input() userLongitude: number | null = null;
  @Output() close = new EventEmitter<void>();

  mapId = 'pharmacy-map-' + Math.random().toString(36).substring(2, 9);
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 800);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const lat = this.pharmacy.latitude || 22.5726;
    const lng = this.pharmacy.longitude || 88.3639;

    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) return;

    // Force explicit height on element before initializing
    mapElement.style.height = '260px';
    mapElement.style.width = '100%';

    this.map = L.map(this.mapId, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Red pin marker
    const redIcon = L.divIcon({
      className: 'pharmacy-marker',
      html: `<div style="
        width: 30px; height: 30px;
        background: #dc2626;
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(220,38,38,0.35);
        display: flex; align-items: center; justify-content: center;
      "><div style="
        width: 10px; height: 10px;
        background: #fff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    L.marker([lat, lng], { icon: redIcon }).addTo(this.map);

    // Aggressive invalidateSize to force full tile render
    this.map.invalidateSize();
    setTimeout(() => { this.map?.invalidateSize(); }, 100);
    setTimeout(() => { this.map?.invalidateSize(); }, 300);
    setTimeout(() => { this.map?.invalidateSize(); }, 600);
    setTimeout(() => {
      this.map?.invalidateSize();
      this.map?.setView([lat, lng], 16);
    }, 1000);
  }

  getDirectionsUrl(): string {
    const lat = this.pharmacy.latitude || 22.5726;
    const lng = this.pharmacy.longitude || 88.3639;
    if (this.userLatitude && this.userLongitude) {
      return `https://www.google.com/maps/dir/?api=1&origin=${this.userLatitude},${this.userLongitude}&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  getDiscount(): number {
    if (this.medicine && this.medicine.mrp && this.medicine.mrp > this.medicine.price) {
      return Math.round(((this.medicine.mrp - this.medicine.price) / this.medicine.mrp) * 100);
    }
    return 0;
  }
}
