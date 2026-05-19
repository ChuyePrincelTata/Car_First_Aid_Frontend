import React, { useEffect, useRef, useState } from "react"
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import AppButton from "@/components/AppButton"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import {
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Star,
  Upload,
  X,
} from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Shadows, Spacing } from "@/constants/Theme"
import { useAppModal } from "@/context/AppModalContext"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

const REQUIREMENTS = [
  "Valid professional mechanic certification or license",
  "Readable photo showing your name and certification details",
  "Current repair shop proof if available",
  "Specialized training certificates if available",
]

export default function MechanicVerificationScreen() {
  const [certificateUri, setCertificateUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const progressAnim = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const { mechanic, signOut } = useAuth()
  const { showAlert } = useAppModal()
  const verificationStatus = mechanic.verificationStatus
  const isPendingReview = verificationStatus === "pending"
  const isRejected = verificationStatus === "rejected"

  useEffect(() => {
    if (mechanic.isVerified) {
      router.replace("/(tabs)")
    }
  }, [mechanic.isVerified, router])

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 240,
      useNativeDriver: false,
    }).start()
  }, [progressAnim, uploadProgress])

  const pickDocument = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        showAlert({
          title: "Permission required",
          message: "Grant photo library access so you can upload your certification.",
          tone: "warning",
        })
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
        allowsMultipleSelection: false,
      })

      if (!result.canceled && result.assets?.length) {
        setCertificateUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking document:", error)
      showAlert({
        title: "Could not select image",
        message: "Failed to select image. Please try again.",
        tone: "danger",
      })
    }
  }

  const handleUpload = async () => {
    if (!certificateUri) {
      showAlert({
        title: "Certificate required",
        message: "Please select a clear certificate image first.",
        tone: "warning",
      })
      return
    }

    setUploading(true)
    setUploadProgress(8)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 92 ? prev : prev + 7))
    }, 180)

    try {
      await mechanic.uploadCertificate(certificateUri)
      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploading(false)
        showAlert({
          title: "Submitted for review",
          message: "Your certificate has been uploaded. We will notify you once your mechanic profile is verified.",
          tone: "success",
          confirmLabel: "Got it",
        })
      }, 450)
    } catch (error) {
      clearInterval(progressInterval)
      console.error("Error uploading certificate:", error)
      setUploading(false)
      setUploadProgress(0)
      showAlert({
        title: "Upload failed",
        message: "There was a problem uploading your certificate. Please check your connection and try again.",
        tone: "danger",
      })
    }
  }

  const clearSelection = () => {
    setCertificateUri(null)
    setUploadProgress(0)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/(auth)/Login")
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  })

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingTop: insets.top + SCREEN_HEADER_H + Spacing.lg,
      paddingHorizontal: Spacing.base,
      paddingBottom: insets.bottom + Spacing.xxl,
    },
    hero: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.lg,
      ...Shadows.sm,
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    heroIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "16",
    },
    eyebrow: {
      color: colors.primary,
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.xs,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.xl,
      lineHeight: 30,
      marginTop: 2,
    },
    subtitle: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginTop: Spacing.md,
      backgroundColor: colors.primary + "10",
    },
    statusText: {
      flex: 1,
      color: colors.text,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    section: {
      marginTop: Spacing.lg,
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
      marginBottom: Spacing.md,
    },
    uploadBox: {
      minHeight: 230,
      borderRadius: Radius.xl,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: certificateUri ? colors.primary + "55" : colors.border,
      backgroundColor: isDark ? colors.card : "#ffffff",
      overflow: "hidden",
      ...Shadows.sm,
    },
    emptyUpload: {
      flex: 1,
      minHeight: 230,
      alignItems: "center",
      justifyContent: "center",
      padding: Spacing.xl,
    },
    uploadIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "14",
      marginBottom: Spacing.md,
    },
    uploadTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
      textAlign: "center",
      marginBottom: Spacing.xs,
    },
    uploadText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      textAlign: "center",
      lineHeight: 21,
      maxWidth: 280,
    },
    preview: {
      width: "100%",
      height: 230,
    },
    previewOverlay: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.sm,
    },
    previewPill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      height: 38,
      backgroundColor: "rgba(10, 15, 28, 0.72)",
    },
    previewPillText: {
      flex: 1,
      color: "#ffffff",
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
    },
    removeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(10, 15, 28, 0.72)",
    },
    actionRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    progressCard: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.lg,
      marginTop: Spacing.lg,
      ...Shadows.sm,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.md,
    },
    progressTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.sm,
    },
    progressText: {
      color: colors.primary,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.sm,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      backgroundColor: isDark ? colors.background : "#e2e8f0",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    requirementCard: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.lg,
      ...Shadows.sm,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    requirementIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.success + "16",
    },
    requirementText: {
      flex: 1,
      color: colors.text,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
    },
    reviewNote: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      backgroundColor: colors.primary + "10",
    },
    reviewNoteText: {
      flex: 1,
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
  })

  if (mechanic.isVerified) return null

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Mechanic Verification"
        right={
          <TouchableOpacity onPress={handleSignOut} style={{ minWidth: 44, height: 36, alignItems: "flex-end", justifyContent: "center" }}>
            <Text style={{ color: colors.primary, fontFamily: FontFamily.medium, fontSize: FontSize.sm }}>Sign out</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Shield size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>{isPendingReview ? "Review in progress" : isRejected ? "Action needed" : "Verification required"}</Text>
              <Text style={styles.title}>{isPendingReview ? "Your certificate is being reviewed" : "Build trust before taking jobs"}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {isPendingReview
              ? "You cannot access the main dashboard until your mechanic profile is approved. We will keep this screen ready while your document is reviewed."
              : isRejected
                ? "Your previous document could not be approved. Upload a clearer certification or license to request another review."
                : "Upload a clear mechanic certification or license. Your profile stays pending while our team reviews the document."}
          </Text>
          <View style={styles.statusRow}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.statusText}>Most reviews are completed within 1-2 business days.</Text>
          </View>
        </View>

        {!isPendingReview ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certification Document</Text>
            <TouchableOpacity style={styles.uploadBox} activeOpacity={0.82} onPress={certificateUri ? undefined : pickDocument}>
              {certificateUri ? (
                <>
                  <Image source={{ uri: certificateUri }} style={styles.preview} resizeMode="cover" />
                  <View style={styles.previewOverlay}>
                    <View style={styles.previewPill}>
                      <CheckCircle size={16} color="#ffffff" />
                      <Text style={styles.previewPillText} numberOfLines={1}>Certificate image selected</Text>
                    </View>
                    <TouchableOpacity style={styles.removeButton} onPress={clearSelection}>
                      <X size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.emptyUpload}>
                  <View style={styles.uploadIcon}>
                    <Camera size={30} color={colors.primary} />
                  </View>
                  <Text style={styles.uploadTitle}>Upload certificate photo</Text>
                  <Text style={styles.uploadText}>
                    Use a clear image where your name, certificate title, and issuing body are readable.
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {certificateUri ? (
              <View style={styles.actionRow}>
                <AppButton
                  label="Change"
                  variant="outline"
                  icon={<Camera size={17} color={colors.primary} />}
                  onPress={pickDocument}
                  style={{ flex: 1 }}
                />
                <AppButton
                  label={uploading ? "Submitting" : "Submit"}
                  icon={<Upload size={17} color={colors.buttonText} />}
                  onPress={handleUpload}
                  loading={uploading}
                  style={{ flex: 1 }}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Verification status</Text>
                <Text style={styles.progressText}>Pending</Text>
              </View>
              <Text style={styles.subtitle}>
                Your document has been submitted. You will unlock the main dashboard after approval.
              </Text>
            </View>
          </View>
        )}

        {uploading ? (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Uploading document</Text>
              <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What we check</Text>
          <View style={styles.requirementCard}>
            {REQUIREMENTS.map((requirement) => (
              <View key={requirement} style={styles.requirementItem}>
                <View style={styles.requirementIcon}>
                  <CheckCircle size={17} color={colors.success} />
                </View>
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
            <View style={styles.reviewNote}>
              <Star size={20} color={colors.primary} />
              <Text style={styles.reviewNoteText}>
                Verified mechanics appear more prominently and can receive service requests with a trust badge.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewNote}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.reviewNoteText}>
              If your document is rejected, you can upload a clearer copy from this screen.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
