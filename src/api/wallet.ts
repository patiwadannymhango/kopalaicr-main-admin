import { apiFetch } from './client';
import type { WalletBalance } from '../types';

export async function getWalletBalance(): Promise<WalletBalance> {
  return apiFetch('/api/v1/payments/admin/wallet-balance/');
}

/** Lipila's raw response is `{ success, message, data: { balance } }` — pull just the number. */
export function liveBalanceAmount(live: WalletBalance['live_balance']): number | null {
  if (!live || typeof live !== 'object') return null;
  const data = (live as { data?: { balance?: unknown } }).data;
  return typeof data?.balance === 'number' ? data.balance : null;
}
