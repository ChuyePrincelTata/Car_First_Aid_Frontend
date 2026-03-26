import React, { useState } from "react"
import {
  StyleSheet, View, FlatList, TouchableOpacity,
  Image, TextInput, Linking, Alert, Text,
} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Search, Star, MapPin, MessageSquare, CheckCircle, X, User } from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import { Mechanic, mockMechanics } from "@/data/mockData"
import { FontFamily, FontSize } from "@/constants/Theme"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import AppButton from "@/components/AppButton"

const GOLD = "#F59E0B"

export default function MechanicsScreen() {
  const { colors } = useTheme()
  const router     = useRouter()
  const insets     = useSafeAreaInsets()
  const [searchQuery,     setSearchQuery]     = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const filteredMechanics = searchQuery
    ? mockMechanics.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockMechanics

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

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} color={GOLD} fill={i < Math.floor(rating) ? GOLD : "transparent"} />
    ))

  const renderItem = ({ item }: { item: Mechanic }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={13} color="#22c55e" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: "/(tabs)/mechanics/[id]", params: { id: item.id } })}
      >
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
      </TouchableOpacity>
      <View style={[styles.locationRow, { borderTopColor: colors.border }]}>
        <MapPin size={14} color={colors.subtext} />
        <Text style={[styles.locationText, { color: colors.subtext }]}>{item.location}</Text>
      </View>
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <AppButton
          label="Profile"
          variant="ghost"
          icon={<User size={16} color={colors.text} />}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics/[id]", params: { id: item.id } })}
          style={{ flex: 1, height: 48 }}
          textStyle={{ color: colors.text }}
        />
        <View style={[styles.vDivider, { backgroundColor: colors.border }]} />
        <AppButton
          label="Message"
          variant="ghost"
          icon={<MessageSquare size={16} color={colors.primary} />}
          onPress={() => openWhatsApp(item)}
          style={{ flex: 1, height: 48 }}
        />
      </View>
    </View>
  )

  // Total top padding = safe area + fixed header height + optional search bar
  const paddingTop = insets.top + SCREEN_HEADER_H + (isSearchVisible ? 56 : 0)

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed header — never scrolls */}
      <ScreenHeader
        title="Find a Mechanic"
        onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
        right={
          <TouchableOpacity
            onPress={() => { setIsSearchVisible((v) => !v); if (isSearchVisible) setSearchQuery("") }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSearchVisible ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
          </TouchableOpacity>
        }
      />

      {/* Search bar below the fixed header */}
      {isSearchVisible && (
        <View style={[
          styles.searchBarRow,
          { top: insets.top + SCREEN_HEADER_H, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}>
          <View style={[styles.searchInput, { backgroundColor: colors.background }]}>
            <Search size={15} color={colors.subtext} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontFamily: FontFamily.regular, fontSize: FontSize.sm, height: 36 }}
              placeholder="Name, specialty, location…"
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        </View>
      )}

      {/* Scrollable list */}
      <FlatList
        data={filteredMechanics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: paddingTop + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
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
  searchBarRow: {
    position: "absolute", left: 0, right: 0, zIndex: 19,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, borderRadius: 10,
  },
  card: {
    borderRadius: 16, marginBottom: 14, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
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
    paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth,
  },
  locationText: { fontSize: 13, fontFamily: FontFamily.regular, flex: 1 },
  actionsRow: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  vDivider: { width: StyleSheet.hairlineWidth },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: FontFamily.medium, textAlign: "center" },
})
