/**
 * (tabs)/_layout.tsx
 *
 * Tab navigator — single-row branded header.
 * Search is handled per-screen (Home has a global search,
 * pages with their own content search keep only their own).
 *
 * Header:
 *   [Logo]  Car First Aid          [🔔]  [Avatar]
 *
 * Safe-area insets used throughout.
 */

import { Image, View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, Home, User, History, MessageSquare, Bell } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import UserAvatar from "@/components/UserAvatar"
import React from "react"
import { FontSize, FontFamily, Spacing, Radius } from "@/constants/Theme"

// ─── App header (single row) ─────────────────────────────────────────────────
function AppHeader() {
  const { colors, isDark } = useTheme()
  const router             = useRouter()
  const insets             = useSafeAreaInsets()

  return (
    <View
      style={[
        s.header,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left — logo + app name */}
      <View style={s.left}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={s.logo}
          resizeMode="cover"
        />
        <Text style={[s.appName, { color: colors.primary }]}>Car First Aid</Text>
      </View>

      {/* Right — notification bell + user avatar */}
      <View style={s.right}>
        <TouchableOpacity
          style={[s.bellBtn, { backgroundColor: isDark ? colors.background : "#f1f5f9" }]}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.75}
        >
          <Bell size={17} color={colors.primary} />
        </TouchableOpacity>

        {/* Explicit gap between bell and avatar */}
        <View style={{ width: 16 }} />

        <UserAvatar size={34} onPress={() => router.push("/(tabs)/profile")} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
})

// ─── Tab layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { colors, isDark } = useTheme()
  const insets             = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderTopColor:  colors.border,
          borderTopWidth:  StyleSheet.hairlineWidth,
          height: 54 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 10,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnose"
        options={{
          title: "Diagnose",
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mechanics"
        options={{
          title: "Mechanics",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
