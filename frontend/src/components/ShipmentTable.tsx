import React from 'react';
import { Shipment } from '../types';
import { Truck, MapPin } from 'lucide-react';

interface Props {
  shipments: Shipment[];
  onSelect: (shipment: Shipment) => void;
  selectedId?: string;
}

const ShipmentTable: React.FC<Props> = ({ shipments, onSelect, selectedId }) => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-bold">Live Shipment Tracker</h3>
        <button className="text-sm text-primary font-medium hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Carrier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shipments.map((shp) => (
              <tr 
                key={shp.id} 
                onClick={() => onSelect(shp)}
                className={`
                  cursor-pointer transition-colors
                  ${selectedId === shp.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/30'}
                `}
              >
                <td className="px-6 py-4 font-bold text-gray-300">{shp.id}</td>
                <td className="px-6 py-4 font-medium text-white">
                  {shp.origin.city} → {shp.destination.city}
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter
                    ${shp.status === 'delayed' || shp.status === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}
                  `}>
                    {shp.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">{shp.carrier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipmentTable;
