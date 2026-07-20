import { Request, Response } from 'express';
import { ChatHistory } from '../models/ChatHistory';
import { chatGPTService } from '../services/chatGPTService';
import { sanitizeInput } from '../utils/helpers';
import { logger } from '../utils/logger';

export const postMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message, userId } = req.body;

    if (!sessionId || typeof sessionId !== 'string' || !message || typeof message !== 'string') {
      return res.status(400).json({ error: 'sessionId and message required' });
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

    res.json({ role: 'assistant', content: assistantMessage, timestamp: new Date() });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const chatHistory = await ChatHistory.findOne({ sessionId });
    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chatHistory.messages });
  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
