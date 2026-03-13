

import { useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Search, Star, MapPin, MessageSquare, CheckCircle, ChevronLeft } from "@/components/SafeLucide"
import { useRouter } from "expo-router"
import React from "react"
import { Mechanic, mockMechanics } from "@/data/mockData"

export default function MechanicsScreen() {
  const { colors, theme } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState("")
  const [mechanics, setMechanics] = useState(mockMechanics)

  const filteredMechanics = searchQuery
    ? mechanics.filter(
        (mechanic) =>
          mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mechanic.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mechanic.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mechanics

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + 16,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: theme === "dark" ? colors.card : "#f1f5f9",
      alignItems: "center", justifyContent: "center",
      marginRight: 12,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
    },
    searchContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: "Poppins-Regular",
      height: 48,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    mechanicCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    mechanicHeader: {
      flexDirection: "row",
      padding: 16,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginRight: 16,
    },
    mechanicInfo: {
      flex: 1,
      justifyContent: "center",
    },
    mechanicName: {
      fontSize: 18,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 2,
    },
    mechanicSpecialty: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
    },
    mechanicExperience: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    rating: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginLeft: 4,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    location: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      marginLeft: 8,
      flex: 1,
    },
    buttonsContainer: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cardButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    buttonText: {
      marginLeft: 8,
      fontFamily: "Poppins-Medium",
      fontSize: 14,
      color: colors.text,
    },
    verifiedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    verifiedText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Poppins-Medium",
      marginLeft: 4,
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 16,
    },
  })

  const renderMechanicItem = ({ item }: { item: Mechanic }) => (
    <View style={styles.mechanicCard}>
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={12} color="#fff" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <View style={styles.mechanicHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.mechanicInfo}>
          <Text style={styles.mechanicName}>{item.name}</Text>
          <Text style={styles.mechanicSpecialty}>{item.specialty}</Text>
          <Text style={styles.mechanicExperience}>{item.experience}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.primary} fill={colors.primary} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <MapPin size={16} color={colors.tabIconDefault} />
        <Text style={styles.location}>{item.location}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics", params: { id: item.id } })}
        >
          <Search size={18} color={colors.text} />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics", params: { id: item.id } })}
        >
          <MessageSquare size={18} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.primary }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Find a Mechanic</Text>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, specialty or location"
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredMechanics.length > 0 ? (
        <FlatList
          data={filteredMechanics}
          keyExtractor={(item) => item.id}
          renderItem={renderMechanicItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Search size={48} color={colors.tabIconDefault} />
          <Text style={styles.emptyText}>No mechanics found matching "{searchQuery}"</Text>
        </View>
      )}
    </View>
  )
}
