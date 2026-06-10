import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface AuditRow {
  id: number;
  userEmail?: string;
  actionType: string;
  entityType?: string;
  description?: string;
  ipAddress?: string;
  success: boolean;
  createdAt: string;
}
interface Page<T> { content: T[]; totalElements: number; }

@Component({
  selector: 'aq-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell [title]="'admin.audit.title' | translate" [subtitle]="'admin.audit.subtitle' | translate">
      <div class="glass rounded-2xl p-4 mb-4 space-y-3">
        <div class="audit-filter-grid">
          <input class="audit-input" [(ngModel)]="action" [placeholder]="auditLabel('action')" />
          <input class="audit-input" [(ngModel)]="user" [placeholder]="auditLabel('user')" />
          <input class="audit-input" [(ngModel)]="entity" [placeholder]="auditLabel('entity')" />
          <label class="audit-date-field">
            <span>{{ auditLabel('from_date') }}</span>
            <input [(ngModel)]="from" type="date" />
          </label>
          <label class="audit-date-field">
            <span>{{ auditLabel('to_date') }}</span>
            <input [(ngModel)]="to" type="date" />
          </label>
          <button class="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 font-semibold" (click)="load()">
            {{ auditLabel('filter') }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="audit-chip" (click)="setRange('today')">{{ auditLabel('range_today') }}</button>
          <button type="button" class="audit-chip" (click)="setRange('week')">{{ auditLabel('range_week') }}</button>
          <button type="button" class="audit-chip" (click)="setRange('month')">{{ auditLabel('range_month') }}</button>
          <button type="button" class="audit-chip" (click)="clearDates()" *ngIf="from || to">{{ auditLabel('clear_dates') }}</button>
        </div>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <div class="grid grid-cols-[1fr_1fr_1fr_1.6fr_.7fr] gap-3 px-4 py-3 text-xs uppercase text-white/45 border-b border-white/10">
          <span>{{ 'admin.audit.action' | translate }}</span>
          <span>{{ 'admin.audit.user' | translate }}</span>
          <span>{{ 'admin.audit.entity' | translate }}</span>
          <span>{{ 'admin.audit.description' | translate }}</span>
          <span>{{ 'admin.audit.result' | translate }}</span>
        </div>
        <div *ngIf="loading()" class="p-8 text-center text-white/55">{{ 'dashboard.loading' | translate }}</div>
        <div *ngIf="!loading() && rows().length === 0" class="p-8 text-center text-white/55">{{ 'admin.audit.empty' | translate }}</div>
        <div *ngFor="let row of rows()" class="grid grid-cols-[1fr_1fr_1fr_1.6fr_.7fr] gap-3 px-4 py-4 border-b border-white/5 items-center">
          <div>
            <div class="font-semibold">{{ row.actionType }}</div>
            <div class="text-xs text-white/40">{{ row.createdAt | date:'short' }}</div>
          </div>
          <span class="truncate text-white/70">{{ row.userEmail || '-' }}</span>
          <span class="aq-badge aq-badge-neutral">{{ row.entityType || '-' }}</span>
          <span class="text-sm text-white/65 truncate">{{ row.description || '-' }}</span>
          <span class="aq-badge" [ngClass]="row.success ? 'aq-badge-success' : 'aq-badge-danger'">
            {{ (row.success ? 'admin.audit.success' : 'admin.audit.failed') | translate }}
          </span>
        </div>
      </div>
    </aq-page-shell>
  `,
  styles: [`
    .audit-filter-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: .75rem;
    }

    @media (min-width: 768px) {
      .audit-filter-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1280px) {
      .audit-filter-grid {
        grid-template-columns: minmax(11rem, 1fr) minmax(11rem, 1fr) minmax(11rem, 1fr) minmax(12rem, 1fr) minmax(12rem, 1fr) minmax(10rem, .9fr);
        align-items: stretch;
      }
    }

    .audit-input {
      border-radius: .75rem;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(15,23,42,.42);
      padding: .65rem .8rem;
      color: white;
      outline: none;
      font-size: .875rem;
      min-height: 2.85rem;
      min-width: 0;
    }

    .audit-date-field {
      display: grid;
      grid-template-columns: 1fr;
      align-content: center;
      gap: .2rem;
      min-height: 3.6rem;
      border-radius: .75rem;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(15,23,42,.42);
      padding: .45rem .75rem;
      color: white;
      min-width: 0;
    }

    .audit-date-field:focus-within {
      border-color: rgba(45,212,191,.45);
      box-shadow: 0 0 0 3px rgba(20,184,166,.12);
    }

    .audit-date-field span {
      color: rgba(255,255,255,.58);
      font-size: .68rem;
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0;
      white-space: nowrap;
    }

    .audit-date-field input {
      width: 100%;
      min-width: 0;
      border: 0;
      background: transparent;
      color: white;
      outline: none;
      font-size: .84rem;
      color-scheme: dark;
    }

    .audit-chip {
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.045);
      color: rgba(255,255,255,.7);
      padding: .42rem .7rem;
      font-size: .75rem;
      font-weight: 700;
    }

    .audit-chip:hover {
      border-color: rgba(45,212,191,.35);
      color: white;
      background: rgba(20,184,166,.1);
    }
  `]
})
export class AuditComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  rows = signal<AuditRow[]>([]);
  loading = signal(false);
  action = '';
  user = '';
  entity = '';
  from = '';
  to = '';

  private readonly auditFallbacks: Record<string, { en: string; ar: string }> = {
    action: { en: 'Action', ar: '\u0627\u0644\u0625\u062c\u0631\u0627\u0621' },
    user: { en: 'User', ar: '\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645' },
    entity: { en: 'Entity', ar: '\u0627\u0644\u0643\u064a\u0627\u0646' },
    from_date: { en: 'From date', ar: '\u0645\u0646 \u062a\u0627\u0631\u064a\u062e' },
    to_date: { en: 'To date', ar: '\u0625\u0644\u0649 \u062a\u0627\u0631\u064a\u062e' },
    filter: { en: 'Filter', ar: '\u062a\u0635\u0641\u064a\u0629' },
    range_today: { en: 'Today', ar: '\u0627\u0644\u064a\u0648\u0645' },
    range_week: { en: 'Last 7 days', ar: '\u0622\u062e\u0631 7 \u0623\u064a\u0627\u0645' },
    range_month: { en: 'Last 30 days', ar: '\u0622\u062e\u0631 30 \u064a\u0648\u0645\u0627' },
    clear_dates: { en: 'Clear dates', ar: '\u0645\u0633\u062d \u0627\u0644\u062a\u0648\u0627\u0631\u064a\u062e' }
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = { size: 50 };
    if (this.action) params['action'] = this.action;
    if (this.user) params['user'] = this.user;
    if (this.entity) params['entity'] = this.entity;
    if (this.from) params['from'] = this.from;
    if (this.to) params['to'] = this.to;
    this.api.get<Page<AuditRow>>('/admin/audit-log', params).subscribe({
      next: page => { this.rows.set(page.content); this.loading.set(false); },
      error: err => { this.loading.set(false); this.toastr.error(err?.error?.error || this.t.instant('register.error')); }
    });
  }

  setRange(range: 'today' | 'week' | 'month'): void {
    const end = new Date();
    const start = new Date();
    if (range === 'week') start.setDate(end.getDate() - 7);
    if (range === 'month') start.setDate(end.getDate() - 30);
    this.from = this.dateValue(start);
    this.to = this.dateValue(end);
    this.load();
  }

  clearDates(): void {
    this.from = '';
    this.to = '';
    this.load();
  }

  auditLabel(key: string): string {
    const translationKey = `admin.audit.${key}`;
    const translated = this.t.instant(translationKey);
    if (translated && translated !== translationKey && !translated.startsWith('admin.audit')) {
      return translated;
    }
    const lang = this.t.currentLang === 'ar' ? 'ar' : 'en';
    return this.auditFallbacks[key]?.[lang] || this.auditFallbacks[key]?.en || key;
  }

  private dateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
