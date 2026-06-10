import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { Subscription } from 'rxjs';

interface CategoryDto { id: number; code: string; nameAr: string; nameEn: string; }
interface AnswerDto {
  id: number;
  questionId: number;
  questionTextAr: string;
  questionTextEn: string;
  valueCode: string;
  answerText?: string;
}
interface AttachmentDto {
  id: number;
  requiredDocumentLabelAr?: string;
  requiredDocumentLabelEn?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
}
interface RequestDetail {
  id: number;
  requestNumber: string;
  status: string;
  entityName: string;
  finalScore?: number;
  finalPercentage?: number;
  submittedAt?: string;
  createdAt: string;
  categories: CategoryDto[];
  answers: AnswerDto[];
  attachments: AttachmentDto[];
}
interface AiSmartReport {
  title: string;
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  fraudRiskAlerts: string[];
  fraudRiskScore: number;
  conclusion: string;
}

@Component({
  selector: 'aq-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'entity.request_detail.title' | translate"
      [subtitle]="'entity.request_detail.subtitle' | translate">

      <div slot="actions">
        <a routerLink="/my-requests" class="text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
          {{ 'common.back' | translate }}
        </a>
      </div>

      <div *ngIf="loading()" class="glass rounded-2xl p-8 text-center text-white/60">
        {{ 'dashboard.loading' | translate }}
      </div>

      <ng-container *ngIf="!loading() && detail() as r">
        <div class="glass rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="text-xs text-white/45">{{ r.entityName }}</div>
            <h2 class="text-2xl font-bold gradient-text">{{ r.requestNumber }}</h2>
            <div class="text-xs text-white/45 mt-1">{{ (r.submittedAt || r.createdAt) | date:'medium' }}</div>
          </div>
          <span [ngClass]="badgeClass(r.status)"
                class="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border">
            {{ statusLabel(r.status) }}
          </span>
        </div>

        <section *ngIf="r.status === 'COMPLETED'" class="glass rounded-2xl p-5 border border-forest-500/20">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold gradient-text">{{ 'entity.request_detail.final_result' | translate }}</h3>
              <p class="text-sm text-white/55 mt-1">{{ 'entity.request_detail.final_result_desc' | translate }}</p>
            </div>
            <button type="button"
                    class="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-semibold"
                    (click)="downloadReport(r)">
              {{ 'entity.request_detail.download_report' | translate }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs uppercase text-white/45">{{ 'entity.request_detail.final_score' | translate }}</div>
              <div class="text-2xl font-bold mt-1">{{ r.finalScore || '-' }}</div>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs uppercase text-white/45">{{ 'entity.request_detail.final_percentage' | translate }}</div>
              <div class="text-2xl font-bold mt-1">{{ r.finalPercentage || '-' }}%</div>
            </div>
          </div>
        </section>

        <section class="glass rounded-2xl p-5 border border-blue-400/20" *ngIf="aiReport() as ai">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-wider text-blue-200/70">{{ 'ai.report.badge' | translate }}</div>
              <h3 class="mt-1 text-lg font-bold gradient-text">{{ ai.title }}</h3>
            </div>
            <button type="button" class="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10" (click)="loadAiReport(r)">
              {{ 'ai.report.refresh' | translate }}
            </button>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-white/65">{{ ai.executiveSummary }}</p>
          <div class="mt-5 rounded-xl border border-red-400/20 bg-red-500/[0.05] p-4" *ngIf="ai.fraudRiskAlerts?.length">
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-bold text-red-200">{{ 'ai.report.fraud_risks' | translate }}</h4>
              <span class="aq-badge aq-badge-danger">{{ ai.fraudRiskScore }}%</span>
            </div>
            <ul class="mt-3 space-y-2 text-sm text-white/65">
              <li *ngFor="let item of ai.fraudRiskAlerts">{{ item }}</li>
            </ul>
          </div>
          <div class="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-forest-200">{{ 'ai.report.strengths' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.strengths">{{ item }}</li>
              </ul>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-amber-200">{{ 'ai.report.weaknesses' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.weaknesses">{{ item }}</li>
              </ul>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h4 class="text-sm font-bold text-blue-200">{{ 'ai.report.recommendations' | translate }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-white/60">
                <li *ngFor="let item of ai.recommendations">{{ item }}</li>
              </ul>
            </div>
          </div>
          <p class="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">{{ ai.conclusion }}</p>
        </section>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <section class="glass rounded-2xl p-5 xl:col-span-2">
            <h3 class="text-sm font-semibold mb-4">{{ 'entity.request_detail.answers' | translate }}</h3>
            <div class="space-y-3">
              <div *ngFor="let a of r.answers" class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">{{ questionText(a) }}</div>
                  </div>
                  <span class="aq-badge aq-badge-success">{{ a.valueCode }}</span>
                </div>
                <p *ngIf="a.answerText" class="text-sm text-white/60 mt-3">{{ a.answerText }}</p>
              </div>
            </div>
          </section>

          <aside class="space-y-4">
            <section class="glass rounded-2xl p-5">
              <h3 class="text-sm font-semibold mb-3">{{ 'entity.request_detail.categories' | translate }}</h3>
              <div class="space-y-2">
                <div *ngFor="let c of r.categories" class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="text-sm font-medium">{{ categoryName(c) }}</div>
                </div>
              </div>
            </section>

            <section class="glass rounded-2xl p-5">
              <h3 class="text-sm font-semibold mb-3">{{ 'entity.request_detail.attachments' | translate }}</h3>
              <div class="space-y-2">
                <div *ngFor="let f of r.attachments" class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="text-sm font-medium truncate">{{ f.originalName }}</div>
                  <div class="text-xs text-white/45">{{ attachmentLabel(f) }}</div>
                  <div class="text-[11px] text-white/35 mt-1">{{ f.mimeType }} · {{ f.sizeBytes | number }} {{ 'common.bytes' | translate }}</div>
                </div>
                <div *ngIf="r.attachments.length === 0" class="text-sm text-white/45 text-center py-4">
                  {{ 'entity.request_detail.no_attachments' | translate }}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </ng-container>
    </aq-page-shell>
  `
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  loading = signal(false);
  detail = signal<RequestDetail | null>(null);
  aiReport = signal<AiSmartReport | null>(null);
  private langSub?: Subscription;

  ngOnInit(): void {
    this.langSub = this.t.onLangChange.subscribe(() => {
      const current = this.detail();
      if (current) this.loadAiReport(current);
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.api.get<RequestDetail>(`/requests/${id}`).subscribe({
      next: detail => { this.detail.set(detail); this.loading.set(false); this.loadAiReport(detail); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.t.instant('register.error')); }
    });
  }

  loadAiReport(request: RequestDetail): void {
    const lang = this.t.currentLang === 'en' ? 'en' : 'ar';
    this.api.get<AiSmartReport>(`/requests/${request.id}/ai-report`, { lang }).subscribe({
      next: report => this.aiReport.set(report),
      error: () => this.aiReport.set(null)
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  badgeClass(status: string): string {
    if (status === 'DRAFT') return 'bg-white/5 text-white/50 border-white/10';
    if (status.includes('REJECTED')) return 'bg-red-500/15 text-red-300 border-red-500/30';
    if (status.includes('APPROVED') || status === 'COMPLETED') return 'bg-forest-500/15 text-forest-300 border-forest-500/30';
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }

  categoryName(category: CategoryDto): string {
    return this.t.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  questionText(answer: AnswerDto): string {
    return this.t.currentLang === 'ar' ? answer.questionTextAr : answer.questionTextEn;
  }

  attachmentLabel(file: AttachmentDto): string {
    return this.t.currentLang === 'ar'
      ? (file.requiredDocumentLabelAr || '')
      : (file.requiredDocumentLabelEn || '');
  }

  downloadReport(request: RequestDetail): void {
    this.api.getBlob(`/requests/${request.id}/report/pdf`).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${request.requestNumber}-final-report.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: e => this.toastr.error(e?.error?.error || this.t.instant('entity.request_detail.report_failed'))
    });
  }

  statusLabel(status: string): string {
    return this.t.instant(`status.${status.toLowerCase()}`);
  }
}
