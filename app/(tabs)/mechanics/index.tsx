import React, { useState, useRef } from "react"
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Image, TextInput, Linking, Alert, Animated,
} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Search, Star, MapPin, MessageSquare, CheckCircle,
  X, User, ChevronLeft,
} from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import { Mechanic, mockMechanics } from "@/data/mockData"
import { FontFamily, FontSize } from "@/constants/Theme"

const GOLD = "#F59E0B"

export default function MechanicsScreen() {
  const { colors, isDark } = useTheme()
  const router   = useRouter()
  const insets   = useSafeAreaInsets()
  const [searchQuery,    setSearchQuery]    = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  // Header collapse driven by scrollY
  const scrollY = useRef(new Animated.Value(0)).current
  const HEADER_H = insets.top + 52
  const SEARCH_H = 56

  const headerTranslateY = scrollY.interpolate({
    inputRange:  [0, HEADER_H],
    outputRange: [0, -HEADER_H],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  )

  // ── Data ───────────────────────────────────────────────────────────────────
  const filteredMechanics = searchQuery
    ? mockMechanics.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockMechanics

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  const openWhatsApp = (mechanic: Mechanic) => {
    const msg = encodeURIComponent(
      `Hi ${mechanic.name}, I found you on Car First Aid and need your help with my car.`
    )
    const url = `whatsapp://send?phone=${mechanic.phone}&text=${msg}`
    Linking.canOpenURL(url)
      .then((ok) => {
        if (ok) Linking.openURL(url)
        else Alert.alert("WhatsApp not found", "Install WhatsApp to message this mechanic.")
      })
      .catch(() => Alert.alert("Error", "Could not open WhatsApp."))
  }

  // ── Stars ──────────────────────────────────────────────────────────────────
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} color={GOLD} fill={i < Math.floor(rating) ? GOLD : "transparent"} />
    ))

  // ── Card ───────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Mechanic }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={13} color="#22c55e" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.cardInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.specialty, { color: colors.subtext }]}>{item.specialty}</Text>
          <Text style={[styles.exp, { color: colors.primary }]}>{item.experience}</Text>
          <View style={styles.ratingRow}>
            {renderStars(item.rating)}
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {item.rating} ({item.reviewCount})
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.locationRow, { borderTopColor: colors.border }]}>
        <MapPin size={14} color={colors.subtext} />
        <Text style={[styles.locationText, { color: colors.subtext }]}>{item.location}</Text>
      </View>

      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            router.push({ pathname: "/(tabs)/mechanics/[id]", params: { id: item.id } })
          }
        >
          <User size={16} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Profile</Text>
        </TouchableOpacity>

        <View style={[styles.vDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.actionBtn} onPress={() => openWhatsApp(item)}>
          <MessageSquare size={16} color={GOLD} />
          <Text style={[styles.actionText, { color: GOLD }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Collapsing sticky header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? colors.card : "#fff",
            borderBottomColor: colors.border,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* Row 1: back + title + search icon */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Find a Mechanic</Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setIsSearchVisible((v) => !v)
              if (isSearchVisible) setSearchQuery("")
            }}
          >
            {isSearchVisible
              ? <X size={22} color={colors.text} />
              : <Search size={22} color={colors.text} />}
          </TouchableOpacity>
        </View>

        {/* Row 2: search bar (only when toggled) */}
        {isSearchVisible && (
          <View style={[styles.searchBar, { backgroundColor: isDark ? colors.background : "#f1f5f9" }]}>
            <Search size={15} color={colors.subtext} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Name, specialty, location…"
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}
      </Animated.View>

      {/* Scrollable list — padded so content starts below the header */}
      <Animated.FlatList
        data={filteredMechanics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: HEADER_H + (isSearchVisible ? SEARCH_H : 0) + 8,
            paddingBottom: insets.bottom + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Search size={44} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No mechanics found for "{searchQuery}"
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    height: 40,
  },

  list: { paddingHorizontal: 16 },

  card: {
    borderRadius: 16, marginBottom: 14, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    position: "absolute", top: 10, right: 10, zIndex: 5,
  },
  verifiedText: { color: "#22c55e", fontSize: 11, fontFamily: FontFamily.medium },
  cardHeader: { flexDirection: "row", padding: 16 },
  avatar: { width: 66, height: 66, borderRadius: 33, marginRight: 14 },
  cardInfo: { flex: 1, justifyContent: "center" },
  name: { fontSize: 15, fontFamily: FontFamily.bold, marginBottom: 2 },
  specialty: { fontSize: 13, fontFamily: FontFamily.regular, marginBottom: 2 },
  exp: { fontSize: 12, fontFamily: FontFamily.medium, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 12, fontFamily: FontFamily.medium, marginLeft: 4 },
  locationRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  locationText: { fontSize: 13, fontFamily: FontFamily.regular, flex: 1 },
  actionsRow: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, paddingVertical: 12,
  },
  actionText: { fontFamily: FontFamily.medium, fontSize: 14 },
  vDivider: { width: StyleSheet.hairlineWidth },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: FontFamily.medium, textAlign: "center" },
})
