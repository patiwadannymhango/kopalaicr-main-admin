// Mirrors the choice enums in the backend (backend/apps/registrations/models.py,
// backend/apps/payments/models.py) — kept here as plain constants since the
// admin API doesn't expose a generic "choices" endpoint for these.

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const AGE_RANGE_OPTIONS = ['Under 18', '18-29', '30-39', '40-49', '50-59', '60+'];

export const RELAY_CATEGORY_OPTIONS = [
  { value: 'mens-team', label: "Men's Team" },
  { value: 'womens-team', label: "Women's Team" },
  { value: 'mixed-team', label: 'Mixed Team' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'MTN_MONEY', label: 'MTN Money' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'ZAMTEL_KWACHA', label: 'Zamtel Kwacha' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
];
