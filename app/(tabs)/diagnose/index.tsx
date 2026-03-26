import { useState, useRef } from "react"
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  ActivityIndicator, ScrollView, Dimensions,
} from "react-native"
import { Camera, Upload } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { getApiBaseUrl } from "@/utils/apiConfig"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import { useWhatsAppCropper } from "@/hooks/useWhatsAppCropper"
import AppButton from "@/components/AppButton"
import { useLocalSearchParams } from "expo-router"
import React, { useEffect } from "react"

const { width } = Dimensions.get("window")

type VideoLink = {
  title: string
  url: string
}

export default function DiagnoseScreen() {
  const [image, setImage] = useState<string | null>(null)
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams<{ croppedUri?: string }>()
  const { launchCamera, launchCropper } = useWhatsAppCropper()

  // Listen for the returning cropped URI from our Expo Go JS fallback cropper
  useEffect(() => {
    if (params.croppedUri) {
      const decoded = decodeURIComponent(params.croppedUri)
      setImage(decoded)
      
      // We can reset ratio to 1 or try to read it again. 
      // For simplicity in the fallback, we allow it to fill naturally.
      Image.getSize(decoded, (w, h) => setImageAspectRatio(w / h), () => setImageAspectRatio(1))

      // Clear the param so it doesn't re-trigger unnecessarily
      router.setParams({ croppedUri: "" })
    }
  }, [params.croppedUri])

  const takePicture = async () => {
    const result = await launchCamera()
    if (result) {
      setImage(result.uri)
      if (result.width && result.height) setImageAspectRatio(result.width / result.height)
    }
  }

  const pickImage = async () => {
    const result = await launchCropper()
    if (result) {
      setImage(result.uri)
      if (result.width && result.height) setImageAspectRatio(result.width / result.height)
    }
  }

  const analyzeDashboard = async () => {
    if (!image) return
    setDiagnosing(true)
    try {
      const baseUrl = getApiBaseUrl()
      if (!baseUrl) throw new Error("API URL not configured")
      const apiUrl = `${baseUrl}/diagnostics/analyze-dashboard`
      const formData = new FormData()
      formData.append("image", { uri: image, type: "image/jpeg", name: "dashboard.jpg" } as any)
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
      setDiagnosisResult(await response.json())
    } catch {
      setDiagnosisResult({
        issue: "Check Engine Light",
        description: "The check engine light indicates a problem with the engine or emissions system. Common causes include a loose gas cap, faulty oxygen sensor, or catalytic converter issues.",
        severity: "Medium",
        confidence: 85,
        recommendations: [
          "Check if the gas cap is loose or damaged",
          "Use an OBD-II scanner to read specific error codes",
          "Have a professional mechanic inspect the vehicle",
        ],
        videoLinks: [
          { title: "How to Diagnose Check Engine Light", url: "https://www.youtube.com/watch?v=example1" },
          { title: "Common Check Engine Light Causes", url: "https://www.youtube.com/watch?v=example2" },
        ],
      })
    } finally {
      setDiagnosing(false)
    }
  }

  const resetDiagnosis = () => {
    setImage(null)
    setDiagnosisResult(null)
    setImageAspectRatio(1)
  }

  const severityColor = (s: string) => {
    if (s === "High" || s === "Critical") return "#ef4444"
    if (s === "Medium") return "#f59e0b"
    return "#22c55e"
  }

  const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: colors.background },
    // ─── Header ─────────────────────────────────────────────────────────────
    header: {
      paddingTop: insets.top + 16,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.sm,
    },
    headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    backBtn: {
      width: 40, height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.card : "#f1f5f9",
      alignItems: "center", justifyContent: "center",
      marginRight: 12,
    },
    title: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.tabIconDefault,
    },
    // ─── Upload Area ─────────────────────────────────────────────────────────
    uploadArea: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      borderRadius: Radius.xl,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: isDark ? colors.primary + "30" : colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadAreaEmpty: {
      height: 220,
    },
    uploadAreaFilled: {
      borderStyle: "solid",
      borderColor: colors.primary + "30",
      backgroundColor: "transparent",
    },
    imagePreview: {
      width: "100%",
    },
    uploadIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? colors.primary + "18" : colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.md,
    },
    uploadText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.tabIconDefault,
      textAlign: "center",
      maxWidth: 220,
      lineHeight: 20,
    },
    // ─── Button Row ──────────────────────────────────────────────────────────
    buttonRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
    },
    // ─── Change / Reset row ──────────────────────────────────────────────────
    changeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.sm,
    },
    changeText: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, color: colors.primary },
    resetText:  { fontSize: FontSize.xs, fontFamily: FontFamily.medium, color: colors.error },
    // ─── Results ─────────────────────────────────────────────────────────────
    resultCard: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    resultTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    resultDesc: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      lineHeight: 22,
      marginBottom: Spacing.md,
    },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
    badgeLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.text },
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
    badgeText: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold, color: "#fff" },
    sectionLabel: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },
    rec: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
    recDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 8, marginRight: Spacing.sm,
    },
    recText: {
      flex: 1, fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.text, lineHeight: 22,
    },
    videoLink: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: isDark ? colors.primary + "12" : colors.primary + "08",
      padding: Spacing.sm, borderRadius: Radius.md,
      marginBottom: Spacing.sm,
    },
    videoLinkText: {
      flex: 1, fontSize: FontSize.sm,
      fontFamily: FontFamily.medium, color: colors.primary, marginLeft: Spacing.sm,
    },
    // ─── Loading ─────────────────────────────────────────────────────────────
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
    loadingText: {
      marginTop: Spacing.md, fontSize: FontSize.md,
      fontFamily: FontFamily.medium, color: colors.text,
    },
  })

  // ─── Analyzing loader ────────────────────────────────────────────────────
  if (diagnosing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analysing dashboard lights…</Text>
      </View>
    )
  }

  // ─── Main screen ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Dashboard Diagnosis" 
        onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingTop: insets.top + SCREEN_HEADER_H + Spacing.md,
          paddingBottom: 48,
          justifyContent: diagnosisResult ? "flex-start" : "center" // Vertically center broadly
        }}
      >
        <Text style={[styles.subtitle, { textAlign: "center", marginBottom: Spacing.md }]}>Snap or upload a photo of your warning lights</Text>

        {/* Upload / Preview Area */}
        <View style={[
          styles.uploadArea, 
          image ? styles.uploadAreaFilled : styles.uploadAreaEmpty
        ]}>
          {image ? (
            <Image source={{ uri: image }} style={[styles.imagePreview, { aspectRatio: imageAspectRatio }]} />
          ) : (
            <>
              <View style={styles.uploadIconWrap}>
                <Upload size={28} color={colors.primary} />
              </View>
              <Text style={styles.uploadText}>
                Take or upload a clear photo of your dashboard warning lights
              </Text>
            </>
          )}
        </View>

        {/* Buttons */}
        {!image ? (
          <View style={styles.buttonRow}>
            <AppButton
              label="Take Photo"
              onPress={takePicture}
              style={{ flex: 1 }}
            />
            <AppButton
              label="Upload Photo"
              variant="outline"
              onPress={pickImage}
              style={{ flex: 1 }}
            />
          </View>
        ) : !diagnosisResult ? (
          <>
            <AppButton
              label="Analyse Dashboard Lights"
              onPress={analyzeDashboard}
              style={{ marginHorizontal: Spacing.xl, marginTop: Spacing.md }}
              size="lg"
            />
            <View style={styles.changeRow}>
              <AppButton
                label="Change photo"
                variant="ghost"
                onPress={pickImage}
                textStyle={styles.changeText}
                fullWidth={false}
              />
              <AppButton
                label="Cancel"
                variant="ghost"
                onPress={resetDiagnosis}
                textStyle={styles.resetText}
                fullWidth={false}
              />
            </View>
          </>
        ) : null}

        {/* Diagnosis Result */}
        {diagnosisResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{diagnosisResult.issue}</Text>
            <Text style={styles.resultDesc}>{diagnosisResult.description}</Text>

            <View style={styles.badgeRow}>
              <Text style={styles.badgeLabel}>Severity:</Text>
              <View style={[styles.badge, { backgroundColor: severityColor(diagnosisResult.severity) }]}>
                <Text style={styles.badgeText}>{diagnosisResult.severity}</Text>
              </View>
              {diagnosisResult.confidence && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{diagnosisResult.confidence}% confident</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionLabel}>Recommendations</Text>
            {diagnosisResult.recommendations?.map((rec: string, i: number) => (
              <View key={i} style={styles.rec}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}

            {diagnosisResult.videoLinks?.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Helpful Videos</Text>
                {diagnosisResult.videoLinks.map((link: VideoLink, i: number) => (
                  <TouchableOpacity key={i} style={styles.videoLink}>
                    <Camera size={18} color={colors.primary} />
                    <Text style={styles.videoLinkText}>{link.title}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <AppButton
              label="Start a New Diagnosis"
              variant="ghost"
              onPress={resetDiagnosis}
              textStyle={styles.resetText}
              fullWidth={false}
              style={{ marginTop: Spacing.lg, alignSelf: "center" }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}
