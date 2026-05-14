import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';

@Component({
  selector: 'aq-admin-audit',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageShellComponent, ComingSoonComponent],
  template: `
    <aq-page-shell
      [title]="'admin.audit.title' | translate"
      [subtitle]="'admin.audit.subtitle' | translate">

      <div class="glass rounded-2xl p-5 mb-4 flex items-center gap-3">
        <span class="aq-badge aq-badge-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="w-3 h-3"><path d="M5 13l4 4L19 7"/></svg>
          {{ 'admin.audit.aop_active' | translate }}
        </span>
        <p class="text-sm text-white/65">
          {{ 'admin.audit.aop_note' | translate }}
        </p>
      </div>

      <aq-coming-soon
        feature="20"
        [heading]="t.instant('admin.audit.title')"
        [description]="t.instant('admin.audit.subtitle')"
        icon='<path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>'
        [sprint]="t.instant('sprints.sprint7_m7')"
        [items]="[
          t.instant('admin.audit.it1'),
          t.instant('admin.audit.it2'),
          t.instant('admin.audit.it3'),
          t.instant('admin.audit.it4')
        ]" />
    </aq-page-shell>
  `
})
export class AuditComponent {
  t = inject(TranslateService);
}
