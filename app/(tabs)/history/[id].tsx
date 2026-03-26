import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import { mockHistory } from "@/data/mockData"
import { Ionicons } from "@expo/vector-icons"
import { 
  ChevronLeft, AlertCircle, Camera, Mic, Calendar, 
  FileText, Activity, Wrench, CheckCircle, Clock
} from "@/components/SafeLucide"
import AppButton from "@/components/AppButton"

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()

  const [diagnosis, setDiagnosis] = useState(() => mockHistory.find((item) => item.id === id))

  useEffect(() => {
    setDiagnosis(mockHistory.find((item) => item.id === id))
  }, [id])

  if (!diagnosis) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontFamily: FontFamily.medium }}>Diagnosis not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontFamily: FontFamily.medium }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const toggleResolved = () => {
    setDiagnosis(prev => prev ? { ...prev, resolved: !prev.resolved } : prev)
  }

  const renderIcon = (size = 32) => {
    switch (diagnosis.type) {
      case "image": return <Camera size={size} color={colors.primary} />
      case "sound": return <Mic size={size} color={colors.primary} />
      case "manual": return <FileText size={size} color={colors.primary} />
      default: return <AlertCircle size={size} color={colors.primary} />
    }
  }

  // Placeholder AI data to showcase the layout, including YouTube api results
  const aiDetails = {
    description: `Based on the ${diagnosis.type} provided, the system detects characteristics matching a ${diagnosis.issue}. This is a common issue often related to ${diagnosis.type === "image" ? "dashboard sensors or superficial wear" : diagnosis.type === "sound" ? "engine timing, belts, or exhaust leaks" : "user-reported symptoms"}.`,
    confidence: 85,
    recommendations: [
      "Run an OBD-II scanner to confirm exact error codes.",
      "Check relevant fuses and battery voltage.",
      "Schedule an inspection with a certified mechanic within 7 days."
    ],
    videoLinks: [
      { title: `How to diagnose & fix ${diagnosis.issue}`, url: "https://www.youtube.com/watch?v=O1hF25Cowv8" },
      { title: `Understanding ${diagnosis.issue} causes`, url: "https://www.youtube.com/watch?v=kEUObVpcXyA" }
    ]
  }

  const openVideo = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url)
    })
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: isDark ? colors.card : "#fff", borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>Diagnosis Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        {/* Header Summary */}
        <View style={[styles.hero, { backgroundColor: isDark ? colors.card : "#fff", borderBottomColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "1A" }]}>
            {renderIcon()}
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroIssue, { color: colors.text }]}>{diagnosis.issue}</Text>
            
            <View style={styles.dateRow}>
              <Calendar size={14} color={colors.subtext} />
              <Text style={[styles.dateText, { color: colors.subtext }]}>
                {new Date(diagnosis.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </Text>
            </View>

            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: "transparent" }]}>
                <Text style={[styles.badgeText, { color: diagnosis.severity === "High" ? "#e53935" : diagnosis.severity === "Medium" ? "#f59e0b" : "#22c55e" }]}>
                  {diagnosis.severity} Severity
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: diagnosis.resolved ? colors.primary : "transparent", borderWidth: diagnosis.resolved ? 0 : 1, borderColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: diagnosis.resolved ? "#fff" : colors.text }]}>
                  {diagnosis.resolved ? "Resolved" : "Unresolved"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Analysis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Analysis</Text>
          </View>
          <View style={[styles.card, { backgroundColor: isDark ? colors.card : "#fff", borderColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              {aiDetails.description}
            </Text>

            <View style={styles.confidenceRow}>
              <Text style={[styles.confidenceLabel, { color: colors.subtext }]}>AI Confidence Score:</Text>
              <View style={[styles.confidenceBarBg, { backgroundColor: isDark ? "#333" : "#e2e8f0" }]}>
                <View style={[styles.confidenceBarFill, { backgroundColor: colors.primary, width: `${aiDetails.confidence}%` }]} />
              </View>
              <Text style={[styles.confidenceValue, { color: colors.primary }]}>{aiDetails.confidence}%</Text>
            </View>
          </View>
        </View>

        {/* Recommended Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Actions</Text>
          </View>
          <View style={[styles.card, { backgroundColor: isDark ? colors.card : "#fff", borderColor: colors.border }]}>
            {aiDetails.recommendations.map((rec, i) => (
              <View key={i} style={styles.actionItem}>
                <View style={[styles.actionBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.actionText, { color: colors.text }]}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Helpful Videos generated based on AI output */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="logo-youtube" size={24} color="#E53935" />
            <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 4 }]}>Helpful Videos</Text>
          </View>
          {aiDetails.videoLinks.map((link, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.videoLink, { backgroundColor: isDark ? colors.primary + "12" : colors.primary + "08" }]} 
              onPress={() => openVideo(link.url)}
            >
              <Ionicons name="logo-youtube" size={20} color="#E53935" />
              <Text style={[styles.videoTxt, { color: colors.primary }]}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Media / Context Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {renderIcon(20)}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Provided Context</Text>
          </View>
          <View style={[styles.mediaPlaceholder, { backgroundColor: isDark ? colors.card : "#f8fafc", borderColor: colors.border }]}>
            {diagnosis.type === "sound" ? (
              <View style={{ alignItems: "center", gap: 12 }}>
                <Mic size={32} color={colors.subtext} />
                <Text style={{ color: colors.subtext, fontFamily: FontFamily.medium }}>Audio recording attached</Text>
              </View>
            ) : diagnosis.type === "image" ? (
              <View style={{ alignItems: "center", gap: 12 }}>
                <Camera size={32} color={colors.subtext} />
                <Text style={{ color: colors.subtext, fontFamily: FontFamily.medium }}>Dashboard photo attached</Text>
              </View>
            ) : (
              <View style={{ alignItems: "center", gap: 12 }}>
                <FileText size={32} color={colors.subtext} />
                <Text style={{ color: colors.subtext, fontFamily: FontFamily.medium }}>Manual entry details provided</Text>
              </View>
            )}
          </View>
        </View>

        {/* Mechanic Matches CTA */}
        {!diagnosis.resolved && (
          <View style={styles.section}>
            <View style={[styles.mechanicCTA, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <View style={[styles.iconWrapSmall, { backgroundColor: colors.primary + "20" }]}>
                  <Wrench size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ctaTitle, { color: colors.text }]}>Need a professional?</Text>
                  <Text style={[styles.ctaDesc, { color: colors.subtext }]}>We found 3 specialists near you that can handle this.</Text>
                </View>
              </View>
              <AppButton
                label="Find a Mechanic"
                onPress={() => router.push("/(tabs)/mechanics")}
                icon={<Wrench size={16} color={colors.buttonText} />}
              />
            </View>
          </View>
        )}

        {/* Mark as Resolved Toggle */}
        <View style={styles.section}>
          <AppButton
            label={diagnosis.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
            variant={diagnosis.resolved ? "outline" : "primary"}
            onPress={toggleResolved}
            icon={
              diagnosis.resolved
                ? <Clock size={18} color={colors.primary} />
                : <CheckCircle size={18} color={colors.buttonText} />
            }
          />
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
    padding: Spacing.xl,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: { flex: 1, justifyContent: "center" },
  heroIssue: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, marginBottom: 6 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  dateText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: FontSize.xs, fontFamily: FontFamily.bold },

  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: FontSize.md, fontFamily: FontFamily.bold },
  
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bodyText: { fontSize: 14, fontFamily: FontFamily.regular, lineHeight: 22, marginBottom: 16 },
  
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  confidenceLabel: { fontSize: 13, fontFamily: FontFamily.medium },
  confidenceBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  confidenceBarFill: { height: "100%", borderRadius: 3 },
  confidenceValue: { fontSize: 13, fontFamily: FontFamily.bold },

  actionItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  actionBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  actionText: { flex: 1, fontSize: 14, fontFamily: FontFamily.regular, lineHeight: 21 },

  videoLink: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1, borderColor: "transparent", // Will be overridden or we can set it
    padding: Spacing.sm, borderRadius: Radius.md, marginBottom: Spacing.sm,
  },
  videoTxt: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginLeft: Spacing.sm },

  mediaPlaceholder: {
    height: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  mechanicCTA: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  iconWrapSmall: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  ctaTitle: { fontSize: 15, fontFamily: FontFamily.bold, marginBottom: 2 },
  ctaDesc: { fontSize: 13, fontFamily: FontFamily.regular },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontFamily: FontFamily.bold, fontSize: 15 },

  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  toggleBtnText: { fontFamily: FontFamily.bold, fontSize: 15 },
})
