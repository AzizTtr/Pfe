import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface ValueDto { id: number; code: string; labelAr: string; labelEn: string; }
interface AnswerDto {
  id: number;
  questionTextAr: string;
  questionTextEn: string;
  valueId: number;
  valueCode: string;
  answerText?: string;
  finalValueId?: number;
  finalValueCode?: string;
  evaluatorNote?: string;
}
interface AttachmentDto { id: number; originalName: string; requiredDocumentLabelAr?: string; requiredDocumentLabelEn?: string; sizeBytes: number; }
interface DetailDto {
  id: number;
  requestNumber: string;
  status: string;
  entityName: string;
  answers: AnswerDto[];
  attachments: AttachmentDto[];
}
interface WorkflowDetail {
  request: DetailDto;
  values: ValueDto[];
  assignments: any[];
  decisions: any[];
}

@Component({
  selector: 'aq-review',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'evaluation.review.title' | translate"
      [subtitle]="'evaluation.review.subtitle' | translate">
      <div *ngIf="loading()" class="glass rounded-2xl p-8 text-center text-white/55">{{ 'dashboard.loading' | translate }}</div>

      <ng-container *ngIf="!loading() && data() as d">
        <div class="glass rounded-2xl p-5 mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-sm text-white/45">{{ d.request.requestNumber }}</div>
            <h2 class="text-2xl font-bold gradient-text mt-1">{{ d.request.entityName }}</h2>
            <div class="mt-2 aq-badge" [ngClass]="badge(d.request.status)">{{ statusLabel(d.request.status) | translate }}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 font-semibold" (click)="decide('APPROVED')">
              {{ 'evaluation.review.approve' | translate }}
            </button>
            <button type="button" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold" (click)="decide('REQUEST_INFO')">
              {{ 'evaluation.review.request_info' | translate }}
            </button>
            <button type="button" class="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 font-semibold" (click)="decide('REJECTED')">
              {{ 'evaluation.review.reject' | translate }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div class="space-y-3">
            <div *ngFor="let answer of d.request.answers" class="glass rounded-2xl p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="max-w-3xl">
                  <div class="font-semibold">{{ questionText(answer) }}</div>
                  <div class="mt-2 text-sm text-white/55" *ngIf="answer.answerText">{{ answer.answerText }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="aq-badge aq-badge-neutral">{{ 'evaluation.review.initial' | translate }} {{ answer.valueCode }}</span>
                  <select class="glass rounded-xl px-3 py-2 text-sm outline-none"
                          [(ngModel)]="answer.finalValueId">
                    <option *ngFor="let value of d.values" [ngValue]="value.id">{{ value.code }} - {{ valueLabel(value) }}</option>
                  </select>
                </div>
              </div>
              <textarea rows="2"
                        class="mt-3 w-full glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
                        [(ngModel)]="answer.evaluatorNote"
                        [placeholder]="'evaluation.review.note_placeholder' | translate"></textarea>
              <div class="mt-3 text-end">
                <button type="button" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
                        (click)="saveAnswer(answer)">
                  {{ 'evaluation.review.save_rating' | translate }}
                </button>
              </div>
            </div>
          </div>

          <aside class="space-y-4">
            <div class="glass rounded-2xl p-4">
              <h3 class="font-bold mb-3">{{ 'evaluation.review.attachments' | translate }}</h3>
              <div *ngIf="d.request.attachments.length === 0" class="text-sm text-white/50">{{ 'entity.detail.no_attachments' | translate }}</div>
              <div *ngFor="let file of d.request.attachments" class="rounded-xl border border-white/10 p-3 mb-2">
                <div class="font-medium truncate">{{ file.originalName }}</div>
                <div class="text-xs text-white/45">{{ attachmentLabel(file) }}</div>
              </div>
            </div>

            <div class="glass rounded-2xl p-4">
              <h3 class="font-bold mb-3">{{ 'evaluation.review.decision_notes' | translate }}</h3>
              <textarea rows="5" class="w-full glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
                        [(ngModel)]="decisionNotes"></textarea>
            </div>

            <div class="glass rounded-2xl p-4">
              <h3 class="font-bold mb-3">{{ 'evaluation.review.history' | translate }}</h3>
              <div *ngIf="d.decisions.length === 0" class="text-sm text-white/50">{{ 'evaluation.review.no_decisions' | translate }}</div>
              <div *ngFor="let item of d.decisions" class="text-sm border-b border-white/10 py-2">
                <div class="font-semibold">{{ item.stage }} · {{ item.decision }}</div>
                <div class="text-white/50">{{ item.notes }}</div>
              </div>
            </div>
          </aside>
        </div>
      </ng-container>
    </aq-page-shell>
  `
})
export class ReviewComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  data = signal<WorkflowDetail | null>(null);
  loading = signal(false);
  decisionNotes = '';
  id = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.get<WorkflowDetail>(`/evaluation/requests/${this.id}`).subscribe({
      next: data => {
        data.request.answers.forEach(answer => answer.finalValueId = answer.finalValueId || answer.valueId);
        this.data.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toastr.error(err?.error?.error || 'Unable to load request');
      }
    });
  }

  saveAnswer(answer: AnswerDto): void {
    this.api.patch<AnswerDto>(`/evaluation/answers/${answer.id}`, {
      finalValueId: answer.finalValueId,
      evaluatorNote: answer.evaluatorNote || ''
    }).subscribe({
      next: saved => {
        answer.finalValueCode = saved.finalValueCode;
        this.toastr.success(this.t.instant('evaluation.review.rating_saved'));
      },
      error: err => this.toastr.error(err?.error?.error || this.t.instant('evaluation.review.rating_failed'))
    });
  }

  decide(decision: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO'): void {
    this.api.post<WorkflowDetail>(`/evaluation/requests/${this.id}/decisions`, {
      decision,
      notes: this.decisionNotes
    }).subscribe({
      next: data => {
        this.data.set(data);
        this.toastr.success(this.t.instant('evaluation.review.decision_saved'));
        if (decision !== 'REQUEST_INFO') this.router.navigate(['/evaluation']);
      },
      error: err => this.toastr.error(err?.error?.error || this.t.instant('evaluation.review.decision_failed'))
    });
  }

  questionText(answer: AnswerDto): string {
    return this.t.currentLang === 'ar' ? answer.questionTextAr : answer.questionTextEn;
  }

  valueLabel(value: ValueDto): string {
    return this.t.currentLang === 'ar' ? value.labelAr : value.labelEn;
  }

  attachmentLabel(file: AttachmentDto): string {
    return this.t.currentLang === 'ar' ? (file.requiredDocumentLabelAr || '') : (file.requiredDocumentLabelEn || '');
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
