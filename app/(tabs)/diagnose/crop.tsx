import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Check, X, RotateCw } from "@/components/SafeLucide"
import { FontFamily, FontSize } from "@/constants/Theme"
import { useTheme } from "@/context/ThemeContext"
import * as ImageManipulator from "expo-image-manipulator"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const CROP_AREA_HEIGHT = SCREEN_HEIGHT * 0.7
const MIN_CROP_SIZE = 80

export default function CropScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isDark, colors } = useTheme()
  
  const [processing, setProcessing] = useState(false)
  const [rotation, setRotation] = useState(0)
  
  // Image sizing math
  const [intrinsicSize, setIntrinsicSize] = useState({ width: 1, height: 1 })
  const decodedUri = uri ? decodeURIComponent(uri) : ""

  useEffect(() => {
    if (decodedUri) {
      Image.getSize(decodedUri, (w, h) => {
        setIntrinsicSize({ width: w, height: h })
      })
    }
  }, [decodedUri])

  // Calculate rendered dimensions of the image inside the container
  const containerRatio = SCREEN_WIDTH / CROP_AREA_HEIGHT
  const imageRatio = intrinsicSize.width / intrinsicSize.height
  
  let renderWidth = SCREEN_WIDTH
  let renderHeight = CROP_AREA_HEIGHT
  if (imageRatio > containerRatio) {
    renderWidth = SCREEN_WIDTH
    renderHeight = SCREEN_WIDTH / imageRatio
  } else {
    renderHeight = CROP_AREA_HEIGHT
    renderWidth = CROP_AREA_HEIGHT * imageRatio
  }

  // The center offsets of the image in the container
  const offsetX = (SCREEN_WIDTH - renderWidth) / 2
  const offsetY = (CROP_AREA_HEIGHT - renderHeight) / 2

  // Initial Box state - start it in the middle of the image
  const initialBoxSize = Math.min(renderWidth, renderHeight) * 0.8
  const initialBoxX = offsetX + (renderWidth - initialBoxSize) / 2
  const initialBoxY = offsetY + (renderHeight - initialBoxSize) / 2

  const boxWidth = useSharedValue(initialBoxSize)
  const boxHeight = useSharedValue(initialBoxSize)
  const savedBoxWidth = useSharedValue(initialBoxSize)
  const savedBoxHeight = useSharedValue(initialBoxSize)
  
  const translateX = useSharedValue(initialBoxX)
  const translateY = useSharedValue(initialBoxY)
  const savedTranslateX = useSharedValue(initialBoxX)
  const savedTranslateY = useSharedValue(initialBoxY)

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // --- Gestures for pushing/pulling the crop box edges --- //

  // Bottom Right corner resize
  const brResizeGesture = Gesture.Pan()
    .onStart(() => {
      savedBoxWidth.value = boxWidth.value
      savedBoxHeight.value = boxHeight.value
    })
    .onUpdate((e) => {
      const newWidth = Math.max(MIN_CROP_SIZE, savedBoxWidth.value + e.translationX)
      const newHeight = Math.max(MIN_CROP_SIZE, savedBoxHeight.value + e.translationY)
      // Constrain to right/bottom edges
      boxWidth.value = Math.min(newWidth, SCREEN_WIDTH - translateX.value - offsetX)
      boxHeight.value = Math.min(newHeight, CROP_AREA_HEIGHT - translateY.value - offsetY)
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
      const newWidth = savedBoxWidth.value - e.translationX
      const newHeight = savedBoxHeight.value - e.translationY
      
      if (newWidth > MIN_CROP_SIZE && (savedTranslateX.value + e.translationX >= offsetX)) {
        boxWidth.value = newWidth
        translateX.value = savedTranslateX.value + e.translationX
      }
      if (newHeight > MIN_CROP_SIZE && (savedTranslateY.value + e.translationY >= offsetY)) {
        boxHeight.value = newHeight
        translateY.value = savedTranslateY.value + e.translationY
      }
    })

  // Center pan (moves the whole box constraint mapped to image constraints)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((e) => {
      let newX = savedTranslateX.value + e.translationX
      let newY = savedTranslateY.value + e.translationY
      
      // Keep box inside image rendered bounds
      newX = Math.max(offsetX, Math.min(newX, offsetX + renderWidth - boxWidth.value))
      newY = Math.max(offsetY, Math.min(newY, offsetY + renderHeight - boxHeight.value))
      
      translateX.value = newX
      translateY.value = newY
    })

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
      // Scale coordinates from rendered screen pixels to intrinsic native pixels
      const scaleX = intrinsicSize.width / renderWidth
      const scaleY = intrinsicSize.height / renderHeight

      // Calculate the final bounding box relative to the image itself
      const cropX = (translateX.value - offsetX) * scaleX
      const cropY = (translateY.value - offsetY) * scaleY
      const cropW = boxWidth.value * scaleX
      const cropH = boxHeight.value * scaleY

      // Execute exactly how standard native uCrop works
      const actions: ImageManipulator.Action[] = []
      if (rotation !== 0) {
        actions.push({ rotate: rotation })
      }
      
      actions.push({
        crop: {
          originX: Math.max(0, Math.round(cropX)),
          originY: Math.max(0, Math.round(cropY)),
          width: Math.min(intrinsicSize.width, Math.round(cropW)),
          height: Math.min(intrinsicSize.height, Math.round(cropH)),
        }
      })

      const finalUri = await ImageManipulator.manipulateAsync(
        decodedUri,
        actions,
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      )
      
      router.replace({
        pathname: "/(tabs)/diagnose",
        params: { croppedUri: encodeURIComponent(finalUri.uri) }
      })

    } catch (e) {
      console.error("Cropping failed", e)
      alert("Failed to crop image mathematically.")
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

          {/* Dynamic Interactive Crop Box */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <Animated.View style={[styles.cropBoxWrapper, cropBoxStyle]}>
              <GestureDetector gesture={panGesture}>
                <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}>
                  {/* The visible crop window border */}
                  <View style={styles.cropBoxLines} />
                </Animated.View>
              </GestureDetector>
              
              {/* Corner Handles for resizing */}
              <GestureDetector gesture={tlResizeGesture}>
                <Animated.View style={[styles.cornerHandle, { top: -20, left: -20 }]} hitSlop={{top: 30, right: 30, bottom: 30, left: 30}}>
                  <View style={styles.cornerTL} />
                </Animated.View>
              </GestureDetector>
              
              <GestureDetector gesture={brResizeGesture}>
                <Animated.View style={[styles.cornerHandle, { bottom: -20, right: -20 }]} hitSlop={{top: 30, right: 30, bottom: 30, left: 30}}>
                   <View style={styles.cornerBR} />
                </Animated.View>
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
  cropArea: { height: CROP_AREA_HEIGHT, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  imageContainer: {
    width: SCREEN_WIDTH, height: "100%",
    justifyContent: "center", alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  
  // Crop Box overlays
  cropBoxWrapper: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.05)', 
  },
  cropBoxLines: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cornerHandle: {
    position: 'absolute', width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
    backgroundColor: "transparent"
  },
  cornerTL: { position: "absolute", top: 18, left: 18, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#ffffff" },
  cornerBR: { position: "absolute", bottom: 18, right: 18, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#ffffff" },
  
  toolbar: {
    flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.2)",
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
