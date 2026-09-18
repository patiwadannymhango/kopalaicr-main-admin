import { apiFetch } from './client';
import type { Paginated, Withdrawal } from '../types';

export async function listWithdrawals(entryType: 'INDIVIDUAL' | 'TEAM'): Promise<Paginated<Withdrawal>> {
  return apiFetch(`/api/v1/payments/admin/withdrawals/?entry_type=${entryType}`);
}

export interface WithdrawalCreatePayload {
  entry_type: 'INDIVIDUAL' | 'TEAM';
  amount: string;
  narration?: string;
}

export async function createWithdrawal(payload: WithdrawalCreatePayload): Promise<Withdrawal> {
  return apiFetch('/api/v1/payments/admin/withdrawals/', { method: 'POST', body: payload });
}
