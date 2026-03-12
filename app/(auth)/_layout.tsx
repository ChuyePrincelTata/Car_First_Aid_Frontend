/**
 * (auth)/_layout.tsx
 *
 * Auth stack layout.
 * headerShown: false — each auth screen owns its full visual design (logo,
 * app name, tagline) as part of the screen body itself. No OS nav bar.
 */
import { Stack } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

export default function AuthLayout() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,           // auth screens handle their own header UI
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "slide_from_right", // smooth horizontal transition between auth screens
      }}
    />
  )
}
