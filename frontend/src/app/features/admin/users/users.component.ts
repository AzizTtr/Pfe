import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface UserRow {
  id: number;
  kcId: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  roleNameAr: string;
  roleNameEn: string;
  active: boolean;
  preferredLang: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
}

const ROLES = [
  'ROLE_PLATFORM_ADMIN',
  'ROLE_FIELD_REVIEWER',
  'ROLE_ADMIN_REVIEWER',
  'ROLE_EVALUATOR',
  'ROLE_ENTITY_MANAGER'
];

/** Feature 15 — Gestion des utilisateurs (création / édition / activation). */
@Component({
  selector: 'aq-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.users.title' | translate"
      [subtitle]="'admin.users.subtitle' | translate">

      <div slot="actions">
        <button (click)="openCreate()"
                class="glow-emerald inline-flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                       border border-forest-500/40 text-sm">
          + {{ 'admin.users.add' | translate }}
        </button>
      </div>

      <!-- Filters -->
      <div class="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <input [(ngModel)]="search" (ngModelChange)="onSearch()"
               [placeholder]="'admin.users.search' | translate"
               class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none w-full md:w-64
                      focus:ring-2 focus:ring-forest-500/40">
        <select [(ngModel)]="roleFilter" (ngModelChange)="fetch()"
                class="glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none">
          <option [ngValue]="null">{{ 'admin.users.all_roles' | translate }}</option>
          <option *ngFor="let r of roles" [ngValue]="r">{{ r }}</option>
        </select>
        <span class="ms-auto text-xs text-white/50">{{ totalElements() }} {{ 'admin.users.total' | translate }}</span>
      </div>

      <!-- Table -->
      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-900/50 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-start px-4 py-3">{{ 'admin.users.user' | translate }}</th>
              <th class="text-start px-4 py-3 hidden md:table-cell">{{ 'admin.users.role' | translate }}</th>
              <th class="text-start px-4 py-3 hidden lg:table-cell">{{ 'admin.users.last_login' | translate }}</th>
              <th class="text-start px-4 py-3">{{ 'admin.users.status' | translate }}</th>
              <th class="text-start px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of rows()" class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-forest-700 to-royal-800
                              border border-white/10 flex items-center justify-center text-xs font-bold">
                    {{ initials(u.fullName) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium truncate">{{ u.fullName }}</div>
                    <div class="text-xs text-white/55 truncate">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                             bg-royal-500/15 text-royal-500 border border-royal-500/30">
                  {{ roleLabel(u) }}
                </span>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-white/55 text-xs">
                {{ u.lastLoginAt ? (u.lastLoginAt | date:'short') : '—' }}
              </td>
              <td class="px-4 py-3">
                <span [ngClass]="u.active
                        ? 'bg-forest-500/15 text-forest-300 border-forest-500/30'
                        : 'bg-white/5 text-white/40 border-white/10'"
                      class="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border">
                  {{ u.active ? ('admin.users.active' | translate) : ('admin.users.inactive' | translate) }}
                </span>
              </td>
              <td class="px-4 py-3 text-end">
                <button (click)="toggleActive(u)"
                        class="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  {{ (u.active ? 'admin.users.deactivate' : 'admin.users.reactivate') | translate }}
                </button>
              </td>
            </tr>
            <tr *ngIf="!loading() && rows().length === 0">
              <td colspan="5" class="text-center text-white/50 py-10">
                {{ 'admin.users.empty' | translate }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create dialog -->
      <div *ngIf="creating()" (click)="creating.set(false)"
           class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="glass-strong rounded-2xl max-w-lg w-full p-6 md:p-8">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-xl font-bold gradient-text">{{ 'admin.users.add' | translate }}</h3>
            <button (click)="creating.set(false)" class="text-white/60 hover:text-white text-xl px-2">×</button>
          </div>

          <form (ngSubmit)="submitCreate()" class="space-y-3">
            <div>
              <label class="text-xs text-white/60 mb-1 block">{{ 'register.email' | translate }}</label>
              <input [(ngModel)]="newUser.email" name="email" type="email" required
                     class="w-full glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                            focus:ring-2 focus:ring-forest-500/40">
            </div>
            <div>
              <label class="text-xs text-white/60 mb-1 block">{{ 'admin.users.full_name' | translate }}</label>
              <input [(ngModel)]="newUser.fullName" name="fullName" required
                     class="w-full glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                            focus:ring-2 focus:ring-forest-500/40">
            </div>
            <div>
              <label class="text-xs text-white/60 mb-1 block">{{ 'admin.users.role' | translate }}</label>
              <select [(ngModel)]="newUser.role" name="role" required
                      class="w-full glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                             focus:ring-2 focus:ring-forest-500/40">
                <option *ngFor="let r of roles" [ngValue]="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-white/60 mb-1 block">{{ 'register.phone' | translate }}</label>
              <input [(ngModel)]="newUser.phone" name="phone"
                     class="w-full glass rounded-lg px-3 py-2 text-sm bg-slate-900/40 outline-none
                            focus:ring-2 focus:ring-forest-500/40">
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="creating.set(false)"
                      class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">
                {{ 'admin.users.cancel' | translate }}
              </button>
              <button type="submit" [disabled]="busy() || !canSubmit()"
                      class="glow-emerald px-5 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700
                             text-white font-semibold border border-forest-500/40 text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed">
                ✓ {{ 'admin.users.create' | translate }}
              </button>
            </div>

            <p class="text-[11px] text-white/45 mt-2">
              💡 {{ 'admin.users.create_hint' | translate }}
            </p>
          </form>
        </div>
      </div>

    </aq-page-shell>
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  roles = ROLES;
  rows = signal<UserRow[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  busy = signal(false);
  creating = signal(false);
  search = '';
  roleFilter: string | null = null;
  searchTimer?: any;

  newUser = { email: '', fullName: '', role: 'ROLE_EVALUATOR', phone: '' };

  ngOnInit(): void { this.fetch(); }

  fetch(): void {
    this.loading.set(true);
    const params: any = { size: 50 };
    if (this.search) params['search'] = this.search;
    if (this.roleFilter) params['role'] = this.roleFilter;

    this.api.get<Page<UserRow>>('/admin/users', params).subscribe({
      next: p => { this.rows.set(p.content); this.totalElements.set(p.totalElements); this.loading.set(false); },
      error: e => { this.loading.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetch(), 350);
  }

  openCreate(): void {
    this.newUser = { email: '', fullName: '', role: 'ROLE_EVALUATOR', phone: '' };
    this.creating.set(true);
  }

  canSubmit(): boolean {
    return !!(this.newUser.email && this.newUser.fullName && this.newUser.role);
  }

  submitCreate(): void {
    if (!this.canSubmit()) return;
    this.busy.set(true);
    this.api.post<any>('/admin/users', this.newUser).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('admin.users.created_ok'));
        this.busy.set(false); this.creating.set(false); this.fetch();
      },
      error: e => { this.busy.set(false); this.toastr.error(e?.error?.error || this.translate.instant('register.error')); }
    });
  }

  toggleActive(u: UserRow): void {
    const path = u.active ? `deactivate` : `reactivate`;
    this.api.post<void>(`/admin/users/${u.id}/${path}`, {}).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant(u.active
          ? 'admin.users.deactivated_ok'
          : 'admin.users.reactivated_ok'));
        this.fetch();
      },
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0,2).map(s => s[0] || '').join('').toUpperCase();
  }

  roleLabel(u: UserRow): string {
    return this.translate.currentLang === 'ar' ? u.roleNameAr : u.roleNameEn;
  }
}
