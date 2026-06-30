import React, { useState } from 'react';
import { 
  Property, 
  Room, 
  HousekeepingTask 
} from '../../types';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  Grid, 
  Wrench, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC/AC' | 'Wi-Fi' | 'Furniture';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reporterName: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedDate: string;
}

interface HousekeepingViewProps {
  properties: Property[];
  rooms: Room[];
  housekeeping: HousekeepingTask[];
  syncHousekeeping: (tasks: HousekeepingTask[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function HousekeepingView({
  properties,
  rooms,
  housekeeping,
  syncHousekeeping,
  selectedPropertyId,
  onAddAuditLog
}: HousekeepingViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  const propertyHousekeeping = housekeeping.filter(h => h.propertyId === selectedPropertyId);

  // Active Tab: 'cleaning' | 'maintenance'
  const [activeSubSection, setActiveSubSection] = useState<'cleaning' | 'maintenance'>('cleaning');

  // Search/Filters states
  const [cleaningRoomFilter, setCleaningRoomFilter] = useState('');
  const [cleaningStatusFilter, setCleaningStatusFilter] = useState('All');

  // New task form state
  const [isAddingCleaning, setIsAddingCleaning] = useState(false);
  const [newCleaningForm, setNewCleaningForm] = useState({
    roomNumber: '',
    assignedStaff: 'Ramesh Kumar',
    notes: 'In-depth sanitization requested'
  });

  // Localized Maintenance Complaint logs State (Simulating DB seed with LocalStorage backing)
  const getInitialMaintenance = (): MaintenanceRequest[] => {
    const raw = localStorage.getItem('stayhub_maintenance_db');
    if (raw) return JSON.parse(raw);
    return [
      {
        id: 'maint-1',
        roomNumber: '101',
        category: 'Plumbing',
        severity: 'Critical',
        description: 'Severe bathroom pipe backup leaking onto carpet floor.',
        reporterName: 'Aditya Sharma',
        status: 'In Progress',
        reportedDate: '2026-05-23'
      },
      {
        id: 'maint-2',
        roomNumber: '205',
        category: 'Wi-Fi',
        severity: 'Medium',
        description: 'Wireless signal dropouts happen frequently around desk.',
        reporterName: 'Meera Sen',
        status: 'Open',
        reportedDate: '2026-05-24'
      },
      {
        id: 'maint-3',
        roomNumber: '103',
        category: 'HVAC/AC',
        severity: 'High',
        description: 'AC blowing hot air and remote controls unresponsive.',
        reporterName: 'Kunal Kohli',
        status: 'Resolved',
        reportedDate: '2026-05-21'
      }
    ];
  };

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceRequest[]>(getInitialMaintenance());

  const syncMaintenance = (updated: MaintenanceRequest[]) => {
    setMaintenanceLogs(updated);
    localStorage.setItem('stayhub_maintenance_db', JSON.stringify(updated));
  };

  // Add maintenance request form state toggle
  const [isReportingMaint, setIsReportingMaint] = useState(false);
  const [newMaintForm, setNewMaintForm] = useState({
    roomNumber: '',
    category: 'Plumbing' as MaintenanceRequest['category'],
    severity: 'Medium' as MaintenanceRequest['severity'],
    reporterName: '',
    description: ''
  });

  // Filter tasks
  const filteredCleaning = propertyHousekeeping.filter(t => {
    const matchesRoom = t.roomNumber.toLowerCase().includes(cleaningRoomFilter.toLowerCase());
    const matchesStatus = cleaningStatusFilter === 'All' || t.status === cleaningStatusFilter;
    return matchesRoom && matchesStatus;
  });

  // Schedule task function
  const handleCreateCleaningSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCleaningForm.roomNumber) return;

    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: currentProperty ? currentProperty.name : 'PG Host',
      roomNumber: newCleaningForm.roomNumber,
      assignedStaff: newCleaningForm.assignedStaff,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: newCleaningForm.notes
    };

    const updated = [newTask, ...housekeeping];
    syncHousekeeping(updated);

    onAddAuditLog(`Scheduled Room ${newTask.roomNumber} cleaning task assigned to ${newTask.assignedStaff}`, 'Housekeeping');
    
    setIsAddingCleaning(false);
    setNewCleaningForm({
      roomNumber: '',
      assignedStaff: 'Ramesh Kumar',
      notes: 'In-depth sanitization requested'
    });
  };

  // Status cyclic update
  const handleCycleCleaning = (tId: string) => {
    const updated = housekeeping.map(task => {
      if (task.id === tId) {
        const next: HousekeepingTask['status'] = 
          task.status === 'Pending' ? 'In Progress' :
          task.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...task, status: next };
      }
      return task;
    });
    syncHousekeeping(updated);
  };

  // Log Maintenance Request
  const handleReportMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintForm.roomNumber || !newMaintForm.description || !newMaintForm.reporterName) return;

    const newM: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      roomNumber: newMaintForm.roomNumber,
      category: newMaintForm.category,
      severity: newMaintForm.severity,
      description: newMaintForm.description,
      reporterName: newMaintForm.reporterName,
      status: 'Open',
      reportedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newM, ...maintenanceLogs];
    syncMaintenance(updated);

    onAddAuditLog(`Logged maintenance request for Room Unit ${newM.roomNumber} Category: ${newM.category}`, 'Housekeeping');

    setIsReportingMaint(false);
    setNewMaintForm({
      roomNumber: '',
      category: 'Plumbing',
      severity: 'Medium',
      reporterName: '',
      description: ''
    });
  };

  // Settle maintenance cycle status
  const cycleMaintenanceStatus = (maintId: string) => {
    const updated = maintenanceLogs.map(m => {
      if (m.id === maintId) {
        const nextStatus: MaintenanceRequest['status'] = 
          m.status === 'Open' ? 'In Progress' :
          m.status === 'In Progress' ? 'Resolved' : 'Open';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    syncMaintenance(updated);
  };

  return (
    <div className="space-y-6 text-slate-800 text-xs font-medium">
      
      {/* Tab select head banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border">
          <button 
            onClick={() => setActiveSubSection('cleaning')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubSection === 'cleaning' 
                ? 'bg-white shadow text-indigo-650' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Staff Cleaning Schedules</span>
          </button>
          
          <button 
            onClick={() => setActiveSubSection('maintenance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubSection === 'maintenance' 
                ? 'bg-white shadow text-indigo-650' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Maintenance Complaint Board</span>
          </button>
        </div>

        <div>
          {activeSubSection === 'cleaning' ? (
            <button 
              onClick={() => setIsAddingCleaning(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 px-4 rounded-xl transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Room Cleaning</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsReportingMaint(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-2 px-4 rounded-xl transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Maintenance Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION 1: STAFF CLEANING SCHEDULES */}
      {activeSubSection === 'cleaning' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Filtering row */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                value={cleaningRoomFilter}
                onChange={(e) => setCleaningRoomFilter(e.target.value)}
                placeholder="Filter schedule by room number..."
                className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-3 pr-3 py-1.5 w-full font-medium"
              />
            </div>

            <div className="flex gap-2 font-bold font-mono text-[9px] text-slate-400">
              <span className="self-center">FILTER STATUS:</span>
              <select 
                value={cleaningStatusFilter}
                onChange={(e) => setCleaningStatusFilter(e.target.value)}
                className="bg-slate-50 text-slate-705 border rounded-lg p-1 font-bold text-sans"
              >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Cleaning tasks cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCleaning.map(task => {
              const statusStyles = {
                'Pending': 'bg-slate-100 text-slate-650 border border-slate-200/50',
                'In Progress': 'bg-amber-50 text-amber-705 border border-amber-100',
                'Completed': 'bg-emerald-50 text-emerald-705 border border-emerald-100'
              };

              return (
                <div key={task.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start border-b pb-1.5">
                      <strong className="text-sm font-black text-slate-900">Room Unit {task.roomNumber}</strong>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{task.date}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 font-medium">
                      <p>Domestic Staff: <strong className="text-slate-800">{task.assignedStaff}</strong></p>
                      {task.notes && <p className="italic text-slate-400 font-light truncate">"{task.notes}"</p>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${statusStyles[task.status] || ''}`}>
                      {task.status}
                    </span>

                    <button 
                      onClick={() => handleCycleCleaning(task.id)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-3.5 rounded-xl border border-indigo-100 transition font-black text-[9px] uppercase tracking-wide"
                    >
                      Cycle Progress
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCleaning.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed rounded-3xl max-w-sm mx-auto space-y-2 p-5">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1} />
              <p className="text-xs text-slate-450 italic font-medium">No active scheduled cleanings matched search room parameters.</p>
            </div>
          )}

        </div>
      )}

      {/* SUB-SECTION 2: MAINTENANCE REQUEST COMPLAINTS PANEL */}
      {activeSubSection === 'maintenance' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Main list spreadsheet table row */}
          <div className="bg-white border border-slate-100 rounded-none shadow-sm overflow-hidden text-xs font-medium">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-550">
                  <th className="p-4 text-[10px] uppercase">Incident Room</th>
                  <th className="p-4 text-[10px] uppercase">Category</th>
                  <th className="p-4 text-[10px] uppercase">Description problem</th>
                  <th className="p-4 text-[10px] uppercase">Severity Index</th>
                  <th className="p-4 text-[10px] uppercase">Reporter User</th>
                  <th className="p-4 text-[10px] uppercase">Log Date</th>
                  <th className="p-4 text-[10px] uppercase">Status</th>
                  <th className="p-4 text-[10px] uppercase text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map(m => {
                  const severityColors = {
                    'Low': 'bg-slate-100 text-slate-600',
                    'Medium': 'bg-blue-50 text-blue-700 border-blue-105',
                    'High': 'bg-amber-50 text-amber-700 border-amber-105',
                    'Critical': 'bg-rose-50 text-rose-700 border-rose-105 animate-pulse'
                  };

                  const statusColors = {
                    'Open': 'bg-slate-100 text-slate-650',
                    'In Progress': 'bg-yellow-50 text-yellow-800 font-bold border border-yellow-200',
                    'Resolved': 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  };

                  return (
                    <tr key={m.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-black text-slate-905">Unit Room {m.roomNumber}</td>
                      <td className="p-4 capitalize font-semibold">{m.category}</td>
                      <td className="p-4 text-slate-505 italic max-w-xs truncate" title={m.description}>"{m.description}"</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${severityColors[m.severity] || ''}`}>
                          {m.severity}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{m.reporterName}</td>
                      <td className="p-4 text-slate-450 font-mono">{m.reportedDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColors[m.status] || ''}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => cycleMaintenanceStatus(m.id)}
                          className="bg-indigo-50 hover:bg-indigo-120 text-indigo-700 border border-slate-200 font-bold py-1.5 px-3 rounded-lg transition"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* CLEANING TASK FORM POPUP MODAL */}
      {isAddingCleaning && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 font-medium">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Schedule Cleaning Operations</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Appoint co-living cleaning duty rosters to room units</p>
              </div>
              <button 
                onClick={() => setIsAddingCleaning(false)} 
                className="p-1 hover:bg-slate-100 rounded-full border transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCleaningSchedule} className="space-y-3.5 pt-1 text-slate-700 font-medium text-xs">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Select Target Room Unit *</label>
                <select 
                  value={newCleaningForm.roomNumber}
                  onChange={(e) => setNewCleaningForm({ ...newCleaningForm, roomNumber: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white font-semibold text-slate-700"
                  required
                >
                  <option value="">-- Choose Room Unit --</option>
                  {propertyRooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>Room Unit {r.roomNumber} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Assigned Staff Caretaker</label>
                <select 
                  value={newCleaningForm.assignedStaff}
                  onChange={(e) => setNewCleaningForm({ ...newCleaningForm, assignedStaff: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white"
                >
                  <option value="Ramesh Kumar">Ramesh Kumar (Plumbing/Floor Specialist)</option>
                  <option value="Senthil Raman">Senthil Raman (Sanitary/Disinfectant specialist)</option>
                  <option value="Anjali Sharma">Anjali Sharma (Linen & Dining manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Roster scheduled notes / requirements</label>
                <textarea 
                  rows={2}
                  value={newCleaningForm.notes}
                  onChange={(e) => setNewCleaningForm({ ...newCleaningForm, notes: e.target.value })}
                  placeholder="AC vent cleaning, sanitize washroom mirror, vacuum carpets..."
                  className="w-full border rounded-xl p-2 bg-slate-5 focus:bg-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-750 text-white font-black py-2.5 rounded-xl transition shadow text-xs mt-1"
              >
                Publish cleaning schedule duty
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAINTENANCE REPORTING MODAL */}
      {isReportingMaint && (
        <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 font-medium">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Record Maintenance Issue</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Logs electrical, plumbing or wireless facility failures</p>
              </div>
              <button 
                onClick={() => setIsReportingMaint(false)} 
                className="p-1 hover:bg-slate-100 rounded-full border transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReportMaintenance} className="space-y-3.5 pt-1 text-slate-700 font-medium text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-505 mb-1 text-[11px]">Room Number *</label>
                  <select 
                    value={newMaintForm.roomNumber}
                    onChange={(e) => setNewMaintForm({ ...newMaintForm, roomNumber: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white font-semibold text-slate-700"
                    required
                  >
                    <option value="">-- Choose --</option>
                    {propertyRooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>Unit {r.roomNumber}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-505 mb-1 text-[11px]">Issue Category</label>
                  <select 
                    value={newMaintForm.category}
                    onChange={(e) => setNewMaintForm({ ...newMaintForm, category: e.target.value as any })}
                    className="w-full border rounded-xl p-2.5 bg-white"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC/AC">HVAC / AC</option>
                    <option value="Wi-Fi">Wi-Fi Internet</option>
                    <option value="Furniture">Furniture unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-505 mb-1 text-[11px]">Severity Index</label>
                  <select 
                    value={newMaintForm.severity}
                    onChange={(e) => setNewMaintForm({ ...newMaintForm, severity: e.target.value as any })}
                    className="w-full border rounded-xl p-2.5 bg-white font-bold"
                  >
                    <option value="Low">Low (Faint annoyance)</option>
                    <option value="Medium">Medium (Discomforting)</option>
                    <option value="High">High (Needs 24h resolve)</option>
                    <option value="Critical">Critical (Leaking/Hazards)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-505 mb-1 text-[11px]">Reporter Name *</label>
                  <input 
                    type="text" 
                    value={newMaintForm.reporterName}
                    onChange={(e) => setNewMaintForm({ ...newMaintForm, reporterName: e.target.value })}
                    placeholder="Aditya S."
                    className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-505 mb-1 text-[11px]">Description of Complaint *</label>
                <textarea 
                  rows={2}
                  value={newMaintForm.description}
                  onChange={(e) => setNewMaintForm({ ...newMaintForm, description: e.target.value })}
                  placeholder="Water pressure decreased significantly, or AC unit making loud vibrational sounds..."
                  className="w-full border rounded-xl p-2 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-xl transition shadow text-xs mt-1"
              >
                Log Maintenance Issue File
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
