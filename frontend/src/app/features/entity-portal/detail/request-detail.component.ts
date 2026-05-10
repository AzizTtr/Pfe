import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-request-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'entity.request_detail.title' | translate"
      [subtitle]="'entity.request_detail.subtitle' | translate">
      <aq-coming-soon
        feature="4 + 6"
        [heading]="t.instant('entity.request_detail.title')"
        [description]="t.instant('entity.request_detail.desc')"
        icon='<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>'
        sprint="Sprint 4-6"
        [items]="[
          t.instant('entity.request_detail.it1'),
          t.instant('entity.request_detail.it2'),
          t.instant('entity.request_detail.it3'),
          t.instant('entity.request_detail.it4')
        ]" />
    </aq-page-shell>
  `
})
export class RequestDetailComponent { t = inject(TranslateService); }
