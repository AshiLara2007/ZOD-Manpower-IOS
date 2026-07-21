import * as Linking from 'expo-linking';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

export default function DeepLinkHandler() {
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const handleDeepLink = async (event: any) => {
      const url = event.url;
      const parsed = Linking.parse(url);
      
      if (parsed.path === 'candidate' && parsed.queryParams?.id) {
        const candidateId = parsed.queryParams.id;
        // Wait for navigation to be ready
        if (navigationState?.key) {
          router.push(`/candidate/${candidateId}`);
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigationState]);

  return null;
}