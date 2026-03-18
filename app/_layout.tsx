
import { useEffect, useState } from "react"
import { Stack } from "expo-router"
import { View, Text, ActivityIndicator, StatusBar } from "react-native"
import * as SplashScreen from "expo-splash-screen"

import { AuthProvider, useAuth } from "@/context/AuthContext"
import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import { DiagnosticsProvider } from "@/context/DiagnosticsContext"
import { NotificationsProvider } from "@/context/NotificationsContext"
import { TabBarProvider } from "@/context/TabBarContext"
import React from "react"

// Controls the device status bar (time, battery, etc.) based on the current theme
function ThemedStatusBar() {
  const { isDark } = useTheme()
  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor="transparent"
      translucent
    />
  )
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AppErrorBoundary caught error:", error)
    console.error("Component stack:", info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>Something went wrong.</Text>
          <Text style={{ fontSize: 12, textAlign: "center" }}>{this.state.error?.message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

export const ErrorBoundary = AppErrorBoundary

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function AppContent() {
  const { isInitialized } = useAuth()

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ fontSize: 18, color: "#333", marginTop: 20 }}>Initializing Car First Aid...</Text>
      </View>
    )
  }

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Skip font loading to avoid errors
        console.log("App preparing...")

        // Simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (e) {
        console.warn("Error preparing app:", e)
      } finally {
        // Mark app as ready
        setAppIsReady(true)
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ fontSize: 18, color: "#333", marginTop: 20 }}>Loading Car First Aid...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider>
      <TabBarProvider>
        <AuthProvider>
          <DiagnosticsProvider>
            <NotificationsProvider>
              <AppErrorBoundary>
                <AppContent />
              </AppErrorBoundary>
            </NotificationsProvider>
          </DiagnosticsProvider>
        </AuthProvider>
      </TabBarProvider>
    </ThemeProvider>
  )
}
