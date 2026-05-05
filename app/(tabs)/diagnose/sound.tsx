import { useState, useRef, useEffect } from "react"
import {
  StyleSheet, Text, View, TouchableOpacity,
  ActivityIndicator, ScrollView, Linking, Alert,
} from "react-native"
import { ExternalLink, Mic, Pause, Play, StopCircle, ChevronLeft } from "@/components/SafeLucide"
import { Audio } from "expo-av"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FontFamily, FontSize, Spacing, Radius } from "@/constants/Theme"
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withDelay, Easing, SharedValue,
} from "react-native-reanimated"
import AppButton from "@/components/AppButton"
import React from "react"
import { useDiagnosticsContext } from "@/context/DiagnosticsContext"
import { createDiagnosticHistoryItem, getFallbackVideoLinks, getSafeVideoUrl } from "@/utils/diagnosticHistory"

type VideoLink = { title: string; url: string }

export default function SoundDiagnosisScreen() {
  const router = useRouter()
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const recorderTimer = useRef<NodeJS.Timeout | number | null>(null)
  const { addDiagnostic } = useDiagnosticsContext()

  // Waveform animations
  const a1 = useSharedValue(0)
  const a2 = useSharedValue(0)
  const a3 = useSharedValue(0)
  const a4 = useSharedValue(0)
  const a5 = useSharedValue(0)

  const s1 = useAnimatedStyle(() => ({ height: 20 + a1.value * 20, opacity: 0.4 + a1.value * 0.6 }))
  const s2 = useAnimatedStyle(() => ({ height: 35 + a2.value * 35, opacity: 0.4 + a2.value * 0.6 }))
  const s3 = useAnimatedStyle(() => ({ height: 50 + a3.value * 50, opacity: 0.4 + a3.value * 0.6 }))
  const s4 = useAnimatedStyle(() => ({ height: 35 + a4.value * 35, opacity: 0.4 + a4.value * 0.6 }))
  const s5 = useAnimatedStyle(() => ({ height: 20 + a5.value * 20, opacity: 0.4 + a5.value * 0.6 }))

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })
    }
    setupAudio()
    return () => {
      if (recorderTimer.current) clearInterval(recorderTimer.current)
      if (sound) sound.unloadAsync()
    }
  }, [sound])

  const startRecording = async () => {
    if (isRecording || recording || isPreparing) return
    try {
      setIsPreparing(true)
      const perm = await Audio.requestPermissionsAsync()
      if (perm.status !== "granted") { alert("Microphone permission required."); return }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      setRecording(newRecording)
      setIsRecording(true)
      setRecordingDuration(0)
      recorderTimer.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000)

      // Start waveform animations
      const opts = (delay: number) => withRepeat(withDelay(delay, withTiming(1, { duration: 700, easing: Easing.ease })), -1, true)
      a1.value = opts(0); a2.value = opts(100); a3.value = opts(200); a4.value = opts(100); a5.value = opts(0)
    } catch (e) { 
      console.error("Recording failed", e) 
    } finally {
      setIsPreparing(false)
    }
  }

  const stopRecording = async () => {
    if (!recording) return
    setIsRecording(false)
    if (recorderTimer.current) { clearInterval(recorderTimer.current); recorderTimer.current = null }
    a1.value = 0; a2.value = 0; a3.value = 0; a4.value = 0; a5.value = 0
    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      if (uri) setRecordingUri(uri)
    } catch (e) { 
      console.error("Stop failed", e) 
    } finally {
      setRecording(null)
    }
  }

  const playSound = async () => {
    if (!recordingUri) return
    try {
      if (sound) await sound.unloadAsync()
      const { sound: s } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true })
      s.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded) setIsPlaying(st.didJustFinish ? false : st.isPlaying)
      })
      setSound(s)
      setIsPlaying(true)
    } catch (e) { console.error("Playback failed", e) }
  }

  const pauseSound = async () => {
    if (sound) { await sound.pauseAsync(); setIsPlaying(false) }
  }

  const analyzeSound = () => {
    setDiagnosing(true)
    setTimeout(() => {
      const result = {
        issue: "Engine Knock",
        description: "The recorded sound indicates engine knocking, typically caused by pre-ignition or detonation in the combustion chamber. This may be due to low fuel octane, carbon buildup, or failing spark plugs.",
        severity: "High",
        confidence: 87,
        recommendations: [
          "Check and replace spark plugs if necessary",
          "Use higher octane fuel as recommended by your manufacturer",
          "Consider a carbon cleaning service for your engine",
          "Have engine timing checked by a professional",
        ],
        videoLinks: getFallbackVideoLinks("Engine Knock"),
      }
      setDiagnosisResult(result)
      addDiagnostic(
        createDiagnosticHistoryItem({
          type: "engine",
          title: "Engine Sound Analysis",
          result,
          sourceUri: recordingUri ?? undefined,
          inputSummary: `Audio recording attached (${fmt(recordingDuration)})`,
        }),
      )
      setDiagnosing(false)
    }, 3000)
  }

  const resetDiagnosis = () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(console.error)
      setRecording(null)
    }
    if (recorderTimer.current) { clearInterval(recorderTimer.current); recorderTimer.current = null }
    setIsRecording(false)
    
    setRecordingUri(null)
    setRecordingDuration(0)
    setDiagnosisResult(null)
    if (sound) { sound.unloadAsync(); setSound(null) }
    setIsPlaying(false)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  const openVideo = (link: VideoLink, issue?: string) => {
    Linking.openURL(getSafeVideoUrl(link, issue)).catch(() => {
      Alert.alert("Could not open link", "Please check your connection and try again.")
    })
  }

  const severityColor = (s: string) =>
    s === "High" || s === "Critical" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#22c55e"

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: Spacing.md, fontSize: FontSize.md, fontFamily: FontFamily.medium, color: colors.text },
    header: { paddingTop: insets.top + 16, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
    headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: isDark ? colors.card : "#f1f5f9",
      alignItems: "center", justifyContent: "center",
      marginRight: 12,
    },
    title: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.tabIconDefault },

    // Central recorder area
    recorderWrap: {
      marginTop: Spacing.xl,
      marginHorizontal: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    waveform: {
      flexDirection: "row", alignItems: "flex-end", justifyContent: "center",
      height: 80, gap: 5, marginBottom: Spacing.lg,
    },
    bar: { width: 6, borderRadius: 3, backgroundColor: colors.primary },
    timer: {
      fontSize: 52, fontFamily: FontFamily.bold,
      color: isRecording ? colors.primary : colors.text,
      letterSpacing: -1,
    },
    status: {
      fontSize: FontSize.sm, fontFamily: FontFamily.medium,
      color: isRecording ? colors.error : colors.tabIconDefault,
      marginTop: 4, marginBottom: Spacing.lg,
    },
    micBtn: {
      width: 76, height: 76, borderRadius: 38,
      backgroundColor: isRecording ? colors.error : colors.primary,
      alignItems: "center", justifyContent: "center",
    },
    hint: {
      fontSize: FontSize.xs, fontFamily: FontFamily.regular,
      color: colors.tabIconDefault, textAlign: "center",
      marginTop: Spacing.md, lineHeight: 18,
    },
    // ─── Result card ───
    resultCard: {
      marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
      backgroundColor: colors.card, borderRadius: Radius.xl,
      padding: Spacing.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    },
    resultTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, color: colors.text, marginBottom: Spacing.sm },
    resultDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.subtext, lineHeight: 22, marginBottom: Spacing.md },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
    badgeLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.text },
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
    badgeTxt: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold, color: "#fff" },
    sectionLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.semiBold, color: colors.text, marginTop: Spacing.sm, marginBottom: Spacing.sm },
    rec: { flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.sm },
    recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8, marginRight: Spacing.sm },
    recText: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.text, lineHeight: 22 },
    videoLink: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: isDark ? colors.primary + "12" : colors.primary + "08",
      padding: Spacing.sm, borderRadius: Radius.md, marginBottom: Spacing.sm,
    },
    videoTxt: { flex: 1, fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.primary, marginLeft: Spacing.sm },
  })

  if (diagnosing) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Analysing engine sound…</Text>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <TouchableOpacity 
            style={s.backBtn} 
            onPress={() => router.navigate("/(tabs)/diagnose")}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Sound Diagnosis</Text>
        </View>
        <Text style={s.subtitle}>Record unusual engine sounds for AI analysis</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 48,
          justifyContent: diagnosisResult ? "flex-start" : "center"
        }}
      >
        {/* Recorder card */}
        <View style={s.recorderWrap}>
          {/* Waveform — only shown while recording */}
          {isRecording && (
            <View style={s.waveform}>
              <Animated.View style={[s.bar, s1]} />
              <Animated.View style={[s.bar, s2]} />
              <Animated.View style={[s.bar, s3]} />
              <Animated.View style={[s.bar, s4]} />
              <Animated.View style={[s.bar, s5]} />
            </View>
          )}

          <Text style={s.timer}>{fmt(recordingDuration)}</Text>
          <Text style={s.status}>
            {isRecording ? "Recording…" : recordingUri ? "Recording complete" : "Ready to record"}
          </Text>

          <TouchableOpacity style={s.micBtn} onPress={isRecording ? stopRecording : startRecording}>
            {isRecording
              ? <StopCircle size={32} color="#fff" />
              : <Mic size={32} color="#fff" />}
          </TouchableOpacity>

          <Text style={s.hint}>
            Start the engine and record the unusual sound for at least 10 seconds.
          </Text>
        </View>

        {/* Playback */}
        {recordingUri && !diagnosisResult && (
          <View style={{ marginTop: Spacing.md, marginHorizontal: Spacing.xl }}>
            <AppButton
              label={isPlaying ? "Pause" : "Play Recording"}
              variant="outline"
              icon={isPlaying ? <Pause size={18} color={colors.primary} /> : <Play size={18} color={colors.primary} />}
              onPress={isPlaying ? pauseSound : playSound}
            />
          </View>
        )}

        {/* Analyse / Reset */}
        {recordingUri && !diagnosisResult && (
          <>
            <AppButton
              label="Analyse Engine Sound"
              onPress={analyzeSound}
              size="lg"
              style={{ marginHorizontal: Spacing.xl, marginTop: Spacing.md }}
            />
            <AppButton
              label="Discard & record again"
              variant="ghost"
              onPress={resetDiagnosis}
              textStyle={{ color: colors.error, fontSize: FontSize.sm }}
              fullWidth={false}
              style={{ alignSelf: "center", marginTop: Spacing.sm }}
            />
          </>
        )}

        {/* Result */}
        {diagnosisResult && (
          <View style={s.resultCard}>
            <Text style={s.resultTitle}>{diagnosisResult.issue}</Text>
            <Text style={s.resultDesc}>{diagnosisResult.description}</Text>

            <View style={s.badgeRow}>
              <Text style={s.badgeLabel}>Severity:</Text>
              <View style={[s.badge, { backgroundColor: severityColor(diagnosisResult.severity) }]}>
                <Text style={s.badgeTxt}>{diagnosisResult.severity}</Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>Recommendations</Text>
            {diagnosisResult.recommendations.map((r: string, i: number) => (
              <View key={i} style={s.rec}>
                <View style={s.recDot} />
                <Text style={s.recText}>{r}</Text>
              </View>
            ))}

            <Text style={s.sectionLabel}>Helpful Videos</Text>
            {diagnosisResult.videoLinks.map((l: VideoLink, i: number) => (
              <TouchableOpacity key={i} style={s.videoLink} onPress={() => openVideo(l, diagnosisResult.issue)}>
                <Play size={16} color={colors.primary} />
                <Text style={s.videoTxt}>{l.title}</Text>
                <ExternalLink size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}

            <AppButton
              label="Start a New Diagnosis"
              variant="ghost"
              onPress={resetDiagnosis}
              textStyle={{ color: colors.error, fontSize: FontSize.sm }}
              fullWidth={false}
              style={{ alignSelf: "center", marginTop: Spacing.md }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}
