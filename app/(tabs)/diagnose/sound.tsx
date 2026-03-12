

import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { Mic, Pause, Play, StopCircle } from "@/components/SafeLucide"
import { Audio } from "expo-av"
import LinearGradient from "@/components/LinearGradient"
import { useTheme } from "@/context/ThemeContext"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated"
import React from "react"

type VideoLink = {
  title: string
  url: string
}

export default function SoundDiagnosisScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const { colors } = useTheme()
  const recorderTimer = useRef<NodeJS.Timeout | number | null>(null)

  const animation1 = useSharedValue(0)
  const animation2 = useSharedValue(0)
  const animation3 = useSharedValue(0)

  useEffect(() => {
    return () => {
      if (recorderTimer.current) {
        clearInterval(recorderTimer.current)
      }
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  useEffect(() => {
    // Configure audio session for recording
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })
    }

    setupAudio()
  }, [])

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (permission.status !== "granted") {
        alert("Permission to record audio is required!")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)

      setRecording(recording)
      setIsRecording(true)
      setRecordingDuration(0)

      // Start the timer to count recording duration
      recorderTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      // Start the recording animation
      animation1.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.ease }), -1, true)
      animation2.value = withRepeat(withDelay(300, withTiming(1, { duration: 800, easing: Easing.ease })), -1, true)
      animation3.value = withRepeat(withDelay(600, withTiming(1, { duration: 800, easing: Easing.ease })), -1, true)
    } catch (err) {
      console.error("Failed to start recording", err)
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      await recording.stopAndUnloadAsync()
      setIsRecording(false)

      if (recorderTimer.current) {
        clearInterval(recorderTimer.current)
        recorderTimer.current = null
      }

      const uri = recording.getURI()
      if (uri) {
        setRecordingUri(uri)
      }

      setRecording(null)

      // Reset animations
      animation1.value = 0
      animation2.value = 0
      animation3.value = 0
    } catch (err) {
      console.error("Failed to stop recording", err)
    }
  }

  const playSound = async () => {
    if (recordingUri) {
      try {
        if (sound) {
          await sound.unloadAsync()
        }

        const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true })

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false)
            } else {
              setIsPlaying(status.isPlaying)
            }
          }
        })

        setSound(newSound)
        setIsPlaying(true)
      } catch (err) {
        console.error("Failed to play sound", err)
      }
    }
  }

  const pauseSound = async () => {
    if (sound) {
      try {
        await sound.pauseAsync()
        setIsPlaying(false)
      } catch (err) {
        console.error("Failed to pause sound", err)
      }
    }
  }

  const analyzeSoundRecording = async () => {
    if (!recordingUri) return

    setDiagnosing(true)

    // In a real app, you would upload the recording to your backend
    // and get the analysis results from your AI model

    // Mocked diagnosis - would be replaced with actual API call
    setTimeout(() => {
      setDiagnosisResult({
        issue: "Engine Knock",
        description:
          "The recorded sound indicates engine knocking, which is typically caused by pre-ignition or detonation in the combustion chamber. This can be due to improper fuel octane, carbon buildup, or failing spark plugs.",
        severity: "High",
        recommendations: [
          "Check and replace spark plugs if necessary",
          "Use higher octane fuel as recommended by your vehicle manufacturer",
          "Consider a carbon cleaning service for your engine",
          "Have the engine timing checked by a professional",
        ],
        videoLinks: [
          {
            title: "How to Fix Engine Knocking",
            url: "https://www.youtube.com/watch?v=example3",
          },
          {
            title: "Replacing Spark Plugs Tutorial",
            url: "https://www.youtube.com/watch?v=example4",
          },
        ],
      })
      setDiagnosing(false)
    }, 4000)
  }

  const resetDiagnosis = () => {
    setRecordingUri(null)
    setRecordingDuration(0)
    setDiagnosisResult(null)
    if (sound) {
      sound.unloadAsync()
      setSound(null)
    }
    setIsPlaying(false)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Animated styles for recording visualization
  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      height: 30 + animation1.value * 30,
      opacity: 0.4 + animation1.value * 0.6,
    }
  })

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      height: 40 + animation2.value * 40,
      opacity: 0.4 + animation2.value * 0.6,
    }
  })

  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      height: 30 + animation3.value * 30,
      opacity: 0.4 + animation3.value * 0.6,
    }
  })

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    recordingSection: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    visualizer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      height: 100,
      width: 200,
    },
    visualizerBar: {
      width: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    recordingInfo: {
      marginTop: 20,
      marginBottom: 20,
      alignItems: "center",
    },
    recordingDuration: {
      fontSize: 48,
      fontFamily: "Poppins-Bold",
      color: isRecording ? colors.primary : colors.text,
    },
    recordingStatus: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: isRecording ? colors.error : colors.text,
      marginTop: 8,
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isRecording ? colors.error : colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    playbackControls: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 30,
    },
    playbackButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 10,
    },
    analyzeButton: {
      marginTop: 40,
      overflow: "hidden",
      borderRadius: 12,
    },
    analyzeGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    analyzeButtonText: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.secondary,
    },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    },
    resultTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    resultDescription: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      marginBottom: 16,
      lineHeight: 22,
    },
    severityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    severityLabel: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginRight: 8,
    },
    severityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#e53935",
    },
    severityText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: "#fff",
    },
    recommendationsTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    recommendation: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    recommendationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 8,
      marginRight: 8,
    },
    recommendationText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      lineHeight: 22,
    },
    videoLinksTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    videoLink: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
    },
    videoLinkText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginLeft: 8,
    },
    resetButton: {
      marginTop: 24,
      alignSelf: "center",
    },
    resetButtonText: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    instructionText: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 20,
      marginHorizontal: 30,
      lineHeight: 22,
    },
  })

  if (diagnosing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing engine sound...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sound Diagnosis</Text>
        <Text style={styles.subtitle}>Record unusual engine sounds for AI analysis</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.recordingSection}>
            {isRecording && (
              <View style={styles.visualizer}>
                <Animated.View style={[styles.visualizerBar, animatedStyle1]} />
                <Animated.View style={[styles.visualizerBar, animatedStyle2]} />
                <Animated.View style={[styles.visualizerBar, animatedStyle3]} />
                <Animated.View style={[styles.visualizerBar, animatedStyle2]} />
                <Animated.View style={[styles.visualizerBar, animatedStyle1]} />
              </View>
            )}

            <View style={styles.recordingInfo}>
              <Text style={styles.recordingDuration}>
                {isRecording
                  ? formatDuration(recordingDuration)
                  : recordingUri
                    ? formatDuration(recordingDuration)
                    : "0:00"}
              </Text>
              <Text style={styles.recordingStatus}>
                {isRecording ? "Recording..." : recordingUri ? "Recording complete" : "Ready to record"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.recordButton, { backgroundColor: isRecording ? colors.error : colors.primary }]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <StopCircle size={32} color="#fff" /> : <Mic size={32} color="#fff" />}
            </TouchableOpacity>

            <Text style={styles.instructionText}>
              Record the sound of your engine during the problem. Try to capture the sound clearly for at least 10
              seconds.
            </Text>
          </View>

          {recordingUri && (
            <View style={styles.playbackControls}>
              <TouchableOpacity style={styles.playbackButton} onPress={isPlaying ? pauseSound : playSound}>
                {isPlaying ? <Pause size={28} color={colors.text} /> : <Play size={28} color={colors.text} />}
              </TouchableOpacity>
            </View>
          )}

          {recordingUri && !diagnosisResult && (
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeSoundRecording}>
              <LinearGradient
                colors={["#FFD700", "#FFC000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeGradient}
              >
                <Text style={styles.analyzeButtonText}>Analyze Engine Sound</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {diagnosisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>{diagnosisResult.issue}</Text>

              <Text style={styles.resultDescription}>{diagnosisResult.description}</Text>

              <View style={styles.severityContainer}>
                <Text style={styles.severityLabel}>Severity:</Text>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        diagnosisResult.severity === "High"
                          ? "#e53935"
                          : diagnosisResult.severity === "Medium"
                            ? "#FFC107"
                            : "#4CAF50",
                    },
                  ]}
                >
                  <Text style={styles.severityText}>{diagnosisResult.severity}</Text>
                </View>
              </View>

              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {diagnosisResult.recommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendation}>
                  <View style={styles.recommendationDot} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}

              <Text style={styles.videoLinksTitle}>Helpful Videos:</Text>
              {diagnosisResult.videoLinks.map((link: VideoLink, index: number) => (
                <TouchableOpacity key={index} style={styles.videoLink}>
                  <Play size={20} color={colors.primary} />
                  <Text style={styles.videoLinkText}>{link.title}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={resetDiagnosis}>
                <Text style={styles.resetButtonText}>Start a New Diagnosis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
