// Lets any part of the page (e.g. the hero's "Ask" suggestions) open the floating chat
// widget and optionally send a question, without prop-drilling through the whole tree.
const OPEN_EVENT = 'pbm-chat:open';
const ASK_EVENT = 'pbm-chat:ask';

export function openChat() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function askChat(question: string) {
  window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: question }));
}

export function onOpenChat(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

export function onAskChat(handler: (question: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  window.addEventListener(ASK_EVENT, listener);
  return () => window.removeEventListener(ASK_EVENT, listener);
}
