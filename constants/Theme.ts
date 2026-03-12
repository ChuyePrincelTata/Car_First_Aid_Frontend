/**
 * Theme.ts — Single source of truth for all non-colour design tokens.
 *
 * Why this file exists:
 * React Native has no CSS, so we centralise spacing, radii, typography,
 * and shadow presets here.  Colours live in Colors.ts.
 * Import what you need: import { Spacing, Radius, Typography, Shadows } from '@/constants/Theme'
 */

// ─── Spacing scale (multiples of 4) ────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  xxl: 32,
  xxxl: 48,
} as const

// ─── Border radii ───────────────────────────────────────────────────────────
export const Radius = {
  sm:    6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 9999, // pill / circle
} as const

// ─── Typography scale ───────────────────────────────────────────────────────
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 34,
} as const

export const FontFamily = {
  regular: "Poppins-Regular",
  medium:  "Poppins-Medium",
  bold:    "Poppins-Bold",
} as const

// ─── Shadow presets (cross-platform) ────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
} as const

// ─── Input heights ───────────────────────────────────────────────────────────
export const InputHeight = {
  md: 52,
  lg: 60,
} as const

// ─── Header ─────────────────────────────────────────────────────────────────
export const HeaderHeight = 64
