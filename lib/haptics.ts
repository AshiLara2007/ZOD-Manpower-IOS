import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  if (Platform.OS === 'ios') {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } else {
    // Android - Simple vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// For simple click feedback
export const clickHaptic = () => {
  triggerHaptic('light');
};

// For button press feedback
export const buttonHaptic = () => {
  triggerHaptic('medium');
};

// For success/confirmation feedback
export const successHaptic = () => {
  triggerHaptic('success');
};

// For error feedback
export const errorHaptic = () => {
  triggerHaptic('error');
};