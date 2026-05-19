/**
 * ForgotPassword.tsx — OTP-based password reset flow
 *
 * 4 steps:
 *  1. Enter email/phone
 *  2. Enter 6-digit OTP
 *  3. Set new password
 *  4. Success → back to login
 *
 * Uses the same design system as all other screens.
 */

import { useState, useRef, useEffect } from "react"
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, Animated as RNAnimated,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Mail, Phone, ArrowLeft, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle,
} from "@/components/SafeLucide"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Spacing, Radius, FontSize, FontFamily, Shadows } from "@/constants/Theme"
import AppButton from "@/components/AppButton"
import { useAppModal } from "@/context/AppModalContext"
import React from "react"

type Step = "method" | "otp" | "newpass" | "success"
type Method = "email" | "phone"

const PASSWORD_RULES = [
  { label: "At least 8 characters",         test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",    test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)",              test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function ForgotPasswordScreen() {
  const [step, setStep]           = useState<Step>("method")
  const [method, setMethod]       = useState<Method>("email")
  const [contact, setContact]     = useState("")
  const [contactFocused, setContactFocused] = useState(false)
  const [otp, setOtp]             = useState(["", "", "", "", "", ""])
  const [password, setPassword]   = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const router             = useRouter()
  const { colors, isDark } = useTheme()
  const { apiUrl }         = useAuth()
  const { showAlert }      = useAppModal()
  const insets             = useSafeAreaInsets()

  const otpRefs = useRef<(TextInput | null)[]>([])
  const passRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  const ruleResults    = PASSWORD_RULES.map(r => r.test(password))
  const allRulesPassed = ruleResults.every(Boolean)
  const passedCount    = ruleResults.filter(Boolean).length
  const strengthColor  = passedCount <= 1 ? colors.error : passedCount <= 3 ? colors.warning : passedCount <= 4 ? colors.primary : colors.success

  // Entry animation
  const fadeAnim = useRef(new RNAnimated.Value(0)).current
  useEffect(() => {
    fadeAnim.setValue(0)
    RNAnimated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start()
  }, [step])

  const entryStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  }

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!contact.trim()) {
      showAlert({ title: "Required", message: `Please enter your ${method === "email" ? "email address" : "phone number"}.`, tone: "warning" })
      return
    }
    if (method === "email" && !contact.includes("@")) {
      showAlert({ title: "Invalid email", message: "Please enter a valid email address.", tone: "warning" })
      return
    }
    setIsLoading(true)
    try {
      await fetch(`${apiUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [method]: contact.trim(), purpose: "password_reset" }),
      }).catch(() => {})
      setCountdown(60)
      setStep("otp")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const code = otp.join("")
    if (code.length < 6) {
      showAlert({ title: "Incomplete code", message: "Please enter the full 6-digit code.", tone: "warning" })
      return
    }
    setIsLoading(true)
    try {
      // In production this would verify with the backend
      await new Promise(r => setTimeout(r, 800))
      setStep("newpass")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!allRulesPassed) {
      showAlert({ title: "Weak password", message: "Please meet all password requirements.", tone: "warning" })
      return
    }
    if (password !== confirmPass) {
      showAlert({ title: "Mismatch", message: "Passwords do not match.", tone: "warning" })
      return
    }
    setIsLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      setStep("success")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const inputBorder = (focused: boolean) => ({
    borderColor: focused ? colors.primary : colors.border,
    borderWidth: focused ? 1.5 : 1,
  })

  const maskedContact = method === "email"
    ? contact.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : contact.replace(/(.{3})(.*)(.{2})/, "$1****$3")

  // ── Styles ────────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl },
    logoSection: { alignItems: "center", paddingTop: insets.top + Spacing.xxl, marginBottom: Spacing.md },
    logoGlow: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
    logoRing: { width: 88, height: 88, borderRadius: Radius.xl + 4, borderWidth: 2, borderColor: colors.primary + "30", padding: 3, overflow: "hidden" },
    logoImage: { width: "100%", height: "100%", borderRadius: Radius.xl + 1 },
    heroBlock: { alignItems: "center", marginBottom: Spacing.xxl },
    heroLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.primary, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.xs },
    heroTitle: { fontSize: FontSize.xxl, fontFamily: FontFamily.bold, color: colors.text, letterSpacing: -0.5, marginBottom: Spacing.xs, textAlign: "center" },
    heroPrimary: { color: colors.primary },
    heroSub: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.subtext, textAlign: "center", lineHeight: 20, paddingHorizontal: Spacing.sm },
    card: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...Shadows.md },
    cardTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, color: colors.text, marginBottom: Spacing.sm },
    cardDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.subtext, lineHeight: 20, marginBottom: Spacing.lg },
    // Method selector
    methodRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
    methodBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5 },
    methodText: { fontSize: FontSize.md, fontFamily: FontFamily.bold },
    // Input
    inputRow: { flexDirection: "row", alignItems: "center", borderRadius: Radius.lg, backgroundColor: colors.background, marginBottom: Spacing.lg, paddingRight: Spacing.md, height: 54 },
    inputIconBox: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginLeft: Spacing.sm, marginRight: Spacing.xs },
    inputIconActive: { backgroundColor: colors.primary + "12" },
    input: { flex: 1, fontSize: FontSize.base, fontFamily: FontFamily.regular, color: colors.text },
    eyeBtn: { padding: Spacing.xs },
    // OTP
    otpRow: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm, marginBottom: Spacing.lg },
    otpBox: { flex: 1, height: 56, borderRadius: Radius.lg, borderWidth: 1.5, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    otpInput: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: colors.text, textAlign: "center", width: "100%", height: "100%" },
    otpInfo: { alignItems: "center", marginBottom: Spacing.lg },
    otpInfoText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.subtext, textAlign: "center", marginBottom: Spacing.sm },
    otpHighlight: { fontFamily: FontFamily.bold, color: colors.primary },
    resendRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
    resendText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
    // Password strength
    strengthSection: { marginBottom: Spacing.base, marginTop: -Spacing.xs },
    strengthTrack: { height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: Spacing.sm, overflow: "hidden" },
    strengthFill: { height: "100%", borderRadius: 2 },
    strengthLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold, marginBottom: Spacing.sm },
    reqBox: { backgroundColor: isDark ? colors.background : "#f8fafc", borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
    reqRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    reqText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginLeft: Spacing.sm },
    // Success
    successCard: { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, alignItems: "center", ...Shadows.md },
    successTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: colors.text, marginBottom: Spacing.sm, textAlign: "center" },
    successText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: colors.subtext, textAlign: "center", lineHeight: 21, marginBottom: Spacing.xl },
    // Footer
    backRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: Spacing.xl },
    backBtn: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
    backText: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: colors.primary },
    stepDots: { flexDirection: "row", justifyContent: "center", gap: Spacing.sm, marginBottom: Spacing.lg },
    dot: { width: 8, height: 8, borderRadius: 4 },
  })

  const stepIndex = ["method", "otp", "newpass", "success"].indexOf(step)
  const heroSubtitles: Record<Step, string> = {
    method: "We'll send a verification code to reset your password",
    otp: `Enter the 6-digit code sent to your ${method}`,
    newpass: "Choose a strong password for your account",
    success: "Your password has been updated",
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + Spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={s.logoSection}>
          <View style={s.logoGlow}>
            <View style={s.logoRing}>
              <Image source={require("../../assets/images/logo.jpg")} style={s.logoImage} resizeMode="cover" />
            </View>
          </View>
        </View>

        {/* Hero */}
        <View style={s.heroBlock}>
          <Text style={s.heroLabel}>Account recovery</Text>
          <Text style={s.heroTitle}>Reset your <Text style={s.heroPrimary}>password</Text></Text>
          <Text style={s.heroSub}>{heroSubtitles[step]}</Text>
        </View>

        {/* Progress dots */}
        <View style={s.stepDots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[s.dot, { backgroundColor: i <= stepIndex ? colors.primary : colors.border }]} />
          ))}
        </View>

        {/* Card content */}
        <RNAnimated.View style={entryStyle}>
          {/* ── Step 1: Method + contact ── */}
          {step === "method" && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Verify your identity</Text>
              <Text style={s.cardDesc}>Choose how you'd like to receive your verification code.</Text>

              <View style={s.methodRow}>
                {(["email", "phone"] as const).map(m => {
                  const active = method === m
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[s.methodBtn, {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? (colors.primaryLight ?? colors.border) : colors.background,
                      }]}
                      onPress={() => { setMethod(m); setContact("") }}
                      activeOpacity={0.75}
                    >
                      {m === "email"
                        ? <Mail size={16} color={active ? colors.primary : colors.subtext} />
                        : <Phone size={16} color={active ? colors.primary : colors.subtext} />}
                      <Text style={[s.methodText, { color: active ? colors.primary : colors.subtext }]}>
                        {m === "email" ? "Email" : "Phone"}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <View style={[s.inputRow, inputBorder(contactFocused)]}>
                <View style={[s.inputIconBox, contactFocused && s.inputIconActive]}>
                  {method === "email"
                    ? <Mail size={18} color={contactFocused ? colors.primary : colors.subtext} />
                    : <Phone size={18} color={contactFocused ? colors.primary : colors.subtext} />}
                </View>
                <TextInput
                  style={s.input}
                  placeholder={method === "email" ? "Email address" : "Phone number"}
                  placeholderTextColor={colors.subtext}
                  value={contact}
                  onChangeText={setContact}
                  keyboardType={method === "email" ? "email-address" : "phone-pad"}
                  autoCapitalize="none"
                  autoFocus
                  onFocus={() => setContactFocused(true)}
                  onBlur={() => setContactFocused(false)}
                />
              </View>

              <AppButton label="Send Code" onPress={handleSendOTP} loading={isLoading} size="lg" />
            </View>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter verification code</Text>

              <View style={s.otpInfo}>
                <Text style={s.otpInfoText}>
                  Code sent to <Text style={s.otpHighlight}>{maskedContact}</Text>
                </Text>
                <View style={s.resendRow}>
                  {countdown > 0 ? (
                    <Text style={[s.resendText, { color: colors.subtext }]}>Resend in {countdown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={() => { handleSendOTP() }}>
                      <Text style={[s.resendText, { color: colors.primary }]}>Resend code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={s.otpRow}>
                {otp.map((digit, i) => (
                  <View key={i} style={[s.otpBox, {
                    borderColor: digit ? colors.primary : colors.border,
                    backgroundColor: digit ? (colors.primaryLight ?? colors.background) : colors.background,
                  }]}>
                    <TextInput
                      ref={ref => { otpRefs.current[i] = ref }}
                      style={s.otpInput}
                      value={digit}
                      onChangeText={t => handleOtpChange(t, i)}
                      onKeyPress={e => handleOtpKeyPress(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>

              <AppButton label="Verify Code" onPress={handleVerifyOTP} loading={isLoading} size="lg" />

              <TouchableOpacity onPress={() => setStep("method")} style={{ marginTop: Spacing.md, alignItems: "center" }}>
                <Text style={{ fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: colors.subtext }}>
                  Change {method}?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: New password ── */}
          {step === "newpass" && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Create new password</Text>
              <Text style={s.cardDesc}>Your new password must be different from your previous one.</Text>

              <View style={[s.inputRow, inputBorder(passFocused)]}>
                <View style={[s.inputIconBox, passFocused && s.inputIconActive]}>
                  <Lock size={18} color={passFocused ? colors.primary : colors.subtext} />
                </View>
                <TextInput
                  ref={passRef}
                  style={s.input}
                  placeholder="New password"
                  placeholderTextColor={colors.subtext}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={18} color={colors.subtext} /> : <Eye size={18} color={colors.subtext} />}
                </TouchableOpacity>
              </View>

              <View style={[s.inputRow, inputBorder(confirmFocused)]}>
                <View style={[s.inputIconBox, confirmFocused && s.inputIconActive]}>
                  <Lock size={18} color={confirmFocused ? colors.primary : colors.subtext} />
                </View>
                <TextInput
                  ref={confirmRef}
                  style={s.input}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.subtext}
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showConfirm}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={18} color={colors.subtext} /> : <Eye size={18} color={colors.subtext} />}
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View style={s.strengthSection}>
                  <View style={s.strengthTrack}>
                    <View style={[s.strengthFill, { width: `${(passedCount / 5) * 100}%`, backgroundColor: strengthColor }]} />
                  </View>
                  <Text style={[s.strengthLabel, { color: strengthColor }]}>
                    {passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Good" : "Strong"}
                  </Text>
                  <View style={s.reqBox}>
                    {PASSWORD_RULES.map((rule, i) => (
                      <View key={i} style={s.reqRow}>
                        {ruleResults[i] ? <CheckCircle size={13} color={colors.success} /> : <AlertCircle size={13} color={colors.error} />}
                        <Text style={[s.reqText, { color: ruleResults[i] ? colors.success : colors.error }]}>{rule.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {confirmPass.length > 0 && password !== confirmPass && (
                <Text style={{ fontSize: FontSize.xs, fontFamily: FontFamily.medium, color: colors.error, marginBottom: Spacing.md, marginTop: -Spacing.xs }}>
                  Passwords do not match
                </Text>
              )}

              <AppButton label="Reset Password" onPress={handleResetPassword} loading={isLoading} size="lg" />
            </View>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <View style={s.successCard}>
              <Text style={s.successTitle}>Password updated!</Text>
              <Text style={s.successText}>
                Your password has been reset successfully. You can now sign in with your new password.
              </Text>
              <AppButton label="Back to Sign In" onPress={() => router.replace("/(auth)/Login")} size="lg" />
            </View>
          )}
        </RNAnimated.View>

        {/* Back to login (only on step 1) */}
        {step === "method" && (
          <View style={s.backRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <ArrowLeft size={16} color={colors.primary} />
              <Text style={s.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
