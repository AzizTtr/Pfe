import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface QuestionRow { id: number; textAr: string; textEn: string; requiresAttachment: boolean; }
interface RequiredDocRow { id: number; labelAr: string; labelEn: string; mandatory: boolean; }
interface CategoryRow {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  questions: QuestionRow[];
  requiredDocuments: RequiredDocRow[];
}
interface ValueRow { id: number; code: string; labelAr: string; labelEn: string; }
interface CatalogDto { categories: CategoryRow[]; values: ValueRow[]; }
interface RequestDetail { id: number; requestNumber: string; status: string; }

@Component({
  selector: 'aq-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'entity.new_request.title' | translate"
      [subtitle]="'entity.new_request.subtitle' | translate">

      <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <aside class="glass rounded-2xl p-4 h-fit">
          <h3 class="text-sm font-semibold mb-3">{{ 'admin.categories.title' | translate }}</h3>
          <div class="space-y-2">
            <div *ngIf="!loading() && (catalog()?.categories?.length || 0) === 0"
                 class="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
              {{ 'entity.new_request.empty_catalog_admin' | translate }}
            </div>
            <label *ngFor="let c of catalog()?.categories"
                   class="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 cursor-pointer hover:bg-white/[0.06]">
              <input type="checkbox" class="mt-1" [checked]="isSelected(c.id)" (change)="toggleCategory(c.id)">
              <span class="min-w-0">
                <span class="block font-medium">{{ categoryName(c) }}</span>
                <span class="block text-[11px] text-white/35 mt-1">
                  {{ c.questions.length }} {{ 'entity.new_request.questions_count' | translate }} ·
                  {{ c.requiredDocuments.length }} {{ 'entity.new_request.docs_count' | translate }}
                </span>
              </span>
            </label>
          </div>
        </aside>

        <form (ngSubmit)="save(false)" class="space-y-4">
          <div *ngIf="loading()" class="glass rounded-2xl p-8 text-center text-white/60">
            {{ 'dashboard.loading' | translate }}
          </div>

          <div *ngIf="!loading() && selectedCategories().length === 0 && (catalog()?.categories?.length || 0) > 0"
               class="glass rounded-2xl p-8 text-center text-white/55">
            {{ 'entity.new_request.select_category' | translate }}
          </div>

          <div *ngIf="!loading() && (catalog()?.categories?.length || 0) === 0"
               class="glass rounded-2xl p-8 text-center text-white/55">
            {{ 'entity.new_request.empty_catalog' | translate }}
          </div>

          <section *ngFor="let c of selectedCategories()" class="glass rounded-2xl p-5">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 class="text-lg font-bold gradient-text">{{ categoryName(c) }}</h3>
              </div>
              <span class="aq-badge aq-badge-neutral">{{ c.code }}</span>
            </div>

            <div class="space-y-4">
              <div *ngFor="let q of c.questions" class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div class="font-medium">{{ questionText(q) }}</div>

                <div class="flex flex-wrap gap-2 mt-3">
                  <label *ngFor="let v of catalog()?.values"
                         class="px-3 py-2 rounded-xl border cursor-pointer transition"
                         [ngClass]="answerValue(q.id) === v.id ? 'border-forest-400 bg-forest-500/15 text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06]'">
                    <input class="hidden" type="radio" [name]="'q' + q.id" [ngModel]="answerValue(q.id)"
                           (ngModelChange)="setAnswer(q.id, v.id)" [value]="v.id">
                    <span class="font-bold">{{ v.code }}</span>
                    <span class="text-xs ms-1">{{ valueLabel(v) }}</span>
                  </label>
                </div>

                <textarea [(ngModel)]="answerText[q.id]" [name]="'note' + q.id" rows="2"
                          class="mt-3 w-full glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none resize-none"
                          [placeholder]="'entity.new_request.optional_note' | translate"></textarea>
              </div>
            </div>

            <div *ngIf="c.requiredDocuments.length > 0" class="mt-5 pt-4 border-t border-white/10">
              <h4 class="text-sm font-semibold mb-3">{{ 'entity.new_request.required_documents' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label *ngFor="let d of c.requiredDocuments"
                       class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-sm font-medium">{{ documentLabel(d) }}</div>
                    </div>
                    <span [ngClass]="d.mandatory ? 'aq-badge aq-badge-warning' : 'aq-badge aq-badge-neutral'">
                      {{ (d.mandatory ? 'entity.new_request.mandatory' : 'entity.new_request.optional') | translate }}
                    </span>
                  </div>
                  <input type="file" class="mt-3 block w-full text-xs text-white/60"
                         (change)="pickFile(d.id, $event)">
                </label>
              </div>
            </div>
          </section>

          <div class="glass rounded-2xl p-4 flex flex-wrap justify-end gap-2">
            <button type="submit" [disabled]="busy() || selectedCategories().length === 0"
                    class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm disabled:opacity-40">
              {{ 'entity.new_request.save_draft' | translate }}
            </button>
            <button type="button" (click)="save(true)" [disabled]="busy() || !canSubmit()"
                    class="glow-emerald px-5 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm disabled:opacity-40">
              {{ 'entity.new_request.submit_request' | translate }}
            </button>
          </div>
        </form>
      </div>
    </aq-page-shell>
  `
})
export class NewRequestComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  t = inject(TranslateService);

  catalog = signal<CatalogDto | null>(null);
  loading = signal(false);
  busy = signal(false);
  selected = signal<Set<number>>(new Set());
  answerValues: Record<number, number> = {};
  answerText: Record<number, string> = {};
  files: Record<number, File> = {};

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<CatalogDto>('/requests/catalog').subscribe({
      next: data => { this.catalog.set(data); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.t.instant('register.error')); }
    });
  }

  isSelected(id: number): boolean { return this.selected().has(id); }

  toggleCategory(id: number): void {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  selectedCategories(): CategoryRow[] {
    const ids = this.selected();
    return (this.catalog()?.categories || []).filter(c => ids.has(c.id));
  }

  answerValue(questionId: number): number | null {
    return this.answerValues[questionId] || null;
  }

  setAnswer(questionId: number, valueId: number): void {
    this.answerValues[questionId] = valueId;
  }

  pickFile(requiredDocumentId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.files[requiredDocumentId] = input.files[0];
  }

  canSubmit(): boolean {
    const questions = this.selectedCategories().flatMap(c => c.questions);
    const mandatoryDocs = this.selectedCategories().flatMap(c => c.requiredDocuments).filter(d => d.mandatory);
    return questions.length > 0
      && questions.every(q => !!this.answerValues[q.id])
      && mandatoryDocs.every(d => !!this.files[d.id]);
  }

  save(submit: boolean): void {
    if (submit && !this.canSubmit()) {
      this.toastr.error(this.t.instant('entity.new_request.validation_missing'));
      return;
    }
    const answers = this.selectedCategories().flatMap(c => c.questions).map(q => ({
      questionId: q.id,
      valueId: this.answerValues[q.id],
      answerText: this.answerText[q.id] || ''
    })).filter(a => !!a.valueId);
    const payload = {
      categoryIds: Array.from(this.selected()),
      answers,
      submit: false
    };
    this.busy.set(true);
    this.api.post<RequestDetail>('/requests', payload).subscribe({
      next: request => this.uploadFiles(request, submit),
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.t.instant('register.error')); }
    });
  }

  private uploadFiles(request: RequestDetail, submit: boolean): void {
    const entries = Object.entries(this.files);
    if (entries.length === 0) {
      submit ? this.submit(request.id) : this.done(request);
      return;
    }
    let index = 0;
    const uploadNext = () => {
      if (index >= entries.length) {
        submit ? this.submit(request.id) : this.done(request);
        return;
      }
      const [docId, file] = entries[index++];
      const form = new FormData();
      form.append('requiredDocumentId', docId);
      form.append('file', file);
      this.api.post(`/requests/${request.id}/attachments`, form).subscribe({
        next: uploadNext,
        error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.t.instant('entity.new_request.upload_failed')); }
      });
    };
    uploadNext();
  }

  private submit(id: number): void {
    this.api.post<RequestDetail>(`/requests/${id}/submit`, {}).subscribe({
      next: request => this.done(request),
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.t.instant('entity.new_request.submit_failed')); }
    });
  }

  private done(request: RequestDetail): void {
    this.busy.set(false);
    this.toastr.success(this.t.instant(request.status === 'DRAFT' ? 'entity.new_request.draft_saved' : 'entity.new_request.request_submitted'));
    this.router.navigate(['/my-requests', request.id]);
  }

  categoryName(category: CategoryRow): string {
    return this.t.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  questionText(question: QuestionRow): string {
    return this.t.currentLang === 'ar' ? question.textAr : question.textEn;
  }

  documentLabel(document: RequiredDocRow): string {
    return this.t.currentLang === 'ar' ? document.labelAr : document.labelEn;
  }

  valueLabel(value: ValueRow): string {
    return this.t.currentLang === 'ar' ? value.labelAr : value.labelEn;
  }
}
