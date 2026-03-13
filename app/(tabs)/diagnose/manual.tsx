import { useState } from "react"
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { AlertTriangle, Play } from "@/components/SafeLucide"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import React from "react"

type VideoLink = { title: string; url: string }

export default function ManualDiagnosisScreen() {
  const [description, setDescription] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  const analyzeProblem = () => {
    if (!description.trim() || !symptoms.trim()) {
      alert("Please fill in both fields.")
      return
    }
    setDiagnosing(true)
    setTimeout(() => {
      setDiagnosisResult({
        issue: "Potential Transmission Problem",
        description: "Based on the symptoms described, your vehicle may be experiencing transmission-related issues. The combination of shifting difficulties and unusual noises suggests potential wear in the transmission system.",
        severity: "Medium",
        recommendations: [
          "Check transmission fluid level and condition",
          "Inspect for transmission fluid leaks",
          "Have a professional perform a transmission diagnostic scan",
          "Consider a transmission fluid flush if not done recently",
        ],
        videoLinks: [
          { title: "How to Check Transmission Fluid", url: "https://www.youtube.com/watch?v=example1" },
          { title: "Common Transmission Problems", url: "https://www.youtube.com/watch?v=example2" },
        ],
      })
      setDiagnosing(false)
    }, 3000)
  }

  const resetDiagnosis = () => {
    setDescription("")
    setSymptoms("")
    setDiagnosisResult(null)
  }

  const severityColor = (s: string) =>
    s === "High" || s === "Critical" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#22c55e"

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: Spacing.md, fontSize: FontSize.md, fontFamily: FontFamily.medium, color: colors.text },

    // Header
    header: { paddingTop: insets.top + 12, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
    title: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.tabIconDefault, marginTop: 2 },

    // Form
    formCard: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    label: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    input: {
      backgroundColor: isDark ? colors.background : "#f8fafc",
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      color: colors.text,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      borderWidth: 1,
      borderColor: colors.border,
      textAlignVertical: "top",
    },
    spacer: { height: Spacing.md },

    // Buttons
    analyzeBtn: {
      marginTop: Spacing.md,
      paddingVertical: 14,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    analyzeBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: colors.buttonText },

    // Result card
    resultCard: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    resultTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, color: colors.text, marginBottom: Spacing.sm },
    resultDesc: {
      fontSize: FontSize.sm, fontFamily: FontFamily.regular,
      color: colors.subtext, lineHeight: 22, marginBottom: Spacing.md,
    },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
    badgeLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.text },
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
    badgeTxt: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold, color: "#fff" },
    sectionLabel: {
      fontSize: FontSize.sm, fontFamily: FontFamily.semiBold,
      color: colors.text, marginTop: Spacing.sm, marginBottom: Spacing.sm,
    },
    rec: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
    recDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.primary, marginTop: 8, marginRight: Spacing.sm,
    },
    recText: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.text, lineHeight: 22 },
    videoLink: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: isDark ? colors.primary + "12" : colors.primary + "08",
      padding: Spacing.sm, borderRadius: Radius.md, marginBottom: Spacing.sm,
    },
    videoTxt: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.primary, marginLeft: Spacing.sm },
    resetLink: { alignSelf: "center", marginTop: Spacing.lg },
    resetTxt: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, color: colors.error },
  })

  if (diagnosing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analysing your report…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manual Diagnosis</Text>
        <Text style={styles.subtitle}>Describe your car problems in detail</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Input form */}
        {!diagnosisResult && (
          <View style={styles.formCard}>
            <Text style={styles.label}>Problem Description</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="Describe the problem in detail…"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.spacer} />

            <Text style={styles.label}>Symptoms</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="List any noticeable symptoms…"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
            />

            <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeProblem}>
              <Text style={styles.analyzeBtnTxt}>Analyse Problem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result */}
        {diagnosisResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{diagnosisResult.issue}</Text>
            <Text style={styles.resultDesc}>{diagnosisResult.description}</Text>

            <View style={styles.badgeRow}>
              <Text style={styles.badgeLabel}>Severity:</Text>
              <View style={[styles.badge, { backgroundColor: severityColor(diagnosisResult.severity) }]}>
                <Text style={styles.badgeTxt}>{diagnosisResult.severity}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Recommendations</Text>
            {diagnosisResult.recommendations.map((r: string, i: number) => (
              <View key={i} style={styles.rec}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Helpful Videos</Text>
            {diagnosisResult.videoLinks.map((l: VideoLink, i: number) => (
              <TouchableOpacity key={i} style={styles.videoLink}>
                <Play size={16} color={colors.primary} />
                <Text style={styles.videoTxt}>{l.title}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.resetLink} onPress={resetDiagnosis}>
              <Text style={styles.resetTxt}>Start a New Diagnosis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
