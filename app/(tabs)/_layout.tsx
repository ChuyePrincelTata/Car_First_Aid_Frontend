/**
 * (tabs)/_layout.tsx
 *
 * Tab navigator with a branded two-row header:
 *
 * Row 1:  [Logo] Car First Aid        [🔔]  [Avatar]
 * Row 2:  [🔍 Search screens, issues, mechanics…   ]
 *
 * Tapping the search bar opens a full-screen SearchModal.
 * Safe area insets are used throughout so nothing is clipped or overlaps.
 */

import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, Home, User, History, MessageSquare, Bell, Search } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import UserAvatar from "@/components/UserAvatar"
import SearchModal from "@/components/SearchModal"
import React, { useState } from "react"
import { FontSize, FontFamily, Spacing, Radius } from "@/constants/Theme"

// ─── Custom header ───────────────────────────────────────────────────────────
function AppHeader() {
  const { colors, isDark } = useTheme()
  const { user }           = useAuth()
  const router             = useRouter()
  const insets             = useSafeAreaInsets()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
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
        {/* ── Row 1: logo + name | bell + avatar ── */}
        <View style={s.row1}>
          {/* Left */}
          <View style={s.left}>
            <Image
              source={require("../../assets/images/logo.jpg")}
              style={s.logo}
              resizeMode="cover"
            />
            <Text style={[s.appName, { color: colors.primary }]}>Car First Aid</Text>
          </View>

          {/* Right — bell + avatar with explicit gap */}
          <View style={s.right}>
            <TouchableOpacity
              style={[s.bellBtn, { backgroundColor: isDark ? colors.background : "#f1f5f9" }]}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.75}
            >
              <Bell size={17} color={colors.primary} />
            </TouchableOpacity>

            {/* 16px explicit gap */}
            <View style={{ width: 16 }} />

            <UserAvatar size={34} onPress={() => router.push("/(tabs)/profile")} />
          </View>
        </View>

        {/* ── Row 2: tappable search bar ── */}
        <TouchableOpacity
          style={[
            s.searchBar,
            { backgroundColor: isDark ? colors.background : "#f1f5f9" },
          ]}
          onPress={() => setSearchOpen(true)}
          activeOpacity={0.7}
        >
          <Search size={15} color={colors.subtext} />
          <Text style={[s.searchPlaceholder, { color: colors.subtext }]}>
            Search screens, issues, mechanics…
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search modal */}
      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },

  /* Row 1 */
  row1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
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

  /* Row 2 — search bar */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: Radius.lg,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
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
