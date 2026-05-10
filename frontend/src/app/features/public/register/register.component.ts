import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

@Component({
  selector: 'aq-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, PageShellComponent
  ],
  template: `
    <aq-page-shell [title]="'register.title' | translate" [subtitle]="'register.subtitle' | translate">
      <div class="grid lg:grid-cols-[1fr_360px] gap-6">
        <!-- Form -->
        <div class="glass rounded-2xl p-6 md:p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
            <mat-form-field appearance="fill" class="md:col-span-2">
              <mat-label>{{ 'register.entity_name' | translate }}</mat-label>
              <input matInput formControlName="entityName" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="md:col-span-2">
              <mat-label>{{ 'register.manager_name' | translate }}</mat-label>
              <input matInput formControlName="managerName" required>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>{{ 'register.country' | translate }}</mat-label>
              <input matInput formControlName="country" required>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'register.city' | translate }}</mat-label>
              <input matInput formControlName="city" required>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>{{ 'register.email' | translate }}</mat-label>
              <input matInput type="email" formControlName="email" required>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'register.phone' | translate }}</mat-label>
              <input matInput formControlName="phone" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="md:col-span-2">
              <mat-label>{{ 'register.description' | translate }}</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="md:col-span-2 mt-3">
              <button type="submit"
                      [disabled]="form.invalid || submitting"
                      class="glow-emerald inline-flex items-center gap-2 px-6 py-3 rounded-xl
                             bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                             border border-forest-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'register.submit' | translate }}
                <svg class="w-4 h-4 icon-mirror" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Info side panel -->
        <aside class="glass rounded-2xl p-6 h-fit sticky top-6">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800
                      border border-white/10 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-forest-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>
            </svg>
          </div>
          <h3 class="font-semibold mb-2">{{ 'home.badge' | translate }}</h3>
          <p class="text-sm text-white/65 leading-relaxed">
            {{ 'home.subtitle' | translate }}
          </p>
        </aside>
      </div>
    </aq-page-shell>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  submitting = false;

  form = this.fb.group({
    entityName:  ['', [Validators.required, Validators.maxLength(200)]],
    managerName: ['', [Validators.required, Validators.maxLength(150)]],
    country:     ['', Validators.required],
    city:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phone:       ['', [Validators.required, Validators.maxLength(30)]],
    description: ['']
  });

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    this.api.post<number>('/public/registration-requests', this.form.value).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('register.success'));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastr.error(err?.error || this.translate.instant('register.error'));
        this.submitting = false;
      }
    });
  }
}
