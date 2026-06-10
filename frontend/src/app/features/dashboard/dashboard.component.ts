import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  organization?: string;
  jobTitle?: string;
  avatarColor?: string;
  avatarUrl?: string;
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

interface KpiDto {
  key: string;
  label: string;
  value: number;
  suffix?: string;
}

interface BucketDto {
  key: string;
  label: string;
  value: number;
}

interface ReportsDashboardDto {
  kpis: KpiDto[];
  registrationStatuses: BucketDto[];
  requestStatuses: BucketDto[];
  userRoles: BucketDto[];
  categoryResources: Array<{
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    questionCount: number;
    requiredDocumentCount: number;
    active: boolean;
  }>;
}

interface RequestSummary {
  id: number;
  requestNumber: string;
  status: string;
  entityName: string;
  categoryCount: number;
  answerCount: number;
  attachmentCount: number;
  submittedAt?: string;
  createdAt: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'aq-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell [title]="homeTitle()" [subtitle]="homeSubtitle()">
      <div *ngIf="profile()" class="grid grid-cols-1 xl:grid-cols-[1.45fr_.85fr] gap-5">
        <section class="dashboard-hero relative overflow-hidden p-5 md:p-7">
          <div class="absolute inset-0 pointer-events-none opacity-70"
               style="background: radial-gradient(circle at 12% 10%, rgba(16,185,129,.22), transparent 34%), radial-gradient(circle at 85% 18%, rgba(59,130,246,.2), transparent 36%), linear-gradient(135deg, rgba(15,23,42,.55), rgba(2,6,23,.88));"></div>
          <div class="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] items-center">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full border border-forest-400/25 bg-forest-400/10 px-3 py-1 text-xs font-semibold text-forest-200">
                <span class="h-2 w-2 rounded-full bg-forest-300 shadow-[0_0_14px_rgba(52,211,153,.9)]"></span>
                {{ roleBadgeKey() | translate }}
              </div>
              <h2 class="mt-4 max-w-2xl break-words text-2xl md:text-4xl font-black leading-tight text-white">
                {{ greetingKey() | translate }} {{ displayName() }}
              </h2>
              <p class="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
                {{ heroCopyKey() | translate }}
              </p>
              <div class="mt-5 flex flex-wrap gap-2">
                <a *ngFor="let action of primaryActions()"
                   [routerLink]="action.route"
                   class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1]">
                  <span class="text-forest-300" [innerHTML]="action.icon"></span>
                  {{ action.titleKey | translate }}
                </a>
              </div>
            </div>

            <div class="dashboard-profile-card min-w-0 p-4">
              <div class="flex items-center gap-3">
                <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-forest-500 to-royal-700 shadow-lg shadow-black/20">
                  <img *ngIf="profile()!.avatarUrl; else initialsAvatar"
                       [src]="profile()!.avatarUrl"
                       alt=""
                       class="h-full w-full object-cover">
                  <ng-template #initialsAvatar>
                    <div class="flex h-full w-full items-center justify-center text-2xl font-black">
                      {{ initials() }}
                    </div>
                  </ng-template>
                </div>
                <div class="min-w-0">
                  <div class="truncate text-base font-bold">{{ profile()!.fullName || displayName() }}</div>
                  <div class="truncate text-xs text-white/50">{{ profile()!.email }}</div>
                  <div class="mt-2 max-w-full truncate rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] text-white/65">
                    {{ shortRole() }}
                  </div>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="dashboard-mini-card p-3">
                  <div class="text-[10px] uppercase tracking-wider text-white/40">{{ 'dashboard.common.organization' | translate }}</div>
                  <div class="mt-1 truncate text-sm font-semibold">{{ profile()!.organization || ('dashboard.common.not_set' | translate) }}</div>
                </div>
                <div class="dashboard-mini-card p-3">
                  <div class="text-[10px] uppercase tracking-wider text-white/40">{{ 'dashboard.common.profile' | translate }}</div>
                  <a routerLink="/profile" class="mt-1 inline-flex text-sm font-semibold text-forest-300 hover:text-forest-200">
                    {{ 'dashboard.common.customize' | translate }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside class="dashboard-panel p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold">{{ 'dashboard.common.live_updates' | translate }}</h3>
              <p class="mt-1 text-xs text-white/45">{{ 'dashboard.common.live_updates_desc' | translate }}</p>
            </div>
            <span class="rounded-full border border-forest-400/25 bg-forest-400/10 px-2 py-1 text-[10px] font-bold text-forest-200">
              {{ unreadCount() }}
            </span>
          </div>
          <div class="space-y-3">
            <a *ngFor="let n of notifications().slice(0, 4)"
               [routerLink]="n.linkUrl || '/dashboard'"
               class="dashboard-list-item block p-3">
              <div class="flex items-center justify-between gap-3">
                <span class="line-clamp-1 text-sm font-semibold">{{ n.title }}</span>
                <span *ngIf="!n.read" class="h-2 w-2 rounded-full bg-forest-300"></span>
              </div>
              <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{{ n.message }}</p>
            </a>
            <div *ngIf="notifications().length === 0" class="dashboard-empty p-5 text-center text-sm text-white/45">
              {{ 'notifications.empty' | translate }}
            </div>
          </div>
        </aside>
      </div>

      <ng-container *ngIf="isAdmin()">
        <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div *ngFor="let card of adminKpis()" class="dashboard-kpi p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-white/45">{{ card.label | translate }}</div>
                <div class="mt-2 text-3xl font-black gradient-text">{{ card.value }}</div>
              </div>
              <div [ngClass]="card.tone" class="rounded-xl border p-2">
                <span [innerHTML]="card.icon"></span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 xl:grid-cols-[1fr_.9fr] gap-5">
          <div class="dashboard-panel p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-base font-bold">{{ 'dashboard.admin_home.workflow' | translate }}</h3>
              <a routerLink="/admin/registrations" class="text-xs font-semibold text-forest-300 hover:text-forest-200">
                {{ 'admin.dashboard.view_all' | translate }}
              </a>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div *ngFor="let s of registrationStatusCards()"
                   class="dashboard-tile p-4">
                <div class="text-xs text-white/50">{{ s.label | translate }}</div>
                <div class="mt-2 text-2xl font-black">{{ s.value }}</div>
                <div class="mt-3 h-2 rounded-full bg-white/10">
                  <div class="h-2 rounded-full" [ngClass]="s.bar" [style.width.%]="statusPercent(s.value, registrationTotal())"></div>
                </div>
              </div>
            </div>
            <div class="mt-5 grid gap-3 md:grid-cols-3">
              <a *ngFor="let item of adminFeatureCards()"
                 [routerLink]="item.route"
                 class="dashboard-tile dashboard-link-tile p-4">
                <div class="mb-3 inline-flex rounded-xl border border-white/10 bg-slate-950/40 p-2 text-forest-300" [innerHTML]="item.icon"></div>
                <div class="text-sm font-bold">{{ item.title | translate }}</div>
                <p class="mt-1 text-xs leading-relaxed text-white/50">{{ item.desc | translate }}</p>
              </a>
            </div>
          </div>

          <div class="dashboard-panel p-5">
            <h3 class="text-base font-bold">{{ 'dashboard.admin_home.catalog_health' | translate }}</h3>
            <p class="mt-1 text-xs text-white/45">{{ 'dashboard.admin_home.catalog_health_desc' | translate }}</p>
            <div class="mt-5 space-y-3">
              <div *ngFor="let category of topCatalogResources()"
                   class="dashboard-list-item p-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold">{{ categoryName(category) }}</div>
                    <div class="mt-1 text-xs text-white/45">{{ category.code }}</div>
                  </div>
                  <span class="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs">
                    {{ category.questionCount }} {{ 'admin.categories.questions_count' | translate }}
                  </span>
                </div>
              </div>
              <div *ngIf="topCatalogResources().length === 0" class="dashboard-empty p-6 text-center text-sm text-white/45">
                {{ 'admin.reports.no_live_rows' | translate }}
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="isEntity()">
        <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div *ngFor="let card of entityKpis()" class="dashboard-kpi p-4">
            <div class="text-[10px] uppercase tracking-wider text-white/45">{{ card.label | translate }}</div>
            <div class="mt-2 text-3xl font-black gradient-text">{{ card.value }}</div>
            <p class="mt-1 text-xs text-white/45">{{ card.desc | translate }}</p>
          </div>
        </section>

        <section class="grid grid-cols-1 xl:grid-cols-[1.05fr_.95fr] gap-5">
          <div class="dashboard-panel p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-base font-bold">{{ 'dashboard.entity_home.recent_requests' | translate }}</h3>
              <a routerLink="/my-requests" class="text-xs font-semibold text-forest-300 hover:text-forest-200">
                {{ 'admin.dashboard.view_all' | translate }}
              </a>
            </div>
            <div class="space-y-3">
              <a *ngFor="let request of recentEntityRequests()"
                 [routerLink]="['/my-requests', request.id]"
                 class="dashboard-list-item block p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="font-bold text-forest-200">{{ request.requestNumber }}</div>
                    <div class="mt-1 text-xs text-white/45">{{ request.categoryCount }} {{ 'entity.requests.categories_count' | translate }} · {{ request.answerCount }} {{ 'entity.requests.answers_count' | translate }}</div>
                  </div>
                  <span [ngClass]="badgeClass(request.status)"
                        class="rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
                    {{ statusLabel(request.status) }}
                  </span>
                </div>
              </a>
              <div *ngIf="recentEntityRequests().length === 0" class="dashboard-empty p-8 text-center">
                <div class="text-sm font-semibold">{{ 'dashboard.entity_home.empty_title' | translate }}</div>
                <p class="mt-1 text-xs text-white/45">{{ 'dashboard.entity_home.empty_desc' | translate }}</p>
                <a routerLink="/my-requests/new" class="mt-4 inline-flex rounded-xl bg-forest-600 px-4 py-2 text-sm font-bold hover:bg-forest-500">
                  {{ 'entity.requests.new' | translate }}
                </a>
              </div>
            </div>
          </div>

          <div class="dashboard-panel p-5">
            <h3 class="text-base font-bold">{{ 'dashboard.entity_home.process' | translate }}</h3>
            <div class="mt-5 space-y-4">
              <div *ngFor="let step of entitySteps(); let last = last" class="relative flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full border border-forest-400/30 bg-forest-400/10 text-sm font-black text-forest-200">
                    {{ step.number }}
                  </div>
                  <div *ngIf="!last" class="mt-2 h-10 w-px bg-white/10"></div>
                </div>
                <div class="pb-3">
                  <div class="text-sm font-bold">{{ step.title | translate }}</div>
                  <p class="mt-1 text-xs leading-relaxed text-white/50">{{ step.desc | translate }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="isReviewerOnly()">
        <section class="grid grid-cols-1 xl:grid-cols-[1fr_.75fr] gap-5">
          <div class="dashboard-panel p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-base font-bold">{{ 'dashboard.reviewer_home.queue' | translate }}</h3>
              <a routerLink="/evaluation" class="text-xs font-semibold text-forest-300 hover:text-forest-200">
                {{ 'common.open' | translate }}
              </a>
            </div>
            <div class="space-y-3">
              <a *ngFor="let request of reviewerInbox().slice(0, 6)"
                 [routerLink]="['/evaluation', request.id]"
                 class="dashboard-list-item block p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="truncate font-bold">{{ request.requestNumber }}</div>
                    <div class="mt-1 truncate text-xs text-white/45">{{ request.entityName }}</div>
                  </div>
                  <span [ngClass]="badgeClass(request.status)"
                        class="rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
                    {{ statusLabel(request.status) }}
                  </span>
                </div>
              </a>
              <div *ngIf="reviewerInbox().length === 0" class="dashboard-empty p-8 text-center text-sm text-white/45">
                {{ 'evaluation.inbox.empty' | translate }}
              </div>
            </div>
          </div>
          <div class="dashboard-panel p-5">
            <h3 class="text-base font-bold">{{ 'dashboard.reviewer_home.focus' | translate }}</h3>
            <div class="mt-4 grid gap-3">
              <div *ngFor="let item of reviewerFocusCards()" class="dashboard-tile p-4">
                <div class="text-sm font-bold">{{ item.title | translate }}</div>
                <p class="mt-1 text-xs leading-relaxed text-white/50">{{ item.desc | translate }}</p>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <section>
        <h3 class="mb-3 mt-2 text-xs uppercase tracking-wider text-white/50">
          {{ 'dashboard.quick_actions' | translate }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <a *ngFor="let a of visibleActions()"
             [routerLink]="a.route"
             class="dashboard-action card-rim group p-4 flex items-start gap-3 relative">
            <div class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800 border border-white/10 flex items-center justify-center">
              <span class="w-5 h-5 text-forest-300" [innerHTML]="a.icon"></span>
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

      <div *ngIf="!profile()" class="glass rounded-2xl p-8 text-center text-white/60">
        {{ 'dashboard.loading' | translate }}
      </div>
    </aq-page-shell>
  `,
  styles: [`
    :host {
      --dash-border: rgba(255,255,255,.085);
      --dash-border-strong: rgba(255,255,255,.115);
      --dash-surface: rgba(15,23,42,.48);
      --dash-surface-soft: rgba(255,255,255,.032);
    }

    .dashboard-hero,
    .dashboard-panel,
    .dashboard-kpi,
    .dashboard-tile,
    .dashboard-list-item,
    .dashboard-action,
    .dashboard-profile-card,
    .dashboard-mini-card,
    .dashboard-empty {
      border: 1px solid var(--dash-border);
      box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 18px 42px -34px rgba(0,0,0,.85);
    }

    .dashboard-hero {
      border-radius: 1.125rem;
      background:
        linear-gradient(135deg, rgba(15,23,42,.74), rgba(6,11,26,.68)),
        rgba(15,23,42,.58);
    }

    .dashboard-panel {
      border-radius: 1.125rem;
      background: linear-gradient(180deg, rgba(15,23,42,.58), rgba(6,11,26,.48));
    }

    .dashboard-profile-card,
    .dashboard-mini-card,
    .dashboard-kpi,
    .dashboard-tile,
    .dashboard-list-item,
    .dashboard-action {
      border-radius: 1rem;
      background: linear-gradient(180deg, rgba(255,255,255,.052), rgba(255,255,255,.026));
    }

    .dashboard-kpi {
      min-height: 112px;
    }

    .dashboard-list-item,
    .dashboard-link-tile,
    .dashboard-action {
      transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
    }

    .dashboard-list-item:hover,
    .dashboard-link-tile:hover,
    .dashboard-action:hover {
      transform: translateY(-1px);
      border-color: rgba(16,185,129,.24);
      background: linear-gradient(180deg, rgba(255,255,255,.074), rgba(255,255,255,.036));
      box-shadow: 0 1px 0 rgba(255,255,255,.045) inset, 0 18px 34px -30px rgba(16,185,129,.45);
    }

    .dashboard-empty {
      border-style: dashed;
      border-radius: 1rem;
      background: rgba(255,255,255,.018);
    }

    .dashboard-action {
      min-height: 94px;
      overflow: hidden;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private t = inject(TranslateService);

  profile = signal<UserProfile | null>(null);
  adminReport = signal<ReportsDashboardDto | null>(null);
  registrationCounts = signal<Record<string, number>>({});
  entityRequests = signal<RequestSummary[]>([]);
  reviewerInbox = signal<RequestSummary[]>([]);
  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal(0);

  allActions: QuickAction[] = [
    {
      route: '/profile',
      titleKey: 'dashboard.act.profile.t',
      descKey: 'dashboard.act.profile.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
    },
    {
      route: '/my-requests',
      titleKey: 'dashboard.act.my_requests.t',
      descKey: 'dashboard.act.my_requests.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a3 3 0 0 0 6 0"/></svg>',
      rolesAllowed: ['ROLE_ENTITY_MANAGER']
    },
    {
      route: '/my-requests/new',
      titleKey: 'dashboard.act.new_request.t',
      descKey: 'dashboard.act.new_request.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
      rolesAllowed: ['ROLE_ENTITY_MANAGER']
    },
    {
      route: '/evaluation',
      titleKey: 'dashboard.act.inbox.t',
      descKey: 'dashboard.act.inbox.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>',
      rolesAllowed: ['ROLE_EVALUATOR', 'ROLE_ADMIN_REVIEWER', 'ROLE_FIELD_REVIEWER']
    },
    {
      route: '/admin/dashboard',
      titleKey: 'dashboard.act.admin_dashboard.t',
      descKey: 'dashboard.act.admin_dashboard.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19V5"/><path d="M8 17V9"/><path d="M12 17V7"/><path d="M16 17v-5"/><path d="M20 17V4"/></svg>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN']
    },
    {
      route: '/admin/registrations',
      titleKey: 'dashboard.act.registrations.t',
      descKey: 'dashboard.act.registrations.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 11V7a4 4 0 0 0-8 0v4"/><path d="M5 9h14l1 12H4L5 9Z"/></svg>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN']
    },
    {
      route: '/admin/users',
      titleKey: 'dashboard.act.users.t',
      descKey: 'dashboard.act.users.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN']
    },
    {
      route: '/admin/reports',
      titleKey: 'dashboard.act.reports.t',
      descKey: 'dashboard.act.reports.d',
      icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19V5"/><path d="M8 17v-6"/><path d="M13 17V7"/><path d="M18 17v-3"/><path d="M3 19h18"/></svg>',
      rolesAllowed: ['ROLE_PLATFORM_ADMIN']
    }
  ];

  visibleActions = computed<QuickAction[]>(() => {
    const userRoles = this.auth.getRoles();
    return this.allActions.filter(action => !action.rolesAllowed || action.rolesAllowed.some(role => userRoles.includes(role)));
  });

  ngOnInit(): void {
    this.api.get<UserProfile>('/users/me').subscribe({
      next: profile => {
        this.profile.set(profile);
        this.loadRoleData();
      },
      error: () => {
        const role = this.auth.getRoles().find(r => r.startsWith('ROLE_')) || '';
        const username = this.auth.getUsername();
        this.profile.set({
          id: 0,
          email: username,
          fullName: username || 'User',
          role,
          preferredLang: this.t.currentLang || 'en'
        });
        this.loadRoleData();
      }
    });
  }

  loadRoleData(): void {
    this.api.get<{ unread: number; items: NotificationItem[] }>('/notifications').subscribe({
      next: data => {
        this.unreadCount.set(data.unread || 0);
        this.notifications.set(data.items || []);
      },
      error: () => {
        this.unreadCount.set(0);
        this.notifications.set([]);
      }
    });

    if (this.isAdmin()) {
      this.api.get<ReportsDashboardDto>('/admin/reports/dashboard').subscribe({
        next: data => this.adminReport.set(data),
        error: () => this.adminReport.set(null)
      });
      this.api.get<Record<string, number>>('/admin/registrations/counts').subscribe({
        next: counts => this.registrationCounts.set(counts || {}),
        error: () => this.registrationCounts.set({})
      });
    }

    if (this.isEntity()) {
      this.api.get<RequestSummary[]>('/requests/mine').subscribe({
        next: rows => this.entityRequests.set(rows || []),
        error: () => this.entityRequests.set([])
      });
    }

    if (this.isReviewer()) {
      this.api.get<RequestSummary[]>('/evaluation/inbox').subscribe({
        next: rows => this.reviewerInbox.set(rows || []),
        error: () => this.reviewerInbox.set([])
      });
    }
  }

  isAdmin(): boolean {
    return this.auth.hasRole('ROLE_PLATFORM_ADMIN');
  }

  isEntity(): boolean {
    return this.auth.hasRole('ROLE_ENTITY_MANAGER');
  }

  isReviewer(): boolean {
    return this.auth.hasRole('ROLE_EVALUATOR') || this.auth.hasRole('ROLE_ADMIN_REVIEWER') || this.auth.hasRole('ROLE_FIELD_REVIEWER');
  }

  isReviewerOnly(): boolean {
    return this.isReviewer() && !this.isAdmin() && !this.isEntity();
  }

  homeTitle(): string {
    if (this.isAdmin()) return this.t.instant('dashboard.admin_home.title');
    if (this.isEntity()) return this.t.instant('dashboard.entity_home.title');
    if (this.isReviewer()) return this.t.instant('dashboard.reviewer_home.title');
    return this.t.instant('dashboard.title');
  }

  homeSubtitle(): string {
    if (this.isAdmin()) return this.t.instant('dashboard.admin_home.subtitle');
    if (this.isEntity()) return this.t.instant('dashboard.entity_home.subtitle');
    if (this.isReviewer()) return this.t.instant('dashboard.reviewer_home.subtitle');
    return this.t.instant('dashboard.subtitle');
  }

  greetingKey(): string {
    return this.isAdmin() ? 'dashboard.admin_home.greeting' : this.isEntity() ? 'dashboard.entity_home.greeting' : 'dashboard.reviewer_home.greeting';
  }

  heroCopyKey(): string {
    return this.isAdmin() ? 'dashboard.admin_home.hero' : this.isEntity() ? 'dashboard.entity_home.hero' : 'dashboard.reviewer_home.hero';
  }

  roleBadgeKey(): string {
    return this.isAdmin() ? 'dashboard.admin_home.badge' : this.isEntity() ? 'dashboard.entity_home.badge' : 'dashboard.reviewer_home.badge';
  }

  displayName(): string {
    const name = this.profile()?.fullName || this.auth.getUsername() || '';
    if (name.includes('@')) return name.split('@')[0];
    return name.split(' ')[0] || name;
  }

  initials(): string {
    const name = this.profile()?.fullName || '';
    return name.split(' ').slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || '?';
  }

  shortRole(): string {
    const rawRole = (this.profile()?.role || this.auth.getRoles()[0] || '').replace('ROLE_', '');
    const roleKey = rawRole.replaceAll(' ', '_');
    const translated = this.t.instant(`roles.${roleKey}`);
    return translated === `roles.${roleKey}` ? roleKey.replace(/_/g, ' ') : translated;
  }

  primaryActions(): QuickAction[] {
    if (this.isAdmin()) {
      return this.allActions.filter(action => ['/admin/dashboard', '/admin/reports', '/admin/registrations'].includes(action.route));
    }
    if (this.isEntity()) {
      return this.allActions.filter(action => ['/my-requests/new', '/my-requests', '/profile'].includes(action.route));
    }
    return this.allActions.filter(action => ['/evaluation', '/profile'].includes(action.route));
  }

  adminKpis(): Array<{ label: string; value: number | string; tone: string; icon: string }> {
    const report = this.adminReport();
    return [
      {
        label: 'dashboard.admin_home.pending',
        value: this.registrationCounts()['PENDING'] || 0,
        tone: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 8v5l3 2"/><circle cx="12" cy="12" r="9"/></svg>'
      },
      {
        label: 'dashboard.admin_home.requests',
        value: this.findKpi(report, 'requests'),
        tone: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>'
      },
      {
        label: 'dashboard.admin_home.users',
        value: this.findKpi(report, 'users'),
        tone: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/></svg>'
      },
      {
        label: 'dashboard.admin_home.catalog',
        value: this.findKpi(report, 'questions'),
        tone: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>'
      }
    ];
  }

  entityKpis(): Array<{ label: string; value: number; desc: string }> {
    return [
      { label: 'dashboard.entity_home.total', value: this.entityRequests().length, desc: 'dashboard.entity_home.total_desc' },
      { label: 'status.draft', value: this.countEntityStatus(['DRAFT']), desc: 'dashboard.entity_home.draft_desc' },
      { label: 'dashboard.entity_home.active', value: this.countEntityStatus(['PENDING_REVIEW', 'UNDER_EVALUATION', 'PENDING_ADMIN', 'PENDING_FIELD', 'INFO_REQUESTED']), desc: 'dashboard.entity_home.active_desc' },
      { label: 'status.completed', value: this.countEntityStatus(['COMPLETED', 'APPROVED_FINAL']), desc: 'dashboard.entity_home.completed_desc' }
    ];
  }

  registrationStatusCards(): Array<{ label: string; value: number; bar: string }> {
    const counts = this.registrationCounts();
    return [
      { label: 'admin.registrations.statuses.PENDING', value: counts['PENDING'] || 0, bar: 'bg-amber-400' },
      { label: 'admin.registrations.statuses.APPROVED', value: counts['APPROVED'] || 0, bar: 'bg-forest-400' },
      { label: 'admin.registrations.statuses.REJECTED', value: counts['REJECTED'] || 0, bar: 'bg-red-400' }
    ];
  }

  adminFeatureCards(): Array<{ route: string; title: string; desc: string; icon: string }> {
    return [
      {
        route: '/admin/audit',
        title: 'dashboard.admin_home.audit_title',
        desc: 'dashboard.admin_home.audit_desc',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
      },
      {
        route: '/admin/assignments',
        title: 'dashboard.admin_home.assign_title',
        desc: 'dashboard.admin_home.assign_desc',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>'
      },
      {
        route: '/admin/reports',
        title: 'dashboard.admin_home.export_title',
        desc: 'dashboard.admin_home.export_desc',
        icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>'
      }
    ];
  }

  entitySteps(): Array<{ number: number; title: string; desc: string }> {
    return [
      { number: 1, title: 'dashboard.entity_home.step_prepare', desc: 'dashboard.entity_home.step_prepare_desc' },
      { number: 2, title: 'dashboard.entity_home.step_submit', desc: 'dashboard.entity_home.step_submit_desc' },
      { number: 3, title: 'dashboard.entity_home.step_review', desc: 'dashboard.entity_home.step_review_desc' },
      { number: 4, title: 'dashboard.entity_home.step_report', desc: 'dashboard.entity_home.step_report_desc' }
    ];
  }

  reviewerFocusCards(): Array<{ title: string; desc: string }> {
    return [
      { title: 'dashboard.reviewer_home.focus_consistency', desc: 'dashboard.reviewer_home.focus_consistency_desc' },
      { title: 'dashboard.reviewer_home.focus_notes', desc: 'dashboard.reviewer_home.focus_notes_desc' },
      { title: 'dashboard.reviewer_home.focus_timing', desc: 'dashboard.reviewer_home.focus_timing_desc' }
    ];
  }

  topCatalogResources(): ReportsDashboardDto['categoryResources'] {
    return (this.adminReport()?.categoryResources || []).slice(0, 6);
  }

  categoryName(category: ReportsDashboardDto['categoryResources'][number]): string {
    return this.t.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  recentEntityRequests(): RequestSummary[] {
    return this.entityRequests().slice(0, 5);
  }

  registrationTotal(): number {
    return Object.values(this.registrationCounts()).reduce((sum, count) => sum + Number(count || 0), 0);
  }

  statusPercent(value: number, total: number): number {
    return total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 0;
  }

  statusLabel(status: string): string {
    return this.t.instant(`status.${status.toLowerCase().replaceAll(' ', '_')}`);
  }

  badgeClass(status: string): string {
    if (status === 'DRAFT') return 'bg-white/5 text-white/55 border-white/10';
    if (status.includes('REJECTED')) return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (status.includes('APPROVED') || status === 'COMPLETED') return 'bg-forest-500/15 text-forest-300 border-forest-500/30';
    if (status.includes('PENDING')) return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }

  private findKpi(report: ReportsDashboardDto | null, key: string): number | string {
    return report?.kpis?.find(kpi => kpi.key === key)?.value ?? 0;
  }

  private countEntityStatus(statuses: string[]): number {
    return this.entityRequests().filter(request => statuses.includes(request.status)).length;
  }
}
