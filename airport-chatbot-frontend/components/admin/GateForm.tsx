'use client';

import { useState } from 'react';
import { Gate } from '@/lib/types';

const STATUSES: Gate['status'][] = ['Available', 'Occupied', 'Maintenance'];

interface GateFormProps {
  initial?: Gate | null;
  onSubmit: (data: Partial<Gate>) => Promise<void>;
  onCancel: () => void;
}

export default function GateForm({ initial, onSubmit, onCancel }: GateFormProps) {
  const [form, setForm] = useState({
    gateNumber: initial?.gateNumber || '',
    terminal: initial?.terminal || '',
    status: initial?.status || 'Available',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form as Partial<Gate>);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{initial ? 'Edit Gate' : 'New Gate'}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gate Number</label>
          <input
            required
            disabled={!!initial}
            value={form.gateNumber}
            onChange={(e) => setForm({ ...form, gateNumber: e.target.value })}
            placeholder="A5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
          <input
            required
            value={form.terminal}
            onChange={(e) => setForm({ ...form, terminal: e.target.value })}
            placeholder="Terminal 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Gate['status'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-cta text-white rounded-lg hover:bg-navy disabled:opacity-50 font-medium"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
