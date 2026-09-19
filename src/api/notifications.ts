import { apiFetch } from './client';
import type { NotificationRecord, Paginated } from '../types';

const BASE = '/api/v1/notifications/admin';

export interface NotificationListParams {
  search?: string;
  status?: string;
  channel?: string;
  page?: number;
}

export async function listNotifications(params: NotificationListParams): Promise<Paginated<NotificationRecord>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.channel) query.set('channel', params.channel);
  if (params.page) query.set('page', String(params.page));
  return apiFetch(`${BASE}/?${query.toString()}`);
}

export async function resendNotification(id: string, recipient: string): Promise<NotificationRecord> {
  return apiFetch(`${BASE}/${id}/resend/`, { method: 'POST', body: { recipient } });
}
