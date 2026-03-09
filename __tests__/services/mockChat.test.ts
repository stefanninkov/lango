import {
  getConversations,
  startConversation,
  sendMessage,
  deleteConversation,
} from '../../src/services/mockChatService';

const uid = 'chat-test-user';

describe('mockChatService', () => {
  it('returns empty conversations for new user', async () => {
    const convs = await getConversations(uid);
    expect(convs).toEqual([]);
  });

  it('starts a conversation with topic starter', async () => {
    const conv = await startConversation(uid, 'es', 'greetings');
    expect(conv.id).toBeTruthy();
    expect(conv.topic).toBe('greetings');
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].role).toBe('assistant');
    expect(conv.messages[0].content).toContain('Spanish');
  });

  it('starts Italian conversation', async () => {
    const conv = await startConversation(uid, 'it', 'food');
    expect(conv.messages[0].content).toContain('Italian');
  });

  it('sends message and gets AI response', async () => {
    const conv = await startConversation(uid, 'es', 'free');
    const response = await sendMessage(uid, conv.id, 'Hola, me llamo Juan', 'es');
    expect(response.role).toBe('assistant');
    expect(response.content).toBeTruthy();
  });

  it('stores messages in conversation', async () => {
    const conv = await startConversation(uid, 'es', 'free');
    await sendMessage(uid, conv.id, 'Hola', 'es');
    const convs = await getConversations(uid);
    const updated = convs.find((c) => c.id === conv.id);
    // starter + user msg + ai response = 3
    expect(updated!.messages.length).toBe(3);
  });

  it('deletes a conversation', async () => {
    const conv = await startConversation(uid, 'es', 'free');
    const convId = conv.id;
    await deleteConversation(uid, convId);
    const convs = await getConversations(uid);
    expect(convs.find((c) => c.id === convId)).toBeUndefined();
  });

  it('throws on sending to nonexistent conversation', async () => {
    await expect(sendMessage(uid, 'nonexistent', 'hello', 'es')).rejects.toThrow(
      'Conversation not found'
    );
  });
});
