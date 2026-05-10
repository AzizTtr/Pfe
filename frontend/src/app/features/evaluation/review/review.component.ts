import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-review',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'evaluation.review.title' | translate"
      [subtitle]="'evaluation.review.subtitle' | translate">
      <aq-coming-soon
        feature="8 + 9 + 10"
        [heading]="t.instant('evaluation.review.title')"
        [description]="t.instant('evaluation.review.desc')"
        icon='<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.8a2 2 0 112.81 2.81L11.83 14.61a4 4 0 01-1.91 1.06l-2.71.6.6-2.71a4 4 0 011.06-1.91l8.72-8.72z"/>'
        sprint="Sprint 5 (M7)"
        [items]="[
          t.instant('evaluation.review.it1'),
          t.instant('evaluation.review.it2'),
          t.instant('evaluation.review.it3'),
          t.instant('evaluation.review.it4')
        ]" />
    </aq-page-shell>
  `
})
export class ReviewComponent { t = inject(TranslateService); }
