export { DotlyApiClient, apiClient, AuthToken, LoginResponse } from './api';
export type { LoginRequest, ApiResponse } from './api';

export { StorageAdapter, initStorage, storage } from './storage';
export type { StorageItem } from './storage';

export { OfflineQueue, offlineQueue } from './offline';
export type { QueuedTransaction } from './offline';

// Types
export interface Branch {
  id: string;
  name: string;
  address?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dotsBalance: number;
  createdAt?: string;
}

export interface Deal {
  id: string;
  name: string;
  description?: string;
  conditions: Record<string, any>;
  benefits: Record<string, any>;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  costDots: number;
  category?: string;
  isActive: boolean;
}

export interface Visit {
  id: string;
  customerId: string;
  branchId: string;
  amount: number;
  dotsEarned: number;
  totalDots: number;
  createdAt: string;
}

export interface StaffAssignment {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  branchName: string;
  permissionLevel: 'Staff' | 'Supervisor' | 'Manager';
  isActive: boolean;
  assignedAt: string;
}
