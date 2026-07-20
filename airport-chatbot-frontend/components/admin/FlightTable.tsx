'use client';

import { Flight } from '@/lib/types';

interface FlightTableProps {
  flights: Flight[];
  onEdit: (flight: Flight) => void;
  onDelete: (flight: Flight) => void;
}

const statusColors: Record<Flight['status'], string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Boarding: 'bg-yellow-100 text-yellow-800',
  Delayed: 'bg-orange-100 text-orange-800',
  Departed: 'bg-gray-100 text-gray-800',
  Arrived: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function FlightTable({ flights, onEdit, onDelete }: FlightTableProps) {
  if (flights.length === 0) {
    return <p className="text-gray-500 p-6">No flights yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-navy">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Flight</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Route</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Departure</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Gate</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {flights.map((flight) => (
            <tr key={flight._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{flight.flightNumber}</td>
              <td className="px-6 py-4 text-gray-700">
                {flight.origin} → {flight.destination}
              </td>
              <td className="px-6 py-4 text-gray-700">{new Date(flight.departureTime).toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[flight.status]}`}>
                  {flight.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">
                {typeof flight.gateId === 'object' && flight.gateId ? flight.gateId.gateNumber : 'Unassigned'}
              </td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(flight)} className="text-cta hover:text-navy mr-4">
                  Edit
                </button>
                <button onClick={() => onDelete(flight)} className="text-red-600 hover:text-red-900">
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
