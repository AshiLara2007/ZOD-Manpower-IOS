import * as Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

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
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('❌ Project ID not found in app.json');
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
    console.log('💾 Saving token to Supabase:', token.substring(0, 20) + '...');
    
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
    console.log('📊 Data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error saving push token:', error);
    Alert.alert('Error', `Failed to save push token: ${error.message}`);
    return null;
  }
}

// Send push notification to all devices
export async function sendPushNotification(title: string, body: string, data?: any) {
  try {
    console.log('📤 Sending notification:', title);
    
    // Get all push tokens from Supabase
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
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
      badge: 1,
    }));

    // Send notifications
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
          const result = await response.json();
          console.log('📨 Notification response:', result);
          return result;
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

// Send test notification
export async function sendTestNotification() {
  return sendPushNotification(
    '🧪 Test Notification',
    'This is a test notification from ZOD Manpower!',
    { type: 'test' }
  );
}

// Get user's notification permission status
export async function getNotificationPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Request notification permission
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

// Check if device token exists
export async function checkDeviceToken() {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('token')
      .limit(1);
      
    if (error) throw error;
    console.log('📊 Device tokens count:', data?.length || 0);
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