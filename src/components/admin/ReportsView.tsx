import React, { useState } from 'react';
import { 
  Property, 
  Room, 
  Tenant, 
  Invoice, 
  AuditLog 
} from '../../types';
import { 
  Search, 
  FileText, 
  Download, 
  Calendar, 
  Activity, 
  TrendingUp, 
  BarChart4, 
  Percent, 
  Clock, 
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

interface ReportsViewProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  selectedPropertyId: string;
}

export default function ReportsView({
  properties,
  rooms,
  tenants,
  invoices,
  auditLogs,
  selectedPropertyId
}: ReportsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId);
  const propertyInvoices = invoices.filter(i => tenants.some(t => t.id === i.tenantId && t.propertyId === selectedPropertyId));

  // Audit Logs Filter
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState('All');

  // Calculate high-fidelity reports metrics
  const totalInvoicedAmt = propertyInvoices.reduce((acc, i) => acc + i.amount, 0);
  const paidInvoicedAmt = propertyInvoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  const unpaidInvoicedAmt = totalInvoicedAmt - paidInvoicedAmt;

  const collectionRate = totalInvoicedAmt > 0 ? Math.round((paidInvoicedAmt / totalInvoicedAmt) * 100) : 100;

  // Occupancy metrics by room types
  const singleRooms = propertyRooms.filter(r => r.type === 'Single');
  const doubleRooms = propertyRooms.filter(r => r.type === 'Double');
  const tripleRooms = propertyRooms.filter(r => r.type === 'Triple');
  const quadRooms = propertyRooms.filter(r => r.type === 'Four-Sharing');

  const getOccupancyPct = (filteredRoomsList: Room[]) => {
    if (filteredRoomsList.length === 0) return 0;
    const occupiedCount = filteredRoomsList.filter(r => r.occupancyStatus === 'Full').length;
    // Add partials (Available but not empty)
    const partialsCount = filteredRoomsList.filter(r => r.occupancyStatus === 'Available' && tenants.some(t => t.roomId === r.id)).length;
    const estimated = (occupiedCount * 1.0) + (partialsCount * 0.5);
    return Math.round((estimated / filteredRoomsList.length) * 100);
  };

  const pctSingle = getOccupancyPct(singleRooms);
  const pctDouble = getOccupancyPct(doubleRooms);
  const pctTriple = getOccupancyPct(tripleRooms);
  const pctQuad = getOccupancyPct(quadRooms);

  // Filter global audit records
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                          log.userEmail?.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesModule = logModuleFilter === 'All' || log.module === logModuleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 text-slate-800 text-xs font-medium animate-fadeIn">
      
      {/* Upper Grid: High fidelity vector analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SVG Revenue performance bar charts */}
        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-extrabold text-sm text-slate-905 flex items-center gap-1.5 font-display">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Financial Ledger Settlement</span>
              </h3>
              <p className="text-[10px] text-slate-400">Ratio of collected cash/UPI revenues vs outstanding pending dues</p>
            </div>
            
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase font-mono">
              {collectionRate}% Collected
            </span>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-1">
            <span>Outstanding Pending: <strong className="text-rose-500 text-xs font-mono">₹{unpaidInvoicedAmt.toLocaleString('en-IN')}</strong></span>
            <span>Collected Settled: <strong className="text-emerald-600 text-xs font-mono">₹{paidInvoicedAmt.toLocaleString('en-IN')}</strong></span>
          </div>

          {/* Core Custom SVG Vector chart representation */}
          <div className="bg-slate-50 py-4.5 rounded-2xl flex justify-center items-center">
            <svg viewBox="0 0 400 120" className="w-full max-w-sm h-28">
              <defs>
                <linearGradient id="gradient-pay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="gradient-due" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="55" x2="380" y2="55" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="90" x2="380" y2="90" stroke="#e2e8f0" strokeDasharray="4 4" />

              {/* Bar 1: Paid */}
              <rect 
                x="80" 
                y={110 - (collectionRate * 0.8)} 
                width="60" 
                height={collectionRate * 0.8} 
                rx="6" 
                fill="url(#gradient-pay)" 
              />
              <text x="110" y="118" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">Collected</text>
              <text x="110" y={100 - (collectionRate * 0.8)} textAnchor="middle" className="text-[10px] font-mono font-black fill-emerald-700">{collectionRate}%</text>

              {/* Bar 2: Unpaid */}
              <rect 
                x="260" 
                y={110 - ((100 - collectionRate) * 0.8)} 
                width="60" 
                height={(100 - collectionRate) * 0.8} 
                rx="6" 
                fill="url(#gradient-due)" 
              />
              <text x="290" y="118" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">Outstanding</text>
              <text x="290" y={100 - ((100 - collectionRate) * 0.8)} textAnchor="middle" className="text-[10px] font-mono font-black fill-rose-600">{100 - collectionRate}%</text>

              {/* Side Legend values */}
              <text x="35" y="24" textAnchor="end" className="text-[9px] font-bold fill-slate-400 font-mono">Max</text>
              <text x="35" y="59" textAnchor="end" className="text-[9px] font-bold fill-slate-400 font-mono">Mid</text>
              <text x="35" y="94" textAnchor="end" className="text-[9px] font-bold fill-slate-400 font-mono">0</text>
            </svg>
          </div>
        </div>

        {/* Occupancy stats type comparison */}
        <div className="bg-white p-5 border border-slate-100 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-905 flex items-center gap-1.5 font-display">
              <Percent className="w-4 h-4 text-indigo-500" />
              <span>Occupancy Matrix Ratios</span>
            </h3>
            <p className="text-[10px] text-slate-400">Detailed utilization benchmarks broken down by standard room models</p>
          </div>

          <div className="space-y-3 pt-1.5">
            {/* Single */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-650">Single Occupancy Units ({singleRooms.length} rooms)</span>
                <strong className="text-slate-900 font-mono font-black">{pctSingle}% occupancy</strong>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pctSingle}%` }} />
              </div>
            </div>

            {/* Double */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-650">Double Sharing Standard ({doubleRooms.length} rooms)</span>
                <strong className="text-slate-900 font-mono font-black">{pctDouble}% occupancy</strong>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pctDouble}%` }} />
              </div>
            </div>

            {/* Triple */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-650">Triple Co-live Suites ({tripleRooms.length} rooms)</span>
                <strong className="text-slate-900 font-mono font-black">{pctTriple}% occupancy</strong>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pctTriple}%` }} />
              </div>
            </div>

            {/* Four-Sharing */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-650">Four Sharing dormitory layouts ({quadRooms.length} rooms)</span>
                <strong className="text-slate-900 font-mono font-black">{pctQuad}% occupancy</strong>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${pctQuad}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* System Admin Audits trails */}
      <div className="space-y-4">
        
        {/* Search Audit header */}
        <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 font-display">
              <Activity className="w-4.5 h-4.5 text-indigo-500 stroke-[1.5]" />
              <span>Administrative Logs & Audit Trails</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time system logging tracking state changes during development iterations</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-56">
              <Search className="absolute left-2 top-2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text" 
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search actions operator..."
                className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 p-1.5 w-full font-semibold"
              />
            </div>

            <select 
              value={logModuleFilter}
              onChange={(e) => setLogModuleFilter(e.target.value)}
              className="bg-slate-50 border p-2 rounded-lg font-bold"
            >
              <option value="All">All Operations</option>
              <option value="Rooms">Rooms Module</option>
              <option value="Tenants">Tenants Module</option>
              <option value="Billing">Billing Module</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Food">Food / Kitchen</option>
              <option value="Visitor">Visitor Log</option>
              <option value="SuperAdmin">SuperAdmin Actions</option>
            </select>
          </div>
        </div>

        {/* Audit list tracker */}
        <div className="bg-white border rounded-3xl p-4 shadow-sm max-h-[380px] overflow-y-auto space-y-2">
          {filteredLogs.map(log => {
            const moduleBadges = {
              'Rooms': 'bg-teal-50 text-teal-700 border-teal-150',
              'Tenants': 'bg-indigo-50 text-indigo-700 border-indigo-150',
              'Billing': 'bg-emerald-50 text-emerald-700 border-emerald-150',
              'Housekeeping': 'bg-cyan-50 text-cyan-705 border-cyan-150',
              'Food': 'bg-purple-50 text-purple-705 border-purple-150',
              'Visitor': 'bg-amber-50 text-amber-705 border-amber-150',
              'SuperAdmin': 'bg-rose-50 text-rose-705 border-rose-150'
            };

            return (
              <div key={log.id} className="p-3 bg-slate-50/50 border rounded-xl hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-2.5 font-medium">
                <div className="flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase font-mono ${moduleBadges[log.module] || 'bg-slate-100 text-slate-500 font-bold'}`}>
                    {log.module}
                  </span>

                  <div>
                    <p className="text-slate-800 text-[11.5px] leading-tight font-sans font-semibold">{log.action}</p>
                    <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5">Operator executor: <strong className="font-semibold text-slate-600">{log.userEmail || 'Admin Agent'}</strong></span>
                  </div>
                </div>

                <div className="text-slate-400 font-mono text-[9px] uppercase tracking-wider text-right self-end md:self-auto shrink-0 flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-10 space-y-1 pl-1">
              <Bookmark className="w-6.5 h-6.5 text-slate-300 mx-auto" strokeWidth={1.5} />
              <p className="text-[11px] text-slate-400 italic">No system audit log track matching parameters logged in this session.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
