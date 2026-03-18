/**
 * CustomTabBar.tsx
 *
 * Simple, reliable tab bar that:
 *  1. Always shows on the 5 main tab screens
 *  2. Completely disappears (returns null) on any sub-screen that sets
 *     tabBarStyle: { display: 'none' } — e.g. mechanic profile
 *  3. Correctly ignores dynamic route segments like mechanics/[id]
 */
import React from "react"
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily } from "@/constants/Theme"
import { Home, Activity, Wrench, ClipboardList, User } from "@/components/SafeLucide"

type TabItem = {
  name: string        // matches the route name root segment
  label: string
  Icon: (props: { color: string; size: number }) => React.ReactElement | null
}

const TABS: TabItem[] = [
  { name: "index",     label: "Home",     Icon: (p) => <Home          {...p} /> },
  { name: "diagnose",  label: "Diagnose", Icon: (p) => <Activity      {...p} /> },
  { name: "mechanics", label: "Mechanic", Icon: (p) => <Wrench        {...p} /> },
  { name: "history",   label: "History",  Icon: (p) => <ClipboardList {...p} /> },
  { name: "profile",   label: "Profile",  Icon: (p) => <User          {...p} /> },
]

/** Strip '/index' suffix to get the root segment. */
function rootSegment(routeName: string) {
  return routeName.replace("/index", "").split("/")[0]
}

type Props = {
  state: any
  descriptors: any
  navigation: any
}

export default function CustomTabBar({ state, descriptors, navigation }: Props) {
  const { colors, isDark } = useTheme()
  const insets   = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  // ── Hide entirely if the focused screen opts out ───────────────────────────
  const focusedRoute   = state.routes[state.index]
  const focusedOptions = descriptors[focusedRoute.key]?.options ?? {}
  const tabBarHideStyle = focusedOptions.tabBarStyle as any
  if (tabBarHideStyle?.display === "none") return null

  // ── Layout math ────────────────────────────────────────────────────────────
  const activeBg    = isDark ? colors.primary + "28" : colors.primary + "1A"
  const activeColor = colors.primary
  const mutedColor  = colors.tabIconDefault

  const BAR_PADDING = 8
  const pillSize   = Math.min(((width - BAR_PADDING * 2) / 5) - 4, 68)
  const pillRadius = pillSize / 2
  const iconSize   = pillSize < 64 ? 20 : 22
  const fontSize   = pillSize < 64 ? 9  : 10

  // Only render routes that map to one of our 5 canonical tabs.
  // This filters out dynamics like mechanics/[id] automatically.
  const visibleRoutes = state.routes.filter((route: any) => {
    const seg = rootSegment(route.name)
    return TABS.some((t) => t.name === seg) && !route.name.includes("[")
  })

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor:   isDark ? colors.card : "#ffffff",
          borderTopColor:    isDark ? colors.border : "#e2e8f0",
          paddingBottom:     insets.bottom + 6,
          paddingHorizontal: BAR_PADDING,
        },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const originalIndex = state.routes.indexOf(route)
        const isFocused     = state.index === originalIndex
        const tab           = TABS.find((t) => t.name === rootSegment(route.name))
        if (!tab) return null

        const color = isFocused ? activeColor : mutedColor

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
              <tab.Icon color={color} size={iconSize} />
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
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:  "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop:     8,
  },
  btn: {
    flex:            1,
    alignItems:      "center",
    justifyContent:  "center",
    paddingVertical: 4,
  },
})
