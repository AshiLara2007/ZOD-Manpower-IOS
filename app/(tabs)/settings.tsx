import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { clickHaptic } from '../../lib/haptics';
import { checkDeviceToken } from '../../lib/notifications';
import { isStoreReviewAvailable, requestStoreReview } from '../../lib/rateApp';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const LOGO_URL = "https://github.com/AshiLara2007/Prispoint-app/blob/main/WhatsApp%20Image%202026-06-08%20at%203.36.53%20PM.jpeg?raw=true";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { language, theme, colors, t, updateLanguage, updateTheme, isRTL } = useApp();
  const [tokenCount, setTokenCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    checkTokens();
    checkAdminStatus();
  }, []);

  const checkTokens = async () => {
    const result = await checkDeviceToken();
    setTokenCount(result.count || 0);
  };

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await AsyncStorage.getItem('isAdmin');
      if (adminStatus === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Rate App Function
  const handleRateApp = async () => {
    clickHaptic();
    try {
      const isAvailable = await isStoreReviewAvailable();
      if (isAvailable) {
        await requestStoreReview();
        Alert.alert('⭐ Thank You!', 'Thank you for rating ZOD Manpower!');
      } else {
        // Fallback - Open App Store URL
        const appId = '6787450829';
        const url = Platform.select({
          ios: `https://apps.apple.com/app/id${appId}?action=write-review`,
          android: `market://details?id=com.zod.manpower`,
        });
        if (url) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.error('Error rating app:', error);
      Alert.alert('Error', 'Could not open rating. Please try again later.');
    }
  };

  const handleLogin = async () => {
    clickHaptic();
    setLoginError('');

    if (username === 'admin' && password === '1978') {
      await AsyncStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
      setLoginModalVisible(false);
      setUsername('');
      setPassword('');
      Alert.alert('✅ Success', 'Welcome Admin!');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = async () => {
    clickHaptic();
    await AsyncStorage.removeItem('isAdmin');
    setIsAdmin(false);
    Alert.alert('Logged Out', 'You have been logged out');
  };

  const styles = getStyles(colors, isSmallDevice);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
      </View>

      {/* Rate App Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.iconText}>⭐</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rate App</Text>
        </View>
        <TouchableOpacity 
          style={[styles.rateButton, { backgroundColor: colors.primary }]}
          onPress={handleRateApp}
          activeOpacity={0.7}
        >
          <Text style={styles.rateButtonText}>⭐ Rate ZOD Manpower</Text>
        </TouchableOpacity>
        <Text style={[styles.rateSubtext, { color: colors.textMuted }]}>
          Love this app? Rate us on the App Store!
        </Text>
      </View>

      {/* Admin Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#fce4ec' }]}>
            <Text style={styles.iconText}>🔐</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin</Text>
        </View>
        
        {isAdmin ? (
          <View>
            <Text style={[styles.adminStatus, { color: colors.textSecondary }]}>✅ Logged in as Admin</Text>
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: '#f44336' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.adminButton, { backgroundColor: colors.primary }]}
            onPress={() => setLoginModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.adminButtonText}>👤 Admin Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.iconText}>🌐</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('language')}</Text>
        </View>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionButton, language === 'en' && styles.optionActive]}
            onPress={() => updateLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, language === 'en' && styles.optionActiveText]}>
              🇬🇧 {t('english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, language === 'ar' && styles.optionActive]}
            onPress={() => updateLanguage('ar')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, language === 'ar' && styles.optionActiveText]}>
              🇶🇦 {t('arabic')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.iconText}>🎨</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('theme')}</Text>
        </View>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionButton, theme === 'light' && styles.optionActive]}
            onPress={() => updateTheme('light')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, theme === 'light' && styles.optionActiveText]}>
              ☀️ {t('lightMode')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, theme === 'dark' && styles.optionActive]}
            onPress={() => updateTheme('dark')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, theme === 'dark' && styles.optionActiveText]}>
              🌙 {t('darkMode')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Developer Info Section */}
      <View style={[styles.developerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.developerContainer}>
          <Image 
            source={{ uri: LOGO_URL }} 
            style={styles.developerLogo}
            onError={(e: any) => {
              e.target.source = { uri: `https://ui-avatars.com/api/?name=PS&background=D4880F&color=fff&size=80` };
            }}
          />
          
          <Text style={[styles.developerName, { color: colors.text }]}>{t('prispointStudios')}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('developerBy')}:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>Lara Williams</Text>
            <Text style={[styles.infoSubtext, { color: colors.accent }]}>{t('prispointStudios')}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>📞 {t('makeNumberSupport')}:</Text>
            <TouchableOpacity 
              style={[styles.supportButton, { backgroundColor: colors.primary + '15' }]} 
              onPress={() => Linking.openURL('tel:+97430866890')}
              activeOpacity={0.7}
            >
              <Text style={[styles.supportButtonText, { color: colors.primary }]}>📱 +974 3086 6890</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.footerInfo}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('version')} {Constants.expoConfig?.version || '1.1.0'}
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('copyright')}</Text>
            <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('allRightsReserved')}</Text>
          </View>
        </View>
      </View>

      {/* Admin Login Modal */}
      <Modal
        visible={loginModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🔐 Admin Login</Text>
              <TouchableOpacity onPress={() => setLoginModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Enter admin credentials to access admin panel
              </Text>

              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {loginError ? (
                <Text style={styles.modalError}>{loginError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.modalLoginButton, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.modalLoginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors: any, isSmallDevice: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.015,
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: width * 0.04,
    marginTop: 12,
    padding: width * 0.04,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: isSmallDevice ? 12 : 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f5f5f5',
  },
  optionActive: {
    backgroundColor: '#e8eaf6',
    borderColor: '#1a237e',
  },
  optionText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#333',
  },
  optionActiveText: {
    color: '#1a237e',
  },
  rateButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rateSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  adminButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  developerSection: {
    marginHorizontal: width * 0.04,
    marginTop: 12,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  developerContainer: {
    padding: width * 0.04,
    alignItems: 'center',
  },
  developerLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(26, 35, 126, 0.2)',
  },
  developerName: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 10,
  },
  infoRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 2,
  },
  supportButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  supportButtonText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
  },
  footerInfo: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: isSmallDevice ? 11 : 12,
  },
  footerSubtext: {
    fontSize: isSmallDevice ? 9 : 10,
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
    padding: 4,
  },
  modalBody: {
    gap: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  modalError: {
    color: '#f44336',
    fontSize: 13,
    textAlign: 'center',
  },
  modalLoginButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalLoginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});