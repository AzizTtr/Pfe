import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';

interface UserProfile {
  id: number;
  kcId: string;
  email: string;
  fullName: string;
  role: string;
  preferredLang: 'ar' | 'en';
  phone?: string;
  lastLoginAt?: string;
}

@Component({
  selector: 'aq-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'profile.title' | translate"
      [subtitle]="'profile.subtitle' | translate">

      <div class="grid lg:grid-cols-[1.4fr_1fr] gap-6">

        <!-- ─── LEFT : edit form ─── -->
        <div class="space-y-5">

          <!-- Identity -->
          <section class="glass rounded-2xl p-6">
            <h3 class="text-base font-semibold mb-1">{{ 'profile.identity' | translate }}</h3>
            <p class="text-xs text-white/55 mb-5">{{ 'profile.identity_desc' | translate }}</p>

            <form [formGroup]="form" (ngSubmit)="save()" class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label class="text-xs text-white/60 mb-1 block">{{ 'profile.full_name' | translate }}</label>
                <input formControlName="fullName"
                       class="w-full glass rounded-lg px-3 py-2.5 text-sm bg-slate-900/40 outline-none
                              focus:ring-2 focus:ring-forest-500/40 transition" />
              </div>
              <div>
                <label class="text-xs text-white/60 mb-1 block">{{ 'register.phone' | translate }}</label>
                <input formControlName="phone"
                       class="w-full glass rounded-lg px-3 py-2.5 text-sm bg-slate-900/40 outline-none
                              focus:ring-2 focus:ring-forest-500/40 transition" />
              </div>

              <div class="md:col-span-2">
                <label class="text-xs text-white/60 mb-1 block">{{ 'register.email' | translate }}</label>
                <input formControlName="email" readonly
                       class="w-full glass rounded-lg px-3 py-2.5 text-sm bg-slate-900/30 outline-none text-white/55 cursor-not-allowed" />
                <p class="text-[11px] text-white/40 mt-1">
                  {{ 'profile.email_locked' | translate }}
                </p>
              </div>

              <div class="md:col-span-2 flex justify-end mt-2">
                <button type="submit" [disabled]="form.invalid || form.pristine || saving()"
                        class="glow-emerald inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                               bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                               border border-forest-500/40 text-sm
                               disabled:opacity-50 disabled:cursor-not-allowed">
                  ✓ {{ 'profile.save' | translate }}
                </button>
              </div>
            </form>
          </section>

          <!-- Preferences -->
          <section class="glass rounded-2xl p-6">
            <h3 class="text-base font-semibold mb-1">{{ 'profile.preferences' | translate }}</h3>
            <p class="text-xs text-white/55 mb-5">{{ 'profile.preferences_desc' | translate }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <!-- Language -->
              <div>
                <label class="text-xs text-white/60 mb-2 block">
                  {{ 'profile.language' | translate }}
                </label>
                <div class="flex gap-2">
                  <button (click)="setLang('ar')"
                          [class]="'aq-pill flex-1 justify-center ' + (lang() === 'ar' ? 'aq-pill-active' : '')">
                    🇸🇦 العربية (RTL)
                  </button>
                  <button (click)="setLang('en')"
                          [class]="'aq-pill flex-1 justify-center ' + (lang() === 'en' ? 'aq-pill-active' : '')">
                    🇬🇧 English (LTR)
                  </button>
                </div>
              </div>

              <!-- Theme (placeholder for future) -->
              <div>
                <label class="text-xs text-white/60 mb-2 block">{{ 'profile.theme' | translate }}</label>
                <div class="flex gap-2">
                  <button class="aq-pill aq-pill-active flex-1 justify-center">
                    🌙 {{ 'profile.theme_dark' | translate }}
                  </button>
                  <button disabled class="aq-pill flex-1 justify-center opacity-40 cursor-not-allowed">
                    ☀️ {{ 'profile.theme_light' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Security -->
          <section class="glass rounded-2xl p-6">
            <h3 class="text-base font-semibold mb-1">{{ 'profile.security' | translate }}</h3>
            <p class="text-xs text-white/55 mb-5">{{ 'profile.security_desc' | translate }}</p>

            <div class="space-y-3">
              <div class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="font-medium text-sm">{{ 'profile.password' | translate }}</div>
                  <div class="text-xs text-white/55">{{ 'profile.password_desc' | translate }}</div>
                </div>
                <button (click)="changePassword()"
                        class="text-xs px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition shrink-0">
                  {{ 'profile.password_change' | translate }}
                </button>
              </div>

              <div class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="font-medium text-sm">{{ 'profile.mfa' | translate }}</div>
                  <div class="text-xs text-white/55">{{ 'profile.mfa_desc' | translate }}</div>
                </div>
                <span class="aq-badge aq-badge-neutral">{{ 'comingSoon.in_progress' | translate }}</span>
              </div>

              <div class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4 border-red-500/20">
                <div class="min-w-0">
                  <div class="font-medium text-sm text-red-300">{{ 'profile.signout_all' | translate }}</div>
                  <div class="text-xs text-white/55">{{ 'profile.signout_all_desc' | translate }}</div>
                </div>
                <button (click)="auth.logout()"
                        class="text-xs px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition shrink-0
                               border border-red-500/30">
                  {{ 'menu.logout' | translate }}
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- ─── RIGHT : info card ─── -->
        <aside class="space-y-5">
          <div class="glass-strong rounded-2xl p-6 text-center">
            <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-forest-600 to-royal-800
                        border border-white/10 flex items-center justify-center text-3xl font-extrabold mb-4">
              {{ initials() }}
            </div>
            <h3 class="font-bold text-lg">{{ profile()?.fullName }}</h3>
            <p class="text-sm text-white/55 truncate">{{ profile()?.email }}</p>
            <span class="aq-badge aq-badge-info mt-3">{{ shortRole() }}</span>
          </div>

          <div class="glass rounded-2xl p-5">
            <h4 class="text-xs uppercase tracking-wider text-white/50 mb-3">
              {{ 'profile.account_info' | translate }}
            </h4>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.account_id' | translate }}</dt>
                <dd class="font-mono text-xs">#{{ profile()?.id }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.account_provider' | translate }}</dt>
                <dd>Keycloak OIDC</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.last_login' | translate }}</dt>
                <dd class="text-xs">
                  {{ profile()?.lastLoginAt ? (profile()?.lastLoginAt | date:'short') : '—' }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.kc_id' | translate }}</dt>
                <dd class="font-mono text-[10px] text-white/55 truncate max-w-[140px]"
                    [title]="profile()?.kcId">{{ profile()?.kcId }}</dd>
              </div>
            </dl>
          </div>

          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800
                          border border-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     class="w-5 h-5 text-forest-300">
                  <path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold">{{ 'profile.privacy' | translate }}</div>
                <div class="text-xs text-white/55">{{ 'profile.privacy_desc' | translate }}</div>
              </div>
            </div>
            <p class="text-xs text-white/55 leading-relaxed">
              {{ 'profile.privacy_note' | translate }}
            </p>
          </div>
        </aside>
      </div>
    </aq-page-shell>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  auth = inject(AuthService);

  profile = signal<UserProfile | null>(null);
  saving = signal(false);
  lang = signal<'ar' | 'en'>(this.translate.currentLang as 'ar' | 'en' || 'ar');

  form = this.fb.group({
    fullName:      ['', [Validators.required, Validators.maxLength(150)]],
    phone:         ['', Validators.maxLength(30)],
    email:         [{ value: '', disabled: false }],
    preferredLang: ['ar']
  });

  ngOnInit(): void {
    this.api.get<UserProfile>('/users/me').subscribe(p => {
      this.profile.set(p);
      this.form.patchValue({
        fullName: p.fullName,
        phone:    p.phone || '',
        email:    p.email,
        preferredLang: p.preferredLang
      });
      this.lang.set(p.preferredLang);
    });
  }

  initials(): string {
    const n = this.profile()?.fullName || '';
    return n.split(' ').slice(0,2).map(s => s[0] || '').join('').toUpperCase() || '?';
  }

  shortRole(): string {
    return (this.profile()?.role || '').replace('ROLE_', '').replace(/_/g, ' ');
  }

  setLang(l: 'ar' | 'en'): void {
    this.lang.set(l);
    this.form.patchValue({ preferredLang: l });
    this.translate.use(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    this.form.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.api.patch<UserProfile>('/users/me', {
      fullName:      v.fullName,
      phone:         v.phone,
      preferredLang: v.preferredLang
    }).subscribe({
      next: p => {
        this.profile.set(p);
        this.form.markAsPristine();
        this.saving.set(false);
        this.toastr.success(this.translate.instant('profile.saved'));
      },
      error: e => {
        this.saving.set(false);
        this.toastr.error(e?.error?.error || this.translate.instant('register.error'));
      }
    });
  }

  changePassword(): void {
    // Trigger Keycloak's password reset email (the user receives an email
    // and changes the password through the secure Keycloak flow — no redirect
    // away from our app required from a UX perspective other than the email link).
    this.api.post<void>('/users/me/request-password-reset', {}).subscribe({
      next: () => this.toastr.success(this.translate.instant('profile.password_email_sent')),
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }
}
