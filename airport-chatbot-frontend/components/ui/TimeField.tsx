'use client';

import { useEffect, useRef, useState } from 'react';
import { ClockIcon } from '../icons';

interface TimeFieldProps {
  id: string;
  label: string;
  value: string; // 'HH:mm' (24h) or ''
  onChange: (value: string) => void;
  placeholder?: string;
}

type Meridiem = 'AM' | 'PM';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const MERIDIEMS: Meridiem[] = ['AM', 'PM'];

function to24h(hour12: string, minute: string, meridiem: Meridiem): string {
  let h = parseInt(hour12, 10) % 12;
  if (meridiem === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

function from24h(value: string): { hour12: string; minute: string; meridiem: Meridiem } | null {
  if (!value) return null;
  const [hStr, minute] = value.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const meridiem: Meridiem = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12: String(hour12).padStart(2, '0'), minute: MINUTES.includes(minute) ? minute : '00', meridiem };
}

function formatDisplay(value: string) {
  const parts = from24h(value);
  if (!parts) return '';
  return `${parts.hour12}:${parts.minute} ${parts.meridiem}`;
}

export default function TimeField({ id, label, value, onChange, placeholder = 'Select time' }: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = from24h(value);
  const [hour, setHour] = useState(parsed?.hour12 ?? '12');
  const [minute, setMinute] = useState(parsed?.minute ?? '00');
  const [meridiem, setMeridiem] = useState<Meridiem>(parsed?.meridiem ?? 'AM');

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const commit = (h: string, m: string, mer: Meridiem) => onChange(to24h(h, m, mer));

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-muted uppercase mb-1">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={`cursor-pointer w-full flex items-center justify-between pl-3 pr-3 py-2.5 border rounded-md text-sm text-left focus:outline-none focus:ring-2 focus:ring-cta ${
          open ? 'border-cta ring-2 ring-cta' : 'border-gray-300'
        } ${value ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <ClockIcon className="w-5 h-5 text-navy shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="max-h-48 overflow-y-auto py-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setHour(h);
                    commit(h, minute, meridiem);
                  }}
                  className={`cursor-pointer w-full text-center py-1.5 text-sm transition-colors ${
                    h === hour ? 'bg-cta/10 text-cta font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMinute(m);
                    commit(hour, m, meridiem);
                  }}
                  className={`cursor-pointer w-full text-center py-1.5 text-sm transition-colors ${
                    m === minute ? 'bg-cta/10 text-cta font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {MERIDIEMS.map((mer) => (
                <button
                  key={mer}
                  type="button"
                  onClick={() => {
                    setMeridiem(mer);
                    commit(hour, minute, mer);
                  }}
                  className={`cursor-pointer w-full text-center py-1.5 text-sm transition-colors ${
                    mer === meridiem ? 'bg-cta/10 text-cta font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mer}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-sm font-semibold text-cta hover:text-navy"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
