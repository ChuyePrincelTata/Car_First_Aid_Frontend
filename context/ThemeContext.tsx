

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import Colors from "@/constants/Colors"

type ThemeContextType = {
  theme: "light" | "dark"
  colors: typeof Colors.light
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemColorScheme === "dark")

  useEffect(() => {
    setIsDark(systemColorScheme === "dark")
  }, [systemColorScheme])

  const themeName: "light" | "dark" = isDark ? "dark" : "light"
  const colors = Colors[themeName]

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: themeName,
        colors,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
