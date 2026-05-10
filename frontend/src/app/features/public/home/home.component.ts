import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { HeroCrystalDirective } from '../../../shared/hero-crystal/hero-crystal.directive';

interface QuickCard {
  key: string; route: string; icon: string; tKey: string; dKey: string; badge?: string;
}

@Component({
  selector: 'aq-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, HeroCrystalDirective],
  template: `
    <!-- Hero -->
    <section class="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center mb-16 mt-2">
      <div>
        <div class="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-forest-300">
            <path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>
          </svg>
          <span class="text-white/80">{{ 'home.badge' | translate }}</span>
          <span class="text-white/40">·</span>
          <span class="text-forest-300">{{ 'menu.live' | translate }}</span>
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-2">
          <span class="gradient-text">{{ 'home.title' | translate }}</span>
        </h1>
        <h2 class="text-2xl md:text-3xl font-semibold text-white/85 mb-6">
          {{ 'home.title2' | translate }}
        </h2>

        <p class="text-base md:text-lg text-white/65 max-w-xl mb-8 leading-relaxed">
          {{ 'home.subtitle' | translate }}
        </p>

        <div class="flex flex-wrap gap-3">
          <button class="glow-emerald inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold
                         border border-forest-500/40"
                  (click)="getStarted()">
            {{ 'home.cta' | translate }}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 icon-mirror">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
          <a routerLink="/register"
             class="glass inline-flex items-center gap-2 px-6 py-3 rounded-xl
                    text-white/85 hover:text-white hover:bg-white/10 font-medium transition">
            {{ 'home.secondary_cta' | translate }}
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3 mt-10 max-w-xl">
          <div *ngFor="let s of stats" class="glass rounded-xl p-3 text-center">
            <div class="text-lg md:text-xl font-bold gradient-text">{{ s.v }}</div>
            <div class="text-[10px] uppercase tracking-wider text-white/55 mt-1">{{ s.l | translate }}</div>
          </div>
        </div>
      </div>

      <!-- 3D crystal -->
      <div class="relative aspect-square max-w-[520px] mx-auto w-full">
        <div class="absolute inset-0 glass rounded-[2rem] overflow-hidden">
          <div aqHeroCrystal class="w-full h-full"></div>
          <div class="absolute inset-0 pointer-events-none rounded-[2rem]"
               style="background: radial-gradient(120% 80% at 50% 100%, rgba(16,185,129,0.15), transparent 60%);"></div>
        </div>
        <!-- Floating chips -->
        <div class="absolute -top-3 ltr:-left-3 rtl:-right-3 glass rounded-2xl px-3 py-2 flex items-center gap-2 text-xs animate-float">
          <svg class="w-4 h-4 text-forest-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-white/85">A · B · C · D</span>
        </div>
        <div class="absolute -bottom-3 ltr:-right-3 rtl:-left-3 glass rounded-2xl px-3 py-2 flex items-center gap-2 text-xs animate-float">
          <svg class="w-4 h-4 text-royal-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="text-white/85">PDF · Excel</span>
        </div>
      </div>
    </section>

    <!-- Quick access -->
    <section class="mb-12">
      <div class="flex items-end justify-between mb-5">
        <div>
          <h3 class="text-2xl md:text-3xl font-bold">{{ 'home.section_quick' | translate }}</h3>
          <div class="h-1 w-14 mt-2 rounded-full bg-gradient-to-r from-forest-500 to-royal-500"></div>
        </div>
        <span class="text-xs text-white/50">5 / 22</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <a *ngFor="let c of primaryCards"
           [routerLink]="c.route"
           class="card-rim group glass rounded-2xl p-5 cursor-pointer transition-all
                  hover:-translate-y-1 hover:bg-slate-800/40 relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-3xl
                      bg-gradient-to-br from-forest-500 to-royal-600 group-hover:opacity-40 transition-opacity"></div>
          <div class="relative z-10">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-forest-700 to-royal-800
                        border border-white/10 flex items-center justify-center mb-4
                        shadow-lg shadow-black/20">
              <svg class="w-5 h-5 text-forest-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                   stroke-linejoin="round" [innerHTML]="c.icon"></svg>
            </div>
            <span *ngIf="c.badge"
                  class="absolute top-0 ltr:right-0 rtl:left-0 text-[10px] font-bold uppercase tracking-wider
                         px-2 py-1 rounded-full bg-forest-500/20 text-forest-300 border border-forest-500/30">
              {{ c.badge }}
            </span>
            <div class="text-base font-semibold mb-1">{{ c.tKey | translate }}</div>
            <div class="text-sm text-white/55 leading-relaxed">{{ c.dKey | translate }}</div>
          </div>
        </a>
      </div>
    </section>

    <!-- Components -->
    <section class="mb-12">
      <div class="flex items-end justify-between mb-5">
        <div>
          <h3 class="text-2xl md:text-3xl font-bold">{{ 'home.section_components' | translate }}</h3>
          <div class="h-1 w-14 mt-2 rounded-full bg-gradient-to-r from-royal-500 to-forest-500"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let c of secondaryCards"
             class="card-rim group glass rounded-2xl p-5 transition-all
                    hover:-translate-y-1 hover:bg-slate-800/40 flex items-start gap-4">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-royal-800 to-forest-800
                      border border-white/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-white/85" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                 stroke-linejoin="round" [innerHTML]="c.icon"></svg>
          </div>
          <div>
            <div class="text-base font-semibold mb-1">{{ c.tKey | translate }}</div>
            <div class="text-sm text-white/55 leading-relaxed">{{ c.dKey | translate }}</div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {
  private auth = inject(AuthService);

  stats = [
    { v: '22',    l: 'home.stats.features'  },
    { v: '5',     l: 'home.stats.roles'     },
    { v: 'AR/EN', l: 'home.stats.languages' },
    { v: '100%',  l: 'home.stats.audit'     }
  ];

  primaryCards: QuickCard[] = [
    { key:'getStarted', route:'/register', tKey:'home.card.getStarted.t', dKey:'home.card.getStarted.d',
      icon:'<path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"/>',
      badge: 'NEW' },
    { key:'entities',   route:'/my-requests', tKey:'home.card.entities.t',   dKey:'home.card.entities.d',
      icon:'<path d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.42a12 12 0 01.66 6.48A12 12 0 0012 20a12 12 0 00-6.82-3 12 12 0 01.66-6.48L12 14zM12 14v7"/>' },
    { key:'evaluation', route:'/evaluation',  tKey:'home.card.evaluation.t', dKey:'home.card.evaluation.d',
      icon:'<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a3 3 0 015.36-1.86M13 7a4 4 0 11-8 0 4 4 0 018 0zM21 13a4 4 0 11-8 0 4 4 0 018 0z"/>' },
    { key:'approvals',  route:'/evaluation',  tKey:'home.card.approvals.t',  dKey:'home.card.approvals.d',
      icon:'<path d="M9 12l2 2 4-4m5.62-4A11.96 11.96 0 0112 2.94 11.96 11.96 0 013.38 6 12 12 0 003 9c0 5.6 3.82 10.3 9 11.62C17.18 19.3 21 14.6 21 9c0-1-.13-2.05-.38-3z"/>' },
    { key:'admin',      route:'/admin',       tKey:'home.card.admin.t',      dKey:'home.card.admin.d',
      icon:'<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' }
  ];

  secondaryCards = [
    { tKey:'home.card.input.t',       dKey:'home.card.input.d',
      icon:'<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>' },
    { tKey:'home.card.collections.t', dKey:'home.card.collections.d',
      icon:'<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>' },
    { tKey:'home.card.navigation.t',  dKey:'home.card.navigation.d',
      icon:'<path d="M3 11h2a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v3M8 4v1.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1M15 20.5V18a2 2 0 012-2h3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    { tKey:'home.card.info.t',        dKey:'home.card.info.d',
      icon:'<path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.16V11a6 6 0 00-4-5.66V5a2 2 0 10-4 0v.34A6 6 0 006 11v3.16c0 .54-.21 1.05-.6 1.44L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>' }
  ];

  getStarted(): void {
    if (this.auth.isLoggedIn()) {
      window.location.href = '/dashboard';
    } else {
      this.auth.login();
    }
  }
}
