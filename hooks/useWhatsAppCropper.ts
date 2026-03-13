import * as ImagePicker from "expo-image-picker"
import Constants from "expo-constants"
import { useRouter } from "expo-router"

export type CropResult = {
  uri: string
  width: number
  height: number
} | null

export function useWhatsAppCropper() {
  const router = useRouter()

  const launchCropper = async (): Promise<CropResult | undefined> => {
    try {
      // 1. First pick the raw image using Expo (no cropping)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
        return undefined
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // We will handle the editing
        quality: 1,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return undefined
      }

      const originalUri = result.assets[0].uri

      // 2. Check environment: Are we in Expo Go?
      // Constants.appOwnership is "expo" when running in standard Expo Go app
      const isExpoGo = Constants.appOwnership === 'expo'

      if (isExpoGo) {
        // Fallback: Custom JS Pan/Zoom Cropper
        // We navigate to a dedicated route, passing the URI. 
        // The crop screen will handle the cropping and return the result via a global state or params.
        // For simplicity in this functional hook, we route and let the screen handle submission.
        // (Note: To strictly await a result from a screen in React Native is tricky, 
        //  so we push and rely on the crop screen to update the parent state via a context/param or replace)
        router.push({
          pathname: "/(tabs)/diagnose/crop",
          params: { uri: encodeURIComponent(originalUri) }
        })
        return undefined // The crop screen will handle the final state update
      } else {
        // Production: Native react-native-image-crop-picker
        try {
          // Dynamically require so Expo Go doesn't crash on compilation
          const ImageCropPicker = require('react-native-image-crop-picker').default
          
          const croppedImage = await ImageCropPicker.openCropper({
            path: originalUri,
            freeStyleCropEnabled: true, // "WhatsApp style" freeform
            hideBottomControls: false,
            showCropGuidelines: true,
            showCropFrame: true,
            toolbarTitle: 'Crop Photo',
            toolbarColor: '#000000',
            toolbarWidgetColor: '#ffffff',
            cropperToolbarTitle: 'Crop Photo',
            cropperActiveWidgetColor: '#FFD700', // Our primary gold color
            cropperStatusBarColor: '#000000',
          })

          return {
            uri: croppedImage.path,
            width: croppedImage.width,
            height: croppedImage.height,
          }
        } catch (nativeError) {
          console.error("Native cropper error:", nativeError)
          return undefined // User cancelled or failed
        }
      }
    } catch (e) {
      console.error("Error launching hybrid cropper:", e)
      return undefined
    }
  }

  const launchCamera = async (): Promise<CropResult | undefined> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!')
        return undefined
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // We will handle the editing
        quality: 1,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return undefined
      }

      const originalUri = result.assets[0].uri
      const isExpoGo = Constants.appOwnership === 'expo'

      if (isExpoGo) {
        router.push({
          pathname: "/(tabs)/diagnose/crop",
          params: { uri: encodeURIComponent(originalUri) }
        })
        return undefined
      } else {
        try {
          const ImageCropPicker = require('react-native-image-crop-picker').default
          const croppedImage = await ImageCropPicker.openCropper({
            path: originalUri,
            freeStyleCropEnabled: true,
            hideBottomControls: false,
            cropperActiveWidgetColor: '#FFD700',
          })
          return {
            uri: croppedImage.path,
            width: croppedImage.width,
            height: croppedImage.height,
          }
        } catch (err) {
          console.error("Native camera crop error:", err)
          return undefined
        }
      }
    } catch (e) {
      console.error("Error taking photo:", e)
      return undefined
    }
  }

  return { launchCropper, launchCamera }
}
