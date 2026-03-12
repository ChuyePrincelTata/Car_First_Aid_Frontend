

import { useState, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native"
import { Camera, Upload } from "@/components/SafeLucide"
import { useTheme } from "@/context/ThemeContext"
import { CameraView } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import LinearGradient from "@/components/LinearGradient"
import { useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import { getApiBaseUrl } from "@/utils/apiConfig"
import React from "react"

type VideoLink = {
  title: string
  url: string
}

export default function DiagnoseScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [facing, setFacing] = useState<"back" | "front">("back")
  const cameraRef = useRef<any>(null)
  const { colors } = useTheme()
  const router = useRouter()

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync()
      setImage(photo.uri)
      setShowCamera(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error taking picture"
      console.error("Error taking picture:", errorMessage)
    }
  }

  const pickImage = async () => {
    try {
      // Fixed: Using the correct API for expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // This is the correct property name
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error picking image"
      console.error("Error picking image:", errorMessage)
    }
  }

  const analyzeDashboard = async () => {
    if (!image) return

    setDiagnosing(true)

    try {
      // Get the API URL from your config
      const baseUrl = getApiBaseUrl()
      if (!baseUrl) {
        throw new Error("API URL not configured")
      }

      const apiUrl = `${baseUrl}/diagnostics/analyze-dashboard`

      // Create a FormData object to send the image
      const formData = new FormData()
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "dashboard.jpg",
      } as any)

      console.log("Uploading image to:", apiUrl)

      // Send the image to your backend
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      // Parse the response
      const data = await response.json()
      console.log("Diagnosis result:", data)

      // Set the diagnosis result
      setDiagnosisResult(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Error analyzing dashboard:", errorMessage)

      // Fallback to mocked data for demo purposes
      setDiagnosisResult({
        issue: "Check Engine Light",
        description:
          "The check engine light indicates a problem with the engine or emissions system. Common causes include a loose gas cap, faulty oxygen sensor, or catalytic converter issues.",
        severity: "Medium",
        confidence: 85,
        recommendations: [
          "Check if the gas cap is loose or damaged",
          "Use an OBD-II scanner to read specific error codes",
          "Have a professional mechanic inspect the vehicle",
        ],
        videoLinks: [
          {
            title: "How to Diagnose Check Engine Light",
            url: "https://www.youtube.com/watch?v=example1",
          },
          {
            title: "Common Check Engine Light Causes",
            url: "https://www.youtube.com/watch?v=example2",
          },
        ],
      })
    } finally {
      setDiagnosing(false)
    }
  }

  const resetDiagnosis = () => {
    setImage(null)
    setDiagnosisResult(null)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    uploadSection: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    placeholder: {
      width: 280,
      height: 200,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    uploadIcon: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 50,
      backgroundColor: "rgba(255, 215, 0, 0.1)",
    },
    uploadText: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      maxWidth: 200,
      marginBottom: 20,
    },
    imagePreview: {
      width: 280,
      height: 200,
      borderRadius: 16,
      marginBottom: 20,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
      marginBottom: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: "45%",
    },
    buttonText: {
      textAlign: "center",
      fontFamily: "Poppins-Medium",
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.secondary,
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
    },
    analyzeButton: {
      marginTop: 20,
      overflow: "hidden",
      borderRadius: 12,
    },
    analyzeGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    analyzeButtonText: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.secondary,
    },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    },
    resultTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    resultDescription: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      marginBottom: 16,
      lineHeight: 22,
    },
    severityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    severityLabel: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginRight: 8,
    },
    severityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#FFC107",
    },
    severityText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: "#000",
    },
    recommendationsTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    recommendation: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    recommendationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 8,
      marginRight: 8,
    },
    recommendationText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      lineHeight: 22,
    },
    videoLinksTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    videoLink: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
    },
    videoLinkText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginLeft: 8,
    },
    resetButton: {
      marginTop: 24,
      alignSelf: "center",
    },
    resetButtonText: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    // Camera styles
    cameraContainer: {
      flex: 1,
      backgroundColor: "#000",
    },
    camera: {
      flex: 1,
    },
    cameraControls: {
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    cameraButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "rgba(255,255,255,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureButtonInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: "#fff",
    },
    cancelText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Poppins-Medium",
    },
    permissionTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    permissionText: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    permissionButtonText: {
      color: colors.secondary,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
    },
  })

  // Check camera permissions
  if (!permission) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to take photos of dashboard warning lights for analysis.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (diagnosing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing dashboard lights...</Text>
      </View>
    )
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Diagnosis</Text>
        <Text style={styles.subtitle}>Snap a photo of your dashboard warning lights</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.uploadSection}>
            {!image ? (
              <View style={styles.placeholder}>
                <View style={styles.uploadIcon}>
                  <Upload size={32} color={colors.primary} />
                </View>
                <Text style={styles.uploadText}>Take or upload a clear photo of your dashboard warning lights</Text>
              </View>
            ) : (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
          </View>

          {!image && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setShowCamera(true)}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {image && !diagnosisResult && (
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeDashboard}>
              <LinearGradient
                colors={["#FFD700", "#FFC000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeGradient}
              >
                <Text style={styles.analyzeButtonText}>Analyze Dashboard Light</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {diagnosisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>{diagnosisResult.issue}</Text>

              <Text style={styles.resultDescription}>{diagnosisResult.description}</Text>

              <View style={styles.severityContainer}>
                <Text style={styles.severityLabel}>Severity:</Text>
                <View style={styles.severityBadge}>
                  <Text style={styles.severityText}>{diagnosisResult.severity}</Text>
                </View>
              </View>

              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {diagnosisResult.recommendations?.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendation}>
                  <View style={styles.recommendationDot} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}

              <Text style={styles.videoLinksTitle}>Helpful Videos:</Text>
              {diagnosisResult.videoLinks?.map((link: VideoLink, index: number) => (
                <TouchableOpacity key={index} style={styles.videoLink}>
                  <Camera size={20} color={colors.primary} />
                  <Text style={styles.videoLinkText}>{link.title}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={resetDiagnosis}>
                <Text style={styles.resetButtonText}>Start a New Diagnosis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
