/**
 * Login.tsx — Premium auth screen using the app design system
 *
 * Uses the same design tokens (colors, Spacing, Radius, FontSize, FontFamily,
 * Shadows) and component patterns (AppButton, card surfaces, icon boxes) as
 * the Home, Profile, and Mechanics screens — so it feels part of the same app.
 *
 * Premium touches:
 *  - Smooth staggered entry animations (fade + slide)
 *  - Logo glow ring in `colors.primary`
 *  - Icon boxes that highlight on focus (same pattern as Profile iconBox)
 *  - Elevated card with proper Shadows + hairline border
 *  - AppButton for submit
 *  - Correct light/dark handling via colors.X only
 */

import { useState, useRef, useEffect } from "react"
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, Animated as RNAnimated,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Lock, Mail, Eye, EyeOff, ChevronRight } from "@/components/SafeLucide"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Spacing, Radius, FontSize, FontFamily, Shadows } from "@/constants/Theme"
import AppButton from "@/components/AppButton"
import { useAppModal } from "@/context/AppModalContext"
import React from "react"

export default function LoginScreen() {
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)

  const router               = useRouter()
  const { signIn, isLoading } = useAuth()
  const { colors, isDark }    = useTheme()
  const { showAlert }         = useAppModal()

  const passwordRef = useRef<TextInput>(null)
  const insets      = useSafeAreaInsets()

  // ── Entry animations ──────────────────────────────────────────────────
  const logoAnim   = useRef(new RNAnimated.Value(0)).current
  const titleAnim  = useRef(new RNAnimated.Value(0)).current
  const cardAnim   = useRef(new RNAnimated.Value(0)).current
  const footerAnim = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    RNAnimated.stagger(120, [
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

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert({ title: "Missing fields", message: "Please enter your email and password.", tone: "warning" })
      return
    }
    try {
      await signIn(email.trim().toLowerCase(), password)
      router.replace("/(tabs)")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Login failed. Please try again."
      showAlert({ title: "Login failed", message: msg, tone: "danger" })
    }
  }

  // ── Focus-dependent input border ──────────────────────────────────────
  const inputBorder = (focused: boolean) => ({
    borderColor: focused ? colors.primary : colors.border,
    borderWidth: focused ? 1.5 : 1,
  })

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

    /* ── Logo section ── */
    logoSection: {
      alignItems: "center",
      paddingTop: insets.top + Spacing.xxl,
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
      marginBottom: Spacing.xxl,
    },
    welcomeLabel: {
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

    /* ── Form card (same pattern as Profile hero/cards) ── */
    formCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...Shadows.md,
    },
    formTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
    },

    /* ── Input row (matches Profile/Mechanics input patterns) ── */
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

    /* ── Forgot password ── */
    forgotRow: {
      alignItems: "flex-end",
      marginBottom: Spacing.lg,
      marginTop: -Spacing.xs,
    },
    forgotText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.primary,
    },

    /* ── Divider ── */
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: Spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: Spacing.md,
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },

    /* ── Register link ── */
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    registerText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },
    registerBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: Spacing.xs,
    },
    registerLink: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.primary,
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
        {/* ── Logo with glow ── */}
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
          <Text style={s.welcomeLabel}>Welcome back</Text>
          <Text style={s.heroTitle}>
            Car <Text style={s.heroPrimarySpan}>First Aid</Text>
          </Text>
          <Text style={s.heroSub}>AI-powered car diagnostics in your pocket</Text>
        </RNAnimated.View>

        {/* ── Form card ── */}
        <RNAnimated.View style={makeEntryStyle(cardAnim)}>
          <View style={s.formCard}>
            <Text style={s.formTitle}>Sign in</Text>

            {/* Email */}
            <View style={[s.inputRow, inputBorder(emailFocused)]}>
              <View style={[s.inputIconBox, emailFocused && s.inputIconBoxActive]}>
                <Mail size={18} color={emailFocused ? colors.primary : colors.subtext} />
              </View>
              <TextInput
                style={s.input}
                placeholder="Email address"
                placeholderTextColor={colors.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
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
                ref={passwordRef}
                style={s.input}
                placeholder="Password"
                placeholderTextColor={colors.subtext}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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

            {/* Forgot password */}
            <View style={s.forgotRow}>
              <TouchableOpacity onPress={() => router.push("/(auth)/ForgotPassword")}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In — uses AppButton (same as rest of app) */}
            <AppButton
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={{ marginTop: Spacing.xs }}
            />
          </View>
        </RNAnimated.View>

        {/* ── Footer ── */}
        <RNAnimated.View style={makeEntryStyle(footerAnim)}>
          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Register link */}
          <View style={s.registerRow}>
            <Text style={s.registerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/Register")}
              style={s.registerBtn}
            >
              <Text style={s.registerLink}>Create one</Text>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </RNAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
