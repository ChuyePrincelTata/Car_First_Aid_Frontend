

import { useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AlertCircle, Camera, Mic, Calendar, ChevronRight, History as HistoryIcon, ChevronLeft } from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import React from "react"
import { DiagnosisHistory, mockHistory } from "@/data/mockData"

export default function HistoryScreen() {
  const { colors, theme } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [history, setHistory] = useState<DiagnosisHistory[]>(mockHistory)
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all")

  const filteredHistory =
    filter === "all"
      ? history
      : filter === "unresolved"
        ? history.filter((item) => !item.resolved)
        : history.filter((item) => item.resolved)

  const toggleResolved = (id: string) => {
    setHistory((prev) => prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item)))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + 16,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    headerTop: { flexDirection: "row", alignItems: "center" },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: theme === "dark" ? colors.card : "#f1f5f9",
      alignItems: "center", justifyContent: "center",
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
    },
    filterContainer: {
      flexDirection: "row",
      marginBottom: 20,
      paddingHorizontal: 24,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 10,
    },
    activeFilter: {
      backgroundColor: colors.primary,
    },
    inactiveFilter: {
      backgroundColor: colors.card,
    },
    filterButtonText: {
      fontFamily: "Poppins-Medium",
      fontSize: 14,
    },
    activeFilterText: {
      color: colors.secondary,
    },
    inactiveFilterText: {
      color: colors.text,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 16,
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    typeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 215, 0, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    historyInfo: {
      flex: 1,
    },
    historyIssue: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    historyDate: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      marginLeft: 4,
    },
    severityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: 8,
    },
    severityText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: "#000",
    },
    resolvedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: colors.success,
    },
    unresolvedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resolvedText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: "#fff",
    },
    unresolvedText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    toggleButton: {
      marginTop: 16,
      alignSelf: "flex-end",
    },
    toggleText: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
    },
  })

  const renderHistoryItem = ({ item }: { item: DiagnosisHistory }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => router.push({ pathname: "/(tabs)/history", params: { id: item.id } })}
    >
      <View style={styles.historyHeader}>
        <View style={styles.typeIcon}>
          {item.type === "image" ? (
            <Camera size={20} color={colors.primary} />
          ) : item.type === "sound" ? (
            <Mic size={20} color={colors.primary} />
          ) : (
            <AlertCircle size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyIssue}>{item.issue}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={colors.tabIconDefault} />
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.tabIconDefault} />
      </View>

      <View style={styles.severityContainer}>
        <View
          style={[
            styles.severityBadge,
            {
              backgroundColor:
                item.severity === "High"
                  ? "rgba(229, 57, 53, 0.2)"
                  : item.severity === "Medium"
                    ? "rgba(255, 193, 7, 0.2)"
                    : "rgba(76, 175, 80, 0.2)",
            },
          ]}
        >
          <Text
            style={[
              styles.severityText,
              {
                color: item.severity === "High" ? "#e53935" : item.severity === "Medium" ? "#FFC107" : "#4CAF50",
              },
            ]}
          >
            {item.severity} Severity
          </Text>
        </View>

        <View style={item.resolved ? styles.resolvedBadge : styles.unresolvedBadge}>
          <Text style={item.resolved ? styles.resolvedText : styles.unresolvedText}>
            {item.resolved ? "Resolved" : "Unresolved"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleResolved(item.id)}>
        <Text style={styles.toggleText}>Mark as {item.resolved ? "Unresolved" : "Resolved"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Diagnosis History</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" ? styles.activeFilter : styles.inactiveFilter]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[styles.filterButtonText, filter === "all" ? styles.activeFilterText : styles.inactiveFilterText]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "unresolved" ? styles.activeFilter : styles.inactiveFilter]}
          onPress={() => setFilter("unresolved")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "unresolved" ? styles.activeFilterText : styles.inactiveFilterText,
            ]}
          >
            Unresolved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "resolved" ? styles.activeFilter : styles.inactiveFilter]}
          onPress={() => setFilter("resolved")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "resolved" ? styles.activeFilterText : styles.inactiveFilterText,
            ]}
          >
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <HistoryIcon size={48} color={colors.tabIconDefault} />
          <Text style={styles.emptyText}>No diagnosis history found</Text>
        </View>
      )}
    </View>
  )
}
