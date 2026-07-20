'use client';

import { useEffect, useState } from 'react';
import { Flight } from '@/lib/types';
import { flightAPI } from '@/lib/api';
import FlightForm from '@/components/admin/FlightForm';
import FlightTable from '@/components/admin/FlightTable';

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const data = await flightAPI.getAll();
      setFlights(data);
    } catch (error) {
      console.error('Failed to load flights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const handleSubmit = async (data: Partial<Flight>) => {
    if (editing) {
      await flightAPI.update(editing.flightNumber, data);
    } else {
      await flightAPI.create(data);
    }
    setShowForm(false);
    setEditing(null);
    await loadFlights();
  };

  const handleDelete = async (flight: Flight) => {
    if (!confirm(`Delete flight ${flight.flightNumber}?`)) return;
    await flightAPI.delete(flight.flightNumber);
    await loadFlights();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-navy">Flight Management</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((v) => !v);
          }}
          className="px-4 py-2 bg-cta text-white rounded-lg hover:bg-navy font-medium"
        >
          {showForm ? 'Close' : '+ New Flight'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <FlightForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="p-4 text-gray-500">Loading flights...</div>
      ) : (
        <FlightTable
          flights={flights}
          onEdit={(flight) => {
            setEditing(flight);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
