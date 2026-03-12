
import { useState, useMemo } from "react"
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "@/components/SafeLucide"
import React from "react"

// Password requirement rules
const PASSWORD_RULES = [
  { label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",      test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)",                test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterScreen() {
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [name, setName]               = useState("")
  const [role, setRole]               = useState<"user" | "mechanic">("user")
  const [showPassword, setShowPassword]           = useState(false)
  const [showRequirements, setShowRequirements]   = useState(false)
  const [isLoading, setIsLoading]     = useState(false)

  const auth        = useAuth()
  const { colors }  = useTheme()
  const router      = useRouter()

  const ruleResults   = useMemo(() => PASSWORD_RULES.map(r => r.test(password)), [password])
  const allRulesPassed = ruleResults.every(Boolean)

  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const { signUp } = auth

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    if (!allRulesPassed) {
      setShowRequirements(true)
      Alert.alert("Weak Password", "Please make sure your password meets all the requirements shown.")
      return
    }

    setIsLoading(true)
    try {
      await signUp(email, password, name, role)
      if (role === "mechanic") {
        router.replace("/(mechanic)/verification")
      } else {
        router.replace("/(tabs)")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration"

      if (errorMessage.includes("already registered") || errorMessage.toLowerCase().includes("email already")) {
        Alert.alert(
          "Registration Failed",
          "This email is already registered. Please use a different email or try signing in.",
        )
      } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
        Alert.alert("Connection Error", "Please check your internet connection and try again.")
      } else {
        Alert.alert("Registration Failed", errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 48 },
    title: {
      fontSize: 28, fontWeight: "bold", color: colors.text,
      textAlign: "center", marginBottom: 30,
    },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      padding: 15, marginBottom: 15, fontSize: 16,
      backgroundColor: colors.card, color: colors.text,
    },
    passwordRow: {
      flexDirection: "row", alignItems: "center",
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      backgroundColor: colors.card, marginBottom: 6,
    },
    passwordInput: { flex: 1, padding: 15, fontSize: 16, color: colors.text },
    eyeButton: { padding: 12 },
    reqBox: {
      backgroundColor: colors.card, borderRadius: 10, padding: 12,
      marginBottom: 15, borderWidth: 1, borderColor: colors.border,
    },
    reqTitle: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 8 },
    reqRow:  { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    reqText: { fontSize: 13, marginLeft: 6 },
    roleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    roleButton: {
      flex: 1, padding: 15, borderRadius: 10,
      borderWidth: 2, marginHorizontal: 5, alignItems: "center",
    },
    activeRole:   { borderColor: colors.primary, backgroundColor: colors.primary + "20" },
    inactiveRole: { borderColor: colors.border,  backgroundColor: colors.card },
    roleText: { fontSize: 16, fontWeight: "600" },
    button: {
      backgroundColor: colors.primary, padding: 15,
      borderRadius: 10, alignItems: "center", marginTop: 10,
    },
    buttonText: { color: colors.background, fontSize: 16, fontWeight: "600" },
    linkButton: { marginTop: 20, alignItems: "center" },
    linkText:   { color: colors.primary, fontSize: 16 },
  })

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.text + "80"}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text + "80"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password with visibility toggle */}
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={colors.text + "80"}
            value={password}
            onChangeText={(t) => { setPassword(t); setShowRequirements(true) }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
            {showPassword
              ? <EyeOff size={20} color={colors.text + "80"} />
              : <Eye    size={20} color={colors.text + "80"} />
            }
          </TouchableOpacity>
        </View>

        {/* Live password requirements — appears once user starts typing */}
        {showRequirements && (
          <View style={styles.reqBox}>
            <Text style={styles.reqTitle}>Password requirements:</Text>
            {PASSWORD_RULES.map((rule, i) => (
              <View key={i} style={styles.reqRow}>
                {ruleResults[i]
                  ? <CheckCircle size={14} color="#22c55e" />
                  : <AlertCircle size={14} color="#ef4444" />
                }
                <Text style={[styles.reqText, { color: ruleResults[i] ? "#22c55e" : "#ef4444" }]}>
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Role selector */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === "user" ? styles.activeRole : styles.inactiveRole]}
            onPress={() => setRole("user")}
          >
            <Text style={[styles.roleText, { color: role === "user" ? colors.primary : colors.text }]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === "mechanic" ? styles.activeRole : styles.inactiveRole]}
            onPress={() => setRole("mechanic")}
          >
            <Text style={[styles.roleText, { color: role === "mechanic" ? colors.primary : colors.text }]}>Mechanic</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading
            ? <ActivityIndicator color={colors.background} />
            : <Text style={styles.buttonText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/(auth)/Login")}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
