export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeUntil(iso: string, now: Date = new Date()): string {
  const target = new Date(iso).getTime();
  const diff = target - now.getTime();
  if (diff < 0) return "passed";
  const days = Math.floor(diff / 86_400_000);
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "tomorrow";
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1) return `in ${hours}h`;
  const minutes = Math.floor(diff / 60_000);
  return `in ${minutes}m`;
}
