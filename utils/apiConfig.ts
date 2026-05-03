import { Platform } from "react-native"

// Cloud backend URL - UPDATE THIS after Render deployment
export const CLOUD_BACKEND_URL = "https://car-fault-backend.onrender.com/api"
const USE_CLOUD_BACKEND = true

// Timeouts — Render free tier cold-starts can take 50–90 seconds
const HEALTH_CHECK_TIMEOUT = 90000 // 90 seconds to survive Render cold-start
const API_TIMEOUT = 60000          // 60 seconds per API call
const HEALTH_CHECK_RETRIES = 4     // retry up to 4 times before giving up

/**
 * Returns the API base URL with /api path
 */
export const getApiBaseUrl = (): string => {
  // Always try cloud backend first if it's configured
  if (USE_CLOUD_BACKEND) {
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
 * Tests if a connection to the given URL is possible.
 * Retries up to HEALTH_CHECK_RETRIES times to handle Render cold-starts.
 */
export const testConnection = async (url: string): Promise<boolean> => {
  for (let attempt = 1; attempt <= HEALTH_CHECK_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

      console.log(`Health check attempt ${attempt}/${HEALTH_CHECK_RETRIES} for ${url}...`)

      const response = await fetch(`${url}/health`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log(`Health check succeeded on attempt ${attempt}`)
        return true
      }

      console.warn(`Health check returned status ${response.status} on attempt ${attempt}`)
    } catch (error) {
      console.warn(`Health check attempt ${attempt} failed:`, error)
    }

    // Wait 3 seconds before retrying (except on the last attempt)
    if (attempt < HEALTH_CHECK_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  console.error(`All ${HEALTH_CHECK_RETRIES} health check attempts failed for ${url}`)
  return false
}

/**
 * Tests multiple possible backend URLs and returns the first one that works
 */
export const findWorkingConnection = async (): Promise<string | null> => {
  const possibleUrls: string[] = []

  // Try cloud backend first (this is what we want for mobile)
  if (USE_CLOUD_BACKEND) {
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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData
  const defaultHeaders: Record<string, string> = isFormData
    ? { Accept: "application/json" }
    : {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
  const requestHeaders = options.headers as Record<string, string> | undefined

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...requestHeaders,
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

Status: ${USE_CLOUD_BACKEND ? "? Using Cloud Backend" : "?? Using Local Development"}

Note: This is a mobile app. Cloud backend allows access from any device.`
}
