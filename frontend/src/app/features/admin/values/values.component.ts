import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-admin-values',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'admin.values.title' | translate"
      [subtitle]="'admin.values.subtitle' | translate">

      <!-- Preview of current values from seed data -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <div *ngFor="let v of values" class="glass rounded-xl p-4 text-center">
          <div class="text-3xl font-extrabold gradient-text mb-1">{{ v.code }}</div>
          <div class="text-xs text-white/55 mb-2">{{ v.label }}</div>
          <div class="aq-badge aq-badge-info">{{ v.score }} pts</div>
        </div>
      </div>

      <aq-coming-soon
        feature="18"
        [heading]="t.instant('admin.values.title')"
        [description]="t.instant('admin.values.subtitle')"
        icon='<path d="M11 17a4 4 0 01-8 0 4 4 0 018 0zM21 17a4 4 0 11-8 0 4 4 0 018 0zM21 7a4 4 0 11-8 0 4 4 0 018 0zM11 7a4 4 0 11-8 0 4 4 0 018 0z"/>'
        sprint="Sprint 3 (M6)"
        [items]="[
          t.instant('admin.values.it1'),
          t.instant('admin.values.it2'),
          t.instant('admin.values.it3'),
          t.instant('admin.values.it4')
        ]" />
    </aq-page-shell>
  `
})
export class ValuesComponent {
  t = inject(TranslateService);
  values = [
    { code: 'A', label: 'مطابق تمامًا',  score: 4 },
    { code: 'B', label: 'مطابق إلى حد كبير', score: 3 },
    { code: 'C', label: 'مطابق جزئيًا',     score: 2 },
    { code: 'D', label: 'غير مطابق',          score: 1 }
  ];
}
