/**
 * Login.tsx
 *
 * Full-screen login with:
 *  - No OS navigation header (handled by auth layout)
 *  - App logo + name + tagline at the top
 *  - Themed inputs (border highlights on focus)
 *  - Password visibility toggle
 *  - Primary-coloured submit button whose TEXT uses `colors.buttonText`
 *    so it is readable on BOTH the yellow (dark mode) and blue (light mode) gradient
 *  - Works correctly in light AND dark mode without any hardcoded colours
 */

import { useState, useRef } from "react"
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Lock, Mail, Eye, EyeOff } from "@/components/SafeLucide"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Spacing, Radius, FontSize, FontFamily, Shadows } from "@/constants/Theme"
import React from "react"

export default function LoginScreen() {
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)

  const router          = useRouter()
  const { signIn, isLoading } = useAuth()
  const { colors, isDark }    = useTheme()

  const passwordRef = useRef<TextInput>(null)
  const insets       = useSafeAreaInsets()

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.")
      return
    }
    try {
      await signIn(email.trim().toLowerCase(), password)
      router.replace("/(tabs)")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Login failed. Please try again."
      Alert.alert("Login Failed", msg)
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

    /* ── branding block ── */
    brandBlock: {
      alignItems: "center",
      paddingTop: insets.top + Spacing.xl,
      paddingBottom: Spacing.xxl,
    },
    logoWrapper: {
      width: 90,
      height: 90,
      borderRadius: Radius.xl,
      overflow: "hidden",
      marginBottom: Spacing.md,
      ...Shadows.md,
    },
    logo: { width: "100%", height: "100%" },
    appName: {
      fontSize: FontSize.xxl,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    tagline: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      textAlign: "center",
    },

    /* ── form section ── */
    formSection: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      ...Shadows.sm,
    },
    sectionTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.lg,
    },

    /* ── input row ── */
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.lg,
      backgroundColor: isDark ? colors.background : colors.background,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
      height: 54,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: {
      flex: 1,
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: colors.text,
    },
    eyeBtn: { padding: Spacing.xs },

    /* ── forgot ── */
    forgotRow: { alignItems: "flex-end", marginBottom: Spacing.lg, marginTop: -4 },
    forgotText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      color: colors.primary,
    },

    /* ── primary button ── */
    btn: {
      height: 54,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: Spacing.xs,
      ...Shadows.md,
    },
    btnText: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.bold,
      // buttonText ensures readable contrast on primary-coloured button
      color: colors.buttonText,
      letterSpacing: 0.3,
    },

    /* ── divider ── */
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: Spacing.lg,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: {
      marginHorizontal: Spacing.sm,
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },

    /* ── register link ── */
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: Spacing.lg,
    },
    registerText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
    },
    registerLink: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      marginLeft: 4,
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
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.inner}>

          {/* ── Branding ── */}
          <View style={s.brandBlock}>
            <View style={s.logoWrapper}>
              <Image
                source={require("../../assets/images/logo.jpg")}
                style={s.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={s.appName}>Car First Aid</Text>
            <Text style={s.tagline}>AI-powered car diagnostics in your pocket</Text>
          </View>

          {/* ── Form card ── */}
          <View style={s.formSection}>
            <Text style={s.sectionTitle}>Sign in</Text>

            {/* Email */}
            <View style={[s.inputRow, inputBorder(emailFocused)]}>
              <Mail size={18} color={emailFocused ? colors.primary : colors.subtext} style={s.inputIcon} />
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
              <Lock size={18} color={passFocused ? colors.primary : colors.subtext} style={s.inputIcon} />
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
              <TouchableOpacity>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[s.btn, isLoading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={colors.buttonText} />
                : <Text style={s.btnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {/* ── Divider ── */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* ── Register link ── */}
          <View style={s.registerRow}>
            <Text style={s.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/Register")}>
              <Text style={s.registerLink}>Create one</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
