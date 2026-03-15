import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(val: string | number) {
  const num = typeof val === 'number' ? val.toString() : val.replace(/\D/g, "")
  if (!num) return ""
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export function parsePrice(val: string) {
  return val.replace(/\D/g, "")
}

/**
 * Devuelve el día de la semana (0-6, 0=Dom) en la zona horaria de Colombia (-05:00)
 */
export function getBogotaDay(date: Date): number {
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/Bogota'
  }).format(date)
  const dayMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
  return dayMap[weekdayStr] ?? 0
}

/**
 * Devuelve la fecha en formato YYYY-MM-DD en la zona horaria de Colombia
 */
export function getBogotaISO(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;

  return `${y}-${m}-${d}`;
}
