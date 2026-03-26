/**
 * components/ScreenHeader.tsx
 *
 * A unified, fixed-position header used by all non-home tab screens.
 *
 * Props:
 *   title      — screen title text
 *   onBack?    — if provided, renders a ChevronLeft back button on the left
 *   right?     — optional JSX for the right side (e.g. a search icon)
 *
 * The header:
 *  - Is always visible and NEVER scrolls with content
 *  - Respects the device status bar (useSafeAreaInsets)
 *  - Has identical typography and layout across every screen
 *
 * Screens using this component must pad their own content by HEADER_HEIGHT
 * (exported below) so it starts below the header.
 */
import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { ChevronLeft } from "@/components/SafeLucide"
import { FontFamily, FontSize } from "@/constants/Theme"

export const SCREEN_HEADER_H = 56  // fixed bar height (below safe area)

type Props = {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export default function ScreenHeader({ title, onBack, right }: Props) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left: optional back button */}
      <View style={styles.side}>
        {onBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Centre: title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: slot for extra controls */}
      <View style={[styles.side, { alignItems: "flex-end" }]}>
        {right ?? null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 20,
    height: undefined,              // height is paddingTop (inset) + SCREEN_HEADER_H
    paddingBottom: (SCREEN_HEADER_H - 24) / 2,  // vertically centre the 24-unit icon/text
    flexDirection: "row",
    alignItems: "flex-end",         // anchor to bottom of the bar
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  side: {
    width: 44,                      // fixed width = title stays centred
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  iconBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
})
