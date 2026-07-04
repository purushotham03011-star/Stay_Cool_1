import React, { useState, useEffect } from 'react';
import { syncAllFromBackend } from '../../mockData';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  HousekeepingTask,
  Booking
} from '../../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  SlidersHorizontal, 
  X, 
  Check, 
  Grid, 
  List, 
  Bed as BedIcon, 
  Settings, 
  MapPin, 
  Clock, 
  Activity,
  ArrowLeftRight
} from 'lucide-react';

interface RoomsViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  housekeeping: HousekeepingTask[];
  bookings?: Booking[];
  syncRoomsAndBeds: (rooms: Room[], beds: Bed[]) => void;
  syncTenants: (tenants: Tenant[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function RoomsView({
  properties,
  rooms,
  beds,
  tenants,
  housekeeping,
  bookings = [],
  syncRoomsAndBeds,
  syncTenants,
  selectedPropertyId,
  onAddAuditLog
}: RoomsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  const propertyBeds = beds.filter(b => propertyRooms.some(r => r.id === b.roomId));
  const propertyHousekeeping = housekeeping.filter(h => h.propertyId === selectedPropertyId);

  const [selectedViewTenantBillId, setSelectedViewTenantBillId] = useState<string | null>(null);

  const handleRemoveOccupant = async (bedId: string) => {
    const targetBed = beds.find(b => b.id === bedId);
    if (!targetBed || !targetBed.isOccupied) return;

    const targetBooking = bookings?.find(b => b.bedId === bedId && (b.status === 'Active' || b.status === 'Confirmed'));
    if (!targetBooking) {
      alert("No active booking database reference found for this occupant.");
      return;
    }

    if (!window.confirm(`Are you sure you want to checkout/remove this occupant and release Bed Position ${targetBed.bedNumber}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/bookings/${targetBooking.id}/checkout`, {
        method: 'POST'
      });
      if (res.ok) {
        await syncAllFromBackend();
        
        const localRooms = JSON.parse(localStorage.getItem('hotel_pg_rooms') || '[]');
        const localBeds = JSON.parse(localStorage.getItem('hotel_pg_beds') || '[]');
        const localTenants = JSON.parse(localStorage.getItem('hotel_pg_tenants') || '[]');
        
        syncRoomsAndBeds(localRooms, localBeds);
        syncTenants(localTenants);

        onAddAuditLog(`Removed/checked-out tenant from Bed ${targetBed.bedNumber} in Room Unit ${targetBed.roomNumber}`, 'Rooms');
      } else {
        alert("Failed to process checkout on backend server.");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server.");
    }
  };

  // Layout selection: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Custom alert and confirmation dialog states for safe iframe environment operations
  const [roomAlertMessage, setRoomAlertMessage] = useState<string | null>(null);
  const [roomConfirmDelete, setRoomConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  // Filters state
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Room for detailed inspection view
  const [activeDetailsRoomId, setActiveDetailsRoomId] = useState<string | null>(null);

  // Forms state
  const [viewState, setViewState] = useState<'view' | 'add' | 'edit'>('view');
  
  // Bed Shifting States
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [selectedRoomForShift, setSelectedRoomForShift] = useState<Room | null>(null);
  const [selectedTenantToShiftId, setSelectedTenantToShiftId] = useState<string>('');
  const [shiftTargetBedId, setShiftTargetBedId] = useState<string>('');

  // Pre-populate Shift Modal defaults when room is selected
  useEffect(() => {
    if (selectedRoomForShift) {
      const activeOccupants = tenants.filter(t => t.roomId === selectedRoomForShift.id && t.status === 'Active');
      if (activeOccupants.length > 0) {
        setSelectedTenantToShiftId(activeOccupants[0].id);
      } else {
        setSelectedTenantToShiftId('');
      }
      
      const vacantBeds = beds.filter(b => !b.isOccupied && rooms.some(r => r.id === b.roomId && r.propertyId === selectedPropertyId));
      if (vacantBeds.length > 0) {
        setShiftTargetBedId(vacantBeds[0].id);
      } else {
        setShiftTargetBedId('');
      }
    }
  }, [selectedRoomForShift, tenants, beds, rooms, selectedPropertyId]);

  const executeShiftResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantToShiftId || !shiftTargetBedId) {
      setRoomAlertMessage('Please select both a tenant to shift and a target vacant bed.');
      return;
    }

    const tenantToShift = tenants.find(t => t.id === selectedTenantToShiftId);
    const targetBed = beds.find(b => b.id === shiftTargetBedId);

    if (!tenantToShift || !targetBed) {
      setRoomAlertMessage('Error finding tenant or target bed.');
      return;
    }

    const targetRoom = rooms.find(r => r.id === targetBed.roomId);
    if (!targetRoom) {
      setRoomAlertMessage('Error finding target room.');
      return;
    }

    const targetBooking = bookings?.find(b => 
      (b.tenantId === tenantToShift.id || b.customerEmail?.toLowerCase() === tenantToShift.email?.toLowerCase()) && 
      (b.status === 'Confirmed' || b.status === 'Active')
    );

    if (!targetBooking) {
      setRoomAlertMessage('No active booking reference found in SQLite database for this resident. Bed shifting requires an active stay contract.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/bookings/${targetBooking.id}/shift?room_id=${targetRoom.id}&bed_id=${targetBed.id}`, {
        method: 'POST'
      });

      if (res.ok) {
        await syncAllFromBackend();
        
        const localRooms = JSON.parse(localStorage.getItem('hotel_pg_rooms') || '[]');
        const localBeds = JSON.parse(localStorage.getItem('hotel_pg_beds') || '[]');
        const localTenants = JSON.parse(localStorage.getItem('hotel_pg_tenants') || '[]');
        
        syncRoomsAndBeds(localRooms, localBeds);
        syncTenants(localTenants);

        const originalRoomNumber = tenantToShift.roomNumber || 'Unknown';
        const originalBedNumber = tenantToShift.bedNumber || 'Unknown';

        onAddAuditLog(
          `Shifted resident ${tenantToShift.name} from Room ${originalRoomNumber} (Bed ${originalBedNumber}) to Room ${targetRoom.roomNumber} (Bed ${targetBed.bedNumber})`,
          'Rooms'
        );

        setRoomAlertMessage(`Successfully shifted ${tenantToShift.name} to Room ${targetRoom.roomNumber} - Bed ${targetBed.bedNumber}.`);
      } else {
        const errorData = await res.json();
        setRoomAlertMessage(`Error: ${errorData.detail || 'Failed to persist bed shift on server.'}`);
      }
    } catch (err) {
      console.error(err);
      setRoomAlertMessage('Connection error. Failed to persist bed shift on SQLite server.');
    }
    
    setIsShiftModalOpen(false);
    setSelectedRoomForShift(null);
    setSelectedTenantToShiftId('');
    setShiftTargetBedId('');
  };
  
  // Create / Edit active values
  const [formRoomId, setFormRoomId] = useState<string>('');
  const [formRoomNum, setFormRoomNum] = useState<string>('');
  const [formFloor, setFormFloor] = useState<number>(1);
  const [formType, setFormType] = useState<Room['type']>('Double');
  const [formPriceMonth, setFormPriceMonth] = useState<number>(12000);
  const [formPriceWeekly, setFormPriceWeekly] = useState<number>(3000);
  const [formPriceSeasonal, setFormPriceSeasonal] = useState<number>(35000);
  const [formPriceDay, setFormPriceDay] = useState<number>(600);
  const [formAmenities, setFormAmenities] = useState<string>('A/C, Study Table, Wi-Fi');
  const [formStatus, setFormStatus] = useState<Room['occupancyStatus']>('Available');

  // Multi-sharing capacities mapping
  const sharingCapacity = {
    'Single': 1,
    'Double': 2,
    'Triple': 3,
    'Four-Sharing': 4
  };

  // Helper calculation for unique floors
  const availableFloors = Array.from(new Set(propertyRooms.map(r => r.floor))).sort((a, b) => a - b);

  // Filter logic
  const filteredRooms = propertyRooms.filter(r => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'All' || r.type === selectedTypeFilter;
    const matchesFloor = selectedFloorFilter === 'All' || r.floor.toString() === selectedFloorFilter;
    const matchesStatus = selectedStatusFilter === 'All' || r.occupancyStatus === selectedStatusFilter;
    return matchesSearch && matchesType && matchesFloor && matchesStatus;
  });

  const triggerEditRoomMode = (rm: Room) => {
    setFormRoomId(rm.id);
    setFormRoomNum(rm.roomNumber);
    setFormFloor(rm.floor);
    setFormType(rm.type);
    setFormPriceMonth(rm.pricePerMonth);
    setFormPriceWeekly(rm.priceWeekly || Math.round(rm.pricePerMonth / 4));
    setFormPriceSeasonal(rm.priceSeasonal || Math.round(rm.pricePerMonth * 3));
    setFormPriceDay(rm.pricePerDay);
    setFormAmenities(rm.amenities.join(', '));
    setFormStatus(rm.occupancyStatus);
    setViewState('edit');
  };

  const triggerAddRoomMode = () => {
    setFormRoomId('');
    setFormRoomNum('');
    setFormFloor(1);
    setFormType('Double');
    setFormPriceMonth(10000);
    setFormPriceWeekly(2500);
    setFormPriceSeasonal(28000);
    setFormPriceDay(500);
    setFormAmenities('Attached Bath, Wi-Fi, Storage Wardrobe');
    setFormStatus('Available');
    setViewState('add');
  };

  // Apply Add / Edit Room
  const handleSaveRoomForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomNum) return;

    if (viewState === 'add') {
      const isDuplicated = propertyRooms.some(r => r.roomNumber === formRoomNum);
      if (isDuplicated) {
        setRoomAlertMessage(`Room Unit ${formRoomNum} already exists on this property record.`);
        return;
      }

      const newRoom: Room = {
        id: `room-${Date.now()}`,
        propertyId: selectedPropertyId,
        roomNumber: formRoomNum,
        floor: Number(formFloor),
        type: formType,
        pricePerMonth: Number(formPriceMonth),
        pricePerDay: Number(formPriceDay),
        priceWeekly: Number(formPriceWeekly),
        priceSeasonal: Number(formPriceSeasonal),
        amenities: formAmenities.split(',').map(item => item.trim()).filter(Boolean),
        occupancyStatus: 'Available'
      };

      // Create Beds mapped list
      const count = sharingCapacity[formType];
      const newBeds: Bed[] = [];
      for (let i = 0; i < count; i++) {
        const letter = String.fromCharCode(65 + i); // A, B, C, D
        newBeds.push({
          id: `bed-${newRoom.id}-${letter.toLowerCase()}`,
          roomId: newRoom.id,
          roomNumber: newRoom.roomNumber,
          bedNumber: letter,
          isOccupied: false
        });
      }

      try {
        const resRoom = await fetch('http://localhost:8000/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newRoom.id,
            property_id: selectedPropertyId,
            room_number: newRoom.roomNumber,
            floor: newRoom.floor,
            category: newRoom.type,
            sharing_type: newRoom.type,
            price_daily: newRoom.pricePerDay,
            price_weekly: newRoom.priceWeekly,
            price_seasonal: newRoom.priceSeasonal,
            price_monthly: newRoom.pricePerMonth,
            status: 'Available'
          })
        });

        if (resRoom.ok) {
          for (const b of newBeds) {
            await fetch('http://localhost:8000/api/beds', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: b.id,
                room_id: b.roomId,
                bed_number: b.bedNumber,
                status: 'Available'
              })
            });
          }
          await syncAllFromBackend();
          
          const localRooms = JSON.parse(localStorage.getItem('hotel_pg_rooms') || '[]');
          const localBeds = JSON.parse(localStorage.getItem('hotel_pg_beds') || '[]');
          syncRoomsAndBeds(localRooms, localBeds);
          onAddAuditLog(`Registered new Room Unit ${newRoom.roomNumber} with co-living capacity mapping`, 'Rooms');
        } else {
          setRoomAlertMessage('Failed to save housing unit to backend database.');
        }
      } catch (err) {
        console.error(err);
        setRoomAlertMessage('Connection error. Failed to save housing unit to backend.');
      }
    } else if (viewState === 'edit') {
      // Find room in global states
      const updatedRooms = rooms.map(r => {
        if (r.id === formRoomId) {
          return {
            ...r,
            roomNumber: formRoomNum,
            floor: Number(formFloor),
            type: formType,
            pricePerMonth: Number(formPriceMonth),
            pricePerDay: Number(formPriceDay),
            priceWeekly: Number(formPriceWeekly),
            priceSeasonal: Number(formPriceSeasonal),
            amenities: formAmenities.split(',').map(item => item.trim()).filter(Boolean),
            occupancyStatus: formStatus
          };
        }
        return r;
      });

      // Update associated beds if room number changes
      const updatedBeds = beds.map(b => {
        if (b.roomId === formRoomId) {
          return {
            ...b,
            roomNumber: formRoomNum
          };
        }
        return b;
      });

      syncRoomsAndBeds(updatedRooms, updatedBeds);
      onAddAuditLog(`Modified details for Room Unit ${formRoomNum}`, 'Rooms');
    }

    setViewState('view');
  };

  // Delete Room Unit
  const handleDeleteRoomUnit = (targetId: string, name: string) => {
    const hasOccupiedBeds = beds.some(b => b.roomId === targetId && b.isOccupied);
    if (hasOccupiedBeds) {
      setRoomAlertMessage(`Room Unit ${name} has active tenant allocations. Please checkout or reallocate tenants first.`);
      return;
    }

    setRoomConfirmDelete({ id: targetId, name });
  };

  const executeDeleteRoomUnit = (targetId: string, name: string) => {
    const remainingRooms = rooms.filter(r => r.id !== targetId);
    const remainingBeds = beds.filter(b => b.roomId !== targetId);
    syncRoomsAndBeds(remainingRooms, remainingBeds);

    // Clean up any tenants associated with this room to prevent dangling references
    const updatedTenants = tenants.map(t => {
      if (t.roomId === targetId) {
        return {
          ...t,
          roomId: undefined,
          roomNumber: undefined,
          bedId: undefined,
          bedNumber: undefined,
          status: t.status === 'Active' ? ('Checked-Out' as const) : t.status
        };
      }
      return t;
    });
    syncTenants(updatedTenants);

    onAddAuditLog(`Erase Room Unit ${name} from active property registry`, 'Rooms');
    setRoomConfirmDelete(null);
  };

  // Quick switch status (Available <-> Maintenance)
  const toggleMaintenanceStatus = (rm: Room) => {
    const updatedStatus = rm.occupancyStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    const updated = rooms.map(r => r.id === rm.id ? { ...r, occupancyStatus: updatedStatus as any } : r);
    syncRoomsAndBeds(updated, beds);
    onAddAuditLog(`Rooms ${rm.roomNumber} status toggled to compliance: ${updatedStatus}`, 'Rooms');
  };

  const selectedDetailsRoomObj = rooms.find(r => r.id === activeDetailsRoomId);
  const roomOccupants = selectedDetailsRoomObj ? tenants.filter(t => t.roomId === selectedDetailsRoomObj.id && t.status === 'Active') : [];
  const roomBeds = selectedDetailsRoomObj ? beds.filter(b => b.roomId === selectedDetailsRoomObj.id) : [];
  const roomCleaningHistory = selectedDetailsRoomObj ? propertyHousekeeping.filter(h => h.roomNumber === selectedDetailsRoomObj.roomNumber) : [];

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Visual Workspace Toggles: View lists vs Add/Edit forms */}
      {viewState === 'view' ? (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Action Bar & Search Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            
            {/* Left controls: filters */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit room number..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-3 py-1.5 focus:bg-white focus:outline-indigo-500 font-medium"
              />

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium font-mono text-[10px]">FLOOR:</span>
                <select 
                  value={selectedFloorFilter} 
                  onChange={(e) => setSelectedFloorFilter(e.target.value)}
                  className="bg-slate-50 border rounded-lg text-[11px] p-1.5 font-semibold text-slate-700"
                >
                  <option value="All">All Floors</option>
                  {availableFloors.map(f => (
                    <option key={f} value={f.toString()}>{f}th Floor</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium font-mono text-[10px]">SHARING:</span>
                <select 
                  value={selectedTypeFilter} 
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-slate-50 border rounded-lg text-[11px] p-1.5 font-semibold text-slate-700"
                >
                  <option value="All">All Models</option>
                  <option value="Single">Single (1 Bed)</option>
                  <option value="Double">Double (2 Beds)</option>
                  <option value="Triple">Triple (3 Beds)</option>
                  <option value="Four-Sharing">Four-Sharing (4 Beds)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium font-mono text-[10px]">STATUS:</span>
                <select 
                  value={selectedStatusFilter} 
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-50 border rounded-lg text-[11px] p-1.5 font-semibold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Full">Full</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Right Controls: add trigger and view toggler */}
            <div className="flex items-center gap-2 self-end md:self-auto text-xs">
              <div className="bg-slate-100 p-1 rounded-xl flex border">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                  title="Card Grid Mode"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                  title="Spread Table Mode"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={triggerAddRoomMode}
                className="bg-cyan-600 hover:bg-cyan-700 hover:shadow shadow-cyan-600/10 text-white font-bold inline-flex items-center space-x-1.5 p-2 px-4 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Housing Unit</span>
              </button>
            </div>

          </div>

          {/* Cards Grid Mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredRooms.map(rm => {
                const occupiedCount = propertyBeds.filter(b => b.roomId === rm.id && b.isOccupied).length;
                const percent = Math.round((occupiedCount / sharingCapacity[rm.type]) * 100);

                const badgeStyles = {
                  'Available': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'Full': 'bg-rose-50 text-rose-700 border-rose-105',
                  'Maintenance': 'bg-amber-50 text-amber-700 border-amber-105'
                };

                return (
                  <div 
                    key={rm.id} 
                    onClick={() => setActiveDetailsRoomId(rm.id)}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-display">Unit {rm.roomNumber}</span>
                          <span className="bg-slate-100 text-slate-500 border text-[9px] font-bold px-1.5 py-0.5 rounded-md">{rm.type}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-medium block">Floor {rm.floor} &bull; Room ID: {rm.id.split('-').pop()}</span>
                      </div>

                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setActiveDetailsRoomId(rm.id)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border p-1.5 rounded-xl transition"
                          title="Detailed Room Audit Roommates"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => triggerEditRoomMode(rm)}
                          className="bg-slate-50 hover:bg-slate-100 text-cyan-600 border p-1.5 rounded-xl transition"
                          title="Configure Parameters"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoomUnit(rm.id, rm.roomNumber)}
                          className="bg-slate-50 hover:bg-rose-50 text-rose-600 border p-1.5 rounded-xl transition"
                          title="Erase Inventory Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress tracking line */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Total Co-lining Utilization</span>
                        <span className="font-mono font-bold text-slate-700">{occupiedCount}/{sharingCapacity[rm.type]} Beds</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-700 ${
                            rm.occupancyStatus === 'Maintenance' ? 'bg-amber-500' :
                            percent === 100 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] pt-1">
                      <div className="bg-slate-50 border/40 rounded-xl p-2">
                        <span className="text-slate-400 block pb-0.5 font-medium">Monthly Contract</span>
                        <strong className="text-slate-800 text-xs text-display">₹{rm.pricePerMonth.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="bg-slate-50 border/40 rounded-xl p-2">
                        <span className="text-slate-400 block pb-0.5 font-medium">Daily Guest Rate</span>
                        <strong className="text-slate-800 text-xs text-display">₹{rm.pricePerDay.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {/* Footer badges info */}
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-50">
                      <span className={`px-2 py-0.5 rounded-md border font-extrabold text-[9px] ${badgeStyles[rm.occupancyStatus] || ''}`}>
                        {rm.occupancyStatus}
                      </span>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {occupiedCount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedRoomForShift(rm);
                              setIsShiftModalOpen(true);
                            }}
                            className="text-indigo-500 hover:text-indigo-650 font-bold transition flex items-center gap-1 cursor-pointer no-uiverse"
                            title="Shift occupant to another vacant bed"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Shift Bed</span>
                          </button>
                        )}
                        <button 
                          onClick={() => toggleMaintenanceStatus(rm)}
                          className={`font-bold transition ${rm.occupancyStatus === 'Maintenance' ? 'text-emerald-500 hover:text-emerald-600' : 'text-amber-500 hover:text-amber-600'}`}
                        >
                          {rm.occupancyStatus === 'Maintenance' ? 'Release Unit Clean' : 'Order Maintenance'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            
            /* Table list View Mode */
            <div className="bg-white border rounded-none shadow-sm overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                    <th className="p-4 text-[10px] uppercase">Room Unit</th>
                    <th className="p-4 text-[10px] uppercase">Level Floor</th>
                    <th className="p-4 text-[10px] uppercase">Sharing Class</th>
                    <th className="p-4 text-[10px] uppercase">Amenities Amenities</th>
                    <th className="p-4 text-[10px] uppercase">Rent / Month</th>
                    <th className="p-4 text-[10px] uppercase font-mono">Daily Rate</th>
                    <th className="p-4 text-[10px] uppercase">Occupancy Matrix Status</th>
                    <th className="p-4 text-[10px] uppercase">Control Panel Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map(rm => {
                    const occupiedCount = beds.filter(b => b.roomId === rm.id && b.isOccupied).length;
                    return (
                      <tr key={rm.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black text-slate-900 text-sm">Unit {rm.roomNumber}</td>
                        <td className="p-4 font-mono font-semibold text-slate-500">{rm.floor}th Floor</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">{rm.type}</span>
                        </td>
                        <td className="p-4 text-slate-600 italic truncate max-w-xs">{rm.amenities.join(', ')}</td>
                        <td className="p-4 font-bold text-slate-900">₹{rm.pricePerMonth.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-slate-500 font-mono">₹{rm.pricePerDay}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            rm.occupancyStatus === 'Available' ? 'bg-emerald-100 text-emerald-850' :
                            rm.occupancyStatus === 'Full' ? 'bg-rose-100 text-rose-850' : 'bg-amber-150 text-amber-900'
                          }`}>
                            {rm.occupancyStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {occupiedCount > 0 && (
                              <button 
                                onClick={() => {
                                  setSelectedRoomForShift(rm);
                                  setIsShiftModalOpen(true);
                                }}
                                className="bg-slate-50 hover:bg-slate-100 text-indigo-500 p-1.5 rounded-lg border transition cursor-pointer"
                                title="Shift Tenant Bed"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                              </button>
                            )}
                            <button 
                              onClick={() => setActiveDetailsRoomId(rm.id)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg border transition"
                              title="Explore Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => triggerEditRoomMode(rm)}
                              className="bg-slate-50 hover:bg-slate-100 text-cyan-600 p-1.5 rounded-lg border transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRoomUnit(rm.id, rm.roomNumber)}
                              className="bg-slate-50 hover:bg-rose-50 text-rose-500 p-1.5 rounded-lg border transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          )}

          {filteredRooms.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed rounded-3xl max-w-sm mx-auto space-y-2 p-5">
              <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold italic">No matching inventory units matching filters.</p>
              <button 
                onClick={() => {
                  setSelectedFloorFilter('All');
                  setSelectedStatusFilter('All');
                  setSelectedTypeFilter('All');
                  setSearchQuery('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded"
              >
                Reset Search Filters
              </button>
            </div>
          )}

        </div>
      ) : (
        
        /* Add Room or Edit Room inline view forms */
        <div className="bg-white border rounded-3xl p-6 shadow-sm max-w-xl mx-auto space-y-5 animate-slideIn text-xs">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-display">
                {viewState === 'add' ? 'Register New Co-Living Room Unit' : `Edit Unit Config: ${formRoomNum}`}
              </h3>
              <p className="text-[11px] text-slate-400">Specify sizing parameters, price structures, and automated bed mappings</p>
            </div>
            <button 
              onClick={() => setViewState('view')} 
              className="p-1 hover:bg-slate-100 rounded-full border transition"
            >
              <X className="w-4.5 h-4.5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSaveRoomForm} className="space-y-4 font-medium text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Room Number / ID *</label>
                <input 
                  type="text" 
                  value={formRoomNum}
                  onChange={(e) => setFormRoomNum(e.target.value)}
                  placeholder="E.g., 205, Main-3, Penthouse"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 w-full focus:bg-white focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Floor Level</label>
                <input 
                  type="number" 
                  value={formFloor}
                  onChange={(e) => setFormFloor(Number(e.target.value))}
                  min="0"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Sharing Unit Standard</label>
                <select 
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full border rounded-xl p-2.5 bg-slate-5 bg-white"
                  disabled={viewState === 'edit'} // Lock bed change counts on edit to protect allocations
                >
                  <option value="Single">Single (1 Bed Max Capacity)</option>
                  <option value="Double">Double (2 Beds Max Capacity)</option>
                  <option value="Triple">Triple (3 Beds Max Capacity)</option>
                  <option value="Four-Sharing">Four-Sharing (4 Beds Max Capacity)</option>
                </select>
                {viewState === 'edit' && <span className="text-[10px] text-slate-400 italic mt-1 block">Capacity cannot be altered while active bed layouts persist.</span>}
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Occupancy System Status</label>
                <select 
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border rounded-xl p-2.5 bg-slate-5 bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Full">Full (Manually Set)</option>
                  <option value="Maintenance">Maintenance Locked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Monthly License Rent (₹)</label>
                <input 
                  type="number" 
                  value={formPriceMonth}
                  onChange={(e) => setFormPriceMonth(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Weekly License Rent (₹)</label>
                <input 
                  type="number" 
                  value={formPriceWeekly}
                  onChange={(e) => setFormPriceWeekly(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Seasonal License Rent (₹)</label>
                <input 
                  type="number" 
                  value={formPriceSeasonal}
                  onChange={(e) => setFormPriceSeasonal(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Daily Contract Rental (₹)</label>
                <input 
                  type="number" 
                  value={formPriceDay}
                  onChange={(e) => setFormPriceDay(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Comma-Separated Amenities Facilities</label>
              <textarea 
                rows={2}
                value={formAmenities}
                onChange={(e) => setFormAmenities(e.target.value)}
                placeholder="Geyser, High-Speed Wi-Fi, Balcony, Attached Toilet Desk"
                className="w-full border rounded-xl p-2.5 bg-slate-5 focus:bg-white"
              />
            </div>

            <div className="flex gap-2.5 pt-3">
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 py-2.5 rounded-xl transition"
              >
                {viewState === 'add' ? 'Initialize Inventory & Generate Beds Map' : 'Save Config Updates'}
              </button>
              <button 
                type="button"
                onClick={() => setViewState('view')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition border"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROOM DETAILS DRAWER / MODAL POPUP */}
      {activeDetailsRoomId && selectedDetailsRoomObj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-[999] text-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft text-slate-800">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 text-indigo-700 font-bold font-mono">ROOM UNIT AUDIT</span>
                  <h3 className="text-xl font-black text-slate-950 font-display mt-1.5">Unit Room {selectedDetailsRoomObj.roomNumber}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Physical roommate maps and operational registers</p>
                </div>
                <button 
                  onClick={() => setActiveDetailsRoomId(null)}
                  className="p-1 hover:bg-slate-100 rounded-full border transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Beds & roommate mappings */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Beds Utilization schema ({roomBeds.length} Beds)</h4>
                <div className="space-y-2.5">
                  {roomBeds.map(bd => {
                    const resident = tenants.find(t => t.id === bd.occupantTenantId && t.propertyId === selectedPropertyId && t.status === 'Active');
                    const activeBooking = resident && bookings ? bookings.find(b => (b.tenantId === resident.id || b.customerEmail?.toLowerCase() === resident.email?.toLowerCase()) && (b.status === 'Confirmed' || b.status === 'Active')) : null;
                    return (
                      <div 
                        key={bd.id} 
                        className={`p-3 border rounded-xl flex flex-col gap-2 ${
                          bd.isOccupied ? 'bg-indigo-50/20 border-indigo-100' : 'bg-emerald-50/10 border-emerald-100 border-dashed'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${bd.isOccupied ? 'bg-indigo-100 text-indigo-650' : 'bg-emerald-100 text-emerald-650'}`}>
                              <BedIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 font-mono text-[11px]">Bed Position {bd.bedNumber}</span>
                              <span className="text-[10px] block text-slate-500 font-medium">
                                {bd.isOccupied && resident ? `Tenant occupant: ${resident.name}` : 'Vacant Accommodation'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {bd.isOccupied && resident ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveOccupant(bd.id);
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[8px] font-black px-2 py-1 rounded uppercase transition active:scale-95 cursor-pointer"
                                >
                                  Remove
                                </button>
                                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Occupied</span>
                              </>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Vacant</span>
                            )}
                          </div>
                        </div>

                        {bd.isOccupied && resident && (
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-[9.5px] text-slate-600 flex flex-col gap-0.5">
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-500">Occupant Email:</span>
                              <span className="font-mono text-slate-800">{resident.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-500">Check-in Duration:</span>
                              <span className="font-mono text-slate-800">
                                {activeBooking ? `${activeBooking.checkInDate} to ${activeBooking.checkOutDate}` : `${resident.joinedDate || '2026-06-01'} to 2026-11-30`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Roommate Profiles */}
              {roomOccupants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Current Occupants ({roomOccupants.length})</h4>
                  <div className="space-y-2">
                    {roomOccupants.map(occ => {
                      const isExpanded = selectedViewTenantBillId === occ.id;
                      const bk = bookings.find(b => 
                        (b.tenantId && b.tenantId === occ.id) || 
                        (b.customerEmail && b.customerEmail.toLowerCase() === occ.email.toLowerCase())
                      );

                      let checkIn = occ.joinedDate || '2026-06-01';
                      let checkOut = '2026-06-05';
                      let diffDays = 4;
                      let dayRate = 1200;
                      let baseOriginal = 4800;
                      let gst = 864;
                      let total = 5664;

                      if (bk) {
                        checkIn = bk.checkInDate;
                        checkOut = bk.checkOutDate;
                        const start = new Date(bk.checkInDate);
                        const end = new Date(bk.checkOutDate);
                        const diffTime = Math.max(0, end.getTime() - start.getTime());
                        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                        total = bk.totalAmount || 0;
                        baseOriginal = Math.round(total / 1.18);
                        dayRate = Math.round(baseOriginal / diffDays);
                        gst = total - baseOriginal;
                      } else {
                        const room = rooms.find(r => r.id === occ.roomId || r.roomNumber === occ.roomNumber);
                        dayRate = room ? (room.pricePerDay || 1200) : 1200;
                        baseOriginal = dayRate * diffDays;
                        gst = Math.round(baseOriginal * 0.18);
                        total = baseOriginal + gst;
                      }

                      return (
                        <div 
                          key={occ.id} 
                          onClick={() => setSelectedViewTenantBillId(isExpanded ? null : occ.id)}
                          className="p-3 bg-slate-50 border hover:border-slate-300 rounded-xl space-y-1.5 cursor-pointer transition select-none text-left"
                        >
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-900 text-[11.5px]">{occ.name}</span>
                            <span className="text-slate-500 text-[10px] font-mono">{occ.phone}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium flex justify-between">
                            <span>Email: {occ.email}</span>
                            <span>Check-in: <strong className="font-mono text-slate-600">{checkIn}</strong></span>
                          </div>
                          
                          {isExpanded && (
                            <div className="border-t border-slate-200 pt-2 mt-2 space-y-1.5 text-[10px] font-medium text-slate-650 bg-slate-100/50 p-2 rounded-lg">
                              <div className="font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-0.5 font-mono">Stay Contract & Billing breakdown:</div>
                              <div className="flex justify-between">
                                <span>Check-in / Check-out:</span>
                                <span className="font-mono text-slate-800 font-bold">{checkIn} to {checkOut}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Stay Duration:</span>
                                <span className="font-mono text-slate-800 font-bold">{diffDays} Day{diffDays > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Day Rate:</span>
                                <span className="font-mono text-slate-800 font-bold">₹{dayRate.toLocaleString('en-IN')} * {diffDays} = ₹{baseOriginal.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST Tax (18%):</span>
                                <span className="font-mono text-slate-700 font-bold">₹{gst.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between border-t pt-1 font-bold text-indigo-750 text-xs">
                                <span>Total Booking Bill:</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                          {!isExpanded && (
                            <div className="text-[9.5px] text-slate-400 italic text-right mt-1 font-mono">
                              Click card to audit stay contract bill &rarr;
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Maintenance & cleaning schedules history */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Recent Housekeeping logs</h4>
                {roomCleaningHistory.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] pl-1">No cleaning history records logged for this room unit.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roomCleaningHistory.map(hk => (
                      <div key={hk.id} className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center text-[10px] border">
                        <div>
                          <strong>{hk.assignedStaff}</strong>
                          <span className="text-slate-400 block text-[9px]">{hk.date}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                          hk.status === 'Completed' ? 'bg-emerald-100 text-emerald-850' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {hk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <button 
              onClick={() => setActiveDetailsRoomId(null)}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold p-3 rounded-xl transition text-center text-xs mt-6"
            >
              Close Room Audit File
            </button>

          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL OVERLAY */}
      {roomAlertMessage && (
        <div id="room-alert-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">System Action Alert</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{roomAlertMessage}</p>
            </div>
            <button 
              onClick={() => setRoomAlertMessage(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL OVERLAY */}
      {roomConfirmDelete && (
        <div id="room-delete-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🗑️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Erase Room Unit?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you absolutely sure you want to completely erase <strong>Unit Room {roomConfirmDelete.name}</strong>? All linked bed structures will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setRoomConfirmDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Keep File
              </button>
              <button 
                onClick={() => executeDeleteRoomUnit(roomConfirmDelete.id, roomConfirmDelete.name)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT BED MODAL OVERLAY */}
      {isShiftModalOpen && selectedRoomForShift && (
        <div id="room-shift-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border text-left text-slate-800 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-900">Shift Tenant Bed / Unit</h3>
                <p className="text-[10px] text-slate-400">Reallocate resident from Room {selectedRoomForShift.roomNumber} to another vacant bed</p>
              </div>
              <button 
                onClick={() => {
                  setIsShiftModalOpen(false);
                  setSelectedRoomForShift(null);
                  setSelectedTenantToShiftId('');
                  setShiftTargetBedId('');
                }} 
                className="p-1 hover:bg-slate-150 rounded-full transition border cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-450" />
              </button>
            </div>

            <form onSubmit={executeShiftResident} className="space-y-4">
              <div>
                <label className="block text-slate-550 mb-1 text-[11px] font-bold">Select Resident to Shift *</label>
                <select
                  value={selectedTenantToShiftId}
                  onChange={(e) => setSelectedTenantToShiftId(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-bold text-slate-900"
                  required
                >
                  <option value="">-- Choose Resident --</option>
                  {tenants
                    .filter(t => t.roomId === selectedRoomForShift.id && t.status === 'Active')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Bed {t.bedNumber || 'A'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-550 mb-1 text-[11px] font-bold">Select Target Vacant Bed *</label>
                <select
                  value={shiftTargetBedId}
                  onChange={(e) => setShiftTargetBedId(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-bold text-slate-900"
                  required
                >
                  <option value="">-- Choose Vacant Bed --</option>
                  {beds
                    .filter(b => !b.isOccupied && rooms.some(r => r.id === b.roomId && r.propertyId === selectedPropertyId))
                    .map(b => {
                      const r = rooms.find(room => room.id === b.roomId);
                      return (
                        <option key={b.id} value={b.id}>
                          Room {r ? r.roomNumber : 'Unknown'} - Bed {b.bedNumber} ({r ? r.type : ''})
                        </option>
                      );
                    })}
                </select>
                {beds.filter(b => !b.isOccupied && rooms.some(r => r.id === b.roomId && r.propertyId === selectedPropertyId)).length === 0 && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">⚠️ No vacant beds available in this property!</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShiftModalOpen(false);
                    setSelectedRoomForShift(null);
                    setSelectedTenantToShiftId('');
                    setShiftTargetBedId('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={beds.filter(b => !b.isOccupied && rooms.some(r => r.id === b.roomId && r.propertyId === selectedPropertyId)).length === 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Confirm Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
