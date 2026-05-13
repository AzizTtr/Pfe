import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface AdminLink {
  route: string;
  labelKey: string;
  icon: string;            // SVG inner path
  feature: string;         // Feature # for the badge
}

/**
 * Wrapper pour toutes les pages /admin/* — fournit une sub-navigation
 * en pills horizontales pour accéder facilement aux 8 sections du Admin Panel.
 */
@Component({
  selector: 'aq-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslateModule],
  template: `
    <!-- Header bar -->
    <div class="glass rounded-2xl px-5 py-4 mb-6 flex flex-wrap items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800
                  border border-white/10 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             class="w-5 h-5 text-forest-300">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-lg font-bold text-white truncate">{{ 'admin.shell.title' | translate }}</h2>
        <p class="text-xs text-white/55">{{ 'admin.shell.subtitle' | translate }}</p>
      </div>
      <span class="aq-badge aq-badge-success">
        <span class="live-dot"></span>{{ 'menu.live' | translate }}
      </span>
    </div>

    <!-- Sub-navigation pills -->
    <nav class="flex flex-wrap gap-2 mb-6">
      <a *ngFor="let l of links"
         [routerLink]="l.route"
         routerLinkActive="aq-pill-active"
         class="aq-pill">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             class="w-4 h-4" [innerHTML]="l.icon"></svg>
        <span>{{ l.labelKey | translate }}</span>
        <span *ngIf="l.feature !== '0'" class="text-[10px] opacity-50 ms-1">F{{ l.feature }}</span>
      </a>
    </nav>

    <!-- Active route content -->
    <router-outlet/>
  `
})
export class AdminShellComponent {
  links: AdminLink[] = [
    { route: 'dashboard', labelKey: 'admin.dashboard.title',
      icon: '<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>',
      feature: '0' },
    { route: 'registrations', labelKey: 'admin.registrations.title',
      icon: '<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>',
      feature: '1' },
    { route: 'users',         labelKey: 'admin.users.title',
      icon: '<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a3 3 0 015.36-1.86M13 7a4 4 0 11-8 0 4 4 0 018 0zM21 13a4 4 0 11-8 0 4 4 0 018 0z"/>',
      feature: '15' },
    { route: 'categories',    labelKey: 'admin.categories.title',
      icon: '<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>',
      feature: '16' },
    { route: 'questions',     labelKey: 'admin.questions.title',
      icon: '<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      feature: '17' },
    { route: 'values',        labelKey: 'admin.values.title',
      icon: '<path d="M11 17a4 4 0 01-8 0 4 4 0 018 0zM21 17a4 4 0 11-8 0 4 4 0 018 0zM21 7a4 4 0 11-8 0 4 4 0 018 0z M11 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
      feature: '18' },
    { route: 'assignments',   labelKey: 'admin.assignments.title',
      icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M12 11l2 2 4-4M9 16l1 1 3-3"/>',
      feature: '19' },
    { route: 'audit',         labelKey: 'admin.audit.title',
      icon: '<path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>',
      feature: '20' },
    { route: 'reports',       labelKey: 'admin.reports.title',
      icon: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
      feature: '21' }
  ];
}
