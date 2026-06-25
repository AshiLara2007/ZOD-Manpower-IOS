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

const { width, height } = Dimensions.get('window');
const LOGO_URL = "https://zodmanpower.info/logo/logo.jpeg";

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    checkPreferences();
  }, []);

  const checkPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('manpower_app_preferences');
      if (saved) {
        router.replace('/(tabs)');
      } else {
        setLoading(false);
        setStep(1);
      }
    } catch (error) {
      setLoading(false);
      setStep(1);
    }
  };

  const savePreferences = async () => {
    if (selectedLang && selectedTheme) {
      await AsyncStorage.setItem('manpower_app_preferences', JSON.stringify({
        language: selectedLang,
        theme: selectedTheme
      }));
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.title}>Select Language</Text>
          <Text style={styles.subtitle}>Choose your preferred language</Text>

          <TouchableOpacity
            style={[styles.option, selectedLang === 'en' && styles.optionSelected]}
            onPress={() => setSelectedLang('en')}
          >
            <Text style={styles.optionText}>🇬🇧 English</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selectedLang === 'ar' && styles.optionSelected]}
            onPress={() => setSelectedLang('ar')}
          >
            <Text style={styles.optionText}>🇶🇦 العربية</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !selectedLang && styles.buttonDisabled]}
            onPress={() => setStep(2)}
            disabled={!selectedLang}
          >
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: LOGO_URL }} style={styles.logo} />
        <Text style={styles.title}>Select Theme</Text>
        <Text style={styles.subtitle}>Choose your preferred appearance</Text>

        <TouchableOpacity
          style={[styles.option, selectedTheme === 'light' && styles.optionSelected]}
          onPress={() => setSelectedTheme('light')}
        >
          <Text style={styles.optionText}>☀️ Light</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, selectedTheme === 'dark' && styles.optionSelected]}
          onPress={() => setSelectedTheme('dark')}
        >
          <Text style={styles.optionText}>🌙 Dark</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !selectedTheme && styles.buttonDisabled]}
          onPress={savePreferences}
          disabled={!selectedTheme}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002F66',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#002F66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002F66',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  option: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#D4880F',
    backgroundColor: '#D4880F10',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
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