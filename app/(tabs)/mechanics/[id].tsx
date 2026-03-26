import React from "react"
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Linking, Alert, Dimensions,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import MapView, { Marker } from "react-native-maps"
import {
  ChevronLeft, CheckCircle, Star, Phone, MessageSquare,
  MapPin, Briefcase, FileText, Clock,
} from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import { mockMechanics } from "@/data/mockData"
import AppButton from "@/components/AppButton"

const GOLD = "#F59E0B"

export default function MechanicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()

  const mechanic = mockMechanics.find((m) => m.id === id)

  if (!mechanic) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontFamily: FontFamily.medium }}>Mechanic not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontFamily: FontFamily.medium }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi ${mechanic.name}, I found you on Car First Aid and I need help with my car.`
    )
    const url = `whatsapp://send?phone=${mechanic.phone}&text=${msg}`
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url)
      else Alert.alert("WhatsApp not found", "Install WhatsApp to message this mechanic.")
    })
  }

  const openCall = () => {
    Linking.openURL(`tel:+${mechanic.phone}`)
  }

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={16} color={GOLD} fill={i < Math.floor(rating) ? GOLD : "transparent"} />
    ))

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 4, backgroundColor: isDark ? colors.card : "#fff", borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>Mechanic Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>

        {/* Hero section */}
        <View style={[styles.hero, { backgroundColor: isDark ? colors.card : "#fff" }]}>
          <Image source={{ uri: mechanic.avatar }} style={styles.heroAvatar} />
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.heroName, { color: colors.text }]}>{mechanic.name}</Text>
              {mechanic.verified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle size={14} color="#22c55e" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={[styles.heroSpecialty, { color: colors.primary }]}>{mechanic.specialty}</Text>

            <View style={styles.metaRow}>
              <Clock size={13} color={colors.subtext} />
              <Text style={[styles.metaText, { color: colors.subtext }]}>{mechanic.experience}</Text>
              <MapPin size={13} color={colors.subtext} />
              <Text style={[styles.metaText, { color: colors.subtext }]} numberOfLines={1}>{mechanic.location}</Text>
            </View>

            <View style={styles.ratingRow}>
              {renderStars(mechanic.rating)}
              <Text style={[styles.ratingLabel, { color: colors.text }]}>
                {mechanic.rating} · {mechanic.reviewCount} reviews
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons — Primary: Call, Outlined: WhatsApp */}
        <View style={[styles.actionRow, { backgroundColor: isDark ? colors.card : "#fff", borderTopColor: colors.border }]}>
          <AppButton
            label="Call"
            onPress={openCall}
            icon={<Phone size={18} color={colors.buttonText} />}
            style={{ flex: 1 }}
          />
          <AppButton
            label="WhatsApp"
            variant="outline"
            onPress={openWhatsApp}
            icon={<MessageSquare size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
        </View>

        {/* Bio */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : "#fff" }]}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          </View>
          <Text style={[styles.bioText, { color: colors.subtext }]}>{mechanic.bio}</Text>
        </View>

        {/* Services */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : "#fff" }]}>
          <View style={styles.sectionHeader}>
            <Briefcase size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          </View>
          <View style={styles.serviceChips}>
            {mechanic.services.map((s, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: isDark ? colors.background : colors.primary + "12", borderColor: colors.primary + "30", borderWidth: 1 }]}>
                <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : "#fff" }]}>
          <View style={styles.sectionHeader}>
            <Phone size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
          </View>
          <TouchableOpacity
            style={[styles.contactRow, { backgroundColor: isDark ? colors.background : colors.primary + "08", borderRadius: Radius.md, padding: Spacing.sm }]}
            onPress={openCall}
          >
            <Phone size={15} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.primary }]}>+{mechanic.phone}</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : "#fff" }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.subtext }]}>{mechanic.address}</Text>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: mechanic.latitude,
                longitude: mechanic.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: mechanic.latitude, longitude: mechanic.longitude }}
                title={mechanic.name}
                description={mechanic.location}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  topBarTitle: { fontSize: FontSize.md, fontFamily: FontFamily.bold, flex: 1, textAlign: "center" },

  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    gap: 16,
  },
  heroAvatar: { width: 88, height: 88, borderRadius: 44 },
  heroInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  heroName: { fontSize: FontSize.lg, fontFamily: FontFamily.bold },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { color: "#22c55e", fontSize: FontSize.xs, fontFamily: FontFamily.medium },
  heroSpecialty: { fontSize: FontSize.sm, fontFamily: FontFamily.semiBold, marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8, flexWrap: "wrap" },
  metaText: { fontSize: FontSize.xs, fontFamily: FontFamily.regular },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, marginLeft: 4 },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: Radius.lg,
  },
  actionBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  actionText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm },

  section: {
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: FontSize.md, fontFamily: FontFamily.bold },
  bioText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, lineHeight: 22 },

  serviceChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  chipText: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold },

  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: FontSize.md, fontFamily: FontFamily.medium },

  addressText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginBottom: 14 },
  mapWrapper: { borderRadius: Radius.lg, overflow: "hidden", height: 200 },
  map: { width: "100%", height: "100%" },
})
