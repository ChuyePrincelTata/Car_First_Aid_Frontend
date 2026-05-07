import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Platform } from "react-native"
import * as FileSystem from "expo-file-system/legacy"

export type AnalyticsEvent = {
  id: string
  name: string
  timestamp: string
  properties?: Record<string, string | number | boolean>
}

type AnalyticsContextType = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  events: AnalyticsEvent[]
  totalEvents: number
  lastEvent: AnalyticsEvent | null
  topEvents: Array<{ name: string; count: number }>
  track: (name: string, properties?: AnalyticsEvent["properties"]) => void
  clearAnalytics: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)
const ANALYTICS_KEY = "car_first_aid_analytics"
const ANALYTICS_FILE_URI = `${FileSystem.documentDirectory ?? ""}analytics-events.json`
const MAX_EVENTS = 250

type StoredAnalytics = {
  enabled: boolean
  events: AnalyticsEvent[]
}

const analyticsStorage = {
  read: async (): Promise<StoredAnalytics | null> => {
    try {
      if (Platform.OS === "web") {
        const stored = localStorage.getItem(ANALYTICS_KEY)
        return stored ? JSON.parse(stored) : null
      }

      if (!FileSystem.documentDirectory) return null
      const info = await FileSystem.getInfoAsync(ANALYTICS_FILE_URI)
      if (!info.exists) return null

      return JSON.parse(await FileSystem.readAsStringAsync(ANALYTICS_FILE_URI))
    } catch (error) {
      console.warn("Failed to read analytics:", error)
      return null
    }
  },
  write: async (value: StoredAnalytics) => {
    try {
      const serialized = JSON.stringify(value)

      if (Platform.OS === "web") {
        localStorage.setItem(ANALYTICS_KEY, serialized)
        return
      }

      if (!FileSystem.documentDirectory) return
      await FileSystem.writeAsStringAsync(ANALYTICS_FILE_URI, serialized)
    } catch (error) {
      console.warn("Failed to save analytics:", error)
    }
  },
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false)
  const [enabled, setEnabledState] = useState(true)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    analyticsStorage.read().then((stored) => {
      if (stored) {
        setEnabledState(stored.enabled)
        setEvents(stored.events ?? [])
      }
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    analyticsStorage.write({ enabled, events })
  }, [enabled, events, loaded])

  const setEnabled = (value: boolean) => {
    setEnabledState(value)
    if (value) {
      setEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: "analytics_enabled",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, MAX_EVENTS))
    }
  }

  const track = (name: string, properties?: AnalyticsEvent["properties"]) => {
    if (!enabled) return

    setEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        timestamp: new Date().toISOString(),
        properties,
      },
      ...prev,
    ].slice(0, MAX_EVENTS))
  }

  const topEvents = useMemo(() => {
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.name] = (acc[event.name] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [events])

  const value: AnalyticsContextType = {
    enabled,
    setEnabled,
    events,
    totalEvents: events.length,
    lastEvent: events[0] ?? null,
    topEvents,
    track,
    clearAnalytics: () => setEvents([]),
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
