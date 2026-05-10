import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-inbox',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'evaluation.inbox.title' | translate"
      [subtitle]="'evaluation.inbox.subtitle' | translate">
      <aq-coming-soon
        feature="7"
        [heading]="t.instant('evaluation.inbox.title')"
        [description]="t.instant('evaluation.inbox.desc')"
        icon='<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'
        sprint="Sprint 5 (M7)"
        [items]="[
          t.instant('evaluation.inbox.it1'),
          t.instant('evaluation.inbox.it2'),
          t.instant('evaluation.inbox.it3'),
          t.instant('evaluation.inbox.it4')
        ]" />
    </aq-page-shell>
  `
})
export class InboxComponent { t = inject(TranslateService); }
