/**
 * (tabs)/_layout.tsx
 *
 * Two header variants:
 *
 * HomeHeader (Home tab only):
 *   Row 1: [Logo] Car First Aid          [🔔]  [Avatar]
 *   Row 2: [🔍 Search screens, issues, mechanics…    ]
 *
 * AppHeader (all other tabs):
 *   Row 1: [Logo] Car First Aid          [🔔]  [Avatar]
 *
 * The correct header is assigned per-screen in <Tabs.Screen options>.
 * Safe-area insets used throughout.
 */

import { Image, View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, Camera, MessageSquare, History, User, Bell, Search, Activity, Wrench, ClipboardList } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import UserAvatar from "@/components/UserAvatar"
import SearchModal from "@/components/SearchModal"
import React, { useState } from "react"
import { FontSize, FontFamily, Spacing, Radius } from "@/constants/Theme"

// ─── Shared header row (logo + bell + avatar) ─────────────────────────────
function HeaderTop() {
  const { colors, isDark } = useTheme()
  const router             = useRouter()

  return (
    <View style={row.container}>
      <View style={row.left}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={row.logo}
          resizeMode="cover"
        />
        <Text style={[row.appName, { color: colors.primary }]}>Car First Aid</Text>
      </View>

      <View style={row.right}>
        <TouchableOpacity
          style={[row.bellBtn, { backgroundColor: isDark ? colors.background : "#f1f5f9" }]}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.75}
        >
          <Bell size={17} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ width: 16 }} />
        <UserAvatar size={34} onPress={() => router.push("/(tabs)/profile")} />
      </View>
    </View>
  )
}

const row = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  logo: { width: 32, height: 32, borderRadius: 8 },
  appName: { fontSize: FontSize.md, fontFamily: FontFamily.bold, letterSpacing: 0.1 },
  right: { flexDirection: "row", alignItems: "center" },
  bellBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
})

// ─── Home header (two rows — with search bar) ─────────────────────────────
export function HomeHeader() {
  const { colors, isDark } = useTheme()
  const insets             = useSafeAreaInsets()
  const [open, setOpen]    = useState(false)

  return (
    <>
      <View
        style={[
          wrap.shell,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? colors.card : "#ffffff",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <HeaderTop />

        {/* Search bar — only on Home */}
        <TouchableOpacity
          style={[wrap.searchBar, { backgroundColor: isDark ? colors.background : "#f1f5f9" }]}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <Search size={15} color={colors.subtext} />
          <Text style={[wrap.searchText, { color: colors.subtext }]}>
            Search screens, issues, mechanics…
          </Text>
        </TouchableOpacity>
      </View>

      <SearchModal visible={open} onClose={() => setOpen(false)} />
    </>
  )
}

// ─── Standard header (single row) ────────────────────────────────────────
function AppHeader() {
  const { colors, isDark } = useTheme()
  const insets             = useSafeAreaInsets()

  return (
    <View
      style={[
        wrap.shell,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderBottomColor: colors.border,
        },
      ]}
    >
      <HeaderTop />
    </View>
  )
}

const wrap = StyleSheet.create({
  shell: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  searchText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    flex: 1,
  },
})

// ─── Tab layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { colors, isDark } = useTheme()
  const insets             = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: colors.background, // Ensure background spans behind floating tab bar
          paddingBottom: 60 + insets.bottom + 12 + 16, // Height + MarginBottom + Clearance
        },
        // Default header for all tabs (overridden per-screen below)
        header: () => <AppHeader />,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: isDark ? colors.card : "#ffffff",
          borderTopWidth:  0, // Remove original border for floating effect
          height: 60,
          marginBottom: insets.bottom + 12,
          marginHorizontal: 20,
          borderRadius: 30, // Fully rounded floating pill
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          position: 'absolute', // Required for floating effect
        },
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 10,
          marginTop: -4,
        },
      }}
    >
      {/* Home tab — two-row header WITH search bar */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          header: () => <HomeHeader />,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      {/* All other tabs — clean single-row header */}
      <Tabs.Screen
        name="diagnose"
        options={{
          title: "Diagnose",
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mechanics/index"
        options={{
          title: "Mechanics",
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

    </Tabs>
  )
}
