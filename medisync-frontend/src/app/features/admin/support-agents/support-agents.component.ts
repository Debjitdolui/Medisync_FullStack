import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SupportService } from '../../../core/services/support.service';
import { SupportAgent } from '../../../core/models/support.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-support-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './support-agents.component.html',
  styleUrl: './support-agents.component.scss'
})
export class SupportAgentsComponent implements OnInit {
  agents: SupportAgent[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Add Agent Modal
  showAddModal = false;
  newAgent = { fullName: '', email: '', password: '', phone: '' };
  isCreating = false;

  // Confirm Modal
  showConfirmModal = false;
  confirmAction: 'block' | 'unblock' = 'block';
  confirmTarget: SupportAgent | null = null;
  isProcessing = false;

  constructor(
    private supportService: SupportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoading = true;
    this.supportService.getSupportAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load support agents', 'Error');
        this.isLoading = false;
      }
    });
  }

  get paginatedAgents(): SupportAgent[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.agents.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  // Add Agent
  openAddModal(): void {
    this.newAgent = { fullName: '', email: '', password: '', phone: '' };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  createAgent(): void {
    if (!this.newAgent.fullName.trim() || !this.newAgent.email.trim() || !this.newAgent.password.trim() || !this.newAgent.phone.trim()) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    this.isCreating = true;
    this.supportService.createSupportAgent(this.newAgent).subscribe({
      next: () => {
        this.toastr.success('Support agent created successfully', 'Success');
        this.showAddModal = false;
        this.isCreating = false;
        this.loadAgents();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to create agent', 'Error');
        this.isCreating = false;
      }
    });
  }

  // Block / Unblock
  openBlockModal(agent: SupportAgent): void {
    this.confirmTarget = agent;
    this.confirmAction = 'block';
    this.showConfirmModal = true;
  }

  openUnblockModal(agent: SupportAgent): void {
    this.confirmTarget = agent;
    this.confirmAction = 'unblock';
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmTarget = null;
  }

  confirmActionExecute(): void {
    if (!this.confirmTarget) return;

    this.isProcessing = true;
    const action$ = this.confirmAction === 'block'
      ? this.supportService.blockAgent(this.confirmTarget.userId)
      : this.supportService.unblockAgent(this.confirmTarget.userId);

    action$.subscribe({
      next: () => {
        this.toastr.success(
          `Agent ${this.confirmAction === 'block' ? 'blocked' : 'unblocked'} successfully`,
          'Success'
        );
        this.isProcessing = false;
        this.closeConfirmModal();
        this.loadAgents();
      },
      error: () => {
        this.toastr.error(`Failed to ${this.confirmAction} agent`, 'Error');
        this.isProcessing = false;
      }
    });
  }
}
