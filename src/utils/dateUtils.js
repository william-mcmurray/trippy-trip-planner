import { MAX_TRIP_DAYS, MIN_TRIP_DAYS } from './constants';

/**
 * Calculate the number of days in a trip (inclusive of start and end).
 */
export function getTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Format a date string (YYYY-MM-DD) for display.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {Intl.DateTimeFormatOptions} [options] - toLocaleDateString options
 *   Defaults to { month: 'short', day: 'numeric', year: 'numeric' }
 */
export function formatDate(dateStr, options) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Validate a start/end date range for trip planning.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDateRange(startDate, endDate) {
  const today = new Date().toISOString().split('T')[0];
  if (!startDate) return { valid: false, error: 'Please select a start date' };
  if (!endDate) return { valid: false, error: 'Please select an end date' };
  if (startDate < today) return { valid: false, error: 'Start date must not be in the past' };
  if (endDate <= startDate) return { valid: false, error: 'End date must be after start date' };

  const days = getTripDays(startDate, endDate);
  if (days < MIN_TRIP_DAYS) return { valid: false, error: 'Trip must be at least 1 day' };
  if (days > MAX_TRIP_DAYS) return { valid: false, error: `Trippy supports trips of up to ${MAX_TRIP_DAYS} days. Please adjust your dates.` };

  return { valid: true };
}
