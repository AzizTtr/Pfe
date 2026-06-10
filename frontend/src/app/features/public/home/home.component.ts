import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HeroCrystalDirective } from '../../../shared/hero-crystal/hero-crystal.directive';

interface QuickCard {
  key?: string; route?: string; icon: SafeHtml; tKey: string; dKey: string; badge?: string;
}

interface LeaderboardInstitution {
  rank: number;
  entityName: string;
  city: string;
  country: string;
  averagePercentage: number;
  bestPercentage: number;
  completedRequests: number;
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
            <div class="home-card-icon mb-4">
              <span [innerHTML]="c.icon"></span>
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

    <!-- Institution leaderboard -->
    <section class="mb-12">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h3 class="text-2xl md:text-3xl font-bold">{{ 'home.leaderboard.title' | translate }}</h3>
          <p class="mt-2 max-w-2xl text-sm text-white/55">{{ 'home.leaderboard.subtitle' | translate }}</p>
          <div class="h-1 w-14 mt-2 rounded-full bg-gradient-to-r from-forest-500 to-royal-500"></div>
        </div>
        <span class="leaderboard-live">
          <span class="h-2 w-2 rounded-full bg-forest-300 shadow-[0_0_14px_rgba(52,211,153,.9)]"></span>
          {{ 'home.leaderboard.live' | translate }}
        </span>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[.82fr_1.18fr] gap-4">
        <div class="leaderboard-champion glass card-rim rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <div class="absolute inset-0 pointer-events-none opacity-75"
               style="background: radial-gradient(circle at 18% 12%, rgba(16,185,129,.24), transparent 34%), radial-gradient(circle at 92% 16%, rgba(59,130,246,.22), transparent 38%);"></div>
          <ng-container *ngIf="leaderboard()[0] as top; else noChampion">
            <div class="relative z-10">
              <div class="flex items-center justify-between gap-3">
                <span class="leaderboard-rank">#{{ top.rank }}</span>
                <span class="leaderboard-pill">{{ 'home.leaderboard.best' | translate }} {{ percent(top.bestPercentage) }}</span>
              </div>
              <div class="mt-8 flex items-start gap-4">
                <div class="leaderboard-medal">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m8 2 4 7 4-7"/>
                    <path d="M12 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
                    <path d="m9.5 15.5 1.5 1.5 3.5-4"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="text-xl md:text-2xl font-black text-white leading-tight">{{ top.entityName }}</div>
                  <div class="mt-1 text-sm text-white/55">{{ locationLabel(top) }}</div>
                </div>
              </div>
              <div class="mt-7 grid grid-cols-2 gap-3">
                <div class="leaderboard-stat">
                  <div class="text-[10px] uppercase tracking-wider text-white/42">{{ 'home.leaderboard.average' | translate }}</div>
                  <div class="mt-1 text-3xl font-black gradient-text">{{ percent(top.averagePercentage) }}</div>
                </div>
                <div class="leaderboard-stat">
                  <div class="text-[10px] uppercase tracking-wider text-white/42">{{ 'home.leaderboard.completed' | translate }}</div>
                  <div class="mt-1 text-3xl font-black text-white">{{ top.completedRequests }}</div>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #noChampion>
            <div class="relative z-10 flex min-h-[240px] items-center justify-center text-center text-sm text-white/50">
              {{ leaderboardLoading() ? ('dashboard.loading' | translate) : ('home.leaderboard.empty' | translate) }}
            </div>
          </ng-template>
        </div>

        <div class="leaderboard-table glass card-rim rounded-2xl overflow-hidden">
          <div class="leaderboard-table-head">
            <span>{{ 'home.leaderboard.rank' | translate }}</span>
            <span>{{ 'home.leaderboard.institution' | translate }}</span>
            <span>{{ 'home.leaderboard.average' | translate }}</span>
            <span>{{ 'home.leaderboard.completed' | translate }}</span>
          </div>

          <ng-container *ngIf="leaderboard().length; else leaderboardEmpty">
            <div *ngFor="let row of leaderboard()" class="leaderboard-row">
              <div class="leaderboard-row-rank">#{{ row.rank }}</div>
              <div class="min-w-0">
                <div class="truncate text-sm font-bold text-white">{{ row.entityName }}</div>
                <div class="mt-1 truncate text-xs text-white/45">{{ locationLabel(row) }}</div>
              </div>
              <div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-black text-forest-200">{{ percent(row.averagePercentage) }}</span>
                </div>
                <div class="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-forest-500 to-royal-500"
                       [style.width.%]="scoreBar(row.averagePercentage)"></div>
                </div>
              </div>
              <div class="text-sm font-bold text-white/80">{{ row.completedRequests }}</div>
            </div>
          </ng-container>

          <ng-template #leaderboardEmpty>
            <div class="p-8 text-center text-sm text-white/50">
              {{ leaderboardLoading() ? ('dashboard.loading' | translate) : ('home.leaderboard.empty' | translate) }}
            </div>
          </ng-template>
        </div>
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
            <span class="home-card-icon-sm" [innerHTML]="c.icon"></span>
          </div>
          <div>
            <div class="text-base font-semibold mb-1">{{ c.tKey | translate }}</div>
            <div class="text-sm text-white/55 leading-relaxed">{{ c.dKey | translate }}</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .home-card-icon,
    .home-card-icon-sm {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #6ee7b7;
    }

    .home-card-icon {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: .85rem;
      border: 1px solid rgba(255,255,255,.11);
      background: linear-gradient(135deg, rgba(4,120,87,.78), rgba(29,78,216,.72));
      box-shadow: 0 1px 0 rgba(255,255,255,.06) inset, 0 14px 28px -22px rgba(16,185,129,.7);
    }

    .home-card-icon-sm {
      width: 1.25rem;
      height: 1.25rem;
      color: rgba(255,255,255,.88);
    }

    .home-card-icon :where(svg),
    .home-card-icon-sm :where(svg) {
      width: 1.25rem;
      height: 1.25rem;
      display: block;
    }

    .leaderboard-live {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      border: 1px solid rgba(16,185,129,.22);
      background: rgba(16,185,129,.08);
      color: rgba(209,250,229,.9);
      border-radius: 999px;
      padding: .45rem .75rem;
      font-size: .72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .leaderboard-champion,
    .leaderboard-table {
      border-color: rgba(255,255,255,.095);
      box-shadow: 0 1px 0 rgba(255,255,255,.05) inset, 0 22px 48px -40px rgba(0,0,0,.9);
    }

    .leaderboard-rank,
    .leaderboard-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.065);
    }

    .leaderboard-rank {
      padding: .38rem .7rem;
      color: rgba(167,243,208,.95);
      font-size: .85rem;
      font-weight: 900;
    }

    .leaderboard-pill {
      padding: .35rem .65rem;
      color: rgba(255,255,255,.72);
      font-size: .72rem;
      font-weight: 700;
    }

    .leaderboard-medal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.4rem;
      height: 3.4rem;
      flex: 0 0 auto;
      border-radius: 1.05rem;
      border: 1px solid rgba(255,255,255,.12);
      color: rgba(110,231,183,.95);
      background: linear-gradient(135deg, rgba(4,120,87,.72), rgba(29,78,216,.68));
      box-shadow: 0 18px 42px -28px rgba(16,185,129,.9);
    }

    .leaderboard-medal svg {
      width: 1.65rem;
      height: 1.65rem;
    }

    .leaderboard-stat {
      border: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.045);
      border-radius: 1rem;
      padding: .95rem;
    }

    .leaderboard-table-head,
    .leaderboard-row {
      display: grid;
      grid-template-columns: 4.5rem minmax(0, 1fr) minmax(8rem, .7fr) 6rem;
      align-items: center;
      gap: 1rem;
    }

    .leaderboard-table-head {
      padding: .95rem 1rem;
      color: rgba(255,255,255,.42);
      font-size: .68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .05em;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.035);
    }

    .leaderboard-row {
      min-height: 4.75rem;
      padding: .85rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,.065);
      transition: background .18s ease, transform .18s ease;
    }

    .leaderboard-row:last-child {
      border-bottom: 0;
    }

    .leaderboard-row:hover {
      background: rgba(255,255,255,.045);
      transform: translateY(-1px);
    }

    .leaderboard-row-rank {
      display: inline-flex;
      width: 2.65rem;
      height: 2.35rem;
      align-items: center;
      justify-content: center;
      border-radius: .8rem;
      border: 1px solid rgba(16,185,129,.18);
      background: rgba(16,185,129,.08);
      color: rgba(167,243,208,.95);
      font-weight: 900;
      font-size: .82rem;
    }

    @media (max-width: 760px) {
      .leaderboard-table-head {
        display: none;
      }

      .leaderboard-row {
        grid-template-columns: 3.5rem minmax(0, 1fr);
      }

      .leaderboard-row > :nth-child(3),
      .leaderboard-row > :nth-child(4) {
        grid-column: 2;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);

  leaderboard = signal<LeaderboardInstitution[]>([]);
  leaderboardLoading = signal(false);

  stats = [
    { v: '22',    l: 'home.stats.features'  },
    { v: '5',     l: 'home.stats.roles'     },
    { v: 'AR/EN', l: 'home.stats.languages' },
    { v: '100%',  l: 'home.stats.audit'     }
  ];

  primaryCards: QuickCard[] = [
    { key:'getStarted', route:'/register', tKey:'home.card.getStarted.t', dKey:'home.card.getStarted.d',
      icon:this.icon('<path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"/>'),
      badge: 'NEW' },
    { key:'entities',   route:'/my-requests', tKey:'home.card.entities.t',   dKey:'home.card.entities.d',
      icon:this.icon('<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01"/>') },
    { key:'evaluation', route:'/evaluation',  tKey:'home.card.evaluation.t', dKey:'home.card.evaluation.d',
      icon:this.icon('<path d="M9 11l2 2 4-4"/><path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>') },
    { key:'approvals',  route:'/evaluation',  tKey:'home.card.approvals.t',  dKey:'home.card.approvals.d',
      icon:this.icon('<path d="M12 3 4 7v6c0 4.5 3.4 7.4 8 8 4.6-.6 8-3.5 8-8V7l-8-4Z"/><path d="m9 12 2 2 4-4"/>') },
    { key:'admin',      route:'/admin',       tKey:'home.card.admin.t',      dKey:'home.card.admin.d',
      icon:this.icon('<path d="M4 19V5"/><path d="M8 17v-6"/><path d="M13 17V7"/><path d="M18 17v-3"/><path d="M3 19h18"/>') }
  ];

  secondaryCards = [
    { tKey:'home.card.input.t',       dKey:'home.card.input.d',
      icon:this.icon('<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h10"/><path d="M8 5v14"/><path d="M17 16l3 3 3-3"/>') },
    { tKey:'home.card.collections.t', dKey:'home.card.collections.d',
      icon:this.icon('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/><path d="M7 4v16"/><path d="M17 4v16"/>') },
    { tKey:'home.card.navigation.t',  dKey:'home.card.navigation.d',
      icon:this.icon('<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><path d="m15 16 3-3 3 3"/><path d="M18 13v8"/>') },
    { tKey:'home.card.info.t',        dKey:'home.card.info.d',
      icon:this.icon('<path d="M12 8h.01"/><path d="M11 12h1v4h1"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>') }
  ];

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  private icon(paths: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        ${paths}
      </svg>
    `);
  }

  getStarted(): void {
    if (this.auth.isLoggedIn()) {
      window.location.href = '/dashboard';
    } else {
      this.auth.login();
    }
  }

  percent(value: number | string | null | undefined): string {
    const numeric = Number(value ?? 0);
    return `${Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0'}%`;
  }

  scoreBar(value: number | string | null | undefined): number {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(6, Math.min(100, numeric));
  }

  locationLabel(row: LeaderboardInstitution): string {
    return [row.city, row.country].filter(Boolean).join(', ');
  }

  private loadLeaderboard(): void {
    this.leaderboardLoading.set(true);
    this.api.get<LeaderboardInstitution[]>('/public/leaderboard/institutions').subscribe({
      next: rows => {
        this.leaderboard.set(rows || []);
        this.leaderboardLoading.set(false);
      },
      error: () => {
        this.leaderboard.set([]);
        this.leaderboardLoading.set(false);
      }
    });
  }
}
