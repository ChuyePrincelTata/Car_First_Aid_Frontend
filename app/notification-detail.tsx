import React, { useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppButton from "@/components/AppButton"
import ConfirmActionModal from "@/components/ConfirmActionModal"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  MessageCircle,
  Trash2,
} from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useAnalytics } from "@/context/AnalyticsContext"
import { useDiagnosticsContext } from "@/context/DiagnosticsContext"
import { Notification, useNotificationsContext } from "@/context/NotificationsContext"
import { useTheme } from "@/context/ThemeContext"

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const getCategoryLabel = (notification: Notification) => {
  if (notification.category) return notification.category.charAt(0).toUpperCase() + notification.category.slice(1)
  if (notification.type === "engine_result" || notification.type === "dashboard_result") return "Diagnostic"
  if (notification.type === "mechanic_message") return "Mechanic"
  return "System"
}

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const analytics = useAnalytics()
  const { notifications, markAsRead, removeNotification } = useNotificationsContext()
  const { getDiagnosticById } = useDiagnosticsContext()
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)

  const notification = useMemo(() => notifications.find((item) => item.id === id), [id, notifications])
  const linkedDiagnostic = notification?.linkId ? getDiagnosticById(notification.linkId) : null

  useEffect(() => {
    if (notification && !notification.read) {
      markAsRead(notification.id)
    }
  }, [markAsRead, notification])

  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace("/notifications")
  }

  const getIcon = () => {
    if (!notification) return <Bell size={26} color={colors.primary} />

    switch (notification.type) {
      case "engine_result":
      case "dashboard_result":
      case "success":
        return <CheckCircle size={26} color={colors.primary} />
      case "mechanic_message":
        return <MessageCircle size={26} color={colors.primary} />
      case "warning":
      case "error":
        return <AlertCircle size={26} color={notification.type === "error" ? colors.error : colors.warning} />
      case "info":
      default:
        return <Info size={26} color={colors.primary} />
    }
  }

  const getActionLabel = () => {
    if (!notification?.linkId) return null
    if (notification.type === "engine_result" || notification.type === "dashboard_result") {
      return linkedDiagnostic ? "View history details" : "Open diagnosis history"
    }
    if (notification.type === "mechanic_message") return "Open mechanic profile"
    return null
  }

  const handlePrimaryAction = () => {
    if (!notification?.linkId) return

    analytics.track("notification_detail_action_opened", {
      type: notification.type,
      category: notification.category ?? "none",
    })

    if (notification.type === "engine_result" || notification.type === "dashboard_result") {
      if (linkedDiagnostic) {
        router.push({ pathname: "/(tabs)/history/[id]", params: { id: linkedDiagnostic.id } })
        return
      }

      router.push("/(tabs)/history")
      return
    }

    if (notification.type === "mechanic_message") {
      router.push({ pathname: "/(tabs)/mechanics/[id]", params: { id: notification.linkId } })
    }
  }

  const handleDelete = () => {
    if (!notification) return
    removeNotification(notification.id)
    analytics.track("notification_detail_deleted", { type: notification.type, category: notification.category ?? "none" })
    setConfirmDeleteVisible(false)
    router.replace("/notifications")
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingTop: insets.top + SCREEN_HEADER_H + Spacing.lg,
      paddingHorizontal: Spacing.base,
      paddingBottom: insets.bottom + Spacing.xxl,
    },
    notFound: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing.xl,
      paddingTop: insets.top + SCREEN_HEADER_H + 80,
    },
    notFoundTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.lg,
      marginTop: Spacing.md,
    },
    notFoundText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
      textAlign: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    headerAction: {
      width: 44,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    iconWrap: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "14",
      marginBottom: Spacing.md,
    },
    title: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.xl,
      lineHeight: 30,
    },
    message: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.base,
      lineHeight: 24,
      marginTop: Spacing.md,
    },
    metaCard: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.lg,
      padding: Spacing.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginTop: Spacing.md,
      gap: Spacing.md,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    metaIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "12",
    },
    metaLabel: {
      color: colors.tabIconDefault,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
      marginBottom: 2,
    },
    metaValue: {
      color: colors.text,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.sm,
    },
    priority: {
      alignSelf: "flex-start",
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.full,
      backgroundColor: notification?.priority === "high" ? colors.error + "16" : colors.primary + "12",
      marginTop: Spacing.md,
    },
    priorityText: {
      color: notification?.priority === "high" ? colors.error : colors.primary,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
      textTransform: "capitalize",
    },
    actionCard: {
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderRadius: Radius.lg,
      padding: Spacing.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginTop: Spacing.md,
    },
    actionTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
      marginBottom: Spacing.sm,
    },
    actionText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
      marginBottom: Spacing.md,
    },
  })

  if (!notification) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Notification" onBack={goBack} />
        <View style={styles.notFound}>
          <View style={styles.iconWrap}>
            <Bell size={28} color={colors.primary} />
          </View>
          <Text style={styles.notFoundTitle}>Notification not found</Text>
          <Text style={styles.notFoundText}>It may have been deleted or cleared from your notifications.</Text>
          <AppButton label="Back to notifications" variant="outline" onPress={() => router.replace("/notifications")} />
        </View>
      </View>
    )
  }

  const actionLabel = getActionLabel()

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notification"
        onBack={goBack}
        right={
          <Pressable style={styles.headerAction} onPress={() => setConfirmDeleteVisible(true)}>
            <Trash2 size={20} color={colors.error} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>{getIcon()}</View>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          {notification.priority ? (
            <View style={styles.priority}>
              <Text style={styles.priorityText}>{notification.priority} priority</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Clock size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.metaLabel}>Received</Text>
              <Text style={styles.metaValue}>{formatFullDate(notification.date)}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Bell size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{getCategoryLabel(notification)}</Text>
            </View>
          </View>
        </View>

        {actionLabel ? (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Related action</Text>
            <Text style={styles.actionText}>
              This notification is linked to your saved records. Open it when you want to continue from this message.
            </Text>
            <AppButton
              label={actionLabel}
              icon={<ChevronRight size={18} color={colors.buttonText} />}
              iconPosition="right"
              onPress={handlePrimaryAction}
            />
          </View>
        ) : null}
      </ScrollView>

      <ConfirmActionModal
        visible={confirmDeleteVisible}
        title="Delete notification?"
        message="This notification will be removed from this device. Related diagnostic history will not be deleted."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  )
}
