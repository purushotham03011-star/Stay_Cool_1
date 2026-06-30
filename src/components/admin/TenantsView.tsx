import React, { useState } from 'react';
import { mobileOpen } from '../../utils/mobileOpen';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Invoice 
} from '../../types';
import { 
  X, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Eye, 
  DollarSign, 
  UserMinus, 
  FileText, 
  ChevronRight, 
  FileCheck, 
  Users, 
  Download,
  AlertCircle,
  Edit,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface TenantsViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  invoices: Invoice[];
  syncRoomsAndBeds: (rooms: Room[], beds: Bed[]) => void;
  syncTenants: (tenants: Tenant[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function TenantsView({
  properties,
  rooms,
  beds,
  tenants,
  invoices,
  syncRoomsAndBeds,
  syncTenants,
  selectedPropertyId,
  onAddAuditLog
}: TenantsViewProps) {
  const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId);
  const propertyInvoices = invoices.filter(i => tenants.some(t => t.id === i.tenantId && t.propertyId === selectedPropertyId));

  // Search filter options
  const [tenantSearch, setTenantSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGender, setFilterGender] = useState<string>('All');

  // Selected Tenant for detailed Profile Drawer
  const [selectedTenantProfileId, setSelectedTenantProfileId] = useState<string | null>(null);

  // Safe iframe dialog state
  const [tenantConfirmCheckout, setTenantConfirmCheckout] = useState<Tenant | null>(null);

  // Document photo viewer modal state
  const [showDocModalUrl, setShowDocModalUrl] = useState<string | null>(null);

  // Tenant Editing Modal state variables
  const [isEditingTenant, setIsEditingTenant] = useState<boolean>(false);
  const [editTenantForm, setEditTenantForm] = useState<Partial<Tenant>>({});

  const handleSaveTenantEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenantForm.id) return;

    const updatedTenants = tenants.map(t => {
      if (t.id === editTenantForm.id) {
        return {
          ...t,
          name: editTenantForm.name || t.name,
          email: editTenantForm.email || t.email,
          phone: editTenantForm.phone || t.phone,
          gender: (editTenantForm.gender as 'Male' | 'Female' | 'Other') || t.gender,
          bloodGroup: editTenantForm.bloodGroup || t.bloodGroup,
          emergencyContactName: editTenantForm.emergencyContactName || t.emergencyContactName,
          emergencyContactPhone: editTenantForm.emergencyContactPhone || t.emergencyContactPhone,
          docType: editTenantForm.docType || t.docType,
          docUrl: editTenantForm.docUrl || t.docUrl,
        };
      }
      return t;
    });

    syncTenants(updatedTenants);
    onAddAuditLog(`Modified profile fields / KYC dossier of co-liver: ${editTenantForm.name}`, 'Tenants');
    setIsEditingTenant(false);
    setEditTenantForm({});
  };

  // WhatsApp state variables & handlers
  const [whatsAppTenant, setWhatsAppTenant] = useState<Tenant | null>(null);
  const [whatsAppText, setWhatsAppText] = useState<string>('');

  const handleOpenWhatsAppModal = (tenant: Tenant) => {
    setWhatsAppTenant(tenant);
    setWhatsAppText(`Dear ${tenant.name},\n\nKindly note that your rent/housing payment is outstanding. Please process the payment as soon as possible. If already paid, please ignore this message.\n\nThank you!`);
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppTenant) return;
    const cleanedPhone = whatsAppTenant.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(whatsAppText)}`;
    mobileOpen(url);
    setWhatsAppTenant(null);
  };

  // Filter calculations
  const filteredTenants = propertyTenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || 
                          t.phone.includes(tenantSearch) || 
                          t.email.toLowerCase().includes(tenantSearch.toLowerCase()) || 
                          (t.roomNumber && t.roomNumber.toLowerCase().includes(tenantSearch.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesGender = filterGender === 'All' || t.gender === filterGender;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const selectedTenantObj = tenants.find(t => t.id === selectedTenantProfileId);
  
  // Find roommates (other active tenants who share the exact same room ID)
  const roomRoommates = (selectedTenantObj && selectedTenantObj.roomId)
    ? tenants.filter(t => 
        t.roomId === selectedTenantObj.roomId && 
        t.id !== selectedTenantObj.id && 
        t.status === 'Active'
      )
    : [];

  // Invoices issued specifically to this tenant profile
  const tenantInvoices = selectedTenantObj 
    ? invoices.filter(i => i.tenantId === selectedTenantObj.id) 
    : [];

  // Execute checkout deallocation action
  const handleCheckOutTenant = (tenant: Tenant) => {
    setTenantConfirmCheckout(tenant);
  };

  const executeCheckOutTenant = (tenant: Tenant) => {
    // Release bed vacancy flags
    const updatedBeds = beds.map(b => {
      if (b.id === tenant.bedId) {
        return {
          ...b,
          isOccupied: false,
          occupantTenantId: undefined
        };
      }
      return b;
    });

    // Mark room back to Available status
    const updatedRooms = rooms.map(r => {
      if (r.id === tenant.roomId) {
        return {
          ...r,
          occupancyStatus: 'Available' as const
        };
      }
      return r;
    });

    // Archive Tenant
    const updatedTenants = tenants.map(t => {
      if (t.id === tenant.id) {
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

    onAddAuditLog(`Directly Checked Out resident ${tenant.name} from Room Unit ${tenant.roomNumber}`, 'Tenants');
    
    // Close profile drawer if open
    setSelectedTenantProfileId(null);
    setTenantConfirmCheckout(null);
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn text-xs">
      
      {/* Search Filter Strip row */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Left Inputs filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
              placeholder="Search co-liver name, email, phone or unit..."
              className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 pr-3 py-1.5 w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">STATUS:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border rounded-lg p-1.5 font-bold text-slate-700"
            >
              <option value="All">All Tenants</option>
              <option value="Active">Active Residents</option>
              <option value="Incoming">Incoming Check-ins</option>
              <option value="Checked-Out">Archived Checked-Out</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">GENDER:</span>
            <select 
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-slate-50 border rounded-lg p-1.5 font-bold text-slate-700"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-bold font-mono text-[10px] uppercase text-right">
          Total Mapped Residents: <span className="text-slate-900 text-xs font-black">{propertyTenants.length}</span>
        </div>

      </div>

      {/* Primary Residents Data Cards layout */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-650">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">No Residents Located</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">No resident profiles matching current filters found. Clear searches or try other tags.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTenants.map(tenant => {
            const unpaidCount = invoices.filter(i => i.tenantId === tenant.id && i.status !== 'Paid').length;
            
            return (
              <div 
                key={tenant.id} 
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition duration-250 flex flex-col justify-between"
              >
                {/* Meta Row with gradient avatar & contact info */}
                <div className="p-5 flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black rounded-2xl flex items-center justify-center font-display text-lg tracking-wide shadow-sm shadow-indigo-500/10 shrink-0">
                    {tenant.name[0]}
                  </div>

                  <div className="flex-grow min-w-0 space-y-1 block">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 truncate font-display">{tenant.name}</h4>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-black leading-none uppercase ${
                        tenant.status === 'Active' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                        tenant.status === 'Checked-Out' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-blue-50 text-blue-705 border border-blue-100'
                      }`}>
                        {tenant.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium space-y-1 pt-0.5">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-500 font-medium">{tenant.email}</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <a 
                            href={`tel:${tenant.phone.replace(/\s+/g, '')}`}
                            className="py-0.5 px-2 text-[10px] text-indigo-700 hover:bg-slate-100 border border-slate-200 rounded-md transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0"
                            title={`Call ${tenant.name}`}
                          >
                            <Phone className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Call</span>
                          </a>
                          <button 
                            type="button"
                            onClick={() => handleOpenWhatsAppModal(tenant)}
                            className="py-0.5 px-2 text-[10px] text-emerald-700 hover:bg-emerald-50 border border-emerald-250 rounded-md transition inline-flex items-center gap-1 font-bold font-sans uppercase shrink-0 cursor-pointer"
                            title={`WhatsApp ${tenant.name}`}
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono font-extrabold text-slate-700">{tenant.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info parameters area */}
                <div className="px-5 pb-4 space-y-3.5 border-t border-slate-100 pt-3.5 bg-slate-50/50 flex-grow">
                  <div className="grid grid-cols-2 gap-3.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold text-[8.5px] uppercase block tracking-wider font-mono">Housing Allocation</span>
                      {tenant.status === 'Checked-Out' ? (
                        <span className="text-slate-400 italic font-semibold mt-0.5 block">No Active Room</span>
                      ) : (
                        <span className="font-extrabold text-slate-800 bg-white border px-2 py-0.5 rounded-md text-[10px] inline-block mt-0.5">
                          Unit {tenant.roomNumber} &bull; Bed {tenant.bedNumber}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold text-[8.5px] uppercase block tracking-wider font-mono">Invoice Status</span>
                      <div className="mt-0.5">
                        {unpaidCount > 0 ? (
                          <span className="font-extrabold font-mono text-rose-500 inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                            {unpaidCount} Pending Bills
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] inline-block">
                            No active dues
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold text-[8.5px] uppercase block tracking-wider font-mono">KYC Verification & Aadhaar</span>
                      <div className="mt-0.5">
                        <button 
                          onClick={() => tenant.docUrl && setShowDocModalUrl(tenant.docUrl)}
                          className={`inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-md py-0.5 px-2 font-bold text-[10px] transition ${
                            tenant.docUrl ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                          }`}
                          title={tenant.docUrl ? "Click to view uploaded Aadhaar PDF/Image" : "No KYC document URL updated"}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{tenant.docType || 'Aadhaar'} Verified</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold text-[8.5px] uppercase block tracking-wider font-mono">Guardian Protector Info</span>
                      <span className="text-slate-700 block mt-0.5 font-extrabold truncate">
                        {tenant.emergencyContactName} &bull; <span className="font-mono text-[10px] font-medium text-slate-500">{tenant.emergencyContactPhone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls Row with edit & profile audit triggers */}
                <div className="bg-slate-100/60 border-t border-slate-150 p-3.5 flex items-center justify-between gap-2.5 shrink-0">
                  <button 
                    onClick={() => {
                      setEditTenantForm(tenant);
                      setIsEditingTenant(true);
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-755 rounded-xl py-2 px-3 font-extrabold text-[11px] transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Resident</span>
                  </button>

                  <button 
                    onClick={() => setSelectedTenantProfileId(tenant.id)}
                    className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl py-2 px-3 font-extrabold text-[11px] transition inline-flex items-center justify-center gap-1 shadow-sm shrink-0"
                  >
                    <span>Audit Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROFILE SIDE-DRAWER PANEL */}
      {selectedTenantProfileId && selectedTenantObj && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end z-[999] text-xs">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slideLeft text-slate-810">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-black rounded-2xl flex items-center justify-center font-display text-lg shadow-inner">
                    {selectedTenantObj.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{selectedTenantObj.name}</h3>
                    <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Joined Date: {selectedTenantObj.joinedDate} &bull; ID: {selectedTenantObj.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTenantProfileId(null)}
                  className="p-1 hover:bg-slate-100 border rounded-full transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Main parameters details list */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Personal Contact Matrix</h4>
                
                <div className="space-y-2 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedTenantObj.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{selectedTenantObj.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Gender Classification: <strong>{selectedTenantObj.gender}</strong></span>
                  </div>
                  {selectedTenantObj.bloodGroup && (
                    <div className="flex items-center gap-2.5 text-rose-600 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-455" />
                      <span>Blood Group Specifier: {selectedTenantObj.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Guard Kin Info */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Emergency Kin Protector</h4>
                <div className="p-3 bg-rose-50/20 border border-rose-100 rounded-xl">
                  <div className="font-bold text-slate-900 text-xs">Guardian: {selectedTenantObj.emergencyContactName}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold mt-1 inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-rose-400" />
                    <span>Contact Line: {selectedTenantObj.emergencyContactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Roommates lookup list */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Co-living Roommates in Room {selectedTenantObj.roomNumber || 'None'}</span>
                </h4>
                
                {roomRoommates.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] pl-1">No active roommate mappings registered in same unit (Single occupancy / empty beds).</p>
                ) : (
                  <div className="space-y-1.5">
                    {roomRoommates.map(rm => (
                      <div key={rm.id} className="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between">
                        <div className="font-bold text-slate-800">{rm.name}</div>
                        <span className="text-slate-400 font-mono text-[9px]">{rm.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raised invoices history for this user specifically */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rental Invoices Ledger Track ({tenantInvoices.length} Bills)</span>
                </h4>

                <div className="space-y-1.5 max-h-40 overflow-y-auto border-t pt-1.5">
                  {tenantInvoices.map(inv => (
                    <div key={inv.id} className="p-2.5 bg-slate-50/50 border rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <strong className="text-slate-900 block font-semibold">{inv.month} - {inv.type}</strong>
                        <span className="text-[9px] text-slate-400 font-mono italic">Raised At: {inv.generatedAt.split('T')[0]}</span>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 block font-mono">₹{inv.amount.toLocaleString('en-IN')}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 font-bold'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Checkout deallocation button panel */}
            <div className="space-y-2.5 mt-6 border-t pt-4">
              {selectedTenantObj.status === 'Active' && (
                <button 
                  onClick={() => handleCheckOutTenant(selectedTenantObj)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold p-3 rounded-xl transition text-center shadow-lg shadow-rose-600/10 inline-flex items-center justify-center space-x-1.5"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Execute Check-Out Contract Closure</span>
                </button>
              )}
              <button 
                onClick={() => setSelectedTenantProfileId(null)}
                className="w-full bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold p-3 rounded-xl transition text-center border"
              >
                Close Profile Audit Audit
              </button>
            </div>

          </div>
        </div>
      )}      {/* DOCUMENT PHOTO VIEWER POPUP MODAL */}
      {showDocModalUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl relative animate-scaleUp text-slate-800">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                <FileCheck className="w-5 h-5" />
                <span className="text-xs">Identitiy Document Dossier Checked</span>
              </div>
              <button onClick={() => setShowDocModalUrl(null)} className="p-1 hover:bg-slate-100 rounded-full border transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner p-2 border border-slate-950 flex flex-col justify-center h-48 relative">
              <img 
                src={showDocModalUrl} 
                alt="Aadhaar ID Image Preview" 
                className="max-h-full max-w-full rounded-lg object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 inset-x-2 text-center bg-slate-950/70 p-1.5 rounded-lg text-[9px] text-emerald-400 font-mono font-bold tracking-wider">
                DOCUMENT VERIFICATION MATRIX: COMPLIANT
              </div>
            </div>

            <div className="text-slate-400 text-[10px] leading-relaxed">
              Standard secure verification systems encrypted check. Host panel confirms the Aadhaar copy was cross-checked with centralized databases successfully.
            </div>

            <button 
              onClick={() => setShowDocModalUrl(null)}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold p-2 text-center rounded-xl transition text-xs"
            >
              Close ID Viewer
            </button>
          </div>
        </div>
      )}

      {/* EDIT TENANT MODAL OVERLAY */}
      {isEditingTenant && editTenantForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9990] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Edit className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Edit Resident Information</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Update KYC, contact fields or guardian records of this co-liver</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsEditingTenant(false);
                  setEditTenantForm({});
                }} 
                className="p-1.5 hover:bg-slate-100 rounded-full border transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTenantEdits} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Full Resident Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={editTenantForm.name || ''} 
                    onChange={(e) => setEditTenantForm({ ...editTenantForm, name: e.target.value })} 
                    className="bg-slate-50 border rounded-lg p-2 w-full font-medium focus:outline-indigo-500" 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Mobile Line Contact *</label>
                  <input 
                    type="text" 
                    required 
                    value={editTenantForm.phone || ''} 
                    onChange={(e) => setEditTenantForm({...editTenantForm, phone: e.target.value})} 
                    className="bg-slate-50 border rounded-lg p-2 w-full font-medium font-mono focus:outline-indigo-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Postal Email Address</label>
                  <input 
                    type="email" 
                    value={editTenantForm.email || ''} 
                    onChange={(e) => setEditTenantForm({...editTenantForm, email: e.target.value})} 
                    className="bg-slate-50 border rounded-lg p-2 w-full font-medium focus:outline-indigo-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Gender *</label>
                    <select 
                      value={editTenantForm.gender || 'Male'} 
                      onChange={(e) => setEditTenantForm({...editTenantForm, gender: e.target.value as any})} 
                      className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 w-full font-extrabold focus:outline-indigo-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Blood Group</label>
                    <input 
                      type="text" 
                      placeholder="e.g. O+ve"
                      value={editTenantForm.bloodGroup || ''} 
                      onChange={(e) => setEditTenantForm({...editTenantForm, bloodGroup: e.target.value})} 
                      className="bg-slate-50 border rounded-lg p-2 w-full font-bold focus:outline-indigo-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="text-[10.5px] text-slate-500 font-extrabold block">Emergency Kin Guardian Information</span>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Kin Gurdian Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={editTenantForm.emergencyContactName || ''} 
                      onChange={(e) => setEditTenantForm({...editTenantForm, emergencyContactName: e.target.value})} 
                      className="bg-slate-50 border rounded-lg p-2 w-full font-medium focus:outline-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Emergency Phone Line *</label>
                    <input 
                      type="text" 
                      required 
                      value={editTenantForm.emergencyContactPhone || ''} 
                      onChange={(e) => setEditTenantForm({...editTenantForm, emergencyContactPhone: e.target.value})} 
                      className="bg-slate-50 border rounded-lg p-2 w-full font-medium font-mono focus:outline-indigo-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="text-[10.5px] text-slate-500 font-extrabold block">Identification Document & KYC Verification</span>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">KYC Doc Type</label>
                    <select 
                      value={editTenantForm.docType || 'Aadhaar'} 
                      onChange={(e) => setEditTenantForm({...editTenantForm, docType: e.target.value as any})} 
                      className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 w-full font-extrabold focus:outline-indigo-500"
                    >
                      <option value="Aadhaar">Aadhaar Card (India)</option>
                      <option value="Passport">International Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider block mb-1">Uploaded Doc URL / Reference Image</label>
                    <input 
                      type="text" 
                      value={editTenantForm.docUrl || ''} 
                      placeholder="e.g. Unsplash URL, PNG link"
                      onChange={(e) => setEditTenantForm({...editTenantForm, docUrl: e.target.value})} 
                      className="bg-slate-50 border rounded-lg p-2 w-full font-medium font-mono focus:outline-indigo-500 text-[10px]" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditingTenant(false);
                    setEditTenantForm({});
                  }} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/10 text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP CUSTOMIZE & CONFIRM POPUP DIALOG */}
      {whatsAppTenant && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9995] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Customise Rent Reminder Alert</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify text body before forwarding to WhatsApp</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppTenant(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full border transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">Receipt Target Co-liver</span>
                <p className="font-extrabold text-slate-800 text-xs">{whatsAppTenant.name} ({whatsAppTenant.phone})</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block mb-1">Rent Reminder Message Draft</label>
                <textarea 
                  rows={6}
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  className="bg-slate-50 border rounded-xl p-3 w-full font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-[11px] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3.5">
              <button 
                type="button" 
                onClick={() => setWhatsAppTenant(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSendWhatsApp}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/15 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Redirect to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RESIDENT CHECKOUT CONFIRMATION */}
      {tenantConfirmCheckout && (
        <div id="tenant-checkout-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🚪
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Confirm Checkout?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Confirm check-out execution for resident <strong>{tenantConfirmCheckout.name}</strong>? This immediately releases <strong>Room {tenantConfirmCheckout.roomNumber} (Bed position {tenantConfirmCheckout.bedNumber})</strong>.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={() => setTenantConfirmCheckout(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeCheckOutTenant(tenantConfirmCheckout)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Check Out Resident
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
