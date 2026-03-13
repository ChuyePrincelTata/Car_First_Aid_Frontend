import * as ImagePicker from "expo-image-picker"
import Constants from "expo-constants"

export type CropResult = {
  uri: string
  width: number
  height: number
} | null

export function useWhatsAppCropper() {

  const isExpoGo = Constants.appOwnership === 'expo'

  const launchCropper = async (): Promise<CropResult | undefined> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert('Camera roll permission is required.')
        return undefined
      }

      if (isExpoGo) {
        // Expo Go fallback: use the native OS crop UI built into expo-image-picker
        // allowsEditing: true opens a fully interactive crop UI (pinch, drag, resize)
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1,
        })

        if (!result.canceled && result.assets?.length > 0) {
          return {
            uri: result.assets[0].uri,
            width: result.assets[0].width,
            height: result.assets[0].height,
          }
        }
        return undefined

      } else {
        // Production build: Native react-native-image-crop-picker
        // Dynamically required so Expo Go never tries to compile it
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        })

        if (result.canceled || !result.assets?.length) return undefined

        try {
          const ImageCropPicker = require('react-native-image-crop-picker').default
          const croppedImage = await ImageCropPicker.openCropper({
            path: result.assets[0].uri,
            freeStyleCropEnabled: true,
            hideBottomControls: false,
            showCropGuidelines: true,
            showCropFrame: true,
            toolbarTitle: 'Crop Photo',
            toolbarColor: '#000000',
            toolbarWidgetColor: '#ffffff',
            cropperActiveWidgetColor: '#FFD700',
            cropperStatusBarColor: '#000000',
          })
          return {
            uri: croppedImage.path,
            width: croppedImage.width,
            height: croppedImage.height,
          }
        } catch (e) {
          console.error("Native cropper error:", e)
          return undefined
        }
      }
    } catch (e) {
      console.error("Error launching cropper:", e)
      return undefined
    }
  }

  const launchCamera = async (): Promise<CropResult | undefined> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        alert('Camera permission is required.')
        return undefined
      }

      if (isExpoGo) {
        // Expo Go: camera + native OS crop UI
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1,
        })

        if (!result.canceled && result.assets?.length > 0) {
          return {
            uri: result.assets[0].uri,
            width: result.assets[0].width,
            height: result.assets[0].height,
          }
        }
        return undefined

      } else {
        // Production build: camera + native image-crop-picker
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        })

        if (result.canceled || !result.assets?.length) return undefined

        try {
          const ImageCropPicker = require('react-native-image-crop-picker').default
          const croppedImage = await ImageCropPicker.openCropper({
            path: result.assets[0].uri,
            freeStyleCropEnabled: true,
            hideBottomControls: false,
            cropperActiveWidgetColor: '#FFD700',
          })
          return {
            uri: croppedImage.path,
            width: croppedImage.width,
            height: croppedImage.height,
          }
        } catch (e) {
          console.error("Native camera crop error:", e)
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
