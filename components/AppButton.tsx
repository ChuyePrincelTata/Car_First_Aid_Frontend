/**
 * AppButton.tsx — Reusable button component for the entire app.
 *
 * Variants:
 *   primary   — solid fill with primary colour (default)
 *   secondary — same as primary but with secondary theme colour
 *   outline   — transparent background with primary-coloured border & text
 *   ghost     — no border or background, just text (for inline links/actions)
 *   soft      — highly transparent primary background with primary text
 *   inverse   — solid white background with primary text (for image overlays)
 *   danger    — subtle error background with error text
 *
 * Size:
 *   md  — default height (52px), used for most buttons
 *   sm  — compact height (40px), used for secondary / inline actions
 *   lg  — tall height (60px), used for auth / hero CTAs
 *
 * Props:
 *   label      — button text
 *   onPress    — press handler
 *   variant    — "primary" | "outline" | "ghost"  (default: "primary")
 *   size       — "sm" | "md" | "lg"               (default: "md")
 *   icon       — optional leading icon node
 *   disabled   — greys out and blocks press
 *   loading    — shows ActivityIndicator in place of label
 *   fullWidth  — stretches to parent width (default: true)
 *   style      — pass-through ViewStyle overrides
 *   textStyle  — pass-through TextStyle overrides
 */

import React from "react"
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily, FontSize, Radius } from "@/constants/Theme"

type Variant = "primary" | "secondary" | "outline" | "ghost" | "soft" | "inverse" | "danger"
type Size    = "sm" | "md" | "lg"

interface AppButtonProps {
  label:      string
  onPress:    () => void
  variant?:   Variant
  size?:      Size
  icon?:      React.ReactNode
  iconPosition?: "left" | "right"
  disabled?:  boolean
  loading?:   boolean
  fullWidth?: boolean
  style?:     ViewStyle
  textStyle?: TextStyle
}

const sizeMap: Record<Size, { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 40, fontSize: FontSize.sm,   paddingH: 16 },
  md: { height: 52, fontSize: FontSize.base, paddingH: 20 },
  lg: { height: 60, fontSize: FontSize.base, paddingH: 24 },
}

export default function AppButton({
  label,
  onPress,
  variant   = "primary",
  size      = "md",
  icon,
  iconPosition = "left",
  disabled  = false,
  loading   = false,
  fullWidth = true,
  style,
  textStyle,
}: AppButtonProps) {
  const { colors } = useTheme()
  const dim = sizeMap[size]

  // ─── Colour resolution ────────────────────────────────────────────────────
  let bgColor = "transparent"
  let textColor = colors.primary
  let borderColor = "transparent"

  switch (variant) {
    case "primary":
      bgColor = colors.primary
      textColor = colors.buttonText
      break
    case "secondary":
      bgColor = colors.text // High contrast secondary
      textColor = colors.background
      break
    case "outline":
      borderColor = colors.primary
      break
    case "soft":
      bgColor = colors.primary + "1A" // 10% opacity
      break
    case "inverse":
      bgColor = "#ffffff"
      textColor = colors.primary
      break
    case "danger":
      bgColor = "rgba(255, 59, 48, 0.1)" // Standard destructive red alpha
      textColor = colors.error
      break
    case "ghost":
      break
  }

  const containerStyle: ViewStyle = {
    height:           dim.height,
    borderRadius:     Radius.lg,
    backgroundColor:  bgColor,
    borderWidth:      variant === "outline" ? 1.5 : 0,
    borderColor,
    opacity:          disabled ? 0.5 : 1,
    alignSelf:        fullWidth ? "stretch" : "flex-start",
    paddingHorizontal: variant === "ghost" ? 0 : dim.paddingH,
  }

  const labelStyle: TextStyle = {
    fontSize:   dim.fontSize,
    fontFamily: FontFamily.bold,
    color:      textColor,
    letterSpacing: 0.2,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.base, containerStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && iconPosition === "left" && <View style={styles.iconWrapLeft}>{icon}</View>}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
          {icon && iconPosition === "right" && <View style={styles.iconWrapRight}>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
  },
  iconWrapLeft: {
    marginRight: 8,
  },
  iconWrapRight: {
    marginLeft: 8,
  },
})
