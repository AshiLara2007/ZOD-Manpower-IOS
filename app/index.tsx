import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../lib/AppContext';

const { width, height } = Dimensions.get('window');
const LOGO_URL = "https://zodmanpower.info/logo/logo.jpeg";

export default function WelcomeScreen() {
  const { updateLanguage, updateTheme, language, theme } = useApp();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<string | null>(language || null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(theme || null);

  useEffect(() => {
    checkPreferences();
  }, []);

  const checkPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('manpower_app_preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        // If user already has preferences, go directly to app
        if (prefs.language && prefs.theme) {
          // Update app context with saved preferences
          updateLanguage(prefs.language);
          updateTheme(prefs.theme);
          router.replace('/(tabs)');
          return;
        }
      }
      setLoading(false);
      setStep(1);
    } catch (error) {
      setLoading(false);
      setStep(1);
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLang(lang);
    updateLanguage(lang as 'en' | 'ar');
  };

  const handleThemeSelect = (thm: string) => {
    setSelectedTheme(thm);
    updateTheme(thm as 'light' | 'dark');
  };

  const savePreferences = async () => {
    if (selectedLang && selectedTheme) {
      try {
        await AsyncStorage.setItem('manpower_app_preferences', JSON.stringify({
          language: selectedLang,
          theme: selectedTheme,
        }));
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4880F" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Step 1: Language Selection
  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.title}>Welcome to ZOD Manpower</Text>
          <Text style={styles.subtitle}>Select your preferred language</Text>

          <TouchableOpacity
            style={[styles.option, selectedLang === 'en' && styles.optionSelected]}
            onPress={() => handleLanguageSelect('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selectedLang === 'en' && styles.optionSelectedText]}>
              🇬🇧 English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selectedLang === 'ar' && styles.optionSelected]}
            onPress={() => handleLanguageSelect('ar')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selectedLang === 'ar' && styles.optionSelectedText]}>
              🇶🇦 العربية
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !selectedLang && styles.buttonDisabled]}
            onPress={() => setStep(2)}
            disabled={!selectedLang}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Theme Selection
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.title}>Select Theme</Text>
          <Text style={styles.subtitle}>Choose your preferred appearance</Text>

          <TouchableOpacity
            style={[styles.option, selectedTheme === 'light' && styles.optionSelected]}
            onPress={() => handleThemeSelect('light')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selectedTheme === 'light' && styles.optionSelectedText]}>
              ☀️ Light Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selectedTheme === 'dark' && styles.optionSelected]}
            onPress={() => handleThemeSelect('dark')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selectedTheme === 'dark' && styles.optionSelectedText]}>
              🌙 Dark Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !selectedTheme && styles.buttonDisabled]}
            onPress={savePreferences}
            disabled={!selectedTheme}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Get Started →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4880F',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  option: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  optionSelected: {
    borderColor: '#D4880F',
    backgroundColor: '#D4880F15',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSelectedText: {
    color: '#D4880F',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#D4880F',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});