import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

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

interface CategoryResourceDto {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  questionCount: number;
  requiredDocumentCount: number;
  active: boolean;
}

interface ValueScaleDto {
  code: string;
  labelAr: string;
  labelEn: string;
  numericScore: number;
  active: boolean;
}

interface RecentRegistrationDto {
  id: number;
  entityName: string;
  managerName: string;
  country: string;
  city: string;
  status: string;
  createdAt: string;
}

interface ReportsDashboardDto {
  kpis: KpiDto[];
  registrationStatuses: BucketDto[];
  requestStatuses: BucketDto[];
  userRoles: BucketDto[];
  categoryResources: CategoryResourceDto[];
  valueScale: ValueScaleDto[];
  recentRegistrations: RecentRegistrationDto[];
}
interface AiDashboardInsights {
  summary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
}

/** Features 21 + 22 - live analytics from platform resources. */
@Component({
  selector: 'aq-admin-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgChartsModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.reports.title' | translate"
      [subtitle]="'admin.reports.subtitle' | translate">

      <div slot="actions" class="flex flex-wrap gap-2">
        <button (click)="fetch()"
                class="glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition">
          {{ 'admin.reports.refresh' | translate }}
        </button>
        <button (click)="downloadReport('pdf')" [disabled]="exporting()"
                class="glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-40">
          PDF
        </button>
        <button (click)="downloadReport('excel')" [disabled]="exporting()"
                class="glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-40">
          Excel
        </button>
      </div>

      <div *ngIf="loading()" class="glass rounded-2xl p-8 text-center text-white/60">
        {{ 'dashboard.loading' | translate }}
      </div>

      <ng-container *ngIf="!loading() && dashboard() as data">
        <div class="glass rounded-2xl p-5 border border-blue-400/20" *ngIf="aiInsights() as ai">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-wider text-blue-200/70">{{ 'ai.dashboard.badge' | translate }}</div>
              <h3 class="mt-1 text-lg font-bold gradient-text">{{ 'ai.dashboard.title' | translate }}</h3>
              <p class="mt-2 text-sm text-white/60">{{ ai.summary }}</p>
            </div>
            <button type="button" class="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10" (click)="fetchAiInsights()">
              {{ 'admin.reports.refresh' | translate }}
            </button>
          </div>
          <div class="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-forest-200">{{ 'ai.dashboard.highlights' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.highlights">{{ item }}</li>
              </ul>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-amber-200">{{ 'ai.dashboard.risks' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.risks">{{ item }}</li>
              </ul>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-blue-200">{{ 'ai.dashboard.recommendations' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.recommendations">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div *ngFor="let k of data.kpis" class="glass rounded-xl p-4 min-h-[94px]">
            <div class="text-[10px] uppercase tracking-wider text-white/50 mb-2">{{ kpiLabel(k) }}</div>
            <div class="text-2xl font-bold gradient-text">{{ k.value }}{{ k.suffix || '' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-semibold text-white/85">
                {{ 'admin.reports.registrations_status' | translate }}
              </h4>
              <span class="text-xs text-white/45">{{ 'admin.reports.live_db' | translate }}</span>
            </div>
            <div class="h-64">
              <canvas baseChart [data]="registrationChart" [type]="'doughnut'" [options]="doughnutOpts"></canvas>
            </div>
          </div>

          <div class="glass rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-semibold text-white/85">
                {{ 'admin.reports.catalog_resources' | translate }}
              </h4>
              <span class="text-xs text-white/45">{{ 'admin.reports.source_catalog' | translate }}</span>
            </div>
            <div class="h-64">
              <canvas baseChart [data]="catalogChart" [type]="'bar'" [options]="barOpts"></canvas>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div class="glass rounded-2xl p-5 xl:col-span-2 overflow-hidden">
            <h4 class="text-sm font-semibold mb-4 text-white/85">
              {{ 'admin.reports.category_table' | translate }}
            </h4>
            <table class="w-full text-sm">
              <thead class="text-white/55 text-xs uppercase tracking-wider">
                <tr>
                  <th class="text-start py-2">{{ 'admin.catalog.code' | translate }}</th>
                  <th class="text-start py-2">{{ 'admin.catalog.name' | translate }}</th>
                  <th class="text-start py-2">{{ 'admin.categories.questions_count' | translate }}</th>
                  <th class="text-start py-2">{{ 'admin.categories.docs_count' | translate }}</th>
                  <th class="text-start py-2">{{ 'admin.catalog.status' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of data.categoryResources" class="border-t border-white/5">
                  <td class="py-3 font-semibold text-forest-300">{{ c.code }}</td>
                  <td class="py-3">
                    <div>{{ categoryName(c) }}</div>
                  </td>
                  <td class="py-3 text-white/70">{{ c.questionCount }}</td>
                  <td class="py-3 text-white/70">{{ c.requiredDocumentCount }}</td>
                  <td class="py-3">
                    <span [ngClass]="c.active ? 'aq-badge aq-badge-success' : 'aq-badge aq-badge-neutral'">
                      {{ (c.active ? 'admin.catalog.active' : 'admin.catalog.inactive') | translate }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="glass rounded-2xl p-5">
            <h4 class="text-sm font-semibold mb-4 text-white/85">
              {{ 'admin.reports.value_scale' | translate }}
            </h4>
            <div class="space-y-3">
              <div *ngFor="let v of data.valueScale" class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="font-bold text-forest-300">{{ v.code }}</div>
                  <div class="text-lg font-bold">{{ v.numericScore }}</div>
                </div>
                <div class="text-sm mt-1">{{ valueLabel(v) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="glass rounded-2xl p-5">
            <h4 class="text-sm font-semibold mb-4 text-white/85">
              {{ 'admin.reports.user_roles' | translate }}
            </h4>
            <div class="h-64">
              <canvas baseChart [data]="rolesChart" [type]="'bar'" [options]="horizontalBarOpts"></canvas>
            </div>
          </div>

          <div class="glass rounded-2xl p-5">
            <h4 class="text-sm font-semibold mb-4 text-white/85">
              {{ 'admin.reports.recent_registrations' | translate }}
            </h4>
            <div class="space-y-2">
              <div *ngFor="let r of data.recentRegistrations"
                   class="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ r.entityName }}</div>
                  <div class="text-xs text-white/45 truncate">{{ r.city }} - {{ r.country }} · {{ r.managerName }}</div>
                </div>
                <span class="text-[11px] font-bold uppercase px-2 py-1 rounded-full border border-white/10">
                  {{ statusLabel(r.status) }}
                </span>
              </div>
              <div *ngIf="data.recentRegistrations.length === 0" class="text-sm text-white/45 text-center py-8">
                {{ 'admin.reports.no_live_rows' | translate }}
              </div>
            </div>
          </div>
        </div>

        <div class="glass rounded-2xl p-5" *ngIf="visibleRequestStatuses(data.requestStatuses).length > 0">
          <h4 class="text-sm font-semibold mb-4 text-white/85">
            {{ 'admin.reports.evaluation_statuses' | translate }}
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <div *ngFor="let s of visibleRequestStatuses(data.requestStatuses)"
                 class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div class="text-xs text-white/45 uppercase">{{ statusLabel(s.label) }}</div>
              <div class="text-xl font-bold mt-1">{{ s.value }}</div>
            </div>
          </div>
        </div>
      </ng-container>
    </aq-page-shell>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  loading = signal(false);
  exporting = signal(false);
  dashboard = signal<ReportsDashboardDto | null>(null);
  aiInsights = signal<AiDashboardInsights | null>(null);

  registrationChart: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  catalogChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  rolesChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  doughnutOpts: ChartOptions<'doughnut'> = {
    plugins: { legend: { labels: { color: '#fff' } } },
    maintainAspectRatio: false
  };

  barOpts: ChartOptions<'bar'> = {
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' }, beginAtZero: true }
    },
    maintainAspectRatio: false
  };

  horizontalBarOpts: ChartOptions<'bar'> = {
    ...this.barOpts,
    indexAxis: 'y'
  };

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.api.get<ReportsDashboardDto>('/admin/reports/dashboard').subscribe({
      next: data => {
        this.dashboard.set(data);
        this.rebuildCharts(data);
        this.loading.set(false);
        this.fetchAiInsights();
      },
      error: e => {
        this.loading.set(false);
        this.toastr.error(e?.error?.error || this.translate.instant('register.error'));
      }
    });
  }

  fetchAiInsights(): void {
    this.api.get<AiDashboardInsights>('/admin/reports/ai-insights').subscribe({
      next: insights => this.aiInsights.set(insights),
      error: () => this.aiInsights.set(null)
    });
  }

  visibleRequestStatuses(statuses: BucketDto[]): BucketDto[] {
    return statuses.filter(status => status.value > 0);
  }

  downloadReport(type: 'pdf' | 'excel'): void {
    const endpoint = type === 'pdf' ? '/admin/reports/export/pdf' : '/admin/reports/export/excel';
    const filename = type === 'pdf' ? 'advanced-reports.pdf' : 'advanced-reports.xlsx';
    this.exporting.set(true);
    this.api.getBlob(endpoint).subscribe({
      next: blob => {
        this.exporting.set(false);
        this.downloadBlob(filename, blob);
      },
      error: e => {
        this.exporting.set(false);
        this.toastr.error(e?.error?.error || this.translate.instant('admin.reports.export_failed'));
      }
    });
  }

  private rebuildCharts(data: ReportsDashboardDto): void {
    const registrationStatuses = data.registrationStatuses.filter(status => status.value > 0);
    this.registrationChart = {
      labels: registrationStatuses.map(status => this.statusLabel(status.label)),
      datasets: [{
        data: registrationStatuses.map(status => status.value),
        backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#3b82f6'],
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 2
      }]
    };

    this.catalogChart = {
      labels: data.categoryResources.map(category => category.code),
      datasets: [
        {
          label: this.translate.instant('admin.categories.questions_count'),
          data: data.categoryResources.map(category => category.questionCount),
          backgroundColor: 'rgba(16,185,129,0.72)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: this.translate.instant('admin.categories.docs_count'),
          data: data.categoryResources.map(category => category.requiredDocumentCount),
          backgroundColor: 'rgba(59,130,246,0.72)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };

    this.rolesChart = {
      labels: data.userRoles.map(role => this.roleLabel(role.label)),
      datasets: [{
        label: this.translate.instant('admin.reports.users'),
        data: data.userRoles.map(role => role.value),
        backgroundColor: 'rgba(20,184,166,0.72)',
        borderColor: '#14b8a6',
        borderWidth: 1,
        borderRadius: 8
      }]
    };
  }

  private downloadBlob(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  categoryName(category: CategoryResourceDto): string {
    return this.translate.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  valueLabel(value: ValueScaleDto): string {
    return this.translate.currentLang === 'ar' ? value.labelAr : value.labelEn;
  }

  statusLabel(label: string): string {
    return this.translate.instant(`status.${label.toLowerCase().replaceAll(' ', '_')}`);
  }

  roleLabel(label: string): string {
    return this.translate.instant(`roles.${label}`);
  }

  kpiLabel(kpi: KpiDto): string {
    return this.translate.instant(`admin.reports.kpi.${kpi.key}`);
  }
}
