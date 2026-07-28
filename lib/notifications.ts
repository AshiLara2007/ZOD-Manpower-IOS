import * as Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

// ✅ Custom Sound File Name
const SOUND_FILE = 'custom-notification.wav';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Get Expo Push Token
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a237e',
      sound: SOUND_FILE, // ✅ Android Custom Sound
    });
  }

  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    Alert.alert('Failed to get push token for push notification!');
    return null;
  }

  try {
    // Get project ID - try multiple ways
    let projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    // Fallback: Get from Constants.manifest
    if (!projectId && Constants.manifest?.extra?.eas?.projectId) {
      projectId = Constants.manifest.extra.eas.projectId;
    }
    
    // Fallback: Hardcoded project ID (Expo Go සඳහා)
    if (!projectId) {
      projectId = '73898b70-ba5c-4ffd-a35a-3e1c519ae4cf';
      console.log('📱 Using hardcoded project ID:', projectId);
    }

    if (!projectId) {
      console.error('❌ Project ID not found');
      Alert.alert('Error', 'Project ID not found');
      return null;
    }

    console.log('📱 Project ID:', projectId);

    token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    console.log('✅ Push Token:', token.data);
    
    // Save to Supabase immediately
    if (token.data) {
      await savePushToken(token.data);
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    Alert.alert('Error', `Failed to get push token: ${error.message}`);
    return null;
  }
}

// Save push token to Supabase
export async function savePushToken(token: string) {
  try {
    console.log('💾 Saving token to Supabase:', token.substring(0, 30) + '...');
    
    const { data, error } = await supabase
      .from('device_tokens')
      .upsert(
        { 
          token: token,
          created_at: new Date().toISOString(),
        },
        { 
          onConflict: 'token' 
        }
      );

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Push token saved to Supabase');
    return data;
  } catch (error) {
    console.error('❌ Error saving push token:', error);
    return null;
  }
}

// Send push notification with custom sound
export async function sendPushNotification(title: string, body: string, data?: any) {
  try {
    console.log('📤 Sending notification:', title);
    
    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token');

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No push tokens found');
      return { success: false, message: 'No tokens found' };
    }

    console.log(`📱 Sending to ${tokens.length} devices`);

    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: SOUND_FILE, // ✅ Custom Sound
      title: title,
      body: body,
      data: data || {},
      badge: 1,
    }));

    const responses = await Promise.all(
      messages.map(async (message) => {
        try {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });
          return await response.json();
        } catch (error) {
          console.error('❌ Error sending notification:', error);
          return null;
        }
      })
    );

    console.log('✅ Notifications sent:', responses.length);
    return { success: true, count: responses.length, responses };
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    return { success: false, error: error.message };
  }
}

// Send test notification with custom sound
export async function sendTestNotification() {
  return sendPushNotification(
    '🔔 Test Notification',
    'This is a test notification with custom sound!',
    { type: 'test' }
  );
}

// Send notification when new candidate added
export async function notifyNewCandidate(candidateName: string, candidateJob: string, candidateId?: string) {
  const title = `🆕 New Candidate Available!`;
  const body = `${candidateName} - ${candidateJob}`;
  const data = {
    type: 'new_candidate',
    candidateId: candidateId || null,
  };
  
  return sendPushNotification(title, body, data);
}

// Request notification permission
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

// Get notification permission status
export async function getNotificationPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Check device tokens
export async function checkDeviceToken() {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('token')
      .limit(1);
      
    if (error) throw error;
    return { count: data?.length || 0, tokens: data };
  } catch (error) {
    console.error('❌ Error checking device tokens:', error);
    return { count: 0, error: error.message };
  }
}

// Clear all device tokens (for testing)
export async function clearAllDeviceTokens() {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .neq('id', 0);
      
    if (error) throw error;
    console.log('🗑️ All device tokens cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing device tokens:', error);
    return { success: false, error: error.message };
  }
}

// Send notification to specific device
export async function sendPushToDevice(token: string, title: string, body: string, data?: any) {
  try {
    console.log('📤 Sending to device:', token.substring(0, 30) + '...');
    
    const message = {
      to: token,
      sound: SOUND_FILE, // ✅ Custom Sound
      title: title,
      body: body,
      data: data || {},
      badge: 1,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const result = await response.json();
    console.log('📨 Notification response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { error: error.message };
  }
}