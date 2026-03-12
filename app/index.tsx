import { Redirect } from "expo-router"
import React from "react"
import { View, ActivityIndicator } from "react-native"
import { useAuth } from "@/context/AuthContext"

export default function Index() {
  const { user, isInitialized } = useAuth()

  // Wait until SecureStore has been read before deciding where to go
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // Already logged in → go straight to the app
  if (user) {
    return <Redirect href="/(tabs)" />
  }

  // Not logged in → go to login
  return <Redirect href="/(auth)/Login" />
}
