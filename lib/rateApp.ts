import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Alert, Platform } from 'react-native';

const STORAGE_KEY = 'app_rated';

// Check if app has been rated before
export const hasRatedApp = async (): Promise<boolean> => {
  try {
    const rated = await AsyncStorage.getItem(STORAGE_KEY);
    return rated === 'true';
  } catch (error) {
    console.error('Error checking rate status:', error);
    return false;
  }
};

// Set app as rated
export const setAppRated = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error saving rate status:', error);
  }
};

// Check if store review is available
export const isStoreReviewAvailable = async (): Promise<boolean> => {
  return await StoreReview.isAvailableAsync();
};

// Request store review
export const requestStoreReview = async (): Promise<boolean> => {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
      await setAppRated();
      return true;
    } else {
      // Fallback - Open App Store URL
      await openAppStore();
      return true;
    }
  } catch (error) {
    console.error('Error requesting review:', error);
    // Fallback - Open App Store URL
    await openAppStore();
    return false;
  }
};

// Open App Store URL
export const openAppStore = async (): Promise<void> => {
  try {
    const appId = '6787450829'; // Your App ID
    const url = Platform.select({
      ios: `https://apps.apple.com/app/id${appId}?action=write-review`,
      android: `market://details?id=com.zod.manpower`,
    });
    
    if (url) {
      const { Linking } = await import('react-native');
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening App Store:', error);
  }
};

// Show rating prompt with custom message
export const showRatingPrompt = async (
  onRate: () => void,
  onLater: () => void,
  onNever: () => void
): Promise<void> => {
  Alert.alert(
    '⭐ Rate ZOD Manpower',
    'If you enjoy using ZOD Manpower, please take a moment to rate us on the App Store. Your feedback helps us improve!',
    [
      { 
        text: 'Rate Now', 
        onPress: () => {
          onRate();
          requestStoreReview();
        },
        style: 'default'
      },
      { 
        text: 'Remind Me Later', 
        onPress: onLater,
        style: 'default'
      },
      { 
        text: 'Don\'t Ask Again', 
        onPress: () => {
          setAppRated();
          onNever();
        },
        style: 'destructive'
      },
    ],
    { cancelable: false }
  );
};