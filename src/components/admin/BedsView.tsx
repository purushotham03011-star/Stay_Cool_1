import React, { useState } from 'react';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Booking 
} from '../../types';
import { 
  X, 
  MapPin, 
  Check, 
  User, 
  UserPlus, 
  Bed as BedIcon, 
  Sparkles, 
  Sliders, 
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface BedsViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  bookings: Booking[];
  syncRoomsAndBeds: (rooms: Room[], beds: Bed[]) => void;
  syncTenants: (tenants: Tenant[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function BedsView({
  properties,
  rooms,
  beds,
  tenants,
  bookings,
  syncRoomsAndBeds,
  syncTenants,
  selectedPropertyId,
  onAddAuditLog
}: BedsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  
  // Filtering beds specifically belonging to rooms in the selected property
  const propertyBeds = beds.filter(b => propertyRooms.some(r => r.id === b.roomId));

  // State filters
  const [bedSearchQuery, setBedSearchQuery] = useState('');
  const [filterOccupancy, setFilterOccupancy] = useState<'All' | 'Vacant' | 'Occupied'>('All');

  // Allocation panel / wizard state
  const [selectedAllocationBedId, setSelectedAllocationBedId] = useState<string | null>(null);
  const [allocationMode, setAllocationMode] = useState<'existing' | 'new'>('existing');

  // Custom alert and confirmation dialog states for safe iframe environment operations
  const [bedAlertMessage, setBedAlertMessage] = useState<string | null>(null);
  const [bedConfirmCheckout, setBedConfirmCheckout] = useState<{ bed: Bed; residentName: string } | null>(null);

  // Fast allocation forms state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [newResidentForm, setNewResidentForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male' as Tenant['gender'],
    emergencyName: '',
    emergencyPhone: ''
  });

  // Calculate stats
  const totalBeds = propertyBeds.length;
  const occupiedBeds = propertyBeds.filter(b => b.isOccupied).length;
  const vacantBeds = totalBeds - occupiedBeds;

  // Filtered beds list
  const filteredBeds = propertyBeds.filter(b => {
    const room = propertyRooms.find(r => r.id === b.roomId);
    if (!room) return false;

    const matchesSearch = b.roomNumber.toLowerCase().includes(bedSearchQuery.toLowerCase()) || 
                          b.bedNumber.toLowerCase().includes(bedSearchQuery.toLowerCase());
    const matchesOccupancy = filterOccupancy === 'All' || 
                             (filterOccupancy === 'Occupied' && b.isOccupied) || 
                             (filterOccupancy === 'Vacant' && !b.isOccupied);
    return matchesSearch && matchesOccupancy;
  });

  // Filter tenants who are unassigned or incoming to assign them easily
  const unallocatedTenants = tenants.filter(t => 
    t.propertyId === selectedPropertyId && 
    (t.status === 'Incoming' || !t.roomId)
  );

  const selectedBedObject = beds.find(b => b.id === selectedAllocationBedId);
  const selectedBedRoom = selectedBedObject ? rooms.find(r => r.id === selectedBedObject.roomId) : null;
  const currentBedOccupantObj = selectedBedObject?.isOccupied 
    ? tenants.find(t => t.id === selectedBedObject.occupantTenantId) 
    : null;

  // Process allocation
  const handleAssignBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocationBedId || !selectedBedObject || !selectedBedRoom) return;

    let targetTenant: Tenant | null = null;

    if (allocationMode === 'existing') {
      if (!selectedTenantId) {
        setBedAlertMessage('Please choose a tenant profile to assign.');
        return;
      }
      const existingT = tenants.find(t => t.id === selectedTenantId);
      if (!existingT) return;

      targetTenant = {
        ...existingT,
        roomId: selectedBedRoom.id,
        roomNumber: selectedBedRoom.roomNumber,
        bedId: selectedBedObject.id,
        bedNumber: selectedBedObject.bedNumber,
        status: 'Active' as const
      };
    } else {
      if (!newResidentForm.name || !newResidentForm.email || !newResidentForm.phone) {
        setBedAlertMessage('Please complete all required fields for fast registration.');
        return;
      }

      targetTenant = {
        id: `tenant-${Date.now()}`,
        name: newResidentForm.name,
        email: newResidentForm.email,
        phone: newResidentForm.phone,
        gender: newResidentForm.gender,
        emergencyContactName: newResidentForm.emergencyName || 'Parental Guard',
        emergencyContactPhone: newResidentForm.emergencyPhone || newResidentForm.phone,
        docType: 'Aadhaar',
        docUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
        roomId: selectedBedRoom.id,
        roomNumber: selectedBedRoom.roomNumber,
        bedId: selectedBedObject.id,
        bedNumber: selectedBedObject.bedNumber,
        propertyId: selectedPropertyId,
        propertyName: currentProperty ? currentProperty.name : 'PG Co-living Host',
        status: 'Active' as const,
        joinedDate: new Date().toISOString().split('T')[0]
      };
    }

    if (!targetTenant) return;

    // Persist bed changes
    const updatedBeds = beds.map(b => {
      if (b.id === selectedAllocationBedId) {
        return {
          ...b,
          isOccupied: true,
          occupantTenantId: targetTenant.id
        };
      }
      return b;
    });

    // Determine room completeness status
    const entireRoomBeds = updatedBeds.filter(b => b.roomId === selectedBedRoom.id);
    const isRoomTotallyFull = entireRoomBeds.every(b => b.isOccupied);
    const updatedRooms = rooms.map(r => {
      if (r.id === selectedBedRoom.id) {
        return {
          ...r,
          occupancyStatus: (isRoomTotallyFull ? 'Full' : 'Available') as any
        };
      }
      return r;
    });

    // Update global tenants list
    let updatedTenantsList: Tenant[] = [];
    if (allocationMode === 'existing') {
      updatedTenantsList = tenants.map(t => t.id === targetTenant!.id ? targetTenant! : t);
    } else {
      updatedTenantsList = [...tenants, targetTenant];
    }

    syncRoomsAndBeds(updatedRooms, updatedBeds);
    syncTenants(updatedTenantsList);

    onAddAuditLog(`Allocated Bed Position ${selectedBedObject.bedNumber} (Unit ${selectedBedRoom.roomNumber}) to co-liver resident ${targetTenant.name}`, 'Tenants');
    
    // Reset states
    setSelectedAllocationBedId(null);
    setSelectedTenantId('');
    setNewResidentForm({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      emergencyName: '',
      emergencyPhone: ''
    });
  };

  // Quick deallocate resident
  const handleCheckoutBed = (bd: Bed) => {
    const tempResident = tenants.find(t => t.id === bd.occupantTenantId);
    if (!tempResident) return;

    setBedConfirmCheckout({ bed: bd, residentName: tempResident.name });
  };

  const executeCheckoutBed = (bd: Bed, residentName: string) => {
    const updatedBeds = beds.map(b => b.id === bd.id ? { ...b, isOccupied: false, occupantTenantId: undefined } : b);
    
    // Update linked Room's state to Available
    const roomObjObj = rooms.find(r => r.id === bd.roomId);
    const updatedRooms = rooms.map(r => r.id === bd.roomId ? { ...r, occupancyStatus: 'Available' as const } : r);

    // Set Tenant status to Checked-Out
    const updatedTenants = tenants.map(t => {
      if (t.id === bd.occupantTenantId) {
        return {
          ...t,
          status: 'Checked-Out' as const,
          roomId: undefined,
          roomNumber: undefined,
          bedId: undefined,
          bedNumber: undefined
        };
      }
      return t;
    });

    syncRoomsAndBeds(updatedRooms, updatedBeds);
    syncTenants(updatedTenants);

    onAddAuditLog(`Released Bed Position ${bd.bedNumber} (Room Unit ${bd.roomNumber}), checking out resident ${residentName}`, 'Tenants');
    setBedConfirmCheckout(null);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Mini KPIs Ribbon */}
      <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-center">
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-xs">
          <span className="text-slate-400 block pb-1">Total System Beds</span>
          <span className="text-xl font-bold font-display text-slate-900">{totalBeds} Slots</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-700">
          <span className="text-indigo-400 font-medium block pb-1">Occupied Positions</span>
          <span className="text-xl font-extrabold font-display leading-tight">{occupiedBeds} Beds</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700">
          <span className="text-emerald-400 font-medium block pb-1">Vacant Accommodations</span>
          <span className="text-xl font-extrabold font-display leading-tight">{vacantBeds} Available</span>
        </div>
      </div>

      {/* Control Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3.5 text-xs">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={bedSearchQuery}
            onChange={(e) => setBedSearchQuery(e.target.value)}
            placeholder="Search bed layouts (e.g. 101, Bed A)..."
            className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 pr-3 py-1.5 w-full font-medium"
          />
        </div>

        <div className="flex gap-2 text-[11px] font-bold w-full md:w-auto overflow-x-auto self-start md:self-auto">
          <button 
            onClick={() => setFilterOccupancy('All')}
            className={`px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
              filterOccupancy === 'All' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
            }`}
          >
            All Beds Map ({totalBeds})
          </button>
          <button 
            onClick={() => setFilterOccupancy('Vacant')}
            className={`px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
              filterOccupancy === 'Vacant' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
            }`}
          >
            Vacant Positions ({vacantBeds})
          </button>
          <button 
            onClick={() => setFilterOccupancy('Occupied')}
            className={`px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
              filterOccupancy === 'Occupied' ? 'bg-rose-600 border-rose-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
            }`}
          >
            Occupied Beds ({occupiedBeds})
          </button>
        </div>
      </div>

      {/* Grid Allocation Layout Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-sans">
        {filteredBeds.map(bd => {
          const occupant = tenants.find(t => t.id === bd.occupantTenantId && t.status === 'Active');
          
          return (
            <div 
              key={bd.id} 
              className={`border border-slate-150/80 rounded-2xl p-4 flex flex-col justify-between h-36 transition hover:-translate-y-0.5 hover:shadow-xs select-none ${
                bd.isOccupied 
                  ? 'bg-gradient-to-br from-rose-50/10 via-white to-rose-100/5 border-rose-200' 
                  : 'bg-gradient-to-br from-emerald-50/10 via-white to-emerald-100/5 border-emerald-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Room {bd.roomNumber}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${bd.isOccupied ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>
                <div className="flex items-center space-x-1.5 pt-1">
                  <div className={`p-1.5 rounded-lg ${bd.isOccupied ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <BedIcon className="w-5 h-5" />
                  </div>
                  <strong className="text-sm font-black text-slate-800">Bed {bd.bedNumber}</strong>
                </div>
              </div>

              {bd.isOccupied && occupant ? (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-900 line-clamp-1 block leading-tight">{occupant.name}</span>
                  <button 
                    onClick={() => handleCheckoutBed(bd)}
                    className="w-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[9px] font-bold py-1 px-2 rounded-lg border border-slate-200/50 flex items-center justify-center space-x-1 transition"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Checkout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedAllocationBedId(bd.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg border border-emerald-600 flex items-center justify-center space-x-1 shadow-xs transition active:scale-95"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Allocate Bed</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="text-center py-20 bg-white border rounded-3xl max-w-sm mx-auto p-6 space-y-2">
          <BedIcon className="w-8 h-8 text-slate-350 mx-auto" />
          <p className="text-xs text-slate-400 italic">No co-living beds matched your active filters.</p>
        </div>
      )}

      {/* ALLOCATION PANEL DRAWER (Modal Sidebar popup) */}
      {selectedAllocationBedId && selectedBedObject && selectedBedRoom && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 text-xs font-medium">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleUp text-slate-800">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Allocate Bed Slot Position</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Assigned specifically to Room Unit {selectedBedRoom.roomNumber} - Bed {selectedBedObject.bedNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedAllocationBedId(null)}
                className="p-1 hover:bg-slate-100 rounded-full border transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Selector: Choose existing unallocated Tenant vs Create New Resident */}
            <div className="grid grid-cols-2 bg-slate-50 p-1.5 rounded-xl border text-center text-[11px] font-bold">
              <button 
                type="button"
                onClick={() => setAllocationMode('existing')}
                className={`py-1.5 rounded-lg transition ${allocationMode === 'existing' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Choose Incoming Tenant
              </button>
              <button 
                type="button"
                onClick={() => setAllocationMode('new')}
                className={`py-1.5 rounded-lg transition ${allocationMode === 'new' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Fast Register New
              </button>
            </div>

            <form onSubmit={handleAssignBed} className="space-y-4 pt-2">
              {allocationMode === 'existing' ? (
                <div className="space-y-1">
                  <label className="block text-slate-500 text-[11px]">Choose Available Unmapped Tenant *</label>
                  {unallocatedTenants.length === 0 ? (
                    <div className="p-4 bg-amber-50/50 border border-amber-100/50 text-amber-800 text-[11px] rounded-xl italic">
                      No incoming or unallocated tenant records currently exist. Please switch to "Fast Register New" or perform customer self-bookings.
                    </div>
                  ) : (
                    <select 
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full border rounded-xl p-2.5 bg-white font-semibold text-slate-700"
                      required
                    >
                      <option value="">-- Choose Tenant --</option>
                      {unallocatedTenants.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.status} &bull; {t.phone})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Primary FullName *</label>
                      <input 
                        type="text" 
                        value={newResidentForm.name}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, name: e.target.value })}
                        placeholder="E.g., Arjun Verma"
                        className="w-full border rounded-xl p-2 bg-slate-5 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Email ID Address *</label>
                      <input 
                        type="email" 
                        value={newResidentForm.email}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, email: e.target.value })}
                        placeholder="arjun@gamil.com"
                        className="w-full border rounded-xl p-2 bg-slate-5 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Mobile Phone No *</label>
                      <input 
                        type="text" 
                        value={newResidentForm.phone}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, phone: e.target.value })}
                        placeholder="+91 99000 77000"
                        className="w-full border rounded-xl p-2 bg-slate-5 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Gender Specifier</label>
                      <select 
                        value={newResidentForm.gender}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, gender: e.target.value as any })}
                        className="w-full border rounded-xl p-2 bg-slate-5 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border">
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Emergency Kin Name</label>
                      <input 
                        type="text" 
                        value={newResidentForm.emergencyName}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, emergencyName: e.target.value })}
                        placeholder="Kin's Name"
                        className="w-full border rounded-lg p-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 mb-1 text-[11px]">Emergency Kin Mobile</label>
                      <input 
                        type="text" 
                        value={newResidentForm.emergencyPhone}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, emergencyPhone: e.target.value })}
                        placeholder="Kin's Contact"
                        className="w-full border rounded-lg p-1.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={allocationMode === 'existing' && !selectedTenantId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold p-3 rounded-xl transition shadow-md shadow-indigo-600/10 text-xs mt-2"
              >
                Approve Allocation & Activate Housing Contract
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM BED ALERT SYSTEM */}
      {bedAlertMessage && (
        <div id="bed-alert-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Beds Allocation Alert</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{bedAlertMessage}</p>
            </div>
            <button 
              onClick={() => setBedAlertMessage(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM BED CHECKOUT CONFIRMATION */}
      {bedConfirmCheckout && (
        <div id="bed-checkout-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🚪
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Release Bed & Checkout?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to release <strong>Bed Position {bedConfirmCheckout.bed.bedNumber}</strong> in <strong>Room Unit {bedConfirmCheckout.bed.roomNumber}</strong> from resident <strong>{bedConfirmCheckout.residentName}</strong>? This executes a Checkout and makes the bed vacant.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setBedConfirmCheckout(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Cancel Checkout
              </button>
              <button 
                onClick={() => executeCheckoutBed(bedConfirmCheckout.bed, bedConfirmCheckout.residentName)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Checkout Resident
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
