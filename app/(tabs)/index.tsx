import { useState } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ImageBackground } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Camera, Mic, MessageSquare, AlertTriangle, ArrowRight, Star } from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import React from "react"
import { FontFamily } from "@/constants/Theme"
import AppButton from "@/components/AppButton"

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
      paddingBottom: 0, // Reduced from 8 to tighten gap
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
      marginTop: 8, // Reduced from 20 to bring banner closer to text
      marginHorizontal: 24,
      borderRadius: 16,
      overflow: "hidden",
      height: 180,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },
    bannerContent: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)", // Simple overlay to make text readable
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
          <ImageBackground
            source={{ uri: "https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg" }}
            style={styles.bannerImage}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Car Issues?</Text>
              <Text style={styles.bannerText}>Get instant AI-powered diagnosis for your vehicle.</Text>
              <AppButton 
                label="Diagnose Now" 
                variant="inverse" 
                size="sm" 
                icon={<ArrowRight size={14} color={colors.primary} />} 
                iconPosition="right" 
                onPress={() => router.push("/(tabs)/diagnose")} 
                fullWidth={false}
                style={{ borderRadius: 100, marginTop: 16 }}
              />
            </View>
          </ImageBackground>
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
          <AppButton 
            label="See All" 
            variant="ghost" 
            onPress={() => router.push("/(tabs)/mechanics")} 
            textStyle={styles.sectionAction}
            fullWidth={false}
          />
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
              <AppButton 
                label="Contact" 
                variant="soft" 
                size="sm" 
                onPress={() => router.push("/(tabs)/mechanics")} 
                fullWidth={false}
                style={{ borderRadius: 100 }}
              />
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
              <AppButton 
                label="Contact" 
                variant="soft" 
                size="sm" 
                onPress={() => router.push("/(tabs)/mechanics")} 
                fullWidth={false}
                style={{ borderRadius: 100 }}
              />
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  )
}
