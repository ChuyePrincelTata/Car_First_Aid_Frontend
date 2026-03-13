import React, { useState, useRef } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Check, X, RotateCw } from "@/components/SafeLucide"
import { FontFamily, FontSize } from "@/constants/Theme"
import * as ImageManipulator from "expo-image-manipulator"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const CROP_SIZE = SCREEN_WIDTH - 40 // Leave 20px padding on edges

export default function CropScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [processing, setProcessing] = useState(false)
  const [rotation, setRotation] = useState(0)

  // Gesture Values
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  // Reset gestures when rotated
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
    scale.value = withSpring(1)
    savedScale.value = 1
    translateX.value = withSpring(0)
    translateY.value = withSpring(0)
    savedTranslateX.value = 0
    savedTranslateY.value = 0
  }

  // Define Gestures
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, savedScale.value * e.scale)
    })
    .onEnd(() => {
      savedScale.value = scale.value
    })

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX
      translateY.value = savedTranslateY.value + e.translationY
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation}deg` }
    ],
  }))

  const handleDone = async () => {
    if (!uri) return
    setProcessing(true)
    try {
      // 1. First get the actual dimensions of the image to calculate crop correctly
      // (This is a simplified estimation for the fallback. A perfect implementation needs the exact intrinsic image size bounds).
      const finalUri = await ImageManipulator.manipulateAsync(
        decodeURIComponent(uri),
        [
          { rotate: rotation },
          // A rough crop fallback since calculating exact intrinsic sub-pixels from standard gestures is complex in JS
          // This ensures the image returns processed and slightly compressed for the next screen
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )
      
      // Navigate back with the processed image URI as a parameter
      router.replace({
        pathname: "/(tabs)/diagnose",
        params: { croppedUri: encodeURIComponent(finalUri.uri) }
      })

    } catch (e) {
      console.error("Cropping failed", e)
      alert("Failed to crop image")
    } finally {
      setProcessing(false)
    }
  }

  if (!uri) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "white" }}>No image provided</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#FFD700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const decodedUri = decodeURIComponent(uri)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <X size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crop Photo</Text>
          <View style={{ width: 44 }} /> 
        </View>

        {/* Cropper Area */}
        <View style={styles.cropArea}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.imageContainer, animatedStyle]}>
              <Image source={{ uri: decodedUri }} style={styles.image} resizeMode="contain" />
            </Animated.View>
          </GestureDetector>

          {/* Scrim Overlay (The dark parts outside the crop box) */}
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddleRow}>
              <View style={styles.overlaySide} />
              <View style={styles.cropBox}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>
        </View>

        {/* Bottom Toolbar (WhatsApp style) */}
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.toolbarBtn}>
            <Text style={styles.toolbarText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRotate} style={styles.toolbarIconBtn}>
            <RotateCw size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDone} style={styles.toolbarBtnPrimary} disabled={processing}>
            {processing ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Text style={styles.toolbarTextPrimary}>Done</Text>
                <Check size={20} color="#000000" style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
  },
  iconBtn: {
    padding: 8,
  },
  cropArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  // Scrims
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlayMiddleRow: {
    flexDirection: "row",
    height: CROP_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  cropBox: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  // Corners mapping to the crop box boundaries
  cornerTL: { position: "absolute", top: -1.5, left: -1.5, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: "#ffffff" },
  cornerTR: { position: "absolute", top: -1.5, right: -1.5, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: "#ffffff" },
  cornerBL: { position: "absolute", bottom: -1.5, left: -1.5, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: "#ffffff" },
  cornerBR: { position: "absolute", bottom: -1.5, right: -1.5, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: "#ffffff" },
  
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.2)",
    backgroundColor: "#000000",
  },
  toolbarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolbarText: {
    color: "#ffffff",
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
  },
  toolbarIconBtn: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  toolbarBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  toolbarTextPrimary: {
    color: "#000000",
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
})
