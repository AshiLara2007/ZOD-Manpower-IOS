import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { clickHaptic } from '../../lib/haptics';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Optimized Candidate Card - React.memo
const CandidateCard = React.memo(({ candidate }: { candidate: any }) => {
  const { t, colors } = useApp();
  
  const getStatus = useCallback(() => {
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
  }, [candidate, t, colors]);

  const status = getStatus();
  const imageUrl = candidate.pic || `https://ui-avatars.com/api/?name=${candidate.name?.charAt(0) || 'C'}&background=D4880F&color=fff`;

  const handlePress = useCallback(() => {
    clickHaptic();
    router.push(`/candidate/${candidate.id}`);
  }, [candidate.id]);

  return (
    <TouchableOpacity
      style={[styles.candidateCard, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.candidateImage} />
      <View style={styles.candidateInfo}>
        <Text style={[styles.candidateName, { color: colors.text }]} numberOfLines={1}>
          {candidate.name || 'N/A'}
        </Text>
        <Text style={[styles.candidateJob, { color: colors.textSecondary }]} numberOfLines={1}>
          {candidate.job || 'N/A'}
        </Text>
        <View style={styles.candidateRow}>
          <Text style={[styles.candidateCountry, { color: colors.textMuted }]}>
            📍 {candidate.country || 'N/A'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.candidateSalary, { color: colors.primary }]}>
        {candidate.salary || '0'} QAR
      </Text>
    </TouchableOpacity>
  );
});

export default function CandidatesScreen() {
  const insets = useSafeAreaInsets();
  const { t, colors } = useApp();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, search, filter]);

  const fetchCandidates = useCallback(async () => {
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
  }, []);

  const filterCandidates = useCallback(() => {
    let result = [...candidates];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.job?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      );
    }

    if (filter === 'available') {
      result = result.filter(c => {
        const wt = c.worker_type || c.workerType || '';
        return wt !== 'Returned Housemaids' && wt !== 'Returned';
      });
    } else if (filter === 'returned') {
      result = result.filter(c => {
        const wt = c.worker_type || c.workerType || '';
        return wt === 'Returned Housemaids' || wt === 'Returned';
      });
    }

    setFiltered(result);
  }, [candidates, search, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCandidates();
  }, [fetchCandidates]);

  const handleFilterPress = useCallback((filterType: string) => {
    clickHaptic();
    setFilter(filterType);
  }, []);

  const counts = useMemo(() => {
    const total = candidates.length;
    const available = candidates.filter(c => {
      const wt = c.worker_type || c.workerType || '';
      return wt !== 'Returned Housemaids' && wt !== 'Returned';
    }).length;
    const returned = candidates.filter(c => {
      const wt = c.worker_type || c.workerType || '';
      return wt === 'Returned Housemaids' || wt === 'Returned';
    }).length;
    return { total, available, returned };
  }, [candidates]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('candidates')}</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder={t('searchCandidates')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterActive]}
            onPress={() => handleFilterPress('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterActiveText]}>
              {t('all')} ({counts.total})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'available' && styles.filterActive]}
            onPress={() => handleFilterPress('available')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'available' && styles.filterActiveText]}>
              ✅ {t('available')} ({counts.available})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'returned' && styles.filterActive]}
            onPress={() => handleFilterPress('returned')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'returned' && styles.filterActiveText]}>
              🔄 {t('returned')} ({counts.returned})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={({ item }) => <CandidateCard candidate={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noCandidatesFound')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 4,
    marginBottom: 3,
  },
  filterActive: {
    backgroundColor: '#1a237e',
  },
  filterText: {
    fontSize: 11,
    color: '#666',
  },
  filterActiveText: {
    color: '#fff',
  },
  listContent: {
    padding: width * 0.04,
  },
  candidateCard: {
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
    marginBottom: 2,
  },
  candidateJob: {
    fontSize: 13,
    marginBottom: 3,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateCountry: {
    fontSize: 11,
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
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});