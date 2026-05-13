import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { RequiredDocsDialogComponent } from './required-docs-dialog.component';

interface CategoryRow {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  displayOrder: number;
  active: boolean;
  questionCount: number;
}

@Component({
  selector: 'aq-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent, RequiredDocsDialogComponent],
  template: `
    <aq-page-shell [title]="'admin.categories.title' | translate" [subtitle]="'admin.categories.subtitle' | translate">
      <div slot="actions">
        <button (click)="openCreate()" class="glow-emerald px-4 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm">
          + {{ 'admin.catalog.add' | translate }}
        </button>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-900/50 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-start px-4 py-3">{{ 'admin.catalog.code' | translate }}</th>
              <th class="text-start px-4 py-3">{{ 'admin.catalog.name' | translate }}</th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">{{ 'admin.catalog.order' | translate }}</th>
              <th class="text-start px-4 py-3 hidden md:table-cell">{{ 'admin.categories.questions_count' | translate }}</th>
              <th class="text-start px-4 py-3">{{ 'admin.catalog.status' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of rows()" class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="px-4 py-3 font-semibold text-forest-300">{{ c.code }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ c.nameEn }}</div>
                <div class="text-xs text-white/55">{{ c.nameAr }}</div>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/60">{{ c.displayOrder }}</td>
              <td class="px-4 py-3 hidden md:table-cell text-white/60">{{ c.questionCount }}</td>
              <td class="px-4 py-3"><span [class]="badgeClass(c.active)">{{ c.active ? ('admin.catalog.active' | translate) : ('admin.catalog.inactive' | translate) }}</span></td>
              <td class="px-4 py-3 text-end">
                <button (click)="openDocs(c)"
                        class="text-xs px-3 py-1.5 rounded-lg bg-royal-500/15 text-royal-500 hover:bg-royal-500/25 transition me-2">
                  📎 {{ 'admin.required_docs.short' | translate }}
                </button>
                <button (click)="openEdit(c)" class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition me-2">{{ 'admin.catalog.edit' | translate }}</button>
                <button (click)="toggle(c)" class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  {{ (c.active ? 'admin.catalog.deactivate' : 'admin.catalog.reactivate') | translate }}
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
          <input [(ngModel)]="editing()!.code" name="code" required [placeholder]="'admin.catalog.code' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
          <input [(ngModel)]="editing()!.displayOrder" name="displayOrder" type="number" required [placeholder]="'admin.catalog.order' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
          <input [(ngModel)]="editing()!.nameEn" name="nameEn" required [placeholder]="'admin.catalog.name_en' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
          <input [(ngModel)]="editing()!.nameAr" name="nameAr" required [placeholder]="'admin.catalog.name_ar' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none">
          <textarea [(ngModel)]="editing()!.descriptionEn" name="descriptionEn" rows="3" [placeholder]="'admin.catalog.description_en' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none resize-none"></textarea>
          <textarea [(ngModel)]="editing()!.descriptionAr" name="descriptionAr" rows="3" [placeholder]="'admin.catalog.description_ar' | translate" class="glass rounded-lg px-3 py-2 bg-slate-900/40 outline-none resize-none"></textarea>
          <label class="md:col-span-2 text-sm text-white/70 flex items-center gap-2"><input type="checkbox" [(ngModel)]="editing()!.active" name="active"> {{ 'admin.catalog.active' | translate }}</label>
          <div class="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" (click)="close()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">{{ 'admin.users.cancel' | translate }}</button>
            <button type="submit" [disabled]="busy()" class="glow-emerald px-5 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm disabled:opacity-50">✓ {{ 'admin.catalog.save' | translate }}</button>
          </div>
        </form>
      </div>

      <!-- Required documents manager -->
      <aq-required-docs-dialog
        *ngIf="docsCategory()"
        [category]="docsCategory()!"
        (close)="docsCategory.set(null)" />
    </aq-page-shell>
  `
})
export class CategoriesComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  rows = signal<CategoryRow[]>([]);
  loading = signal(false);
  busy = signal(false);
  editing = signal<CategoryRow | null>(null);
  docsCategory = signal<CategoryRow | null>(null);

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading.set(true);
    this.api.get<CategoryRow[]>('/admin/catalog/categories').subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || 'Error'); }
    });
  }

  openCreate(): void {
    this.editing.set({ id: 0, code: '', nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', displayOrder: this.rows().length + 1, active: true, questionCount: 0 });
  }

  openEdit(row: CategoryRow): void { this.editing.set({ ...row }); }
  close(): void { this.editing.set(null); }

  openDocs(row: CategoryRow): void { this.docsCategory.set(row); }

  save(): void {
    const row = this.editing(); if (!row) return;
    this.busy.set(true);
    const request = row.id
      ? this.api.patch<CategoryRow>(`/admin/catalog/categories/${row.id}`, row)
      : this.api.post<CategoryRow>('/admin/catalog/categories', row);
    request.subscribe({
      next: () => { this.busy.set(false); this.close(); this.fetch(); this.toastr.success(this.translate.instant('admin.catalog.saved')); },
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || 'Error'); }
    });
  }

  toggle(row: CategoryRow): void {
    const action = row.active ? 'deactivate' : 'reactivate';
    this.api.post<void>(`/admin/catalog/categories/${row.id}/${action}`, {}).subscribe({
      next: () => this.fetch(),
      error: e => this.toastr.error(e?.error?.error || 'Error')
    });
  }

  badgeClass(active: boolean): string {
    return `text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${active ? 'bg-forest-500/15 text-forest-300 border-forest-500/30' : 'bg-white/5 text-white/40 border-white/10'}`;
  }
}
