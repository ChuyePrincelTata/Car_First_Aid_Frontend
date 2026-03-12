/**
 * (tabs)/_layout.tsx
 *
 * Tab navigator layout with a custom, branded header.
 *
 * Header design:
 * ┌─────────────────────────────────────────────────────┐
 * │  [Logo] Car First Aid    [greeting]  [Bell] [Avatar]  │
 * └─────────────────────────────────────────────────────┘
 *
 * Left side  — app logo + name (always visible, feels like a branded app bar)
 * Right side — greeting label + notification bell + tappable user avatar
 * No screen title in the centre — users get context from the bottom tab bar.
 *
 * UX extras added:
 * - Time-based greeting ("Good morning / afternoon / evening, <name>")
 *   shown in a subtle chip so users feel personally welcomed on every screen.
 * - Avatar navigates to Profile tab when tapped.
 * - Bell navigates to Notifications.
 */

import { Image, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { Camera, Home, User, History, MessageSquare, Bell } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import UserAvatar from "@/components/UserAvatar"
import React, { useMemo } from "react"

// ─── Time-based greeting helper ────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// ─── Custom header — used by every tab screen ──────────────────────────────
function AppHeader() {
  const { colors, theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const greeting = useMemo(() => `${getGreeting()}, ${user?.name?.split(" ")[0] ?? "there"} 👋`, [user])

  const isDark = theme === "dark"

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* LEFT — logo + app name */}
      <View style={styles.headerLeft}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={styles.logo}
          resizeMode="cover"
        />
        <View>
          <Text style={[styles.appName, { color: colors.primary }]}>Car First Aid</Text>
        </View>
      </View>

      {/* RIGHT — greeting + bell + avatar */}
      <View style={styles.headerRight}>
        {/* Subtle greeting chip */}
        <Text
          style={[styles.greeting, { color: colors.subtext }]}
          numberOfLines={1}
        >
          {greeting}
        </Text>

        {/* Notification bell */}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.primaryLight ?? colors.border }]}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.7}
        >
          <Bell size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* User avatar → profile */}
        <UserAvatar
          size={34}
          onPress={() => router.push("/(tabs)/profile")}
        />
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
    paddingTop: Platform.OS === "ios" ? 52 : 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  appName: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    maxWidth: 110,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
})

// ─── Tab Layout ────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { colors, theme } = useTheme()
  const { user } = useAuth()
  const isDark = theme === "dark"

  return (
    <Tabs
      screenOptions={{
        // Replace the default header with our custom AppHeader
        header: () => <AppHeader />,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,

        tabBarStyle: {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
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
