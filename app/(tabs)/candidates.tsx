import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../lib/AppContext';
import { generateShareMessage } from '../../lib/deepLinking';
import { addFavorite, getFavoriteIds, removeFavorite } from '../../lib/favorites';
import { clickHaptic } from '../../lib/haptics';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Country Flags Data
const COUNTRIES = [
  { id: 'all', name: 'All', flag: '🌍' },
  { id: 'Indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { id: 'Sri Lanka', name: 'Sri Lanka', flag: '🇱🇰' },
  { id: 'Philippines', name: 'Philippines', flag: '🇵🇭' },
  { id: 'Bangladesh', name: 'Bangladesh', flag: '🇧🇩' },
  { id: 'India', name: 'India', flag: '🇮🇳' },
  { id: 'Ethiopia', name: 'Ethiopia', flag: '🇪🇹' },
  { id: 'Kenya', name: 'Kenya', flag: '🇰🇪' },
  { id: 'Uganda', name: 'Uganda', flag: '🇺🇬' },
];

// Optimized Candidate Card
const CandidateCard = React.memo(({ 
  candidate, 
  onFavoriteToggle, 
  isFavorite: initialIsFavorite,
  isAdmin,
  onDelete,
  onViewProfile,
}: any) => {
  const { t, colors } = useApp();
  const [isFav, setIsFav] = useState(initialIsFavorite);
  
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
    onViewProfile(candidate.id);
  }, [candidate.id]);

  const handleFavorite = useCallback(async () => {
    clickHaptic();
    const result = await onFavoriteToggle(candidate.id);
    if (result) {
      setIsFav(!isFav);
    }
  }, [candidate.id, isFav]);

  const handleShare = useCallback(async () => {
    clickHaptic();
    try {
      const message = generateShareMessage(candidate.name || 'Candidate', candidate.id);
      await Share.share({
        message: message,
        title: `${candidate.name} - ZOD Manpower`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [candidate]);

  // ✅ Delete function - only works if isAdmin is true
  const handleDelete = useCallback(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You need admin privileges to delete candidates.');
      return;
    }
    
    clickHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this candidate? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(candidate.id)
        }
      ]
    );
  }, [candidate.id, isAdmin]);

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
      <View style={styles.cardRight}>
        <Text style={[styles.candidateSalary, { color: colors.primary }]}>
          {candidate.salary || '0'} QAR
        </Text>
        <TouchableOpacity onPress={handleFavorite} style={styles.favoriteButton} activeOpacity={0.7}>
          <Text style={styles.favoriteIcon}>{isFav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareIconButton} activeOpacity={0.7}>
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
        {/* ✅ Delete button only visible when isAdmin is true */}
        {isAdmin && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} activeOpacity={0.7}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
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
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchCandidates();
    loadFavorites();
    checkAdminStatus();
  }, []);

  // ✅ Listen for focus events to check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      await checkAdminStatus();
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, search, filter, selectedCountry, favorites, showFavorites]);

  // ✅ Check admin status from AsyncStorage
  const checkAdminStatus = async () => {
    try {
      const adminStatus = await AsyncStorage.getItem('isAdmin');
      const isAdminUser = adminStatus === 'true';
      setIsAdmin(isAdminUser);
      console.log('👑 Admin status:', isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

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

  const loadFavorites = useCallback(async () => {
    const favIds = await getFavoriteIds();
    setFavorites(favIds);
  }, []);

  const handleFavoriteToggle = useCallback(async (candidateId: number) => {
    const isFav = favorites.includes(candidateId);
    let success = false;
    
    if (isFav) {
      success = await removeFavorite(candidateId);
      if (success) {
        setFavorites(prev => prev.filter(id => id !== candidateId));
      }
    } else {
      success = await addFavorite(candidateId);
      if (success) {
        setFavorites(prev => [...prev, candidateId]);
      }
    }
    return success;
  }, [favorites]);

  // ✅ Delete function with admin check
  const handleDelete = useCallback(async (candidateId: number) => {
    // Double-check admin status before deleting
    const adminStatus = await AsyncStorage.getItem('isAdmin');
    if (adminStatus !== 'true') {
      Alert.alert('Access Denied', 'You need admin privileges to delete candidates.');
      return;
    }

    console.log('🗑️ Deleting candidate:', candidateId);
    try {
      const { error: deleteError } = await supabase
        .from('talents')
        .delete()
        .eq('id', candidateId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        Alert.alert('❌ Error', 'Failed to delete candidate from database');
        return;
      }

      await supabase
        .from('favorites')
        .delete()
        .eq('candidate_id', candidateId);

      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      setFavorites(prev => prev.filter(id => id !== candidateId));
      
      Alert.alert('✅ Success', 'Candidate deleted successfully!');
      console.log('✅ Candidate deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      Alert.alert('❌ Error', 'An error occurred while deleting the candidate');
    }
  }, []);

  const handleViewProfile = useCallback((candidateId: number) => {
    clickHaptic();
    router.push(`/candidate/${candidateId}`);
  }, []);

  const filterCandidates = useCallback(() => {
    let result = [...candidates];

    if (showFavorites) {
      result = result.filter(c => favorites.includes(c.id));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.job?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      );
    }

    if (selectedCountry !== 'all') {
      result = result.filter(c => 
        c.country?.toLowerCase() === selectedCountry.toLowerCase()
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
  }, [candidates, search, filter, selectedCountry, favorites, showFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCandidates();
    loadFavorites();
    checkAdminStatus(); // ✅ Refresh admin status on pull to refresh
  }, [fetchCandidates, loadFavorites]);

  const handleFilterPress = useCallback((filterType: string) => {
    clickHaptic();
    setFilter(filterType);
  }, []);

  const handleCountryPress = useCallback((countryId: string) => {
    clickHaptic();
    setSelectedCountry(countryId);
  }, []);

  const toggleShowFavorites = useCallback(() => {
    clickHaptic();
    setShowFavorites(prev => !prev);
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
    const favCount = favorites.length;
    return { total, available, returned, favCount };
  }, [candidates, favorites]);

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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('candidates')}</Text>
          {/* ✅ Admin Badge - Only visible when logged in */}
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 Admin</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.favFilterButton, showFavorites && styles.favFilterActive]}
            onPress={toggleShowFavorites}
            activeOpacity={0.7}
          >
            <Text style={[styles.favFilterText, showFavorites && styles.favFilterActiveText]}>
              ⭐ {counts.favCount}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder={t('searchCandidates')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Country Flags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.flagsContainer}
          contentContainerStyle={styles.flagsContent}
        >
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.id}
              style={[
                styles.flagButton,
                selectedCountry === country.id && styles.flagButtonActive,
                { backgroundColor: selectedCountry === country.id ? colors.primary : colors.background }
              ]}
              onPress={() => handleCountryPress(country.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.flagEmoji}>{country.flag}</Text>
              <Text 
                style={[
                  styles.flagName,
                  { color: selectedCountry === country.id ? '#fff' : colors.textSecondary }
                ]}
                numberOfLines={1}
              >
                {country.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filters */}
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
        renderItem={({ item }) => (
          <CandidateCard 
            candidate={item} 
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={favorites.includes(item.id)}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onViewProfile={handleViewProfile}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {showFavorites ? t('noFavorites') : t('noCandidatesFound')}
            </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  adminBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  favFilterActive: {
    backgroundColor: '#1a237e',
  },
  favFilterText: {
    fontSize: 12,
    color: '#666',
  },
  favFilterActiveText: {
    color: '#fff',
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
  flagsContainer: {
    marginBottom: 10,
  },
  flagsContent: {
    paddingRight: 16,
    gap: 8,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  flagButtonActive: {
    borderColor: 'transparent',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  flagName: {
    fontSize: 12,
    fontWeight: '500',
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
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  candidateSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  shareIconButton: {
    padding: 4,
  },
  shareIcon: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
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