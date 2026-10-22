import { format, formatDistanceToNow, isPast, isWithinInterval, addDays, differenceInDays } from 'date-fns';

/**
 * Returns membership status: 'active' | 'expiring' | 'expired'
 * 'expiring' = expires within the next 7 days
 */
export function getMembershipStatus(expirationDate) {
  const expiry = new Date(expirationDate);
  const now = new Date();

  if (isPast(expiry)) return 'expired';

  const sevenDaysFromNow = addDays(now, 7);
  if (isWithinInterval(expiry, { start: now, end: sevenDaysFromNow })) return 'expiring';

  return 'active';
}

export function formatExpiry(expirationDate) {
  const expiry = new Date(expirationDate);
  if (isPast(expiry)) {
    return `Expired ${formatDistanceToNow(expiry, { addSuffix: true })}`;
  }
  return `Expires ${formatDistanceToNow(expiry, { addSuffix: true })}`;
}

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date) {
  return format(new Date(date), 'MMM d, yyyy • h:mm a');
}

/**
 * Returns days remaining until expiration.
 * Negative means already expired by that many days.
 */
export function daysLeft(expirationDate) {
  return differenceInDays(new Date(expirationDate), new Date());
}
