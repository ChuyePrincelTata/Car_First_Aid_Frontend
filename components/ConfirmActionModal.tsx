import React from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import AppButton from "@/components/AppButton"
import { AlertTriangle } from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useTheme } from "@/context/ThemeContext"

type Props = {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, isDark } = useTheme()

  const toneColor = destructive ? colors.error : colors.primary

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? colors.card : "#ffffff",
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: toneColor + "18" },
            ]}
          >
            <AlertTriangle size={26} color={toneColor} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.subtext }]}>{message}</Text>

          <View style={styles.actions}>
            <AppButton
              label={cancelLabel}
              variant="outline"
              onPress={onCancel}
              style={styles.actionButton}
            />
            <AppButton
              label={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 28, 0.58)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  sheet: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 12,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
})
