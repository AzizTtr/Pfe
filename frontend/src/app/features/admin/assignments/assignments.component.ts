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

      <div class="assignment-card glass rounded-2xl p-5 mb-4">
        <div class="assignment-form-grid">
          <label class="assignment-field">
            <span>{{ 'admin.assignments.request' | translate }}</span>
            <select [(ngModel)]="selectedRequestId">
              <option [ngValue]="null">{{ 'admin.assignments.pick_request' | translate }}</option>
              <option *ngFor="let request of requests()" [ngValue]="request.id">
                {{ request.requestNumber }} - {{ request.entityName }} ({{ statusLabel(request.status) | translate }})
              </option>
            </select>
          </label>

          <label class="assignment-field">
            <span>{{ 'admin.assignments.stage' | translate }}</span>
            <select [(ngModel)]="stage" (ngModelChange)="loadReviewers()">
              <option value="INITIAL_EVALUATION">{{ 'admin.assignments.initial' | translate }}</option>
              <option value="ADMIN_REVIEW">{{ 'admin.assignments.admin_review' | translate }}</option>
              <option value="FIELD_REVIEW">{{ 'admin.assignments.field_review' | translate }}</option>
            </select>
          </label>

          <label class="assignment-field">
            <span>{{ 'admin.assignments.member' | translate }}</span>
            <select [(ngModel)]="selectedReviewerId">
              <option [ngValue]="null">{{ 'admin.assignments.pick_member' | translate }}</option>
              <option *ngFor="let reviewer of reviewers()" [ngValue]="reviewer.id">
                {{ reviewer.fullName }} - {{ reviewer.email }}
              </option>
            </select>
          </label>

          <button type="button"
                  class="assignment-submit"
                  [disabled]="!selectedRequestId || !selectedReviewerId || busy()"
                  (click)="assign()">
            {{ 'admin.assignments.assign' | translate }}
          </button>
        </div>
      </div>

      <div class="assignment-table glass rounded-2xl overflow-hidden">
        <div class="assignment-row assignment-head">
          <span class="assignment-cell">{{ 'admin.assignments.request' | translate }}</span>
          <span class="assignment-cell">{{ 'admin.assignments.entity' | translate }}</span>
          <span class="assignment-cell">{{ 'admin.assignments.stage' | translate }}</span>
          <span class="assignment-cell">{{ 'admin.assignments.member' | translate }}</span>
          <span class="assignment-cell">{{ 'admin.assignments.mode' | translate }}</span>
        </div>
        <div *ngIf="assignments().length === 0" class="p-8 text-center text-white/55">{{ 'admin.assignments.empty' | translate }}</div>
        <div *ngFor="let item of assignments()"
             class="assignment-row">
          <div class="assignment-cell">
            <div class="font-semibold assignment-request-number">{{ item.requestNumber }}</div>
            <div class="text-xs text-white/45">{{ statusLabel(item.status) | translate }}</div>
          </div>
          <span class="assignment-cell truncate">{{ item.entityName }}</span>
          <span class="assignment-cell"><span class="aq-badge aq-badge-info assignment-badge">{{ stageLabel(item.stage) | translate }}</span></span>
          <div class="assignment-cell min-w-0">
            <div class="truncate">{{ item.assignedUserName }}</div>
            <div class="text-xs text-white/45 truncate">{{ item.assignedUserEmail }}</div>
          </div>
          <span class="assignment-cell"><span class="aq-badge assignment-badge" [ngClass]="item.auto ? 'aq-badge-success' : 'aq-badge-neutral'">
            {{ (item.auto ? 'admin.assignments.auto' : 'admin.assignments.manual') | translate }}
          </span></span>
        </div>
      </div>
    </aq-page-shell>
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 5.5rem;
    }

    .assignment-card,
    .assignment-table {
      border-color: rgba(255,255,255,.1);
    }

    .assignment-form-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: .85rem;
      align-items: end;
    }

    @media (min-width: 1024px) {
      .assignment-form-grid {
        grid-template-columns: minmax(16rem, 1fr) minmax(13rem, .58fr) minmax(16rem, 1fr) minmax(8.5rem, auto);
      }
    }

    .assignment-field {
      display: grid;
      gap: .4rem;
      min-width: 0;
    }

    .assignment-field span {
      color: rgba(255,255,255,.5);
      font-size: .72rem;
      font-weight: 800;
    }

    .assignment-field select {
      width: 100%;
      min-width: 0;
      min-height: 2.85rem;
      border-radius: .8rem;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(15,23,42,.48);
      color: white;
      outline: none;
      padding: .62rem .8rem;
      color-scheme: dark;
    }

    .assignment-field select:focus {
      border-color: rgba(45,212,191,.45);
      box-shadow: 0 0 0 3px rgba(20,184,166,.12);
    }

    .assignment-submit {
      min-height: 2.85rem;
      border-radius: .8rem;
      background: rgba(5,150,105,.9);
      color: white;
      font-weight: 850;
      padding: .65rem 1.2rem;
      transition: transform .16s ease, background .16s ease, opacity .16s ease;
    }

    .assignment-submit:hover:not(:disabled) {
      background: rgba(16,185,129,.95);
      transform: translateY(-1px);
    }

    .assignment-submit:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .assignment-table {
      margin-bottom: 1rem;
    }

    .assignment-row {
      display: grid;
      grid-template-columns: minmax(12rem, 1.1fr) minmax(11rem, 1fr) minmax(12rem, .9fr) minmax(13rem, 1.15fr) minmax(8rem, .65fr);
      gap: 1.1rem;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,.055);
    }

    .assignment-head {
      padding-block: .85rem;
      color: rgba(255,255,255,.45);
      font-size: .72rem;
      font-weight: 850;
      text-transform: uppercase;
    }

    .assignment-cell {
      min-width: 0;
    }

    .assignment-request-number {
      overflow-wrap: anywhere;
      line-height: 1.25;
    }

    .assignment-badge {
      width: 100%;
      justify-content: center;
      min-height: 1.45rem;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .assignment-table {
        overflow-x: auto;
      }

      .assignment-row {
        min-width: 58rem;
      }
    }
  `]
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
