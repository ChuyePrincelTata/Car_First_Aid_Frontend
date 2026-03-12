/**
 * SearchModal.tsx
 *
 * Full-screen search overlay triggered from the header search bar.
 *
 * Algorithm — weighted fuzzy search:
 *  1. Exact match → score 100
 *  2. Starts with query → score 80
 *  3. Contains query (substring) → score 60
 *  4. Fuzzy: all query chars appear in sequence → score based on density
 *  5. No match → filtered out
 *
 * Search corpus covers:
 *  - App screens / navigation shortcuts
 *  - Diagnostic categories (what the app can diagnose)
 *  - Help topics
 *
 * Tapping a result navigates to the correct screen.
 */

import React, { useState, useMemo, useCallback } from "react"
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, StatusBar, Keyboard,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import { Search, X, Camera, MessageSquare, History, User, Home, AlertCircle, Bell } from "@/components/SafeLucide"
import { FontSize, FontFamily, Spacing, Radius, Shadows } from "@/constants/Theme"

// ─── Searchable items ────────────────────────────────────────────────────────

type Category = "Navigate" | "Diagnose" | "Help"

interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: Category
  icon: React.ReactNode
  route: string
  tags: string[] // extra keywords for better matching
}

// Defined outside component so it's only allocated once
const SEARCH_CORPUS: SearchItem[] = [
  // Navigation
  {
    id: "home",
    title: "Home",
    subtitle: "App dashboard",
    category: "Navigate",
    icon: null, // filled below
    route: "/(tabs)",
    tags: ["dashboard", "main", "start"],
  },
  {
    id: "diagnose",
    title: "Diagnose a Problem",
    subtitle: "AI-powered car diagnosis",
    category: "Navigate",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["photo", "camera", "ai", "analyse", "diagnose", "issue", "fault", "warning", "light", "scan"],
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Alerts and updates",
    category: "Navigate",
    icon: null,
    route: "/notifications",
    tags: ["notification", "alert", "bell", "update", "message", "inbox"],
  },
  {
    id: "mechanics",
    title: "Find a Mechanic",
    subtitle: "Connect with certified mechanics",
    category: "Navigate",
    icon: null,
    route: "/(tabs)/mechanics",
    tags: ["mechanic", "repair", "garage", "service", "technician", "fix", "workshop"],
  },
  {
    id: "history",
    title: "Diagnosis History",
    subtitle: "Past scans and results",
    category: "Navigate",
    icon: null,
    route: "/(tabs)/history",
    tags: ["history", "past", "previous", "records", "log", "diagnoses"],
  },
  {
    id: "profile",
    title: "My Profile",
    subtitle: "Account settings and preferences",
    category: "Navigate",
    icon: null,
    route: "/(tabs)/profile",
    tags: ["account", "settings", "profile", "me", "user", "info"],
  },
  {
    id: "sound",
    title: "Engine Sound Diagnosis",
    subtitle: "Record and analyse engine noises",
    category: "Diagnose",
    icon: null,
    route: "/(tabs)/diagnose/sound",
    tags: ["sound", "noise", "knocking", "rattling", "engine", "audio", "record"],
  },
  {
    id: "dashboardIcon",
    title: "Dashboard Lights",
    subtitle: "Scan a warning light on your dash",
    category: "Diagnose",
    icon: null,
    route: "/(tabs)/diagnose/dashboard_result",
    tags: ["dashboard", "light", "scan", "warning", "icon", "symbol", "photo"],
  },
  {
    id: "enginePart",
    title: "Engine Parts",
    subtitle: "Scan an engine component",
    category: "Diagnose",
    icon: null,
    route: "/(tabs)/diagnose/engine_result",
    tags: ["engine", "part", "component", "under hood", "scan", "photo"],
  },
  {
    id: "manual",
    title: "Manual Input",
    subtitle: "Describe your car problem in text",
    category: "Diagnose",
    icon: null,
    route: "/(tabs)/diagnose/manual",
    tags: ["describe", "text", "manual", "type", "symptom", "problem"],
  },
  // Help / informational
  {
    id: "help-warning",
    title: "Dashboard Warning Lights",
    subtitle: "What each warning light means",
    category: "Help",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["warning", "light", "dashboard", "symbol", "check engine", "battery", "oil", "temperature"],
  },
  {
    id: "help-engine",
    title: "Engine Problems",
    subtitle: "Common engine faults and fixes",
    category: "Help",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["engine", "misfire", "stall", "overheating", "smoke", "power loss", "idle"],
  },
  {
    id: "help-brakes",
    title: "Brake Issues",
    subtitle: "Squeaking, grinding, soft pedal",
    category: "Help",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["brake", "brakes", "squeaking", "grinding", "pedal", "stopping", "abs"],
  },
  {
    id: "help-battery",
    title: "Battery & Electrical",
    subtitle: "Battery, alternator, fuses",
    category: "Help",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["battery", "electrical", "alternator", "fuse", "starter", "dead", "charge"],
  },
  {
    id: "help-tyre",
    title: "Tyre Problems",
    subtitle: "Flat tyres, pressure, wear",
    category: "Help",
    icon: null,
    route: "/(tabs)/diagnose",
    tags: ["tyre", "tire", "flat", "pressure", "puncture", "wear", "alignment"],
  },
]

// ─── Fuzzy scoring ────────────────────────────────────────────────────────────

/**
 * Score a candidate string against a query.
 * Returns 0 if no match, >0 if matched (higher = better).
 */
function score(candidate: string, query: string): number {
  const c = candidate.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return 0

  if (c === q) return 100
  if (c.startsWith(q)) return 80
  if (c.includes(q)) return 60 + Math.round((q.length / c.length) * 20)

  // Fuzzy: all query chars appear in candidate in order
  let ci = 0, qi = 0, gaps = 0
  while (ci < c.length && qi < q.length) {
    if (c[ci] === q[qi]) { qi++; } else { gaps++ }
    ci++
  }
  if (qi === q.length) {
    // All chars found in sequence — score by how compact the match was
    return Math.max(5, 40 - gaps)
  }

  return 0
}

function searchItems(query: string): SearchItem[] {
  if (!query.trim()) return []

  return SEARCH_CORPUS
    .map((item) => {
      const candidateStrings = [item.title, item.subtitle, ...item.tags]
      const best = Math.max(...candidateStrings.map((s) => score(s, query)))
      return { item, best }
    })
    .filter(({ best }) => best > 10)
    .sort((a, b) => b.best - a.best)
    .map(({ item }) => item)
}

// ─── Category icon helper ────────────────────────────────────────────────────

function CategoryBadge({ cat, colors }: { cat: Category; colors: any }) {
  const bg =
    cat === "Navigate" ? colors.primary + "20" :
    cat === "Diagnose" ? colors.warning  + "20" :
                          colors.success  + "20"
  const fg =
    cat === "Navigate" ? colors.primary :
    cat === "Diagnose" ? colors.warning :
                          colors.success

  return (
    <View style={[badgeStyles.pill, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.text, { color: fg }]}>{cat}</Text>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  pill:  { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  text:  { fontSize: 10, fontFamily: "Poppins-Medium" },
})

// ─── The modal component ──────────────────────────────────────────────────────

interface SearchModalProps {
  visible: boolean
  onClose: () => void
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const [query, setQuery]   = useState("")
  const { colors, isDark }  = useTheme()
  const insets              = useSafeAreaInsets()
  const router              = useRouter()

  const results = useMemo(() => searchItems(query), [query])

  const handleSelect = useCallback((item: SearchItem) => {
    Keyboard.dismiss()
    onClose()
    setQuery("")
    setTimeout(() => router.push(item.route as any), 200)
  }, [router, onClose])

  const handleClose = useCallback(() => {
    Keyboard.dismiss()
    setQuery("")
    onClose()
  }, [onClose])

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.5)",
    },
    sheet: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top + 8,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.base,
      paddingBottom: Spacing.md,
      gap: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    inputRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? colors.card : "#f1f5f9",
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      height: 44,
      gap: Spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: colors.text,
    },
    closeBtn: {
      paddingHorizontal: 4,
    },
    closeBtnText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.medium,
      color: colors.primary,
    },
    emptyWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.md,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.medium,
      color: colors.text,
    },
    emptyHint: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      textAlign: "center",
      paddingHorizontal: Spacing.xxl,
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    resultText: {
      flex: 1,
      gap: 2,
    },
    resultTitle: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.medium,
      color: colors.text,
    },
    resultSub: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },
    suggestions: {
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.lg,
    },
    suggestTitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.subtext,
      marginBottom: Spacing.md,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
    },
    chip: {
      flexDirection: "row",
      flexWrap: "wrap" as const,
      gap: Spacing.sm,
    },
    chipBtn: {
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      backgroundColor: isDark ? colors.card : "#f1f5f9",
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.text,
    },
  })

  const suggestions = ["Engine light", "Brakes", "Find mechanic", "Battery", "Diagnose"]

  const iconFor = (id: string) => {
    const size = 18, color = colors.primary
    switch (id) {
      case "home":     return <Home          size={size} color={color} />
      case "diagnose": return <Camera        size={size} color={color} />
      case "sound":    return <Camera        size={size} color={color} />
      case "manual":   return <AlertCircle   size={size} color={color} />
      case "mechanics":return <MessageSquare size={size} color={color} />
      case "history":  return <History       size={size} color={color} />
      case "profile":  return <User          size={size} color={color} />
      case "notifications":return <Bell          size={size} color={color} />
      case "dashboardIcon":return <Camera        size={size} color={color} />
      case "enginePart": return <Camera        size={size} color={color} />
      default:         return <Search        size={size} color={color} />
    }
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.sheet}>
        {/* Search input row */}
        <View style={s.topBar}>
          <View style={s.inputRow}>
            <Search size={16} color={colors.subtext} />
            <TextInput
              style={s.input}
              placeholder="Search screens, issues, mechanics…"
              placeholderTextColor={colors.subtext}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <X size={16} color={colors.subtext} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
            <Text style={s.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Results / empty state / suggestions */}
        {query.length === 0 ? (
          /* Default — show quick-navigate chips */
          <View style={s.suggestions}>
            <Text style={s.suggestTitle}>Quick navigate</Text>
            <View style={s.chip}>
              {suggestions.map((s2) => (
                <TouchableOpacity
                  key={s2}
                  style={s.chipBtn}
                  onPress={() => setQuery(s2)}
                >
                  <Text style={s.chipText}>{s2}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <View style={s.emptyWrap}>
            <Search size={40} color={colors.subtext} />
            <Text style={s.emptyTitle}>No results for "{query}"</Text>
            <Text style={s.emptyHint}>Try searching for screens, car problems, or mechanic services</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={s.resultItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                <View
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: colors.primary + "15",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  {iconFor(item.id)}
                </View>
                <View style={s.resultText}>
                  <Text style={s.resultTitle}>{item.title}</Text>
                  <Text style={s.resultSub}>{item.subtitle}</Text>
                </View>
                <CategoryBadge cat={item.category} colors={colors} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  )
}
