import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-admin-questions',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'admin.questions.title' | translate"
      [subtitle]="'admin.questions.subtitle' | translate">

      <aq-coming-soon
        feature="17"
        [heading]="t.instant('admin.questions.title')"
        [description]="t.instant('admin.questions.subtitle')"
        icon='<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        sprint="Sprint 3 (M6)"
        [items]="[
          t.instant('admin.questions.it1'),
          t.instant('admin.questions.it2'),
          t.instant('admin.questions.it3'),
          t.instant('admin.questions.it4')
        ]" />
    </aq-page-shell>
  `
})
export class QuestionsComponent {
  t = inject(TranslateService);
}
