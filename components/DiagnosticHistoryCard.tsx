import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AppButton from "@/components/AppButton"
import { Calendar, Camera, Check, ChevronRight, FileText, Mic } from "@/components/SafeLucide"
import { FontFamily } from "@/constants/Theme"
import type { Diagnostic, DiagnosticResult } from "@/context/DiagnosticsContext"
import type Colors from "@/constants/Colors"

type Props = {
  diagnostic: Diagnostic
  colors: typeof Colors.light
  onPress: () => void
  onLongPress?: () => void
  onToggleResolved: () => void
  selected?: boolean
  selectionMode?: boolean
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getSeverityColor = (severity?: DiagnosticResult["severity"]) => {
  if (severity === "high") return "#e53935"
  if (severity === "medium") return "#f59e0b"
  return "#22c55e"
}

const getTypeIcon = (diagnostic: Diagnostic, color: string) => {
  if (diagnostic.type === "dashboard") return <Camera size={20} color={color} />
  if (diagnostic.type === "engine" || diagnostic.type === "sound") return <Mic size={20} color={color} />
  return <FileText size={20} color={color} />
}

export default function DiagnosticHistoryCard({
  diagnostic,
  colors,
  onPress,
  onLongPress,
  onToggleResolved,
  selected = false,
  selectionMode = false,
}: Props) {
  const resolved = Boolean(diagnostic.resolved)
  const severity = diagnostic.result?.severity ?? "low"
  const issue = diagnostic.result?.issue ?? diagnostic.title

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : "transparent",
          shadowColor: colors.text,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.header}>
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
          <View style={[styles.typeIcon, { backgroundColor: colors.primary + "1A" }]}>
            {getTypeIcon(diagnostic, colors.primary)}
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.issue, { color: colors.text }]} numberOfLines={2}>
            {issue}
          </Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={colors.tabIconDefault} />
            <Text style={[styles.date, { color: colors.tabIconDefault }]}>{formatDate(diagnostic.date)}</Text>
          </View>
        </View>

        {!selectionMode ? <ChevronRight size={20} color={colors.tabIconDefault} /> : null}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: getSeverityColor(severity) }]}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            resolved
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: "transparent", borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statusText, { color: resolved ? colors.buttonText : colors.text }]}>
            {resolved ? "Resolved" : "Unresolved"}
          </Text>
        </View>
      </View>

      {!selectionMode ? (
        <AppButton
          label={`Mark as ${resolved ? "Unresolved" : "Resolved"}`}
          variant="ghost"
          onPress={onToggleResolved}
          textStyle={{ ...styles.toggleText, color: colors.primary }}
          fullWidth={false}
          style={styles.toggleButton}
        />
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  issue: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  toggleButton: {
    marginTop: 16,
    alignSelf: "flex-end",
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
})
