'use client';

import { useEffect, useState } from 'react';
import { Flight, Gate } from '@/lib/types';
import { gateAPI } from '@/lib/api';

const STATUSES: Flight['status'][] = ['Scheduled', 'Boarding', 'Delayed', 'Departed', 'Arrived', 'Cancelled'];

interface FlightFormProps {
  initial?: Flight | null;
  onSubmit: (data: Partial<Flight>) => Promise<void>;
  onCancel: () => void;
}

const toInputDate = (value?: string) => (value ? new Date(value).toISOString().slice(0, 16) : '');

export default function FlightForm({ initial, onSubmit, onCancel }: FlightFormProps) {
  const [gates, setGates] = useState<Gate[]>([]);
  const [form, setForm] = useState({
    flightNumber: initial?.flightNumber || '',
    airline: initial?.airline || '',
    origin: initial?.origin || '',
    destination: initial?.destination || '',
    departureTime: toInputDate(initial?.departureTime),
    arrivalTime: toInputDate(initial?.arrivalTime),
    status: initial?.status || 'Scheduled',
    aircraft: initial?.aircraft || '',
    gateId: typeof initial?.gateId === 'object' && initial?.gateId ? initial.gateId._id : (initial?.gateId as string) || '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    gateAPI.getAll().then(setGates).catch(() => setGates([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        flightNumber: form.flightNumber.toUpperCase(),
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: new Date(form.arrivalTime).toISOString(),
        gateId: form.gateId || null,
      } as Partial<Flight>);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{initial ? 'Edit Flight' : 'New Flight'}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
          <input
            required
            disabled={!!initial}
            value={form.flightNumber}
            onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
            placeholder="KLM234"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
          <input
            required
            value={form.airline}
            onChange={(e) => setForm({ ...form, airline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
          <input
            required
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
          <input
            type="datetime-local"
            required
            value={form.departureTime}
            onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
          <input
            type="datetime-local"
            required
            value={form.arrivalTime}
            onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Flight['status'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gate</label>
          <select
            value={form.gateId}
            onChange={(e) => setForm({ ...form, gateId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          >
            <option value="">Unassigned</option>
            {gates.map((g) => (
              <option key={g._id} value={g._id}>
                {g.gateNumber} ({g.terminal})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft</label>
          <input
            value={form.aircraft}
            onChange={(e) => setForm({ ...form, aircraft: e.target.value })}
            placeholder="Boeing 737"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
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
