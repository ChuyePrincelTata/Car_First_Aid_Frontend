

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native"
import { useRouter } from "expo-router"
import { testBackendConnection, runDiagnostics } from "../utils/networkTest"
import { getEnvironmentInfo } from "../utils/apiConfig"
import { useTheme } from "@/context/ThemeContext"
import AppButton from "@/components/AppButton"
import React from "react"

export default function ConnectionTestScreen() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [envInfo, setEnvInfo] = useState("")
  const router = useRouter()
  const { colors } = useTheme()

  useEffect(() => {
    try {
      setEnvInfo(getEnvironmentInfo())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setEnvInfo(`Error getting environment info: ${errorMessage}`)
    }
  }, [])

  const runConnectionTest = async () => {
    setIsLoading(true)
    setTestResult(null)
    setDiagnostics(null)

    try {
      const result = await testBackendConnection()

      if (result.success) {
        setTestResult(
          `✅ Connection successful!\n\n${result.message}\n\nServer response: ${JSON.stringify(result.details, null, 2)}`,
        )
      } else {
        setTestResult(
          `❌ Connection failed!\n\n${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`,
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setTestResult(`❌ Test error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const runFullDiagnostics = async () => {
    setIsLoading(true)
    setDiagnostics(null)
    setTestResult(null)

    try {
      const result = await runDiagnostics()
      setDiagnostics(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setDiagnostics({ error: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.text,
      textAlign: "center",
    },
    infoBox: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    infoText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 10,
    },
    envInfo: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      padding: 10,
      backgroundColor: "rgba(0,0,0,0.05)",
      borderRadius: 5,
    },
    resultContainer: {
      marginTop: 20,
      padding: 15,
      backgroundColor: colors.card,
      borderRadius: 10,
      minHeight: 100,
    },
    resultText: {
      fontSize: 12,
      color: colors.text,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
  })

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Backend Connection Test</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          This screen helps diagnose connection issues between your app and the backend server.
        </Text>
        <Text style={styles.infoText}>Environment Information:</Text>
        <Text style={styles.envInfo}>{envInfo}</Text>
      </View>

      <AppButton
        label={isLoading ? "Testing..." : "Quick Connection Test"}
        onPress={runConnectionTest}
        disabled={isLoading}
        style={{ marginVertical: 10 }}
      />

      <AppButton
        label={isLoading ? "Running..." : "Full Diagnostics"}
        variant="soft"
        onPress={runFullDiagnostics}
        disabled={isLoading}
        style={{ marginVertical: 10 }}
      />

      {testResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      )}

      {diagnostics && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{JSON.stringify(diagnostics, null, 2)}</Text>
        </View>
      )}

      <AppButton
        label="Go Back"
        variant="ghost"
        onPress={() => router.back()}
        style={{ marginTop: 20, alignSelf: "center" }}
        fullWidth={false}
      />
    </ScrollView>
  )
}
