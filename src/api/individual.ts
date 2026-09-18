import { apiFetch, apiFetchBlob } from './client';
import type {
  BulkUploadReport,
  DashboardStats,
  IndividualFilterOptions,
  IndividualRegistration,
  Paginated,
} from '../types';

const BASE = '/api/v1/registrations/admin/individual';

export async function getIndividualDashboard(): Promise<DashboardStats> {
  return apiFetch(`${BASE}/dashboard/`);
}

export async function getIndividualFilters(): Promise<IndividualFilterOptions> {
  return apiFetch(`${BASE}/filters/`);
}

export interface IndividualListParams {
  search?: string;
  status?: string;
  category?: string;
  gender?: string;
  organisation?: string;
  ordering?: string;
  page?: number;
}

export async function listIndividualRegistrations(
  params: IndividualListParams
): Promise<Paginated<IndividualRegistration>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  if (params.gender) query.set('gender', params.gender);
  if (params.organisation) query.set('organisation', params.organisation);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.page) query.set('page', String(params.page));
  return apiFetch(`${BASE}/registrations/?${query.toString()}`);
}

export async function getIndividualRegistration(id: string): Promise<IndividualRegistration> {
  return apiFetch(`${BASE}/registrations/${id}/`);
}

export interface IndividualUpdatePayload {
  full_name?: string;
  phone?: string;
  gender?: string;
  age_range?: string;
  country?: string;
  t_shirt_size?: string;
  division?: string;
  town_or_city?: string;
  club_or_institution?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  status?: string;
}

export async function updateIndividualRegistration(
  id: string,
  payload: IndividualUpdatePayload
): Promise<IndividualRegistration> {
  return apiFetch(`${BASE}/registrations/${id}/`, { method: 'PATCH', body: payload });
}

export async function deleteIndividualRegistration(id: string): Promise<void> {
  return apiFetch(`${BASE}/registrations/${id}/`, { method: 'DELETE' });
}

export interface IndividualCreatePayload {
  category_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  gender?: string;
  age_range?: string;
  country?: string;
  t_shirt_size?: string;
  division?: string;
  town_or_city?: string;
  club_or_institution?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  status?: string;
  payment_method?: string;
}

export async function createIndividualRegistration(
  payload: IndividualCreatePayload
): Promise<IndividualRegistration> {
  return apiFetch(`${BASE}/registrations/create/`, { method: 'POST', body: payload });
}

export async function downloadIndividualExport(): Promise<Blob> {
  return apiFetchBlob(`${BASE}/registrations/export/`);
}

export async function downloadIndividualBulkTemplate(): Promise<Blob> {
  return apiFetchBlob(`${BASE}/registrations/bulk-upload/template/`);
}

export async function bulkUploadIndividual(file: File): Promise<BulkUploadReport> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch(`${BASE}/registrations/bulk-upload/`, { method: 'POST', body: formData, isFormData: true });
}
