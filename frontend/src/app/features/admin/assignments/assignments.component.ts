import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/api/api.service';
import { PageShellComponent } from '../../../shared/page-shell/page-shell.component';

interface RequestSummary {
  id: number;
  requestNumber: string;
  status: string;
  entityName: string;
}
interface Reviewer {
  id: number;
  fullName: string;
  email: string;
  roleCode: string;
}
interface Assignment {
  id: number;
  requestNumber: string;
  entityName: string;
  status: string;
  stage: string;
  assignedUserName: string;
  assignedUserEmail: string;
  auto: boolean;
  assignedAt: string;
  completedAt?: string;
}

@Component({
  selector: 'aq-admin-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageShellComponent],
  template: `
    <aq-page-shell
      [title]="'admin.assignments.title' | translate"
      [subtitle]="'admin.assignments.subtitle' | translate">

      <div class="glass rounded-2xl p-5 mb-4">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_220px_1fr_auto] gap-3 items-end">
          <label class="block">
            <span class="text-xs text-white/50">{{ 'admin.assignments.request' | translate }}</span>
            <select class="mt-1 w-full glass rounded-xl px-3 py-2 outline-none" [(ngModel)]="selectedRequestId">
              <option [ngValue]="null">{{ 'admin.assignments.pick_request' | translate }}</option>
              <option *ngFor="let request of requests()" [ngValue]="request.id">
                {{ request.requestNumber }} - {{ request.entityName }} ({{ statusLabel(request.status) | translate }})
              </option>
            </select>
          </label>

          <label class="block">
            <span class="text-xs text-white/50">{{ 'admin.assignments.stage' | translate }}</span>
            <select class="mt-1 w-full glass rounded-xl px-3 py-2 outline-none" [(ngModel)]="stage" (ngModelChange)="loadReviewers()">
              <option value="INITIAL_EVALUATION">{{ 'admin.assignments.initial' | translate }}</option>
              <option value="ADMIN_REVIEW">{{ 'admin.assignments.admin_review' | translate }}</option>
              <option value="FIELD_REVIEW">{{ 'admin.assignments.field_review' | translate }}</option>
            </select>
          </label>

          <label class="block">
            <span class="text-xs text-white/50">{{ 'admin.assignments.member' | translate }}</span>
            <select class="mt-1 w-full glass rounded-xl px-3 py-2 outline-none" [(ngModel)]="selectedReviewerId">
              <option [ngValue]="null">{{ 'admin.assignments.pick_member' | translate }}</option>
              <option *ngFor="let reviewer of reviewers()" [ngValue]="reviewer.id">
                {{ reviewer.fullName }} - {{ reviewer.email }}
              </option>
            </select>
          </label>

          <button type="button"
                  class="px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 font-semibold disabled:opacity-40"
                  [disabled]="!selectedRequestId || !selectedReviewerId || busy()"
                  (click)="assign()">
            {{ 'admin.assignments.assign' | translate }}
          </button>
        </div>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <div class="grid grid-cols-[1fr_1.2fr_.9fr_1.2fr_.7fr] gap-3 px-4 py-3 text-xs uppercase text-white/45 border-b border-white/10">
          <span>{{ 'admin.assignments.request' | translate }}</span>
          <span>{{ 'admin.assignments.entity' | translate }}</span>
          <span>{{ 'admin.assignments.stage' | translate }}</span>
          <span>{{ 'admin.assignments.member' | translate }}</span>
          <span>{{ 'admin.assignments.mode' | translate }}</span>
        </div>
        <div *ngIf="assignments().length === 0" class="p-8 text-center text-white/55">{{ 'admin.assignments.empty' | translate }}</div>
        <div *ngFor="let item of assignments()"
             class="grid grid-cols-[1fr_1.2fr_.9fr_1.2fr_.7fr] gap-3 px-4 py-4 items-center border-b border-white/5">
          <div>
            <div class="font-semibold">{{ item.requestNumber }}</div>
            <div class="text-xs text-white/45">{{ statusLabel(item.status) | translate }}</div>
          </div>
          <span class="truncate">{{ item.entityName }}</span>
          <span class="aq-badge aq-badge-info">{{ stageLabel(item.stage) | translate }}</span>
          <div>
            <div>{{ item.assignedUserName }}</div>
            <div class="text-xs text-white/45">{{ item.assignedUserEmail }}</div>
          </div>
          <span class="aq-badge" [ngClass]="item.auto ? 'aq-badge-success' : 'aq-badge-neutral'">
            {{ (item.auto ? 'admin.assignments.auto' : 'admin.assignments.manual') | translate }}
          </span>
        </div>
      </div>
    </aq-page-shell>
  `
})
export class AssignmentsComponent implements OnInit {
  private api = inject(ApiService);
  private toastr = inject(ToastrService);
  private t = inject(TranslateService);

  requests = signal<RequestSummary[]>([]);
  reviewers = signal<Reviewer[]>([]);
  assignments = signal<Assignment[]>([]);
  busy = signal(false);

  selectedRequestId: number | null = null;
  selectedReviewerId: number | null = null;
  stage = 'INITIAL_EVALUATION';

  ngOnInit(): void {
    this.load();
    this.loadReviewers();
  }

  load(): void {
    this.api.get<RequestSummary[]>('/admin/assignments/requests').subscribe(rows => this.requests.set(rows));
    this.api.get<Assignment[]>('/admin/assignments').subscribe(rows => this.assignments.set(rows));
  }

  loadReviewers(): void {
    this.selectedReviewerId = null;
    const roleCode = this.stage === 'INITIAL_EVALUATION'
      ? 'ROLE_EVALUATOR'
      : this.stage === 'ADMIN_REVIEW'
        ? 'ROLE_ADMIN_REVIEWER'
        : 'ROLE_FIELD_REVIEWER';
    this.api.get<Reviewer[]>('/admin/assignments/reviewers', { roleCode }).subscribe(rows => this.reviewers.set(rows));
  }

  assign(): void {
    if (!this.selectedRequestId || !this.selectedReviewerId) return;
    this.busy.set(true);
    this.api.post<Assignment>('/admin/assignments', {
      requestId: this.selectedRequestId,
      stage: this.stage,
      assignedUserId: this.selectedReviewerId
    }).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastr.success(this.t.instant('admin.assignments.assigned_ok'));
        this.load();
      },
      error: err => {
        this.busy.set(false);
        this.toastr.error(err?.error?.error || this.t.instant('admin.assignments.assign_failed'));
      }
    });
  }

  statusLabel(status: string): string {
    return `status.${status.toLowerCase()}`;
  }

  stageLabel(stage: string): string {
    return `admin.assignments.stages.${stage}`;
  }
}
