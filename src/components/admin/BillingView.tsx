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
  Plus, 
  CreditCard, 
  Search, 
  DollarSign, 
  Download, 
  Printer, 
  QrCode, 
  Check, 
  AlertTriangle, 
  Maximize2,
  ListFilter,
  CheckCircle,
  FileText,
  Phone,
  MessageSquare
} from 'lucide-react';

interface BillingViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  tenants: Tenant[];
  invoices: Invoice[];
  syncInvoices: (invs: Invoice[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
}

export default function BillingView({
  properties,
  rooms,
  beds,
  tenants,
  invoices,
  syncInvoices,
  selectedPropertyId,
  onAddAuditLog
}: BillingViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const activeTenants = tenants.filter(t => t.propertyId === selectedPropertyId && t.status === 'Active');
  const allPropertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId);
  
  // Filtering invoices belonging to current property tenants
  const propertyInvoices = invoices.filter(i => 
    tenants.some(t => t.id === i.tenantId && t.propertyId === selectedPropertyId)
  );

  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  // Search & Filter UI state
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [billingSearch, setBillingSearch] = useState('');

  // Active modal invoice for detailed Receipt Generator
  const [activeReceiptInvoiceId, setActiveReceiptInvoiceId] = useState<string | null>(null);

  // Active QR code payment popup stimulation
  const [activeQrPaymentInvoiceId, setActiveQrPaymentInvoiceId] = useState<string | null>(null);

  // WhatsApp reminder message form state
  const [whatsAppInvoice, setWhatsAppInvoice] = useState<Invoice | null>(null);
  const [whatsAppText, setWhatsAppText] = useState<string>('');

  const handleOpenWhatsAppModal = (invoiceObj: Invoice) => {
    setWhatsAppInvoice(invoiceObj);
    setWhatsAppText(`Dear ${invoiceObj.tenantName},\n\nKindly note that your outstanding payment of ₹${invoiceObj.amount.toLocaleString('en-IN')} for ${invoiceObj.type} (${invoiceObj.month}) is outstanding (Due: ${invoiceObj.dueDate}). Please process the payment. If already paid, please ignore this message.\n\nThank you!`);
  };

  const handleSendWhatsAppSubmit = () => {
    if (!whatsAppInvoice) return;
    const resident = tenants.find(t => t.id === whatsAppInvoice.tenantId);
    const phoneNum = resident ? resident.phone : '';
    const cleanedPhone = phoneNum.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(whatsAppText)}`;
    mobileOpen(url);
    setWhatsAppInvoice(null);
  };

  // Create Invoice Inline Form State toggle
  const [isRaisingBill, setIsRaisingBill] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    tenantId: '',
    type: 'Rent' as Invoice['type'],
    amount: 11000,
    month: 'June 2026',
    dueDate: '2026-06-05'
  });

  // Calculate unique months available
  const availableMonths = Array.from(new Set(propertyInvoices.map(i => i.month)));

  // Filter matrix logic
  const filteredInvoices = propertyInvoices.filter(i => {
    const matchesSearch = i.tenantName.toLowerCase().includes(billingSearch.toLowerCase()) || 
                          i.id.toLowerCase().includes(billingSearch.toLowerCase());
    const matchesMonth = filterMonth === 'All' || i.month === filterMonth;
    const matchesType = filterType === 'All' || i.type === filterType;
    const matchesStatus = filterStatus === 'All' || i.status === filterStatus;
    const matchesSelectedResident = !selectedResidentId || i.tenantId === selectedResidentId;

    return matchesSearch && matchesMonth && matchesType && matchesStatus && matchesSelectedResident;
  });

  // Raise standard rent / penalty bill action
  const handleRaiseCustomBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceForm.tenantId || !newInvoiceForm.amount) return;

    const chosenTObj = tenants.find(t => t.id === newInvoiceForm.tenantId);
    if (!chosenTObj) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId: chosenTObj.id,
      tenantName: chosenTObj.name,
      propertyName: currentProperty ? currentProperty.name : 'StayHub PG',
      month: newInvoiceForm.month,
      amount: Number(newInvoiceForm.amount),
      dueDate: newInvoiceForm.dueDate,
      status: 'Unpaid',
      generatedAt: new Date().toISOString(),
      type: newInvoiceForm.type
    };

    const updatedInvoices = [newInvoice, ...invoices];
    syncInvoices(updatedInvoices);

    onAddAuditLog(`Created custom ${newInvoice.type} invoice for amount ₹${newInvoice.amount} raised to ${chosenTObj.name}`, 'Billing');
    
    // Clear and reset
    setIsRaisingBill(false);
    setNewInvoiceForm({
      tenantId: '',
      type: 'Rent',
      amount: 11000,
      month: 'June 2026',
      dueDate: '2026-06-05'
    });
  };

  // Settle bill action
  const settleInvoiceBilling = (invoiceId: string, payMethod: Invoice['paymentMethod']) => {
    const targetObj = invoices.find(i => i.id === invoiceId);
    if (!targetObj) return;

    const updated = invoices.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          status: 'Paid' as const,
          paymentMethod: payMethod,
          paidAt: new Date().toISOString().split('T')[0]
        };
      }
      return i;
    });

    syncInvoices(updated);
    onAddAuditLog(`Settled billing Invoice #${invoiceId} (₹${targetObj.amount}) via registered ${payMethod}`, 'Billing');
    
    // Close QR modal if active
    setActiveQrPaymentInvoiceId(null);
  };

  const selectedInvoicedReceiptObj = invoices.find(i => i.id === activeReceiptInvoiceId);
  const selectedPaymentQrObj = invoices.find(i => i.id === activeQrPaymentInvoiceId);

  return (
    <div className="space-y-6 text-slate-800 text-xs font-medium">
      
      {/* Raising a Bill collapse state */}
      {isRaisingBill ? (
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4 max-w-md mx-auto animate-fadeIn uppercase font-bold text-[11px] text-slate-600">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="text-sm font-black text-slate-950 font-display">Create Custom Financial Invoice</h3>
              <p className="text-[10px] text-slate-400 capitalize font-medium font-sans">Set custom category rates and dueDate alerts for co-livers</p>
            </div>
            <button 
              onClick={() => setIsRaisingBill(false)} 
              className="p-1 hover:bg-slate-100 rounded-full border transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleRaiseCustomBill} className="space-y-3 mt-2 normal-case font-medium text-slate-700">
            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Choose Target Resident *</label>
              <select 
                value={newInvoiceForm.tenantId}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, tenantId: e.target.value })}
                className="w-full border rounded-xl p-2.5 bg-white text-slate-700 font-semibold"
                required
              >
                <option value="">-- Click to select active co-liver --</option>
                {activeTenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Room Unit {t.roomNumber})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Bill Category</label>
                <select 
                  value={newInvoiceForm.type}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, type: e.target.value as any })}
                  className="w-full border rounded-xl p-2.5 bg-white text-slate-700"
                >
                  <option value="Rent">Rent Allowance</option>
                  <option value="Electricity">Electricity Surcharge</option>
                  <option value="Food">Canteen / Dining</option>
                  <option value="Penalty">Fine / Penalties</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Operational Month / Cycle</label>
                <input 
                  type="text" 
                  value={newInvoiceForm.month}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, month: e.target.value })}
                  placeholder="E.g., June 2026"
                  className="w-full border rounded-xl p-2.5 bg-slate-5 font-semibold focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Billing Amount (₹) *</label>
                <input 
                  type="number" 
                  value={newInvoiceForm.amount}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: Number(e.target.value) })}
                  className="w-full border rounded-xl p-2.5 bg-slate-5 font-bold focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Payment Due Date</label>
                <input 
                  type="date" 
                  value={newInvoiceForm.dueDate}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-slate-5 font-semibold focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black p-3 py-2.5 rounded-xl transition shadow"
              >
                Raise Invoice To Client Registry
              </button>
              <button 
                type="button"
                onClick={() => setIsRaisingBill(false)} 
                className="bg-slate-100 hover:bg-slate-200 hover:border-slate-300 text-slate-700 p-3 rounded-xl transition border"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Controls Filtration Ribbon Strip */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            
            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-56">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={billingSearch}
                  onChange={(e) => setBillingSearch(e.target.value)}
                  placeholder="Search receipt ID, tenant name..."
                  className="bg-slate-50 border focus:bg-white focus:outline-indigo-500 rounded-lg pl-8 p-1.5 w-full font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">CYCLE:</span>
                <select 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-50 border rounded-lg p-1.5 font-bold text-slate-705"
                >
                  <option value="All">All Cycles</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">TYPE:</span>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 border rounded-lg p-1.5 font-bold text-slate-705"
                >
                  <option value="All">All Types</option>
                  <option value="Rent">Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Food">Food / Meals</option>
                  <option value="Penalty">Penalty Fines</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">STATUS:</span>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border rounded-lg p-1.5 font-bold text-slate-705"
                >
                  <option value="All font-bold">All Bills</option>
                  <option value="Paid">Paid (Settled)</option>
                  <option value="Unpaid">Unpaid (Outstanding)</option>
                  <option value="Overdue">Overdue Alerts</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setIsRaisingBill(true)}
              className="bg-cyan-600 hover:bg-cyan-700 hover:shadow font-bold text-white p-2 px-4 rounded-xl inline-flex items-center space-x-1.5 transition text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Custom Bill</span>
            </button>
          </div>

          {/* New Split Layout: Residents Directory on the left, Invoices on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Residents billing status directory */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-white font-display">Co-Liver Directories</h3>
                    <p className="text-[10px] text-slate-400 font-medium font-sans">Directory of residents and fees schedule</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {allPropertyTenants.map(t => {
                    const isSelected = selectedResidentId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedResidentId(isSelected ? null : t.id)}
                        className={`p-3 rounded-2xl border transition duration-200 cursor-pointer select-none flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-650 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-350'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <strong className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                            {t.name}
                          </strong>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                            t.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] opacity-80 font-semibold font-mono">
                          <span>Room Unit {t.roomNumber || 'N/A'}</span>
                          <span>{t.phone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Resident Billing Card Details */}
              {(() => {
                const selectedResident = allPropertyTenants.find(t => t.id === selectedResidentId);
                if (!selectedResident) return (
                  <div className="p-4 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-center text-slate-400 italic">
                    Click a resident from the directory to review joining and payment terms.
                  </div>
                );

                const tenantBills = propertyInvoices.filter(i => i.tenantId === selectedResident.id);
                const unpaidBills = tenantBills.filter(i => i.status !== 'Paid');
                const latestPaidBill = tenantBills.filter(i => i.status === 'Paid').sort((a,b) => b.dueDate.localeCompare(a.dueDate))[0];

                return (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2.5xl space-y-3 animate-fadeIn text-slate-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Resident Billing Card</h4>
                      {selectedResidentId && (
                        <button
                          onClick={() => setSelectedResidentId(null)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-bold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Resident Name:</span>
                        <strong className="text-white text-xs font-black">{selectedResident.name}</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Joining Date:</span>
                          <strong className="text-slate-100 font-extrabold text-[11px] font-mono">{selectedResident.joinedDate || '2025-02-10'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Fees Paying Date:</span>
                          <strong className="text-indigo-400 font-extrabold text-[11px] font-mono">
                            {unpaidBills.length > 0 
                              ? unpaidBills[0].dueDate 
                              : latestPaidBill 
                                ? `${latestPaidBill.dueDate} (Paid)` 
                                : 'No outstanding bills'}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 text-[9px] font-bold">Invoices Issued:</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded-md text-white font-mono font-black">{tenantBills.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Right side: Invoices registry spreadsheet */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Primary Invoices registry spreadsheet */}
              <div className="bg-white border text-xs border-slate-100 rounded-3xl shadow-sm overflow-x-auto font-medium">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                      <th className="p-4 text-[10px] uppercase">Bill Details / Cycle</th>
                      <th className="p-4 text-[10px] uppercase">Client Occupant</th>
                      <th className="p-4 text-[10px] uppercase">Charges Type</th>
                      <th className="p-4 text-[10px] uppercase">Contract Due Date</th>
                      <th className="p-4 text-[10px] uppercase">Grand Total Amount</th>
                      <th className="p-4 text-[10px] uppercase">Settlement Status</th>
                      <th className="p-4 text-[10px] uppercase">Interactive Payout Action</th>
                      <th className="p-4 text-[10px] uppercase text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors font-medium">
                        <td className="p-4">
                          <strong className="text-slate-900 text-sm font-black tracking-tight block">{inv.month}</strong>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{inv.id}</span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <strong className="text-slate-900 font-bold text-xs block leading-tight">{inv.tenantName}</strong>
                            {(() => {
                              const resident = tenants.find(t => t.id === inv.tenantId);
                              if (!resident) return null;
                              return (
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className="text-[10px] text-slate-500 font-mono font-medium">{resident.phone}</span>
                                  <div className="flex items-center gap-1">
                                    <a 
                                      href={`tel:${resident.phone.replace(/\s+/g, '')}`}
                                      className="p-0.5 text-indigo-700 hover:bg-slate-100 border border-slate-200 rounded transition inline-flex items-center justify-center shrink-0"
                                      title={`Call ${inv.tenantName}`}
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                    </a>
                                    <button 
                                      type="button"
                                      onClick={() => handleOpenWhatsAppModal(inv)}
                                      className="p-0.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-250 rounded transition inline-flex items-center justify-center shrink-0 cursor-pointer"
                                      title={`WhatsApp ${inv.tenantName}`}
                                    >
                                      <MessageSquare className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wide">{inv.type}</span>
                        </td>

                        <td className="p-4 text-slate-500 font-mono font-bold">{inv.dueDate}</td>
                        
                        <td className="p-4 font-black text-slate-900 text-sm font-display">₹{inv.amount.toLocaleString('en-IN')}</td>
                        
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 animate-pulse border border-rose-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>

                        <td className="p-4">
                          {inv.status !== 'Paid' ? (
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => setActiveQrPaymentInvoiceId(inv.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 hover:shadow text-white font-extrabold text-[10px] p-2 py-1 px-2.5 rounded-lg inline-flex items-center gap-1 transition active:scale-95"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Mock Scan QR</span>
                              </button>
                              <button 
                                onClick={() => settleInvoiceBilling(inv.id, 'Cash')}
                                className="bg-slate-100 hover:bg-slate-205 text-slate-700 border text-[10px] py-1 px-2 rounded-lg font-bold transition"
                              >
                                Record Cash
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Settled via {inv.paymentMethod} &bull; {inv.paidAt}</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setActiveReceiptInvoiceId(inv.id)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border p-1 rounded-lg transition"
                            title="Display Printable PDF Invoice Receipt layout"
                          >
                            <Maximize2 className="w-4.5 h-4.5 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredInvoices.length === 0 && (
                  <div className="text-center py-16 p-6 space-y-2">
                    <CreditCard className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                    <p className="text-xs text-slate-400 italic">No financial invoices matched active selection filter criteria.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* DETAILED PRINTABLE RECEIPT POPUP MODAL */}
      {activeReceiptInvoiceId && selectedInvoicedReceiptObj && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 text-xs font-semibold">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-scaleUp text-slate-800 border">
            
            {/* Header branding */}
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h4 className="text-base font-black text-slate-905 tracking-tight font-display">StayHub Invoicing receipts</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Invoice ID ref: {selectedInvoicedReceiptObj.id}</p>
              </div>
              <button 
                onClick={() => setActiveReceiptInvoiceId(null)}
                className="p-1 hover:bg-slate-100 border rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-405" />
              </button>
            </div>

            {/* Receipt body detailed items list */}
            <div id="print-recipient-receipt-body" className="space-y-4 bg-slate-50 border p-4.5 rounded-2xl">
              <div className="flex justify-between text-slate-550 items-center">
                <span className="text-[10px] font-mono">DATE GENERATED:</span>
                <span className="font-mono text-[10px] font-bold text-slate-700">{selectedInvoicedReceiptObj.generatedAt.split('T')[0]}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase text-slate-400 font-bold block font-mono">Billed To Address</span>
                <div className="font-black text-slate-900 font-sans text-xs">{selectedInvoicedReceiptObj.tenantName}</div>
                <div className="text-[10px] text-slate-500 font-medium">License Property: {selectedInvoicedReceiptObj.propertyName}</div>
              </div>

              <table className="w-full text-left border-t border-slate-205 mt-2">
                <thead>
                  <tr className="text-[9px] font-bold font-mono text-slate-400 border-b">
                    <th className="py-2">BILL description ITEM</th>
                    <th className="py-2 text-right">TOTAL (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b last:border-b-0 font-medium text-slate-700 text-[11px]">
                    <td className="py-2 capitalize font-semibold">{selectedInvoicedReceiptObj.type} allowance charge cycle ({selectedInvoicedReceiptObj.month})</td>
                    <td className="py-2 text-right font-mono">₹{Math.round(selectedInvoicedReceiptObj.amount * 0.82).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b last:border-b-0 font-medium text-slate-500 text-[10px]">
                    <td className="py-1.5 italic">State Taxes & GST (18% Accr)</td>
                    <td className="py-1.5 text-right font-mono">₹{Math.round(selectedInvoicedReceiptObj.amount * 0.18).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between font-black border-t border-slate-205 pt-2 text-slate-950 font-display text-sm items-center">
                <span>GRAND SUMMARY:</span>
                <span className="text-indigo-600 font-mono text-base">₹{selectedInvoicedReceiptObj.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed">
                Status: <strong className={selectedInvoicedReceiptObj.status === 'Paid' ? 'text-emerald-600 uppercase font-black' : 'text-rose-500 uppercase font-bold'}>{selectedInvoicedReceiptObj.status}</strong>
                {selectedInvoicedReceiptObj.paymentMethod && <span className="block text-[9px] italic mt-0.5">Settle cleared via {selectedInvoicedReceiptObj.paymentMethod}</span>}
              </div>
            </div>

            {/* Print Action Panels */}
            <div className="space-y-2">
              <button 
                onClick={() => {
                  const resident = tenants.find(t => t.id === selectedInvoicedReceiptObj.tenantId);
                  const phoneNum = resident ? resident.phone : '';
                  const cleanedPhone = phoneNum.replace(/[^0-9]/g, '');
                  const shareText = `Dear ${selectedInvoicedReceiptObj.tenantName},\n\nHere is your receipt for StayHub:\nInvoice ID: ${selectedInvoicedReceiptObj.id}\nProperty: ${selectedInvoicedReceiptObj.propertyName}\nType: ${selectedInvoicedReceiptObj.type} (${selectedInvoicedReceiptObj.month})\nAmount Paid: ₹${selectedInvoicedReceiptObj.amount.toLocaleString('en-IN')}\nStatus: ${selectedInvoicedReceiptObj.status.toUpperCase()}${selectedInvoicedReceiptObj.paymentMethod ? `\nPayment Method: ${selectedInvoicedReceiptObj.paymentMethod}` : ''}\n\nThank you!`;
                  const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(shareText)}`;
                  mobileOpen(url);
                  setActiveReceiptInvoiceId(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-2.5 rounded-xl transition inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
                title="Share this receipt breakdown to tenant via WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Share via WhatsApp</span>
              </button>

              <div className="flex gap-2.5">
                <button 
                  onClick={() => {
                    alert('Generating system print instructions... (Mock verification clearance). PDF downloaded.');
                    setActiveReceiptInvoiceId(null);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-extrabold p-2.5 rounded-xl transition inline-flex items-center justify-center gap-1 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button 
                  onClick={() => {
                    alert('Starting PDF Receipt Download stream simulation... Done.');
                    setActiveReceiptInvoiceId(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition border text-center flex-1 font-bold"
                >
                  Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QR CODE PAYMENT DIALOGUE */}
      {selectedPaymentQrObj && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[1001] p-4 text-xs font-semibold">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl animate-scaleUp text-slate-800">
            <div className="flex justify-between items-center border-b pb-2 text-left">
              <div>
                <h4 className="text-sm font-black text-slate-950 leading-tight">Instant UPI Settlement Terminal</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Scan parameters for tenant {selectedPaymentQrObj.tenantName}</p>
              </div>
              <button onClick={() => setActiveQrPaymentInvoiceId(null)} className="p-1 hover:bg-slate-100 rounded-full border transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Mock QR image */}
            <div className="p-4 bg-slate-50 border rounded-2xl inline-block max-w-xs mx-auto space-y-3">
              <div className="w-40 h-40 bg-white border border-slate-205 rounded-xl flex items-center justify-center mx-auto relative shadow-xs p-2">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400" 
                  alt="QR Scanner mockup" 
                  className="max-h-full max-w-full hover:blur-xs opacity-75 object-cover select-none brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-indigo-600 animate-pulse stroke-[1.25]" />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-450 font-mono block">ACC: STAYHUB@UPI</span>
                <strong className="text-sm font-black text-slate-900 block font-display mt-0.5">₹{selectedPaymentQrObj.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] leading-tight flex gap-2 items-start text-left rounded-xl">
              <AlertTriangle className="w-6 h-6 text-indigo-500 shrink-0" />
              <span>Simulate verification of incoming bank UPI clearance in secondary device sandbox by clicking manual override below.</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => settleInvoiceBilling(selectedPaymentQrObj.id, 'UPI')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 hover:shadow text-white font-black p-3 py-2.5 rounded-xl transition inline-flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simulate App Clear</span>
              </button>
              <button 
                onClick={() => setActiveQrPaymentInvoiceId(null)}
                className="bg-slate-100 hover:bg-slate-250 text-slate-700 p-3 py-2.5 rounded-xl transition border font-bold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* WHATSAPP CUSTOMIZE & CONFIRM POPUP DIALOG */}
      {whatsAppInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9995] text-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative animate-scaleUp text-slate-800 border">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
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
                onClick={() => setWhatsAppInvoice(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full border border-slate-150 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">Receipt Target Co-liver</span>
                <p className="font-extrabold text-slate-800 text-xs">{whatsAppInvoice.tenantName}</p>
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

            <div className="flex justify-end gap-2 border-t pt-3.5 border-slate-100">
              <button 
                type="button" 
                onClick={() => setWhatsAppInvoice(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSendWhatsAppSubmit}
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
