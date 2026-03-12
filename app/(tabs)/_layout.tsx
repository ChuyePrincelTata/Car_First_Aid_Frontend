/**
 * (tabs)/_layout.tsx
 *
 * Tab navigator with a custom branded header.
 *
 * Safe area handling:
 *  - Header uses useSafeAreaInsets().top so it sits correctly below the
 *    status bar on ALL devices (notched iPhones, tall Android status bars, etc.)
 *  - Tab bar uses useSafeAreaInsets().bottom so it never overlaps the
 *    device home indicator / Android nav buttons
 *
 * Header layout:
 * ┌──────────────────────────────────────────────────────────┐
 * │  [Logo] Car First Aid        Good morning, John 👋 🔔 🟡│
 * └──────────────────────────────────────────────────────────┘
 */

import { Image, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, Home, User, History, MessageSquare, Bell } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import UserAvatar from "@/components/UserAvatar"
import React, { useMemo } from "react"

// ─── Time-based greeting ────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

// ─── Custom header component ────────────────────────────────────────────────
function AppHeader() {
  const { colors, isDark } = useTheme()
  const { user }           = useAuth()
  const router             = useRouter()
  const insets             = useSafeAreaInsets()

  const greeting = useMemo(
    () => `${getGreeting()}, ${user?.name?.split(" ")[0] ?? "there"} 👋`,
    [user],
  )

  return (
    <View
      style={[
        styles.header,
        {
          // paddingTop = safe-area top inset + our own inner padding
          paddingTop: insets.top + 10,
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* LEFT — logo + app name */}
      <View style={styles.left}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={[styles.appName, { color: colors.primary }]}>Car First Aid</Text>
      </View>

      {/* RIGHT — greeting + bell + avatar */}
      <View style={styles.right}>
        <Text style={[styles.greeting, { color: colors.subtext }]} numberOfLines={1}>
          {greeting}
        </Text>

        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: isDark ? colors.background : colors.border }]}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.75}
        >
          <Bell size={17} color={colors.primary} />
        </TouchableOpacity>

        <UserAvatar size={32} onPress={() => router.push("/(tabs)/profile")} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // subtle shadow
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
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    letterSpacing: 0.1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    maxWidth: 105,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
})

// ─── Tab Layout ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { colors, isDark } = useTheme()
  const insets             = useSafeAreaInsets()

  // Bottom padding for tab bar = device safe-area bottom + a small inner gap
  const tabBarPaddingBottom = insets.bottom + 6

  return (
    <Tabs
      screenOptions={{
        // Our custom full-width header replaces Expo's default
        header: () => <AppHeader />,

        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,

        tabBarStyle: {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderTopColor:  colors.border,
          borderTopWidth:  StyleSheet.hairlineWidth,
          // height accounts for the icon + label + bottom safe area
          height: 54 + insets.bottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },

        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
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
