import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
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

// ✅ Quick Reply Suggestions
const QUICK_REPLIES = {
  en: [
    { id: 'candidates', label: '🔍 Find Candidates' },
    { id: 'jobs', label: '💼 Job Openings' },
    { id: 'pricing', label: '💰 Pricing Info' },
    { id: 'contact', label: '📞 Contact Us' },
  ],
  ar: [
    { id: 'candidates', label: '🔍 بحث عن مرشحين' },
    { id: 'jobs', label: '💼 الوظائف الشاغرة' },
    { id: 'pricing', label: '💰 معلومات الأسعار' },
    { id: 'contact', label: '📞 اتصل بنا' },
  ]
};

// ✅ Typing Animation Component
const TypingIndicator = ({ colors }: { colors: any }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.typingContainer, { backgroundColor: colors.card }]}>
      <View style={styles.typingDots}>
        <View style={[styles.typingDot, { backgroundColor: colors.primary + '80' }]} />
        <View style={[styles.typingDot, { backgroundColor: colors.primary + '80' }]} />
        <View style={[styles.typingDot, { backgroundColor: colors.primary + '80' }]} />
      </View>
      <Text style={[styles.typingText, { color: colors.textSecondary }]}>
        AI is thinking{dots}
      </Text>
    </View>
  );
};

// ✅ Chat Message Item
const ChatMessageItem = React.memo(({ 
  item, 
  colors, 
  onOptionPress, 
  onCandidatePress,
}: any) => {
  const isUser = item.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.botMessage,
      { 
        backgroundColor: isUser ? colors.primary : colors.card,
        opacity: fadeAnim,
      }
    ]}>
      {!isUser && (
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}

      <View style={[styles.messageContent, isUser ? styles.userContent : styles.botContent]}>
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
                  onPress={() => onCandidatePress(candidate.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.candidateRow}>
                    <Image source={{ uri: imageUrl }} style={styles.candidateImage} />
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
            {item.options.map((option: ChatOption) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => onOptionPress(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, { color: colors.primary }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
});

interface ChatBotProps {
  onCandidateSelect?: (candidateId: number) => void;
}

export default function ChatBot({ onCandidateSelect }: ChatBotProps) {
  const insets = useSafeAreaInsets();
  const { colors, language: appLanguage } = useApp(); // Use app language for RTL
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>(appLanguage || 'en');
  const [showLanguageSelect, setShowLanguageSelect] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ Quick Replies
  const quickReplies = useMemo(() => {
    return language === 'en' ? QUICK_REPLIES.en : QUICK_REPLIES.ar;
  }, [language]);

  // ✅ Handle Send
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    inputRef.current?.blur();

    try {
      const response = await getBotResponse(text, language);
      
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text,
        options: response.options,
        candidates: response.candidates,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: language === 'en' 
          ? '❌ Sorry, I encountered an error. Please try again or contact our support team.' 
          : '❌ عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بفريق الدعم.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      scrollToBottom();
    }
  }, [input, loading, language, scrollToBottom, isOpen]);

  // ✅ Handle Quick Reply
  const handleQuickReply = useCallback((replyId: string) => {
    const replyMap: Record<string, string> = {
      candidates: language === 'en' ? 'Search candidates' : 'بحث عن مرشحين',
      jobs: language === 'en' ? 'Show jobs' : 'عرض الوظائف',
      pricing: language === 'en' ? 'Pricing' : 'الأسعار',
      contact: language === 'en' ? 'Contact us' : 'اتصل بنا',
    };
    const text = replyMap[replyId] || replyId;
    setInput(text);
    setTimeout(() => handleSend(), 100);
  }, [language, handleSend]);

  // ✅ Handle Option Press
  const handleOptionPress = useCallback(async (option: ChatOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      // Update welcome message
      setMessages([]);
      const welcomeMsg = option.action === 'en' 
        ? '👋 Welcome to ZOD Manpower AI Assistant!\n\nHow can I help you today?' 
        : '👋 مرحباً بك في مساعد ZOD Manpower الذكي!\n\nكيف يمكنني مساعدتك اليوم؟';
      setMessages([{
        id: '1',
        role: 'bot',
        text: welcomeMsg,
        options: [
          { id: 'search', label: option.action === 'en' ? '🔍 Search Candidates' : '🔍 بحث عن مرشحين', action: 'search' },
          { id: 'info', label: option.action === 'en' ? 'ℹ️ More Information' : 'ℹ️ مزيد من المعلومات', action: 'info' },
          { id: 'contact', label: option.action === 'en' ? '📞 Contact Us' : '📞 اتصل بنا', action: 'contact' },
        ],
        timestamp: new Date(),
      }]);
      setShowLanguageSelect(false);
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
    setIsTyping(true);

    try {
      const response = await getBotResponse(option.action, language);
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      
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
      setIsTyping(false);
      scrollToBottom();
    }
  }, [language, scrollToBottom]);

  // ✅ Handle Candidate Press
  const handleCandidatePress = useCallback((candidateId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsOpen(false);
    if (onCandidateSelect) {
      onCandidateSelect(candidateId);
    } else {
      router.push(`/candidate/${candidateId}`);
    }
  }, [onCandidateSelect]);

  // ✅ Reset Unread Count on Open
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
    setShowLanguageSelect(true);
  }, []);

  // ✅ Render Message
  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <ChatMessageItem
      item={item}
      colors={colors}
      onOptionPress={handleOptionPress}
      onCandidatePress={handleCandidatePress}
    />
  ), [colors, handleOptionPress, handleCandidatePress]);

  // ✅ Language Selection Screen
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
                    text: '👋 Welcome to ZOD Manpower AI Assistant!\n\nI\'m here to help you find the perfect candidates, answer your questions, and assist with recruitment.\n\nHow can I help you today?',
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
                    text: '👋 مرحباً بك في مساعد ZOD Manpower الذكي!\n\nأنا هنا لمساعدتك في العثور على المرشحين المثاليين، والإجابة على أسئلتك، والمساعدة في التوظيف.\n\nكيف يمكنني مساعدتك اليوم؟',
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

  // ✅ Chat Button (when closed) - with Unread Badge
  if (!isOpen) {
    return (
      <TouchableOpacity
        style={[
          styles.chatButton,
          { 
            backgroundColor: colors.primary,
            bottom: insets.bottom + 75,
          }
        ]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text style={styles.chatButtonText}>💬</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ✅ Chat Main View
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>🤖</Text>
              <View>
                <Text style={styles.headerTitle}>ZOD AI Assistant</Text>
                <Text style={styles.headerSubtitle}>Online • Developed by Lara Williams</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerCloseBtn}>
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'en' 
                    ? '👋 Start a conversation with ZOD AI Assistant' 
                    : '👋 ابدأ محادثة مع مساعد ZOD الذكي'}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  {language === 'en'
                    ? 'Ask about candidates, jobs, pricing, or anything else!'
                    : 'اسأل عن المرشحين، الوظائف، الأسعار، أو أي شيء آخر!'}
                </Text>
              </View>
            }
          />

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator colors={colors} />}

          {/* Quick Replies */}
          <View style={styles.quickRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  style={[styles.quickReplyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleQuickReply(reply.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickReplyText, { color: colors.primary }]}>
                    {reply.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

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
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
              activeOpacity={0.7}
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
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: height * 0.8,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  headerCloseBtn: {
    padding: 4,
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
    flexDirection: 'row',
    maxWidth: '90%',
    marginBottom: 8,
    borderRadius: 16,
    padding: 12,
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
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
  },
  userContent: {
    alignItems: 'flex-end',
  },
  botContent: {
    alignItems: 'flex-start',
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '500',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});