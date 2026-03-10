"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, ActivityIndicator, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  ChevronLeft,
  ChevronRight,
  TriangleAlert as AlertTriangle,
  ExternalLink,
  Share2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { useDiagnosticsContext } from "@/context/DiagnosticsContext"
import type Colors from "@/constants/Colors"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

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

export default function DashboardLightResultScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { getDiagnosticById } = useDiagnosticsContext()
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const colorScheme = useColorScheme()
  const { colors } = useTheme()

  useEffect(() => {
    if (id) {
      const idString = Array.isArray(id) ? id[0] : id
      const result = getDiagnosticById(idString)
      setDiagnostic(result)
      setLoading(false)
    }
  }, [id])

  interface VideoLinkHandler {
    url: string
  }

  const handleVideoLink = (url: VideoLinkHandler["url"]): Promise<void> => {
    return Linking.openURL(url)
  }

  interface SeverityLevel {
    severity: "high" | "medium" | "low"
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

  interface FeedbackHandler {
    isHelpful: boolean
  }

  const handleFeedback = (isHelpful: FeedbackHandler["isHelpful"]): void => {
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
      <SafeAreaView style={styles(colors).loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles(colors).loadingText}>Loading diagnostic results...</Text>
      </SafeAreaView>
    )
  }

  if (!diagnostic || !diagnostic.result) {
    return (
      <SafeAreaView style={styles(colors).errorContainer}>
        <AlertTriangle size={48} color={colors.error} />
        <Text style={styles(colors).errorText}>Diagnostic result not found</Text>
        <Pressable style={styles(colors).backToHomeButton} onPress={() => router.push("/")}>
          <Text style={styles(colors).backToHomeButtonText}>Back to Home</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles(colors).container}>
      <LinearGradient
        colors={colorScheme === "dark" ? [colors.primary, colors.secondary] : [colors.primary, "#0f1a6b"]}
        style={styles(colors).header}
      >
        <View style={styles(colors).headerContent}>
          <Pressable onPress={() => router.back()} style={styles(colors).backButton}>
            <ChevronLeft color="white" size={24} />
          </Pressable>
          <Text style={styles(colors).headerTitle}>Diagnostic Result</Text>
          <Pressable onPress={handleShareResult} style={styles(colors).shareButton}>
            <Share2 color="white" size={20} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles(colors).content}>
        <Animated.View entering={FadeIn.duration(800)} style={styles(colors).resultCard}>
          <View
            style={[
              styles(colors).severityIndicator,
              { backgroundColor: getSeverityColor(diagnostic.result.severity) },
            ]}
          >
            <Text style={styles(colors).severityText}>{diagnostic.result.severity.toUpperCase()} SEVERITY</Text>
          </View>

          <Text style={styles(colors).diagnosticTitle}>{diagnostic.result.issue}</Text>

          <View style={styles(colors).confidenceBar}>
            <View style={styles(colors).confidenceBarTrack}>
              <View style={[styles(colors).confidenceBarFill, { width: `${diagnostic.result.confidence}%` }]} />
            </View>
            <Text style={styles(colors).confidenceText}>{`Confidence: ${diagnostic.result.confidence}%`}</Text>
          </View>

          <View>
            <Text style={styles(colors).sectionTitle}>Helpful Videos</Text>
            <View style={styles(colors).videoLinks}>
              {diagnostic.result.videoLinks?.map((videoLink: VideoLink, index: number) => (
                <Pressable key={index} style={styles(colors).videoLink} onPress={() => handleVideoLink(videoLink.url)}>
                  <Text style={styles(colors).videoLinkText}>{videoLink.title}</Text>
                  <ExternalLink size={20} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          </View>

          {!feedbackGiven && (
            <View style={styles(colors).feedbackContainer}>
              <Text style={styles(colors).feedbackTitle}>Was this diagnosis helpful?</Text>
              <View style={styles(colors).feedbackButtons}>
                <Pressable style={styles(colors).feedbackButton} onPress={() => handleFeedback(true)}>
                  <ThumbsUp size={20} color={colors.success} />
                  <Text style={[styles(colors).feedbackButtonText, { color: colors.success }]}>Yes</Text>
                </Pressable>
                <Pressable style={styles(colors).feedbackButton} onPress={() => handleFeedback(false)}>
                  <ThumbsDown size={20} color={colors.error} />
                  <Text style={[styles(colors).feedbackButtonText, { color: colors.error }]}>No</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>

        <Pressable style={styles(colors).findMechanicsButton} onPress={handleFindMechanics}>
          <Text style={styles(colors).findMechanicsButtonText}>Find Mechanics Near You</Text>
          <ChevronRight size={20} color="white" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: "white",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.tabIconDefault,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 16,
    },
    errorText: {
      marginTop: 16,
      marginBottom: 24,
      fontSize: 18,
      color: colors.text,
      fontWeight: "600",
    },
    backToHomeButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    backToHomeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    severityIndicator: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 12,
    },
    severityText: {
      color: "white",
      fontWeight: "600",
      fontSize: 12,
    },
    diagnosticTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    confidenceBar: {
      marginBottom: 24,
    },
    confidenceBarTrack: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginBottom: 8,
    },
    confidenceBarFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    confidenceText: {
      fontSize: 14,
      color: colors.tabIconDefault,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.8,
      lineHeight: 24,
      marginBottom: 24,
    },
    recommendationText: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.8,
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
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoLinkText: {
      flex: 1,
      fontSize: 16,
      color: colors.primary,
      marginRight: 8,
    },
    feedbackContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 16,
    },
    feedbackTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
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
      backgroundColor: colors.background,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 32,
    },
    findMechanicsButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
  })
