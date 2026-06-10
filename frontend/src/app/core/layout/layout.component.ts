import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';

interface NavItem {
  id: string;
  route: string;
  labelKey: string;
  icon: SafeHtml;
  roles?: string[];      // visible only for these realm roles
}

interface NotificationItem {
  id: number;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Layout global — sidebar glassmorphism + zone de contenu.
 */
@Component({
  selector: 'aq-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslateModule, AiChatbotComponent],
  template: `
    <!-- Sidebar -->
    <aside class="glass-strong fixed top-4 bottom-4 w-[17rem] rounded-3xl flex flex-col z-30
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
          <div class="text-sm font-bold tracking-wide">{{ 'menu.brand' | translate }}</div>
          <div class="text-[10px] uppercase tracking-[0.2em] text-white/50">{{ 'menu.platform' | translate }}</div>
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
      <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <a *ngFor="let it of visibleNav()"
           [routerLink]="it.route"
           routerLinkActive="aq-active"
           [routerLinkActiveOptions]="{ exact: it.route === '/home' }"
           class="aq-nav-item">
          <span class="aq-nav-icon" [innerHTML]="it.icon"></span>
          <span class="text-sm font-medium">{{ it.labelKey | translate }}</span>
        </a>
      </nav>

      <!-- Toolbar -->
      <div class="px-3 pb-3 space-y-1 border-t border-white/5 pt-3">
        <button class="aq-nav-item w-full" (click)="toggleLang()">
          <span class="aq-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                 class="w-[18px] h-[18px]">
              <path d="M3 5h12M9 3v2m1.05 12L6 21M21 21l-4-9-4 9M9 7h6a4 4 0 010 8h-4M5 9c0 1.5 2 4 5 6"/>
            </svg>
          </span>
          <span class="text-sm font-medium">
            {{ 'menu.change_language' | translate }}
          </span>
          <span class="ms-auto text-[10px] uppercase tracking-wider text-white/40">{{ currentLang() }}</span>
        </button>

        <ng-container *ngIf="auth.isLoggedIn(); else loginBtn">
          <button class="aq-nav-item w-full" (click)="toggleNotifications()">
            <span class="aq-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                   class="w-[18px] h-[18px]">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"/>
              </svg>
            </span>
            <span class="text-sm font-medium">{{ 'notifications.title' | translate }}</span>
            <span *ngIf="unread() > 0" class="ms-auto text-[10px] px-2 py-0.5 rounded-full bg-forest-500 text-white">{{ unread() }}</span>
          </button>

          <div *ngIf="notificationsOpen()" class="glass rounded-2xl p-3 max-h-80 overflow-y-auto">
            <div class="flex items-center justify-between gap-3 mb-2">
              <span class="text-xs font-semibold text-white/70">{{ 'notifications.title' | translate }}</span>
              <button class="text-[11px] text-forest-300 hover:text-forest-200" (click)="markAllRead()">
                {{ 'notifications.mark_all' | translate }}
              </button>
            </div>
            <div *ngIf="notifications().length === 0" class="text-xs text-white/45 py-4 text-center">
              {{ 'notifications.empty' | translate }}
            </div>
            <button *ngFor="let n of notifications()"
                    class="w-full text-start rounded-xl p-3 mb-2 border border-white/10 hover:bg-white/5"
                    [ngClass]="!n.read ? 'bg-white/5' : ''"
                    (click)="openNotification(n)">
              <div class="text-sm font-semibold">{{ notificationTitle(n) }}</div>
              <div class="text-xs text-white/55 mt-1 line-clamp-2">{{ notificationMessage(n) }}</div>
            </button>
          </div>

          <a routerLink="/profile" routerLinkActive="aq-active" class="aq-nav-item">
            <span class="aq-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                   class="w-[18px] h-[18px]">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </span>
            <span class="text-sm font-medium truncate">{{ auth.getUsername() || ('menu.profile' | translate) }}</span>
          </a>
          <button class="aq-nav-item w-full" (click)="auth.logout()">
            <span class="aq-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                   class="w-[18px] h-[18px]">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </span>
            <span class="text-sm font-medium">{{ 'menu.logout' | translate }}</span>
          </button>
        </ng-container>
        <ng-template #loginBtn>
          <button class="aq-nav-item w-full text-forest-300 hover:text-forest-300" (click)="auth.login()">
            <span class="aq-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                   class="w-[18px] h-[18px]">
                <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-6 4v1a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3h-4a3 3 0 00-3 3v1"/>
              </svg>
            </span>
            <span class="text-sm font-semibold">{{ 'menu.login' | translate }}</span>
          </button>
        </ng-template>
      </div>
    </aside>

    <!-- Mobile top bar (visible only < md) -->
    <header class="glass-strong md:hidden fixed top-2 left-2 right-2 rounded-2xl z-30 flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-500 to-royal-700"></div>
        <span class="text-sm font-semibold">{{ 'menu.brand' | translate }}</span>
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
          <span class="aq-nav-icon" [innerHTML]="it.icon"></span>
          <span class="text-sm">{{ it.labelKey | translate }}</span>
        </a>
      </div>
    </div>

    <!-- Main content -->
    <main class="ltr:md:pl-[18.5rem] rtl:md:pr-[18.5rem] px-4 md:px-6 pt-20 md:pt-6 pb-6 max-w-[1500px] mx-auto relative z-10">
      <router-outlet />
    </main>

    <aq-ai-chatbot />
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .aq-nav-item {
      display: flex; align-items: center; gap: .75rem;
      min-height: 42px;
      padding: .625rem .75rem; border-radius: .75rem;
      color: rgba(255,255,255,.62);
      border: 1px solid transparent;
      transition: color .18s ease, background .18s ease, border-color .18s ease, transform .18s ease;
      position: relative;
    }
    .aq-nav-icon {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border-radius: .7rem;
      border: 1px solid rgba(255,255,255,.065);
      background: rgba(255,255,255,.032);
      transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
    }
    .aq-nav-icon :where(svg) {
      width: 18px;
      height: 18px;
      display: block;
      color: rgba(255,255,255,.58);
      transition: color .18s ease, transform .18s ease;
    }
    .aq-nav-item:hover {
      color: #fff;
      background: rgba(255,255,255,.045);
      border-color: rgba(255,255,255,.055);
    }
    .aq-nav-item:hover .aq-nav-icon {
      border-color: rgba(16,185,129,.18);
      background: rgba(16,185,129,.07);
    }
    .aq-nav-item:hover .aq-nav-icon :where(svg) {
      color: rgba(110,231,183,.9);
    }
    .aq-nav-item.aq-active {
      color: #fff;
      background:
        linear-gradient(135deg, rgba(4,120,87,0.30), rgba(30,58,138,0.28)),
        rgba(255,255,255,.025);
      border-color: rgba(255,255,255,0.11);
      box-shadow: 0 10px 26px -22px rgba(16,185,129,.7), 0 1px 0 rgba(255,255,255,.04) inset;
    }
    .aq-nav-item.aq-active .aq-nav-icon :where(svg) {
      color: #6ee7b7;
    }
    .aq-nav-item.aq-active .aq-nav-icon {
      border-color: rgba(16,185,129,.24);
      background: linear-gradient(135deg, rgba(4,120,87,.26), rgba(30,58,138,.22));
      box-shadow: 0 10px 24px -18px rgba(16,185,129,.75);
    }
    .aq-nav-item.aq-active::before {
      content: ''; position: absolute; top: 50%; transform: translateY(-50%);
      width: 3px; height: 22px; border-radius: 999px;
      background: linear-gradient(180deg, #10b981, #3b82f6);
      box-shadow: 0 0 14px rgba(16,185,129,.45);
    }
    [dir='ltr'] .aq-nav-item.aq-active::before { left: 0; }
    [dir='rtl'] .aq-nav-item.aq-active::before { right: 0; }
  `]
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private translate = inject(TranslateService);
  private api = inject(ApiService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  mobileOpen = signal(false);
  currentLang = signal<'ar' | 'en'>(this.translate.currentLang as 'ar' | 'en' || 'ar');
  notificationsOpen = signal(false);
  notifications = signal<NotificationItem[]>([]);
  unread = signal(0);

  navItems: NavItem[] = [
    { id: 'home',     route: '/home',         labelKey: 'menu.home',
      icon: this.icon('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h5v-5h4v5h5v-9.5"/>') },
    { id: 'requests', route: '/my-requests',  labelKey: 'menu.my_requests',
      icon: this.icon('<path d="M8 4h8l2 2v14H6V6l2-2Z"/><path d="M9 10h6M9 14h6M9 18h4"/>'),
      roles: ['ROLE_ENTITY_MANAGER'] },
    { id: 'evaluation', route: '/evaluation', labelKey: 'menu.evaluation',
      icon: this.icon('<path d="M9 11l2 2 4-4"/><path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/>'),
      roles: ['ROLE_EVALUATOR', 'ROLE_ADMIN_REVIEWER', 'ROLE_FIELD_REVIEWER'] },
    { id: 'registrations', route: '/admin/registrations', labelKey: 'menu.registrations',
      icon: this.icon('<path d="M8 7a4 4 0 1 1 8 0"/><path d="M5 9h14l1 11H4L5 9Z"/><path d="M9 14h6"/>'),
      roles: ['ROLE_PLATFORM_ADMIN'] },
    { id: 'admin',    route: '/admin',        labelKey: 'menu.admin',
      icon: this.icon('<path d="M4 19V5"/><path d="M8 17v-6"/><path d="M13 17V7"/><path d="M18 17v-3"/><path d="M3 19h18"/>'),
      roles: ['ROLE_PLATFORM_ADMIN'] },
    { id: 'dashboard', route: '/dashboard',   labelKey: 'menu.dashboard',
      icon: this.icon('<path d="M4 5h7v7H4z"/><path d="M13 5h7v4h-7z"/><path d="M13 11h7v8h-7z"/><path d="M4 14h7v5H4z"/>') }
  ];

  private icon(paths: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        ${paths}
      </svg>
    `);
  }

  visibleNav(): NavItem[] {
    const userRoles = this.auth.isLoggedIn() ? this.auth.getRoles() : [];
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      if (!this.auth.isLoggedIn()) return false;
      return item.roles.some(r => userRoles.includes(r));
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadNotifications();
  }

  toggleNotifications(): void {
    this.notificationsOpen.set(!this.notificationsOpen());
    if (this.notificationsOpen()) this.loadNotifications();
  }

  loadNotifications(): void {
    this.api.get<{ unread: number; items: NotificationItem[] }>('/notifications').subscribe({
      next: data => {
        this.unread.set(data.unread);
        this.notifications.set(data.items.slice(0, 8));
      },
      error: () => {
        this.unread.set(0);
        this.notifications.set([]);
      }
    });
  }

  markAllRead(): void {
    this.api.post<void>('/notifications/read-all', {}).subscribe({ next: () => this.loadNotifications() });
  }

  openNotification(notification: NotificationItem): void {
    this.api.post<void>(`/notifications/${notification.id}/read`, {}).subscribe({ next: () => this.loadNotifications() });
    this.notificationsOpen.set(false);
    if (notification.linkUrl) this.router.navigateByUrl(notification.linkUrl);
  }

  notificationTitle(notification: NotificationItem): string {
    return this.currentLang() === 'ar' ? notification.titleAr : notification.titleEn;
  }

  notificationMessage(notification: NotificationItem): string {
    return this.currentLang() === 'ar' ? notification.messageAr : notification.messageEn;
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
