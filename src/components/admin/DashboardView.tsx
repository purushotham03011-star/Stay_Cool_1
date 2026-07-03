import React, { useState, useEffect } from 'react';
import { mobileOpen } from '../../utils/mobileOpen';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Booking, 
  Invoice 
} from '../../types';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  ChevronRight, 
  ArrowRight,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Inbox,
  AlertCircle,
  Clock,
  Plus,
  Compass,
  MapPin,
  X,
  CreditCard,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Utensils,
  Phone,
  MessageSquare
} from 'lucide-react';

interface DashboardViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  bookings: Booking[];
  invoices: Invoice[];
  selectedPropertyId: string;
  setBookings: (books: Booking[]) => void;
  syncRoomsAndBeds: (rooms: Room[], beds: Bed[]) => void;
  syncTenants: (tenants: Tenant[]) => void;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
  staff?: any[];
  syncStaff?: (updatedStaff: any[]) => void;
  syncInvoices?: (updatedInvoices: Invoice[]) => void;
}

export default function DashboardView({
  properties,
  rooms,
  beds,
  tenants,
  bookings,
  invoices,
  selectedPropertyId,
  setBookings,
  syncRoomsAndBeds,
  syncTenants,
  onAddAuditLog,
  staff = [],
  syncStaff,
  syncInvoices
}: DashboardViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const activeAdminSession = (() => {
    try {
      const stored = localStorage.getItem('hotel_pg_active_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();
  const adminName = activeAdminSession?.name || "Sunny";
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId && t.status === 'Active');
  const propertyBookings = bookings.filter(b => b.propertyId === selectedPropertyId);
  const propertyInvoices = invoices.filter(i => tenants.some(t => t.id === i.tenantId && t.propertyId === selectedPropertyId));

  // 8 Statistics Calculations
  const totalRoomsCount = propertyRooms.length;
  const availableRoomsCount = propertyRooms.filter(r => r.occupancyStatus === 'Available').length;
  const occupiedRoomsCount = propertyRooms.filter(r => r.occupancyStatus === 'Full').length;
  
  const totalTenantsCount = propertyTenants.length;
  const propertyStaff = staff ? staff.filter(s => s.propertyId === selectedPropertyId || s.propertyId === 'all') : [];
  const totalStaffCount = propertyStaff.filter(s => s.status === 'Active').length || 4; // default mock if fallback
  
  const activeBookingsCount = propertyBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;

  const collectedRevenue = propertyInvoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOutstandingBill = propertyInvoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  // Filter pending booking alerts
  const pendingBookings = propertyBookings.filter(b => b.status === 'Pending');

  // Outstanding Payment Reminders states
  const [showPaymentRemindersModal, setShowPaymentRemindersModal] = useState<boolean>(false);
  const [whatsAppReminderInvoice, setWhatsAppReminderInvoice] = useState<any | null>(null);
  const [whatsAppReminderText, setWhatsAppReminderText] = useState<string>('');

  const handleOpenReminderWhatsApp = (inv: any) => {
    setWhatsAppReminderInvoice(inv);
    setWhatsAppReminderText(`Dear ${inv.tenantName || 'Resident'},\n\nKindly note that your payment for ${inv.type} (${inv.month}) totaling ₹${inv.amount.toLocaleString('en-IN')} is outstanding. Please complete the transaction at your earliest. If already paid, please ignore this message.\n\nThank you!`);
  };

  const handleSendReminderWhatsAppSubmit = () => {
    if (!whatsAppReminderInvoice) return;
    const resident = tenants.find(t => t.id === whatsAppReminderInvoice.tenantId);
    const phone = (resident && resident.phone) ? resident.phone : '';
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(whatsAppReminderText)}`;
    mobileOpen(url);
    setWhatsAppReminderInvoice(null);
  };

  const handleMarkInvoiceAsPaid = (invId: string) => {
    const matched = invoices.find(i => i.id === invId);
    const tName = matched ? matched.tenantName : 'Co-liver';
    
    // Create audit log
    onAddAuditLog(`Received payment for Invoice ID ${invId} (Co-liver: ${tName}) via Dashboard alerts center`, 'Billing');
    
    const updated = invoices.map(i => {
      if (i.id === invId) {
        return { ...i, status: 'Paid' as const };
      }
      return i;
    });

    if (syncInvoices) {
      syncInvoices(updated);
    }
  };

  // Trigger quick modals
  const [modalType, setModalType] = useState<'room' | 'tenant' | 'staff' | 'booking' | null>(null);

  // Stats Details Modals
  const [detailsModal, setDetailsModal] = useState<'total_rooms' | 'available_rooms' | 'occupied_rooms' | 'total_tenants' | 'total_staff' | 'pending_payments' | null>(null);
  const [paymentsTab, setPaymentsTab] = useState<'unpaid' | 'paid'>('unpaid');

  // Modal forms states
  const [roomForm, setRoomForm] = useState({ roomNo: '', floor: '0', type: 'Double' as 'Single'|'Double'|'Triple'|'Four-Sharing', price: 9000 });
  const [tenantForm, setTenantForm] = useState({ name: '', phone: '', email: '', gender: 'Male' as 'Male'|'Female'|'Other' });
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', role: 'Watchman' as any, shift: 'Day (8am-4pm)' });
  const [bookingForm, setBookingForm] = useState({ guestName: '', guestPhone: '', guestEmail: '', totalPay: 12000, days: 30 });

  // Floor, Room, Bed check-in selectors
  const [selectedCheckInFloor, setSelectedCheckInFloor] = useState<string>('');
  const [selectedCheckInRoomId, setSelectedCheckInRoomId] = useState<string>('');
  const [selectedCheckInBedId, setSelectedCheckInBedId] = useState<string>('');

  // Pre-populate floor, room, and bed choices on modal open
  useEffect(() => {
    if (modalType === 'tenant') {
      const floorsWithVacancy = Array.from(new Set(propertyRooms.filter(r => beds.some(b => b.roomId === r.id && !b.isOccupied)).map(r => r.floor))).sort((a, b) => a - b);
      if (floorsWithVacancy.length > 0) {
        const defaultFloor = floorsWithVacancy[0];
        setSelectedCheckInFloor(String(defaultFloor));

        const roomsOnFloor = propertyRooms.filter(r => r.floor === defaultFloor && beds.some(b => b.roomId === r.id && !b.isOccupied));
        if (roomsOnFloor.length > 0) {
          setSelectedCheckInRoomId(roomsOnFloor[0].id);

          const vacantBeds = beds.filter(b => b.roomId === roomsOnFloor[0].id && !b.isOccupied);
          if (vacantBeds.length > 0) {
            setSelectedCheckInBedId(vacantBeds[0].id);
          } else {
            setSelectedCheckInBedId('');
          }
        } else {
          setSelectedCheckInRoomId('');
          setSelectedCheckInBedId('');
        }
      } else {
        setSelectedCheckInFloor('');
        setSelectedCheckInRoomId('');
        setSelectedCheckInBedId('');
      }
    }
  }, [modalType, selectedPropertyId, rooms, beds]);

  const handleFloorChange = (floorVal: string) => {
    setSelectedCheckInFloor(floorVal);
    const roomsOnFloor = propertyRooms.filter(r => r.floor === Number(floorVal) && beds.some(b => b.roomId === r.id && !b.isOccupied));
    if (roomsOnFloor.length > 0) {
      setSelectedCheckInRoomId(roomsOnFloor[0].id);
      const bedsInRoom = beds.filter(b => b.roomId === roomsOnFloor[0].id && !b.isOccupied);
      if (bedsInRoom.length > 0) {
        setSelectedCheckInBedId(bedsInRoom[0].id);
      } else {
        setSelectedCheckInBedId('');
      }
    } else {
      setSelectedCheckInRoomId('');
      setSelectedCheckInBedId('');
    }
  };

  const handleRoomChange = (roomIdVal: string) => {
    setSelectedCheckInRoomId(roomIdVal);
    const bedsInRoom = beds.filter(b => b.roomId === roomIdVal && !b.isOccupied);
    if (bedsInRoom.length > 0) {
      setSelectedCheckInBedId(bedsInRoom[0].id);
    } else {
      setSelectedCheckInBedId('');
    }
  };

  // Handle Quick Modals Submissions
  const handleAddRoomQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNo) return;
    
    const floorNum = parseInt(roomForm.floor) || 0;
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      propertyId: selectedPropertyId,
      roomNumber: roomForm.roomNo,
      floor: floorNum,
      type: roomForm.type,
      pricePerMonth: roomForm.price,
      pricePerDay: Math.round(roomForm.price / 30),
      amenities: ['High-speed Wifi', 'AC', 'Power Backup'],
      occupancyStatus: 'Available'
    };

    // Auto generate bed allocations
    const bedShares = roomForm.type === 'Single' ? 1 : roomForm.type === 'Double' ? 2 : roomForm.type === 'Triple' ? 3 : 4;
    const generatedBeds: Bed[] = [];
    for (let i = 0; i < bedShares; i++) {
      generatedBeds.push({
        id: `bed-${Date.now()}-${i}`,
        roomId: newRoom.id,
        roomNumber: newRoom.roomNumber,
        bedNumber: String.fromCharCode(65 + i), // A, B, C, D
        isOccupied: false
      });
    }

    syncRoomsAndBeds([...rooms, newRoom], [...beds, ...generatedBeds]);
    onAddAuditLog(`Added room ${newRoom.roomNumber} (${newRoom.type}) via Dashboard Quick Action`, 'Rooms');
    setModalType(null);
    setRoomForm({ roomNo: '', floor: '0', type: 'Double', price: 9000 });
  };

  const handleAddTenantQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.name || !tenantForm.phone) return;

    if (!selectedCheckInRoomId || !selectedCheckInBedId) {
      alert('Error: Please select a valid Room and Bed!');
      return;
    }

    const targetRoom = propertyRooms.find(r => r.id === selectedCheckInRoomId);
    if (!targetRoom) {
      alert('Error: Selected room not found!');
      return;
    }

    const targetBed = beds.find(b => b.id === selectedCheckInBedId && !b.isOccupied);
    if (!targetBed) {
      alert('Error: Selected bed is no longer available or occupied!');
      return;
    }

    const tId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tId,
      name: tenantForm.name,
      email: tenantForm.email || `${tenantForm.phone}@stayhub.com`,
      phone: tenantForm.phone,
      gender: tenantForm.gender,
      emergencyContactName: 'Guardian Support',
      emergencyContactPhone: tenantForm.phone,
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      propertyId: selectedPropertyId,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updatedBeds = beds.map(b => b.id === targetBed.id ? { ...b, isOccupied: true, occupantTenantId: tId } : b);
    const roomBeds = updatedBeds.filter(b => b.roomId === targetRoom.id);
    const allFilled = roomBeds.every(b => b.isOccupied);
    const updatedRooms = rooms.map(r => r.id === targetRoom.id ? { ...r, occupancyStatus: (allFilled ? 'Full' : 'Available') as any } : r);

    syncRoomsAndBeds(updatedRooms, updatedBeds);
    syncTenants([...tenants, newTenant]);

    onAddAuditLog(`Checked-in resident ${newTenant.name} into Room ${newTenant.roomNumber} - Bed ${targetBed.bedNumber} via Dashboard Quick Action`, 'Tenants');
    setModalType(null);
    setTenantForm({ name: '', phone: '', email: '', gender: 'Male' });
  };

  const handleCreateStaffQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) return;

    const newS: any = {
      id: `staff-${Date.now()}`,
      propertyId: selectedPropertyId,
      fullName: staffForm.name,
      phone: staffForm.phone,
      address: 'Assigned to Premises Address',
      role: staffForm.role,
      shiftTiming: staffForm.shift,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      salary: 15000,
      profilePhoto: `https://images.unsplash.com/photo-${staffForm.role === 'Reception Staff' ? '1573496359142-b8d87734a5a2' : '1540569014015-19a7be504e3a'}?w=150`,
      notes: '',
      tasks: []
    };

    if (syncStaff) {
      syncStaff([newS, ...staff]);
    } else {
      const existingStaff = JSON.parse(localStorage.getItem('staff') || '[]');
      localStorage.setItem('staff', JSON.stringify([newS, ...existingStaff]));
    }
    
    onAddAuditLog(`Added staff member ${newS.fullName} (${newS.role}) via Dashboard Quick Action`, 'SuperAdmin');
    
    setModalType(null);
    setStaffForm({ name: '', phone: '', role: 'Watchman', shift: 'Day (8am-4pm)' });
    alert('Roster updated! Refreshing live analytics cache.');
  };

  const handleAddBookingQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.guestName || !bookingForm.guestPhone) return;

    const newBk: Booking = {
      id: `bk-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      customerName: bookingForm.guestName,
      customerEmail: bookingForm.guestEmail || 'walkin@guest.com',
      customerPhone: bookingForm.guestPhone,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + bookingForm.days * 24 * 3600 * 1000).toISOString().split('T')[0],
      mealPlan: 'Full Board',
      status: 'Pending',
      totalAmount: bookingForm.totalPay,
      bookingDate: new Date().toISOString()
    };

    const updated = [newBk, ...bookings];
    setBookings(updated);
    localStorage.setItem('hotel_pg_bookings', JSON.stringify(updated));

    onAddAuditLog(`Registered standby reservation voucher for ${newBk.customerName} via Dashboard Quick Action`, 'Bookings');
    setModalType(null);
    setBookingForm({ guestName: '', guestPhone: '', guestEmail: '', totalPay: 12000, days: 30 });
  };

  // Convert Booking to ACTIVE directly from dashboard queue
  const handleApproveBookingDirect = (bk: Booking) => {
    const availableRm = propertyRooms.find(r => r.occupancyStatus === 'Available');
    if (!availableRm) {
      alert('Error: All inventory slots are currently full. Allocate rooms or checkout co-livers first.');
      return;
    }

    const availableBed = beds.find(b => b.roomId === availableRm.id && !b.isOccupied);
    if (!availableBed) {
      alert('No unoccupied physical bed found. Review bed layouts.');
      return;
    }

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: bk.customerName,
      email: bk.customerEmail,
      phone: bk.customerPhone,
      gender: 'Male',
      docType: 'Aadhaar',
      docUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      emergencyContactName: 'Guardian Support',
      emergencyContactPhone: bk.customerPhone,
      roomId: availableRm.id,
      roomNumber: availableRm.roomNumber,
      bedId: availableBed.id,
      bedNumber: availableBed.bedNumber,
      propertyId: selectedPropertyId,
      propertyName: currentProperty ? currentProperty.name : 'StayHub Guest',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const updatedBeds = beds.map(b => b.id === availableBed.id ? { ...b, isOccupied: true, occupantTenantId: newTenant.id } : b);
    const roomBeds = updatedBeds.filter(b => b.roomId === availableRm.id);
    const allFull = roomBeds.every(b => b.isOccupied);
    const updatedRooms = rooms.map(r => r.id === availableRm.id ? { ...r, occupancyStatus: (allFull ? 'Full' : 'Available') as any } : r);
    const updatedBookings = bookings.map(b => b.id === bk.id ? { ...b, status: 'Confirmed' as const, roomId: availableRm.id, roomNumber: availableRm.roomNumber, bedId: availableBed.id, bedNumber: availableBed.bedNumber } : b);

    setBookings(updatedBookings);
    localStorage.setItem('hotel_pg_bookings', JSON.stringify(updatedBookings));

    syncRoomsAndBeds(updatedRooms, updatedBeds);
    syncTenants([...tenants, newTenant]);

    onAddAuditLog(`Approved booking ${bk.id} and checked in ${bk.customerName} (Room ${availableRm.roomNumber})`, 'Tenants');
  };

  const handleRejectBookingDirect = (bk: Booking) => {
    if (!window.confirm(`Are you sure you want to reject the booking request from ${bk.customerName}?`)) return;

    const updatedBookings = bookings.map(b => b.id === bk.id ? { ...b, status: 'Rejected' as const } : b);

    setBookings(updatedBookings);
    localStorage.setItem('hotel_pg_bookings', JSON.stringify(updatedBookings));

    onAddAuditLog(`Rejected booking request ${bk.id} from ${bk.customerName}`, 'Bookings');
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 text-xs font-sans">
      
      {/* 1. PREMIUM GLASSMORPHISM WELCOME CARD */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-150/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hq-welcome-banner">
        
        {/* Subtle glowing radial gradient orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10 text-left">
          <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight hq-welcome-title">
            Welcome back, {adminName} 👋
          </h2>
          <p className="text-[10px] font-bold tracking-wide uppercase hq-welcome-sub">
            {currentProperty ? `${currentProperty.name} • ${currentProperty.city}` : 'Silicon Valley Elite PG • Bangalore'}
          </p>
        </div>
      </div>

      {/* 2. DYNAMIC FLOATING/QUICK ACTION BUTTONS BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-150/70 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-left">
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-slate-900 text-xs">Administrative Front-Desk Actions</h4>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto font-sans">
          <button 
            onClick={() => setModalType('tenant')}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-205 font-bold p-1.5 px-3 rounded-lg transition text-[11px]"
          >
            <UserPlus className="w-3 h-3 text-emerald-600" />
            <span>+ Add Tenant</span>
          </button>
          <button 
            onClick={() => setModalType('staff')}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-205 font-bold p-1.5 px-3 rounded-lg transition text-[11px]"
          >
            <Briefcase className="w-3 h-3 text-amber-500" />
            <span>+ Add Staff</span>
          </button>
          <button 
            onClick={() => setModalType('booking')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1.5 px-3.5 rounded-lg transition shadow-xs text-[11px]"
          >
            <Plus className="w-3 h-3" />
            <span>+ Add Booking</span>
          </button>
        </div>
      </div>

      {/* 3. COHESIVE 6 STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Rooms */}
        <div 
          onClick={() => setDetailsModal('total_rooms')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total Rooms</span>
            <span className="text-base font-black text-slate-900 font-display block">{totalRoomsCount} Units</span>
            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Floor Layout</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hidden sm:block shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* Available Rooms */}
        <div 
          onClick={() => setDetailsModal('available_rooms')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Available Rooms</span>
            <span className="text-base font-black text-emerald-600 font-display block">{availableRoomsCount} Vacant</span>
            <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Ready To Move</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hidden sm:block shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Occupied Rooms */}
        <div 
          onClick={() => setDetailsModal('occupied_rooms')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Occupied Rooms</span>
            <span className="text-base font-black text-amber-600 font-display block">{occupiedRoomsCount} Filled</span>
            <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Full Capacity</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg hidden sm:block shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Total Tenants */}
        <div 
          onClick={() => setDetailsModal('total_tenants')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total Tenants</span>
            <span className="text-base font-black text-slate-900 font-display block">{totalTenantsCount} Guests</span>
            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Roster profiles</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hidden sm:block shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Total Staff */}
        <div 
          onClick={() => setDetailsModal('total_staff')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total Staff</span>
            <span className="text-base font-black text-slate-900 font-display block">{totalStaffCount} Active</span>
            <span className="text-[8px] bg-indigo-50 text-indigo-750 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Duty assigned</span>
          </div>
          <div className="p-2 bg-slate-50 border text-slate-550 rounded-lg hidden sm:block shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        {/* Pending Payments */}
        <div 
          onClick={() => setDetailsModal('pending_payments')}
          className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-150/70 flex items-center justify-between transition hover:shadow-md cursor-pointer text-left transform hover:-translate-y-0.5"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Pending Payments</span>
            <span className="text-base font-black text-rose-600 font-display block">₹{totalOutstandingBill.toLocaleString('en-IN')}</span>
            <span className="text-[8px] bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-mono font-bold block w-max uppercase">Unpaid dues</span>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg hidden sm:block shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 4. NOTIFICATION & ALERTS CENTRE */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-150/75 shadow-xs space-y-3.5 text-left animate-fadeIn">
        <div>
          <h3 className="font-extrabold text-slate-900 text-xs shadow-none">Notifications & Alerts Centre</h3>
          <p className="text-[10px] text-slate-400">Automated alerts from real-estate sensors and client rosters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Notification A: Booking Alerts */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-2.5">
            <Inbox className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-850 block text-[11px]">Booking Alert</span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {pendingBookings.length} pending guest requests are awaiting bed assignment confirmation
              </span>
            </div>
          </div>

          {/* Notification B: Payment Reminders */}
          <div 
            onClick={() => setShowPaymentRemindersModal(true)}
            className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 cursor-pointer hover:bg-rose-100/50 hover:shadow-xs transition duration-200"
            title="Click to view outstanding co-liver payments"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-850 block text-[11px]">Outstanding Payment Reminder</span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Outstanding bills totaling ₹{totalOutstandingBill.toLocaleString('en-IN')} has crossed due parameters
              </span>
            </div>
          </div>

          {/* Notification C: Maintenance Alert */}
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-850 block text-[11px]">Housekeeping Alert</span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                3 cleaning tasks scheduled for today need supervisor assignment matching
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 6. PENDING CUSTOMER BOOKINGS FROM COMPANION APP */}
      <div className="bg-white p-5 rounded-3xl border border-slate-150/75 shadow-xs space-y-4 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Pending Customer Companion App Booking Actions</h3>
            <p className="text-[11px] text-slate-400">Verify incoming reservation summaries and map them to vacant bed allocations</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold text-[10px] border border-indigo-100 font-mono">
            {pendingBookings.length} Requests standby
          </span>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500 italic">Everything clear! No pending co-living bookings on file.</p>
            <p className="text-[10px] text-slate-400">Incoming reservations from customer companion app show up here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map(bk => {
              const checkIn = new Date(bk.checkInDate || Date.now());
              const checkOut = new Date(bk.checkOutDate || Date.now());
              const msDiff = checkOut.getTime() - checkIn.getTime();
              const daysDiff = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
              const durationType = daysDiff === 1 
                ? 'Daily Pass Plan (1 Day stay)' 
                : daysDiff >= 30 
                  ? `Monthly PG Lease (${Math.round(daysDiff / 30)} Month term)` 
                  : `Short-Term stay (${daysDiff} Days duration)`;

              // Format requestedRoomType human readable
              const formatSharingLabel = (type?: string) => {
                if (!type) return '2 Sharing (Standard)';
                switch(type) {
                  case 'Single': return 'Single Sharing (Private)';
                  case 'Double': return '2 Bed Sharing Layout';
                  case 'Triple': return '3 Bed Sharing Layout';
                  case 'Four-Sharing': return '4 Bed Sharing Layout';
                  default: return `${type} Sharing`;
                }
              };

              return (
                <div key={bk.id} className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/85 rounded-2xl flex flex-col gap-4 transition hover:bg-slate-100/40">
                  {/* Top Header Row with Customer info and plan type */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/50 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 font-extrabold text-sm">{bk.customerName}</strong>
                        <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {durationType}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-x-1.5 flex flex-wrap items-center">
                        <span className="font-mono text-slate-605">{bk.customerEmail}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-605">{bk.customerPhone}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Invoice Pricing</span>
                      <strong className="text-sm font-black text-indigo-700">₹{bk.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Booking Specific details: Sharing selection, Payment mode and joining schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    {/* Selected Room Type */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between shadow-xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Selected Room Type</span>
                      <div>
                        <strong className="text-[11px] text-slate-800 font-extrabold block">{formatSharingLabel(bk.requestedRoomType)}</strong>
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">Assigned by customer config</span>
                      </div>
                    </div>

                    {/* Choose Payment Mode details */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between shadow-xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Payment Method Details</span>
                      <div>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-mono leading-none font-bold uppercase tracking-wide inline-block">
                          {bk.paymentMethod || 'UPI / Bank Transfer'}
                        </span>
                        <span className="text-[9.5px] text-slate-400 block mt-1">Pending approval check</span>
                      </div>
                    </div>

                    {/* Check In Join & Checkout details */}
                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between shadow-xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Schedule Frame</span>
                      <div className="space-y-0.5 text-[10px] leading-tight font-medium text-slate-600">
                        <div>
                          <span className="text-emerald-600 font-bold font-mono">Join Time:</span> {bk.checkInDate} <span className="text-slate-400">(12 PM)</span>
                        </div>
                        <div>
                          <span className="text-rose-500 font-bold font-mono">End Time:</span> {bk.checkOutDate} <span className="text-slate-400">(11 AM)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer block */}
                  <div className="flex justify-end gap-2 pt-1 bg-slate-200/30 -mx-5 -mb-5 p-3 rounded-b-2xl border-t border-slate-200/55">
                    <button 
                      onClick={() => handleRejectBookingDirect(bk)}
                      className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-extrabold p-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition inline-flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>Reject Request</span>
                    </button>
                    <button 
                      onClick={() => handleApproveBookingDirect(bk)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold p-2 px-5 rounded-xl text-[10px] uppercase tracking-wider transition inline-flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>Approve Room & Welcome Guest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== INLINE FLOATING QUICK MODALS SYSTEM ==================== */}

      {/* 0. STATS DETAILS INTERACTIVE MODAL */}
      {detailsModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-scaleUp text-left">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-950">
                  {detailsModal === 'total_rooms' && 'Total Rooms Directory'}
                  {detailsModal === 'available_rooms' && 'Available Rooms (Vacant)'}
                  {detailsModal === 'occupied_rooms' && 'Occupied Rooms (Full)'}
                  {detailsModal === 'total_tenants' && 'Guests & Bookings Directory'}
                  {detailsModal === 'total_staff' && 'Active Staff Directory'}
                  {detailsModal === 'pending_payments' && 'Payments & Dues Ledger'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {detailsModal === 'total_rooms' && 'Complete list of all registered rooms and floors.'}
                  {detailsModal === 'available_rooms' && 'List of unoccupied rooms currently ready to move.'}
                  {detailsModal === 'occupied_rooms' && 'List of rooms currently at full occupancy.'}
                  {detailsModal === 'total_tenants' && 'Active in-house guests and incoming room bookings.'}
                  {detailsModal === 'total_staff' && 'Roster of active personnel and assigned roles.'}
                  {detailsModal === 'pending_payments' && 'Track paid accounts versus delayed/outstanding invoices.'}
                </p>
              </div>
              <button onClick={() => setDetailsModal(null)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3 min-h-0 py-2">
              {/* Total Rooms Modal content */}
              {detailsModal === 'total_rooms' && (
                <div className="space-y-2">
                  {propertyRooms.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No rooms registered under this property yet.</p>
                  ) : (
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                            <th className="p-2.5">Room</th>
                            <th className="p-2.5">Floor</th>
                            <th className="p-2.5">Type/Category</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {propertyRooms.map(room => (
                            <tr key={room.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-900">{room.roomNumber}</td>
                              <td className="p-2.5 text-slate-600">Floor {room.floor}</td>
                              <td className="p-2.5 text-slate-600">{room.type}</td>
                              <td className="p-2.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  room.occupancyStatus === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                                  room.occupancyStatus === 'Full' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {room.occupancyStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Available Rooms Modal content */}
              {detailsModal === 'available_rooms' && (
                <div className="space-y-2">
                  {propertyRooms.filter(r => r.occupancyStatus === 'Available').length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No vacant rooms available at the moment.</p>
                  ) : (
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                            <th className="p-2.5">Room</th>
                            <th className="p-2.5">Floor</th>
                            <th className="p-2.5">Sharing Type</th>
                            <th className="p-2.5">Monthly Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {propertyRooms.filter(r => r.occupancyStatus === 'Available').map(room => (
                            <tr key={room.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-900">{room.roomNumber}</td>
                              <td className="p-2.5 text-slate-600 font-bold">Floor {room.floor}</td>
                              <td className="p-2.5 text-slate-600">{room.type}</td>
                              <td className="p-2.5 text-slate-900 font-bold">₹{room.pricePerMonth.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Occupied Rooms Modal content */}
              {detailsModal === 'occupied_rooms' && (
                <div className="space-y-2">
                  {propertyRooms.filter(r => r.occupancyStatus === 'Full').length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No fully occupied rooms registered.</p>
                  ) : (
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                            <th className="p-2.5">Room</th>
                            <th className="p-2.5">Floor</th>
                            <th className="p-2.5">Sharing Type</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {propertyRooms.filter(r => r.occupancyStatus === 'Full').map(room => (
                            <tr key={room.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-900">{room.roomNumber}</td>
                              <td className="p-2.5 text-slate-600 font-bold">Floor {room.floor}</td>
                              <td className="p-2.5 text-slate-600">{room.type}</td>
                              <td className="p-2.5 text-amber-600 font-bold">Full Capacity</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Total Tenants Modal content */}
              {detailsModal === 'total_tenants' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Checked-in Guests ({propertyTenants.length})</h4>
                    {propertyTenants.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-2 border rounded-xl text-center">No active checked-in tenants found.</p>
                    ) : (
                      <div className="border rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                              <th className="p-2.5">Guest</th>
                              <th className="p-2.5">Room/Bed</th>
                              <th className="p-2.5">Contact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {propertyTenants.map(tenant => (
                              <tr key={tenant.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <div className="font-bold text-slate-900">{tenant.name}</div>
                                  <div className="text-[10px] text-slate-400">Joined: {tenant.joinedDate}</div>
                                </td>
                                <td className="p-2.5">
                                  <span className="font-bold text-slate-700">Room {tenant.roomNumber || 'N/A'}</span>
                                  {tenant.bedNumber && <span className="text-slate-500 text-[10px] ml-1">(Bed {tenant.bedNumber})</span>}
                                </td>
                                <td className="p-2.5">
                                  <div className="text-slate-600">{tenant.phone}</div>
                                  <div className="text-[10px] text-slate-400">{tenant.email}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Customers who booked a room but aren't checked in yet */}
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Hostel Bookings / Reservations ({propertyBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length})</h4>
                    {propertyBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-2 border rounded-xl text-center">No pending/confirmed bookings found.</p>
                    ) : (
                      <div className="border rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                              <th className="p-2.5">Customer</th>
                              <th className="p-2.5">Preferred Room</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {propertyBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').map(booking => (
                              <tr key={booking.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5">
                                  <div className="font-bold text-slate-900">{booking.customerName}</div>
                                  <div className="text-[10px] text-slate-400">{booking.customerPhone}</div>
                                </td>
                                <td className="p-2.5">
                                  {booking.roomNumber ? (
                                    <span className="font-bold text-slate-700">Room {booking.roomNumber}</span>
                                  ) : (
                                    <span className="text-slate-500 font-medium italic">{booking.requestedRoomType || 'Any Room'}</span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    booking.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Staff Modal content */}
              {detailsModal === 'total_staff' && (
                <div className="space-y-2">
                  {propertyStaff.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No staff members registered for this property.</p>
                  ) : (
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                            <th className="p-2.5">Staff Name</th>
                            <th className="p-2.5">Assigned Role</th>
                            <th className="p-2.5">Shift / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {propertyStaff.map((st, idx) => (
                            <tr key={st.id || idx} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <div className="font-bold text-slate-900">{st.fullName || st.name}</div>
                                <div className="text-[10px] text-slate-400">{st.phone}</div>
                              </td>
                              <td className="p-2.5">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                  {st.role}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-600">
                                <div className="text-[10px] font-bold">{st.shiftTiming || st.shift || 'Day Shift'}</div>
                                <div className="text-[9px] text-emerald-600 font-bold uppercase">{st.status || 'Active'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Payments Modal content with dual paid/unpaid buttons */}
              {detailsModal === 'pending_payments' && (
                <div className="space-y-4">
                  {/* Dual buttons for Paid vs Unpaid */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-max mx-auto space-x-1 shrink-0">
                    <button
                      onClick={() => setPaymentsTab('unpaid')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        paymentsTab === 'unpaid'
                          ? 'bg-white text-rose-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Unpaid & Overdue (₹{totalOutstandingBill.toLocaleString('en-IN')})
                    </button>
                    <button
                      onClick={() => setPaymentsTab('paid')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        paymentsTab === 'paid'
                          ? 'bg-white text-emerald-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      style={{ color: paymentsTab === 'paid' ? '#059669' : undefined }}
                    >
                      Payments Paid (₹{collectedRevenue.toLocaleString('en-IN')})
                    </button>
                  </div>

                  {paymentsTab === 'unpaid' ? (
                    <div className="space-y-2">
                      {propertyInvoices.filter(i => i.status !== 'Paid').length === 0 ? (
                        <p className="text-xs text-emerald-600 text-center py-4 font-bold">✓ All invoices are fully paid! No outstanding dues.</p>
                      ) : (
                        <div className="border rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                <th className="p-2.5">Resident</th>
                                <th className="p-2.5">Bill Details</th>
                                <th className="p-2.5">Due Date</th>
                                <th className="p-2.5">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {propertyInvoices.filter(i => i.status !== 'Paid').map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-900">{inv.tenantName}</td>
                                  <td className="p-2.5 text-slate-600">
                                    <div className="font-semibold">{inv.type}</div>
                                    <div className="text-[10px] text-slate-400">{inv.month}</div>
                                  </td>
                                  <td className="p-2.5 font-bold text-rose-600">
                                    {inv.dueDate}
                                  </td>
                                  <td className="p-2.5 text-rose-600 font-black">
                                    ₹{inv.amount.toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {propertyInvoices.filter(i => i.status === 'Paid').length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No completed payments found.</p>
                      ) : (
                        <div className="border rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                <th className="p-2.5">Resident</th>
                                <th className="p-2.5">Bill Details</th>
                                <th className="p-2.5">Paid At / Method</th>
                                <th className="p-2.5">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {propertyInvoices.filter(i => i.status === 'Paid').map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-900">{inv.tenantName}</td>
                                  <td className="p-2.5 text-slate-600">
                                    <div className="font-semibold">{inv.type}</div>
                                    <div className="text-[10px] text-slate-400">{inv.month}</div>
                                  </td>
                                  <td className="p-2.5 text-emerald-600 font-semibold">
                                    <div>{inv.paidAt || 'Completed'}</div>
                                    <div className="text-[10px] text-slate-400">{inv.paymentMethod || 'UPI'}</div>
                                  </td>
                                  <td className="p-2.5 text-emerald-600 font-black">
                                    ₹{inv.amount.toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-3 flex justify-end shrink-0">
              <button
                onClick={() => setDetailsModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-1.5 px-4 rounded-xl transition text-[11px]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ADD ROOM QUICK MODAL */}
      {modalType === 'room' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-scaleUp text-left">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">Quick Add Room Layout</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Specify building coordinates inside active property registry</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddRoomQuick} className="space-y-4 pt-1">
              <div>
                <label className="block text-slate-550 mb-1">Room Number *</label>
                <input 
                  type="text" 
                  value={roomForm.roomNo} 
                  onChange={(e) => setRoomForm({ ...roomForm, roomNo: e.target.value })} 
                  placeholder="E.g., 205" 
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 mb-1">Floor Coordinate</label>
                  <input 
                    type="number" 
                    value={roomForm.floor} 
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 font-bold">Category Shares *</label>
                  <select 
                    value={roomForm.type} 
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as any })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-55 bg-slate-50 font-bold"
                  >
                    <option value="Single">Single Deluxe</option>
                    <option value="Double">Double standard</option>
                    <option value="Triple">Triple Deluxe</option>
                    <option value="Four-Sharing">Four Sharing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-550 mb-1">Price Per Month (₹) *</label>
                <input 
                  type="number" 
                  value={roomForm.price} 
                  onChange={(e) => setRoomForm({ ...roomForm, price: parseInt(e.target.value) || 8000 })} 
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-bold" 
                  required 
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs">
                Complete Inventory Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD TENANT QUICK MODAL */}
      {modalType === 'tenant' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-scaleUp text-left">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">Quick Check-in Resident</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Automaps occupant to first available vacancy bed slot</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddTenantQuick} className="space-y-4 pt-1">
              <div>
                <label className="block text-slate-550 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={tenantForm.name} 
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} 
                  placeholder="E.g., Devashish Sen" 
                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white" 
                  required 
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">Phone Number *</label>
                <input 
                  type="text" 
                  value={tenantForm.phone} 
                  onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} 
                  placeholder="E.g., 99000 88000" 
                  className="w-full border rounded-xl p-2.5 bg-slate-50' focus:bg-white" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={tenantForm.email} 
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} 
                    placeholder="dev@sen.com" 
                    className="w-full border rounded-xl p-2.5 bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-slate-550 mb-1">Gender *</label>
                  <select 
                    value={tenantForm.gender} 
                    onChange={(e) => setTenantForm({ ...tenantForm, gender: e.target.value as any })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-55 bg-slate-50 font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Floor, Room & Bed Selection */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                <h4 className="font-bold text-[10px] uppercase text-indigo-600 tracking-wider">Bed Space Allocation</h4>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Floor</label>
                    <select
                      value={selectedCheckInFloor}
                      onChange={(e) => handleFloorChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                    >
                      {Array.from(new Set(propertyRooms.map(r => r.floor)))
                        .sort((a, b) => a - b)
                        .map(flr => (
                          <option key={flr} value={flr}>Floor {flr}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Room</label>
                    <select
                      value={selectedCheckInRoomId}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                    >
                      {propertyRooms
                        .filter(r => r.floor === Number(selectedCheckInFloor))
                        .map(rm => {
                          const vacantBedsCount = beds.filter(b => b.roomId === rm.id && !b.isOccupied).length;
                          return (
                            <option key={rm.id} value={rm.id} disabled={vacantBedsCount === 0}>
                              Room {rm.roomNumber} ({vacantBedsCount} Vacant)
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Bed</label>
                    <select
                      value={selectedCheckInBedId}
                      onChange={(e) => setSelectedCheckInBedId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2 bg-white font-bold"
                    >
                      {beds
                        .filter(b => b.roomId === selectedCheckInRoomId && !b.isOccupied)
                        .map(bd => (
                          <option key={bd.id} value={bd.id}>Bed {bd.bedNumber}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!selectedCheckInBedId}
                className={`w-full font-black py-3 rounded-xl uppercase tracking-wider text-xs transition ${
                  selectedCheckInBedId
                    ? 'bg-slate-900 hover:bg-slate-950 text-white cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {selectedCheckInBedId ? 'Complete Check-in & Allocate' : 'No Vacancy Available'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD STAFF QUICK MODAL */}
      {modalType === 'staff' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-scaleUp text-left">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">Quick Roster Staff</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Specify name and field credentials for active roster rosters</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffQuick} className="space-y-4 pt-1">
              <div>
                <label className="block text-slate-550 mb-1">Staff Member Full Name *</label>
                <input 
                  type="text" 
                  value={staffForm.name} 
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} 
                  placeholder="Sri. Ram Murti" 
                  className="w-full border rounded-xl p-2.5 bg-slate-55 bg-slate-50" 
                  required 
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1">Phone Contact *</label>
                <input 
                  type="text" 
                  value={staffForm.phone} 
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} 
                  placeholder="99887 76655" 
                  className="w-full border rounded-xl p-2.5 bg-slate-55 bg-slate-50" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-555 mb-1 text-[11px] font-bold">Role Assignment *</label>
                  <select 
                    value={staffForm.role} 
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-50 font-extrabold"
                  >
                    <option value="Watchman">Watchman</option>
                    <option value="Cleaning Staff">Cleaning Staff</option>
                    <option value="Reception Staff">Receptionist</option>
                    <option value="Maintenance Staff">Electrician/AC Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-555 mb-1 text-[11px]">Shift Timing *</label>
                  <select 
                    value={staffForm.shift} 
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-50"
                  >
                    <option>Day (8am-4pm)</option>
                    <option>Night (8pm-4am)</option>
                    <option>Evening (4pm-midnight)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-650 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs">
                Append To Live Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD BOOKING QUICK MODAL */}
      {modalType === 'booking' && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-scaleUp text-left">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">Add Voucher Standby</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Define booking values for coming onboarding cycle</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddBookingQuick} className="space-y-4 pt-1">
              <div>
                <label className="block text-slate-555 mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  value={bookingForm.guestName} 
                  onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })} 
                  placeholder="E.g. Amit Mathur" 
                  className="w-full border rounded-xl p-2.5 bg-slate-50" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-555 mb-1">Mobile Contact *</label>
                  <input 
                    type="text" 
                    value={bookingForm.guestPhone} 
                    onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })} 
                    placeholder="99000 77000" 
                    className="w-full border rounded-xl p-2.5 bg-slate-50" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-slate-555 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={bookingForm.guestEmail} 
                    onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })} 
                    placeholder="amit@mathur.com" 
                    className="w-full border rounded-xl p-2.5 bg-slate-50" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-555 mb-1">Contract Term (Days)</label>
                  <input 
                    type="number" 
                    value={bookingForm.days} 
                    onChange={(e) => setBookingForm({ ...bookingForm, days: parseInt(e.target.value) || 30 })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-slate-555 mb-1">Total Estimated Rent *</label>
                  <input 
                    type="number" 
                    value={bookingForm.totalPay} 
                    onChange={(e) => setBookingForm({ ...bookingForm, totalPay: parseInt(e.target.value) || 12000 })} 
                    className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-650 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs">
                Register Standby Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OUTSTANDING PAYMENT REMINDERS DETAILED MONITOR MODAL */}
      {showPaymentRemindersModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9900] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-display">Outstanding Payment Roster</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Lease tracking & balance settlement dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentRemindersModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-full border border-slate-150 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {(() => {
                const unpaid = invoices.filter(i => i.status !== 'Paid' && tenants.some(t => t.id === i.tenantId && t.propertyId === selectedPropertyId));
                
                if (unpaid.length === 0) {
                  return (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-black">
                        ✓
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">No Outstanding Invoices Found</h4>
                      <p className="text-[10px] text-slate-400">Awesome! All co-livers have paid off their balances.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {unpaid.map(inv => {
                      const res = tenants.find(t => t.id === inv.tenantId);
                      
                      return (
                        <div key={inv.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs truncate">{inv.tenantName}</h4>
                              <span className="font-extrabold text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                                Unit {res?.roomNumber || 'N/A'} &bull; Bed {res?.bedNumber || 'N/A'}
                              </span>
                            </div>
                            
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-rose-600 font-mono">₹{inv.amount.toLocaleString('en-IN')} Due</span>
                              <span className="text-slate-300">|</span>
                              <span>{inv.type} ({inv.month})</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono font-bold leading-none">
                                Due {inv.dueDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Option 1: Call action */}
                            {res?.phone && (
                              <a 
                                href={`tel:${res.phone.replace(/\s+/g, '')}`}
                                className="py-1.5 px-2.5 text-[10px] bg-white text-indigo-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0"
                                title={`Phone Call ${inv.tenantName}`}
                              >
                                <Phone className="w-3 h-3 text-indigo-600" />
                                <span>Call</span>
                              </a>
                            )}

                            {/* Option 2: WhatsApp reminder template */}
                            <button 
                              type="button"
                              onClick={() => handleOpenReminderWhatsApp(inv)}
                              className="py-1.5 px-2.5 text-[10px] bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-250 rounded-xl transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0 cursor-pointer"
                              title={`WhatsApp Message to ${inv.tenantName}`}
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            {/* Option 3: Paid adjustment slider button */}
                            <button 
                              type="button"
                              onClick={() => handleMarkInvoiceAsPaid(inv.id)}
                              className="py-1.5 px-3 text-[10px] bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition font-black font-sans uppercase tracking-wider shrink-0 cursor-pointer"
                              title="Mark invoice as paid"
                            >
                              <span>Paid</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowPaymentRemindersModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-indigo-650 text-white rounded-xl transition font-semibold text-xs cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP OUTSTANDING CUSTOMIZE POPUP DIALOG */}
      {whatsAppReminderInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9995] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Forward Rent Reminder</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify text body before forwarding to WhatsApp</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppReminderInvoice(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full border border-slate-150 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">Receipt Target Co-liver</span>
                <p className="font-extrabold text-slate-800 text-xs">{whatsAppReminderInvoice.tenantName}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block mb-1">Rent Reminder Message Draft</label>
                <textarea 
                  rows={6}
                  value={whatsAppReminderText}
                  onChange={(e) => setWhatsAppReminderText(e.target.value)}
                  className="bg-slate-50 border rounded-xl p-3 w-full font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-[11px] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3.5 border-slate-100">
              <button 
                type="button" 
                onClick={() => setWhatsAppReminderInvoice(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSendReminderWhatsAppSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/15 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Redirect to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
