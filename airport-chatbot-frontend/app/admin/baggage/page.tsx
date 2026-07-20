'use client';

import { useState } from 'react';
import { Baggage } from '@/lib/types';
import { baggageAPI } from '@/lib/api';
import BaggageForm from '@/components/admin/BaggageForm';
import BaggageTable from '@/components/admin/BaggageTable';

export default function BaggagePage() {
  const [results, setResults] = useState<Baggage[]>([]);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'tag' | 'flight'>('flight');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [editing, setEditing] = useState<Baggage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      if (searchMode === 'tag') {
        const baggage = await baggageAPI.getByTagId(query.trim());
        setResults([baggage]);
      } else {
        const baggage = await baggageAPI.getByFlightNumber(query.trim().toUpperCase());
        setResults(baggage);
      }
    } catch (error) {
      console.error('Baggage search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch();
  };

  const handleSubmit = async (data: Partial<Baggage>) => {
    if (editing) {
      await baggageAPI.update(editing.tagId, data);
    } else {
      await baggageAPI.create(data);
    }
    setShowForm(false);
    setEditing(null);
    if (searched) await runSearch();
  };

  const handleDelete = async (baggage: Baggage) => {
    if (!confirm(`Delete baggage tag ${baggage.tagId}?`)) return;
    await baggageAPI.delete(baggage.tagId);
    setResults((prev) => prev.filter((b) => b.tagId !== baggage.tagId));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl font-extrabold text-navy">Baggage Tracking</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((v) => !v);
          }}
          className="px-4 py-2 bg-cta text-white rounded-lg hover:bg-navy font-medium"
        >
          {showForm ? 'Close' : '+ New Baggage Tag'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <BaggageForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search by</label>
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as 'tag' | 'flight')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          >
            <option value="flight">Flight Number</option>
            <option value="tag">Tag ID</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchMode === 'flight' ? 'KLM234' : 'PBM-FL234-001'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && (
        <BaggageTable
          baggage={results}
          onEdit={(b) => {
            setEditing(b);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
