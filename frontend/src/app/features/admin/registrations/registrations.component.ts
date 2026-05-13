import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface RegistrationRow {
  id: number;
  entityName: string;
  managerName: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByEmail?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Feature 1 — File d'attente des inscriptions à approuver / rejeter.
 */
@Component({
  selector: 'aq-admin-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.registrations.title' | translate"
      [subtitle]="'admin.registrations.subtitle' | translate">

      <!-- Filters -->
      <div class="glass rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <button *ngFor="let s of statuses"
                (click)="setStatus(s.value)"
                [ngClass]="status() === s.value
                            ? 'text-white bg-white/10'
                            : 'text-white/60 hover:bg-white/5'"
                class="px-3 py-1.5 rounded-lg text-sm transition">
          {{ s.label | translate }}
          <span class="ms-1 text-xs opacity-70">{{ counts()[s.value] || 0 }}</span>
        </button>

        <span class="ms-auto text-xs text-white/50">
          {{ totalElements() }} {{ 'admin.registrations.total' | translate }}
        </span>
      </div>

      <!-- Table -->
      <div class="glass rounded-2xl overflow-hidden">
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
              <th class="text-start px-4 py-3">{{ 'admin.registrations.status' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows()" class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="px-4 py-3 text-white/50">#{{ r.id }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ r.entityName }}</div>
                <div class="text-xs text-white/55">{{ r.email }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-white/75">{{ r.managerName }}</td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/60 text-xs">
                {{ r.city }} · {{ r.country }}
              </td>
              <td class="px-4 py-3">
                <span [ngClass]="badgeClass(r.status)"
                      class="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border">
                  {{ ('admin.registrations.statuses.' + r.status) | translate }}
                </span>
              </td>
              <td class="px-4 py-3 text-end">
                <button (click)="open(r)"
                        class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  {{ 'admin.registrations.review' | translate }}
                </button>
              </td>
            </tr>
            <tr *ngIf="!loading() && rows().length === 0">
              <td colspan="6" class="text-center text-white/50 py-10">
                {{ 'admin.registrations.empty' | translate }}
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

      <!-- Detail dialog -->
      <div *ngIf="selected()" (click)="close()"
           class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="glass-strong rounded-2xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">

          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold gradient-text">{{ selected()!.entityName }}</h3>
              <p class="text-xs text-white/55 mt-1">#{{ selected()!.id }} · {{ selected()!.createdAt | date:'short' }}</p>
            </div>
            <button (click)="close()" class="text-white/60 hover:text-white text-xl px-2">×</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm mb-4">
            <div class="glass rounded-lg p-3">
              <div class="text-[10px] uppercase text-white/50 mb-1">
                {{ 'admin.registrations.manager' | translate }}
              </div>
              <div class="font-medium">{{ selected()!.managerName }}</div>
            </div>
            <div class="glass rounded-lg p-3">
              <div class="text-[10px] uppercase text-white/50 mb-1">{{ 'register.email' | translate }}</div>
              <div class="font-medium break-all">{{ selected()!.email }}</div>
            </div>
            <div class="glass rounded-lg p-3">
              <div class="text-[10px] uppercase text-white/50 mb-1">{{ 'register.phone' | translate }}</div>
              <div class="font-medium">{{ selected()!.phone }}</div>
            </div>
            <div class="glass rounded-lg p-3">
              <div class="text-[10px] uppercase text-white/50 mb-1">
                {{ 'admin.registrations.location' | translate }}
              </div>
              <div class="font-medium">{{ selected()!.city }} · {{ selected()!.country }}</div>
            </div>
          </div>

          <div *ngIf="selected()!.description" class="glass rounded-lg p-3 text-sm mb-4">
            <div class="text-[10px] uppercase text-white/50 mb-1">{{ 'register.description' | translate }}</div>
            <p class="text-white/85 whitespace-pre-line">{{ selected()!.description }}</p>
          </div>

          <ng-container *ngIf="selected()!.status === 'PENDING'">
            <textarea [(ngModel)]="reason"
                      [placeholder]="'admin.registrations.reason_placeholder' | translate"
                      rows="3"
                      class="w-full glass rounded-lg p-3 text-sm bg-slate-900/40 outline-none
                             focus:ring-2 focus:ring-forest-500/40 mb-4 resize-none"></textarea>

            <div class="flex flex-wrap gap-3 justify-end">
              <button (click)="reject()" [disabled]="busy() || !reason.trim()"
                      class="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30
                             hover:bg-red-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed">
                ✗ {{ 'admin.registrations.reject' | translate }}
              </button>
              <button (click)="approve()" [disabled]="busy()"
                      class="glow-emerald px-5 py-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700
                             text-white font-semibold border border-forest-500/40
                             disabled:opacity-50 disabled:cursor-not-allowed">
                ✓ {{ 'admin.registrations.approve' | translate }}
              </button>
            </div>
          </ng-container>

          <div *ngIf="selected()!.status === 'REJECTED'" class="glass rounded-lg p-3 text-sm">
            <div class="text-[10px] uppercase text-amber-300/80 mb-1">
              {{ 'admin.registrations.rejection_reason' | translate }}
            </div>
            <p class="text-white/85">{{ selected()!.rejectionReason }}</p>
            <p class="text-xs text-white/50 mt-2">
              {{ selected()!.reviewedAt | date:'short' }} · {{ selected()!.reviewedByEmail }}
            </p>
          </div>

          <div *ngIf="selected()!.status === 'APPROVED'" class="glass rounded-lg p-3 text-sm text-forest-300">
            ✓ {{ 'admin.registrations.approved_at' | translate }}
            {{ selected()!.reviewedAt | date:'short' }}
          </div>
        </div>
      </div>

    </aq-page-shell>
  `
})
export class RegistrationsComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);

  statuses = [
    { value: 'PENDING',  label: 'admin.registrations.statuses.PENDING'  },
    { value: 'APPROVED', label: 'admin.registrations.statuses.APPROVED' },
    { value: 'REJECTED', label: 'admin.registrations.statuses.REJECTED' }
  ];

  status = signal<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  rows = signal<RegistrationRow[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  selected = signal<RegistrationRow | null>(null);
  busy = signal(false);
  counts = signal<Record<string, number>>({});
  reason = '';

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
      this.status.set(status);
    }
    this.fetch();
  }

  setStatus(s: any): void { this.status.set(s); this.fetch(); }

  fetch(): void {
    this.loading.set(true);
    this.api.get<Page<RegistrationRow>>(`/admin/registrations`, { status: this.status(), size: 50 })
      .subscribe({
        next: p => {
          this.rows.set(p.content);
          this.totalElements.set(p.totalElements);
          const c = { ...this.counts() }; c[this.status()] = p.totalElements;
          this.counts.set(c);
          this.loading.set(false);
        },
        error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || 'Error'); }
      });
  }

  open(r: RegistrationRow): void { this.selected.set(r); this.reason = ''; }
  close(): void { this.selected.set(null); }

  approve(): void {
    const r = this.selected(); if (!r) return;
    this.busy.set(true);
    this.api.post<any>(`/admin/registrations/${r.id}/approve`, { welcomeNote: this.reason || null })
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('admin.registrations.approved_ok'));
          this.busy.set(false); this.close(); this.fetch();
        },
        error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || 'Error'); }
      });
  }

  reject(): void {
    const r = this.selected(); if (!r || !this.reason.trim()) return;
    this.busy.set(true);
    this.api.post<void>(`/admin/registrations/${r.id}/reject`, { reason: this.reason.trim() })
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('admin.registrations.rejected_ok'));
          this.busy.set(false); this.close(); this.fetch();
        },
        error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || 'Error'); }
      });
  }

  badgeClass(s: string): string {
    switch (s) {
      case 'PENDING':  return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'APPROVED': return 'bg-forest-500/15 text-forest-300 border-forest-500/30';
      case 'REJECTED': return 'bg-red-500/15 text-red-300 border-red-500/30';
      default:         return 'bg-white/5 text-white/60 border-white/10';
    }
  }
}
