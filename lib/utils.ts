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
