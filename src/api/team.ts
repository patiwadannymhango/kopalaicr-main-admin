import { apiFetch, apiFetchBlob } from './client';
import type { DashboardStats, Paginated, TeamFilterOptions, TeamRegistration } from '../types';

const BASE = '/api/v1/registrations/admin/team';

export async function getTeamDashboard(): Promise<DashboardStats> {
  return apiFetch(`${BASE}/dashboard/`);
}

export async function getTeamFilters(): Promise<TeamFilterOptions> {
  return apiFetch(`${BASE}/filters/`);
}

export interface TeamListParams {
  search?: string;
  status?: string;
  category?: string;
  relay_category?: string;
  ordering?: string;
  page?: number;
}

export async function listTeamRegistrations(params: TeamListParams): Promise<Paginated<TeamRegistration>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  if (params.relay_category) query.set('relay_category', params.relay_category);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.page) query.set('page', String(params.page));
  return apiFetch(`${BASE}/registrations/?${query.toString()}`);
}

export async function getTeamRegistration(id: string): Promise<TeamRegistration> {
  return apiFetch(`${BASE}/registrations/${id}/`);
}

export interface TeamUpdatePayload {
  team_name?: string;
  company_or_institution?: string;
  relay_category?: string;
  captain_first_name?: string;
  captain_last_name?: string;
  captain_phone?: string;
  status?: string;
}

export async function updateTeamRegistration(id: string, payload: TeamUpdatePayload): Promise<TeamRegistration> {
  return apiFetch(`${BASE}/registrations/${id}/`, { method: 'PATCH', body: payload });
}

export async function deleteTeamRegistration(id: string): Promise<void> {
  return apiFetch(`${BASE}/registrations/${id}/`, { method: 'DELETE' });
}

export interface TeamCreatePayload {
  team_name: string;
  company_or_institution: string;
  relay_category: string;
  captain_first_name: string;
  captain_last_name: string;
  captain_email: string;
  captain_phone: string;
  roster: { fullName: string; gender?: string }[];
  status?: string;
  payment_method?: string;
}

export async function createTeamRegistration(payload: TeamCreatePayload): Promise<TeamRegistration> {
  return apiFetch(`${BASE}/registrations/create/`, { method: 'POST', body: payload });
}

export async function downloadTeamExport(): Promise<Blob> {
  return apiFetchBlob(`${BASE}/registrations/export/`);
}
