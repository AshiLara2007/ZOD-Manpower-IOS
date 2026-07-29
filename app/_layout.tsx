import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatBot from '../components/ChatBot';
import { AppProvider } from '../lib/AppContext';
import { registerForPushNotificationsAsync, savePushToken } from '../lib/notifications';
import DeepLinkHandler from './deep-link-handler';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        savePushToken(token.data);
      }
    });

    // ✅ Listen for notifications (Fixed)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    // ✅ Listen for notification taps (Fixed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('📱 Notification tapped:', data);
      
      if (data?.type === 'new_candidate' && data?.candidateId) {
        router.push(`/candidate/${data.candidateId}`);
      }
    });

    // ✅ Cleanup (Fixed - Using removeNotificationSubscription)
    return () => {
      if (notificationListener.current) {
        // ✅ Correct way to remove listener
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        // ✅ Correct way to remove listener
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" backgroundColor="#1a237e" />
        <DeepLinkHandler />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="candidate/[id]" />
        </Stack>
        {/* ✅ ChatBot Component - Shows on all pages */}
        <ChatBot />
      </AppProvider>
    </SafeAreaProvider>
  );
}