export const STATUS_STYLES: Record<string, string> = {
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Boarding: 'bg-amber-50 text-amber-700 border-amber-200',
  Delayed: 'bg-red-50 text-red-700 border-red-200',
  Departed: 'bg-slate-100 text-slate-600 border-slate-200',
  Arrived: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Available: 'bg-green-50 text-green-700 border-green-200',
  Occupied: 'bg-blue-50 text-blue-700 border-blue-200',
  Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function statusBadgeClass(status: string): string {
  return STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const NEGATIVE_STATUSES = new Set(['Delayed', 'Cancelled']);

export function statusDotClass(status: string): string {
  return NEGATIVE_STATUSES.has(status) ? 'bg-red-500' : 'bg-green-500';
}

export function statusTextClass(status: string): string {
  return NEGATIVE_STATUSES.has(status) ? 'text-red-600' : 'text-slate-700';
}
