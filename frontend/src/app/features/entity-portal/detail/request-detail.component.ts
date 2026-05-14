import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

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
  submittedAt?: string;
  createdAt: string;
  categories: CategoryDto[];
  answers: AnswerDto[];
  attachments: AttachmentDto[];
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
export class RequestDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  loading = signal(false);
  detail = signal<RequestDetail | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.api.get<RequestDetail>(`/requests/${id}`).subscribe({
      next: detail => { this.detail.set(detail); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.t.instant('register.error')); }
    });
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

  statusLabel(status: string): string {
    return this.t.instant(`status.${status.toLowerCase()}`);
  }
}
