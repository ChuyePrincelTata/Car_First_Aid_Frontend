import { Platform } from "react-native"

// Cloud backend URL - UPDATE THIS after Render deployment
const CLOUD_BACKEND_URL = "https://your-app-name.onrender.com/api"

// Timeouts (longer for mobile networks)
const HEALTH_CHECK_TIMEOUT = 15000 // 15 seconds for mobile networks
const API_TIMEOUT = 30000 // 30 seconds for mobile API calls

/**
 * Returns the API base URL with /api path
 */
export const getApiBaseUrl = (): string => {
  // Always try cloud backend first if it's configured
  if (CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api") {
    return CLOUD_BACKEND_URL
  }

  // Fallback to local development only
  if (Platform.OS === "android") {
    // For Android emulator during development
    return `http://10.0.2.2:8000/api`
  }

  if (Platform.OS === "ios") {
    // For iOS simulator during development
    return "http://localhost:8000/api"
  }

  // Default fallback
  return "http://localhost:8000/api"
}

/**
 * Returns the base URL without the /api path
 */
export const getBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl()
  return apiUrl.replace("/api", "")
}

/**
 * Tests if a connection to the given URL is possible
 */
export const testConnection = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

    const response = await fetch(`${url}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error("Connection test failed:", error)
    return false
  }
}

/**
 * Tests multiple possible backend URLs and returns the first one that works
 */
export const findWorkingConnection = async (): Promise<string | null> => {
  const possibleUrls: string[] = []

  // Try cloud backend first (this is what we want for mobile)
  if (CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api") {
    possibleUrls.push(CLOUD_BACKEND_URL)
  }

  // Fallback to local development URLs (only for development)
  if (Platform.OS === "android") {
    possibleUrls.push("http://10.0.2.2:8000/api")
  } else if (Platform.OS === "ios") {
    possibleUrls.push("http://localhost:8000/api")
  }

  for (const url of possibleUrls) {
    console.log(`Testing connection to ${url}...`)
    try {
      const isConnected = await testConnection(url)
      if (isConnected) {
        console.log(`Connection successful to ${url}`)
        return url
      }
    } catch (error) {
      console.log(`Connection failed to ${url}: ${error}`)
    }
  }

  console.error("Could not connect to any backend URL")
  return null
}

/**
 * Makes a fetch request with timeout (optimized for mobile)
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT,
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Returns environment information for debugging
 */
export const getEnvironmentInfo = (): string => {
  return `Platform: ${Platform.OS}
API URL: ${getApiBaseUrl()}
Base URL: ${getBaseUrl()}
Cloud Backend: ${CLOUD_BACKEND_URL}

Status: ${CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api" ? "✅ Using Cloud Backend" : "⚠️ Using Local Development"}

Note: This is a mobile app. Cloud backend allows access from any device.`
}
