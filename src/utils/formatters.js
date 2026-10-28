/**
 * Indian Rupee and Date formatting utilities
 */

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateBookingReference() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `F2V-BK-${randomNum}`;
}

export function calculateDaysBetween(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start & end
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Checks if two date ranges overlap.
 * Date strings formatted as YYYY-MM-DD
 */
export function doDateRangesOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
}

export function formatDateReadable(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
