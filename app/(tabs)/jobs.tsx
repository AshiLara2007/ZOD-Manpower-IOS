import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { clickHaptic } from '../../lib/haptics';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors } = useApp();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useState(() => {
    // No jobs available - Empty array
    setTimeout(() => {
      setJobs([]);
      setLoading(false);
      setRefreshing(false);
    }, 800);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleBack = useCallback(() => {
    clickHaptic();
    router.back();
  }, []);

  const handleBrowseCandidates = useCallback(() => {
    clickHaptic();
    router.push('/(tabs)/candidates');
  }, []);

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  // No Jobs Available - Always Show This
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
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
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Jobs Available</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          There are currently no open job positions. Please check back later for new opportunities.
        </Text>
        <TouchableOpacity 
          style={[styles.browseButton, { backgroundColor: colors.primary }]} 
          onPress={handleBrowseCandidates}
          activeOpacity={0.7}
        >
          <Text style={styles.browseButtonText}>Browse Candidates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
  backButton: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
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
});