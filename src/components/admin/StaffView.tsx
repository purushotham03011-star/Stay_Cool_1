import React, { useState } from 'react';
import { mobileOpen } from '../../utils/mobileOpen';
import { Staff, Property } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  MapPin, 
  Smartphone, 
  Clock, 
  DollarSign, 
  Calendar, 
  SlidersHorizontal,
  BookmarkPlus,
  CircleDot,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Trash,
  Phone,
  MessageSquare
} from 'lucide-react';

interface StaffViewProps {
  properties: Property[];
  selectedPropertyId: string;
  staffList: Staff[];
  syncStaff: (updatedStaff: Staff[]) => void;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function StaffView({
  properties,
  selectedPropertyId,
  staffList,
  syncStaff,
  onAddAuditLog
}: StaffViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal / Slide-up form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Custom alert and confirmation states for safety under frame sandboxes
  const [staffAlertMessage, setStaffAlertMessage] = useState<string | null>(null);
  const [staffConfirmDelete, setStaffConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<Staff['role']>('Cleaning Staff');
  const [shiftTiming, setShiftTiming] = useState('Morning Shift (07:00 AM - 03:00 PM)');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState<number>(15000);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [notes, setNotes] = useState('');

  // Task assignment states
  const [activeTaskStaffId, setActiveTaskStaffId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  // WhatsApp state
  const [whatsAppStaff, setWhatsAppStaff] = useState<Staff | null>(null);
  const [whatsAppStaffText, setWhatsAppStaffText] = useState<string>('');

  const handleOpenWhatsAppModal = (st: Staff) => {
    setWhatsAppStaff(st);
    setWhatsAppStaffText(''); // no pre-written text, let them type freely!
  };

  const handleSendWhatsAppStaff = () => {
    if (!whatsAppStaff) return;
    const cleanedPhone = whatsAppStaff.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(whatsAppStaffText)}`;
    mobileOpen(url);
    setWhatsAppStaff(null);
  };

  // Filtered list
  const filteredStaff = staffList.filter(s => {
    // Match property
    const matchesProperty = s.propertyId === selectedPropertyId;
    // Match search term
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.phone.includes(searchTerm) || 
                          s.role.toLowerCase().includes(searchTerm.toLowerCase());
    // Match role filter
    const matchesRole = filterRole === 'All' || s.role === filterRole;
    // Match status filter
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;

    return matchesProperty && matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreateForm = () => {
    setEditingStaffId(null);
    setFullName('');
    setPhone('');
    setAddress('');
    setRole('Cleaning Staff');
    setShiftTiming('Morning Shift (07:00 AM - 03:00 PM)');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setSalary(16000);
    setStatus('Active');
    setProfilePhoto('');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (st: Staff) => {
    setEditingStaffId(st.id);
    setFullName(st.fullName);
    setPhone(st.phone);
    setAddress(st.address);
    setRole(st.role);
    setShiftTiming(st.shiftTiming);
    setJoiningDate(st.joiningDate);
    setSalary(st.salary || 15000);
    setStatus(st.status);
    setProfilePhoto(st.profilePhoto || '');
    setNotes(st.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setStaffAlertMessage('Full Name and Phone are required.');
      return;
    }

    const defaultImg = profilePhoto.trim() || `https://images.unsplash.com/photo-${role === 'Reception Staff' ? '1573496359142-b8d87734a5a2' : '1540569014015-19a7be504e3a'}?w=150`;

    if (editingStaffId) {
      // Edit
      const updated = staffList.map(s => {
        if (s.id === editingStaffId) {
          return {
            ...s,
            fullName,
            phone,
            address,
            role,
            shiftTiming,
            joiningDate,
            salary,
            status,
            profilePhoto: defaultImg,
            notes
          };
        }
        return s;
      });
      syncStaff(updated);
      onAddAuditLog(`Updated staff records for ${fullName} (${role})`, 'SuperAdmin');
    } else {
      // Create
      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        propertyId: selectedPropertyId,
        fullName,
        phone,
        address,
        role,
        shiftTiming,
        joiningDate,
        salary,
        status,
        profilePhoto: defaultImg,
        notes,
        tasks: []
      };
      syncStaff([newStaff, ...staffList]);
      onAddAuditLog(`Registered new staff employee: ${fullName} as ${role}`, 'SuperAdmin');
    }

    setIsFormOpen(false);
  };

  const handleDeleteStaff = (stId: string, name: string) => {
    setStaffConfirmDelete({ id: stId, name });
  };

  const executeDeleteStaff = (stId: string, name: string) => {
    const remaining = staffList.filter(s => s.id !== stId);
    syncStaff(remaining);
    onAddAuditLog(`Terminated staff relationship record of ${name}`, 'SuperAdmin');
    setStaffConfirmDelete(null);
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !activeTaskStaffId) return;

    const targetStaff = staffList.find(s => s.id === activeTaskStaffId);
    if (!targetStaff) return;

    const currentTasks = targetStaff.tasks || [];
    const updatedTasks = [...currentTasks, newTaskText.trim()];

    const updated = staffList.map(s => {
      if (s.id === activeTaskStaffId) {
        return { ...s, tasks: updatedTasks };
      }
      return s;
    });

    syncStaff(updated);
    onAddAuditLog(`Assigned new task to ${targetStaff.fullName}: "${newTaskText}"`, 'SuperAdmin');
    setNewTaskText('');
    setActiveTaskStaffId(null);
  };

  const handleRemoveTask = (staffId: string, taskIdx: number) => {
    const st = staffList.find(s => s.id === staffId);
    if (!st) return;

    const updatedTasks = (st.tasks || []).filter((_, idx) => idx !== taskIdx);
    const updated = staffList.map(s => {
      if (s.id === staffId) {
        return { ...s, tasks: updatedTasks };
      }
      return s;
    });

    syncStaff(updated);
    onAddAuditLog(`Cleared or completed task assigned to ${st.fullName}`, 'SuperAdmin');
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn">
      
      {/* Search Header and Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Staff Roster & Task Assignment</h3>
          <p className="text-xs text-slate-400">View duty hours, salary details, notes and manage service tickets on active floors.</p>
        </div>

        <button
          onClick={handleOpenCreateForm}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs transition inline-flex items-center space-x-1.5 shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {/* FILTER SEARCH CRITERIA */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        
        {/* Name input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee Name, Role or Phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-605 font-medium placeholder:text-slate-400 text-slate-900 focus:bg-white transition"
          />
        </div>

        {/* Role dropdown */}
        <div className="sm:col-span-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-900 focus:ring-1 focus:ring-indigo-605 focus:bg-white cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Watchman">Watchman</option>
            <option value="Cleaning Staff">Cleaning Staff</option>
            <option value="Reception Staff">Reception Staff</option>
            <option value="Maintenance Staff">Maintenance Staff</option>
            <option value="Other Staff">Other Staff</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-900 focus:ring-1 focus:ring-indigo-605 focus:bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active only</option>
            <option value="Inactive">Inactive / Leave</option>
          </select>
        </div>

      </div>

      {/* STAFF DIRECTORY GRID DISPLAY */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">No Employees Located</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">No staff register matched current filters. Clear searches or tap "Onboard New Staff" to insert record.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStaff.map(st => (
            <div 
              key={st.id} 
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-250 flex flex-col justify-between"
            >
              
              {/* Card top employee metadata row */}
              <div className="p-5 flex gap-4">

                {/* Name Role Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-slate-900 truncate font-display">{st.fullName}</h4>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold leading-none ${
                      st.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {st.status}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                    {st.role}
                  </span>

                  <div className="text-[10.5px] text-slate-500 font-medium space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{st.phone}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <a 
                          href={`tel:${st.phone.replace(/\s+/g, '')}`}
                          className="py-0.5 px-2 text-[10px] text-indigo-650 hover:bg-slate-100 border border-slate-205 rounded-md transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0"
                          title={`Call ${st.fullName}`}
                        >
                          <Phone className="w-2.5 h-2.5 text-indigo-600" />
                          <span>Call</span>
                        </a>
                        <button 
                          type="button"
                          onClick={() => handleOpenWhatsAppModal(st)}
                          className="py-0.5 px-2 text-[10px] text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0 cursor-pointer"
                          title={`WhatsApp ${st.fullName}`}
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{st.shiftTiming}</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Internal details area */}
              <div className="px-5 pb-4 space-y-2 border-t border-slate-50 pt-3 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                  <div>
                    <span className="text-slate-400 block font-mono">JOINING DATE</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {st.joiningDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono">ESTIMATED SALARY</span>
                    <span className="font-black text-emerald-600 flex items-center gap-0.5">
                      ₹{st.salary ? st.salary.toLocaleString('en-IN') : '15,000'}/mo
                    </span>
                  </div>
                </div>

                {st.notes && (
                  <div className="bg-slate-100/60 p-2 rounded-lg text-[10.5px] text-slate-500 italic leading-relaxed">
                    "{st.notes}"
                  </div>
                )}

                {/* Assigned Active Tasks row widget */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Task List ({st.tasks?.length || 0})</span>
                    <button 
                      onClick={() => setActiveTaskStaffId(st.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-mono text-[9px] lowercase"
                    >
                      + assign task
                    </button>
                  </div>

                  {st.tasks && st.tasks.length > 0 ? (
                    <div className="space-y-1">
                      {st.tasks.map((tsk, tIndex) => (
                        <div key={tIndex} className="bg-white px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-slate-150 flex justify-between items-center text-slate-700">
                          <span className="flex items-center gap-1.5 truncate pr-2">
                            <CircleDot className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{tsk}</span>
                          </span>
                          <button
                            onClick={() => handleRemoveTask(st.id, tIndex)}
                            className="text-slate-300 hover:text-emerald-600 transition"
                            title="Complete / Clear Task"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic block">No active tasks on duty roster.</span>
                  )}
                </div>

              </div>

              {/* Action buttons row */}
              <div className="bg-slate-50 border-t border-slate-100 p-3 px-5 flex justify-between items-center text-xs">
                <span className="text-[10px] font-semibold text-slate-400 font-mono inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  ID: {st.id.substring(st.id.length - 5)}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditForm(st)}
                    className="p-1.5 text-indigo-650 hover:text-white hover:bg-indigo-600 rounded-lg border border-indigo-200 transition"
                    title="Edit Employee profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(st.id, st.fullName)}
                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg border border-rose-100 transition"
                    title="Terminate record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TASK ASSIGNMENT QUICK OVERLAY DOCKET */}
      {activeTaskStaffId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider">Assign Service Task</h4>
              <button 
                onClick={() => setActiveTaskStaffId(null)}
                className="text-slate-400 hover:text-slate-755 p-1 bg-slate-100 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3.5">
              <p className="text-[11px] text-slate-500 leading-normal">
                Detail the required duty or room inspection below. This is updated directly onto staff hand-held device dashboards.
              </p>
              <textarea
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="E.g. Clean up clogged drain under sink in Deluxe Suite Room 201."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-600 font-sans h-20"
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition uppercase tracking-wider"
              >
                Dispatch Task Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DIALOG FORM SHEET */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center px-6">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wide font-display">
                {editingStaffId ? '🔧 Modify Employee Profile' : '👤 Onboard Brand employee'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-200/80 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Employee Full Name</label>
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ravi Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-bold outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Phone Phone Phone</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99000 88877"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-bold outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Assigned Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as Staff['role'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-900 focus:ring-1 focus:ring-indigo-605"
                  >
                    <option value="Watchman">Watchman</option>
                    <option value="Cleaning Staff">Cleaning Staff</option>
                    <option value="Reception Staff">Reception Staff</option>
                    <option value="Maintenance Staff">Maintenance Staff</option>
                    <option value="Other Staff">Other Staff</option>
                  </select>
                </div>

                {/* Shift Timing */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Shift Schedule</label>
                  <input 
                    type="text"
                    value={shiftTiming}
                    onChange={(e) => setShiftTiming(e.target.value)}
                    placeholder="Morning Shift (07:00 AM - 03:00 PM)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900"
                  />
                </div>

                {/* Salary */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Salary (₹ per month)</label>
                  <input 
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-mono font-bold outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Joining date */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Joining Date</label>
                  <input 
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-mono outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Status */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Employment Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-bold outline-none text-slate-900 focus:ring-1 focus:ring-indigo-605"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>

                {/* Address */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Residential Address</label>
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot 15, HSR Sector 2, Bangalore"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Confidential Admin Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reliable team member. Responsible for emergency locksmith requests too."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs h-16 outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
                  />
                </div>

              </div>

              {/* Footer buttons context */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 shadow-2xs rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-xl font-bold text-xs transition"
                >
                  {editingStaffId ? 'Update & Save Changes' : 'Complete Registration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* STAFF PRIVACY WHATSAPP MODAL POPUP */}
      {whatsAppStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9995] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Message Staff Member</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Draft dynamic message and dispatch to WhatsApp</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppStaff(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full border transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">Receipt Target Staff</span>
                <p className="font-extrabold text-slate-800 text-xs">{whatsAppStaff.fullName} ({whatsAppStaff.phone})</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block mb-1">Type WhatsApp Message to Send</label>
                <textarea 
                  rows={6}
                  value={whatsAppStaffText}
                  onChange={(e) => setWhatsAppStaffText(e.target.value)}
                  placeholder="Enter custom text message guidelines here..."
                  className="bg-slate-50 border rounded-xl p-3 w-full font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-[11px] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3.5">
              <button 
                type="button" 
                onClick={() => setWhatsAppStaff(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSendWhatsAppStaff}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/15 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STAFF ALERT MODAL */}
      {staffAlertMessage && (
        <div id="staff-alert-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Staff Directory Alert</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{staffAlertMessage}</p>
            </div>
            <button 
              onClick={() => setStaffAlertMessage(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM STAFF DELETE CONFIRMATION */}
      {staffConfirmDelete && (
        <div id="staff-delete-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🗑️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Remove Staff Member?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you absolutely sure you want to delete <strong>{staffConfirmDelete.name}</strong> from the key roster? This process cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setStaffConfirmDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Keep Roster
              </button>
              <button 
                onClick={() => executeDeleteStaff(staffConfirmDelete.id, staffConfirmDelete.name)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Remove Roster
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
