/**
 * Colors.ts — Centralised colour palette for light and dark themes.
 *
 * To change the brand colour across the entire app, edit ONE line here.
 * All components consume colours via useTheme() → colors.X.
 *
 * Token guide:
 *   primary     — main brand accent (buttons, active icons, links)
 *   secondary   — card/surface backgrounds in dark mode
 *   background  — page background
 *   card        — elevated surface (cards, inputs)
 *   text        — primary body text
 *   subtext     — secondary / placeholder text
 *   border      — dividers and input outlines
 *   buttonText  — text on top of primary-coloured buttons
 *                 (important: yellow buttons need DARK text in both modes)
 *   tint        — alias for primary (expo-router convention)
 *   tabIconDefault / tabIconSelected — bottom tab icons
 *   notification / error / success / warning — semantic colours
 */

const tintColorLight = "#1a237e"   // deep navy
const tintColorDark  = "#FFD700"   // golden yellow

const Colors = {
  light: {
    // Brand
    primary:     "#1a237e",  // deep navy blue
    primaryLight:"#e8eaf6",  // very light tint of primary (input focus bg, etc.)
    accent:      "#FFD700",  // golden yellow (used for gradient buttons)

    // Surfaces
    background:  "#f4f7fb",  // soft off-white blue-tinted page bg
    card:        "#ffffff",  // white card / input surface
    overlay:     "rgba(26, 35, 126, 0.06)", // subtle primary tint overlay

    // Text
    text:        "#1a1f36",  // near-black for readability
    subtext:     "#6b7280",  // muted secondary text / placeholders
    inverse:     "#ffffff",  // text on dark surfaces

    // Interactive
    buttonText:  "#1a237e",  // text ON a yellow gradient button (must contrast yellow)
    tint:        tintColorLight,
    tabIconDefault:  "#9ca3af",
    tabIconSelected: tintColorLight,

    // Borders
    border:      "#e2e8f0",

    // Semantic
    notification: "#ef4444",
    error:        "#ef4444",
    success:      "#22c55e",
    warning:      "#f59e0b",

    // Aliases (kept for compatibility)
    secondary: "#ffffff",
  },

  dark: {
    // Brand
    primary:     "#FFD700",  // golden yellow — pops on dark
    primaryLight:"#2a2400",  // very dark yellow-tinted surface
    accent:      "#FFD700",

    // Surfaces
    background:  "#0f0f11",  // near-black page bg
    card:        "#1a1a1e",  // slightly elevated surface
    overlay:     "rgba(255, 215, 0, 0.06)",

    // Text
    text:        "#f1f5f9",  // near-white for readability on dark bg
    subtext:     "#94a3b8",  // muted secondary text / placeholders
    inverse:     "#0f0f11",

    // Interactive
    buttonText:  "#1a1a1e",  // dark text ON yellow gradient button
    tint:        tintColorDark,
    tabIconDefault:  "#64748b",
    tabIconSelected: tintColorDark,

    // Borders
    border:      "#2d2d35",

    // Semantic
    notification: "#f87171",
    error:        "#f87171",
    success:      "#4ade80",
    warning:      "#fbbf24",

    // Aliases
    secondary: "#1a1a1e",
  },
} as const

export default Colors
export type ColorScheme = typeof Colors.light
