import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
  selector: 'aq-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'evaluation.inbox.title' | translate"
      [subtitle]="'evaluation.inbox.subtitle' | translate">
      <div class="glass rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let s of statuses"
                  type="button"
                  class="aq-pill"
                  [class.aq-pill-active]="status === s.value"
                  (click)="setStatus(s.value)">
            {{ s.label | translate }}
          </button>
        </div>
        <button type="button" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm" (click)="load()">
          {{ 'evaluation.inbox.refresh' | translate }}
        </button>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <div class="grid grid-cols-[1.1fr_1.4fr_.9fr_.7fr_.8fr] gap-3 px-4 py-3 text-xs uppercase tracking-wide text-white/45 border-b border-white/10">
          <span>{{ 'evaluation.inbox.request' | translate }}</span>
          <span>{{ 'evaluation.inbox.entity' | translate }}</span>
          <span>{{ 'evaluation.inbox.status' | translate }}</span>
          <span>{{ 'evaluation.inbox.answers' | translate }}</span>
          <span class="text-end">{{ 'evaluation.inbox.action' | translate }}</span>
        </div>

        <div *ngIf="loading()" class="p-8 text-center text-white/55">{{ 'dashboard.loading' | translate }}</div>
        <div *ngIf="!loading() && rows().length === 0" class="p-8 text-center text-white/55">
          {{ 'evaluation.inbox.empty' | translate }}
        </div>

        <div *ngFor="let row of rows()"
             class="grid grid-cols-[1.1fr_1.4fr_.9fr_.7fr_.8fr] gap-3 px-4 py-4 items-center border-b border-white/5 hover:bg-white/[0.03]">
          <div>
            <div class="font-semibold">{{ row.requestNumber }}</div>
            <div class="text-xs text-white/45">{{ row.submittedAt || row.createdAt | date:'mediumDate' }}</div>
          </div>
          <div class="min-w-0">
            <div class="truncate">{{ row.entityName }}</div>
            <div class="text-xs text-white/45">{{ row.categoryCount }} {{ 'evaluation.inbox.categories' | translate }}</div>
          </div>
          <span class="aq-badge" [ngClass]="badge(row.status)">{{ statusLabel(row.status) | translate }}</span>
          <span class="text-white/70">{{ row.answerCount }}</span>
          <div class="text-end">
            <a class="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 text-sm font-semibold"
               [routerLink]="['/evaluation', row.id]">
              {{ 'evaluation.inbox.open' | translate }}
            </a>
          </div>
        </div>
      </div>
    </aq-page-shell>
  `
})
export class InboxComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);

  rows = signal<RequestSummary[]>([]);
  loading = signal(false);
  status = '';

  statuses = [
    { value: '', label: 'evaluation.inbox.all' },
    { value: 'PENDING_REVIEW', label: 'status.pending_review' },
    { value: 'UNDER_EVALUATION', label: 'status.under_evaluation' },
    { value: 'PENDING_ADMIN', label: 'status.pending_admin' },
    { value: 'PENDING_FIELD', label: 'status.pending_field' },
    { value: 'INFO_REQUESTED', label: 'status.info_requested' }
  ];

  ngOnInit(): void {
    this.load();
  }

  setStatus(status: string): void {
    this.status = status;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params = this.status ? { status: this.status } : undefined;
    this.api.get<RequestSummary[]>('/evaluation/inbox', params).subscribe({
      next: rows => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toastr.error(err?.error?.error || 'Unable to load inbox');
      }
    });
  }

  statusLabel(status: string): string {
    return `status.${status.toLowerCase()}`;
  }

  badge(status: string): string {
    if (status.includes('REJECTED')) return 'aq-badge-danger';
    if (status.includes('APPROVED') || status === 'COMPLETED') return 'aq-badge-success';
    if (status.includes('PENDING') || status === 'UNDER_EVALUATION') return 'aq-badge-warning';
    return 'aq-badge-info';
  }
}
