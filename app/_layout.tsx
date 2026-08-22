import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatBot from '../components/ChatBot';
import RatingPrompt from '../components/RatingPrompt';
import { AppProvider } from '../lib/AppContext';
import { registerForPushNotificationsAsync, savePushToken } from '../lib/notifications';
import { hasRatedApp } from '../lib/rateApp';
import DeepLinkHandler from './deep-link-handler';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const [showRating, setShowRating] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        savePushToken(token.data);
      }
    });

    // Check and show rating prompt
    const checkAndShowRating = async () => {
      const rated = await hasRatedApp();
      if (!rated) {
        // Show after 10 seconds
        setTimeout(() => {
          setShowRating(true);
        }, 10000);
      }
    };
    checkAndShowRating();

    // ✅ Show ChatBot Icon after app loads (500ms delay)
    const chatBotTimer = setTimeout(() => {
      setShowChatBot(true);
    }, 500);

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('📱 Notification tapped:', data);
      
      if (data?.type === 'new_candidate' && data?.candidateId) {
        router.push(`/candidate/${data.candidateId}`);
      }
    });

    return () => {
      clearTimeout(chatBotTimer);
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" backgroundColor="#1a237e" />
        <DeepLinkHandler />
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="candidate/[id]" />
          </Stack>
          {/* ✅ ChatBot - Shows after app loads */}
          {showChatBot && <ChatBot />}
          <RatingPrompt visible={showRating} onClose={() => setShowRating(false)} />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});