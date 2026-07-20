'use client';

import { useState } from 'react';
import { Baggage } from '@/lib/types';

const STATUSES: Baggage['status'][] = ['Checked In', 'Loaded', 'In Transit', 'Arrived', 'Unclaimed', 'Lost'];

interface BaggageFormProps {
  initial?: Baggage | null;
  onSubmit: (data: Partial<Baggage>) => Promise<void>;
  onCancel: () => void;
}

export default function BaggageForm({ initial, onSubmit, onCancel }: BaggageFormProps) {
  const [form, setForm] = useState({
    tagId: initial?.tagId || '',
    flightNumber: initial?.flightNumber || '',
    passengerName: initial?.passengerName || '',
    passengerEmail: initial?.passengerEmail || '',
    destination: initial?.destination || '',
    status: initial?.status || 'Checked In',
    weight: initial?.weight?.toString() || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        flightNumber: form.flightNumber.toUpperCase(),
        weight: form.weight ? Number(form.weight) : undefined,
      } as Partial<Baggage>);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{initial ? 'Edit Baggage' : 'New Baggage Tag'}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tag ID</label>
          <input
            required
            disabled={!!initial}
            value={form.tagId}
            onChange={(e) => setForm({ ...form, tagId: e.target.value })}
            placeholder="PBM-FL234-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
          <input
            required
            value={form.flightNumber}
            onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
            placeholder="KLM234"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name</label>
          <input
            required
            value={form.passengerName}
            onChange={(e) => setForm({ ...form, passengerName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Email (optional)</label>
          <input
            type="email"
            value={form.passengerEmail}
            onChange={(e) => setForm({ ...form, passengerEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg, optional)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Baggage['status'] })}
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
