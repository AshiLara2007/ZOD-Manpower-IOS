import React from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { clickHaptic } from '../../lib/haptics';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const LOGO_URL = "https://github.com/AshiLara2007/Prispoint-app/blob/main/WhatsApp%20Image%202026-06-08%20at%203.36.53%20PM.jpeg?raw=true";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { language, theme, colors, t, updateLanguage, updateTheme, isRTL } = useApp();

  const handleCallSupport = () => {
    clickHaptic();
    Linking.openURL('tel:+97430866890');
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    clickHaptic();
    updateLanguage(lang);
    Alert.alert(t('success'), t('settingsSaved'));
  };

  const handleThemeChange = (thm: 'light' | 'dark') => {
    clickHaptic();
    updateTheme(thm);
    Alert.alert(t('success'), t('settingsSaved'));
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
            style={[
              styles.optionButton, 
              language === 'en' && styles.optionActive,
              { backgroundColor: colors.card }
            ]}
            onPress={() => handleLanguageChange('en')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText, 
              language === 'en' && styles.optionActiveText,
              { color: colors.text }
            ]}>
              🇬🇧 {t('english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton, 
              language === 'ar' && styles.optionActive,
              { backgroundColor: colors.card }
            ]}
            onPress={() => handleLanguageChange('ar')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText, 
              language === 'ar' && styles.optionActiveText,
              { color: colors.text }
            ]}>
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
            style={[
              styles.optionButton, 
              theme === 'light' && styles.optionActive,
              { backgroundColor: colors.card }
            ]}
            onPress={() => handleThemeChange('light')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText, 
              theme === 'light' && styles.optionActiveText,
              { color: colors.text }
            ]}>
              ☀️ {t('lightMode')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton, 
              theme === 'dark' && styles.optionActive,
              { backgroundColor: colors.card }
            ]}
            onPress={() => handleThemeChange('dark')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText, 
              theme === 'dark' && styles.optionActiveText,
              { color: colors.text }
            ]}>
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
              onPress={handleCallSupport}
              activeOpacity={0.7}
            >
              <Text style={[styles.supportButtonText, { color: colors.primary }]}>📱 +974 3086 6890</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.footerInfo}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('version')} 1.0.1</Text>
            <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('copyright')}</Text>
            <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('allRightsReserved')}</Text>
          </View>
        </View>
      </View>
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
  },
  optionActive: {
    backgroundColor: '#e8eaf6',
    borderColor: '#1a237e',
  },
  optionText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
  },
  optionActiveText: {
    color: '#1a237e',
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
});