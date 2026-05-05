

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"
import { getApiBaseUrl, fetchWithTimeout, findWorkingConnection, CLOUD_BACKEND_URL } from "@/utils/apiConfig"
import * as SQLite from "expo-sqlite"
import NetInfo from "@react-native-community/netinfo"

// Will be determined dynamically
let API_BASE_URL = getApiBaseUrl()

// Initialize database with new API
let db: SQLite.SQLiteDatabase | null = null

const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("carfirstaid.db")

    // Create users table for offline authentication
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        last_synced TEXT
      );
    `)

    console.log("Users table created successfully")
  } catch (error) {
    console.error("Error creating users table:", error)
  }
}

const secureStoreWeb = {
  getItemAsync: (key: string) => {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItemAsync: (key: string, value: string) => {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  deleteItemAsync: (key: string) => {
    localStorage.removeItem(key)
    return Promise.resolve()
  },
}

const secureStore = Platform.OS === "web" ? secureStoreWeb : SecureStore

type MechanicInfo = {
  business_name?: string
  phone?: string
  specialization?: string
  experience_years?: number
  address?: string
}

type User = {
  id: number
  email: string
  name: string
  role: "user" | "mechanic"
  is_active: boolean
  created_at: string
  mechanicInfo?: MechanicInfo
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isOffline: boolean
  isInitialized: boolean
  apiUrl: string
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: "user" | "mechanic") => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<Pick<User, "name" | "email">>) => Promise<void>
  updateMechanicInfo: (info: MechanicInfo) => Promise<void>
  mechanic: {
    uploadCertificate: (certificateUri: string) => Promise<void>
    isVerified: boolean
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMechanicVerified, setIsMechanicVerified] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [apiUrl, setApiUrl] = useState(API_BASE_URL)

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected)
    })

    return () => unsubscribe()
  }, [])

  // Find a working API URL
  useEffect(() => {
    const findApi = async () => {
      try {
        const workingUrl = await findWorkingConnection()
        if (workingUrl) {
          API_BASE_URL = workingUrl
          setApiUrl(workingUrl)
          console.log(`Using API URL: ${workingUrl}`)
        }
      } catch (error) {
        console.error("Error finding working API URL:", error)
      }
    }

    findApi()
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Initialize database first
        await initDatabase()

        const storedToken = await secureStore.getItemAsync("token")
        const userJSON = await secureStore.getItemAsync("user")

        if (storedToken && userJSON) {
          setToken(storedToken)
          setUser(JSON.parse(userJSON))
        }
      } catch (error) {
        console.error("Failed to load user from storage", error)
      } finally {
        setIsInitialized(true)
      }
    }

    loadUser()
  }, [])

  // Check if user exists in local database
  const checkLocalUser = async (email: string, password: string): Promise<User | null> => {
    try {
      if (!db) {
        await initDatabase()
      }

      const result = (await db!.getFirstAsync("SELECT * FROM users WHERE email = ? AND password = ?", [
        email,
        password,
      ])) as any

      if (result) {
        return {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
          is_active: !!result.is_active,
          created_at: result.created_at,
        }
      }
      return null
    } catch (error) {
      console.error("Error checking local user:", error)
      return null
    }
  }

  // Save user to local database
  const saveLocalUser = async (user: User, password: string): Promise<void> => {
    try {
      if (!db) {
        await initDatabase()
      }

      await db!.runAsync(
        `INSERT OR REPLACE INTO users 
         (id, email, name, password, role, is_active, created_at, last_synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          password,
          user.role,
          user.is_active ? 1 : 0,
          user.created_at,
          new Date().toISOString(),
        ],
      )

      console.log("User saved locally")
    } catch (error) {
      console.error("Error saving local user:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      // If offline, try local authentication
      if (!netInfo.isConnected) {
        console.log("Device is offline, trying local authentication")
        const localUser = await checkLocalUser(email, password)

        if (localUser) {
          console.log("Local authentication successful")
          setUser(localUser)

          // Generate a temporary offline token
          const offlineToken = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
          setToken(offlineToken)

          await secureStore.setItemAsync("token", offlineToken)
          await secureStore.setItemAsync("user", JSON.stringify(localUser))

          return
        } else {
          throw new Error("Cannot authenticate while offline. No matching local account found.")
        }
      }

      // Online authentication — use current apiUrl, fall back to cloud URL
      const loginUrl = apiUrl || CLOUD_BACKEND_URL

      // Retry up to 3 times on timeout (AbortError) — Render DB pool warms up lazily
      const MAX_LOGIN_ATTEMPTS = 3
      let lastError: any = null

      for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
        try {
          console.log(`Attempting to sign in to ${loginUrl}/auth/login (attempt ${attempt}/${MAX_LOGIN_ATTEMPTS})`)

          const response = await fetchWithTimeout(`${loginUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            let errorDetail = "Login failed"

            console.error(`Login HTTP ${response.status}:`, errorText)

            try {
              const errorJson = JSON.parse(errorText)
              errorDetail = errorJson.detail || errorDetail
            } catch (e) {
              errorDetail = errorText || errorDetail
            }

            // Don't retry on auth errors (wrong password, etc.)
            throw new Error(errorDetail)
          }

          const data = await response.json()

          // Save to secure storage
          await secureStore.setItemAsync("token", data.access_token)
          await secureStore.setItemAsync("user", JSON.stringify(data.user))

          // Also save to local database for offline access
          await saveLocalUser(data.user, password)

          setToken(data.access_token)
          setUser(data.user)
          return // success — exit the retry loop

        } catch (error: any) {
          const isTimeout = error?.name === "AbortError" || error?.message?.includes("Aborted")

          if (isTimeout && attempt < MAX_LOGIN_ATTEMPTS) {
            console.warn(`Login attempt ${attempt} timed out, server may still be warming up. Retrying in 5s...`)
            await new Promise((resolve) => setTimeout(resolve, 5000))
            lastError = new Error("The server is starting up. Please wait a moment and try again.")
            continue
          }

          // Not a timeout, or last attempt — propagate
          lastError = error
          break
        }
      }

      throw lastError
    } catch (error: any) {
      console.error("Error signing in", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: "user" | "mechanic") => {
    setIsLoading(true)
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        throw new Error("Cannot register while offline. Please connect to the internet and try again.")
      }

      const registerUrl = apiUrl || CLOUD_BACKEND_URL
      const MAX_REGISTER_ATTEMPTS = 3
      let lastError: any = null

      for (let attempt = 1; attempt <= MAX_REGISTER_ATTEMPTS; attempt++) {
        try {
          console.log(`Attempting to register at ${registerUrl}/auth/register (attempt ${attempt}/${MAX_REGISTER_ATTEMPTS})`)

          const response = await fetchWithTimeout(`${registerUrl}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name, role }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            let errorDetail = "Registration failed"

            console.error(`Register HTTP ${response.status}:`, errorText)

            try {
              const errorJson = JSON.parse(errorText)
              errorDetail = errorJson.detail || errorDetail
            } catch (e) {
              errorDetail = errorText || errorDetail
            }

            // Don't retry on server-side validation errors
            throw new Error(errorDetail)
          }

          const data = await response.json()

          // Save to secure storage
          await secureStore.setItemAsync("token", data.access_token)
          await secureStore.setItemAsync("user", JSON.stringify(data.user))

          // Also save to local database for offline access
          await saveLocalUser(data.user, password)

          setToken(data.access_token)
          setUser(data.user)
          return // success

        } catch (error: any) {
          const isTimeout = error?.name === "AbortError" || error?.message?.includes("Aborted")

          if (isTimeout && attempt < MAX_REGISTER_ATTEMPTS) {
            console.warn(`Register attempt ${attempt} timed out. Retrying in 5s...`)
            await new Promise((resolve) => setTimeout(resolve, 5000))
            lastError = new Error("The server is starting up. Please wait a moment and try again.")
            continue
          }

          lastError = error
          break
        }
      }

      throw lastError
    } catch (error: any) {
      console.error("Error signing up", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateMechanicInfo = async (info: MechanicInfo) => {
    if (!user || user.role !== "mechanic") return

    try {
      const updatedUser = { ...user, mechanicInfo: info }
      setUser(updatedUser)
      await secureStore.setItemAsync("user", JSON.stringify(updatedUser))

      if (!token) return

      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        console.warn("Mechanic profile saved locally while offline. Remote sync skipped.")
        return
      }

      const response = await fetchWithTimeout(`${apiUrl}/mechanics/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(info),
      })

      if (!response.ok) {
        console.warn("Mechanic profile saved locally, but remote sync failed.")
      }
    } catch (error) {
      console.error("Error updating mechanic info", error)
    }
  }

  const updateProfile = async (profile: Partial<Pick<User, "name" | "email">>) => {
    if (!user) return

    const updatedUser = {
      ...user,
      ...profile,
      name: profile.name?.trim() || user.name,
      email: profile.email?.trim() || user.email,
    }

    setUser(updatedUser)
    await secureStore.setItemAsync("user", JSON.stringify(updatedUser))
  }

  const signOut = async () => {
    try {
      await secureStore.deleteItemAsync("token")
      await secureStore.deleteItemAsync("user")
      setUser(null)
      setToken(null)
    } catch (error) {
      console.error("Error signing out", error)
      throw error
    }
  }

  const uploadCertificate = async (certificateUri: string) => {
    if (!token) throw new Error("Not authenticated")

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        throw new Error("Cannot upload certificate while offline. Please connect to the internet and try again.")
      }

      const formData = new FormData()
      formData.append("file", {
        uri: certificateUri,
        type: "image/jpeg",
        name: "certificate.jpg",
      } as any)

      const response = await fetchWithTimeout(`${apiUrl}/mechanics/upload-certificate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload certificate")
      }

      setIsMechanicVerified(true)
    } catch (error) {
      console.error("Error uploading certificate", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isOffline,
        isInitialized,
        apiUrl,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateMechanicInfo,
        mechanic: {
          uploadCertificate,
          isVerified: isMechanicVerified,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
