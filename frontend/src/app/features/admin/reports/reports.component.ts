import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

/** Features 21 + 22 — dashboard analytique. */
@Component({
  selector: 'aq-admin-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgChartsModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.reports.title' | translate"
      [subtitle]="'admin.reports.subtitle' | translate">

      <div slot="actions" class="flex gap-2">
        <button class="glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition flex items-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          PDF
        </button>
        <button class="glass rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition flex items-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          Excel
        </button>
      </div>

      <!-- KPI strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div *ngFor="let k of kpis" class="glass rounded-xl p-4">
          <div class="text-[10px] uppercase tracking-wider text-white/50 mb-1">{{ k.l }}</div>
          <div class="text-2xl font-bold gradient-text">{{ k.v }}</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-5">
          <h4 class="text-sm font-semibold mb-4 text-white/85">
            {{ 'admin.reports.requests_status' | translate }}
          </h4>
          <div class="h-64">
            <canvas baseChart [data]="pieData" [type]="'doughnut'" [options]="pieOpts"></canvas>
          </div>
        </div>
        <div class="glass rounded-2xl p-5">
          <h4 class="text-sm font-semibold mb-4 text-white/85">
            {{ 'admin.reports.avg_score' | translate }}
          </h4>
          <div class="h-64">
            <canvas baseChart [data]="barData" [type]="'bar'" [options]="barOpts"></canvas>
          </div>
        </div>
      </div>

    </aq-page-shell>
  `
})
export class ReportsComponent {
  kpis = [
    { v: '46',   l: 'Total requests' },
    { v: '23',   l: 'Approved' },
    { v: '78%',  l: 'Avg score' },
    { v: '12',   l: 'Active jihat' }
  ];

  pieData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Pending', 'Under Eval', 'Approved', 'Rejected'],
    datasets: [{
      data: [12, 7, 23, 4],
      backgroundColor: ['#3b82f6', '#10b981', '#22c55e', '#ef4444'],
      borderColor: 'rgba(255,255,255,.05)',
      borderWidth: 2
    }]
  };
  pieOpts: ChartOptions<'doughnut'> = {
    plugins: { legend: { labels: { color: '#fff' } } },
    maintainAspectRatio: false
  };

  barData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Curriculum', 'Staff', 'Environment', 'Resources'],
    datasets: [{
      label: 'Avg %',
      data: [82, 76, 68, 71],
      backgroundColor: 'rgba(16,185,129,0.7)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 8
    }]
  };
  barOpts: ChartOptions<'bar'> = {
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' } }
    },
    maintainAspectRatio: false
  };
}
