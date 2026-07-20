'use client';

import { Message } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export default function MessageList({ messages, suggestions = [], onSuggestionClick }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-2 text-center">
        <h2 className="text-2xl font-bold text-indigo-600">How can I help you?</h2>
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick?.(s)}
                className="px-4 py-2 rounded-full border border-indigo-300 bg-white text-indigo-700 text-sm text-left hover:bg-indigo-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            <p className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
