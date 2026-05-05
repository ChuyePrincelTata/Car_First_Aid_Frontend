import React, { useState } from "react"
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppButton from "@/components/AppButton"
import ConfirmActionModal from "@/components/ConfirmActionModal"
import {
  Activity,
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  Mic,
  Trash2,
  Wrench,
  Youtube,
} from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useDiagnosticsContext, type Diagnostic } from "@/context/DiagnosticsContext"
import { useTheme } from "@/context/ThemeContext"
import { getSafeVideoUrl } from "@/utils/diagnosticHistory"

const typeLabel: Record<Diagnostic["type"], string> = {
  dashboard: "Dashboard Photo",
  engine: "Engine Sound",
  sound: "Engine Sound",
  manual: "Manual Report",
}

const getSeverityColor = (diagnostic: Diagnostic, colors: ReturnType<typeof useTheme>["colors"]) => {
  if (diagnostic.result?.severity === "high") return colors.error
  if (diagnostic.result?.severity === "medium") return colors.warning
  return colors.success
}

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const { getDiagnosticById, toggleDiagnosticResolved, deleteDiagnostic } = useDiagnosticsContext()
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)
  const diagnosis = id ? getDiagnosticById(id) : null

  if (!diagnosis) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <AlertCircle size={44} color={colors.error} />
        <Text style={[styles.notFoundText, { color: colors.text }]}>Diagnosis not found.</Text>
        <AppButton
          label="Go Back"
          variant="outline"
          onPress={() => router.back()}
          fullWidth={false}
          style={{ marginTop: 16 }}
        />
      </View>
    )
  }

  const result = diagnosis.result
  const resolved = Boolean(diagnosis.resolved)
  const recommendations = result?.recommendations?.length
    ? result.recommendations
    : result?.recommendation
      ? [result.recommendation]
      : []

  const handleDelete = () => {
    deleteDiagnostic(diagnosis.id)
    setConfirmDeleteVisible(false)
    router.replace("/(tabs)/history")
  }

  const renderIcon = (size = 32) => {
    if (diagnosis.type === "dashboard") return <Camera size={size} color={colors.primary} />
    if (diagnosis.type === "engine" || diagnosis.type === "sound") return <Mic size={size} color={colors.primary} />
    return <FileText size={size} color={colors.primary} />
  }

  const openVideo = (link: { title: string; url: string }) => {
    Linking.openURL(getSafeVideoUrl(link, result?.issue)).catch(() => {
      Alert.alert("Could not open link", "Please check your connection and try again.")
    })
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? colors.card : "#fff",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.topButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
          Diagnosis Details
        </Text>
        <TouchableOpacity onPress={() => setConfirmDeleteVisible(true)} style={styles.topButton}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: isDark ? colors.card : "#fff", borderBottomColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "1A" }]}>{renderIcon()}</View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroIssue, { color: colors.text }]}>{result?.issue ?? diagnosis.title}</Text>
            <Text style={[styles.typeText, { color: colors.subtext }]}>{typeLabel[diagnosis.type]}</Text>

            <View style={styles.dateRow}>
              <Calendar size={14} color={colors.subtext} />
              <Text style={[styles.dateText, { color: colors.subtext }]}>
                {new Date(diagnosis.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={[styles.badgeText, { color: getSeverityColor(diagnosis, colors) }]}>
                  {(result?.severity ?? "low").toUpperCase()} Severity
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: resolved ? colors.primary : "transparent",
                    borderWidth: resolved ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: resolved ? colors.buttonText : colors.text }]}>
                  {resolved ? "Resolved" : "Unresolved"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Analysis</Text>
          </View>
          <View style={[styles.card, { backgroundColor: isDark ? colors.card : "#fff", borderColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              {result?.description ?? "No analysis description was saved for this diagnosis."}
            </Text>

            <View style={styles.confidenceRow}>
              <Text style={[styles.confidenceLabel, { color: colors.subtext }]}>Confidence</Text>
              <View style={[styles.confidenceBarBg, { backgroundColor: isDark ? "#333" : "#e2e8f0" }]}>
                <View
                  style={[
                    styles.confidenceBarFill,
                    { backgroundColor: colors.primary, width: `${result?.confidence ?? 0}%` },
                  ]}
                />
              </View>
              <Text style={[styles.confidenceValue, { color: colors.primary }]}>{result?.confidence ?? 0}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Actions</Text>
          </View>
          <View style={[styles.card, { backgroundColor: isDark ? colors.card : "#fff", borderColor: colors.border }]}>
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <View key={`${recommendation}-${index}`} style={styles.actionItem}>
                  <View style={[styles.actionBullet, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.actionText, { color: colors.text }]}>{recommendation}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.bodyText, { color: colors.subtext, marginBottom: 0 }]}>
                No recommendations were saved for this diagnosis.
              </Text>
            )}
          </View>
        </View>

        {result?.videoLinks?.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Youtube size={22} color="#E53935" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Helpful Videos</Text>
            </View>
            {result.videoLinks.map((link, index) => (
              <TouchableOpacity
                key={`${link.url}-${index}`}
                style={[styles.videoLink, { backgroundColor: isDark ? colors.primary + "12" : colors.primary + "08" }]}
                onPress={() => openVideo(link)}
              >
                <Text style={[styles.videoTxt, { color: colors.primary }]}>{link.title}</Text>
                <ExternalLink size={18} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {renderIcon(20)}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Provided Context</Text>
          </View>
          <View style={[styles.mediaPlaceholder, { backgroundColor: isDark ? colors.card : "#f8fafc", borderColor: colors.border }]}>
            {renderIcon(32)}
            <Text style={[styles.contextText, { color: colors.subtext }]}>
              {diagnosis.inputSummary ?? `${typeLabel[diagnosis.type]} details were saved with this result.`}
            </Text>
          </View>
        </View>

        {!resolved && (
          <View style={styles.section}>
            <View style={[styles.mechanicCTA, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <View style={styles.ctaRow}>
                <View style={[styles.iconWrapSmall, { backgroundColor: colors.primary + "20" }]}>
                  <Wrench size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ctaTitle, { color: colors.text }]}>Need a professional?</Text>
                  <Text style={[styles.ctaDesc, { color: colors.subtext }]}>Find a mechanic who can inspect this result.</Text>
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

        <View style={styles.section}>
          <AppButton
            label={resolved ? "Mark as Unresolved" : "Mark as Resolved"}
            variant={resolved ? "outline" : "primary"}
            onPress={() => toggleDiagnosticResolved(diagnosis.id)}
            icon={
              resolved ? (
                <Clock size={18} color={colors.primary} />
              ) : (
                <CheckCircle size={18} color={colors.buttonText} />
              )
            }
          />
        </View>
      </ScrollView>

      <ConfirmActionModal
        visible={confirmDeleteVisible}
        title="Delete diagnosis?"
        message="This diagnostic result will be removed from your history. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  notFoundText: { marginTop: 12, fontFamily: FontFamily.medium },
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
  topButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
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
  heroInfo: { flex: 1 },
  heroIssue: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, marginBottom: 4 },
  typeText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginBottom: 8 },
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
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  videoTxt: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginRight: Spacing.sm },
  mediaPlaceholder: {
    minHeight: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  contextText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, textAlign: "center", marginTop: 12 },
  mechanicCTA: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconWrapSmall: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  ctaTitle: { fontSize: 15, fontFamily: FontFamily.bold, marginBottom: 2 },
  ctaDesc: { fontSize: 13, fontFamily: FontFamily.regular },
})
