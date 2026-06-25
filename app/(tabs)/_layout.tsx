import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../../lib/AppContext';

// Heavy Impact Haptic Function
const triggerHeavyHaptic = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

// Custom Tab Button Component with Haptic
const TabButton = ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => {
  const handlePress = () => {
    triggerHeavyHaptic();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const { t, colors } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarButton: (props) => {
          const { onPress, children } = props;
          return (
            <TabButton onPress={onPress}>
              {children}
            </TabButton>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: t('candidates'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('jobs'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💼</Text>,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t('about'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>ℹ️</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}