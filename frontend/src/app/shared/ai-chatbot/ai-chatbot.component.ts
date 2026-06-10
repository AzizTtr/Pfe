import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  createdAt: Date;
}

interface AiSmartReport {
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  fraudRiskAlerts?: string[];
  fraudRiskScore?: number;
  conclusion: string;
}

interface AiEvaluationAssistant {
  overview: string;
  riskAlerts: string[];
  fraudRiskAlerts?: string[];
  fraudRiskScore?: number;
  recommendedDecision: string;
  decisionNote: string;
}

interface AiDashboardInsights {
  summary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
}

interface PageGuide {
  match: string[];
  titleKey: string;
  summaryKey: string;
  actionsKey: string;
  route?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'aq-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <section class="ai-chat-shell" [class.ai-chat-open]="open()">
      <div *ngIf="open()" class="ai-chat-panel glass-strong">
        <header class="ai-chat-header">
          <div class="flex items-center gap-3 min-w-0">
            <div class="ai-chat-orb small">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3.75 13.7 8.3 18.25 10l-4.55 1.7L12 16.25l-1.7-4.55L5.75 10l4.55-1.7L12 3.75Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M18 15.5 18.8 17.2 20.5 18l-1.7.8L18 20.5l-.8-1.7-1.7-.8 1.7-.8.8-1.7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="truncate">{{ label('ai.chat.title') }}</h3>
              <p class="truncate">{{ contextLabel() }}</p>
            </div>
          </div>
          <button type="button" class="ai-chat-icon-btn" (click)="open.set(false)" [attr.aria-label]="label('common.close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div #messageList class="ai-chat-messages">
          <div *ngFor="let msg of messages()" class="ai-chat-message" [class.user]="msg.role === 'user'">
            <div>
              <div class="ai-chat-bubble">{{ msg.text }}</div>
              <div class="ai-chat-time">{{ msg.createdAt | date:'shortTime' }}</div>
            </div>
          </div>
          <div *ngIf="thinking()" class="ai-chat-message">
            <div class="ai-chat-bubble ai-thinking">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="ai-chat-actions" *ngIf="actionChips().length">
          <button *ngFor="let action of actionChips()" type="button" (click)="send(action)">
            {{ action }}
          </button>
        </div>

        <form class="ai-chat-input" (ngSubmit)="send(draft())">
          <textarea [(ngModel)]="draftValue"
                    name="aiChatInput"
                    rows="1"
                    [placeholder]="label('ai.chat.placeholder')"
                    autocomplete="off"
                    (keydown.enter)="handleEnter($event)"></textarea>
          <button type="submit" [disabled]="!draft().trim() || thinking()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M22 2 11 13"/>
              <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
            </svg>
          </button>
        </form>
      </div>

      <button type="button" class="ai-chat-launcher" (click)="toggle()" [attr.aria-label]="label('ai.chat.title')">
        <div class="ai-chat-orb">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.25 13.9 8.1 18.75 10l-4.85 1.9L12 16.75l-1.9-4.85L5.25 10l4.85-1.9L12 3.25Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="M7.5 16.5h5.25c2.9 0 5.25-2.05 5.25-4.6v-.15" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>
            <path d="m7.5 16.5-2.25 2.25V13.5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="ai-chat-pulse"></div>
      </button>
    </section>
  `,
  styles: [`
    :host {
      position: fixed;
      z-index: 60;
      inset-inline-end: 1.6rem;
      bottom: 1.6rem;
    }

    .ai-chat-shell {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: .85rem;
    }

    .ai-chat-launcher {
      position: relative;
      width: 3.85rem;
      height: 3.85rem;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 1.15rem;
      background:
        linear-gradient(135deg, rgba(4,120,87,.42), rgba(29,78,216,.35)),
        rgba(15,23,42,.72);
      box-shadow: 0 18px 42px -24px rgba(16,185,129,.85), 0 1px 0 rgba(255,255,255,.08) inset;
      display: grid;
      place-items: center;
      overflow: hidden;
      transition: transform .18s ease, border-color .18s ease;
    }

    .ai-chat-launcher:hover {
      transform: translateY(-2px) scale(1.02);
      border-color: rgba(110,231,183,.42);
    }

    .ai-chat-orb {
      width: 2.45rem;
      height: 2.45rem;
      border-radius: .9rem;
      background:
        linear-gradient(135deg, rgba(20,184,166,.94), rgba(37,99,235,.92));
      display: grid;
      place-items: center;
      box-shadow: 0 0 32px rgba(45,212,191,.38);
      position: relative;
      color: white;
    }

    .ai-chat-orb.small {
      width: 2.25rem;
      height: 2.25rem;
      flex: 0 0 auto;
    }

    .ai-chat-orb svg {
      width: 1.35rem;
      height: 1.35rem;
      filter: drop-shadow(0 0 8px rgba(255,255,255,.22));
    }

    .ai-chat-pulse {
      position: absolute;
      inset: .38rem;
      border-radius: .95rem;
      border: 1px solid rgba(110,231,183,.22);
      animation: aiPulse 2.4s ease-out infinite;
      pointer-events: none;
    }

    .ai-chat-panel {
      width: min(25rem, calc(100vw - 2rem));
      height: min(40rem, calc(100vh - 7rem));
      border-radius: 1.35rem;
      border: 1px solid rgba(255,255,255,.12);
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr auto;
      box-shadow: 0 22px 64px -34px rgba(0,0,0,.9), 0 0 0 1px rgba(16,185,129,.05);
    }

    .ai-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .8rem;
      padding: .95rem;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: linear-gradient(135deg, rgba(16,185,129,.08), rgba(59,130,246,.07));
    }

    .ai-chat-header h3 {
      font-size: .95rem;
      font-weight: 900;
    }

    .ai-chat-header p {
      margin-top: .1rem;
      font-size: .72rem;
      color: rgba(255,255,255,.52);
    }

    .ai-chat-icon-btn {
      width: 2rem;
      height: 2rem;
      display: grid;
      place-items: center;
      border-radius: .75rem;
      color: rgba(255,255,255,.6);
      background: rgba(255,255,255,.045);
    }

    .ai-chat-icon-btn svg,
    .ai-chat-input button svg {
      width: 1rem;
      height: 1rem;
    }

    .ai-chat-messages {
      padding: .95rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: .65rem;
    }

    .ai-chat-message {
      display: flex;
      justify-content: flex-start;
    }

    .ai-chat-message.user {
      justify-content: flex-end;
    }

    .ai-chat-bubble {
      max-width: 86%;
      white-space: pre-line;
      border-radius: 1rem;
      border: 1px solid rgba(255,255,255,.085);
      background: rgba(255,255,255,.055);
      padding: .7rem .8rem;
      color: rgba(255,255,255,.78);
      font-size: .82rem;
      line-height: 1.55;
    }

    .ai-chat-message.user .ai-chat-bubble {
      background: linear-gradient(135deg, rgba(4,120,87,.32), rgba(29,78,216,.26));
      color: white;
      border-color: rgba(110,231,183,.2);
    }

    .ai-chat-time {
      margin-top: .22rem;
      color: rgba(255,255,255,.32);
      font-size: .62rem;
      padding-inline: .35rem;
    }

    .ai-chat-message.user .ai-chat-time {
      text-align: end;
    }

    .ai-thinking {
      display: inline-flex;
      gap: .25rem;
      align-items: center;
    }

    .ai-thinking span {
      width: .35rem;
      height: .35rem;
      border-radius: 999px;
      background: rgba(110,231,183,.85);
      animation: aiDot 1s ease-in-out infinite;
    }

    .ai-thinking span:nth-child(2) { animation-delay: .12s; }
    .ai-thinking span:nth-child(3) { animation-delay: .24s; }

    .ai-chat-actions {
      display: flex;
      gap: .45rem;
      overflow-x: auto;
      padding: .55rem .95rem .8rem;
      border-top: 1px solid rgba(255,255,255,.07);
    }

    .ai-chat-actions button {
      flex: 0 0 auto;
      border-radius: 999px;
      border: 1px solid rgba(110,231,183,.18);
      background: rgba(16,185,129,.08);
      color: rgba(209,250,229,.9);
      font-size: .72rem;
      font-weight: 700;
      padding: .45rem .65rem;
    }

    .ai-chat-input {
      display: grid;
      grid-template-columns: 1fr 2.6rem;
      gap: .55rem;
      padding: .85rem .95rem .95rem;
    }

    .ai-chat-input textarea {
      min-width: 0;
      max-height: 6rem;
      border-radius: .95rem;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(15,23,42,.58);
      color: white;
      outline: none;
      padding: .72rem .85rem;
      font-size: .84rem;
      resize: none;
      line-height: 1.35;
    }

    .ai-chat-input textarea:focus {
      border-color: rgba(52,211,153,.44);
      box-shadow: 0 0 0 3px rgba(16,185,129,.12);
    }

    .ai-chat-input button {
      display: grid;
      place-items: center;
      border-radius: .95rem;
      border: 1px solid rgba(110,231,183,.24);
      background: linear-gradient(135deg, rgba(4,120,87,.74), rgba(29,78,216,.65));
      color: white;
    }

    .ai-chat-input button:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    @keyframes aiPulse {
      from { transform: scale(.92); opacity: .75; }
      to { transform: scale(1.22); opacity: 0; }
    }

    @keyframes aiDot {
      0%, 100% { transform: translateY(0); opacity: .45; }
      50% { transform: translateY(-4px); opacity: 1; }
    }

    @media (max-width: 768px) {
      :host {
        inset-inline-end: .9rem;
        bottom: .9rem;
      }

      .ai-chat-launcher {
        width: 3.75rem;
        height: 3.75rem;
      }

      .ai-chat-panel {
        width: calc(100vw - 1.25rem);
        height: min(42rem, calc(100vh - 5.75rem));
        border-radius: 1.1rem;
      }
    }
  `]
})
export class AiChatbotComponent implements OnDestroy {
  @ViewChild('messageList') messageList?: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private pageGuides: PageGuide[] = [
    {
      match: ['/home', 'home', 'leaderboard', 'top institutions'],
      titleKey: 'ai.chat.pages.home.title',
      summaryKey: 'ai.chat.pages.home.summary',
      actionsKey: 'ai.chat.pages.home.actions',
      route: '/home'
    },
    {
      match: ['/dashboard', 'dashboard', 'overview', 'workspace'],
      titleKey: 'ai.chat.pages.dashboard.title',
      summaryKey: 'ai.chat.pages.dashboard.summary',
      actionsKey: 'ai.chat.pages.dashboard.actions',
      route: '/dashboard'
    },
    {
      match: ['/profile', 'profile', 'account', 'avatar', 'timezone', 'language', 'preferences'],
      titleKey: 'ai.chat.pages.profile.title',
      summaryKey: 'ai.chat.pages.profile.summary',
      actionsKey: 'ai.chat.pages.profile.actions',
      route: '/profile'
    },
    {
      match: ['/register', 'register', 'registration form', 'new institution'],
      titleKey: 'ai.chat.pages.register.title',
      summaryKey: 'ai.chat.pages.register.summary',
      actionsKey: 'ai.chat.pages.register.actions',
      route: '/register'
    },
    {
      match: ['/my-requests', 'my requests', 'requests list', 'request tracking'],
      titleKey: 'ai.chat.pages.requests.title',
      summaryKey: 'ai.chat.pages.requests.summary',
      actionsKey: 'ai.chat.pages.requests.actions',
      route: '/my-requests'
    },
    {
      match: ['/my-requests/new', 'new request', 'submit request', 'evaluation form'],
      titleKey: 'ai.chat.pages.new_request.title',
      summaryKey: 'ai.chat.pages.new_request.summary',
      actionsKey: 'ai.chat.pages.new_request.actions',
      route: '/my-requests/new'
    },
    {
      match: ['request detail', 'final result', 'download report', 'attachments'],
      titleKey: 'ai.chat.pages.request_detail.title',
      summaryKey: 'ai.chat.pages.request_detail.summary',
      actionsKey: 'ai.chat.pages.request_detail.actions'
    },
    {
      match: ['/evaluation', 'evaluation inbox', 'review inbox', 'assigned requests'],
      titleKey: 'ai.chat.pages.evaluation.title',
      summaryKey: 'ai.chat.pages.evaluation.summary',
      actionsKey: 'ai.chat.pages.evaluation.actions',
      route: '/evaluation'
    },
    {
      match: ['review request', 'review page', 'decision note', 'rating'],
      titleKey: 'ai.chat.pages.review.title',
      summaryKey: 'ai.chat.pages.review.summary',
      actionsKey: 'ai.chat.pages.review.actions'
    },
    {
      match: ['/admin/dashboard', 'admin dashboard', 'pending registrations'],
      titleKey: 'ai.chat.pages.admin_dashboard.title',
      summaryKey: 'ai.chat.pages.admin_dashboard.summary',
      actionsKey: 'ai.chat.pages.admin_dashboard.actions',
      route: '/admin/dashboard',
      adminOnly: true
    },
    {
      match: ['/admin/registrations', 'registrations', 'approve institution', 'reject institution'],
      titleKey: 'ai.chat.pages.registrations.title',
      summaryKey: 'ai.chat.pages.registrations.summary',
      actionsKey: 'ai.chat.pages.registrations.actions',
      route: '/admin/registrations',
      adminOnly: true
    },
    {
      match: ['/admin/users', 'users', 'user management', 'roles'],
      titleKey: 'ai.chat.pages.users.title',
      summaryKey: 'ai.chat.pages.users.summary',
      actionsKey: 'ai.chat.pages.users.actions',
      route: '/admin/users',
      adminOnly: true
    },
    {
      match: ['/admin/categories', 'categories', 'catalog categories'],
      titleKey: 'ai.chat.pages.categories.title',
      summaryKey: 'ai.chat.pages.categories.summary',
      actionsKey: 'ai.chat.pages.categories.actions',
      route: '/admin/categories',
      adminOnly: true
    },
    {
      match: ['/admin/questions', 'questions', 'catalog questions'],
      titleKey: 'ai.chat.pages.questions.title',
      summaryKey: 'ai.chat.pages.questions.summary',
      actionsKey: 'ai.chat.pages.questions.actions',
      route: '/admin/questions',
      adminOnly: true
    },
    {
      match: ['/admin/values', 'values', 'scores', 'a/b/c/d'],
      titleKey: 'ai.chat.pages.values.title',
      summaryKey: 'ai.chat.pages.values.summary',
      actionsKey: 'ai.chat.pages.values.actions',
      route: '/admin/values',
      adminOnly: true
    },
    {
      match: ['/admin/assignments', 'assignments', 'distribution', 'assign request'],
      titleKey: 'ai.chat.pages.assignments.title',
      summaryKey: 'ai.chat.pages.assignments.summary',
      actionsKey: 'ai.chat.pages.assignments.actions',
      route: '/admin/assignments',
      adminOnly: true
    },
    {
      match: ['/admin/audit', 'audit', 'audit log', 'trace'],
      titleKey: 'ai.chat.pages.audit.title',
      summaryKey: 'ai.chat.pages.audit.summary',
      actionsKey: 'ai.chat.pages.audit.actions',
      route: '/admin/audit',
      adminOnly: true
    },
    {
      match: ['/admin/reports', 'reports', 'advanced reports', 'analytics', 'insights'],
      titleKey: 'ai.chat.pages.reports.title',
      summaryKey: 'ai.chat.pages.reports.summary',
      actionsKey: 'ai.chat.pages.reports.actions',
      route: '/admin/reports',
      adminOnly: true
    }
  ];
  private fallback: Record<string, { en: string; ar?: string }> = {
    'common.close': { en: 'Close', ar: 'إغلاق' },
    'ai.chat.title': { en: 'AQL AI Co-Pilot', ar: 'المساعد الذكي للجودة' },
    'ai.chat.welcome': { en: 'Hi, I am your Arabic Quality AI co-pilot. Ask me about reports, evaluations, risks, or what to do next.', ar: 'مرحباً، أنا مساعدك الذكي في منصة الجودة العربية. اسألني عن التقارير أو التقييمات أو المخاطر أو الخطوة التالية.' },
    'ai.chat.placeholder': { en: 'Ask the AI co-pilot...', ar: 'اسأل المساعد الذكي...' },
    'ai.chat.context_general': { en: 'Smart help for the platform', ar: 'مساعدة ذكية للمنصة' },
    'ai.chat.context_reports': { en: 'Reading admin report insights', ar: 'قراءة رؤى تقارير الإدارة' },
    'ai.chat.context_review': { en: 'Assisting this evaluation review', ar: 'مساعدة في مراجعة هذا التقييم' },
    'ai.chat.context_request': { en: 'Summarizing this request', ar: 'تلخيص هذا الطلب' },
    'ai.chat.context_profile': { en: 'Helping with account settings', ar: 'مساعدة في إعدادات الحساب' },
    'ai.chat.prompt_login': { en: 'How do I sign in?', ar: 'كيف أسجل الدخول؟' },
    'ai.chat.prompt_register': { en: 'How to register?', ar: 'كيف أسجل مؤسسة؟' },
    'ai.chat.prompt_insights': { en: 'Summarize insights', ar: 'لخص الرؤى' },
    'ai.chat.prompt_risks': { en: 'Show risks', ar: 'اعرض المخاطر' },
    'ai.chat.prompt_next': { en: 'What should I do next?', ar: 'ما الخطوة التالية؟' },
    'ai.chat.prompt_eval': { en: 'Suggest evaluation help', ar: 'اقترح مساعدة للتقييم' },
    'ai.chat.prompt_decision': { en: 'Suggest decision note', ar: 'اقترح ملاحظة قرار' },
    'ai.chat.prompt_report': { en: 'Generate request summary', ar: 'أنشئ ملخص الطلب' },
    'ai.chat.prompt_strengths': { en: 'Show strengths', ar: 'اعرض نقاط القوة' },
    'ai.chat.prompt_help': { en: 'Help me navigate', ar: 'ساعدني في التنقل' },
    'ai.chat.prompt_status': { en: 'Explain statuses', ar: 'اشرح الحالات' },
    'ai.chat.prompt_features': { en: 'What AI can do?', ar: 'ماذا يفعل الذكاء؟' },
    'ai.chat.answer_strengths': { en: 'Main strengths:', ar: 'نقاط القوة الرئيسية:' },
    'ai.chat.answer_next': { en: 'Recommended next actions:', ar: 'الإجراءات المقترحة:' },
    'ai.chat.answer_risks': { en: 'Risk alerts:', ar: 'تنبيهات المخاطر:' },
    'ai.chat.answer_fraud_risks': { en: 'Fraud / risk signals:', ar: 'مؤشرات الاحتيال والمخاطر:' },
    'ai.chat.answer_decision': { en: 'Recommended decision:', ar: 'القرار المقترح:' },
    'ai.chat.answer_highlights': { en: 'Highlights:', ar: 'أبرز النقاط:' },
    'ai.chat.no_data': { en: 'No live data available yet.', ar: 'لا توجد بيانات مباشرة بعد.' },
    'ai.chat.error': { en: 'I could not reach the AI endpoint. Restart the backend and try again.', ar: 'تعذر الوصول إلى خدمة الذكاء. أعد تشغيل الخادم ثم حاول مرة أخرى.' },
    'ai.chat.public_login': { en: 'Sign in to unlock personal AI help for requests, reviews, reports, and dashboard insights.', ar: 'سجل الدخول لتفعيل المساعدة الذكية الخاصة بالطلبات والمراجعات والتقارير ولوحة التحكم.' },
    'ai.chat.public_register': { en: 'Use Register to submit your institution details. After approval, you can create evaluation requests and track them.', ar: 'استخدم صفحة التسجيل لإرسال بيانات المؤسسة. بعد القبول يمكنك إنشاء طلبات تقييم ومتابعتها.' },
    'ai.chat.status_help': { en: 'Typical flow: Draft, Pending review, Under evaluation, Admin review, Field review, then Completed or Rejected.', ar: 'المسار المعتاد: مسودة، بانتظار المراجعة، قيد التقييم، مراجعة إدارية، مراجعة ميدانية، ثم مكتمل أو مرفوض.' },
    'ai.chat.feature_help': { en: 'I can summarize requests, suggest reviewer notes, detect risks, explain dashboard insights, and guide you to the right page.', ar: 'يمكنني تلخيص الطلبات، اقتراح ملاحظات للمراجعين، اكتشاف المخاطر، شرح رؤى لوحة التحكم، وإرشادك للصفحة المناسبة.' },
    'ai.chat.general_help': { en: 'Tell me what you are trying to do. I can guide you to profile, requests, evaluations, admin reports, or explain the workflow.', ar: 'أخبرني بما تريد إنجازه. يمكنني إرشادك إلى الملف الشخصي أو الطلبات أو التقييمات أو التقارير أو شرح سير العمل.' },
    'ai.chat.example_one': { en: 'Check my next step', ar: 'ما الخطوة التالية؟' },
    'ai.chat.example_two': { en: 'Explain this workflow', ar: 'اشرح لي مسار العمل' },
    'ai.chat.example_three': { en: 'What can you help with?', ar: 'كيف يمكنك مساعدتي؟' },
    'ai.chat.reply_greeting': { en: 'Hey. I am here with you. Tell me what page you are working on or what you want to finish, and I will guide you step by step.', ar: 'أهلاً بك. أنا معك هنا. أخبرني بالصفحة التي تعمل عليها أو ما تريد إنجازه، وسأرشدك خطوة بخطوة.' },
    'ai.chat.reply_thanks': { en: 'Anytime. I can stay with the workflow: requests, reports, review notes, or dashboard risks.', ar: 'على الرحب. يمكنني مساعدتك في الطلبات أو التقارير أو ملاحظات المراجعة أو مخاطر لوحة التحكم.' },
    'ai.chat.profile_help': { en: 'You are on the profile page. I can help with language, timezone, avatar, account info, and security settings.', ar: 'أنت في صفحة الملف الشخصي. يمكنني مساعدتك في اللغة، المنطقة الزمنية، الصورة، معلومات الحساب، وإعدادات الأمان.' },
    'ai.chat.dashboard_help': { en: 'You are on the dashboard. I can explain what the cards mean, where to go next, or what needs attention.', ar: 'أنت في لوحة التحكم. يمكنني شرح البطاقات، اقتراح الصفحة التالية، أو توضيح ما يحتاج انتباهاً.' },
    'ai.chat.nav_profile': { en: 'Open profile', ar: 'فتح الملف الشخصي' },
    'ai.chat.nav_requests': { en: 'Open requests', ar: 'فتح الطلبات' },
    'ai.chat.nav_reports': { en: 'Open reports', ar: 'فتح التقارير' },
    'ai.chat.nav_profile_answer': { en: 'Use Profile to edit your personal information, avatar, language, timezone, and notification preferences.', ar: 'استخدم صفحة الملف الشخصي لتعديل بياناتك، الصورة، اللغة، المنطقة الزمنية، وتفضيلات الإشعارات.' },
    'ai.chat.nav_requests_answer': { en: 'Use My Requests to create a new evaluation request, track status, and open final reports.', ar: 'استخدم صفحة طلباتي لإنشاء طلب تقييم جديد، متابعة الحالة، وفتح التقارير النهائية.' },
    'ai.chat.nav_reports_answer': { en: 'Use Admin Reports to see analytics, exports, and AI dashboard insights. This is available for platform admins.', ar: 'استخدم تقارير الإدارة لمشاهدة التحليلات والتصدير والرؤى الذكية. هذه الصفحة متاحة لمسؤول المنصة.' },
    'ai.chat.nav_general_answer': { en: 'Tell me the destination: profile, requests, evaluation inbox, admin panel, or reports. I will point you to the right place.', ar: 'أخبرني بالوجهة: الملف الشخصي، الطلبات، صندوق التقييم، لوحة الإدارة، أو التقارير. سأرشدك للمكان المناسب.' }
  };

  open = signal(false);
  thinking = signal(false);
  currentUrl = signal(this.router.url);
  activeLang = signal<'ar' | 'en'>((this.translate.currentLang || document.documentElement.lang || 'en') === 'ar' ? 'ar' : 'en');
  draftValue = '';
  private langSub: Subscription = this.translate.onLangChange.subscribe(event => {
    const next = event.lang === 'ar' ? 'ar' : 'en';
    this.activeLang.set(next);
    this.resetForLanguage();
  });
  private routeSub: Subscription = this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.currentUrl.set(event.urlAfterRedirects);
      this.suggestedReplies.set(this.contextSuggestions());
    }
  });
  suggestedReplies = signal<string[]>([]);
  actionChips = computed(() => {
    const seen = new Set<string>();
    return [...this.suggestedReplies(), ...this.quickPrompts()]
      .map(action => action.trim())
      .filter(action => {
        const normalized = action.toLowerCase();
        if (!action || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .slice(0, 5);
  });
  messages = signal<ChatMessage[]>([
    {
      role: 'bot',
      text: this.t('ai.chat.welcome'),
      createdAt: new Date()
    }
  ]);

  draft(): string {
    return this.draftValue;
  }

  contextLabel = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/admin/reports')) return this.t('ai.chat.context_reports');
    if (url.includes('/evaluation/requests/')) return this.t('ai.chat.context_review');
    if (url.includes('/my-requests/')) return this.t('ai.chat.context_request');
    if (url.includes('/profile')) return this.t('ai.chat.context_profile');
    return this.t('ai.chat.context_general');
  });

  quickPrompts = computed(() => {
    const url = this.currentUrl();
    if (!this.auth.isLoggedIn()) {
      return [this.t('ai.chat.prompt_login'), this.t('ai.chat.prompt_register')];
    }
    if (url.includes('/admin/reports')) {
      return [this.t('ai.chat.prompt_insights'), this.t('ai.chat.prompt_risks'), this.t('ai.chat.prompt_next')];
    }
    if (url.includes('/evaluation/requests/')) {
      return [this.t('ai.chat.prompt_eval'), this.t('ai.chat.prompt_decision'), this.t('ai.chat.prompt_risks')];
    }
    if (url.includes('/my-requests/')) {
      return [this.t('ai.chat.prompt_report'), this.t('ai.chat.prompt_strengths'), this.t('ai.chat.prompt_next')];
    }
    return [this.t('ai.chat.prompt_help'), this.t('ai.chat.prompt_status'), this.t('ai.chat.prompt_features')];
  });

  toggle(): void {
    this.open.set(!this.open());
    if (this.open()) {
      this.suggestedReplies.set(this.contextSuggestions());
      this.scrollSoon();
    }
  }

  send(raw: string): void {
    const text = raw.trim();
    if (!text || this.thinking()) return;
    this.draftValue = '';
    this.push('user', text);
    this.thinking.set(true);
    this.answer(text);
  }

  handleEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) return;
    keyboard.preventDefault();
    this.send(this.draft());
  }

  public label(key: string): string {
    this.activeLang();
    const translated = this.translate.instant(key);
    if (translated && translated !== key) return translated;
    return this.fallback[key]?.[this.activeLang()] || this.fallback[key]?.en || key;
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  private answer(text: string): void {
    const url = this.currentUrl();
    const requestId = this.idFromUrl(url);
    const lower = text.toLowerCase();

    if (this.isGreeting(lower)) {
      this.replyLater(this.t('ai.chat.reply_greeting'), this.contextSuggestions());
      return;
    }

    if (this.containsAny(lower, ['thank', 'thanks', 'merci', 'شكرا', 'شكرًا'])) {
      this.replyLater(this.t('ai.chat.reply_thanks'), this.contextSuggestions());
      return;
    }

    if (this.isPageInfoIntent(lower)) {
      const guide = this.findPageGuide(lower);
      this.replyLater(this.formatPageGuide(guide), this.pageGuideSuggestions());
      return;
    }

    if (this.isNavigationIntent(lower)) {
      this.navigateFromMessage(lower);
      this.replyLater(this.navigationHelp(lower), this.navigationSuggestions());
      return;
    }

    if (url.includes('/admin/reports') && this.auth.hasRole('ROLE_PLATFORM_ADMIN')) {
      this.api.get<AiDashboardInsights>('/admin/reports/ai-insights').subscribe({
        next: data => this.replyLater(this.formatInsights(data, lower), this.insightSuggestions()),
        error: () => this.replyLater(this.t('ai.chat.error'), this.contextSuggestions())
      });
      return;
    }

    if (url.includes('/evaluation/requests/') && requestId) {
      this.api.get<AiEvaluationAssistant>(`/evaluation/requests/${requestId}/ai-assistant`).subscribe({
        next: data => this.replyLater(this.formatEvaluation(data, lower), this.evaluationSuggestions()),
        error: () => this.replyLater(this.t('ai.chat.error'), this.contextSuggestions())
      });
      return;
    }

    if (url.includes('/my-requests/') && requestId) {
      this.api.get<AiSmartReport>(`/requests/${requestId}/ai-report`, { lang: this.activeLang() }).subscribe({
        next: data => this.replyLater(this.formatReport(data, lower), this.reportSuggestions()),
        error: () => this.replyLater(this.t('ai.chat.error'), this.contextSuggestions())
      });
      return;
    }

    this.replyLater(this.localAnswer(lower), this.contextSuggestions(lower));
  }

  private formatReport(data: AiSmartReport, lower: string): string {
    if (lower.includes('strength')) return `${this.t('ai.chat.answer_strengths')}\n${this.lines(data.strengths)}`;
    if (lower.includes('risk') || lower.includes('fraud')) return this.fraudRiskText(data.fraudRiskAlerts, data.fraudRiskScore);
    if (lower.includes('next') || lower.includes('recommend')) return `${this.t('ai.chat.answer_next')}\n${this.lines(data.recommendations)}`;
    return `${data.executiveSummary}\n\n${this.t('ai.chat.answer_strengths')}\n${this.lines(data.strengths)}\n\n${this.t('ai.chat.answer_next')}\n${this.lines(data.recommendations)}`;
  }

  private formatEvaluation(data: AiEvaluationAssistant, lower: string): string {
    if (lower.includes('risk') || lower.includes('fraud')) {
      return `${this.t('ai.chat.answer_risks')}\n${this.lines(data.riskAlerts)}\n\n${this.fraudRiskText(data.fraudRiskAlerts, data.fraudRiskScore)}`;
    }
    if (lower.includes('decision')) return `${this.t('ai.chat.answer_decision')} ${data.recommendedDecision}\n${data.decisionNote}`;
    return `${data.overview}\n\n${this.t('ai.chat.answer_decision')} ${data.recommendedDecision}\n${data.decisionNote}`;
  }

  private formatInsights(data: AiDashboardInsights, lower: string): string {
    if (lower.includes('risk')) return `${this.t('ai.chat.answer_risks')}\n${this.lines(data.risks)}`;
    if (lower.includes('next') || lower.includes('recommend')) return `${this.t('ai.chat.answer_next')}\n${this.lines(data.recommendations)}`;
    return `${data.summary}\n\n${this.t('ai.chat.answer_highlights')}\n${this.lines(data.highlights)}\n\n${this.t('ai.chat.answer_risks')}\n${this.lines(data.risks)}`;
  }

  private localAnswer(lower: string): string {
    if (!this.auth.isLoggedIn()) {
      if (lower.includes('register')) return this.t('ai.chat.public_register');
      return this.t('ai.chat.public_login');
    }
    if (this.containsAny(lower, ['status', 'state', 'workflow', 'حالة', 'مسار'])) return this.t('ai.chat.status_help');
    if (this.containsAny(lower, ['feature', 'ai', 'can you', 'help', 'ماذا', 'تقدر', 'مساعدة'])) return this.t('ai.chat.feature_help');
    if (this.containsAny(lower, ['this page', 'current page', 'explain page', 'what is here', 'how use'])) {
      return this.formatPageGuide(this.findPageGuide(lower));
    }
    if (this.currentUrl().includes('/profile')) return this.formatPageGuide(this.findPageGuide('profile'));
    if (this.currentUrl().includes('/dashboard')) return this.formatPageGuide(this.findPageGuide('dashboard'));
    return this.t('ai.chat.general_help');
  }

  private replyLater(text: string, suggestions: string[] = []): void {
    const delay = Math.min(1200, Math.max(380, text.length * 8));
    window.setTimeout(() => {
      this.thinking.set(false);
      this.push('bot', text);
      this.suggestedReplies.set(suggestions);
    }, delay);
  }

  private push(role: 'bot' | 'user', text: string): void {
    this.messages.update(messages => [...messages, { role, text, createdAt: new Date() }].slice(-18));
    this.scrollSoon();
  }

  private lines(items: string[]): string {
    return items.length ? items.map(item => `- ${item}`).join('\n') : this.t('ai.chat.no_data');
  }

  private fraudRiskText(alerts: string[] | undefined, score: number | undefined): string {
    const title = score == null
      ? this.t('ai.chat.answer_fraud_risks')
      : `${this.t('ai.chat.answer_fraud_risks')} ${score}%`;
    return `${title}\n${this.lines(alerts || [])}`;
  }

  private idFromUrl(url: string): number | null {
    const match = url.match(/\/(?:my-requests|evaluation\/requests)\/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  private t(key: string): string {
    return this.label(key);
  }

  private resetForLanguage(): void {
    this.draftValue = '';
    this.thinking.set(false);
    this.messages.set([{ role: 'bot', text: this.t('ai.chat.welcome'), createdAt: new Date() }]);
    this.suggestedReplies.set(this.contextSuggestions());
    this.scrollSoon();
  }

  private contextSuggestions(seed = ''): string[] {
    if (!this.auth.isLoggedIn()) return [this.t('ai.chat.prompt_login'), this.t('ai.chat.prompt_register')];
    const url = this.currentUrl();
    if (url.includes('/admin/reports')) return this.insightSuggestions();
    if (url.includes('/evaluation/requests/')) return this.evaluationSuggestions();
    if (url.includes('/my-requests/')) return this.reportSuggestions();
    if (seed.includes('status')) return [this.t('ai.chat.prompt_status'), this.t('ai.chat.prompt_next')];
    return [this.t('ai.chat.example_one'), this.t('ai.chat.example_two'), this.t('ai.chat.example_three')];
  }

  private insightSuggestions(): string[] {
    return [this.t('ai.chat.prompt_insights'), this.t('ai.chat.prompt_risks'), this.t('ai.chat.prompt_next')];
  }

  private evaluationSuggestions(): string[] {
    return [this.t('ai.chat.prompt_eval'), this.t('ai.chat.prompt_decision'), this.t('ai.chat.prompt_risks')];
  }

  private reportSuggestions(): string[] {
    return [this.t('ai.chat.prompt_report'), this.t('ai.chat.prompt_strengths'), this.t('ai.chat.prompt_next')];
  }

  private navigationSuggestions(): string[] {
    return [this.t('ai.chat.nav_profile'), this.t('ai.chat.nav_requests'), this.t('ai.chat.nav_reports')];
  }

  private pageGuideSuggestions(): string[] {
    if (this.auth.hasRole('ROLE_PLATFORM_ADMIN')) {
      return [
        this.t('ai.chat.prompt_current_page'),
        this.t('ai.chat.prompt_reports_page'),
        this.t('ai.chat.prompt_catalog_page')
      ];
    }
    return [
      this.t('ai.chat.prompt_current_page'),
      this.t('ai.chat.prompt_requests_page'),
      this.t('ai.chat.prompt_profile_page')
    ];
  }

  private navigationHelp(lower: string): string {
    if (this.containsAny(lower, ['profile', 'account', 'حساب', 'ملف'])) return this.t('ai.chat.nav_profile_answer');
    if (this.containsAny(lower, ['request', 'طلبات', 'طلب'])) return this.t('ai.chat.nav_requests_answer');
    if (this.containsAny(lower, ['report', 'admin', 'تقرير', 'تقارير', 'إدارة'])) return this.t('ai.chat.nav_reports_answer');
    return this.t('ai.chat.nav_general_answer');
  }

  private isPageInfoIntent(lower: string): boolean {
    return this.containsAny(lower, [
      'what is this', 'this page', 'current page', 'explain', 'describe', 'how use',
      'what can i do', 'content', 'information', 'guide', 'details',
      'اشرح', 'ما هذه', 'هذه الصفحة', 'معلومات', 'دليل', 'تفاصيل'
    ]);
  }

  private findPageGuide(lower: string): PageGuide {
    const url = this.currentUrl().toLowerCase();
    const text = `${lower} ${url}`;
    return this.pageGuides.find(guide => {
      if (guide.adminOnly && !this.auth.hasRole('ROLE_PLATFORM_ADMIN')) return false;
      return guide.match.some(token => text.includes(token));
    }) || this.pageGuides.find(guide => guide.match.includes('/dashboard'))!;
  }

  private formatPageGuide(guide: PageGuide): string {
    const title = this.t(guide.titleKey);
    const summary = this.t(guide.summaryKey);
    const actions = this.t(guide.actionsKey);
    return `${title}\n${summary}\n\n${this.t('ai.chat.page_actions')}\n${actions}`;
  }

  private isNavigationIntent(lower: string): boolean {
    return this.containsAny(lower, [
      'where', 'go to', 'open', 'page', 'navigate', 'profile', 'account',
      'request', 'requests', 'report', 'reports', 'admin', 'evaluation', 'inbox',
      'فين', 'اين', 'صفحة', 'افتح', 'ملف', 'حساب', 'طلب', 'طلبات', 'تقرير', 'تقارير', 'إدارة', 'تقييم'
    ]);
  }

  private navigateFromMessage(lower: string): void {
    if (!this.auth.isLoggedIn()) return;
    if (this.containsAny(lower, ['profile', 'account', 'ملف', 'حساب'])) {
      void this.router.navigate(['/profile']);
      return;
    }
    if (this.containsAny(lower, ['request', 'requests', 'طلب', 'طلبات'])) {
      void this.router.navigate(['/my-requests']);
      return;
    }
    if (this.containsAny(lower, ['evaluation', 'inbox', 'تقييم'])) {
      void this.router.navigate(['/evaluation']);
      return;
    }
    if (this.containsAny(lower, ['report', 'reports', 'admin', 'تقرير', 'تقارير', 'إدارة']) && this.auth.hasRole('ROLE_PLATFORM_ADMIN')) {
      void this.router.navigate(['/admin/reports']);
    }
  }

  private isGreeting(lower: string): boolean {
    return /(^|\s)(hello|hi|hey|salam)(\s|$|[!.?])/.test(lower)
      || this.containsAny(lower, ['السلام', 'مرحبا', 'أهلا', 'اهلا']);
  }

  private containsAny(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }

  private scrollSoon(): void {
    window.setTimeout(() => {
      const el = this.messageList?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }
}
