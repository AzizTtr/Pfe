import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Wrapper standard pour toute page interne.
 * Affiche un titre en gradient + un divider + un slot de contenu.
 *
 * Usage :
 *   <aq-page-shell title="Mon titre" subtitle="Optionnel">
 *     <ng-template #actions>...</ng-template>   <!-- droite du header -->
 *     contenu de la page
 *   </aq-page-shell>
 */
@Component({
  selector: 'aq-page-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative">
      <header class="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold gradient-text leading-tight">{{ title }}</h1>
          <div class="aq-divider mt-2.5"></div>
          <p *ngIf="subtitle" class="text-sm text-white/60 mt-3 max-w-2xl leading-relaxed">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </header>

      <div class="space-y-6">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class PageShellComponent {
  @Input() title = '';
  @Input() subtitle?: string;
}
