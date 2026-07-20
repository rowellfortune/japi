'use client';

import { Gate } from '@/lib/types';

interface GateTableProps {
  gates: Gate[];
  onEdit: (gate: Gate) => void;
  onDelete: (gate: Gate) => void;
}

const statusColors: Record<Gate['status'], string> = {
  Available: 'bg-green-100 text-green-800',
  Occupied: 'bg-yellow-100 text-yellow-800',
  Maintenance: 'bg-red-100 text-red-800',
};

export default function GateTable({ gates, onEdit, onDelete }: GateTableProps) {
  if (gates.length === 0) {
    return <p className="text-gray-500 p-6">No gates yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-navy">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Gate</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Terminal</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {gates.map((gate) => (
            <tr key={gate._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{gate.gateNumber}</td>
              <td className="px-6 py-4 text-gray-700">{gate.terminal}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[gate.status]}`}>
                  {gate.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(gate)} className="text-cta hover:text-navy mr-4">
                  Edit
                </button>
                <button onClick={() => onDelete(gate)} className="text-red-600 hover:text-red-900">
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
