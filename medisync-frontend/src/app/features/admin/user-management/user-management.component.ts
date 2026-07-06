import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';

  currentPage = 1;
  pageSize = 10;

  // Confirmation modal
  showModal = false;
  modalAction: 'block' | 'unblock' | '' = '';
  modalTarget: User | null = null;
  isProcessing = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(page => { this.users = page.content; });
  }

  get filteredUsers(): User[] {
    return this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = this.roleFilter === 'all' || u.role === this.roleFilter;
      const matchStatus = this.statusFilter === 'all' || u.status === this.statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) { this.currentPage = page; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  // Modal actions
  openBlockModal(user: User): void {
    this.modalTarget = user;
    this.modalAction = 'block';
    this.showModal = true;
  }

  openUnblockModal(user: User): void {
    this.modalTarget = user;
    this.modalAction = 'unblock';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalTarget = null;
    this.modalAction = '';
  }

  confirmAction(): void {
    if (!this.modalTarget) return;
    this.isProcessing = true;

    const id = this.modalTarget.userId;
    const action$ = this.modalAction === 'block'
      ? this.adminService.blockUser(id)
      : this.adminService.unblockUser(id);

    action$.subscribe({
      next: () => {
        this.isProcessing = false;
        this.closeModal();
        this.loadUsers();
      },
      error: () => {
        this.isProcessing = false;
        this.closeModal();
      }
    });
  }
}
