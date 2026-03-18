import React, { useState, useRef } from "react"
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Image, TextInput, Animated, Linking, Alert,
} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Search, Star, MapPin, MessageSquare, CheckCircle, X, User } from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import { Mechanic, mockMechanics } from "@/data/mockData"
import { FontFamily, FontSize } from "@/constants/Theme"
import { useTabBarScroll } from "@/context/TabBarContext"

const HEADER_HEIGHT = 110
const GOLD = "#F59E0B"

export default function MechanicsScreen() {
  const { colors, theme } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const scrollY = useRef(new Animated.Value(0)).current
  const { onScrollHandler } = useTabBarScroll()

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: onScrollHandler,
    }
  )

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
      `Hi ${mechanic.name}, I found you on Car First Aid and I need your help with my car.`
    )
    const url = `whatsapp://send?phone=${mechanic.phone}&text=${msg}`
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url)
        } else {
          Alert.alert("WhatsApp not found", "Please install WhatsApp to message this mechanic.")
        }
      })
      .catch(() => Alert.alert("Error", "Could not open WhatsApp."))
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} color={GOLD} fill={i < full ? GOLD : "transparent"} />
    ))
  }

  const renderMechanicItem = ({ item }: { item: Mechanic }) => (
    <View style={[styles.mechanicCard, { backgroundColor: colors.card }]}>
      {/* Verified badge — text only, no background */}
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={13} color="#22c55e" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <View style={styles.mechanicHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.mechanicInfo}>
          <Text style={[styles.mechanicName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.mechanicSpecialty, { color: colors.subtext }]}>{item.specialty}</Text>
          <Text style={[styles.mechanicExperience, { color: colors.primary }]}>{item.experience}</Text>
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

      <View style={[styles.buttonsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.cardBtn}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics/[id]", params: { id: item.id } })}
        >
          <User size={16} color={colors.text} />
          <Text style={[styles.btnText, { color: colors.text }]}>Profile</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.cardBtn}
          onPress={() => openWhatsApp(item)}
        >
          <MessageSquare size={16} color={GOLD} />
          <Text style={[styles.btnText, { color: GOLD }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Collapsing Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: theme === "dark" ? colors.card : "#ffffff",
            borderBottomColor: colors.border,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Find a Mechanic</Text>
          <TouchableOpacity
            style={styles.searchToggle}
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

        {isSearchVisible && (
          <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
            <Search size={16} color={colors.subtext} />
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

      {/* List — paddingTop offsets the header */}
      <Animated.FlatList
        data={filteredMechanics}
        keyExtractor={(item) => item.id}
        renderItem={renderMechanicItem}
        contentContainerStyle={[
          styles.list,
          { paddingTop: isSearchVisible ? HEADER_HEIGHT + 56 : HEADER_HEIGHT, paddingBottom: insets.bottom + 20 }
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
  container: { flex: 1 },

  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  searchToggle: { padding: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    height: 44,
  },

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  mechanicCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    top: 10, right: 10,
    zIndex: 5,
  },
  verifiedText: {
    color: "#22c55e",
    fontSize: 11,
    fontFamily: FontFamily.medium,
  },
  mechanicHeader: { flexDirection: "row", padding: 16 },
  avatar: { width: 68, height: 68, borderRadius: 34, marginRight: 14 },
  mechanicInfo: { flex: 1, justifyContent: "center" },
  mechanicName: { fontSize: 16, fontFamily: FontFamily.bold, marginBottom: 2 },
  mechanicSpecialty: { fontSize: 13, fontFamily: FontFamily.regular, marginBottom: 2 },
  mechanicExperience: { fontSize: 13, fontFamily: FontFamily.medium, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 12, fontFamily: FontFamily.medium, marginLeft: 4 },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  locationText: { fontSize: 13, fontFamily: FontFamily.regular, flex: 1 },

  buttonsRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12,
  },
  btnText: { fontFamily: FontFamily.medium, fontSize: 14 },
  divider: { width: StyleSheet.hairlineWidth },

  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: FontFamily.medium, textAlign: "center" },
})
