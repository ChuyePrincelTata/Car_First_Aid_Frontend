import React, { createContext, useContext, useMemo, useState } from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import AppButton from "@/components/AppButton"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useTheme } from "@/context/ThemeContext"

type ModalTone = "info" | "success" | "warning" | "danger"

type ModalOptions = {
  title: string
  message?: string
  tone?: ModalTone
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
}

type AppModalContextType = {
  showAlert: (options: ModalOptions) => void
  showConfirm: (options: ModalOptions) => void
  dismiss: () => void
}

type ActiveModal = ModalOptions & {
  mode: "alert" | "confirm"
}

const AppModalContext = createContext<AppModalContextType | undefined>(undefined)

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme()
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null)

  const dismiss = () => {
    activeModal?.onCancel?.()
    setActiveModal(null)
  }

  const confirm = () => {
    activeModal?.onConfirm?.()
    setActiveModal(null)
  }

  const value = useMemo<AppModalContextType>(
    () => ({
      showAlert: (options) => setActiveModal({ ...options, mode: "alert" }),
      showConfirm: (options) => setActiveModal({ ...options, mode: "confirm" }),
      dismiss,
    }),
    [activeModal],
  )

  const tone = activeModal?.tone ?? "info"
  const toneColor =
    tone === "danger" ? colors.error : tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.primary
  const icon =
    tone === "danger" ? (
      <AlertTriangle size={26} color={toneColor} />
    ) : tone === "warning" ? (
      <AlertCircle size={26} color={toneColor} />
    ) : tone === "success" ? (
      <CheckCircle size={26} color={toneColor} />
    ) : (
      <Info size={26} color={toneColor} />
    )

  return (
    <AppModalContext.Provider value={value}>
      {children}
      <Modal visible={Boolean(activeModal)} transparent animationType="fade" onRequestClose={dismiss}>
        <Pressable style={styles.backdrop} onPress={dismiss}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? colors.card : "#ffffff",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: toneColor + "18" }]}>{icon}</View>
            <Text style={[styles.title, { color: colors.text }]}>{activeModal?.title}</Text>
            {activeModal?.message ? <Text style={[styles.message, { color: colors.subtext }]}>{activeModal.message}</Text> : null}

            <View style={activeModal?.mode === "confirm" ? styles.actions : styles.singleAction}>
              {activeModal?.mode === "confirm" ? (
                <AppButton
                  label={activeModal.cancelLabel ?? "Cancel"}
                  variant="outline"
                  onPress={dismiss}
                  style={styles.actionButton}
                />
              ) : null}
              <AppButton
                label={activeModal?.confirmLabel ?? "OK"}
                variant={tone === "danger" ? "danger" : "primary"}
                onPress={confirm}
                style={activeModal?.mode === "confirm" ? styles.actionButton : undefined}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppModalContext.Provider>
  )
}

export function useAppModal() {
  const context = useContext(AppModalContext)
  if (!context) throw new Error("useAppModal must be used within AppModalProvider")
  return context
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
  singleAction: {
    alignSelf: "stretch",
    marginTop: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
})
