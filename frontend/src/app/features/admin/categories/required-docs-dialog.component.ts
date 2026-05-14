import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';

interface CategoryLite { id: number; nameAr: string; nameEn: string; }
interface RequiredDocRow {
  id: number;
  categoryId: number;
  labelAr: string;
  labelEn: string;
  mandatory: boolean;
  displayOrder: number;
}

/**
 * Dialog modale pour gérer les "required documents" d'une catégorie.
 * Sprint 3 — Feature 16 (extension).
 *
 *  - Liste paginée des docs requis avec toggle mandatory/optional
 *  - Add / edit inline / delete
 *  - Réordonnable via le champ displayOrder
 */
@Component({
  selector: 'aq-required-docs-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div (click)="close.emit()"
         class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div (click)="$event.stopPropagation()"
           class="glass-strong rounded-2xl max-w-3xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-5">
          <div>
            <h3 class="text-xl font-bold gradient-text">{{ 'admin.required_docs.title' | translate }}</h3>
            <p class="text-xs text-white/55 mt-1">
              {{ categoryName() }}
            </p>
          </div>
          <button (click)="close.emit()" class="text-white/60 hover:text-white text-2xl px-2 leading-none">×</button>
        </div>

        <!-- List -->
        <div *ngIf="docs().length > 0" class="space-y-2 mb-4">
          <div *ngFor="let d of docs()"
               class="glass rounded-xl p-3 flex flex-wrap items-center gap-3">
            <span class="text-xs text-white/55 w-6 text-center">#{{ d.displayOrder }}</span>

            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm">{{ documentLabel(d) }}</div>
            </div>

            <span [class]="d.mandatory
                    ? 'aq-badge aq-badge-warning'
                    : 'aq-badge aq-badge-neutral'">
              {{ (d.mandatory ? 'admin.required_docs.mandatory' : 'admin.required_docs.optional') | translate }}
            </span>

            <button (click)="openEdit(d)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
              {{ 'admin.catalog.edit' | translate }}
            </button>
            <button (click)="remove(d)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition">
              {{ 'admin.catalog.delete' | translate }}
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="docs().length === 0 && !loading()"
             class="glass-soft rounded-xl p-8 text-center text-white/55 text-sm mb-4">
          {{ 'admin.required_docs.empty' | translate }}
        </div>

        <!-- Add / Edit form -->
        <form (ngSubmit)="save()"
              class="glass rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <h4 class="md:col-span-2 text-sm font-semibold">
            {{ editing.id ? ('admin.required_docs.edit' | translate) : ('admin.required_docs.add' | translate) }}
          </h4>

          <input *ngIf="translate.currentLang !== 'ar'" [(ngModel)]="editing.labelEn" name="labelEn" required
                 [placeholder]="'admin.required_docs.label_en' | translate"
                 class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                        focus:ring-2 focus:ring-forest-500/40">

          <input *ngIf="translate.currentLang === 'ar'" [(ngModel)]="editing.labelAr" name="labelAr" required
                 [placeholder]="'admin.required_docs.label_ar' | translate"
                 class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                        focus:ring-2 focus:ring-forest-500/40">

          <input [(ngModel)]="editing.displayOrder" name="displayOrder" type="number" required
                 [placeholder]="'admin.catalog.order' | translate"
                 class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none">

          <label class="text-sm text-white/70 flex items-center gap-2 px-3 py-2">
            <input type="checkbox" [(ngModel)]="editing.mandatory" name="mandatory">
            {{ 'admin.required_docs.is_mandatory' | translate }}
          </label>

          <div class="md:col-span-2 flex justify-end gap-2 pt-1">
            <button *ngIf="editing.id" type="button" (click)="resetForm()"
                    class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
              {{ 'admin.users.cancel' | translate }}
            </button>
            <button type="submit" [disabled]="busy() || !canSave()"
                    class="glow-emerald px-5 py-2 rounded-lg bg-gradient-to-r from-forest-600 to-forest-700
                           text-white font-semibold border border-forest-500/40 text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed">
              ✓ {{ (editing.id ? 'admin.catalog.save' : 'admin.catalog.add') | translate }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RequiredDocsDialogComponent implements OnInit {
  @Input({ required: true }) category!: CategoryLite;
  @Output() close = new EventEmitter<void>();

  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  translate = inject(TranslateService);

  docs = signal<RequiredDocRow[]>([]);
  loading = signal(false);
  busy = signal(false);

  editing: Partial<RequiredDocRow> = this.blank();

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading.set(true);
    this.api.get<RequiredDocRow[]>(`/admin/catalog/categories/${this.category.id}/required-documents`)
      .subscribe({
        next: list => { this.docs.set(list); this.loading.set(false); },
        error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
      });
  }

  canSave(): boolean {
    return !!(((this.editing.labelEn || this.editing.labelAr))
              && this.editing.displayOrder !== undefined && this.editing.displayOrder !== null);
  }

  openEdit(d: RequiredDocRow): void {
    this.editing = { ...d };
  }

  resetForm(): void {
    this.editing = this.blank();
  }

  save(): void {
    if (!this.canSave()) return;
    this.busy.set(true);
    this.editing.labelEn = this.editing.labelEn || this.editing.labelAr || '';
    this.editing.labelAr = this.editing.labelAr || this.editing.labelEn || '';
    const payload = {
      labelEn:      this.editing.labelEn,
      labelAr:      this.editing.labelAr,
      mandatory:    !!this.editing.mandatory,
      displayOrder: this.editing.displayOrder
    };
    const request = this.editing.id
      ? this.api.patch<RequiredDocRow>(`/admin/catalog/required-documents/${this.editing.id}`, payload)
      : this.api.post<RequiredDocRow>(`/admin/catalog/categories/${this.category.id}/required-documents`, payload);
    request.subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('admin.catalog.saved'));
        this.busy.set(false);
        this.resetForm();
        this.fetch();
      },
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
    });
  }

  remove(d: RequiredDocRow): void {
    if (!confirm(this.translate.instant('admin.required_docs.confirm_delete'))) return;
    this.api.delete<void>(`/admin/catalog/required-documents/${d.id}`).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('admin.required_docs.deleted'));
        this.fetch();
      },
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }

  private blank(): Partial<RequiredDocRow> {
    return {
      id: undefined,
      categoryId: this.category?.id,
      labelEn: '',
      labelAr: '',
      mandatory: false,
      displayOrder: (this.docs().length || 0) + 1
    };
  }

  categoryName(): string {
    return this.translate.currentLang === 'ar' ? this.category.nameAr : this.category.nameEn;
  }

  documentLabel(document: RequiredDocRow): string {
    return this.translate.currentLang === 'ar' ? document.labelAr : document.labelEn;
  }
}
