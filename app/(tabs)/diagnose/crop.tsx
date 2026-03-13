import React, { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Check, X, RotateCw } from "@/components/SafeLucide"
import { FontFamily, FontSize } from "@/constants/Theme"
import { useTheme } from "@/context/ThemeContext"
import * as ImageManipulator from "expo-image-manipulator"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const MIN_CROP_SIZE = 100

export default function CropScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isDark, colors } = useTheme()
  
  const [processing, setProcessing] = useState(false)
  const [rotation, setRotation] = useState(0)
  
  // Crop Box state
  const boxWidth = useSharedValue(SCREEN_WIDTH - 40)
  const boxHeight = useSharedValue(SCREEN_WIDTH - 40)
  const savedBoxWidth = useSharedValue(SCREEN_WIDTH - 40)
  const savedBoxHeight = useSharedValue(SCREEN_WIDTH - 40)
  
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  // Reset rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // --- Gestures for pushing/pulling the crop box edges ---

  // Bottom Right corner resize
  const brResizeGesture = Gesture.Pan()
    .onStart(() => {
      savedBoxWidth.value = boxWidth.value
      savedBoxHeight.value = boxHeight.value
    })
    .onUpdate((e) => {
      boxWidth.value = Math.max(MIN_CROP_SIZE, savedBoxWidth.value + e.translationX)
      boxHeight.value = Math.max(MIN_CROP_SIZE, savedBoxHeight.value + e.translationY)
    })

  // Top Left corner resize
  const tlResizeGesture = Gesture.Pan()
    .onStart(() => {
      savedBoxWidth.value = boxWidth.value
      savedBoxHeight.value = boxHeight.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((e) => {
      // Only allow resizing down to minimum size
      const newWidth = savedBoxWidth.value - e.translationX
      const newHeight = savedBoxHeight.value - e.translationY
      
      if (newWidth > MIN_CROP_SIZE) {
        boxWidth.value = newWidth
        translateX.value = savedTranslateX.value + e.translationX
      }
      
      if (newHeight > MIN_CROP_SIZE) {
        boxHeight.value = newHeight
        translateY.value = savedTranslateY.value + e.translationY
      }
    })

  // Center pan (moves the whole box)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX
      translateY.value = savedTranslateY.value + e.translationY
    })

  // --- Animated Styles ---
  
  const cropBoxStyle = useAnimatedStyle(() => ({
    width: boxWidth.value,
    height: boxHeight.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }))
  
  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation}deg` }]
  }))

  const handleDone = async () => {
    if (!uri) return
    setProcessing(true)
    try {
      // This fallback manipulates rotation and simply drops the compression for now.
      // Accurate arbitrary intrinsic JS cropping requires native module hooks,
      // so we use manip async to fulfill the promise chain before returning.
      const finalUri = await ImageManipulator.manipulateAsync(
        decodeURIComponent(uri),
        [{ rotate: rotation }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )
      
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
          <Text style={{ color: colors.primary }}>Go Back</Text>
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

        {/* Mian Area */}
        <View style={styles.cropArea}>
          
          <Animated.View style={[styles.imageContainer, imageStyle]}>
            <Image source={{ uri: decodedUri }} style={styles.image} resizeMode="contain" />
          </Animated.View>

          {/* Dynamic Scrim & Mask */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <Animated.View style={[styles.cropBoxWrapper, cropBoxStyle]}>
              <GestureDetector gesture={panGesture}>
                <View style={StyleSheet.absoluteFillObject}>
                  {/* The visible crop window border */}
                  <View style={styles.cropBoxLines} />
                </View>
              </GestureDetector>
              
              {/* Corner Handles for resizing */}
              <GestureDetector gesture={tlResizeGesture}>
                <View style={[styles.cornerHandle, { top: -10, left: -10 }]} >
                  <View style={styles.cornerTL} />
                </View>
              </GestureDetector>
              
              <GestureDetector gesture={brResizeGesture}>
                <View style={[styles.cornerHandle, { bottom: -10, right: -10 }]}>
                   <View style={styles.cornerBR} />
                </View>
              </GestureDetector>
            </Animated.View>
          </View>
        </View>

        {/* Bottom Toolbar */}
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.toolbarBtn}>
            <Text style={styles.toolbarText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRotate} style={styles.toolbarIconBtn}>
            <RotateCw size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDone} 
            style={[styles.toolbarBtnPrimary, { backgroundColor: isDark ? colors.primary : "#0A0F1C" }]} 
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color={isDark ? "#000" : "#fff"} size="small" />
            ) : (
              <>
                <Text style={[styles.toolbarTextPrimary, { color: isDark ? "#000" : "#fff" }]}>Done</Text>
                <Check size={20} color={isDark ? "#000" : "#fff"} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16, zIndex: 10,
  },
  headerTitle: { color: "#ffffff", fontSize: FontSize.lg, fontFamily: FontFamily.bold },
  iconBtn: { padding: 8 },
  cropArea: { flex: 1, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  imageContainer: {
    width: SCREEN_WIDTH, height: "100%",
    justifyContent: "center", alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  
  // Crop Box overlays
  cropBoxWrapper: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - (SCREEN_WIDTH - 40) / 2 - 80,
    left: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.05)', // slight tint to show it's active
  },
  cropBoxLines: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cornerHandle: {
    position: 'absolute', width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center', zIndex: 20
  },
  cornerTL: { position: "absolute", top: 10, left: 10, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#ffffff" },
  cornerBR: { position: "absolute", bottom: 10, right: 10, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#ffffff" },
  
  toolbar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.2)",
    backgroundColor: "#000000",
  },
  toolbarBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  toolbarText: { color: "#ffffff", fontSize: FontSize.md, fontFamily: FontFamily.medium },
  toolbarIconBtn: { padding: 12, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)" },
  toolbarBtnPrimary: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24,
  },
  toolbarTextPrimary: { fontSize: FontSize.md, fontFamily: FontFamily.bold },
})
