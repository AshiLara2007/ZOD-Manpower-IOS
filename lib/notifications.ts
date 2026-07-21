import * as Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('Project ID not found');
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      console.log('✅ Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Save push token to Supabase
export async function savePushToken(token: string) {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .upsert([
        { 
          token: token,
          created_at: new Date().toISOString(),
        }
      ], { 
        onConflict: 'token' 
      });

    if (error) throw error;
    console.log('✅ Push token saved to Supabase');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Send push notification to all devices
export async function sendPushNotification(title: string, body: string, data?: any) {
  try {
    // Get all push tokens from Supabase
    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token');

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found');
      return;
    }

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
          return response.json();
        } catch (error) {
          console.error('Error sending notification:', error);
          return null;
        }
      })
    );

    console.log('✅ Notifications sent:', responses.length);
    return responses;
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}

// Send notification when new candidate added
export async function notifyNewCandidate(candidateName: string, candidateJob: string) {
  const title = `🆕 New Candidate Available!`;
  const body = `${candidateName} - ${candidateJob}`;
  const data = {
    type: 'new_candidate',
    candidateId: null, // We don't have the ID yet
  };
  
  return sendPushNotification(title, body, data);
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