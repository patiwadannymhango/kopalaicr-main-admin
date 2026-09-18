export function money(amount: string | number, currency = 'ZMW'): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${currency} 0.00`;
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function date(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}
