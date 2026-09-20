export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  price: string;
  currency: string;
}

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  age_range: string;
  country: string;
}

export interface IndividualRegistration {
  id: string;
  registration_number: string | null;
  status: string;
  amount: string;
  currency: string;
  participant: Participant;
  category: string;
  category_name: string;
  category_code: string;
  t_shirt_size: string;
  division: string;
  town_or_city: string;
  club_or_institution: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_notes: string;
  registered_at: string;
  updated_at: string;
}

export interface RosterRunner {
  id: string;
  full_name: string;
  gender: string;
}

export interface TeamRegistration {
  id: string;
  registration_number: string | null;
  status: string;
  amount: string;
  currency: string;
  team_name: string;
  company_or_institution: string;
  relay_category: string;
  captain_first_name: string;
  captain_last_name: string;
  captain_email: string;
  captain_phone: string;
  free_runner_limit: number;
  roster: RosterRunner[];
  category: string;
  category_name: string;
  registered_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_registrations: number;
  today_count: number;
  by_status: { status: string; count: number }[];
  revenue_confirmed: string;
  revenue_pending: string;
  revenue_today: string;
  total_income: string;
  cash_withdrawn: string;
  cash_available: string;
}

export interface IndividualFilterOptions {
  categories: Category[];
  genders: string[];
  organisations: string[];
}

export interface TeamFilterOptions {
  categories: Category[];
  relay_categories: string[];
}

export interface NotificationRecord {
  id: string;
  channel: 'EMAIL' | 'SMS';
  notification_type: string;
  recipient: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message: string;
  registration_number: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface WalletBalance {
  // Lipila's raw response, typically { success, message, data: { balance } } —
  // see liveBalanceAmount() in api/wallet.ts. Shape isn't fully known
  // until a real call succeeds, so this stays loose.
  live_balance: Record<string, unknown> | null;
  live_balance_error: string | null;
}

export interface Withdrawal {
  id: string;
  entry_type: 'INDIVIDUAL' | 'TEAM';
  amount: string;
  currency: string;
  narration: string;
  withdrawn_by_name: string;
  withdrawn_at: string;
}

export interface BulkUploadReport {
  created_count: number;
  created_references: string[];
  error_count: number;
  errors: { row: number; error: string }[];
}

// Mirrors BaseRegistration.Status in the backend
// (backend/apps/common/models.py).
export const STATUS_OPTIONS = [
  'PENDING_PAYMENT',
  'PAYMENT_PROCESSING',
  'CONFIRMED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
];

export const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  PAYMENT_PROCESSING: 'info',
  CONFIRMED: 'success',
  CANCELLED: 'default',
  EXPIRED: 'default',
  REFUNDED: 'error',
};
