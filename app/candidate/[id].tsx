import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useApp } from '../../lib/AppContext';
import { buttonHaptic, clickHaptic } from '../../lib/haptics';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function CandidateProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors } = useApp();
  const { id } = useLocalSearchParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvLoading, setCvLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = useCallback(async () => {
    try {
      const candidateId = String(id);
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) throw error;
      setCandidate(data);
    } catch (error: any) {
      console.error('Error fetching candidate:', error);
      Alert.alert('Error', 'Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleWhatsApp = useCallback(() => {
    clickHaptic();
    if (!candidate) return;

    const name = candidate.name || 'N/A';
    const age = candidate.age || 'N/A';
    const gender = candidate.gender || 'N/A';
    const maritalStatus = candidate.marital_status || candidate.maritalStatus || 'N/A';
    const religion = candidate.religion || 'N/A';
    const job = candidate.job || 'N/A';
    const country = candidate.country || 'N/A';
    const experience = candidate.experience || 'N/A';
    const salary = candidate.salary || '0';
    const workerType = candidate.worker_type || candidate.workerType || 'N/A';
    const ref = candidate.ref || candidate.id || 'N/A';
    const cv = candidate.cv || 'Not available';

    const message = `*ZOD MANPOWER RECRUITMENT - DOHA, QATAR*\n\n━━━━━━━━━━━━━━━━━━━━\n*🎯 CANDIDATE DETAILS:*\n━━━━━━━━━━━━━━━━━━━━\n\n*📌 Name:* ${name}\n*📌 Age:* ${age} years\n*📌 Gender:* ${gender}\n*📌 Marital Status:* ${maritalStatus}\n*📌 Religion:* ${religion}\n*📌 Reference:* ${ref}\n\n━━━━━━━━━━━━━━━━━━━━\n*💼 JOB INFORMATION:*\n━━━━━━━━━━━━━━━━━━━━\n\n*🔹 Position:* ${job}\n*🔹 Country:* ${country}\n*🔹 Experience:* ${experience}\n*🔹 Salary:* ${salary} QAR\n*🔹 Worker Type:* ${workerType}\n\n━━━━━━━━━━━━━━━━━━━━\n*📄 DOCUMENTS:*\n━━━━━━━━━━━━━━━━━━━━\n\n*📎 CV Link:* ${cv}\n\n━━━━━━━━━━━━━━━━━━━━\n*🌐 WEBSITE:*\n━━━━━━━━━━━━━━━━━━━━\n\nhttps://zodmanpower.info\n\n━━━━━━━━━━━━━━━━━━━━\n*📞 Contact us:*\n━━━━━━━━━━━━━━━━━━━━\n\n*📱 WhatsApp:* +974 5535 5206\n*📧 Email:* info@zodmanpower.info\n\n━━━━━━━━━━━━━━━━━━━━\n*💬 Reply "HIRE ${name.toUpperCase()}" to proceed*`;

    const encodedMessage = encodeURIComponent(message);
    Linking.openURL(`https://wa.me/97455355206?text=${encodedMessage}`);
  }, [candidate]);

  const handleViewCv = useCallback(() => {
    clickHaptic();
    if (candidate?.cv) {
      setShowCvModal(true);
      setCvLoading(true);
    } else {
      Alert.alert('Info', 'CV not available for this candidate');
    }
  }, [candidate]);

  const handleCloseModal = useCallback(() => {
    setShowCvModal(false);
    setCvLoading(true);
  }, []);

  const handleDownloadCv = useCallback(() => {
    buttonHaptic();
    if (candidate?.cv) {
      Linking.openURL(candidate.cv);
    }
  }, [candidate]);

  const handleOpenInBrowser = useCallback(() => {
    clickHaptic();
    if (candidate?.cv) {
      Linking.openURL(candidate.cv);
    }
  }, [candidate]);

  const getStatusBadge = useCallback(() => {
    const workerType = candidate?.worker_type || candidate?.workerType || '';
    
    if (workerType === 'Returned Housemaids' || workerType === 'Returned') {
      return {
        text: t('statusReturned'),
        color: colors.statusTextReturned,
        bg: colors.statusReturned
      };
    } else if (workerType === 'Recruitment') {
      return {
        text: t('statusRecruitment'),
        color: colors.statusTextAvailable,
        bg: colors.statusAvailable
      };
    } else {
      return {
        text: t('statusAvailable'),
        color: colors.statusTextAvailable,
        bg: colors.statusAvailable
      };
    }
  }, [candidate, t, colors]);

  const statusBadge = getStatusBadge();

  const infoItems = [
    { icon: '📅', label: t('age'), value: candidate?.age ? `${candidate.age} ${t('years')}` : null },
    { icon: '👤', label: t('gender'), value: candidate?.gender || null },
    { icon: '📍', label: t('nationality'), value: candidate?.country || null },
    { icon: '✅', label: t('maritalStatus'), value: candidate?.marital_status || candidate?.maritalStatus || null },
    { icon: '🕐', label: t('experience'), value: candidate?.experience || null },
    { icon: '💼', label: 'Worker Type', value: candidate?.worker_type || candidate?.workerType || 'Full Time' },
  ].filter(item => item.value);

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!candidate) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('candidateNotFound')}</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: '#fff' }]}>← {t('back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* CV Modal */}
      <Modal
        visible={showCvModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: colors.hero }]}>
            <Text style={styles.modalTitle}>{candidate.name} - CV</Text>
            <TouchableOpacity 
              onPress={handleCloseModal}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {candidate.cv ? (
              <View style={styles.webViewContainer}>
                {cvLoading && (
                  <View style={styles.webViewLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.webViewLoaderText, { color: colors.textSecondary }]}>
                      Loading CV...
                    </Text>
                  </View>
                )}
                <WebView
                  source={{ uri: candidate.cv }}
                  style={styles.webView}
                  onLoadStart={() => setCvLoading(true)}
                  onLoadEnd={() => setCvLoading(false)}
                  onError={() => {
                    setCvLoading(false);
                    Alert.alert('Error', 'Failed to load CV. Please try again.');
                  }}
                  startInLoadingState={true}
                />
              </View>
            ) : (
              <View style={styles.cvContainer}>
                <Text style={[styles.cvPlaceholder, { color: colors.textSecondary }]}>
                  📄 No CV Available
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.modalFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.modalFooterButton, { backgroundColor: colors.primary }]}
              onPress={handleDownloadCv}
              activeOpacity={0.7}
            >
              <Text style={styles.modalFooterButtonText}>⬇ Download CV</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalFooterButton, { 
                backgroundColor: colors.background, 
                borderColor: colors.border, 
                borderWidth: 1 
              }]}
              onPress={handleOpenInBrowser}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalFooterButtonText, { color: colors.text }]}>🔗 Open in Browser</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ 
              uri: candidate.pic || `https://ui-avatars.com/api/?name=${candidate.name?.charAt(0) || 'C'}&background=D4880F&color=fff&size=300` 
            }}
            style={styles.heroImage}
          />
          <View style={[styles.heroOverlay, { backgroundColor: colors.background + '80' }]} />

          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.heroBackButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            activeOpacity={0.7}
          >
            <Text style={styles.heroBackText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.mainCardHeader}>
              <Text style={[styles.mainCardName, { color: colors.text }]}>{candidate.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                  {statusBadge.text}
                </Text>
              </View>
            </View>
            <Text style={[styles.mainCardJob, { color: colors.primary }]}>{candidate.job}</Text>
            <Text style={[styles.mainCardRef, { color: colors.textMuted }]}>Ref: {candidate.ref || candidate.id}</Text>

            <View style={[styles.salaryBox, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>{t('salary')}</Text>
              <Text style={[styles.salaryValue, { color: colors.primary }]}>
                {candidate.salary || 'Negotiable'} <Text style={[styles.salaryUnit, { color: colors.textMuted }]}>{t('qar')}{t('perMonth')}</Text>
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}
                onPress={handleWhatsApp}
                activeOpacity={0.7}
              >
                <Text style={styles.whatsappButtonText}>📱 {t('contactUs')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewCvButton, { borderColor: colors.border }]}
                onPress={handleViewCv}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewCvButtonText, { color: colors.text }]}>📄 {t('viewCV')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>{t('personalInfo')}</Text>
            <View style={styles.infoGrid}>
              {infoItems.map((item, index) => (
                <View key={index} style={styles.infoItem}>
                  <Text style={styles.infoIcon}>{item.icon}</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{item.label}</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {candidate.cv && (
            <TouchableOpacity 
              style={[styles.cvLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleViewCv}
              activeOpacity={0.7}
            >
              <View style={[styles.cvLinkIcon, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.cvLinkIconText, { color: colors.primary }]}>📄</Text>
              </View>
              <View style={styles.cvLinkTextContainer}>
                <Text style={[styles.cvLinkTitle, { color: colors.text }]}>View Full CV</Text>
                <Text style={[styles.cvLinkSubtitle, { color: colors.textMuted }]}>Click to view candidate's CV / Documents</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroContainer: {
    height: height * 0.4,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  heroBackButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroBackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    marginTop: -height * 0.08,
    paddingHorizontal: 16,
    gap: 16,
  },
  mainCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  mainCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mainCardJob: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  mainCardRef: {
    fontSize: 11,
    marginBottom: 12,
  },
  salaryBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  salaryLabel: {
    fontSize: 11,
  },
  salaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  salaryUnit: {
    fontSize: 13,
    fontWeight: 'normal',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whatsappButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewCvButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  viewCvButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    gap: 8,
    paddingVertical: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  cvLinkCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cvLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cvLinkIconText: {
    fontSize: 18,
  },
  cvLinkTextContainer: {
    flex: 1,
  },
  cvLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cvLinkSubtitle: {
    fontSize: 11,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  webViewLoaderText: {
    marginTop: 10,
    fontSize: 14,
  },
  cvContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvPlaceholder: {
    fontSize: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  modalFooterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalFooterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});