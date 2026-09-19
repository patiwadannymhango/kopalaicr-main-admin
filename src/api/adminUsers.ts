import { apiFetch } from './client';
import type { AdminUser } from '../types';

const BASE = '/api/v1/auth/admin/users';

export async function listAdminUsers(search?: string): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  return apiFetch(`${BASE}/?${query.toString()}`);
}

export interface AdminUserCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  is_superuser: boolean;
}

export async function createAdminUser(payload: AdminUserCreatePayload): Promise<AdminUser> {
  return apiFetch(`${BASE}/create/`, { method: 'POST', body: payload });
}

export interface AdminUserUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export async function updateAdminUser(id: string, payload: AdminUserUpdatePayload): Promise<AdminUser> {
  return apiFetch(`${BASE}/${id}/`, { method: 'PATCH', body: payload });
}
