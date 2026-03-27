// ── Date helpers ──────────────────────────────────────────

/**
 * Format a date string or Date object to "Mon 3 Mar 2026"
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a time string "HH:MM:SS" to "10:30 AM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [hh, mm] = timeStr.split(':');
  const h = parseInt(hh);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${mm} ${period}`;
}

/**
 * Returns true if date is today
 */
export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

// ── String helpers ────────────────────────────────────────

/**
 * Capitalise first letter of a string
 */
export function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get initials from a full name, e.g. "Sarah Murphy" → "SM"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Status helpers ────────────────────────────────────────

/**
 * Returns Tailwind colour classes for appointment status pills
 */
export function statusClasses(status) {
  const map = {
    upcoming:  'bg-teal-50 text-teal-600',
    confirmed: 'bg-teal-50 text-teal-600',
    completed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600',
  };
  return map[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-500';
}

/**
 * Returns Tailwind colour classes for consultation type pills
 */
export function typeClasses(type) {
  if (!type) return 'bg-gray-100 text-gray-500';
  return type.toLowerCase().includes('video')
    ? 'bg-blue-50 text-blue-600'
    : 'bg-gray-100 text-gray-600';
}

// ── Validation helpers ────────────────────────────────────

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^[\d\s\+\-\(\)]{7,15}$/.test(phone);
}
