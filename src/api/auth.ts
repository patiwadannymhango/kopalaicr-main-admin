import { apiFetch } from './client';
import type { AdminUser } from '../types';

export async function getMe(): Promise<AdminUser> {
  return apiFetch('/api/v1/auth/me/');
}
