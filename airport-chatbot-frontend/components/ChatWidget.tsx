'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatContainer from './ChatContainer';
import { PlaneIcon } from './icons';
import { generateSessionId, getSessionIdFromStorage } from '@/lib/utils';
import { onAskChat, onOpenChat } from '@/lib/chatBus';

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getSessionIdFromStorage());
  }, []);

  useEffect(() => {
    const offOpen = onOpenChat(() => setIsOpen(true));
    const offAsk = onAskChat((question) => {
      setIsOpen(true);
      setPendingQuestion(question);
    });
    return () => {
      offOpen();
      offAsk();
    };
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const handleNewChat = () => {
    const fresh = generateSessionId();
    localStorage.setItem('chatSessionId', fresh);
    setSessionId(fresh);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-hidden={!isOpen}
        aria-label="AI Assistant chat"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 font-heading font-bold text-navy">
            <PlaneIcon className="w-5 h-5 text-cta" />
            AI Assistant
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={handleNewChat} className="cursor-pointer text-slate-muted hover:text-navy transition-colors">
              ↻ New chat
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="cursor-pointer text-slate-muted hover:text-navy transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {sessionId && (
            <ChatContainer
              key={sessionId}
              sessionId={sessionId}
              pendingQuestion={pendingQuestion}
              onPendingQuestionConsumed={() => setPendingQuestion(null)}
            />
          )}
        </div>
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="cursor-pointer fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cta text-white shadow-lg flex items-center justify-center hover:bg-navy transition-colors"
        >
          <PlaneIcon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
