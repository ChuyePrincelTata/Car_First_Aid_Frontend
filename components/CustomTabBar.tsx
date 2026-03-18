import React from "react"
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily } from "@/constants/Theme"
import { Home, Activity, Wrench, ClipboardList, User } from "@/components/SafeLucide"
import { useTabBarTranslateY } from "@/context/TabBarContext"

type TabItem = {
  name: string
  label: string
  Icon: (props: { color: string; size: number }) => React.ReactElement | null
}

// Canonical list of visible tabs. Routes NOT in this list are never rendered.
const TABS: TabItem[] = [
  { name: "index",     label: "Home",     Icon: (p) => <Home          {...p} /> },
  { name: "diagnose",  label: "Diagnose", Icon: (p) => <Activity      {...p} /> },
  { name: "mechanics", label: "Mechanic", Icon: (p) => <Wrench        {...p} /> },
  { name: "history",   label: "History",  Icon: (p) => <ClipboardList {...p} /> },
  { name: "profile",   label: "Profile",  Icon: (p) => <User          {...p} /> },
]

/** Strip '/index' suffix and return the root segment name. */
function rootName(routeName: string) {
  // e.g. "mechanics/index" → "mechanics", "mechanics/[id]" → skip (contains "[")
  const base = routeName.replace("/index", "")
  return base
}

type Props = {
  state: any
  descriptors: any
  navigation: any
}

export default function CustomTabBar({ state, descriptors, navigation }: Props) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const translateY = useTabBarTranslateY()

  // ── Check if the currently focused screen wants no tab bar ─────────────────
  const focusedRoute   = state.routes[state.index]
  const focusedOptions = descriptors[focusedRoute.key]?.options ?? {}
  const tabBarStyle    = focusedOptions.tabBarStyle as any
  const isHidden       = tabBarStyle?.display === "none"

  // ── Interpolate translateY 0 → 1 → hidden (full bar height) ───────────────
  const TAB_BAR_HEIGHT = 60 + insets.bottom
  const barTranslate = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_BAR_HEIGHT],
    extrapolate: "clamp",
  })

  if (isHidden) return null

  const activeBg    = isDark ? colors.primary + "28" : colors.primary + "1A"
  const activeColor = colors.primary
  const mutedColor  = colors.tabIconDefault

  const BAR_PADDING = 8
  const pillSize   = Math.min(((width - BAR_PADDING * 2) / 5) - 4, 68)
  const pillRadius = pillSize / 2
  const iconSize   = pillSize < 64 ? 20 : 22
  const fontSize   = pillSize < 64 ? 9 : 10

  // Only render routes that map 1-to-1 to a TABS entry (skip [id], etc.)
  const visibleRoutes = state.routes.filter((route: any) => {
    const name = rootName(route.name)
    // drop dynamic segments like mechanics/[id]
    if (route.name.includes("[")) return false
    return TABS.some((t) => name === t.name || route.name === t.name)
  })

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          backgroundColor:  isDark ? colors.card : "#ffffff",
          borderTopColor:   isDark ? colors.border : "#e2e8f0",
          paddingBottom:    insets.bottom + 6,
          paddingHorizontal: 8,
          transform: [{ translateY: barTranslate }],
        },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const isFocused = state.index === state.routes.indexOf(route)
        const name      = rootName(route.name)
        const tab       = TABS.find((t) => name === t.name || route.name === t.name)
        if (!tab) return null

        const IconComp = tab.Icon
        const color    = isFocused ? activeColor : mutedColor

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true })
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
            }}
            style={styles.btn}
          >
            <View
              style={{
                width:           pillSize,
                height:          pillSize,
                borderRadius:    pillRadius,
                overflow:        "hidden",
                backgroundColor: isFocused ? activeBg : "transparent",
                alignItems:      "center",
                justifyContent:  "center",
              }}
            >
              <IconComp color={color} size={iconSize} />
              <Text
                numberOfLines={1}
                style={{ color, fontFamily: FontFamily.medium, fontSize, marginTop: 3 }}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        )
      })}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:  "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop:     8,
  },
  btn: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
})
