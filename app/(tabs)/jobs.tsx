import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { clickHaptic } from '../../lib/haptics';

const { width, height } = Dimensions.get('window');

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors } = useApp();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setJobs([]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleBack = () => {
    clickHaptic();
    router.back();
  };

  const handleBrowseCandidates = () => {
    clickHaptic();
    router.push('/(tabs)/candidates');
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
            <Text style={styles.emptyIcon}>💼</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noJobsAvailable')}</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            {t('noJobsMessage')}
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]} 
            onPress={handleBrowseCandidates}
            activeOpacity={0.7}
          >
            <Text style={styles.browseButtonText}>{t('browseCandidatesBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('jobs')}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('findRightCandidate')}</Text>
      </View>

      <FlatList
        data={jobs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.jobCard, { backgroundColor: colors.card }]}
            onPress={() => {
              clickHaptic();
              Alert.alert('Job Details', item.description);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.jobHeader}>
              <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <View style={styles.jobTypeBadge}>
                <Text style={styles.jobTypeText}>{item.type || 'Full Time'}</Text>
              </View>
            </View>
            <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{item.company}</Text>
            <View style={styles.jobDetails}>
              <Text style={[styles.jobDetail, { color: colors.textMuted }]}>📍 {item.location}</Text>
              <Text style={[styles.jobDetail, { color: colors.textMuted }]}>💰 {item.salary} {t('qar')}</Text>
            </View>
            <View style={styles.jobArrow}>
              <Text style={[styles.jobArrowText, { color: colors.textMuted }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
  backButton: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  browseButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: width * 0.04,
  },
  jobCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  jobTypeBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  jobTypeText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: '600',
  },
  jobCompany: {
    fontSize: 13,
    marginBottom: 8,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  jobDetail: {
    fontSize: 12,
  },
  jobArrow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  jobArrowText: {
    fontSize: 14,
  },
});