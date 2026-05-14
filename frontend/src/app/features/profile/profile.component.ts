import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';

type Density = 'comfortable' | 'compact';

interface UserProfile {
  id: number;
  kcId: string;
  email: string;
  fullName: string;
  role: string;
  preferredLang: 'ar' | 'en';
  phone?: string;
  avatarUrl?: string;
  avatarColor?: string;
  jobTitle?: string;
  organization?: string;
  bio?: string;
  timezone?: string;
  dashboardDensity?: Density;
  emailNotifications?: boolean;
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

      <div class="grid xl:grid-cols-[1.35fr_.9fr] gap-6">
        <div class="space-y-5">
          <section class="glass rounded-2xl p-6">
            <div class="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 class="text-base font-semibold">{{ 'profile.personal_identity' | translate }}</h3>
                <p class="text-xs text-white/55 mt-1">{{ 'profile.personal_identity_desc' | translate }}</p>
              </div>
              <span class="aq-badge aq-badge-info">{{ completeness() }}% {{ 'profile.complete' | translate }}</span>
            </div>

            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5">
              <div class="grid md:grid-cols-[180px_1fr] gap-5 items-start">
                <div class="glass-soft rounded-2xl p-4 text-center">
                  <div class="relative w-28 h-28 mx-auto rounded-full overflow-hidden border border-white/10 shadow-xl"
                       [style.background]="avatarBackground()">
                    <img *ngIf="avatarUrl()" [src]="avatarUrl()" alt="Profile picture"
                         class="w-full h-full object-cover" />
                    <div *ngIf="!avatarUrl()" class="w-full h-full flex items-center justify-center text-3xl font-extrabold">
                      {{ initials() }}
                    </div>
                  </div>
                  <label class="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold cursor-pointer transition">
                    {{ 'profile.upload_photo' | translate }}
                    <input type="file" accept="image/*" class="hidden" (change)="pickAvatar($event)" />
                  </label>
                  <button type="button" *ngIf="avatarUrl()" (click)="clearAvatar()"
                          class="block mx-auto mt-2 text-xs text-white/50 hover:text-white transition">
                    {{ 'profile.remove_photo' | translate }}
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label class="block">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'profile.full_name' | translate }}</span>
                    <input formControlName="fullName" class="profile-input" />
                  </label>

                  <label class="block">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'register.phone' | translate }}</span>
                    <input formControlName="phone" class="profile-input" placeholder="+216 ..." />
                  </label>

                  <label class="block">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'profile.job_title' | translate }}</span>
                    <input formControlName="jobTitle" class="profile-input" [placeholder]="'profile.job_title_placeholder' | translate" />
                  </label>

                  <label class="block">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'profile.organization' | translate }}</span>
                    <input formControlName="organization" class="profile-input" [placeholder]="'profile.organization_placeholder' | translate" />
                  </label>

                  <label class="block md:col-span-2">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'register.email' | translate }}</span>
                    <input formControlName="email" readonly class="profile-input opacity-60 cursor-not-allowed" />
                    <span class="text-[11px] text-white/40 mt-1 block">{{ 'profile.email_locked' | translate }}</span>
                  </label>

                  <label class="block md:col-span-2">
                    <span class="text-xs text-white/60 mb-1 block">{{ 'profile.bio' | translate }}</span>
                    <textarea formControlName="bio" rows="3" maxlength="500" class="profile-input resize-none"
                              [placeholder]="'profile.bio_placeholder' | translate"></textarea>
                    <span class="text-[11px] text-white/35">{{ bioLength() }}/500</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-white/10 pt-5">
                <div>
                  <div class="text-xs text-white/60 mb-2">{{ 'profile.avatar_color' | translate }}</div>
                  <div class="flex flex-wrap gap-2">
                    <button *ngFor="let color of avatarColors" type="button"
                            (click)="setAvatarColor(color)"
                            class="w-9 h-9 rounded-full border transition"
                            [class.ring-2]="selectedAvatarColor() === color"
                            [class.ring-forest-300]="selectedAvatarColor() === color"
                            [style.background]="color"
                            [attr.aria-label]="'Use avatar color ' + color">
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" [disabled]="form.invalid || form.pristine || saving()"
                        class="glow-emerald inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold border border-forest-500/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ 'profile.save' | translate }}
                </button>
              </div>
            </form>
          </section>

          <section class="glass rounded-2xl p-6">
            <h3 class="text-base font-semibold">{{ 'profile.personalization' | translate }}</h3>
            <p class="text-xs text-white/55 mt-1 mb-5">{{ 'profile.personalization_desc' | translate }}</p>

            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <label class="text-xs text-white/60 mb-2 block">{{ 'profile.language' | translate }}</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="setLang('en')"
                          [class]="'aq-pill justify-center ' + (lang() === 'en' ? 'aq-pill-active' : '')">
                    {{ 'languages.en' | translate }}
                  </button>
                  <button type="button" (click)="setLang('ar')"
                          [class]="'aq-pill justify-center ' + (lang() === 'ar' ? 'aq-pill-active' : '')">
                    {{ 'languages.ar' | translate }}
                  </button>
                </div>
              </div>

              <label class="block">
                <span class="text-xs text-white/60 mb-2 block">{{ 'profile.timezone' | translate }}</span>
                <select formControlName="timezone" class="profile-input">
                  <option *ngFor="let zone of timezones" [value]="zone.value">{{ timezoneLabel(zone) }}</option>
                </select>
              </label>

              <div>
                <label class="text-xs text-white/60 mb-2 block">{{ 'profile.dashboard_density' | translate }}</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="setDensity('comfortable')"
                          [class]="'aq-pill justify-center ' + (density() === 'comfortable' ? 'aq-pill-active' : '')">
                    {{ 'profile.comfortable' | translate }}
                  </button>
                  <button type="button" (click)="setDensity('compact')"
                          [class]="'aq-pill justify-center ' + (density() === 'compact' ? 'aq-pill-active' : '')">
                    {{ 'profile.compact' | translate }}
                  </button>
                </div>
              </div>

              <label class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer">
                <span>
                  <span class="block text-sm font-semibold">{{ 'profile.email_notifications' | translate }}</span>
                  <span class="block text-xs text-white/50 mt-1">{{ 'profile.email_notifications_desc' | translate }}</span>
                </span>
                <input type="checkbox" formControlName="emailNotifications"
                       class="w-5 h-5 accent-emerald-500 shrink-0" />
              </label>
            </div>
          </section>

          <section class="glass rounded-2xl p-6">
            <h3 class="text-base font-semibold mb-1">{{ 'profile.security' | translate }}</h3>
            <p class="text-xs text-white/55 mb-5">{{ 'profile.security_desc' | translate }}</p>

            <div class="space-y-3">
              <div class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="font-medium text-sm">{{ 'profile.password' | translate }}</div>
                  <div class="text-xs text-white/55">{{ 'profile.password_desc' | translate }}</div>
                </div>
                <button type="button" (click)="changePassword()"
                        class="text-xs px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition shrink-0">
                  {{ 'profile.password_change' | translate }}
                </button>
              </div>

              <div class="glass-soft rounded-xl p-4 flex items-center justify-between gap-4 border-red-500/20">
                <div class="min-w-0">
                  <div class="font-medium text-sm text-red-300">{{ 'profile.signout_all' | translate }}</div>
                  <div class="text-xs text-white/55">{{ 'profile.signout_all_desc' | translate }}</div>
                </div>
                <button type="button" (click)="auth.logout()"
                        class="text-xs px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition shrink-0 border border-red-500/30">
                  {{ 'menu.logout' | translate }}
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside class="space-y-5">
          <section class="glass-strong rounded-2xl p-6">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-full overflow-hidden border border-white/10 shrink-0"
                   [style.background]="avatarBackground()">
                <img *ngIf="avatarUrl()" [src]="avatarUrl()" alt="Profile picture preview"
                     class="w-full h-full object-cover" />
                <div *ngIf="!avatarUrl()" class="w-full h-full flex items-center justify-center text-2xl font-extrabold">
                  {{ initials() }}
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-lg truncate">{{ displayName() }}</h3>
                <p class="text-sm text-white/55 truncate">{{ form.value.jobTitle || shortRole() }}</p>
                <p class="text-xs text-white/40 truncate mt-1">{{ form.value.organization || profile()?.email }}</p>
              </div>
            </div>

            <p class="mt-5 text-sm text-white/65 leading-relaxed min-h-[60px]">
              {{ form.value.bio || ('profile.bio_empty' | translate) }}
            </p>

            <div class="grid grid-cols-2 gap-3 mt-5">
              <div class="glass-soft rounded-xl p-3">
                <div class="text-[11px] uppercase tracking-wider text-white/40">{{ 'profile.language' | translate }}</div>
                <div class="text-sm font-semibold mt-1">{{ (lang() === 'ar' ? 'languages.ar' : 'languages.en') | translate }}</div>
              </div>
              <div class="glass-soft rounded-xl p-3">
                <div class="text-[11px] uppercase tracking-wider text-white/40">{{ 'profile.density' | translate }}</div>
                <div class="text-sm font-semibold mt-1 capitalize">{{ ('profile.' + density()) | translate }}</div>
              </div>
            </div>
          </section>

          <section class="glass rounded-2xl p-5">
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
                <dd>{{ 'profile.auth_provider_value' | translate }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.last_login' | translate }}</dt>
                <dd class="text-xs">{{ profile()?.lastLoginAt ? (profile()?.lastLoginAt | date:'short') : '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/55">{{ 'profile.kc_id' | translate }}</dt>
                <dd class="font-mono text-[10px] text-white/55 truncate max-w-[150px]"
                    [title]="profile()?.kcId">{{ profile()?.kcId }}</dd>
              </div>
            </dl>
          </section>

          <section class="glass rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800 border border-white/10 flex items-center justify-center text-forest-200 font-bold">
                {{ 'profile.identity_badge' | translate }}
              </div>
              <div>
                <div class="text-sm font-semibold">{{ 'profile.privacy' | translate }}</div>
                <div class="text-xs text-white/55">{{ 'profile.privacy_desc' | translate }}</div>
              </div>
            </div>
            <p class="text-xs text-white/55 leading-relaxed">
              {{ 'profile.privacy_note' | translate }}
            </p>
          </section>
        </aside>
      </div>
    </aq-page-shell>
  `,
  styles: [`
    .profile-input {
      width: 100%;
      border-radius: .625rem;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(15,23,42,.42);
      padding: .7rem .85rem;
      color: white;
      font-size: .875rem;
      outline: none;
      transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
    }
    .profile-input:focus {
      border-color: rgba(52,211,153,.45);
      box-shadow: 0 0 0 3px rgba(16,185,129,.14);
      background: rgba(15,23,42,.62);
    }
    select.profile-input option {
      background: #0f172a;
      color: white;
    }
  `]
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

  avatarColors = ['#0f766e', '#1d4ed8', '#7c3aed', '#be123c', '#c2410c', '#334155'];
  timezones = [
    { value: 'Africa/Tunis', labelEn: 'Tunisia - Africa/Tunis', labelAr: '???? - ???????/????' },
    { value: 'Africa/Casablanca', labelEn: 'Morocco - Africa/Casablanca', labelAr: '?????? - ???????/????? ???????' },
    { value: 'Africa/Algiers', labelEn: 'Algeria - Africa/Algiers', labelAr: '??????? - ???????/???????' },
    { value: 'Asia/Riyadh', labelEn: 'Saudi Arabia - Asia/Riyadh', labelAr: '???????? - ????/??????' },
    { value: 'Europe/Paris', labelEn: 'France - Europe/Paris', labelAr: '????? - ??????/?????' },
    { value: 'UTC', labelEn: 'UTC', labelAr: '??????? ???????' }
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', Validators.maxLength(30)],
    email: [{ value: '', disabled: true }],
    avatarUrl: ['', Validators.maxLength(1000000)],
    avatarColor: ['#0f766e', Validators.maxLength(20)],
    jobTitle: ['', Validators.maxLength(120)],
    organization: ['', Validators.maxLength(160)],
    bio: ['', Validators.maxLength(500)],
    preferredLang: ['ar'],
    timezone: ['Africa/Tunis', Validators.maxLength(80)],
    dashboardDensity: ['comfortable'],
    emailNotifications: [true]
  });

  ngOnInit(): void {
    this.api.get<UserProfile>('/users/me').subscribe(p => {
      this.profile.set(p);
      this.form.patchValue({
        fullName: p.fullName,
        phone: p.phone || '',
        email: p.email,
        avatarUrl: p.avatarUrl || '',
        avatarColor: p.avatarColor || '#0f766e',
        jobTitle: p.jobTitle || '',
        organization: p.organization || '',
        bio: p.bio || '',
        preferredLang: p.preferredLang,
        timezone: p.timezone || 'Africa/Tunis',
        dashboardDensity: p.dashboardDensity || 'comfortable',
        emailNotifications: p.emailNotifications ?? true
      });
      this.lang.set(p.preferredLang);
      this.form.markAsPristine();
    });
  }

  initials(): string {
    const n = this.form.value.fullName || this.profile()?.fullName || '';
    return n.split(' ').slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?';
  }

  displayName(): string {
    return this.form.value.fullName || this.profile()?.fullName || 'Your profile';
  }

  shortRole(): string {
    return (this.profile()?.role || '').replace('ROLE_', '').replace(/_/g, ' ');
  }

  avatarUrl(): string {
    return this.form.value.avatarUrl || '';
  }

  selectedAvatarColor(): string {
    return this.form.value.avatarColor || '#0f766e';
  }

  avatarBackground(): string {
    const color = this.selectedAvatarColor();
    return `linear-gradient(135deg, ${color}, #1e3a8a)`;
  }

  density(): Density {
    return (this.form.value.dashboardDensity as Density) || 'comfortable';
  }

  timezoneLabel(zone: { labelEn: string; labelAr: string }): string {
    return this.lang() === 'ar' ? zone.labelAr : zone.labelEn;
  }

  bioLength(): number {
    return (this.form.value.bio || '').length;
  }

  completeness(): number {
    const checks = [
      this.form.value.fullName,
      this.form.value.phone,
      this.form.value.jobTitle,
      this.form.value.organization,
      this.form.value.bio,
      this.form.value.avatarUrl || this.form.value.avatarColor
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
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

  setDensity(density: Density): void {
    this.form.patchValue({ dashboardDensity: density });
    localStorage.setItem('dashboardDensity', density);
    this.form.markAsDirty();
  }

  setAvatarColor(color: string): void {
    this.form.patchValue({ avatarColor: color });
    this.form.markAsDirty();
  }

  pickAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toastr.error(this.translate.instant('profile.avatar_image_error'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.toastr.error(this.translate.instant('profile.avatar_size_error'));
      return;
    }
    this.resizeAvatar(file)
      .then(dataUrl => {
        this.form.patchValue({ avatarUrl: dataUrl });
        this.form.markAsDirty();
      })
      .catch(() => this.toastr.error(this.translate.instant('profile.avatar_image_error')));
  }

  private resizeAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject();
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject();
        image.onload = () => {
          const size = 320;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject();
            return;
          }
          const sourceSize = Math.min(image.width, image.height);
          const sx = (image.width - sourceSize) / 2;
          const sy = (image.height - sourceSize) / 2;
          ctx.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        image.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }

  clearAvatar(): void {
    this.form.patchValue({ avatarUrl: '' });
    this.form.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    if ((v.avatarUrl || '').length > 900000) {
      this.saving.set(false);
      this.toastr.error(this.translate.instant('profile.avatar_size_error'));
      return;
    }
    this.api.patch<UserProfile>('/users/me', {
      fullName: v.fullName,
      phone: v.phone,
      avatarUrl: v.avatarUrl,
      avatarColor: v.avatarColor,
      jobTitle: v.jobTitle,
      organization: v.organization,
      bio: v.bio,
      preferredLang: v.preferredLang,
      timezone: v.timezone,
      dashboardDensity: v.dashboardDensity,
      emailNotifications: v.emailNotifications
    }).subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({
          avatarUrl: p.avatarUrl || '',
          avatarColor: p.avatarColor || '#0f766e',
          jobTitle: p.jobTitle || '',
          organization: p.organization || '',
          bio: p.bio || '',
          timezone: p.timezone || 'Africa/Tunis',
          dashboardDensity: p.dashboardDensity || 'comfortable',
          emailNotifications: p.emailNotifications ?? true
        });
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
    this.api.post<void>('/users/me/request-password-reset', {}).subscribe({
      next: () => this.toastr.success(this.translate.instant('profile.password_email_sent')),
      error: e => this.toastr.error(e?.error?.error || this.translate.instant('register.error'))
    });
  }
}
