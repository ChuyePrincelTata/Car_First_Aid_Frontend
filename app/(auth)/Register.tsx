/**
 * Register.tsx
 *
 * Full-screen registration with:
 *  - No OS navigation header
 *  - App logo + name at the top (consistent with Login)
 *  - Live password requirements checker (green/red as user types)
 *  - Password visibility toggle
 *  - Role selector (User / Mechanic)
 *  - Themed inputs with focus highlight
 *  - Button text uses `colors.buttonText` for correct contrast in both modes
 */

import { useState, useMemo, useRef } from "react"
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Eye, EyeOff, CheckCircle, AlertCircle, User, Wrench } from "@/components/SafeLucide"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Spacing, Radius, FontSize, FontFamily, Shadows } from "@/constants/Theme"
import AppButton from "@/components/AppButton"
import React from "react"

/* ── Password rules ──────────────────────────────────────────────────────── */
const PASSWORD_RULES = [
  { label: "At least 8 characters",        test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)",   test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",   test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)",             test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterScreen() {
  const [name, setName]               = useState("")
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [role, setRole]               = useState<"user" | "mechanic">("user")
  const [showPassword, setShowPassword]         = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)

  const [nameFocused,  setNameFocused]  = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused,  setPassFocused]  = useState(false)

  const auth        = useAuth()
  const { colors, isDark }  = useTheme()
  const router      = useRouter()
  const emailRef    = useRef<TextInput>(null)
  const passRef     = useRef<TextInput>(null)
  const insets      = useSafeAreaInsets()

  const ruleResults    = useMemo(() => PASSWORD_RULES.map(r => r.test(password)), [password])
  const allRulesPassed = ruleResults.every(Boolean)

  if (!auth) return null
  const { signUp } = auth

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.")
      return
    }
    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.")
      return
    }
    if (!allRulesPassed) {
      setShowRequirements(true)
      Alert.alert("Weak password", "Please meet all password requirements before continuing.")
      return
    }
    setIsLoading(true)
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), role)
      router.replace(role === "mechanic" ? "/(mechanic)/verification" : "/(tabs)")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Registration failed. Please try again."
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("email already")) {
        Alert.alert("Email taken", "This email is already registered. Try signing in instead.")
      } else if (msg.includes("network") || msg.includes("connection")) {
        Alert.alert("No connection", "Please check your internet connection and try again.")
      } else {
        Alert.alert("Registration failed", msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  /* ── helpers ─────────────────────────────────────────────────────────── */
  const inputBorder = (focused: boolean) => ({
    borderColor: focused ? colors.primary : colors.border,
    borderWidth: focused ? 1.5 : 1,
  })

  /* ── styles ──────────────────────────────────────────────────────────── */
  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    inner: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xxxl,
    },

    brandBlock: {
      alignItems: "center",
      paddingTop: insets.top + Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    logoWrapper: {
      width: 72,
      height: 72,
      borderRadius: Radius.lg,
      overflow: "hidden",
      marginBottom: Spacing.sm,
      ...Shadows.md,
    },
    logo: { width: "100%", height: "100%" },
    appName: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      letterSpacing: -0.3,
      marginBottom: 2,
    },
    tagline: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },

    formSection: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      ...Shadows.sm,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.base,
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.lg,
      backgroundColor: colors.background,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
      height: 52,
    },
    input: {
      flex: 1,
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: colors.text,
    },
    eyeBtn: { padding: Spacing.xs },

    /* ── requirements box ── */
    reqBox: {
      backgroundColor: isDark ? colors.background : "#f8fafc",
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reqTitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    reqRow:  { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    reqText: { fontSize: FontSize.sm, marginLeft: 6 },

    /* ── role selector ── */
    roleLabel: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.subtext,
      marginBottom: Spacing.sm,
    },
    roleRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.base },
    roleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
    },
    roleText: { fontSize: FontSize.md, fontFamily: FontFamily.medium },

    /* ── login link ── */
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: Spacing.lg,
    },
    loginText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },
    loginLink: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      marginLeft: 4,
    },
  })

  const SUCCESS = "#22c55e"
  const FAIL    = isDark ? "#f87171" : "#ef4444"

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.inner}>

          {/* ── Branding ── */}
          <View style={s.brandBlock}>
            <View style={s.logoWrapper}>
              <Image source={require("../../assets/images/logo.jpg")} style={s.logo} resizeMode="cover" />
            </View>
            <Text style={s.appName}>Car First Aid</Text>
            <Text style={s.tagline}>Create your account to get started</Text>
          </View>

          {/* ── Form card ── */}
          <View style={s.formSection}>
            <Text style={s.sectionTitle}>Create account</Text>

            {/* Full name */}
            <View style={[s.inputRow, inputBorder(nameFocused)]}>
              <TextInput
                style={s.input}
                placeholder="Full name"
                placeholderTextColor={colors.subtext}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>

            {/* Email */}
            <View style={[s.inputRow, inputBorder(emailFocused)]}>
              <TextInput
                ref={emailRef}
                style={s.input}
                placeholder="Email address"
                placeholderTextColor={colors.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={[s.inputRow, inputBorder(passFocused)]}>
              <TextInput
                ref={passRef}
                style={s.input}
                placeholder="Password"
                placeholderTextColor={colors.subtext}
                value={password}
                onChangeText={(t) => { setPassword(t); setShowRequirements(true) }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                {showPassword
                  ? <EyeOff size={18} color={colors.subtext} />
                  : <Eye    size={18} color={colors.subtext} />
                }
              </TouchableOpacity>
            </View>

            {/* Live requirements */}
            {showRequirements && (
              <View style={s.reqBox}>
                <Text style={s.reqTitle}>Password requirements</Text>
                {PASSWORD_RULES.map((rule, i) => (
                  <View key={i} style={s.reqRow}>
                    {ruleResults[i]
                      ? <CheckCircle size={13} color={SUCCESS} />
                      : <AlertCircle size={13} color={FAIL} />
                    }
                    <Text style={[s.reqText, { color: ruleResults[i] ? SUCCESS : FAIL }]}>
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Role selector */}
            <Text style={s.roleLabel}>I am a…</Text>
            <View style={s.roleRow}>
              {(["user", "mechanic"] as const).map((r) => {
                const isActive = role === r
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      s.roleBtn,
                      {
                        borderColor:     isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? colors.primaryLight ?? colors.border : "transparent",
                      },
                    ]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.75}
                  >
                    {r === "user"
                      ? <User    size={15} color={isActive ? colors.primary : colors.subtext} />
                      : <Wrench  size={15} color={isActive ? colors.primary : colors.subtext} />
                    }
                    <Text style={[s.roleText, { color: isActive ? colors.primary : colors.subtext }]}>
                      {r === "user" ? "Car Owner" : "Mechanic"}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Submit */}
            <AppButton
              label="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />
          </View>

          {/* ── Login link ── */}
          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/Login")}>
              <Text style={s.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
