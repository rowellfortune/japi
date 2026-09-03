'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ExternalLinkIcon } from '../icons';
import DateField from '../ui/DateField';
import TimeField from '../ui/TimeField';

const TERMINALS = ['Main Terminal'];

export default function ParkingForm() {
  const [entryDate, setEntryDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [terminal, setTerminal] = useState('');

  return (
    <div>
      <p className="font-heading font-bold text-navy text-lg mb-5">
        Save money when you reserve parking in advance.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <DateField
          id="parking-entry-date"
          label="Entry date (required)"
          value={entryDate}
          onChange={setEntryDate}
          placeholder="Entry date"
        />

        <TimeField
          id="parking-entry-time"
          label="Entry time (required)"
          value={entryTime}
          onChange={setEntryTime}
          placeholder="Entry time"
        />

        <DateField
          id="parking-exit-date"
          label="Exit date (required)"
          value={exitDate}
          onChange={setExitDate}
          placeholder="Exit date"
          minDate={entryDate || undefined}
        />

        <TimeField
          id="parking-exit-time"
          label="Exit time (required)"
          value={exitTime}
          onChange={setExitTime}
          placeholder="Exit time"
        />
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end mt-4">
        <div>
          <label htmlFor="parking-terminal" className="block text-xs font-semibold text-slate-muted uppercase mb-1">
            Departure terminal
          </label>
          <div className="relative">
            <select
              id="parking-terminal"
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
            >
              <option value="">Select departure terminal</option>
              {TERMINALS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-navy absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Link
          href="/parking"
          className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-cta text-white text-sm font-semibold hover:bg-navy transition-colors whitespace-nowrap"
        >
          Book your parking
          <ExternalLinkIcon className="w-4 h-4" />
        </Link>
      </div>

      <Link
        href="/parking"
        className="cursor-pointer inline-block mt-4 text-sm font-medium text-cta hover:text-navy transition-colors"
      >
        Click for parking rates, availability, and more info
      </Link>
    </div>
  );
}
