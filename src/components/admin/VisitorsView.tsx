import React, { useState } from 'react';
import { 
  Property, 
  Room, 
  Tenant, 
  VisitorRecord 
} from '../../types';
import { 
  Search, 
  Plus, 
  Users, 
  X, 
  Check, 
  Clock,
  CheckCircle,
  Calendar,
  Phone
} from 'lucide-react';

interface VisitorsViewProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  visitorRecords: VisitorRecord[];
  syncVisitorRecords: (records: VisitorRecord[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function VisitorsView({
  properties,
  rooms,
  tenants,
  visitorRecords,
  syncVisitorRecords,
  selectedPropertyId,
  onAddAuditLog
}: VisitorsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId && t.status === 'Active');
  
  // Filter visitor logs belonging to this property
  const propertyVisitorRecords = visitorRecords.filter(vr => vr.propertyId === selectedPropertyId);

  // States
  const [visitorQuery, setVisitorQuery] = useState('');
  const [visitorStatusFilter, setVisitorStatusFilter] = useState<'All' | 'Inside' | 'Left'>('All');

  // Add visitor form collapse toggle
  const [isAddingVisitor, setIsAddingVisitor] = useState(false);
  const [newVisitorForm, setNewVisitorForm] = useState({
    visitorName: '',
    phone: '',
    hostTenantId: '',
    purpose: 'Meet Friend'
  });

  // Filter logs logic
  const filteredVisitors = propertyVisitorRecords.filter(v => {
    // Lookup destination room via tenant mapping for visual ease
    const matchedHost = tenants.find(t => t.id === v.hostTenantId);
    const roomNo = matchedHost ? matchedHost.roomNumber : '';

    const matchesSearch = v.visitorName.toLowerCase().includes(visitorQuery.toLowerCase()) || 
                          v.phone.includes(visitorQuery) || 
                          v.hostTenantName.toLowerCase().includes(visitorQuery.toLowerCase()) ||
                          roomNo.toLowerCase().includes(visitorQuery.toLowerCase());
    
    const isCheckedOut = !!v.checkOutTime;
    const matchesStatus = visitorStatusFilter === 'All' || 
                           (visitorStatusFilter === 'Inside' && !isCheckedOut) || 
                           (visitorStatusFilter === 'Left' && isCheckedOut);

    return matchesSearch && matchesStatus;
  });

  const handleCreateVisitorLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorForm.visitorName || !newVisitorForm.phone || !newVisitorForm.hostTenantId) return;

    const matchedHost = tenants.find(t => t.id === newVisitorForm.hostTenantId);
    const hostName = matchedHost ? matchedHost.name : 'Unknown Host';
    const roomNo = matchedHost ? matchedHost.roomNumber : 'N/A';

    const timestampISO = new Date().toISOString();

    const newRec: VisitorRecord = {
      id: `visitor-${Date.now()}`,
      propertyId: selectedPropertyId,
      visitorName: newVisitorForm.visitorName,
      phone: newVisitorForm.phone,
      purpose: newVisitorForm.purpose,
      hostTenantId: newVisitorForm.hostTenantId,
      hostTenantName: hostName,
      checkInTime: timestampISO
    };

    const updated = [newRec, ...visitorRecords];
    syncVisitorRecords(updated);

    onAddAuditLog(`Logged entrance authorization for visitor ${newRec.visitorName} visiting ${newRec.hostTenantName} (Room ${roomNo})`, 'Visitor');

    setIsAddingVisitor(false);
    setNewVisitorForm({
      visitorName: '',
      phone: '',
      hostTenantId: '',
      purpose: 'Meet Friend'
    });
  };

  const handleCheckoutVisitor = (vId: string) => {
    const targetObj = visitorRecords.find(v => v.id === vId);
    if (!targetObj) return;

    const timestampISO = new Date().toISOString();

    const updated = visitorRecords.map(v => {
      if (v.id === vId) {
        return {
          ...v,
          checkOutTime: timestampISO
        };
      }
      return v;
    });

    syncVisitorRecords(updated);
    
    const matchedHost = tenants.find(t => t.id === targetObj.hostTenantId);
    const roomNo = matchedHost ? matchedHost.roomNumber : 'N/A';
    onAddAuditLog(`Checked out visitor ${targetObj.visitorName} from Room Unit ${roomNo}`, 'Visitor');
  };

  const formatBeautifulTime = (isoString?: string) => {
    if (!isoString) return 'Not Checked-Out';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return isoString;
    }
  };

  const formatBeautifulDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (err) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 text-slate-800 text-xs font-medium animate-fadeIn">
      
      {/* Filtering control ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3.5">
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={visitorQuery}
              onChange={(e) => setVisitorQuery(e.target.value)}
              placeholder="Search visitor name, contact, tenant..."
              className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 p-1.5 w-full font-semibold webkit-search-cancel-none"
            />
          </div>

          <select 
            value={visitorStatusFilter}
            onChange={(e) => setVisitorStatusFilter(e.target.value as any)}
            className="bg-slate-50 border p-2 rounded-lg font-bold"
          >
            <option value="All">All Visitors Logs</option>
            <option value="Inside">Currently Inside Premises</option>
            <option value="Left">Checked-Out Visitors</option>
          </select>
        </div>

        <button 
          onClick={() => setIsAddingVisitor(true)}
          className="bg-cyan-600 hover:bg-cyan-705 text-white font-bold p-2 px-4 rounded-xl leading-tight transition text-xs inline-flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Authorize Visitor Gate-Pass</span>
        </button>

      </div>

      {/* Spreadsheet Tables registry */}
      <div className="bg-white border text-xs border-slate-100 rounded-none shadow-sm overflow-hidden font-medium">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-550">
              <th className="p-4 text-[10px] uppercase">Visitor Name</th>
              <th className="p-4 text-[10px] uppercase">Contact Phone</th>
              <th className="p-4 text-[10px] uppercase">Room Destination</th>
              <th className="p-4 text-[10px] uppercase">Host Resident</th>
              <th className="p-4 text-[10px] uppercase">Entry Date</th>
              <th className="p-4 text-[10px] uppercase">In-Time</th>
              <th className="p-4 text-[10px] uppercase">Out-Time</th>
              <th className="p-4 text-[10px] uppercase">Purpose</th>
              <th className="p-4 text-[10px] uppercase">Status</th>
              <th className="p-4 text-[10px] uppercase text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.map(v => {
              const insidePremises = !v.checkOutTime;
              const matchedHost = tenants.find(t => t.id === v.hostTenantId);
              const roomNo = matchedHost ? matchedHost.roomNumber : 'N/A';
              
              return (
                <tr key={v.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-black text-slate-905">{v.visitorName}</td>
                  
                  <td className="p-4 font-mono font-bold text-slate-600">
                    <div className="flex items-center gap-1.5 w-max">
                      <span>{v.phone}</span>
                      <a 
                        href={`tel:${(v.phone || '').replace(/\s+/g, '')}`}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition inline-flex items-center justify-center shrink-0"
                        title={`Call ${v.visitorName}`}
                      >
                        <Phone className="w-3 h-3 text-indigo-600" />
                      </a>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className="font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                      Room {roomNo}
                    </span>
                  </td>

                  <td className="p-4 font-semibold text-slate-600">{v.hostTenantName}</td>
                  
                  <td className="p-4 text-slate-500 font-mono">{formatBeautifulDate(v.checkInTime)}</td>
                  
                  <td className="p-4 font-mono font-bold text-slate-700">{formatBeautifulTime(v.checkInTime)}</td>
                  
                  <td className="p-4 font-mono">
                    {v.checkOutTime ? (
                      <span className="text-slate-500 font-semibold">{formatBeautifulTime(v.checkOutTime)}</span>
                    ) : (
                      <span className="text-slate-400 italic">Not set yet</span>
                    )}
                  </td>

                  <td className="p-4 text-slate-500 italic">"{v.purpose}"</td>
                  
                  <td className="p-4">
                    {insidePremises ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 rounded px-2 py-0.5 font-bold text-[9px] uppercase">Inside</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 rounded px-2 py-0.5 font-bold text-[9px] uppercase">Departed</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {insidePremises ? (
                      <button 
                        onClick={() => handleCheckoutVisitor(v.id)}
                        className="bg-slate-900 hover:bg-rose-600 hover:border-rose-300 text-white font-bold py-1.5 px-3 rounded-lg border transition text-[10px]"
                      >
                        Log Depart
                      </button>
                    ) : (
                      <span className="text-emerald-605 inline-flex items-center gap-0.5 font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Left</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredVisitors.length === 0 && (
          <div className="text-center py-20 p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-350 mx-auto" strokeWidth={1} />
            <p className="text-xs text-slate-450 italic">No authorized visitor passes matching selected criteria.</p>
          </div>
        )}
      </div>

      {/* AUTHORIZE VISITOR PASS POPUP MODAL */}
      {isAddingVisitor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 font-medium text-xs font-sans">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-2 text-left">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Add Visitor Access Pass</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-medium">Specify security credentials, target destination and host</p>
              </div>
              <button onClick={() => setIsAddingVisitor(false)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateVisitorLog} className="space-y-3.5 pt-1 text-slate-700 font-medium">
              
              <div>
                <label className="block text-slate-550 mb-1 text-[11px]">Visitor Full Name *</label>
                <input 
                  type="text" 
                  value={newVisitorForm.visitorName}
                  onChange={(e) => setNewVisitorForm({ ...newVisitorForm, visitorName: e.target.value })}
                  placeholder="E.g., Devashish Sen"
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1 text-[11px]">Contact Phone Number *</label>
                <input 
                  type="text" 
                  value={newVisitorForm.phone}
                  onChange={(e) => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })}
                  placeholder="E.g., 99000 88000"
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1 text-[11px]">Host Occupant Resident *</label>
                <select 
                  value={newVisitorForm.hostTenantId}
                  onChange={(e) => setNewVisitorForm({ ...newVisitorForm, hostTenantId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  required
                >
                  <option value="">-- Choose Resident Tenant --</option>
                  {propertyTenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Room {t.roomNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-550 mb-1 text-[11px]">Purpose of Entry *</label>
                <input 
                  type="text" 
                  value={newVisitorForm.purpose}
                  onChange={(e) => setNewVisitorForm({ ...newVisitorForm, purpose: e.target.value })}
                  placeholder="E.g., Educational materials delivery"
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider font-display shadow-sm transition active:scale-98"
              >
                Log Entry Gate-Pass
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
