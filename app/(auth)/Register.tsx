/**
 * Register.tsx — Premium auth screen using the app design system
 *
 * Uses the same design tokens (colors, Spacing, Radius, FontSize, FontFamily,
 * Shadows) and component patterns (AppButton, card surfaces, icon boxes) as
 * the Home, Profile, and Mechanics screens.
 *
 * Premium touches:
 *  - Smooth staggered entry animations (fade + slide)
 *  - Logo glow ring in `colors.primary`
 *  - Icon boxes that highlight on focus (same pattern as Profile iconBox)
 *  - Password strength bar + live requirement checklist
 *  - Premium role selector cards with check indicator
 *  - Elevated card with proper Shadows + hairline border
 *  - AppButton for submit
 *  - Correct light/dark handling via colors.X only
 */

import { useState, useMemo, useRef, useEffect } from "react"
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, Animated as RNAnimated,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Eye, EyeOff, CheckCircle, AlertCircle,
  User, Wrench, Mail, Lock,
} from "@/components/SafeLucide"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Spacing, Radius, FontSize, FontFamily, Shadows } from "@/constants/Theme"
import AppButton from "@/components/AppButton"
import { useAppModal } from "@/context/AppModalContext"
import React from "react"

/* ── Password rules ──────────────────────────────────────────────────────── */
const PASSWORD_RULES = [
  { label: "At least 8 characters",         test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)",    test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",    test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)",              test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterScreen() {
  const [name, setName]                         = useState("")
  const [email, setEmail]                       = useState("")
  const [password, setPassword]                 = useState("")
  const [role, setRole]                         = useState<"user" | "mechanic">("user")
  const [showPassword, setShowPassword]         = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [isLoading, setIsLoading]               = useState(false)

  const [nameFocused, setNameFocused]   = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)

  const auth              = useAuth()
  const { colors, isDark } = useTheme()
  const { showAlert }      = useAppModal()
  const router            = useRouter()
  const emailRef          = useRef<TextInput>(null)
  const passRef           = useRef<TextInput>(null)
  const insets            = useSafeAreaInsets()

  const ruleResults    = useMemo(() => PASSWORD_RULES.map(r => r.test(password)), [password])
  const allRulesPassed = ruleResults.every(Boolean)
  const passedCount    = ruleResults.filter(Boolean).length

  // ── Entry animations ──────────────────────────────────────────────────
  const logoAnim   = useRef(new RNAnimated.Value(0)).current
  const titleAnim  = useRef(new RNAnimated.Value(0)).current
  const cardAnim   = useRef(new RNAnimated.Value(0)).current
  const footerAnim = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    RNAnimated.stagger(100, [
      RNAnimated.spring(logoAnim,   { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      RNAnimated.spring(titleAnim,  { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      RNAnimated.spring(cardAnim,   { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      RNAnimated.spring(footerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start()
  }, [])

  const makeEntryStyle = (anim: RNAnimated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  })

  if (!auth) return null
  const { signUp } = auth

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showAlert({ title: "Missing fields", message: "Please fill in all fields.", tone: "warning" })
      return
    }
    if (!email.includes("@")) {
      showAlert({ title: "Invalid email", message: "Please enter a valid email address.", tone: "warning" })
      return
    }
    if (!allRulesPassed) {
      setShowRequirements(true)
      showAlert({ title: "Weak password", message: "Please meet all password requirements before continuing.", tone: "warning" })
      return
    }
    setIsLoading(true)
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), role)
      router.replace(role === "mechanic" ? "/(mechanic)/verification" : "/(tabs)")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Registration failed. Please try again."
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("email already")) {
        showAlert({ title: "Email taken", message: "This email is already registered. Try signing in instead.", tone: "warning" })
      } else if (msg.includes("network") || msg.includes("connection")) {
        showAlert({ title: "No connection", message: "Please check your internet connection and try again.", tone: "warning" })
      } else {
        showAlert({ title: "Registration failed", message: msg, tone: "danger" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ── Focus-dependent input border ──────────────────────────────────────
  const inputBorder = (focused: boolean) => ({
    borderColor: focused ? colors.primary : colors.border,
    borderWidth: focused ? 1.5 : 1,
  })

  // ── Strength bar colour ───────────────────────────────────────────────
  const strengthColor = passedCount <= 1 ? colors.error
    : passedCount <= 3 ? colors.warning
    : passedCount <= 4 ? colors.primary
    : colors.success

  // ── Styles (inside render for theme access) ───────────────────────────
  const s = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
    },

    /* ── Logo section (identical to Login) ── */
    logoSection: {
      alignItems: "center",
      paddingTop: insets.top + Spacing.xl,
      marginBottom: Spacing.md,
    },
    logoGlow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    logoRing: {
      width: 88,
      height: 88,
      borderRadius: Radius.xl + 4,
      borderWidth: 2,
      borderColor: colors.primary + "30",
      padding: 3,
      overflow: "hidden",
    },
    logoImage: {
      width: "100%",
      height: "100%",
      borderRadius: Radius.xl + 1,
    },

    /* ── Hero text ── */
    heroBlock: {
      alignItems: "center",
      marginBottom: Spacing.xl,
    },
    joinLabel: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.primary,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: Spacing.xs,
    },
    heroTitle: {
      fontSize: FontSize.xxl,
      fontFamily: FontFamily.bold,
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: Spacing.xs,
      textAlign: "center",
    },
    heroPrimarySpan: {
      color: colors.primary,
    },
    heroSub: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      textAlign: "center",
    },

    /* ── Form card ── */
    formCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...Shadows.md,
    },

    /* ── Input row ── */
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.lg,
      backgroundColor: colors.background,
      marginBottom: Spacing.md,
      paddingRight: Spacing.md,
      height: 54,
    },
    inputIconBox: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: Spacing.sm,
      marginRight: Spacing.xs,
    },
    inputIconBoxActive: {
      backgroundColor: colors.primary + "12",
    },
    input: {
      flex: 1,
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: colors.text,
    },
    eyeBtn: {
      padding: Spacing.xs,
    },

    /* ── Password strength section ── */
    strengthSection: {
      marginBottom: Spacing.base,
      marginTop: -Spacing.xs,
    },
    strengthBarTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: Spacing.sm,
      overflow: "hidden",
    },
    strengthBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semiBold,
      marginBottom: Spacing.sm,
    },
    reqBox: {
      backgroundColor: isDark ? colors.background : "#f8fafc",
      borderRadius: Radius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reqRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    reqText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      marginLeft: Spacing.sm,
    },

    /* ── Role selector ── */
    roleLabel: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.subtext,
      marginBottom: Spacing.sm,
    },
    roleRow: {
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    roleBtn: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    roleIconBox: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    roleTextBlock: {
      flex: 1,
    },
    roleTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
    },
    roleSub: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      marginTop: 1,
    },

    /* ── Footer ── */
    footer: {
      marginTop: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
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
      marginLeft: Spacing.xs,
    },
  })

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + Spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo (identical to Login) ── */}
        <RNAnimated.View style={[s.logoSection, makeEntryStyle(logoAnim)]}>
          <View style={s.logoGlow}>
            <View style={s.logoRing}>
              <Image
                source={require("../../assets/images/logo.jpg")}
                style={s.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </RNAnimated.View>

        {/* ── Hero text ── */}
        <RNAnimated.View style={[s.heroBlock, makeEntryStyle(titleAnim)]}>
          <Text style={s.joinLabel}>Get started</Text>
          <Text style={s.heroTitle}>
            Create your <Text style={s.heroPrimarySpan}>account</Text>
          </Text>
          <Text style={s.heroSub}>Join thousands of drivers getting smarter diagnostics</Text>
        </RNAnimated.View>

        {/* ── Form card ── */}
        <RNAnimated.View style={makeEntryStyle(cardAnim)}>
          <View style={s.formCard}>

            {/* Full name */}
            <View style={[s.inputRow, inputBorder(nameFocused)]}>
              <View style={[s.inputIconBox, nameFocused && s.inputIconBoxActive]}>
                <User size={18} color={nameFocused ? colors.primary : colors.subtext} />
              </View>
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
              <View style={[s.inputIconBox, emailFocused && s.inputIconBoxActive]}>
                <Mail size={18} color={emailFocused ? colors.primary : colors.subtext} />
              </View>
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
              <View style={[s.inputIconBox, passFocused && s.inputIconBoxActive]}>
                <Lock size={18} color={passFocused ? colors.primary : colors.subtext} />
              </View>
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

            {/* ── Password strength ── */}
            {showRequirements && (
              <View style={s.strengthSection}>
                {/* Strength bar */}
                <View style={s.strengthBarTrack}>
                  <View style={[
                    s.strengthBarFill,
                    { width: `${(passedCount / PASSWORD_RULES.length) * 100}%`, backgroundColor: strengthColor },
                  ]} />
                </View>
                <Text style={[s.strengthLabel, { color: strengthColor }]}>
                  {passedCount === 0 ? "" : passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Good" : "Strong"}
                </Text>

                {/* Rule list */}
                <View style={s.reqBox}>
                  {PASSWORD_RULES.map((rule, i) => (
                    <View key={i} style={s.reqRow}>
                      {ruleResults[i]
                        ? <CheckCircle size={13} color={colors.success} />
                        : <AlertCircle size={13} color={colors.error} />
                      }
                      <Text style={[s.reqText, { color: ruleResults[i] ? colors.success : colors.error }]}>
                        {rule.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Role selector ── */}
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
                        backgroundColor: isActive
                          ? (colors.primaryLight ?? colors.border)
                          : colors.background,
                      },
                    ]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.roleIconBox, {
                      backgroundColor: colors.primary + "12",
                    }]}>
                      {r === "user"
                        ? <User   size={20} color={isActive ? colors.primary : colors.subtext} />
                        : <Wrench size={20} color={isActive ? colors.primary : colors.subtext} />
                      }
                    </View>
                    <View style={s.roleTextBlock}>
                      <Text style={[s.roleTitle, { color: isActive ? colors.primary : colors.text }]}>
                        {r === "user" ? "Car Owner" : "Mechanic"}
                      </Text>
                      <Text style={s.roleSub}>
                        {r === "user" ? "Get diagnostics for your car" : "Help drivers fix their cars"}
                      </Text>
                    </View>
                    {isActive && <CheckCircle size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* ── Create Account — uses AppButton ── */}
            <AppButton
              label="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={{ marginTop: Spacing.xs }}
            />
          </View>
        </RNAnimated.View>

        {/* ── Footer ── */}
        <RNAnimated.View style={[s.footer, makeEntryStyle(footerAnim)]}>
          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/Login")}>
              <Text style={s.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </RNAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
