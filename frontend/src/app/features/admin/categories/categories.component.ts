import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-admin-categories',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'admin.categories.title' | translate"
      [subtitle]="'admin.categories.subtitle' | translate">

      <aq-coming-soon
        feature="16"
        [heading]="t.instant('admin.categories.title')"
        [description]="t.instant('admin.categories.subtitle')"
        icon='<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>'
        sprint="Sprint 3 (M6)"
        [items]="[
          t.instant('admin.categories.it1'),
          t.instant('admin.categories.it2'),
          t.instant('admin.categories.it3'),
          t.instant('admin.categories.it4')
        ]" />
    </aq-page-shell>
  `
})
export class CategoriesComponent {
  t = inject(TranslateService);
}
