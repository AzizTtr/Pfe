import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Carte glassmorphism réutilisable.
 *  - title (optionnel) en gradient
 *  - icon (optionnel) — SVG path passé en string
 *  - hover : lift + ring gradient
 */
@Component({
  selector: 'aq-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-rim glass rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800/40 relative overflow-hidden"
         [class.cursor-pointer]="clickable">
      <div *ngIf="orb" class="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-3xl
                              bg-gradient-to-br from-forest-500 to-royal-600 group-hover:opacity-40 transition-opacity"></div>

      <div class="relative z-10">
        <div *ngIf="title || icon" class="flex items-start gap-4 mb-3">
          <div *ngIf="icon"
               class="w-11 h-11 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800 border border-white/10
                      flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5 text-forest-300" [innerHTML]="icon"></svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 *ngIf="title" class="text-base md:text-lg font-semibold">{{ title }}</h3>
            <p *ngIf="subtitle" class="text-sm text-white/55 mt-1">{{ subtitle }}</p>
          </div>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;       // SVG inner markup
  @Input() clickable = false;
  @Input() orb = false;         // gradient halo background
}
