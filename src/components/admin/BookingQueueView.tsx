import React, { useState } from 'react';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Booking, 
  Invoice 
} from '../../types';
import { 
  Search, 
  Plus, 
  Calendar, 
  Compass, 
  FileText, 
  CheckCircle, 
  Users, 
  Wrench, 
  Briefcase, 
  ShieldAlert, 
  RefreshCw, 
  ChevronRight, 
  X, 
  Check, 
  PlusCircle, 
  DollarSign, 
  CornerDownRight, 
  FileEdit, 
  Trash2, 
  Clock,
  Phone
} from 'lucide-react';

interface BookingQueueViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  bookings: Booking[];
  selectedPropertyId: string;
  setBookings: (books: Booking[]) => void;
  syncRoomsAndBeds: (rooms: Room[], beds: Bed[]) => void;
  syncTenants: (tenants: Tenant[]) => void;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function BookingQueueView({
  properties,
  rooms,
  beds,
  tenants,
  bookings,
  selectedPropertyId,
  setBookings,
  syncRoomsAndBeds,
  syncTenants,
  onAddAuditLog
}: BookingQueueViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId);
  const activeTenants = propertyTenants.filter(t => t.status === 'Active');
  const propertyBookings = bookings.filter(b => b.propertyId === selectedPropertyId);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all_bookings' | 'active_residents' | 'rent_contracts'>('all_bookings');

  // Modals Toggle States
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Safe iframe dialog states
  const [bookingAlertMessage, setBookingAlertMessage] = useState<string | null>(null);
  const [bookingConfirmCancelId, setBookingConfirmCancelId] = useState<string | null>(null);
  
  // New Manual Walk-In/Group Registration Form State
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    parentName: '',
    parentPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    docType: 'Aadhaar' as 'Aadhaar' | 'Passport' | 'Driving License',
    docNumber: '',
    roomId: '',
    monthlyRent: 8000,
    securityDeposit: 5000,
    mealPlan: 'Breakfast Only' as 'None' | 'Breakfast Only' | 'Full Board',
    contractMonths: 6,
    isGroupCheckIn: false,
    groupCount: 1
  });



  // Handle Approve a system Booking request
  const handleApproveBooking = (bk: Booking) => {
    // Find vacant bed in available rooms
    const availableRooms = propertyRooms.filter(r => r.occupancyStatus === 'Available');
    if (availableRooms.length === 0) {
      alert('Error: All inventory slots are currently full. Please add new room layouts or check-out active tenants.');
      return;
    }

    // Try to find first vacant bed in those available rooms
    const targetRoom = availableRooms[0];
    const targetBed = beds.find(b => b.roomId === targetRoom.id && !b.isOccupied);

    if (!targetBed) {
      alert('No unoccupied physical bed found. Please review bed configuration.');
      return;
    }

    const checkInDateStr = bk.checkInDate || new Date().toISOString().split('T')[0];

    // Create Tenant
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: bk.customerName,
      email: bk.customerEmail,
      phone: bk.customerPhone,
      gender: 'Male',
      docType: 'Aadhaar',
      docUrl: 'Mock Aadhaar PDF Uploaded',
      emergencyContactName: 'Guardian Contact',
      emergencyContactPhone: bk.customerPhone,
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      propertyId: selectedPropertyId,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      status: 'Active',
      joinedDate: checkInDateStr
    };

    // Mark bed as occupied
    const updatedBeds = beds.map(b => b.id === targetBed.id ? { ...b, isOccupied: true, occupantTenantId: newTenant.id } : b);
    
    // Check if room is full
    const roomBeds = updatedBeds.filter(b => b.roomId === targetRoom.id);
    const roomFull = roomBeds.every(b => b.isOccupied);
    const updatedRooms = rooms.map(r => r.id === targetRoom.id ? { ...r, occupancyStatus: (roomFull ? 'Full' : 'Available') as any } : r);

    // Update booking status
    const updatedBookings = bookings.map(b => b.id === bk.id ? { ...b, status: 'Confirmed' as const } : b);

    setBookings(updatedBookings);
    localStorage.setItem('hotel_pg_bookings', JSON.stringify(updatedBookings));

    syncRoomsAndBeds(updatedRooms, updatedBeds);
    syncTenants([...tenants, newTenant]);

    // Create default invoice
    const initialRentInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      month: 'First Month Rent',
      amount: targetRoom.pricePerMonth,
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Unpaid',
      generatedAt: new Date().toISOString(),
      type: 'Rent'
    };
    
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify([...existingInvoices, initialRentInvoice]));

    onAddAuditLog(`Approved incoming booking ${bk.id} and allocated Room ${targetRoom.roomNumber} - Bed ${targetBed.bedNumber} for ${bk.customerName}`, 'Bookings');
  };

  // Reject Booking reservation
  const handleCancelBooking = (bkId: string) => {
    setBookingConfirmCancelId(bkId);
  };

  const executeCancelBooking = (bkId: string) => {
    const updated = bookings.map(b => b.id === bkId ? { ...b, status: 'Cancelled' as const } : b);
    setBookings(updated);
    localStorage.setItem('hotel_pg_bookings', JSON.stringify(updated));
    onAddAuditLog(`Cancelled guest reservation ${bkId}`, 'Bookings');
    setBookingConfirmCancelId(null);
  };

  // Handle Manual Walk-In/Group Registration Check-In Creation
  const handleWalkInCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.name || !walkInForm.phone || !walkInForm.roomId) {
      setBookingAlertMessage('Please fill out all mandatory fields & choose an available room!');
      return;
    }

    const selectedRoomObj = rooms.find(r => r.id === walkInForm.roomId);
    if (!selectedRoomObj) {
      setBookingAlertMessage('Selected Room not found in active inventory registry.');
      return;
    }

    // Capture open beds in this room
    const openBeds = beds.filter(b => b.roomId === selectedRoomObj.id && !b.isOccupied);
    if (openBeds.length === 0) {
      setBookingAlertMessage(`Error: No vacant bed slots available in Room ${selectedRoomObj.roomNumber}.`);
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    if (walkInForm.isGroupCheckIn) {
      const gCount = Math.min(walkInForm.groupCount, openBeds.length);
      onAddAuditLog(`Processing group check-in of size ${gCount} into Room ${selectedRoomObj.roomNumber}`, 'Bookings');
      
      let updatedBedsList = [...beds];
      const newTenantsList: Tenant[] = [];
      const newInvoicesList: Invoice[] = [];

      for (let i = 0; i < gCount; i++) {
        const assignedBed = openBeds[i];
        const memberName = i === 0 ? walkInForm.name : `${walkInForm.name} (Group Member ${i + 1})`;
        const memberId = `tenant-gr-${Date.now()}-${i}`;

        const newTenantObj: Tenant = {
          id: memberId,
          name: memberName,
          email: i === 0 ? walkInForm.email : `member${i + 1}_${walkInForm.phone}@stayhub.com`,
          phone: walkInForm.phone,
          gender: walkInForm.gender,
          docType: walkInForm.docType,
          docUrl: `Mocked ID Upload: # ${walkInForm.docNumber || 'NOT Provided'}`,
          emergencyContactName: walkInForm.emergencyContactName || 'Group Owner Emergency',
          emergencyContactPhone: walkInForm.emergencyContactPhone || walkInForm.phone,
          roomId: selectedRoomObj.id,
          roomNumber: selectedRoomObj.roomNumber,
          bedId: assignedBed.id,
          bedNumber: assignedBed.bedNumber,
          propertyId: selectedPropertyId,
          propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
          status: 'Active',
          joinedDate: todayDate
        };

        newTenantsList.push(newTenantObj);

        // Update bed status in memory
        updatedBedsList = updatedBedsList.map(b => b.id === assignedBed.id ? { ...b, isOccupied: true, occupantTenantId: memberId } : b);

        // Invoicing Rent + Security Deposit
        const invoiceRent: Invoice = {
          id: `inv-gr-r-${Date.now()}-${i}`,
          tenantId: memberId,
          tenantName: memberName,
          propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
          month: 'First Month Rent',
          amount: walkInForm.monthlyRent,
          dueDate: todayDate,
          status: 'Unpaid',
          generatedAt: new Date().toISOString(),
          type: 'Rent'
        };

        const invoiceDeposit: Invoice = {
          id: `inv-gr-d-${Date.now()}-${i}`,
          tenantId: memberId,
          tenantName: memberName,
          propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
          month: 'Refundable Security Deposit',
          amount: walkInForm.securityDeposit,
          dueDate: todayDate,
          status: 'Unpaid',
          generatedAt: new Date().toISOString(),
          type: 'Rent'
        };

        newInvoicesList.push(invoiceRent, invoiceDeposit);
      }

      // Check if room is fully full now
      const finalBeds = updatedBedsList.filter(b => b.roomId === selectedRoomObj.id);
      const isRoomFull = finalBeds.every(b => b.isOccupied);
      const updatedRoomsList = rooms.map(r => r.id === selectedRoomObj.id ? { ...r, occupancyStatus: (isRoomFull ? 'Full' : 'Available') as any } : r);

      // Persist Invoices
      const prevInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([...prevInvoices, ...newInvoicesList]));

      syncRoomsAndBeds(updatedRoomsList, updatedBedsList);
      syncTenants([...tenants, ...newTenantsList]);

      onAddAuditLog(`Group Registered ${gCount} co-livers into Room ${selectedRoomObj.roomNumber} with rent invoicing ₹${walkInForm.monthlyRent}`, 'Tenants');
    } else {
      // Single Tenant Check-In
      const assignedBed = openBeds[0];
      const tenantId = `tenant-${Date.now()}`;

      const newTenantObj: Tenant = {
        id: tenantId,
        name: walkInForm.name,
        email: walkInForm.email || `${walkInForm.phone}@stayhub.com`,
        phone: walkInForm.phone,
        gender: walkInForm.gender,
        docType: walkInForm.docType,
        docUrl: `ID Document Uploaded: ID Number ${walkInForm.docNumber || 'Not recorded'}`,
        emergencyContactName: walkInForm.emergencyContactName || 'Emergency Contact',
        emergencyContactPhone: walkInForm.emergencyContactPhone || walkInForm.phone,
        roomId: selectedRoomObj.id,
        roomNumber: selectedRoomObj.roomNumber,
        bedId: assignedBed.id,
        bedNumber: assignedBed.bedNumber,
        propertyId: selectedPropertyId,
        propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
        status: 'Active',
        joinedDate: todayDate
      };

      const updatedBedsDetails = beds.map(b => b.id === assignedBed.id ? { ...b, isOccupied: true, occupantTenantId: tenantId } : b);
      
      const roomBeds = updatedBedsDetails.filter(b => b.roomId === selectedRoomObj.id);
      const isRoomFull = roomBeds.every(b => b.isOccupied);
      const updatedRoomsDetails = rooms.map(r => r.id === selectedRoomObj.id ? { ...r, occupancyStatus: (isRoomFull ? 'Full' : 'Available') as any } : r);

      // Create dual invoice entries (Rent and deposit)
      const invRent: Invoice = {
        id: `inv-wt-r-${Date.now()}`,
        tenantId: tenantId,
        tenantName: walkInForm.name,
        propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
        month: 'First Month Rent',
        amount: walkInForm.monthlyRent,
        dueDate: todayDate,
        status: 'Unpaid',
        generatedAt: new Date().toISOString(),
        type: 'Rent'
      };

      const invDeposit: Invoice = {
        id: `inv-wt-d-${Date.now()}`,
        tenantId: tenantId,
        tenantName: walkInForm.name,
        propertyName: currentProperty ? currentProperty.name : 'StayHub HQ PG',
        month: 'Refundable Security Deposit',
        amount: walkInForm.securityDeposit,
        dueDate: todayDate,
        status: 'Unpaid',
        generatedAt: new Date().toISOString(),
        type: 'Rent'
      };

      const prevInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([...prevInvoices, invRent, invDeposit]));

      syncRoomsAndBeds(updatedRoomsDetails, updatedBedsDetails);
      syncTenants([...tenants, newTenantObj]);

      onAddAuditLog(`Walk-In registered for ${walkInForm.name} into Room ${selectedRoomObj.roomNumber} (Bed ${assignedBed.bedNumber})`, 'Tenants');
    }

    // Reset walkthrough check in
    setIsCheckInOpen(false);
    setWalkInForm({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      parentName: '',
      parentPhone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      docType: 'Aadhaar',
      docNumber: '',
      roomId: '',
      monthlyRent: 8000,
      securityDeposit: 5000,
      mealPlan: 'Breakfast Only',
      contractMonths: 6,
      isGroupCheckIn: false,
      groupCount: 1
    });
  };



  // Agreement and Contract dates renewal (extensions by +6 months)
  const handleRenewAgreement = (tenant: Tenant) => {
    onAddAuditLog(`Dispatched renewal check & updated agreement duration model for resident: ${tenant.name}`, 'Tenants');
    setBookingAlertMessage(`Agreement renewal contract successfully dispatched! Placed extension on file for ${tenant.name}. Start date aligned to current period.`);
  };

  // Inject Penalty / Late fine charge directly in invoice log
  const handleChargePenalty = (tenant: Tenant) => {
    const penaltyAmount = 500;
    const prevInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    const penaltyInvoice: Invoice = {
      id: `inv-pen-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      month: `${new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })} Late Fee`,
      amount: penaltyAmount,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Unpaid',
      generatedAt: new Date().toISOString(),
      type: 'Penalty'
    };

    localStorage.setItem('invoices', JSON.stringify([...prevInvoices, penaltyInvoice]));
    onAddAuditLog(`Charged ₹${penaltyAmount} penalty fine to ${tenant.name} due to late payment/agreement non-compliance`, 'Billing');
    
    setBookingAlertMessage(`₹${penaltyAmount} Late Penalty invoice successsfully added to account statement of ${tenant.name}. It will appear under Billing!`);
  };

  // Filter lists based on Query
  const filteredBookings = propertyBookings.filter(b => 
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.customerPhone.includes(searchQuery) ||
    b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResidents = activeTenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery) ||
    (t.roomNumber && t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-800 text-xs font-sans animate-fadeIn">
      
      {/* Tab select and general headers Ribbon */}
      <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab('all_bookings'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all_bookings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'
            }`}
          >
            Walk-ins & Reservations
          </button>
          <button 
            onClick={() => { setActiveTab('active_residents'); setSearchQuery(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'active_residents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'
            }`}
          >
            Occupancy, Shift, and Renewals
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter names or mobile number..."
              className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 p-1.5 w-full font-semibold"
            />
          </div>

          <button 
            onClick={() => setIsCheckInOpen(true)}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-xl leading-tight transition select-none flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Walk-In Front Desk Check-In</span>
          </button>
        </div>
      </div>

      {/* CORE ACTIVE TAB VIEWPORT CONTROLS */}
      {activeTab === 'all_bookings' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Guest Reservations & Standby Queue</h3>
                <p className="text-[11px] text-slate-400">Incoming check-in vouchers, parent validation coordinates, and ID uploads</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16 space-y-2.5">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                  <p className="text-xs text-slate-500 italic font-bold">No reservations on file matching search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map(bk => (
                    <div key={bk.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between space-y-3 transition hover:bg-slate-100/40">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-900 font-bold block text-sm">{bk.customerName}</strong>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-mono">
                              <span>{bk.customerEmail} | {bk.customerPhone}</span>
                              <a 
                                href={`tel:${bk.customerPhone.replace(/\s+/g, '')}`}
                                className="p-0.5 hover:bg-slate-200 border border-slate-200 rounded transition inline-flex items-center justify-center shrink-0"
                                title={`Call ${bk.customerName}`}
                              >
                                <Phone className="w-2.5 h-2.5 text-indigo-650" />
                              </a>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            bk.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            bk.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' : 'bg-slate-150 text-slate-500'
                          }`}>
                            {bk.status}
                          </span>
                        </div>

                        {/* ID Verification placeholder / Parent details mapping */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-200/50 pt-2 text-slate-550">
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Parent Contact</span>
                            <strong>Sri. {bk.customerName.split(' ')[1] || 'Kumar'} (Father)</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Document ID Status</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">✔ Aadhaar uploaded</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium bg-white p-2 rounded-xl border border-slate-150/50">
                          Booking period: <strong className="text-slate-700 font-mono">{bk.checkInDate} to {bk.checkOutDate}</strong>
                          <span className="block mt-0.5">Meal Plan choice: <strong className="text-indigo-600 font-bold">{bk.mealPlan}</strong></span>
                        </div>
                      </div>

                      {bk.status === 'Pending' && (
                        <div className="flex gap-2 justify-end pt-2 border-t border-dashed border-slate-200">
                          <button 
                            onClick={() => handleCancelBooking(bk.id)}
                            className="p-1 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-lg text-rose-650 hover:text-rose-750 transition"
                          >
                            Reject & Refund
                          </button>
                          <button 
                            onClick={() => handleApproveBooking(bk)}
                            className="p-1 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-sm inline-flex items-center gap-1"
                          >
                            <span>Approve & Check-in</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'active_residents' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Active Room Occupancy & Shift Control</h3>
              <p className="text-[11px] text-slate-400">Instantly shift guest room beds and manage unit occupancy</p>
            </div>

            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 font-bold">
                    <th className="p-3.5">Co-liver</th>
                    <th className="p-3.5">Assigned Unit</th>
                    <th className="p-3.5">Parent emergency</th>
                    <th className="p-3.5">Joined date</th>
                    <th className="p-3.5">Rent Term</th>
                    <th className="p-3.5 text-center">Security Deposit</th>
                    <th className="p-3.5 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map(t => (
                    <tr key={t.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition">
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span>{t.phone}</span>
                            <a 
                              href={`tel:${t.phone.replace(/\s+/g, '')}`}
                              className="p-0.5 hover:bg-indigo-50 border border-indigo-100/50 rounded transition inline-flex items-center justify-center shrink-0"
                              title={`Call ${t.name}`}
                            >
                              <Phone className="w-2.5 h-2.5 text-indigo-650" />
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {t.roomNumber ? (
                          <span className="bg-indigo-50 border border-indigo-100 font-bold text-indigo-750 px-2 py-0.5 rounded text-[10px]">
                            Room {t.roomNumber} - Bed {t.bedNumber || 'A'}
                          </span>
                        ) : (
                          <span className="text-rose-500 italic font-mono uppercase text-[9px] block">Unallocated Base</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="text-[10px] space-y-0.5">
                          <span className="text-slate-700 block">{t.emergencyContactName}</span>
                          {t.emergencyContactPhone && (
                            <div className="flex items-center gap-1.5 text-slate-450 font-mono">
                              <span>{t.emergencyContactPhone}</span>
                              <a 
                                href={`tel:${t.emergencyContactPhone.replace(/\s+/g, '')}`}
                                className="p-0.5 hover:bg-rose-50 border border-rose-100/50 rounded transition inline-flex items-center justify-center shrink-0"
                                title={`Call Parent ${t.emergencyContactName}`}
                              >
                                <Phone className="w-2.5 h-2.5 text-rose-600" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-500">{t.joinedDate}</td>
                      
                      <td className="p-3.5 font-bold text-slate-800">
                        ₹8,000/mo
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="font-mono text-[10px] text-slate-550 block">₹5,000</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase rounded px-1">Sealed Cash</span>
                      </td>

                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => handleRenewAgreement(t)}
                          className="text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 font-extrabold border border-cyan-150 p-1.5 px-3 rounded-lg transition inline-flex items-center gap-1 text-[10px]"
                        >
                          <span>Renew Agreement</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResidents.length === 0 && (
                <div className="text-center py-20">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-550 italic mt-1.5">No active occupants checked-in matching query parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CHECK IN REGISTERR FOR FRONT OFFICE */}
      {isCheckInOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-medium text-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-900">Walk-In & Group Check-In Desk</h3>
                <p className="text-[10px] text-slate-400">Instantly register occupants inside active real-estate inventories</p>
              </div>
              <button onClick={() => setIsCheckInOpen(false)} className="p-1 hover:bg-slate-150 rounded-full transition border">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleWalkInCheckIn} className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              
              <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-xl">
                <input 
                  type="checkbox"
                  id="isGroup"
                  checked={walkInForm.isGroupCheckIn}
                  onChange={(e) => setWalkInForm({ ...walkInForm, isGroupCheckIn: e.target.checked })}
                  className="rounded text-indigo-650 focus:ring-indigo-600 cursor-pointer"
                />
                <label htmlFor="isGroup" className="font-bold text-slate-800 cursor-pointer text-[11px]">
                  Is this a Group Check-In? (Allocates multiple rooms/beds for the same phone contact)
                </label>
              </div>

              {walkInForm.isGroupCheckIn && (
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Group Members Count *</label>
                  <input 
                    type="number"
                    min={2}
                    max={5}
                    value={walkInForm.groupCount}
                    onChange={(e) => setWalkInForm({ ...walkInForm, groupCount: parseInt(e.target.value) || 2 })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Resident Name *</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Devashish Kumar"
                    value={walkInForm.name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Phone Contact *</label>
                  <input 
                    type="text" 
                    placeholder="E.g., 99000 88000"
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Guardian/Father Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Sri. Rajendra Kumar"
                    value={walkInForm.parentName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, parentName: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Guardian Phone Contact</label>
                  <input 
                    type="text" 
                    placeholder="E.g., 99001 88001"
                    value={walkInForm.parentPhone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, parentPhone: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Emergency Connection Name *</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Amit Kumar (Brother)"
                    value={walkInForm.emergencyContactName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, emergencyContactName: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Emergency Connection Phone *</label>
                  <input 
                    type="text" 
                    placeholder="E.g., 99888 77665"
                    value={walkInForm.emergencyContactPhone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, emergencyContactPhone: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">ID Document Type *</label>
                  <select 
                    value={walkInForm.docType}
                    onChange={(e) => setWalkInForm({ ...walkInForm, docType: e.target.value as any })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="Aadhaar">Aadhaar (UIDAI Verified)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">ID Number Verification *</label>
                  <input 
                    type="text" 
                    placeholder="E.g. UID No: 1200 4500 9001"
                    value={walkInForm.docNumber}
                    onChange={(e) => setWalkInForm({ ...walkInForm, docNumber: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/60 pt-4">
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px] font-bold text-indigo-755">Allocate Room Unit *</label>
                  <select 
                    value={walkInForm.roomId}
                    onChange={(e) => {
                      const selRm = rooms.find(r => r.id === e.target.value);
                      setWalkInForm({ 
                        ...walkInForm, 
                        roomId: e.target.value,
                        monthlyRent: selRm ? selRm.pricePerMonth : 8000
                      });
                    }}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-bold text-slate-900"
                    required
                  >
                    <option value="">-- Choose Available Room --</option>
                    {propertyRooms.map(r => {
                      const openBedsCount = beds.filter(b => b.roomId === r.id && !b.isOccupied).length;
                      return (
                        <option key={r.id} value={r.id} disabled={openBedsCount === 0}>
                          Room {r.roomNumber} ({r.type} - {openBedsCount} open beds) - ₹{r.pricePerMonth}/mo
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 mb-1 text-[11px]">Refundable Security Deposit (₹) *</label>
                  <input 
                    type="number" 
                    value={walkInForm.securityDeposit}
                    onChange={(e) => setWalkInForm({ ...walkInForm, securityDeposit: parseInt(e.target.value) || 5000 })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-indigo-650 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs font-display shadow-sm transition-all"
                >
                  Generate Vouchers & Complete Check-In
                </button>
              </div>

            </form>
          </div>
        </div>
      )}



      {/* CUSTOM BOOKING ALERT SYSTEM */}
      {bookingAlertMessage && (
        <div id="booking-alert-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ℹ️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">System Action Alert</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{bookingAlertMessage}</p>
            </div>
            <button 
              onClick={() => setBookingAlertMessage(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM BOOKING REJECTION / CANCELLATION DIALOG */}
      {bookingConfirmCancelId && (
        <div id="booking-cancel-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🚫
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Cancel Reservation?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you absolutely sure you want to cancel guest reservation <strong>{bookingConfirmCancelId}</strong>? This decision cannot be reversed.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setBookingConfirmCancelId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Keep Active
              </button>
              <button 
                onClick={() => executeCancelBooking(bookingConfirmCancelId)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
