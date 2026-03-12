/**
 * UserAvatar.tsx
 *
 * Reusable round avatar component.
 *
 * Priority:
 *  1. profileImageUri (future — when users can upload a photo)
 *  2. Initials derived from user.name
 *  3. Single "?" fallback if no user at all
 *
 * Usage:
 *  <UserAvatar size={36} />                    — uses auth context automatically
 *  <UserAvatar size={36} onPress={handler} />  — tappable
 */

import React from "react"
import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

interface UserAvatarProps {
  /** Diameter of the avatar circle in px. Default 36 */
  size?: number
  /** Called when the avatar is tapped */
  onPress?: () => void
  /** Optional direct URI — for when a profile image is available */
  imageUri?: string
}

/** Returns 1–2 capital initials from a full name, e.g. "John Smith" → "JS" */
function getInitials(name?: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function UserAvatar({ size = 36, onPress, imageUri }: UserAvatarProps) {
  const { user } = useAuth()
  const { colors } = useTheme()

  const initials = getInitials(user?.name)
  const fontSize = Math.round(size * 0.38)

  const circle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  }

  const inner = imageUri ? (
    <Image source={{ uri: imageUri }} style={{ width: size, height: size }} resizeMode="cover" />
  ) : (
    <Text style={{ color: colors.buttonText, fontSize, fontFamily: "Poppins-Bold" }}>
      {initials}
    </Text>
  )

  if (onPress) {
    return (
      <TouchableOpacity style={circle} onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    )
  }

  return <View style={circle}>{inner}</View>
}
