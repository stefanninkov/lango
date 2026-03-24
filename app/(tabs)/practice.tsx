import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressStore } from '../../src/stores/progressStore';
import * as chatService from '../../src/services/chatService';
import { isUsingClaudeApi } from '../../src/services/chatService';
import type { ChatMessage, Conversation } from '../../src/types';

const TOPICS = [
  { id: 'greetings', label: 'Greetings', icon: 'hand-wave' },
  { id: 'food', label: 'Food & Dining', icon: 'food' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'daily', label: 'Daily Life', icon: 'weather-sunny' },
  { id: 'free', label: 'Free Chat', icon: 'chat' },
];

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const progress = useProgressStore((s) => s.progress);
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetLang = user?.targetLanguage ?? 'es';
  const completedCount = progress?.completedLessons?.length ?? 0;

  const startChat = async (topic: string) => {
    if (!user) return;
    setLoading(true);
    const conv = await chatService.startConversation(user.uid, targetLang, topic);
    setConversation(conv);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || !user || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic: add user message immediately
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, userMsg] } : prev
    );

    try {
      const aiMsg = await chatService.sendMessage(user.uid, conversation.id, text, targetLang, user.level);
      setConversation((prev) => {
        if (!prev) return prev;
        // Replace temp message with actual, add AI response
        const messages = prev.messages.filter((m) => m.id !== userMsg.id);
        return {
          ...prev,
          messages: [
            ...messages,
            { ...userMsg, id: `msg-${Date.now() - 1}` },
            aiMsg,
          ],
        };
      });
    } catch (err) {
      // Show error as a system message in chat
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      setConversation((prev) =>
        prev ? { ...prev, messages: [...prev.messages, errorMsg] } : prev
      );
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    setConversation(null);
  };

  // Gate: require at least 1 completed lesson before practice
  if (!conversation && completedCount < 1) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Practice</Text>
        <View style={styles.gateContainer}>
          <MaterialCommunityIcons name="lock-outline" size={64} color={colors.textMuted} />
          <Text style={styles.gateTitle}>Complete a lesson first</Text>
          <Text style={styles.gateText}>
            Practice lets you have conversations in {targetLang === 'es' ? 'Spanish' : 'Italian'} with an AI tutor.
            Complete at least one lesson to learn some vocabulary and grammar before practicing.
          </Text>
          <Pressable
            style={styles.gateButton}
            onPress={() => router.push('/(tabs)/lessons')}
          >
            <Text style={styles.gateButtonText}>Go to Lessons</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Topic selection screen
  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>
          Choose a conversation topic to practice with your AI tutor
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.topicGrid}>
            {TOPICS.map((topic) => (
              <Pressable
                key={topic.id}
                style={styles.topicCard}
                onPress={() => startChat(topic.id)}
              >
                <MaterialCommunityIcons
                  name={topic.icon as any}
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.topicLabel}>{topic.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.mockBadge}>
          <MaterialCommunityIcons
            name={isUsingClaudeApi() ? 'brain' : 'robot'}
            size={16}
            color={isUsingClaudeApi() ? colors.secondary : colors.textMuted}
          />
          <Text style={[styles.mockText, isUsingClaudeApi() && { color: colors.secondary }]}>
            {isUsingClaudeApi()
              ? 'Claude AI — real conversations powered by your API key'
              : 'Mock mode — add your Claude API key in Settings for real AI conversations'}
          </Text>
        </View>
      </View>
    );
  }

  // Chat screen
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Chat header */}
      <View style={styles.chatHeader}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatTitle}>AI Tutor</Text>
          <Text style={styles.chatSubtitle}>
            {TOPICS.find((t) => t.id === conversation.topic)?.label ?? 'Free Chat'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.role === 'user' ? styles.userText : styles.aiText,
              ]}
            >
              {item.content}
            </Text>
            {item.correction && (
              <View style={styles.correctionBox}>
                <MaterialCommunityIcons name="pencil" size={14} color={colors.warning} />
                <Text style={styles.correctionText}>{item.correction}</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Typing indicator */}
      {sending && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>AI is typing...</Text>
        </View>
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={`Type in ${targetLang === 'es' ? 'Spanish' : 'Italian'}...`}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={input.trim() ? colors.white : colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  topicCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  topicLabel: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  mockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  mockText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  // Chat header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  chatTitle: {
    ...typography.h3,
  },
  chatSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Messages
  messageList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.textPrimary,
  },
  correctionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  correctionText: {
    ...typography.bodySmall,
    color: colors.warning,
    flex: 1,
  },
  typingIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  typingText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  // Gate styles
  gateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  gateTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  gateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  gateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  gateButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
