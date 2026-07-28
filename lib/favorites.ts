import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Get user ID (using device ID or stored user ID)
export const getUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem('user_id', userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback - generate temporary ID
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
};

// Add favorite
export const addFavorite = async (candidateId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        candidate_id: candidateId,
      });
    
    if (error) throw error;
    console.log('✅ Favorite added:', candidateId);
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

// Remove favorite
export const removeFavorite = async (candidateId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('candidate_id', candidateId);
    
    if (error) throw error;
    console.log('✅ Favorite removed:', candidateId);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

// Toggle favorite
export const toggleFavorite = async (candidateId: number): Promise<boolean> => {
  const isFav = await isFavorite(candidateId);
  if (isFav) {
    return await removeFavorite(candidateId);
  } else {
    return await addFavorite(candidateId);
  }
};

// Check if candidate is favorite
export const isFavorite = async (candidateId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('candidate_id', candidateId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Get all favorite candidate IDs
export const getFavoriteIds = async (): Promise<number[]> => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('favorites')
      .select('candidate_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(item => item.candidate_id);
  } catch (error) {
    console.error('Error getting favorite IDs:', error);
    return [];
  }
};

// Get favorite candidates with full details
export const getFavoriteCandidates = async (): Promise<any[]> => {
  try {
    const favoriteIds = await getFavoriteIds();
    if (favoriteIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .in('id', favoriteIds);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting favorite candidates:', error);
    return [];
  }
};

// Clear all favorites for user (for testing)
export const clearAllFavorites = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    console.log('🗑️ All favorites cleared');
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};