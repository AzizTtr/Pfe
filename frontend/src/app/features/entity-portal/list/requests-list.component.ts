import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

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

@Component({
  selector: 'aq-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'entity.requests.title' | translate"
      [subtitle]="'entity.requests.subtitle' | translate">

      <div slot="actions">
        <a routerLink="new"
           class="glow-emerald inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                  border border-forest-500/40 text-sm">
          + {{ 'entity.requests.new' | translate }}
        </a>
      </div>

      <div class="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <select [(ngModel)]="statusFilter"
                class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none">
          <option value="">{{ 'entity.requests.all_statuses' | translate }}</option>
          <option *ngFor="let s of statuses()" [value]="s">{{ statusLabel(s) }}</option>
        </select>
        <span class="ms-auto text-xs text-white/45">{{ filteredRows().length }} {{ 'entity.requests.visible' | translate }}</span>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-900/50 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-start px-4 py-3">{{ 'entity.requests.request' | translate }}</th>
              <th class="text-start px-4 py-3 hidden md:table-cell">{{ 'entity.requests.resources' | translate }}</th>
              <th class="text-start px-4 py-3">{{ 'entity.requests.status' | translate }}</th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">{{ 'entity.requests.submitted' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filteredRows()" class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="px-4 py-3">
                <div class="font-semibold text-forest-300">{{ r.requestNumber }}</div>
                <div class="text-xs text-white/45">{{ r.entityName }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-white/65">
                {{ r.categoryCount }} {{ 'entity.requests.categories_count' | translate }} ·
                {{ r.answerCount }} {{ 'entity.requests.answers_count' | translate }} ·
                {{ r.attachmentCount }} {{ 'entity.requests.files_count' | translate }}
              </td>
              <td class="px-4 py-3">
                <span [ngClass]="badgeClass(r.status)"
                      class="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border">
                  {{ statusLabel(r.status) }}
                </span>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/55 text-xs">
                {{ (r.submittedAt || r.createdAt) | date:'short' }}
              </td>
              <td class="px-4 py-3 text-end">
                <a [routerLink]="[r.id]" class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  {{ 'common.open' | translate }}
                </a>
              </td>
            </tr>
            <tr *ngIf="!loading() && filteredRows().length === 0">
              <td colspan="5" class="text-center text-white/50 py-10">{{ 'entity.requests.empty' | translate }}</td>
            </tr>
            <tr *ngIf="loading()">
              <td colspan="5" class="text-center text-white/50 py-10">{{ 'dashboard.loading' | translate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </aq-page-shell>
  `
})
export class RequestsListComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  loading = signal(false);
  rows = signal<RequestSummary[]>([]);
  statusFilter = '';

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading.set(true);
    this.api.get<RequestSummary[]>('/requests/mine').subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.t.instant('register.error')); }
    });
  }

  badgeClass(status: string): string {
    if (status === 'DRAFT') return 'bg-white/5 text-white/50 border-white/10';
    if (status.includes('REJECTED')) return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (status.includes('APPROVED') || status === 'COMPLETED') return 'bg-forest-500/15 text-forest-300 border-forest-500/30';
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }

  statuses(): string[] {
    return Array.from(new Set(this.rows().map(row => row.status))).sort();
  }

  filteredRows(): RequestSummary[] {
    return this.statusFilter ? this.rows().filter(row => row.status === this.statusFilter) : this.rows();
  }

  statusLabel(status: string): string {
    return this.t.instant(`status.${status.toLowerCase()}`);
  }
}
