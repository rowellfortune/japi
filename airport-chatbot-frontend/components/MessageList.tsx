'use client';

import { Message } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PlaneIcon } from './icons';
import FlightCards from './chat/FlightCards';
import FlightDetailCard from './chat/FlightDetailCard';

interface MessageListProps {
  messages: Message[];
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-1 list-disc marker:text-cta">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 space-y-1 list-decimal marker:text-cta">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cta underline underline-offset-2 hover:text-navy transition-colors">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded bg-black/[0.06] text-[0.85em] font-mono text-navy break-words">{children}</code>
  ),
  table: ({ children }) => (
    <div className="mb-2 last:mb-0 overflow-x-auto rounded-lg border border-black/10">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-navy/5">{children}</thead>,
  th: ({ children }) => <th className="text-left font-semibold text-navy px-2.5 py-1.5 border-b border-black/10 whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-2.5 py-1.5 border-b border-black/5 last:border-b-0 align-top">{children}</td>,
  hr: () => <hr className="my-2 border-black/10" />,
};

function Avatar() {
  return (
    <div className="w-7 h-7 shrink-0 rounded-full bg-navy flex items-center justify-center shadow-sm">
      <PlaneIcon className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  // A single-flight detail reply is fully represented by the card below — showing the model's
  // text summary alongside it just duplicates what the card already says.
  const cardOnly = !isUser && !!message.flight;

  return (
    <div className="animate-[messageIn_0.35s_cubic-bezier(0.16,1,0.3,1)_both]">
      {cardOnly ? (
        <div className="flex items-start gap-2">
          <Avatar />
          <div className="flex-1 min-w-0">
            <FlightDetailCard flight={message.flight!} />
            <span className="block text-[11px] text-slate-muted/70 mt-1 px-1">{formatDate(message.timestamp)}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <Avatar />}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%] lg:max-w-md`}>
              <div
                className={`px-4 py-2.5 shadow-sm ${
                  isUser
                    ? 'bg-cta text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-gray-900 border border-black/5 rounded-2xl rounded-bl-md'
                }`}
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm [&_:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-muted/70 mt-1 px-1">{formatDate(message.timestamp)}</span>
            </div>
          </div>
          {/* Flight list cards render full-width (not constrained to the chat-bubble width) so
              their content isn't cramped into the narrow bubble column. */}
          {!isUser && message.flights && message.flights.length > 0 && (
            <div className="w-full pl-9">
              <FlightCards flights={message.flights} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MessageList({ messages, suggestions = [], onSuggestionClick }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-2 text-center">
        <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center shadow-sm">
          <PlaneIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-navy">How can I help you?</h2>
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick?.(s)}
                className="cursor-pointer px-4 py-2 rounded-full border border-cta/30 bg-white text-cta text-sm text-left hover:bg-cta/5 transition-colors"
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
        <ChatBubble key={idx} message={msg} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
