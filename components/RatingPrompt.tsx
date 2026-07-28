import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../lib/AppContext';
import { requestStoreReview, setAppRated } from '../lib/rateApp';

const { width, height } = Dimensions.get('window');

interface RatingPromptProps {
  visible: boolean;
  onClose: () => void;
}

export default function RatingPrompt({ visible, onClose }: RatingPromptProps) {
  const { colors, t } = useApp();
  const [stars, setStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStarPress = (value: number) => {
    setStars(value);
  };

  const handleSubmit = async () => {
    if (stars >= 4) {
      // Good rating - ask for App Store review
      await requestStoreReview();
      await setAppRated();
    } else {
      // Low rating - show feedback message
      alert('Thank you for your feedback! We will work on improving.');
      await setAppRated();
    }
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setStars(0);
      setSubmitted(false);
    }, 1500);
  };

  const handleLater = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>⭐ Rate ZOD Manpower</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            How would you rate your experience?
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleStarPress(star)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.star,
                  { color: star <= stars ? '#FFD700' : colors.textMuted }
                ]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {stars > 0 && (
            <View style={styles.ratingLabel}>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {stars >= 5 ? 'Excellent!' :
                 stars >= 4 ? 'Great!' :
                 stars >= 3 ? 'Good' :
                 stars >= 2 ? 'Could be better' :
                 'Not satisfied'}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.laterButton, { backgroundColor: colors.background }]}
              onPress={handleLater}
            >
              <Text style={[styles.laterButtonText, { color: colors.textSecondary }]}>
                Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { 
                  backgroundColor: stars > 0 ? colors.primary : colors.textMuted,
                  opacity: stars > 0 ? 1 : 0.5
                }
              ]}
              onPress={handleSubmit}
              disabled={stars === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {stars >= 4 ? 'Rate on App Store' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    fontWeight: '300',
  },
  ratingLabel: {
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  laterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});