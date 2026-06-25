import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { buttonHaptic, clickHaptic } from '../../lib/haptics';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');
const LOGO_URL = "https://zodmanpower.info/logo/logo.jpeg";

const CandidateCard = ({ candidate }: { candidate: any }) => {
  const { t, colors } = useApp();
  
  const getStatus = () => {
    const wt = candidate.worker_type || candidate.workerType || '';
    if (wt === 'Returned Housemaids' || wt === 'Returned') {
      return { 
        label: t('statusReturned'), 
        color: colors.statusTextReturned, 
        bg: colors.statusReturned 
      };
    } else if (wt === 'Recruitment') {
      return { 
        label: t('statusRecruitment'), 
        color: colors.statusTextAvailable, 
        bg: colors.statusAvailable 
      };
    }
    return { 
      label: t('statusAvailable'), 
      color: colors.statusTextAvailable, 
      bg: colors.statusAvailable 
    };
  };

  const status = getStatus();
  const imageUrl = candidate.pic || `https://ui-avatars.com/api/?name=${candidate.name?.charAt(0) || 'C'}&background=D4880F&color=fff`;

  const handlePress = () => {
    clickHaptic();
    router.push(`/candidate/${candidate.id}`);
  };

  const styles = getCandidateStyles(colors);

  return (
    <TouchableOpacity
      style={styles.candidateCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.candidateImage} />
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName} numberOfLines={1}>
          {candidate.name || 'N/A'}
        </Text>
        <Text style={styles.candidateJob} numberOfLines={1}>
          {candidate.job || 'N/A'}
        </Text>
        <View style={styles.candidateRow}>
          <Text style={styles.candidateCountry}>📍 {candidate.country || 'N/A'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.candidateSalary}>
        {candidate.salary || '0'} QAR
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors, theme } = useApp();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('talents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  const availableCandidates = candidates.filter(c => {
    const workerType = c.worker_type || c.workerType || '';
    return workerType !== 'Returned Housemaids' && workerType !== 'Returned';
  });

  const returnedCount = candidates.filter(c => {
    const workerType = c.worker_type || c.workerType || '';
    return workerType === 'Returned Housemaids' || workerType === 'Returned';
  }).length;

  const recentCandidates = availableCandidates.slice(0, 5);

  const handleBrowsePress = () => {
    buttonHaptic();
    router.push('/(tabs)/candidates');
  };

  const handleJobsPress = () => {
    buttonHaptic();
    router.push('/(tabs)/jobs');
  };

  const handleSeeAllPress = () => {
    clickHaptic();
    router.push('/(tabs)/candidates');
  };

  const styles = getStyles(colors, theme);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <View style={styles.heroContent}>
          <Image source={{ uri: LOGO_URL }} style={styles.heroLogo} />
          <View>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>ZOD Manpower</Text>
            <Text style={[styles.heroSubtitle, { color: colors.heroText + '80' }]}>Recruitment Agency</Text>
          </View>
        </View>

        <Text style={[styles.heroHeading, { color: colors.heroText }]}>{t('heroTitle')}</Text>
        <Text style={[styles.heroDescription, { color: colors.heroText + 'B3' }]}>
          {t('heroSubtitle')}
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={handleBrowsePress}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{t('browseCandidates')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.heroText + '33' }]}
            onPress={handleJobsPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.heroText }]}>{t('viewJobs')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.statBg }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{candidates.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('total')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.statusAvailable }]}>
          <Text style={[styles.statNumber, { color: colors.statusTextAvailable }]}>
            {availableCandidates.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('available')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.statusReturned }]}>
          <Text style={[styles.statNumber, { color: colors.statusTextReturned }]}>
            {returnedCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('returned')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('availableCandidates')}</Text>
          <TouchableOpacity onPress={handleSeeAllPress} activeOpacity={0.7}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('seeAll')} →</Text>
          </TouchableOpacity>
        </View>

        {recentCandidates.length > 0 ? (
          <View style={styles.candidatesList}>
            {recentCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noAvailableCandidates')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  hero: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
    paddingBottom: height * 0.025,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  heroLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 5,
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    marginTop: -height * 0.015,
  },
  statCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  candidatesList: {
    gap: 10,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});

const getCandidateStyles = (colors: any) => StyleSheet.create({
  candidateCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateImage: {
    width: 60,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  candidateJob: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateCountry: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  candidateSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 4,
  },
});