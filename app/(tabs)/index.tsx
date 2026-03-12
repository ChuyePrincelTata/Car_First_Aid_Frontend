import { useState } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Camera, Mic, MessageSquare, AlertTriangle, ArrowRight, Star } from "@/components/SafeLucide"
import LinearGradient from "@/components/LinearGradient"
import { useRouter } from "expo-router"
import React from "react"
import { FontFamily } from "@/constants/Theme"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const { colors, isDark } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 16,
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    greeting: {
      fontSize: 14,
      color: colors.tabIconDefault,
      fontFamily: FontFamily.medium,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    userName: {
      fontSize: 26,
      fontFamily: FontFamily.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    bannerContainer: {
      marginTop: 16,
      marginHorizontal: 24,
      borderRadius: 24,
      overflow: "hidden",
      height: 180,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    bannerGradient: {
      flex: 1,
      padding: 24,
      justifyContent: "space-between",
    },
    bannerTitle: {
      fontSize: 28,
      fontFamily: FontFamily.bold,
      color: "#ffffff",
      lineHeight: 34,
    },
    bannerText: {
      fontSize: 14,
      fontFamily: FontFamily.medium,
      color: "rgba(255, 255, 255, 0.8)",
      marginTop: 8,
      maxWidth: "70%",
    },
    bannerButton: {
      backgroundColor: "#ffffff",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 100,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    bannerButtonText: {
      color: colors.primary,
      fontFamily: FontFamily.semiBold,
      fontSize: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 32,
      marginBottom: 16,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
    },
    sectionAction: {
      fontSize: 13,
      fontFamily: FontFamily.medium,
      color: colors.tabIconDefault,
    },
    gridContainer: {
      paddingHorizontal: 16, // So margins add up to 24 (16+8)
    },
    gridRow: {
      flexDirection: "row",
      marginBottom: 16,
    },
    gridTile: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginHorizontal: 8, // Half of 16
      height: 130, // Much more compact than 200px
      justifyContent: "space-between",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? colors.border : "transparent",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    tileIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: isDark ? colors.primary + "15" : colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
    },
    tileTitle: {
      fontSize: 15,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
      marginTop: 12,
    },
    tileDesc: {
      fontSize: 11,
      fontFamily: FontFamily.medium,
      color: colors.tabIconDefault,
      marginTop: 4,
    },
    carouselContainer: {
      paddingLeft: 24,
      paddingRight: 8, // Let the last item clip nicely
      paddingBottom: 40,
    },
    mechanicCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginRight: 16,
      width: width * 0.65, // Shows 1.5 cards on screen
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? colors.border : "transparent",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    mechanicHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    mechanicAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    mechanicName: {
      fontSize: 15,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
    },
    mechanicRole: {
      fontSize: 12,
      fontFamily: FontFamily.regular,
      color: colors.tabIconDefault,
      marginTop: 2,
    },
    mechanicFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    mechanicRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingNum: {
      fontSize: 13,
      fontFamily: FontFamily.semiBold,
      color: colors.text,
    },
    contactBtn: {
      backgroundColor: isDark ? colors.primary + "20" : colors.primary + "15",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 100,
    },
    contactBtnTxt: {
      fontSize: 12,
      fontFamily: FontFamily.semiBold,
      color: colors.primary,
    },
  })

  // Dynamic gradient based on theme (Dark Navy -> Muted Gold accent)
  const bannerColors = isDark 
    ? ["#0A0F1C", "#1A2235"] // Deep navy gradient
    : [colors.primary, "#002B5C"] // Distinct identity for light mode

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good to see you</Text>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
        </View>

        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient colors={bannerColors} style={styles.bannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View>
              <Text style={styles.bannerTitle}>Car Issues?</Text>
              <Text style={styles.bannerText}>Get instant AI-powered diagnosis for your vehicle.</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton} onPress={() => router.push("/(tabs)/diagnose")}>
              <Text style={styles.bannerButtonText}>Diagnose Now</Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Diagnostic Action Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Diagnosis Tools</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <TouchableOpacity style={styles.gridTile} onPress={() => router.push("/(tabs)/diagnose")}>
              <View style={styles.tileIconWrap}>
                <Camera size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.tileTitle}>Scanner</Text>
                <Text style={styles.tileDesc}>Dashboards & parts</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridTile} onPress={() => router.push("/(tabs)/diagnose/sound")}>
              <View style={styles.tileIconWrap}>
                <Mic size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.tileTitle}>Audio</Text>
                <Text style={styles.tileDesc}>Engine noises</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            <TouchableOpacity style={styles.gridTile} onPress={() => router.push("/(tabs)/mechanics")}>
              <View style={styles.tileIconWrap}>
                <MessageSquare size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.tileTitle}>Mechanics</Text>
                <Text style={styles.tileDesc}>Ask a professional</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridTile} onPress={() => router.push("./(tabs)/diagnose/manual")}>
              <View style={styles.tileIconWrap}>
                <AlertTriangle size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.tileTitle}>Manual</Text>
                <Text style={styles.tileDesc}>Text description</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Mechanics Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Mechanics</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/mechanics")}>
            <Text style={styles.sectionAction}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          <View style={styles.mechanicCard}>
            <View style={styles.mechanicHeader}>
              <Image source={{ uri: "https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg" }} style={styles.mechanicAvatar} />
              <View>
                <Text style={styles.mechanicName}>John Smith</Text>
                <Text style={styles.mechanicRole}>Engine Specialist</Text>
              </View>
            </View>
            <View style={styles.mechanicFooter}>
              <View style={styles.mechanicRating}>
                <Star size={14} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingNum}>4.8</Text>
              </View>
              <TouchableOpacity style={styles.contactBtn} onPress={() => router.push("/(tabs)/mechanics")}>
                <Text style={styles.contactBtnTxt}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mechanicCard}>
            <View style={styles.mechanicHeader}>
              <Image source={{ uri: "https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg" }} style={styles.mechanicAvatar} />
              <View>
                <Text style={styles.mechanicName}>Sarah Johnson</Text>
                <Text style={styles.mechanicRole}>Electrical Systems</Text>
              </View>
            </View>
            <View style={styles.mechanicFooter}>
              <View style={styles.mechanicRating}>
                <Star size={14} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingNum}>4.9</Text>
              </View>
              <TouchableOpacity style={styles.contactBtn} onPress={() => router.push("/(tabs)/mechanics")}>
                <Text style={styles.contactBtnTxt}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  )
}
