import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface CategoryRow { id: number; code: string; nameAr: string; nameEn: string; active: boolean; }
interface QuestionRow {
  id: number;
  categoryId: number;
  categoryCode: string;
  categoryNameAr: string;
  categoryNameEn: string;
  textAr: string;
  textEn: string;
  requiresAttachment: boolean;
  displayOrder: number;
  active: boolean;
}

@Component({
  selector: 'aq-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell [title]="'admin.questions.title' | translate" [subtitle]="'admin.questions.subtitle' | translate">
      <div slot="actions">
        <button (click)="openCreate()" [disabled]="categories().length === 0" class="glow-emerald px-4 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm disabled:opacity-50">
          + {{ 'admin.catalog.add' | translate }}
        </button>
      </div>

      <div class="glass rounded-2xl p-4 flex flex-wrap gap-3">
        <select [(ngModel)]="categoryFilter" (ngModelChange)="fetchQuestions()" class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none">
          <option [ngValue]="null">{{ 'admin.questions.all_categories' | translate }}</option>
          <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.code }} · {{ categoryName(c) }}</option>
        </select>
        <span class="ms-auto text-xs text-white/50">{{ rows().length }} {{ 'admin.questions.total' | translate }}</span>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-900/50 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-start px-4 py-3">{{ 'admin.questions.question' | translate }}</th>
              <th class="text-start px-4 py-3 hidden md:table-cell">{{ 'admin.categories.title' | translate }}</th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">{{ 'admin.catalog.order' | translate }}</th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">{{ 'admin.questions.attachment' | translate }}</th>
              <th class="text-start px-4 py-3">{{ 'admin.catalog.status' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let q of rows()" class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="px-4 py-3">
                <div class="font-medium line-clamp-1">{{ questionText(q) }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-white/60">{{ q.categoryCode }}</td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/60">{{ q.displayOrder }}</td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/60">{{ q.requiresAttachment ? ('admin.catalog.yes' | translate) : ('admin.catalog.no' | translate) }}</td>
              <td class="px-4 py-3"><span [class]="badgeClass(q.active)">{{ q.active ? ('admin.catalog.active' | translate) : ('admin.catalog.inactive' | translate) }}</span></td>
              <td class="px-4 py-3 text-end">
                <button (click)="openEdit(q)" class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition me-2">{{ 'admin.catalog.edit' | translate }}</button>
                <button (click)="toggle(q)" class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  {{ (q.active ? 'admin.catalog.deactivate' : 'admin.catalog.reactivate') | translate }}
                </button>
              </td>
            </tr>
            <tr *ngIf="!loading() && rows().length === 0">
              <td colspan="6" class="text-center text-white/50 py-10">{{ 'admin.catalog.empty' | translate }}</td>
            </tr>
            <tr *ngIf="loading()">
              <td colspan="6" class="text-center text-white/50 py-10">{{ 'dashboard.loading' | translate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="editing()" (click)="close()" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <form (click)="$event.stopPropagation()" (ngSubmit)="save()" class="glass-strong rounded-2xl max-w-2xl w-full p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <h3 class="md:col-span-2 text-xl font-bold gradient-text">{{ editing()!.id ? ('admin.catalog.edit' | translate) : ('admin.catalog.add' | translate) }}</h3>
          <select [(ngModel)]="editing()!.categoryId" name="categoryId" required class="md:col-span-2 glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.code }} · {{ categoryName(c) }}</option>
          </select>
          <textarea *ngIf="translate.currentLang !== 'ar'" [(ngModel)]="editing()!.textEn" name="textEn" rows="4" required [placeholder]="'admin.questions.text_en' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none resize-none"></textarea>
          <textarea *ngIf="translate.currentLang === 'ar'" [(ngModel)]="editing()!.textAr" name="textAr" rows="4" required [placeholder]="'admin.questions.text_ar' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none resize-none"></textarea>
          <input [(ngModel)]="editing()!.displayOrder" name="displayOrder" type="number" required [placeholder]="'admin.catalog.order' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
          <label class="text-sm text-white/70 flex items-center gap-2"><input type="checkbox" [(ngModel)]="editing()!.requiresAttachment" name="requiresAttachment"> {{ 'admin.questions.attachment' | translate }}</label>
          <label class="md:col-span-2 text-sm text-white/70 flex items-center gap-2"><input type="checkbox" [(ngModel)]="editing()!.active" name="active"> {{ 'admin.catalog.active' | translate }}</label>
          <div class="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" (click)="close()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">{{ 'admin.users.cancel' | translate }}</button>
            <button type="submit" [disabled]="busy()" class="glow-emerald px-5 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm disabled:opacity-50">✓ {{ 'admin.catalog.save' | translate }}</button>
          </div>
        </form>
      </div>
    </aq-page-shell>
  `
})
export class QuestionsComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  translate = inject(TranslateService);

  rows = signal<QuestionRow[]>([]);
  categories = signal<CategoryRow[]>([]);
  loading = signal(false);
  busy = signal(false);
  editing = signal<QuestionRow | null>(null);
  categoryFilter: number | null = null;

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchQuestions();
  }

  fetchCategories(): void {
    this.api.get<CategoryRow[]>('/admin/catalog/categories').subscribe({
      next: rows => this.categories.set(rows),
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }

  fetchQuestions(): void {
    this.loading.set(true);
    const params = this.categoryFilter ? { categoryId: this.categoryFilter } : undefined;
    this.api.get<QuestionRow[]>('/admin/catalog/questions', params).subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
    });
  }

  openCreate(): void {
    const first = this.categories()[0];
    if (!first) return;
    this.editing.set({ id: 0, categoryId: this.categoryFilter || first.id, categoryCode: '', categoryNameAr: '', categoryNameEn: '', textAr: '', textEn: '', requiresAttachment: false, displayOrder: this.rows().length + 1, active: true });
  }

  openEdit(row: QuestionRow): void { this.editing.set({ ...row }); }
  close(): void { this.editing.set(null); }

  save(): void {
    const row = this.editing(); if (!row) return;
    row.textEn = row.textEn || row.textAr;
    row.textAr = row.textAr || row.textEn;
    this.busy.set(true);
    const request = row.id
      ? this.api.patch<QuestionRow>(`/admin/catalog/questions/${row.id}`, row)
      : this.api.post<QuestionRow>('/admin/catalog/questions', row);
    request.subscribe({
      next: () => { this.busy.set(false); this.close(); this.fetchQuestions(); this.toastr.success(this.translate.instant('admin.catalog.saved')); },
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
    });
  }

  toggle(row: QuestionRow): void {
    const action = row.active ? 'deactivate' : 'reactivate';
    this.api.post<void>(`/admin/catalog/questions/${row.id}/${action}`, {}).subscribe({
      next: () => this.fetchQuestions(),
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }

  badgeClass(active: boolean): string {
    return `text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${active ? 'bg-forest-500/15 text-forest-300 border-forest-500/30' : 'bg-white/5 text-white/40 border-white/10'}`;
  }

  categoryName(category: CategoryRow): string {
    return this.translate.currentLang === 'ar' ? category.nameAr : category.nameEn;
  }

  questionText(question: QuestionRow): string {
    return this.translate.currentLang === 'ar' ? question.textAr : question.textEn;
  }
}
