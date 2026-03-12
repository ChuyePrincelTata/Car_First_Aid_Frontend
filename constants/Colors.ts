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
const tintColorDark  = "#D4AF37"   // premium metallic gold

const Colors = {
  light: {
    // Brand
    primary:     "#1a237e",  // deep navy blue
    primaryLight:"#e8eaf6",  // very light tint of primary
    accent:      "#D4AF37",  // premium metallic gold

    // Surfaces
    background:  "#f4f7fb",  // soft off-white blue-tinted page bg
    card:        "#ffffff",  // white card / input surface
    overlay:     "rgba(26, 35, 126, 0.06)", // subtle primary tint overlay

    // Text
    text:        "#1a1f36",  // near-black for readability
    subtext:     "#6b7280",  // muted secondary text / placeholders
    inverse:     "#ffffff",  // text on dark surfaces

    // Interactive
    buttonText:  "#ffffff",  // white text ON a dark navy button
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
    primary:     "#D4AF37",  // metallic gold — premium accent
    primaryLight:"#211B05",  // very dark gold-tinted surface
    accent:      "#D4AF37",

    // Surfaces
    background:  "#0A0F1C",  // deep navy / near-black page bg
    card:        "#131B2B",  // slightly elevated dark navy surface
    overlay:     "rgba(212, 175, 55, 0.08)",

    // Text
    text:        "#f1f5f9",  // near-white for readability on dark bg
    subtext:     "#94a3b8",  // muted secondary text / placeholders
    inverse:     "#0f0f11",

    // Interactive
    buttonText:  "#000000",  // dark text ON a gold button
    tint:        tintColorDark,
    tabIconDefault:  "#64748b",
    tabIconSelected: tintColorDark,

    // Borders
    border:      "#212B3F",  // subtle navy border

    // Semantic
    notification: "#f87171",
    error:        "#f87171",
    success:      "#4ade80",
    warning:      "#fbbf24",

    // Aliases
    secondary: "#131B2B",
  },
}

export default Colors
export type ColorScheme = typeof Colors.light
