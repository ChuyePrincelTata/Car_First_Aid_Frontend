import React, { useMemo, useState } from "react"
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppButton from "@/components/AppButton"
import ConfirmActionModal from "@/components/ConfirmActionModal"
import ScreenHeader, { SCREEN_HEADER_H } from "@/components/ScreenHeader"
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  Settings,
  Shield,
  Star,
  Sun,
  User as UserIcon,
  Wrench,
  X,
} from "@/components/SafeLucide"
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/Theme"
import { useAuth } from "@/context/AuthContext"
import { useNotificationsContext } from "@/context/NotificationsContext"
import { useTheme } from "@/context/ThemeContext"

type Panel = "edit" | "notifications" | "privacy" | "settings" | "help" | null

const initialsFor = (name?: string, email?: string) => {
  const source = name?.trim() || email?.trim() || "Guest User"
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, theme, isDark, toggleTheme } = useTheme()
  const { user, signOut, updateProfile, updateMechanicInfo, isOffline, mechanic } = useAuth()
  const {
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    markAllAsRead,
    clearAll,
  } = useNotificationsContext()

  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [confirmSignOutVisible, setConfirmSignOutVisible] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [dataSaver, setDataSaver] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [biometricLock, setBiometricLock] = useState(false)
  const [diagnosticSharing, setDiagnosticSharing] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  })
  const [mechanicForm, setMechanicForm] = useState({
    address: user?.mechanicInfo?.address ?? "",
    phone: user?.mechanicInfo?.phone ?? "",
    specialization: user?.mechanicInfo?.specialization ?? "",
    experience: user?.mechanicInfo?.experience_years?.toString() ?? "",
  })

  const roleLabel = user?.role === "mechanic" ? "Mechanic" : "Car Owner"
  const initials = useMemo(() => initialsFor(user?.name, user?.email), [user?.name, user?.email])

  const handleOpenPanel = (panel: Exclude<Panel, null>) => {
    setProfileForm({ name: user?.name ?? "", email: user?.email ?? "" })
    setMechanicForm({
      address: user?.mechanicInfo?.address ?? "",
      phone: user?.mechanicInfo?.phone ?? "",
      specialization: user?.mechanicInfo?.specialization ?? "",
      experience: user?.mechanicInfo?.experience_years?.toString() ?? "",
    })
    setActivePanel(panel)
  }

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      Alert.alert("Missing details", "Please enter your name and email.")
      return
    }

    setSavingProfile(true)
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      })

      if (user?.role === "mechanic") {
        await updateMechanicInfo({
          address: mechanicForm.address.trim(),
          phone: mechanicForm.phone.trim(),
          specialization: mechanicForm.specialization.trim(),
          experience_years: Number(mechanicForm.experience) || 0,
        })
      }

      setActivePanel(null)
    } catch (error) {
      Alert.alert("Could not save profile", error instanceof Error ? error.message : "Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSignOut = async () => {
    setConfirmSignOutVisible(false)
    await signOut()
    router.replace("/(auth)/Login")
  }

  const contactSupport = () => {
    Linking.openURL("mailto:support@carfirstaid.app?subject=Car%20First%20Aid%20Support").catch(() => {
      Alert.alert("Could not open email", "Please email support@carfirstaid.app directly.")
    })
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingTop: insets.top + SCREEN_HEADER_H + Spacing.md,
      paddingBottom: insets.bottom + 32,
      paddingHorizontal: Spacing.base,
    },
    hero: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: Spacing.lg,
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    avatarText: {
      color: colors.buttonText,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.xl,
    },
    heroInfo: {
      flex: 1,
    },
    name: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.xl,
      color: colors.text,
    },
    email: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      color: colors.subtext,
      marginTop: 3,
    },
    statusRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingVertical: 7,
      borderRadius: Radius.full,
      backgroundColor: colors.primary + "12",
    },
    pillText: {
      marginLeft: 6,
      color: colors.primary,
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md,
      color: colors.text,
      marginBottom: Spacing.sm,
      paddingHorizontal: 2,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.base,
      paddingVertical: 15,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.md,
      color: colors.text,
    },
    rowSubtitle: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.xs,
      color: colors.subtext,
      marginTop: 3,
    },
    dangerSection: {
      marginTop: Spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.42)",
      justifyContent: "flex-end",
    },
    panel: {
      maxHeight: "88%",
      backgroundColor: isDark ? colors.card : "#ffffff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: Spacing.md,
      paddingHorizontal: Spacing.base,
      paddingBottom: insets.bottom + Spacing.base,
    },
    panelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.md,
    },
    panelTitle: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.lg,
      color: colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    inputLabel: {
      fontFamily: FontFamily.medium,
      color: colors.text,
      fontSize: FontSize.sm,
      marginBottom: 6,
      marginTop: Spacing.sm,
    },
    input: {
      minHeight: 50,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: FontFamily.regular,
      paddingHorizontal: Spacing.md,
    },
    panelText: {
      color: colors.subtext,
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      lineHeight: 21,
      marginBottom: Spacing.md,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    settingText: {
      flex: 1,
      paddingRight: Spacing.md,
    },
    faqItem: {
      paddingVertical: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    faqQuestion: {
      fontFamily: FontFamily.bold,
      color: colors.text,
      fontSize: FontSize.sm,
      marginBottom: 4,
    },
    faqAnswer: {
      fontFamily: FontFamily.regular,
      color: colors.subtext,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
  })

  const Row = ({
    icon,
    title,
    subtitle,
    onPress,
    last,
    right,
  }: {
    icon: React.ReactNode
    title: string
    subtitle: string
    onPress?: () => void
    last?: boolean
    right?: React.ReactNode
  }) => (
    <TouchableOpacity activeOpacity={0.78} style={[styles.row, last && styles.lastRow]} onPress={onPress}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {right ?? <ChevronRight size={20} color={colors.tabIconDefault} />}
    </TouchableOpacity>
  )

  const SettingToggle = ({
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    title: string
    subtitle: string
    value: boolean
    onValueChange: (value: boolean) => void
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? colors.primary : undefined} />
    </View>
  )

  const renderPanel = () => {
    if (!activePanel) return null

    const titles: Record<Exclude<Panel, null>, string> = {
      edit: "Edit Profile",
      notifications: "Notifications",
      privacy: "Privacy & Security",
      settings: "App Settings",
      help: "Help & Support",
    }

    return (
      <Modal visible transparent animationType="slide" onRequestClose={() => setActivePanel(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{titles[activePanel]}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setActivePanel(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activePanel === "edit" && (
                <>
                  <Text style={styles.inputLabel}>Full name</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.name}
                    onChangeText={(name) => setProfileForm((prev) => ({ ...prev, name }))}
                    placeholder="Your name"
                    placeholderTextColor={colors.tabIconDefault}
                  />
                  <Text style={styles.inputLabel}>Email address</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.email}
                    onChangeText={(email) => setProfileForm((prev) => ({ ...prev, email }))}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.tabIconDefault}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {user?.role === "mechanic" && (
                    <>
                      <Text style={styles.inputLabel}>Business address</Text>
                      <TextInput
                        style={styles.input}
                        value={mechanicForm.address}
                        onChangeText={(address) => setMechanicForm((prev) => ({ ...prev, address }))}
                        placeholder="Garage or shop address"
                        placeholderTextColor={colors.tabIconDefault}
                      />
                      <Text style={styles.inputLabel}>Phone number</Text>
                      <TextInput
                        style={styles.input}
                        value={mechanicForm.phone}
                        onChangeText={(phone) => setMechanicForm((prev) => ({ ...prev, phone }))}
                        placeholder="+237..."
                        placeholderTextColor={colors.tabIconDefault}
                        keyboardType="phone-pad"
                      />
                      <Text style={styles.inputLabel}>Specialization</Text>
                      <TextInput
                        style={styles.input}
                        value={mechanicForm.specialization}
                        onChangeText={(specialization) => setMechanicForm((prev) => ({ ...prev, specialization }))}
                        placeholder="Engine, brakes, electrical..."
                        placeholderTextColor={colors.tabIconDefault}
                      />
                      <Text style={styles.inputLabel}>Years of experience</Text>
                      <TextInput
                        style={styles.input}
                        value={mechanicForm.experience}
                        onChangeText={(experience) => setMechanicForm((prev) => ({ ...prev, experience }))}
                        placeholder="5"
                        placeholderTextColor={colors.tabIconDefault}
                        keyboardType="number-pad"
                      />
                    </>
                  )}

                  <AppButton label="Save Changes" loading={savingProfile} onPress={handleSaveProfile} style={{ marginTop: Spacing.lg }} />
                </>
              )}

              {activePanel === "notifications" && (
                <>
                  <Text style={styles.panelText}>
                    Control diagnostic alerts, mechanic responses, and status reminders.
                  </Text>
                  <SettingToggle
                    title="In-app notifications"
                    subtitle={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                  <SettingToggle
                    title="Push notifications"
                    subtitle="Allow phone-level alerts when supported"
                    value={pushNotificationsEnabled}
                    onValueChange={setPushNotificationsEnabled}
                  />
                  <AppButton label="Mark All as Read" variant="outline" onPress={markAllAsRead} style={{ marginTop: Spacing.lg }} />
                  <AppButton label="Clear Notifications" variant="danger" onPress={clearAll} style={{ marginTop: Spacing.sm }} />
                </>
              )}

              {activePanel === "privacy" && (
                <>
                  <Text style={styles.panelText}>
                    These controls manage local app behavior. Server-side privacy policies can be connected when backend endpoints are ready.
                  </Text>
                  <SettingToggle
                    title="App lock"
                    subtitle="Require device-level confirmation before opening private sections"
                    value={biometricLock}
                    onValueChange={setBiometricLock}
                  />
                  <SettingToggle
                    title="Share diagnostics with mechanics"
                    subtitle="Let selected mechanics view diagnostic summaries"
                    value={diagnosticSharing}
                    onValueChange={setDiagnosticSharing}
                  />
                  <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Account security</Text>
                    <Text style={styles.faqAnswer}>
                      Your active session is stored securely on-device. Sign out if this is a shared phone.
                    </Text>
                  </View>
                </>
              )}

              {activePanel === "settings" && (
                <>
                  <SettingToggle
                    title="Dark mode"
                    subtitle={`Currently using ${theme} theme`}
                    value={theme === "dark"}
                    onValueChange={toggleTheme}
                  />
                  <SettingToggle
                    title="Data saver"
                    subtitle="Reduce background refreshes and heavy media loading"
                    value={dataSaver}
                    onValueChange={setDataSaver}
                  />
                  <SettingToggle
                    title="Usage analytics"
                    subtitle="Help improve diagnostics with anonymous usage signals"
                    value={analyticsEnabled}
                    onValueChange={setAnalyticsEnabled}
                  />
                  <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Connection</Text>
                    <Text style={styles.faqAnswer}>{isOffline ? "Offline mode is active." : "Connected and ready."}</Text>
                  </View>
                </>
              )}

              {activePanel === "help" && (
                <>
                  <Text style={styles.panelText}>
                    Quick answers for common Car First Aid workflows.
                  </Text>
                  <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How are diagnostic results saved?</Text>
                    <Text style={styles.faqAnswer}>
                      Completed dashboard, sound, and manual diagnoses are stored in History so you can reopen them later.
                    </Text>
                  </View>
                  <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Why do videos open YouTube search?</Text>
                    <Text style={styles.faqAnswer}>
                      When the backend does not return a verified video, the app opens a targeted YouTube repair search instead of a broken placeholder.
                    </Text>
                  </View>
                  <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Can I contact a mechanic?</Text>
                    <Text style={styles.faqAnswer}>
                      Yes. Use the Mechanics tab or the mechanic CTA inside a diagnostic result.
                    </Text>
                  </View>
                  <AppButton label="Contact Support" icon={<Mail size={18} color={colors.buttonText} />} onPress={contactSupport} style={{ marginTop: Spacing.lg }} />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.name}>{user?.name || "Guest User"}</Text>
              <Text style={styles.email}>{user?.email || "guest@example.com"}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.pill}>
              {user?.role === "mechanic" ? <Wrench size={14} color={colors.primary} /> : <UserIcon size={14} color={colors.primary} />}
              <Text style={styles.pillText}>{roleLabel}</Text>
            </View>
            <View style={styles.pill}>
              <Shield size={14} color={colors.primary} />
              <Text style={styles.pillText}>{mechanic.isVerified ? "Verified" : "Protected"}</Text>
            </View>
            <View style={styles.pill}>
              {isDark ? <Moon size={14} color={colors.primary} /> : <Sun size={14} color={colors.primary} />}
              <Text style={styles.pillText}>{theme === "dark" ? "Dark" : "Light"} mode</Text>
            </View>
          </View>
        </View>

        {user?.role === "mechanic" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Profile</Text>
            <View style={styles.card}>
              <Row
                icon={<MapPin size={20} color={colors.primary} />}
                title={user.mechanicInfo?.address || "Business address"}
                subtitle="Shown to customers looking for nearby mechanics"
                onPress={() => handleOpenPanel("edit")}
              />
              <Row
                icon={<Phone size={20} color={colors.primary} />}
                title={user.mechanicInfo?.phone || "Phone number"}
                subtitle="Used for mechanic contact and WhatsApp flows"
                onPress={() => handleOpenPanel("edit")}
              />
              <Row
                icon={<Star size={20} color={colors.primary} />}
                title={user.mechanicInfo?.specialization || "Specialization"}
                subtitle="Helps match you with relevant diagnostics"
                onPress={() => handleOpenPanel("edit")}
                last
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Row
              icon={<UserIcon size={20} color={colors.primary} />}
              title="Edit Profile"
              subtitle="Update your name, email, and mechanic details"
              onPress={() => handleOpenPanel("edit")}
            />
            <Row
              icon={<Bell size={20} color={colors.primary} />}
              title="Notifications"
              subtitle={`${unreadCount} unread, ${notificationsEnabled ? "enabled" : "disabled"}`}
              onPress={() => handleOpenPanel("notifications")}
            />
            <Row
              icon={<Shield size={20} color={colors.primary} />}
              title="Privacy & Security"
              subtitle="Control account protection and diagnostic sharing"
              onPress={() => handleOpenPanel("privacy")}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <Row
              icon={theme === "dark" ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
              title="Theme"
              subtitle={`${theme === "dark" ? "Dark" : "Light"} mode active`}
              onPress={toggleTheme}
              right={<Switch value={theme === "dark"} onValueChange={toggleTheme} thumbColor={theme === "dark" ? colors.primary : undefined} />}
            />
            <Row
              icon={<Settings size={20} color={colors.primary} />}
              title="App Settings"
              subtitle="Data saver, analytics, and connection status"
              onPress={() => handleOpenPanel("settings")}
            />
            <Row
              icon={<HelpCircle size={20} color={colors.primary} />}
              title="Help & Support"
              subtitle="FAQs and support contact"
              onPress={() => handleOpenPanel("help")}
              last
            />
          </View>
        </View>

        <View style={styles.dangerSection}>
          <AppButton
            label="Sign Out"
            variant="danger"
            icon={<LogOut size={20} color={colors.error} />}
            onPress={() => setConfirmSignOutVisible(true)}
          />
        </View>
      </ScrollView>

      {renderPanel()}

      <ConfirmActionModal
        visible={confirmSignOutVisible}
        title="Sign out?"
        message="You will return to the login screen. Offline history remains on this device."
        confirmLabel="Sign Out"
        destructive
        onCancel={() => setConfirmSignOutVisible(false)}
        onConfirm={handleSignOut}
      />
    </View>
  )
}
