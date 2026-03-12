/**
 * CustomTabBar.tsx
 *
 * A fully custom bottom tab bar that gives us pixel-perfect control:
 * - All tab buttons share the exact same width (flex: 1).
 * - The active pill background is drawn by US using a fixed-dimension View,
 *   so it is always identical in size regardless of icon or text.
 * - Completely rounded pill (borderRadius: 999).
 */

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily } from "@/constants/Theme"
import { Home, Activity, Wrench, ClipboardList, User } from "@/components/SafeLucide"

type TabItem = {
  name: string
  label: string
  Icon: (props: { color: string; size: number }) => React.ReactElement | null
}

const TABS: TabItem[] = [
  { name: "index",         label: "Home",      Icon: (p) => <Home       {...p} /> },
  { name: "diagnose",      label: "Diagnose",  Icon: (p) => <Activity   {...p} /> },
  { name: "mechanics",     label: "Mechanic",  Icon: (p) => <Wrench     {...p} /> },
  { name: "history",       label: "History",   Icon: (p) => <ClipboardList {...p} /> },
  { name: "profile",       label: "Profile",   Icon: (p) => <User       {...p} /> },
]

type Props = {
  state: any
  descriptors: any
  navigation: any
}

export default function CustomTabBar({ state, descriptors, navigation }: Props) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  const activeBg   = isDark ? colors.primary + "22" : colors.primary + "18"
  const activeColor  = colors.primary
  const inactiveColor = colors.tabIconDefault

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderTopColor: isDark ? colors.border : "#e2e8f0",
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index
        const tab = TABS.find((t) => route.name.startsWith(t.name)) ?? TABS[index]
        if (!tab) return null

        const IconComp = tab.Icon
        const color = isFocused ? activeColor : inactiveColor

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabButton}
          >
            {/* The pill background — same exact dimensions for ALL tabs */}
            <View
              style={[
                styles.pill,
                { backgroundColor: isFocused ? activeBg : "transparent" },
              ]}
            >
              <IconComp color={color} size={22} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,                  // Each column is mathematically equal
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",       // Critical on Android: forces the background to respect borderRadius on every render
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    marginTop: 1,
  },
})
