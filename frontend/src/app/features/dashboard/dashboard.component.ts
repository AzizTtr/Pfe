import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  preferredLang: string;
  lastLoginAt?: string;
}

interface QuickAction {
  route: string;
  icon: string;
  titleKey: string;
  descKey: string;
  badgeKey?: string;
  badgeClass?: string;
  rolesAllowed?: string[];
}

@Component({
  selector: 'aq-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'dashboard.title' | translate"
      [subtitle]="'dashboard.subtitle' | translate">

      <!-- Profile summary card -->
      <div *ngIf="profile()" class="glass-strong rounded-2xl p-5 md:p-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-royal-800
                      flex items-center justify-center text-xl md:text-2xl font-extrabold border border-white/10
                      shadow-lg shadow-black/20">
            {{ initials() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h2 class="text-lg md:text-xl font-bold truncate">{{ profile()!.fullName }}</h2>
              <span class="aq-badge aq-badge-info">{{ shortRole() }}</span>
            </div>
            <p class="text-sm text-white/55 truncate">{{ profile()!.email }}</p>
          </div>
          <a routerLink="/profile"
             class="hidden md:inline-flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs hover:bg-white/10 transition">
            {{ 'menu.profile' | translate }}
            <svg class="w-3.5 h-3.5 icon-mirror" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Quick actions -->
      <section>
        <h3 class="text-xs uppercase tracking-wider text-white/50 mb-3 mt-2">
          {{ 'dashboard.quick_actions' | translate }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <a *ngFor="let a of visibleActions()"
             [routerLink]="a.route"
             class="card-rim group glass rounded-2xl p-4 transition-all hover:-translate-y-1 hover:bg-slate-800/40
                    flex items-start gap-3 relative">
            <div class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800
                        border border-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                   class="w-5 h-5 text-forest-300" [innerHTML]="a.icon"></svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold truncate">{{ a.titleKey | translate }}</span>
                <span *ngIf="a.badgeKey" [class]="'aq-badge ' + (a.badgeClass || 'aq-badge-info')">
                  {{ a.badgeKey | translate }}
                </span>
              </div>
              <p class="text-xs text-white/55 mt-0.5 leading-relaxed">{{ a.descKey | translate }}</p>
            </div>
          </a>
        </div>
      </section>

      <!-- Loader -->
      <div *ngIf="!profile()" class="glass rounded-2xl p-8 text-center text-white/60">
        {{ 'dashboard.loading' | translate }}
      </div>

      <!-- Help footer -->
      <div class="glass-soft rounded-2xl p-5 mt-2 flex items-start gap-3">
        <svg class="w-5 h-5 text-forest-300 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="text-sm font-medium">{{ 'dashboard.help_title' | translate }}</div>
          <p class="text-xs text-white/55 mt-1">{{ 'dashboard.help_desc' | translate }}</p>
        </div>
      </div>
    </aq-page-shell>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  profile = signal<UserProfile | null>(null);

  allActions: QuickAction[] = [
    // Common
    { route: '/profile',  titleKey: 'dashboard.act.profile.t', descKey: 'dashboard.act.profile.d',
      icon: '<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' },
    // Entity manager
    { route: '/my-requests', titleKey: 'dashboard.act.my_requests.t', descKey: 'dashboard.act.my_requests.d',
      icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>',
      rolesAllowed: ['ROLE_ENTITY_MANAGER'] },
    { route: '/my-requests/new', titleKey: 'dashboard.act.new_request.t', descKey: 'dashboard.act.new_request.d',
      icon: '<path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>', badgeKey: 'comingSoon.in_progress',
      badgeClass: 'aq-badge-warning', rolesAllowed: ['ROLE_ENTITY_MANAGER'] },
    // Evaluator
    { route: '/evaluation', titleKey: 'dashboard.act.inbox.t', descKey: 'dashboard.act.inbox.d',
      icon: '<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>',
      rolesAllowed: ['ROLE_EVALUATOR', 'ROLE_ADMIN_REVIEWER', 'ROLE_FIELD_REVIEWER'] },
    // Admin
    { route: '/admin/registrations', titleKey: 'dashboard.act.registrations.t', descKey: 'dashboard.act.registrations.d',
      icon: '<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>', rolesAllowed: ['ROLE_PLATFORM_ADMIN'] },
    { route: '/admin/users', titleKey: 'dashboard.act.users.t', descKey: 'dashboard.act.users.d',
      icon: '<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a3 3 0 015.36-1.86M13 7a4 4 0 11-8 0 4 4 0 018 0zM21 13a4 4 0 11-8 0 4 4 0 018 0z"/>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN'] },
    { route: '/admin/reports', titleKey: 'dashboard.act.reports.t', descKey: 'dashboard.act.reports.d',
      icon: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN'] }
  ];

  visibleActions = computed<QuickAction[]>(() => {
    const userRoles = this.auth.getRoles();
    return this.allActions.filter(a => {
      if (!a.rolesAllowed) return true;
      return a.rolesAllowed.some(r => userRoles.includes(r));
    });
  });

  ngOnInit(): void {
    this.api.get<UserProfile>('/users/me').subscribe(p => this.profile.set(p));
  }

  initials(): string {
    const n = this.profile()?.fullName || '';
    return n.split(' ').slice(0,2).map(s => s[0] || '').join('').toUpperCase() || '?';
  }
  shortRole(): string {
    return (this.profile()?.role || '').replace('ROLE_', '').replace(/_/g, ' ');
  }
}
