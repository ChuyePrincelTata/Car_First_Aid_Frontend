

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, ActivityIndicator, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "@/context/ThemeContext"
import { useRouter, useLocalSearchParams } from "expo-router"
import LinearGradient from "@/components/LinearGradient"
import {
  ChevronLeft,
  ChevronRight,
  TriangleAlert as AlertTriangle,
  ExternalLink,
  Share2,
  ThumbsUp,
  ThumbsDown,
} from "@/components/SafeLucide"
import Animated, { FadeIn } from "react-native-reanimated"
import { useDiagnosticsContext } from "@/context/DiagnosticsContext"
import React from "react"
import { getSafeVideoUrl } from "@/utils/diagnosticHistory"

interface VideoLink {
  url: string
  title: string
}

interface DiagnosticResult {
  severity: "high" | "medium" | "low"
  issue: string
  confidence: number
  description: string
  recommendation: string
  videoLinks?: VideoLink[]
}

interface Diagnostic {
  result?: DiagnosticResult
}

export default function EngineSoundResultScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { getDiagnosticById } = useDiagnosticsContext()
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const diagnosticId = Array.isArray(id) ? id[0] : id
  const [loading, setLoading] = useState(true)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const colorScheme = useColorScheme()
  const { colors } = useTheme()

  useEffect(() => {
    if (diagnosticId) {
      const result = getDiagnosticById(diagnosticId)
      setDiagnostic(result)
      setLoading(false)
    }
  }, [id])

  const handleVideoLink = (video: VideoLink): Promise<void> => {
    return Linking.openURL(getSafeVideoUrl(video, diagnostic?.result?.issue))
  }

  interface SeverityLevel {
    severity: "high" | "medium" | "low" | undefined
  }

  const getSeverityColor = (severity: SeverityLevel["severity"]): string => {
    switch (severity) {
      case "high":
        return colors.error
      case "medium":
        return colors.warning
      case "low":
        return colors.success
      default:
        return colors.tabIconDefault
    }
  }

  interface FeedbackHandlerProps {
    isHelpful: boolean
  }

  const handleFeedback = ({ isHelpful }: FeedbackHandlerProps): void => {
    // In a real app, we would send this feedback to the server
    setFeedbackGiven(true)
    alert(
      isHelpful
        ? "Thank you for your feedback!"
        : "We appreciate your feedback and will work to improve our diagnostics.",
    )
  }

  const handleFindMechanics = () => {
    router.push("/mechanics")
  }

  const handleShareResult = () => {
    // In a real app, we would implement sharing functionality
    alert("Sharing functionality would be implemented here.")
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>Loading diagnostic results...</Text>
      </SafeAreaView>
    )
  }

  if (!diagnostic) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <AlertTriangle size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Diagnostic result not found</Text>
        <Pressable
          style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/")}
        >
          <Text style={[styles.backToHomeButtonText, { color: colors.secondary }]}>Back to Home</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.tint]} style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.navigate("/(tabs)/diagnose")} style={styles.backButton}>
            <ChevronLeft color={colors.secondary} size={24} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.secondary }]}>Diagnostic Result</Text>
          <Pressable onPress={handleShareResult} style={styles.shareButton}>
            <Share2 color={colors.secondary} size={20} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[styles.resultCard, { backgroundColor: colors.card, shadowColor: colors.text }]}
        >
          <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(diagnostic?.result?.severity) }]}>
            <Text style={[styles.severityText, { color: colors.secondary }]}>
              {diagnostic?.result?.severity?.toUpperCase()} SEVERITY
            </Text>
          </View>

          <Text style={[styles.diagnosticTitle, { color: colors.text }]}>{diagnostic?.result?.issue}</Text>

          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceBarTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.confidenceBarFill,
                  {
                    width: `${diagnostic?.result?.confidence ?? 0}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={[styles.confidenceText, { color: colors.tabIconDefault }]}>
                Confidence: {diagnostic?.result?.confidence ?? 0}%
              </Text>
            </View>
          </View>

          <View style={styles.videoLinks}>
            {diagnostic?.result?.videoLinks?.map((video: VideoLink, index: number) => (
              <Pressable
                key={index}
                style={[styles.videoLink, { backgroundColor: colors.border }]}
                onPress={() => handleVideoLink(video)}
              >
                <Text style={[styles.videoLinkText, { color: colors.primary }]}>{video.title}</Text>
                <ExternalLink size={18} color={colors.primary} />
              </Pressable>
            ))}
          </View>

          {!feedbackGiven && (
            <View style={[styles.feedbackContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.feedbackTitle, { color: colors.text }]}>Was this diagnosis helpful?</Text>
              <View style={styles.feedbackButtons}>
                <Pressable
                  style={[styles.feedbackButton, { backgroundColor: colors.border }]}
                  onPress={() => handleFeedback({ isHelpful: true })}
                >
                  <ThumbsUp size={20} color={colors.success} />
                  <Text style={[styles.feedbackButtonText, { color: colors.success }]}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.feedbackButton, { backgroundColor: colors.border }]}
                  onPress={() => handleFeedback({ isHelpful: false })}
                >
                  <ThumbsDown size={20} color={colors.error} />
                  <Text style={[styles.feedbackButtonText, { color: colors.error }]}>No</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>

        <Pressable
          style={[styles.findMechanicsButton, { backgroundColor: colors.primary }]}
          onPress={handleFindMechanics}
        >
          <Text style={[styles.findMechanicsButtonText, { color: colors.secondary }]}>Find Mechanics Near You</Text>
          <ChevronRight size={20} color={colors.secondary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 100,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    fontWeight: "600",
  },
  backToHomeButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToHomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  severityIndicator: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  severityText: {
    fontWeight: "600",
    fontSize: 12,
  },
  diagnosticTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  confidenceBar: {
    marginBottom: 24,
  },
  confidenceBarTrack: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  videoLinks: {
    marginBottom: 24,
  },
  videoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  videoLinkText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  feedbackContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  feedbackButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  feedbackButtonText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  findMechanicsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  findMechanicsButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
