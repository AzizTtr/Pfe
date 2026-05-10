import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LayoutComponent } from './core/layout/layout.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'aq-root',
  standalone: true,
  imports: [CommonModule, TranslateModule, LayoutComponent],
  template: `<aq-layout></aq-layout>`
})
export class AppComponent implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit(): void {
    this.translate.addLangs(environment.supportedLangs);
    const stored = localStorage.getItem('lang');
    const lang = stored && environment.supportedLangs.includes(stored)
      ? stored
      : environment.defaultLang;
    this.translate.setDefaultLang(environment.defaultLang);
    this.translate.use(lang);
    this.applyDirection(lang);
  }

  private applyDirection(lang: string): void {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
