import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';

interface NavItem {
  id: string;
  route: string;
  labelKey: string;
  icon: string;          // SVG inner markup
  roles?: string[];      // visible only for these realm roles
}

/**
 * Layout global — sidebar glassmorphism + zone de contenu.
 */
@Component({
  selector: 'aq-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslateModule],
  template: `
    <!-- Sidebar -->
    <aside class="glass-strong fixed top-4 bottom-4 w-64 rounded-3xl flex flex-col z-30
                  ltr:left-4 rtl:right-4 hidden md:flex">

      <!-- Brand -->
      <div class="px-5 pt-6 pb-5 flex items-center gap-3 border-b border-white/5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-royal-700
                    flex items-center justify-center shadow-lg shadow-forest-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
               class="w-5 h-5 text-white">
            <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z"/>
          </svg>
        </div>
        <div class="leading-tight">
          <div class="text-sm font-bold tracking-wide">Arabic Quality</div>
          <div class="text-[10px] uppercase tracking-[0.2em] text-white/50">Platform</div>
        </div>
      </div>

      <!-- Live status -->
      <div class="px-5 pt-4">
        <div class="glass rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
          <span class="live-dot animate-pulse-soft text-white/80">
            {{ 'menu.live' | translate }}
          </span>
          <span class="text-white/50">v0.1</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <a *ngFor="let it of visibleNav()"
           [routerLink]="it.route"
           routerLinkActive="aq-active"
           [routerLinkActiveOptions]="{ exact: it.route === '/home' }"
           class="aq-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
               class="w-5 h-5 shrink-0" [innerHTML]="it.icon"></svg>
          <span class="text-sm font-medium">{{ it.labelKey | translate }}</span>
        </a>
      </nav>

      <!-- Toolbar -->
      <div class="px-3 pb-3 space-y-1 border-t border-white/5 pt-3">
        <button class="aq-nav-item w-full" (click)="toggleLang()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
               class="w-5 h-5">
            <path d="M3 5h12M9 3v2m1.05 12L6 21M21 21l-4-9-4 9M9 7h6a4 4 0 010 8h-4M5 9c0 1.5 2 4 5 6"/>
          </svg>
          <span class="text-sm font-medium">
            {{ currentLang() === 'ar' ? 'English' : 'العربية' }}
          </span>
          <span class="ms-auto text-[10px] uppercase tracking-wider text-white/40">{{ currentLang() }}</span>
        </button>

        <ng-container *ngIf="auth.isLoggedIn(); else loginBtn">
          <a routerLink="/profile" routerLinkActive="aq-active" class="aq-nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-sm font-medium truncate">{{ auth.getUsername() || ('menu.profile' | translate) }}</span>
          </a>
          <button class="aq-nav-item w-full" (click)="auth.logout()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="text-sm font-medium">{{ 'menu.logout' | translate }}</span>
          </button>
        </ng-container>
        <ng-template #loginBtn>
          <button class="aq-nav-item w-full text-forest-300 hover:text-forest-300" (click)="auth.login()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5">
              <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-6 4v1a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3h-4a3 3 0 00-3 3v1"/>
            </svg>
            <span class="text-sm font-semibold">{{ 'menu.login' | translate }}</span>
          </button>
        </ng-template>
      </div>
    </aside>

    <!-- Mobile top bar (visible only < md) -->
    <header class="glass-strong md:hidden fixed top-2 left-2 right-2 rounded-2xl z-30 flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-500 to-royal-700"></div>
        <span class="text-sm font-semibold">Arabic Quality</span>
      </div>
      <button (click)="mobileOpen.set(!mobileOpen())" class="p-2 rounded-lg hover:bg-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             class="w-5 h-5">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </header>

    <!-- Mobile drawer -->
    <div *ngIf="mobileOpen()" (click)="mobileOpen.set(false)"
         class="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex">
      <div class="glass-strong h-full w-72 ltr:ml-0 rtl:ml-auto p-4 space-y-2" (click)="$event.stopPropagation()">
        <a *ngFor="let it of visibleNav()"
           [routerLink]="it.route"
           (click)="mobileOpen.set(false)"
           routerLinkActive="aq-active"
           class="aq-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
               class="w-5 h-5 shrink-0" [innerHTML]="it.icon"></svg>
          <span class="text-sm">{{ it.labelKey | translate }}</span>
        </a>
      </div>
    </div>

    <!-- Main content -->
    <main class="ltr:md:pl-72 rtl:md:pr-72 px-4 md:px-6 pt-20 md:pt-6 pb-6 max-w-[1500px] mx-auto relative z-10">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .aq-nav-item {
      display: flex; align-items: center; gap: .75rem;
      padding: .625rem .75rem; border-radius: .75rem;
      color: rgba(255,255,255,.65); transition: all .2s ease;
      position: relative;
    }
    .aq-nav-item:hover {
      color: #fff;
      background: rgba(255,255,255,.05);
    }
    .aq-nav-item.aq-active {
      color: #fff;
      background: linear-gradient(135deg, rgba(4,120,87,0.35), rgba(30,58,138,0.35));
      border: 1px solid rgba(255,255,255,0.10);
    }
    .aq-nav-item.aq-active::before {
      content: ''; position: absolute; top: 50%; transform: translateY(-50%);
      width: 4px; height: 24px; border-radius: 4px;
      background: linear-gradient(180deg, #10b981, #3b82f6);
    }
    [dir='ltr'] .aq-nav-item.aq-active::before { left: 0; }
    [dir='rtl'] .aq-nav-item.aq-active::before { right: 0; }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  private translate = inject(TranslateService);

  mobileOpen = signal(false);
  currentLang = signal<'ar' | 'en'>(this.translate.currentLang as 'ar' | 'en' || 'ar');

  navItems: NavItem[] = [
    { id: 'home',     route: '/home',         labelKey: 'menu.home',
      icon: '<path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-7h6v7h3a1 1 0 001-1V10"/>' },
    { id: 'requests', route: '/my-requests',  labelKey: 'menu.my_requests',
      icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h6"/>',
      roles: ['ROLE_ENTITY_MANAGER'] },
    { id: 'evaluation', route: '/evaluation', labelKey: 'menu.evaluation',
      icon: '<path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      roles: ['ROLE_EVALUATOR', 'ROLE_ADMIN_REVIEWER', 'ROLE_FIELD_REVIEWER'] },
    { id: 'registrations', route: '/admin/registrations', labelKey: 'menu.registrations',
      icon: '<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>',
      roles: ['ROLE_PLATFORM_ADMIN'] },
    { id: 'admin',    route: '/admin',        labelKey: 'menu.admin',
      icon: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
      roles: ['ROLE_PLATFORM_ADMIN'] },
    { id: 'dashboard', route: '/dashboard',   labelKey: 'menu.dashboard',
      icon: '<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>' }
  ];

  visibleNav(): NavItem[] {
    const userRoles = this.auth.isLoggedIn() ? this.auth.getRoles() : [];
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      if (!this.auth.isLoggedIn()) return false;
      return item.roles.some(r => userRoles.includes(r));
    });
  }

  toggleLang(): void {
    const next = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.translate.use(next);
    this.currentLang.set(next);
    localStorage.setItem('lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
  }
}
