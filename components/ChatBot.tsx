import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../lib/AppContext';
import { ChatMessage, ChatOption, getBotResponse } from '../lib/chatBot';

const { width, height } = Dimensions.get('window');

interface ChatBotProps {
  onCandidateSelect?: (candidateId: number) => void;
}

export default function ChatBot({ onCandidateSelect }: ChatBotProps) {
  const insets = useSafeAreaInsets();
  const { colors, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [showLanguageSelect, setShowLanguageSelect] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Language Selection Screen
  if (showLanguageSelect && isOpen) {
    return (
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.languageModalContainer}>
          <View style={[styles.languageCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.languageTitle, { color: colors.text }]}>
              🌐 Select Language
            </Text>
            <Text style={[styles.languageSubtitle, { color: colors.textSecondary }]}>
              Choose your preferred language
            </Text>
            
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageSelect(false);
                setMessages([
                  {
                    id: '1',
                    role: 'bot',
                    text: '👋 Welcome to ZOD Manpower Chat Bot!\n\nHow can I help you today?\n\n1️⃣ Search Candidates\n2️⃣ More Information\n3️⃣ Contact Us\n\nType the number or tap the option below:',
                    options: [
                      { id: 'search', label: '🔍 Search Candidates', action: 'search' },
                      { id: 'info', label: 'ℹ️ More Information', action: 'info' },
                      { id: 'contact', label: '📞 Contact Us', action: 'contact' },
                    ],
                    timestamp: new Date(),
                  },
                ])
              }}
            >
              <Text style={styles.languageButtonText}>🇬🇧 English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setLanguage('ar');
                setShowLanguageSelect(false);
                setMessages([
                  {
                    id: '1',
                    role: 'bot',
                    text: '👋 مرحباً بكم في بوت محادثة ZOD Manpower!\n\nكيف يمكنني مساعدتك اليوم؟\n\n١️⃣ بحث عن مرشحين\n٢️⃣ مزيد من المعلومات\n٣️⃣ اتصل بنا\n\nاكتب الرقم أو اضغط على الخيار أدناه:',
                    options: [
                      { id: 'search', label: '🔍 بحث عن مرشحين', action: 'search' },
                      { id: 'info', label: 'ℹ️ مزيد من المعلومات', action: 'info' },
                      { id: 'contact', label: '📞 اتصل بنا', action: 'contact' },
                    ],
                    timestamp: new Date(),
                  },
                ])
              }}
            >
              <Text style={styles.languageButtonText}>🇶🇦 العربية</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageCloseButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={[styles.languageCloseText, { color: colors.textMuted }]}>
                ✕ Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ✅ Chat Button (when closed) - FIXED WITH BOTTOM
  if (!isOpen) {
    return (
      <TouchableOpacity
        style={[
          styles.chatButton,
          { 
            backgroundColor: colors.primary,
            bottom: insets.bottom + 75, // ✅ Bottom Nav එකට ඉහළින්
          }
        ]}
        onPress={() => {
          setIsOpen(true);
          setShowLanguageSelect(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.chatButtonText}>💬</Text>
      </TouchableOpacity>
    );
  }

  // Chat Main View
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    inputRef.current?.blur();

    try {
      const response = await getBotResponse(text, language);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text,
        options: response.options,
        candidates: response.candidates,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: language === 'en' ? '❌ Sorry, I encountered an error. Please try again.' : '❌ عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleOptionPress = async (option: ChatOption) => {
    if (option.action === 'open_whatsapp') {
      Linking.openURL('https://wa.me/97455355206');
      return;
    }
    if (option.action === 'send_email') {
      Linking.openURL('mailto:info@zodmanpower.info');
      return;
    }
    if (option.action === 'language') {
      setShowLanguageSelect(true);
      return;
    }
    if (option.action === 'en' || option.action === 'ar') {
      setLanguage(option.action);
      const response = await getBotResponse(option.action, option.action);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text,
        options: response.options,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: option.label,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await getBotResponse(option.action, language);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text,
        options: response.options,
        candidates: response.candidates,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleCandidatePress = (candidateId: number) => {
    setIsOpen(false);
    if (onCandidateSelect) {
      onCandidateSelect(candidateId);
    } else {
      router.push(`/candidate/${candidateId}`);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage,
        { backgroundColor: isUser ? colors.primary : colors.card }
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? '#fff' : colors.text }
        ]}>
          {item.text}
        </Text>

        {item.candidates && item.candidates.length > 0 && (
          <View style={styles.candidatesContainer}>
            {item.candidates.slice(0, 5).map((candidate: any) => {
              const imageUrl = candidate.pic || `https://ui-avatars.com/api/?name=${candidate.name?.charAt(0) || 'C'}&background=D4880F&color=fff&size=100`;
              
              return (
                <TouchableOpacity
                  key={candidate.id}
                  style={[styles.candidateItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleCandidatePress(candidate.id)}
                >
                  <View style={styles.candidateRow}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.candidateImage}
                    />
                    <View style={styles.candidateInfo}>
                      <Text style={[styles.candidateName, { color: colors.text }]}>
                        {candidate.name || 'N/A'}
                      </Text>
                      <Text style={[styles.candidateJob, { color: colors.textSecondary }]}>
                        💼 {candidate.job || 'N/A'}
                      </Text>
                      <Text style={[styles.candidateDetail, { color: colors.textMuted }]}>
                        📍 {candidate.country || 'N/A'} | 💰 {candidate.salary || 0} QAR
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {item.options && item.options.length > 0 && (
          <View style={styles.optionsContainer}>
            {item.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={[styles.optionText, { color: colors.primary }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsOpen(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Text style={styles.headerTitle}>💬 ZOD Chat Bot</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.headerClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          />

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'Typing...' : 'جاري الكتابة...'}
              </Text>
            </View>
          )}

          {/* Input */}
          <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder={language === 'en' ? 'Type a message...' : 'اكتب رسالة...'}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Language Selection
  languageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  languageCard: {
    width: '100%',
    maxWidth: 380,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  languageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  languageSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  languageButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageCloseButton: {
    marginTop: 8,
    padding: 8,
  },
  languageCloseText: {
    fontSize: 14,
  },
  // ✅ Chat Button - FIXED
  chatButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  chatButtonText: {
    fontSize: 26,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: height * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerClose: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 4,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  candidatesContainer: {
    marginTop: 8,
    gap: 6,
  },
  candidateItem: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  candidateJob: {
    fontSize: 12,
    marginTop: 2,
  },
  candidateDetail: {
    fontSize: 11,
    marginTop: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  loadingText: {
    fontSize: 12,
    marginLeft: 8,
  },
});