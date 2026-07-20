'use client';

import { useEffect, useState } from 'react';
import { Gate } from '@/lib/types';
import { gateAPI } from '@/lib/api';
import GateForm from '@/components/admin/GateForm';
import GateTable from '@/components/admin/GateTable';

export default function GatesPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Gate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadGates = async () => {
    setLoading(true);
    try {
      const data = await gateAPI.getAll();
      setGates(data);
    } catch (error) {
      console.error('Failed to load gates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGates();
  }, []);

  const handleSubmit = async (data: Partial<Gate>) => {
    if (editing) {
      await gateAPI.update(editing.gateNumber, data);
    } else {
      await gateAPI.create(data);
    }
    setShowForm(false);
    setEditing(null);
    await loadGates();
  };

  const handleDelete = async (gate: Gate) => {
    if (!confirm(`Delete gate ${gate.gateNumber}?`)) return;
    await gateAPI.delete(gate.gateNumber);
    await loadGates();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-navy">Gate Management</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((v) => !v);
          }}
          className="px-4 py-2 bg-cta text-white rounded-lg hover:bg-navy font-medium"
        >
          {showForm ? 'Close' : '+ New Gate'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <GateForm
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
        <div className="p-4 text-gray-500">Loading gates...</div>
      ) : (
        <GateTable
          gates={gates}
          onEdit={(gate) => {
            setEditing(gate);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
