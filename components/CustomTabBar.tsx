import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
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
  { name: "index",     label: "Home",     Icon: (p) => <Home          {...p} /> },
  { name: "diagnose",  label: "Diagnose", Icon: (p) => <Activity      {...p} /> },
  { name: "mechanics", label: "Mechanic", Icon: (p) => <Wrench        {...p} /> },
  { name: "history",   label: "History",  Icon: (p) => <ClipboardList {...p} /> },
  { name: "profile",   label: "Profile",  Icon: (p) => <User          {...p} /> },
]

type Props = {
  state: any
  descriptors: any
  navigation: any
}

export default function CustomTabBar({ state, descriptors, navigation }: Props) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  const activeBg    = isDark ? colors.primary + "28" : colors.primary + "1A"
  const activeColor = colors.primary
  const mutedColor  = colors.tabIconDefault

  return (
    <View style={[styles.bar, {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderTopColor:  isDark ? colors.border : "#e2e8f0",
      paddingBottom:   insets.bottom + 6,
    }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index
        const tab = TABS.find((t) => route.name.startsWith(t.name)) ?? TABS[index]
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
            {/* Single consolidated style object — no StyleSheet merge — forces borderRadius on every render */}
            <View style={{
              width:           72,
              height:          72,
              borderRadius:    36,
              overflow:        "hidden",
              backgroundColor: isFocused ? activeBg : "transparent",
              alignItems:      "center",
              justifyContent:  "center",
            }}>
              <IconComp color={color} size={22} />
              <Text style={{ color, fontFamily: FontFamily.medium, fontSize: 10, marginTop: 3 }}>
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
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
})
