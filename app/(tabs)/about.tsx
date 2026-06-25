import React from 'react';
import {
    Dimensions,
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

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors } = useApp();

  const handleCall = () => {
    clickHaptic();
    Linking.openURL('tel:+97455355206');
  };

  const handleEmail = () => {
    clickHaptic();
    Linking.openURL('mailto:info@zodmanpower.info');
  };

  const styles = getStyles(colors);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <Text style={[styles.heroTitle, { color: colors.heroText }]}>{t('aboutUs')}</Text>
        <Text style={[styles.heroSubtitle, { color: colors.heroText + 'B3' }]}>
          Your trusted partner for workforce solutions in Qatar
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('whoWeAre')}</Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          {t('whoWeAreText')}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>10+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('yearsExperience')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>500+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('happyClients')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>2000+</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('workersPlaced')}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('ourMission')}</Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          {t('ourMissionText')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('ourVision')}</Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          {t('ourVisionText')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('contactUs')}</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>📞 {t('callUs')}</Text>
          <Text style={[styles.contactValue, { color: colors.primary }]}>+974 5535 5206</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.7}>
          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>📧 {t('emailUs')}</Text>
          <Text style={[styles.contactValue, { color: colors.primary }]}>info@zodmanpower.info</Text>
        </TouchableOpacity>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>📍 {t('registeredOffice')}</Text>
          <Text style={[styles.contactValue, { color: colors.primary }]}>Doha, Qatar</Text>
        </View>

        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>🕐 {t('workingHours')}</Text>
          <Text style={[styles.contactValue, { color: colors.primary }]}>9AM - 10PM</Text>
          <Text style={[styles.contactSubtext, { color: colors.textMuted }]}>Saturday - Thursday</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('copyright')}</Text>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>{t('allRightsReserved')}</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.03,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: width * 0.04,
    marginBottom: 10,
    padding: width * 0.04,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.04,
    marginVertical: 6,
  },
  statCard: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  contactItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactLabel: {
    fontSize: 13,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  contactSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});