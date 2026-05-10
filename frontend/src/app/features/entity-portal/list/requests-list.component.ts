import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

@Component({
  selector: 'aq-requests-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'entity.requests.title' | translate"
      [subtitle]="'entity.requests.subtitle' | translate">

      <div slot="actions">
        <a routerLink="new"
           class="glow-emerald inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                  border border-forest-500/40 text-sm">
          + {{ 'entity.requests.new' | translate }}
        </a>
      </div>

      <div class="glass rounded-2xl p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-forest-700 to-royal-800
                    flex items-center justify-center border border-white/10">
          <svg class="w-7 h-7 text-forest-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h6"/>
          </svg>
        </div>
        <p class="text-white/60 text-sm">TODO : tableau filtrable des demandes (Feature 4)</p>
      </div>
    </aq-page-shell>
  `
})
export class RequestsListComponent {}
