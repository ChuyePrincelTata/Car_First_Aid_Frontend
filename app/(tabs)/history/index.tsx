import React, { useMemo, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppButton from "@/components/AppButton"
import ConfirmActionModal from "@/components/ConfirmActionModal"
import DiagnosticHistoryCard from "@/components/DiagnosticHistoryCard"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import { History as HistoryIcon, Trash2, X } from "@/components/SafeLucide"
import { FontFamily, Spacing } from "@/constants/Theme"
import { useDiagnosticsContext, type Diagnostic } from "@/context/DiagnosticsContext"
import { useTheme } from "@/context/ThemeContext"

export default function HistoryScreen() {
  const { colors, isDark } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { history, toggleDiagnosticResolved, deleteDiagnostic } = useDiagnosticsContext()
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all")
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmVisible, setConfirmVisible] = useState(false)

  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => {
      if (Boolean(a.resolved) !== Boolean(b.resolved)) return a.resolved ? 1 : -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    if (filter === "unresolved") return sorted.filter((item) => !item.resolved)
    if (filter === "resolved") return sorted.filter((item) => item.resolved)
    return sorted
  }, [filter, history])

  const selectedCount = selectedIds.length
  const allVisibleSelected = filteredHistory.length > 0 && filteredHistory.every((item) => selectedIds.includes(item.id))

  const enterSelectionMode = (id?: string) => {
    setSelectionMode(true)
    if (id) setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds([])
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredHistory.map((item) => item.id))
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)))
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredHistory.map((item) => item.id)])))
  }

  const deleteSelected = () => {
    selectedIds.forEach(deleteDiagnostic)
    setConfirmVisible(false)
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
      fontFamily: FontFamily.medium,
      fontSize: 13,
      color: colors.primary,
    },
    filterContainer: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    activeFilter: {
      backgroundColor: colors.primary,
    },
    inactiveFilter: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonText: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
    },
    activeFilterText: {
      color: colors.buttonText,
    },
    inactiveFilterText: {
      color: colors.text,
    },
    listContainer: {
      paddingHorizontal: 16,
    },
    listFooter: {
      paddingBottom: insets.bottom + (selectedCount > 0 ? 104 : 20),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: FontFamily.medium,
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 13,
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },
    selectionBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: insets.bottom + 12,
      flexDirection: "row",
      alignItems: "center",
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
      flex: 1,
    },
    selectionText: {
      fontFamily: FontFamily.bold,
      fontSize: 14,
      color: colors.text,
    },
    selectAllText: {
      fontFamily: FontFamily.medium,
      fontSize: 13,
      color: colors.primary,
      marginTop: 2,
    },
    deleteButton: {
      minWidth: 128,
    },
  })

  const renderFilterButton = (value: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value ? styles.activeFilter : styles.inactiveFilter]}
      onPress={() => {
        setFilter(value)
        exitSelectionMode()
      }}
    >
      <Text style={[styles.filterButtonText, filter === value ? styles.activeFilterText : styles.inactiveFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  )

  const renderHistoryItem = ({ item }: { item: Diagnostic }) => (
    <DiagnosticHistoryCard
      diagnostic={item}
      colors={colors}
      selectionMode={selectionMode}
      selected={selectedIds.includes(item.id)}
      onPress={() => {
        if (selectionMode) {
          toggleSelected(item.id)
          return
        }

        router.push({ pathname: "/(tabs)/history/[id]", params: { id: item.id } })
      }}
      onLongPress={() => enterSelectionMode(item.id)}
      onToggleResolved={() => toggleDiagnosticResolved(item.id)}
    />
  )

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={selectionMode ? `${selectedCount} selected` : "Diagnosis History"}
        onBack={() => (selectionMode ? exitSelectionMode() : router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        right={
          history.length > 0 ? (
            selectionMode ? (
              <Pressable style={styles.headerAction} onPress={exitSelectionMode}>
                <X size={20} color={colors.text} />
              </Pressable>
            ) : (
              <Pressable style={styles.headerAction} onPress={() => enterSelectionMode()}>
                <Text style={styles.headerActionText}>Select</Text>
              </Pressable>
            )
          ) : null
        }
      />

      {history.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          ListHeaderComponent={
            <View style={styles.filterContainer}>
              {renderFilterButton("all", "All")}
              {renderFilterButton("unresolved", "Unresolved")}
              {renderFilterButton("resolved", "Resolved")}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <HistoryIcon size={48} color={colors.tabIconDefault} />
              <Text style={styles.emptyText}>No {filter} diagnosis history found</Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: insets.top + SCREEN_HEADER_H + 16 },
            styles.listFooter,
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={[styles.emptyContainer, { paddingTop: insets.top + SCREEN_HEADER_H + 16 }]}>
          <HistoryIcon size={48} color={colors.tabIconDefault} />
          <Text style={styles.emptyText}>No diagnosis history yet</Text>
          <Text style={styles.emptySubtext}>Completed dashboard, sound, and manual diagnoses will appear here.</Text>
        </View>
      )}

      {selectedCount > 0 ? (
        <View style={styles.selectionBar}>
          <Pressable style={styles.selectionSummary} onPress={toggleSelectVisible}>
            <Text style={styles.selectionText}>{selectedCount} selected</Text>
            <Text style={styles.selectAllText}>{allVisibleSelected ? "Deselect visible" : "Select all visible"}</Text>
          </Pressable>
          <AppButton
            label="Delete"
            variant="danger"
            icon={<Trash2 size={18} color={colors.error} />}
            onPress={() => setConfirmVisible(true)}
            fullWidth={false}
            style={styles.deleteButton}
          />
        </View>
      ) : null}

      <ConfirmActionModal
        visible={confirmVisible}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? "diagnosis" : "diagnoses"}?`}
        message="Selected diagnostic results will be removed from your history. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={deleteSelected}
      />
    </View>
  )
}
