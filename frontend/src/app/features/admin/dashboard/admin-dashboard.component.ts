import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface RegistrationRow {
  id: number;
  entityName: string;
  managerName: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
}

@Component({
  selector: 'aq-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.dashboard.title' | translate"
      [subtitle]="'admin.dashboard.subtitle' | translate">

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a *ngFor="let card of cards"
           [routerLink]="['/admin/registrations']"
           [queryParams]="{ status: card.status }"
           class="admin-dashboard-card p-4">
          <div class="text-[10px] uppercase tracking-wider text-white/50 mb-2">
            {{ card.labelKey | translate }}
          </div>
          <div class="flex items-end justify-between gap-3">
            <div class="text-3xl font-bold gradient-text">{{ counts()[card.status] || 0 }}</div>
            <span [ngClass]="card.badgeClass"
                  class="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border">
              {{ ('admin.registrations.statuses.' + card.status) | translate }}
            </span>
          </div>
        </a>
      </div>

      <div class="admin-dashboard-panel overflow-hidden">
        <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold">{{ 'admin.dashboard.pending_title' | translate }}</h3>
            <p class="text-xs text-white/50">{{ 'admin.dashboard.pending_subtitle' | translate }}</p>
          </div>
          <a routerLink="/admin/registrations"
             class="admin-dashboard-button text-xs px-3 py-1.5">
            {{ 'admin.dashboard.view_all' | translate }}
          </a>
        </div>

        <table class="w-full text-sm">
          <thead class="bg-slate-900/50 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-start px-4 py-3">#</th>
              <th class="text-start px-4 py-3">{{ 'admin.registrations.entity' | translate }}</th>
              <th class="text-start px-4 py-3 hidden md:table-cell">
                {{ 'admin.registrations.manager' | translate }}
              </th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">
                {{ 'admin.registrations.location' | translate }}
              </th>
              <th class="text-start px-4 py-3">{{ 'admin.dashboard.submitted' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of pendingRows()" class="border-t border-white/5 hover:bg-white/[0.035] transition">
              <td class="px-4 py-3 text-white/50">#{{ r.id }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ r.entityName }}</div>
                <div class="text-xs text-white/55">{{ r.email }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-white/75">{{ r.managerName }}</td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/60 text-xs">
                {{ r.city }} · {{ r.country }}
              </td>
              <td class="px-4 py-3 text-white/60 text-xs">{{ r.createdAt | date:'short' }}</td>
              <td class="px-4 py-3 text-end">
                <a [routerLink]="['/admin/registrations']"
                   class="admin-dashboard-button text-xs px-3 py-1.5">
                  {{ 'admin.registrations.review' | translate }}
                </a>
              </td>
            </tr>
            <tr *ngIf="!loading() && pendingRows().length === 0">
              <td colspan="6" class="text-center text-white/50 py-10">
                {{ 'admin.dashboard.no_pending' | translate }}
              </td>
            </tr>
            <tr *ngIf="loading()">
              <td colspan="6" class="text-center text-white/50 py-10">
                {{ 'dashboard.loading' | translate }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </aq-page-shell>
  `,
  styles: [`
    .admin-dashboard-card,
    .admin-dashboard-panel {
      border: 1px solid rgba(255,255,255,.085);
      background: linear-gradient(180deg, rgba(15,23,42,.58), rgba(6,11,26,.48));
      border-radius: 1rem;
      box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 18px 42px -34px rgba(0,0,0,.85);
    }

    .admin-dashboard-card {
      min-height: 112px;
      transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
    }

    .admin-dashboard-card:hover {
      transform: translateY(-1px);
      border-color: rgba(16,185,129,.24);
      background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.032));
      box-shadow: 0 1px 0 rgba(255,255,255,.045) inset, 0 18px 34px -30px rgba(16,185,129,.45);
    }

    .admin-dashboard-button {
      border-radius: .75rem;
      border: 1px solid rgba(255,255,255,.075);
      background: rgba(255,255,255,.042);
      transition: background .18s ease, border-color .18s ease, color .18s ease;
    }

    .admin-dashboard-button:hover {
      border-color: rgba(16,185,129,.22);
      background: rgba(255,255,255,.072);
      color: #fff;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  loading = signal(false);
  pendingRows = signal<RegistrationRow[]>([]);
  counts = signal<Record<RegistrationStatus, number>>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  });

  cards = [
    {
      status: 'PENDING' as const,
      labelKey: 'admin.dashboard.cards.pending',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    {
      status: 'APPROVED' as const,
      labelKey: 'admin.dashboard.cards.approved',
      badgeClass: 'bg-forest-500/15 text-forest-300 border-forest-500/30'
    },
    {
      status: 'REJECTED' as const,
      labelKey: 'admin.dashboard.cards.rejected',
      badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30'
    }
  ];

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    forkJoin({
      pending: this.api.get<Page<RegistrationRow>>('/admin/registrations', { status: 'PENDING', size: 8 }),
      approved: this.api.get<Page<RegistrationRow>>('/admin/registrations', { status: 'APPROVED', size: 1 }),
      rejected: this.api.get<Page<RegistrationRow>>('/admin/registrations', { status: 'REJECTED', size: 1 })
    }).subscribe({
      next: ({ pending, approved, rejected }) => {
        this.pendingRows.set(pending.content);
        this.counts.set({
          PENDING: pending.totalElements,
          APPROVED: approved.totalElements,
          REJECTED: rejected.totalElements
        });
        this.loading.set(false);
      },
      error: e => {
        this.loading.set(false);
        this.toastr.error(e?.error?.error || this.translate.instant('register.error'));
      }
    });
  }
}
