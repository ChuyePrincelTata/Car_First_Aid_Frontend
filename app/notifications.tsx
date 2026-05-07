import React, { useMemo, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppButton from "@/components/AppButton"
import ConfirmActionModal from "@/components/ConfirmActionModal"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  ChevronRight,
  Info,
  MessageCircle,
  Trash2,
} from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useAnalytics } from "@/context/AnalyticsContext"
import { Notification, useNotificationsContext } from "@/context/NotificationsContext"
import { useTheme } from "@/context/ThemeContext"

type Filter = "all" | "unread" | "diagnostic" | "system"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function NotificationsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const analytics = useAnalytics()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationsContext()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)

  const filteredNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (filter === "unread") return sorted.filter((item) => !item.read)
    if (filter === "diagnostic") return sorted.filter((item) => item.category === "diagnostic")
    if (filter === "system") return sorted.filter((item) => item.category === "system" || item.type === "info")
    return sorted
  }, [filter, notifications])

  const selectedCount = selectedIds.length
  const allVisibleSelected =
    filteredNotifications.length > 0 && filteredNotifications.every((item) => selectedIds.includes(item.id))

  const enterSelectionMode = (id?: string) => {
    setSelectionMode(true)
    if (id) setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds([])
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
      if (next.length === 0) setSelectionMode(false)
      return next
    })
  }

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredNotifications.map((item) => item.id))
      setSelectedIds((prev) => {
        const next = prev.filter((id) => !visibleIds.has(id))
        if (next.length === 0) setSelectionMode(false)
        return next
      })
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredNotifications.map((item) => item.id)])))
  }

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case "engine_result":
      case "dashboard_result":
        return <CheckCircle size={20} color={colors.primary} />
      case "mechanic_message":
        return <MessageCircle size={20} color={colors.primary} />
      case "error":
        return <AlertCircle size={20} color={colors.error} />
      case "warning":
        return <AlertCircle size={20} color={colors.warning} />
      case "success":
        return <CheckCircle size={20} color={colors.success} />
      case "info":
      default:
        return <Info size={20} color={colors.primary} />
    }
  }

  const handleNotificationPress = (item: Notification) => {
    analytics.track("notification_opened", { type: item.type, category: item.category ?? "none" })
    router.push({ pathname: "/notification-detail", params: { id: item.id } })
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
    analytics.track("notifications_mark_all_read")
  }

  const handleDeleteSelected = () => {
    selectedIds.forEach(removeNotification)
    analytics.track("notifications_selected_deleted", { count: selectedCount })
    setConfirmDeleteVisible(false)
    exitSelectionMode()
  }

  const handleMarkSelectedRead = () => {
    selectedIds.forEach(markAsRead)
    analytics.track("notifications_selected_marked_read", { count: selectedCount })
    exitSelectionMode()
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerAction: {
      minWidth: 44,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerActionText: {
      color: colors.primary,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.sm,
    },
    listContent: {
      paddingTop: insets.top + SCREEN_HEADER_H + Spacing.md,
      paddingHorizontal: Spacing.base,
      paddingBottom: insets.bottom + (selectedCount > 0 ? 148 : 28),
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: Spacing.md,
    },
    summaryTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    summaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primary + "14",
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    summaryTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.lg,
    },
    summaryText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      marginTop: 3,
    },
    filterRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    filterButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    filterText: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.sm,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.base,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unreadCard: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.card : "#ffffff",
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    selectionCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    cardBody: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: Spacing.sm,
    },
    message: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Spacing.sm,
      gap: Spacing.sm,
    },
    metaText: {
      color: colors.tabIconDefault,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
    },
    categoryPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.full,
      backgroundColor: colors.primary + "12",
    },
    categoryText: {
      color: colors.primary,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing.xl,
      paddingVertical: 80,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.md,
    },
    emptyTitle: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.lg,
      marginBottom: Spacing.sm,
    },
    emptyText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
      textAlign: "center",
    },
    selectionBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: insets.bottom + 12,
      gap: Spacing.sm,
      padding: Spacing.sm,
      borderRadius: 18,
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },
    selectionSummary: {
      minHeight: 42,
      justifyContent: "center",
    },
    selectionText: {
      color: colors.text,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.sm,
    },
    selectAllText: {
      color: colors.primary,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
      marginTop: 2,
    },
    selectionActions: {
      flexDirection: "row",
      gap: Spacing.sm,
    },
    barButton: {
      flex: 1,
    },
  })

  const renderFilterButton = (value: Filter, label: string) => {
    const active = filter === value

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: active ? colors.primary : colors.card,
            borderColor: active ? colors.primary : colors.border,
          },
        ]}
        onPress={() => {
          setFilter(value)
          exitSelectionMode()
          analytics.track("notifications_filter_changed", { filter: value })
        }}
      >
        <Text style={[styles.filterText, { color: active ? colors.buttonText : colors.text }]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  const renderNotification = ({ item }: { item: Notification }) => {
    const selected = selectedIds.includes(item.id)

    return (
      <Pressable
        style={[
          styles.card,
          !item.read && styles.unreadCard,
          selected && { borderColor: colors.primary, backgroundColor: colors.primary + "08" },
        ]}
        onPress={() => {
          if (selectionMode) {
            toggleSelected(item.id)
            return
          }

          handleNotificationPress(item)
        }}
        onLongPress={() => enterSelectionMode(item.id)}
      >
        {selectionMode ? (
          <View
            style={[
              styles.selectionCircle,
              {
                backgroundColor: selected ? colors.primary : "transparent",
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            {selected ? <Check size={16} color={colors.buttonText} /> : null}
          </View>
        ) : (
          <View style={styles.iconWrap}>{getNotificationIcon(item)}</View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            {item.category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            ) : null}
            {item.priority === "high" ? <Text style={[styles.metaText, { color: colors.error }]}>High priority</Text> : null}
          </View>
        </View>

        {!selectionMode ? <ChevronRight size={18} color={colors.tabIconDefault} /> : null}
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={selectionMode ? `${selectedCount} selected` : "Notifications"}
        onBack={() => (selectionMode ? exitSelectionMode() : router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"))}
        right={
          notifications.length > 0 ? (
            selectionMode ? (
              <TouchableOpacity style={styles.headerAction} onPress={exitSelectionMode}>
                <Text style={styles.headerActionText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.headerAction} onPress={() => enterSelectionMode()}>
                <Text style={styles.headerActionText}>Select</Text>
              </TouchableOpacity>
            )
          ) : null
        }
      />

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryIcon}>
                    <Bell size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryTitle}>{unreadCount} unread</Text>
                    <Text style={styles.summaryText}>{notifications.length} total notification{notifications.length === 1 ? "" : "s"}</Text>
                  </View>
                </View>

                {unreadCount > 0 ? (
                  <AppButton
                    label="Mark all as read"
                    variant="outline"
                    size="sm"
                    icon={<Check size={16} color={colors.primary} />}
                    onPress={handleMarkAllRead}
                    style={{ marginTop: Spacing.md }}
                  />
                ) : null}
              </View>

              <View style={styles.filterRow}>
                {renderFilterButton("all", "All")}
                {renderFilterButton("unread", "Unread")}
                {renderFilterButton("diagnostic", "Diagnostic")}
                {renderFilterButton("system", "System")}
              </View>
            </>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {filter === "all" ? (
                <Bell size={34} color={colors.primary} />
              ) : (
                <Info size={34} color={colors.primary} />
              )}
            </View>
            <Text style={styles.emptyTitle}>{filter === "all" ? "No notifications" : "Nothing here"}</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Diagnostic results, mechanic replies, and important app updates will appear here."
                : "Try another filter or check back after your next diagnostic."}
            </Text>
          </View>
        }
      />

      {selectedCount > 0 ? (
        <View style={styles.selectionBar}>
          <Pressable style={styles.selectionSummary} onPress={toggleSelectVisible}>
            <Text style={styles.selectionText}>{selectedCount} selected</Text>
            <Text style={styles.selectAllText}>{allVisibleSelected ? "Deselect visible" : "Select all visible"}</Text>
          </Pressable>
          <View style={styles.selectionActions}>
            <AppButton
              label="Mark read"
              variant="outline"
              size="sm"
              icon={<Check size={16} color={colors.primary} />}
              onPress={handleMarkSelectedRead}
              fullWidth={false}
              style={styles.barButton}
            />
            <AppButton
              label="Delete"
              variant="danger"
              size="sm"
              icon={<Trash2 size={16} color={colors.error} />}
              onPress={() => setConfirmDeleteVisible(true)}
              fullWidth={false}
              style={styles.barButton}
            />
          </View>
        </View>
      ) : null}

      <ConfirmActionModal
        visible={confirmDeleteVisible}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? "notification" : "notifications"}?`}
        message="Selected notifications will be removed from this device. This does not delete diagnostic history."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDeleteVisible(false)}
        onConfirm={handleDeleteSelected}
      />
    </View>
  )
}
