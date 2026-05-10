import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-admin-assignments',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'admin.assignments.title' | translate"
      [subtitle]="'admin.assignments.subtitle' | translate">

      <aq-coming-soon
        feature="19"
        [heading]="t.instant('admin.assignments.title')"
        [description]="t.instant('admin.assignments.subtitle')"
        icon='<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M12 11l2 2 4-4M9 16l1 1 3-3"/>'
        sprint="Sprint 5 (M7)"
        [items]="[
          t.instant('admin.assignments.it1'),
          t.instant('admin.assignments.it2'),
          t.instant('admin.assignments.it3'),
          t.instant('admin.assignments.it4')
        ]" />
    </aq-page-shell>
  `
})
export class AssignmentsComponent {
  t = inject(TranslateService);
}
