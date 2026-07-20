'use client';

import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Loading from './Loading';
import { chatAPI } from '@/lib/api';
import { Message } from '@/lib/types';

interface ChatContainerProps {
  sessionId: string;
  pendingQuestion?: string | null;
  onPendingQuestionConsumed?: () => void;
}

const SUGGESTED_PROMPTS = [
  'What gate is my flight at?',
  'Track my baggage',
  'List all flights',
];

export default function ChatContainer({ sessionId, pendingQuestion, onPendingQuestionConsumed }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatAPI.getHistory(sessionId);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    loadHistory();
  }, [sessionId]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: message, timestamp: new Date().toISOString() }]);
    setIsLoading(true);
    try {
      const response = await chatAPI.sendMessage(sessionId, message);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!pendingQuestion) return;
    handleSendMessage(pendingQuestion);
    onPendingQuestionConsumed?.();
    // Only re-run when a new question comes in, not on every handleSendMessage identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex-1 overflow-auto p-4">
        <MessageList messages={messages} suggestions={SUGGESTED_PROMPTS} onSuggestionClick={handleSendMessage} />
        {isLoading && <Loading />}
      </div>
      {error && <div className="px-4 pb-2 text-sm text-red-600">{error}</div>}
      <div className="p-4 border-t border-gray-200 bg-white">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="text-xs text-gray-400 text-center mt-2">AI can make mistakes. Double-check details.</p>
      </div>
    </div>
  );
}
