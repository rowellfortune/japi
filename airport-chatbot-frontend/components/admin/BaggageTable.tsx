'use client';

import { Baggage } from '@/lib/types';

interface BaggageTableProps {
  baggage: Baggage[];
  onEdit: (baggage: Baggage) => void;
  onDelete: (baggage: Baggage) => void;
}

const statusColors: Record<Baggage['status'], string> = {
  'Checked In': 'bg-blue-100 text-blue-800',
  Loaded: 'bg-blue-100 text-blue-800',
  'In Transit': 'bg-yellow-100 text-yellow-800',
  Arrived: 'bg-green-100 text-green-800',
  Unclaimed: 'bg-orange-100 text-orange-800',
  Lost: 'bg-red-100 text-red-800',
};

export default function BaggageTable({ baggage, onEdit, onDelete }: BaggageTableProps) {
  if (baggage.length === 0) {
    return <p className="text-gray-500 p-6">No baggage found. Search by tag ID or flight number above.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-navy">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Tag ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Flight</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Passenger</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Destination</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {baggage.map((b) => (
            <tr key={b._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{b.tagId}</td>
              <td className="px-6 py-4 text-gray-700">{b.flightNumber}</td>
              <td className="px-6 py-4 text-gray-700">{b.passengerName}</td>
              <td className="px-6 py-4 text-gray-700">{b.destination}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[b.status]}`}>{b.status}</span>
              </td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(b)} className="text-cta hover:text-navy mr-4">
                  Edit
                </button>
                <button onClick={() => onDelete(b)} className="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
