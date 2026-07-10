import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = '';
  timeOfDay = '';

  // Typewriter animation
  typewriterPhrases = [
    { text: 'find medicines from 2000+ pharmacies', highlights: [{ word: 'medicines', color: '#1a73e8' }, { word: '2000+ pharmacies', color: '#16a34a' }] },
    { text: 'book verified nurses at your doorstep', highlights: [{ word: 'verified nurses', color: '#16a34a' }, { word: 'doorstep', color: '#7c3aed' }] },
    { text: 'compare prices and save money', highlights: [{ word: 'compare prices', color: '#d97706' }, { word: 'save money', color: '#16a34a' }] },
    { text: 'get quality home care when you need it', highlights: [{ word: 'quality home care', color: '#1a73e8' }, { word: 'need it', color: '#dc2626' }] },
    { text: 'manage your health — all in one place', highlights: [{ word: 'health', color: '#16a34a' }, { word: 'one place', color: '#7c3aed' }] }
  ];
  currentPhrase = '';
  currentPhraseHtml: SafeHtml = '';
  phraseIndex = 0;
  charIndex = 0;
  isDeleting = false;
  private typewriterTimer: any;

  quickActions = [
    {
      title: 'Search Medicines',
      subtitle: 'Find and compare medicines from nearby pharmacies',
      icon: 'ti-pill',
      color: '#1a73e8',
      bgColor: '#e8f0fe',
      route: '/user/medicine-search'
    },
    {
      title: 'Book a Nurse',
      subtitle: 'Verified nurses for home care & assistance',
      icon: 'ti-nurse',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      route: '/user/nurse-booking'
    },
    {
      title: 'Feedback & Rating',
      subtitle: 'Rate pharmacies and nurses you visited',
      icon: 'ti-star',
      color: '#d97706',
      bgColor: '#fffbeb',
      route: '/user/feedback'
    },
    {
      title: 'Help & Support',
      subtitle: 'FAQs, contact support, and get assistance',
      icon: 'ti-lifebuoy',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      route: '/user/support'
    }
  ];

  constructor(private authService: AuthService, private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'User';
    this.setTimeOfDay();
    this.startTypewriter();
  }

  ngOnDestroy(): void {
    if (this.typewriterTimer) clearTimeout(this.typewriterTimer);
  }

  private startTypewriter(): void {
    this.typeNextChar();
  }

  private typeNextChar(): void {
    const phraseObj = this.typewriterPhrases[this.phraseIndex];
    const fullPhrase = phraseObj.text;

    if (!this.isDeleting) {
      this.currentPhrase = fullPhrase.substring(0, this.charIndex + 1);
      this.charIndex++;
      this.currentPhraseHtml = this.sanitizer.bypassSecurityTrustHtml(
        this.highlightPhrase(this.currentPhrase, phraseObj.highlights) + '<span class="tw-cursor">|</span>'
      );

      if (this.charIndex === fullPhrase.length) {
        this.typewriterTimer = setTimeout(() => {
          this.isDeleting = true;
          this.typeNextChar();
        }, 2000);
        return;
      }

      this.typewriterTimer = setTimeout(() => this.typeNextChar(), 50);
    } else {
      this.currentPhrase = fullPhrase.substring(0, this.charIndex - 1);
      this.charIndex--;
      this.currentPhraseHtml = this.sanitizer.bypassSecurityTrustHtml(
        this.highlightPhrase(this.currentPhrase, phraseObj.highlights) + '<span class="tw-cursor">|</span>'
      );

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.typewriterPhrases.length;
        this.typewriterTimer = setTimeout(() => this.typeNextChar(), 400);
        return;
      }

      this.typewriterTimer = setTimeout(() => this.typeNextChar(), 30);
    }
  }

  private highlightPhrase(text: string, highlights: { word: string; color: string }[]): string {
    let result = text;
    for (const h of highlights) {
      if (text.includes(h.word)) {
        result = result.replace(h.word, `<span style="color: ${h.color}; font-weight: 800;">${h.word}</span>`);
      }
    }
    return result;
  }

  private setTimeOfDay(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.timeOfDay = 'Morning';
    else if (hour < 17) this.timeOfDay = 'Afternoon';
    else this.timeOfDay = 'Evening';
  }
}
