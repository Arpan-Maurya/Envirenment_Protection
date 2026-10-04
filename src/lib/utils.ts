import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Activity } from "../types"

/** XP required per eco level step */
export const XP_PER_LEVEL = 500

/**
 * Eco Level depends ONLY on Lifetime XP and never decreases.
 * Level starts at 1 and advances every XP_PER_LEVEL lifetime points.
 */
export function ecoLevelFromLifetimeXp(lifetimeXp: number): number {
  if (!lifetimeXp || isNaN(lifetimeXp) || lifetimeXp < 0) return 1
  return Math.floor(lifetimeXp / XP_PER_LEVEL) + 1
}

/**
 * Utility to merge Tailwind class names */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safe division, returns fallback if denominator is invalid */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!denominator || isNaN(denominator) || !isFinite(denominator)) return fallback;
  return numerator / denominator;
}

/** Carbon equivalency constants used for converting CO₂ amounts to human‑readable impacts. */
export const CO2_PER_TREE = 21.77 // kg CO₂ per tree per year (EPA)
export const CO2_PER_KM_PETROL = 0.17 // kg CO₂ per kilometre (average petrol car)
export const CO2_PER_PHONE_CHARGE = 0.00822 // kg CO₂ per phone charge

/** Convert a CO₂ amount (kg) into a readable equivalency string.
 * Returns an empty string for non‑positive inputs.
 */
export function carbonEquivalency(kgCO2: number): string {
  if (!kgCO2 || isNaN(kgCO2) || kgCO2 <= 0) return ''

  const trees = (kgCO2 / CO2_PER_TREE).toFixed(1)
  const kmDriven = Math.round(kgCO2 / CO2_PER_KM_PETROL)
  const phoneCharges = Math.round(kgCO2 / CO2_PER_PHONE_CHARGE)

  if (kgCO2 >= 100) return `≈ ${trees} trees worth of annual absorption`
  if (kgCO2 >= 20) return `≈ ${kmDriven} km not driven by a petrol car`
  return `≈ ${phoneCharges} phone charges avoided`
}

/**
 * Helper to construct an Activity payload.
 * Returns an object suitable for storage in Firestore.
 */
export function createActivity(
  type: Activity['type'],
  title: string,
  description: string,
  metadata?: Record<string, unknown>
): Omit<Activity, 'id'> {
  return {
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    metadata: metadata ?? {}
  }
}
