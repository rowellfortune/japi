import { PlaneIcon } from './icons';

export default function Loading() {
  return (
    <div className="flex items-end gap-2 justify-start animate-[messageIn_0.35s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="w-7 h-7 shrink-0 rounded-full bg-navy flex items-center justify-center shadow-sm">
        <PlaneIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-black/5 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-navy/50 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-navy/50 rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-1.5 h-1.5 bg-navy/50 rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>
      </div>
    </div>
  );
}
