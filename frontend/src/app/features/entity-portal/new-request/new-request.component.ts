import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-new-request',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'entity.new_request.title' | translate"
      [subtitle]="'entity.new_request.subtitle' | translate">

      <aq-coming-soon
        feature="3"
        [heading]="t.instant('entity.new_request.title')"
        [description]="t.instant('entity.new_request.desc')"
        icon='<path d="M9 12h6M9 16h6M9 8h.01M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/>'
        sprint="Sprint 4 (M7)"
        [items]="[
          t.instant('entity.new_request.it1'),
          t.instant('entity.new_request.it2'),
          t.instant('entity.new_request.it3'),
          t.instant('entity.new_request.it4')
        ]" />
    </aq-page-shell>
  `
})
export class NewRequestComponent {
  t = inject(TranslateService);
}
