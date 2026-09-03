'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface DateFieldProps {
  id: string;
  label: string;
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (value: string) => void;
  placeholder?: string;
  // 'YYYY-MM-DD' — days before this are disabled. Defaults to today.
  minDate?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

function formatDisplay(iso: string) {
  const p = parseISO(iso);
  if (!p) return '';
  return new Date(p.y, p.m, p.d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DateField({ id, label, value, onChange, placeholder = 'Select date', minDate }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selected = parseISO(value);
  const [viewYear, setViewYear] = useState(selected?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.m ?? today.getMonth());

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const minParts = minDate ? parseISO(minDate) : { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
  const minTime = minParts ? new Date(minParts.y, minParts.m, minParts.d).getTime() : null;

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const yearOptions = Array.from({ length: 6 }, (_, i) => today.getFullYear() + i);

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
        <CalendarIcon className="w-5 h-5 text-navy shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="cursor-pointer appearance-none bg-transparent pr-5 text-sm font-semibold text-navy focus:outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3.5 h-3.5 text-navy absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="cursor-pointer appearance-none bg-transparent pr-5 text-sm font-semibold text-navy focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3.5 h-3.5 text-navy absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label="Previous month"
                className="cursor-pointer p-1 rounded hover:bg-slate-100 text-navy"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                aria-label="Next month"
                className="cursor-pointer p-1 rounded hover:bg-slate-100 text-navy"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-xs font-medium text-slate-400 py-1">
                {w}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const iso = toISO(viewYear, viewMonth, day);
              const cellTime = new Date(viewYear, viewMonth, day).getTime();
              const disabled = minTime !== null && cellTime < minTime;
              const isSelected = value === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`w-8 h-8 mx-auto rounded-full text-sm flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'cursor-pointer bg-cta text-white font-semibold'
                      : disabled
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'cursor-pointer text-slate-700 hover:bg-cta/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
