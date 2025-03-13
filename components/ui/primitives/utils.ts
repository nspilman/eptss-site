import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const primitiveComponent = <T extends { displayName?: string }>(component: T, displayName?: string): T => {
  if (displayName) component.displayName = displayName
  return component
}
