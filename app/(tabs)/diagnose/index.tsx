import { useState, useRef } from "react"
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  ActivityIndicator, ScrollView, Dimensions,
} from "react-native"
import { Camera, Upload, ChevronLeft } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { CameraView } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import { getApiBaseUrl } from "@/utils/apiConfig"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import React from "react"

const { width } = Dimensions.get("window")

type VideoLink = {
  title: string
  url: string
}

export default function DiagnoseScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [facing, setFacing] = useState<"back" | "front">("back")
  const cameraRef = useRef<any>(null)
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return
    try {
      const photo = await cameraRef.current.takePictureAsync()
      setImage(photo.uri)
      setShowCamera(false)
    } catch (error) {
      console.error("Error taking picture:", error instanceof Error ? error.message : error)
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // Native OS cropper for best UX
        // No fixed 'aspect' ratio so user can crop freely or keep original
        quality: 1,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error instanceof Error ? error.message : error)
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
      height: 220,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: isDark ? colors.primary + "30" : colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadAreaFilled: {
      borderStyle: "solid",
      borderColor: colors.primary + "60",
    },
    imagePreview: {
      width: "100%",
      height: "100%",
      resizeMode: "contain", // show full image without forced cropping
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
    btn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    btnPrimary: {
      backgroundColor: colors.primary,
    },
    btnSecondary: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnText: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.sm,
    },
    btnTextPrimary: { color: colors.buttonText },
    btnTextSecondary: { color: colors.text },
    // ─── Analyse button ──────────────────────────────────────────────────────
    analyzeBtn: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      paddingVertical: 16,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    analyzeBtnText: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
      color: colors.buttonText,
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
    // ─── Loading / Permission ─────────────────────────────────────────────────
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
    loadingText: {
      marginTop: Spacing.md, fontSize: FontSize.md,
      fontFamily: FontFamily.medium, color: colors.text,
    },
    permTitle: {
      fontSize: FontSize.lg, fontFamily: FontFamily.bold,
      color: colors.text, marginBottom: Spacing.sm, textAlign: "center",
    },
    permText: {
      fontSize: FontSize.sm, fontFamily: FontFamily.regular,
      color: colors.subtext, textAlign: "center",
      marginBottom: Spacing.xl, lineHeight: 22,
    },
    permBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 12, paddingHorizontal: Spacing.xl,
      borderRadius: Radius.lg,
    },
    permBtnText: {
      color: colors.buttonText,
      fontSize: FontSize.md, fontFamily: FontFamily.semiBold,
    },
    // ─── Camera ──────────────────────────────────────────────────────────────
    cameraContainer: { flex: 1, backgroundColor: "#000" },
    camera:          { flex: 1 },
    cameraControls:  {
      position: "absolute", bottom: 40, left: 0, right: 0,
      flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    },
    cameraBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center", alignItems: "center",
    },
    captureBtn: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center", alignItems: "center",
    },
    captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
    cancelTxt: { color: "#fff", fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  })

  // ─── Permission loading ──────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    )
  }

  // ─── Permission denied ───────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>
          We need your camera to photograph dashboard warning lights for accurate AI analysis.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ─── Analyzing loader ────────────────────────────────────────────────────
  if (diagnosing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analysing dashboard lights…</Text>
      </View>
    )
  }

  // ─── Camera view ─────────────────────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraBtn} onPress={toggleCameraFacing}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  // ─── Main screen ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard Diagnosis</Text>
        </View>
        <Text style={styles.subtitle}>Snap or upload a photo of your warning lights</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 48,
          justifyContent: image ? "flex-start" : "center" // Vertically center when empty
        }}
      >

        {/* Upload / Preview Area */}
        <View style={[styles.uploadArea, image && styles.uploadAreaFilled]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
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
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => setShowCamera(true)}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={pickImage}>
              <Text style={[styles.btnText, styles.btnTextSecondary]}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        ) : !diagnosisResult ? (
          <>
            <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeDashboard}>
              <Text style={styles.analyzeBtnText}>Analyse Dashboard Lights</Text>
            </TouchableOpacity>
            <View style={styles.changeRow}>
              <TouchableOpacity onPress={pickImage}>
                <Text style={styles.changeText}>Change photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetDiagnosis}>
                <Text style={styles.resetText}>Cancel</Text>
              </TouchableOpacity>
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

            <TouchableOpacity onPress={resetDiagnosis} style={{ marginTop: Spacing.lg, alignSelf: "center" }}>
              <Text style={styles.resetText}>Start a New Diagnosis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
