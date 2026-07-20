import { db } from '../lib/db';
import { handler, json, parseBody, pathParam, type ApiEvent } from '../lib/http';
import { ChatHistory } from '../models/ChatHistory';
import { chatGPTService } from '../services/chatGPTService';
import { sanitizeInput } from '../utils/helpers';

// Mirrors chatController.postMessage.
export const postMessage = handler(async (event: ApiEvent) => {
  await db();
  const { sessionId, message, userId } = parseBody<{ sessionId?: string; message?: string; userId?: string }>(event);

  if (!sessionId || typeof sessionId !== 'string' || !message || typeof message !== 'string') {
    return json(400, { error: 'sessionId and message required' });
  }

  const cleanMessage = sanitizeInput(message);

  let chatHistory = await ChatHistory.findOne({ sessionId });
  if (!chatHistory) {
    chatHistory = new ChatHistory({ sessionId, userId: userId || undefined, messages: [] });
  }

  const assistantMessage = await chatGPTService.chat(
    cleanMessage,
    chatHistory.messages.map((m) => ({ role: m.role, content: m.content }))
  );

  chatHistory.messages.push(
    { role: 'user', content: cleanMessage, timestamp: new Date() },
    { role: 'assistant', content: assistantMessage, timestamp: new Date() }
  );

  await chatHistory.save();

  return json(200, { role: 'assistant', content: assistantMessage, timestamp: new Date() });
});

// Mirrors chatController.getHistory.
export const getHistory = handler(async (event: ApiEvent) => {
  await db();
  const sessionId = pathParam(event, 'sessionId');

  const chatHistory = await ChatHistory.findOne({ sessionId });
  if (!chatHistory) return json(200, { messages: [] });

  return json(200, { messages: chatHistory.messages });
});
