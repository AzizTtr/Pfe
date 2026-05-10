import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * État "Coming soon" pour les pages dont la logique métier
 * sera implémentée dans les sprints suivants.
 *
 * Affiche un visuel propre avec :
 *  - icône SVG large
 *  - titre + numéro de feature
 *  - description du module
 *  - liste des sous-fonctionnalités prévues
 *  - badge "in progress" / "planned"
 */
@Component({
  selector: 'aq-coming-soon',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="glass rounded-2xl p-8 md:p-12 relative overflow-hidden">
      <!-- Decorative orb -->
      <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-15 blur-3xl
                  bg-gradient-to-br from-forest-500 to-royal-700 pointer-events-none"></div>

      <div class="relative z-10 grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
        <!-- Icon -->
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-forest-700 to-royal-800
                    border border-white/10 flex items-center justify-center shadow-xl shadow-black/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
               class="w-8 h-8 md:w-10 md:h-10 text-forest-300" [innerHTML]="icon"></svg>
        </div>

        <!-- Content -->
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="aq-badge aq-badge-info">F{{ feature }}</span>
            <span class="aq-badge aq-badge-warning">{{ statusKey | translate }}</span>
          </div>

          <h2 class="text-xl md:text-2xl font-bold mb-2">{{ heading }}</h2>
          <p class="text-sm md:text-base text-white/65 leading-relaxed mb-5 max-w-2xl">
            {{ description }}
          </p>

          <!-- Planned items -->
          <ul *ngIf="items?.length" class="space-y-2">
            <li *ngFor="let it of items" class="flex items-start gap-3 text-sm text-white/75">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="w-4 h-4 text-forest-300 mt-0.5 shrink-0">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              <span>{{ it }}</span>
            </li>
          </ul>

          <!-- Sprint info -->
          <div *ngIf="sprint" class="mt-5 inline-flex items-center gap-2 text-[11px] text-white/45">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-3.5 h-3.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ 'comingSoon.scheduled' | translate }} · {{ sprint }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComingSoonComponent {
  @Input() feature = '';
  @Input() heading = '';
  @Input() description = '';
  @Input() icon = '<path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"/>';
  @Input() items: string[] = [];
  @Input() sprint = '';
  @Input() statusKey = 'comingSoon.in_progress';
}
