import * as Linking from 'expo-linking';

// App Store Links
const APP_STORE_LINK = 'https://apps.apple.com/app/id6787450829';
const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.zod.manpower';

// Deep Link Generate කරන්න
export const generateDeepLink = (candidateId: string | number) => {
  return `zodmanpowerios://candidate/${candidateId}`;
};

// Web Fallback Link (App නැත්නම්)
export const generateWebLink = (candidateId: string | number) => {
  return `https://zodmanpower.info/candidate/${candidateId}`;
};

// Share Message Generate කරන්න
export const generateShareMessage = (candidateName: string, candidateId: string | number) => {
  const deepLink = generateDeepLink(candidateId);
  const webLink = generateWebLink(candidateId);
  
  return `👤 *${candidateName}*\n\n📱 Open in App: ${deepLink}\n🌐 Open in Browser: ${webLink}\n\n📲 Download ZOD Manpower App:\n${APP_STORE_LINK}`;
};


export const checkIfAppInstalled = async (): Promise<boolean> => {
  const url = 'zodmanpowerios://';
  try {
    const canOpen = await Linking.canOpenURL(url);
    return canOpen;
  } catch {
    return false;
  }
};


export const openDeepLink = async (candidateId: string | number) => {
  const deepLink = generateDeepLink(candidateId);
  const webLink = generateWebLink(candidateId);
  
  try {
    const canOpen = await Linking.canOpenURL(deepLink);
    if (canOpen) {
      await Linking.openURL(deepLink);
      return true;
    } else {
      
      await Linking.openURL(APP_STORE_LINK);
      return false;
    }
  } catch (error) {
    console.error('Error opening deep link:', error);
    await Linking.openURL(APP_STORE_LINK);
    return false;
  }
};