import React, { useState } from 'react';
import { mobileOpen } from '../utils/mobileOpen';
import { 
  X, 
  Printer, 
  Check, 
  Download, 
  QrCode, 
  CreditCard, 
  BadgePercent, 
  CheckCircle2, 
  DollarSign, 
  Award,
  CircleCheck,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Booking } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPaymentSuccess?: (bookingId: string) => void;
}

export default function InvoiceModal({ isOpen, onClose, booking, onPaymentSuccess }: InvoiceModalProps) {
  const [paymentRunning, setPaymentRunning] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ discount: number; label: string } | null>(null);

  if (!isOpen) return null;

  // Invoice calculations
  const isPG = booking.totalAmount > 30000; // rough heuristic to decide if monthly or daily
  
  // Dynamic tax read from corporate configurations
  let cgstRate = 9;
  let sgstRate = 9;
  try {
    const savedTax = localStorage.getItem('hotel_pg_settings_tax');
    if (savedTax) {
      const parsed = JSON.parse(savedTax);
      if (typeof parsed.cgstRate === 'number') cgstRate = parsed.cgstRate;
      if (typeof parsed.sgstRate === 'number') sgstRate = parsed.sgstRate;
    }
  } catch (e) {
    console.warn("Could not read tax rates", e);
  }

  const baseCost = booking.totalAmount; // Original cost of the bill
  const cgstAmount = Math.round(baseCost * (cgstRate / 100));
  const sgstAmount = Math.round(baseCost * (sgstRate / 100));
  const taxAmount = cgstAmount + sgstAmount;
  const totalWithTax = baseCost + taxAmount; // Adds percentage to the original cost in payment

  const handleApplyCouponSim = () => {
    if (couponApplied) return;
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      setCouponApplied({ discount: Math.round(baseCost * 0.1), label: 'WELCOME10 (10% Flat)' });
    } else if (cleanCode === 'STAYSAFE') {
      setCouponApplied({ discount: 1500, label: 'STAYSAFE (Flat ₹1,500)' });
    } else {
      alert('Simulated Code not recognized. Hint: WELCOME10 or STAYSAFE');
    }
    setCouponCode('');
  };

  const handleSimulatePayment = () => {
    setPaymentRunning(true);
    setTimeout(() => {
      setPaymentRunning(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(booking.id);
      }
    }, 1800);
  };

  const discountedBase = baseCost - (couponApplied?.discount || 0);
  const gstCalculatedCgst = Math.round(discountedBase * (cgstRate / 100));
  const gstCalculatedSgst = Math.round(discountedBase * (sgstRate / 100));
  const gstCalculated = gstCalculatedCgst + gstCalculatedSgst;
  const finalBillTotal = discountedBase + gstCalculated;

  return (
    <div id="invoice-modal-backdrop" className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div id="invoice-sheet" className="bg-white rounded-2xl w-full max-w-[350px] p-4 text-slate-800 space-y-4 shadow-2xl border border-slate-100 flex flex-col justify-between max-h-[90%] overflow-y-auto">
        
        {/* Header Options */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-black text-slate-950 tracking-wider font-display uppercase">Tax Receipt Invoice</h3>
            <span className="text-[8.5px] text-slate-400 font-mono">Invoice ID: INV-{booking.id.split('-')[1]}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => {
                alert('Tax Receipt Invoice sent to system printer stream. PDF generated.');
              }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('PDF copy downloaded to device successfully.')}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => {
                const shareText = `Dear ${booking.customerName},\n\nKindly find details for your StayHub invoice:\nInvoice ID: INV-${booking.id.split('-')[1]}\nProperty: ${booking.propertyName}\nRoom: No. ${booking.roomNumber}\nTotal Paid Amount: ₹${(couponApplied ? finalBillTotal : totalWithTax).toLocaleString('en-IN')} (incl. taxes).\nStatus: PAID & SECURED\n\nThank you!`;
                mobileOpen(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`);
              }}
              className="p-1 hover:bg-emerald-55 border border-transparent hover:border-emerald-200 rounded-lg text-emerald-600 hover:text-emerald-800 transition"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Body Template */}
        <div className="space-y-3.5 text-xs">
          {/* Status Badge Stamp banner */}
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-light block">Invoice Status:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                booking.status === 'Confirmed' || booking.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
              }`}>
                {booking.status === 'Confirmed' || booking.status === 'Completed' ? 'PAID & SECURED' : 'PENDING UPI PAYMENT'}
              </span>
            </div>
            
            {/* Visual Stamp Ribbon */}
            {(booking.status === 'Confirmed' || booking.status === 'Completed') ? (
              <div className="border-[2px] border-emerald-500 text-emerald-500 text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-lg rotate-12 shrink-0 select-none">
                PAID
              </div>
            ) : (
              <div className="border-[2px] border-amber-500 text-amber-500 text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md -rotate-6 shrink-0 select-none">
                UNPAID
              </div>
            )}
          </div>

          {/* Details matrix columns */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3 text-[10px] text-slate-600 leading-relaxed">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Hoster Property</span>
              <span className="font-extrabold text-slate-900">{booking.propertyName}</span>
              <span className="block text-[9px]">Care @ StayHub Inc Group</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Billed Resident</span>
              <span className="font-bold text-slate-950 block">{booking.customerName}</span>
              <span className="text-[9px] block text-slate-500 truncate">{booking.customerEmail}</span>
            </div>
          </div>

          {/* Core Itemization table */}
          <div className="space-y-1.5 text-[10px] text-slate-700">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Product Line breakdown</span>
            
            {/* Table layout blocks */}
            <div className="bg-slate-50 rounded-xl p-2.5 space-y-2 text-[10.5px]">
              <div className="flex justify-between items-center text-slate-900 font-medium">
                <span>Room Charges (No. {booking.roomNumber})</span>
                <span>₹{baseCost.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[9px] text-slate-400">Duration: {booking.checkInDate} &rarr; {booking.checkOutDate}</p>
              
              {booking.mealPlan !== 'None' && (
                <div className="flex justify-between text-slate-500 text-[9px] pt-1 border-t border-slate-200/50">
                  <span>Add-on: Culinary Meal Subscription ({booking.mealPlan})</span>
                  <span>Included</span>
                </div>
              )}

              {/* Coupons application UI */}
              {booking.status === 'Pending' && !couponApplied && (
                <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 mt-1.5">
                  <BadgePercent className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon: WELCOME10"
                    className="bg-transparent text-[9px] w-full focus:outline-none uppercase text-slate-800"
                  />
                  <button 
                    onClick={handleApplyCouponSim}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[8.5px] px-2 py-0.5 rounded-md transition"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponApplied && (
                <div className="flex justify-between text-emerald-600 text-[9.5px] bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg">
                  <span className="flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Coupon applied: {couponApplied.label}
                  </span>
                  <span>-₹{couponApplied.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Calculated Summaries */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-slate-705 text-[10px]">
            <div className="flex justify-between font-medium">
              <span>Original Cost (Base Rent):</span>
              <span>₹{(couponApplied ? discountedBase : baseCost).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>CGST Surcharge ({cgstRate}%):</span>
              <span>₹{(couponApplied ? gstCalculatedCgst : cgstAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>SGST Surcharge ({sgstRate}%):</span>
              <span>₹{(couponApplied ? gstCalculatedSgst : sgstAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 italic">
              <span>Total Taxation ({(cgstRate + sgstRate)}%):</span>
              <span>₹{(couponApplied ? gstCalculated : taxAmount).toLocaleString('en-IN')}</span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between font-extrabold text-slate-950 text-xs">
              <span>Total Paid Amount (incl. tax):</span>
              <span className="text-indigo-650 font-black">₹{(couponApplied ? finalBillTotal : totalWithTax).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* UPI Sandbox Portal or Payment Complete Frame */}
          {booking.status === 'Pending' ? (
            <div className="border border-indigo-100 bg-indigo-50/50 p-3 rounded-xl space-y-3">
              <div className="flex items-start gap-1.5 text-[9.5px] text-slate-700 leading-normal">
                <QrCode className="w-8 h-8 text-indigo-600 shrink-0 border bg-white p-1 rounded-sm shadow-xs" />
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1">Unified Payments Interface (UPI) Pay</h4>
                  <p className="text-[9px] text-slate-500">Scan QR Code or tap below to issue payment instantly from mock banking application.</p>
                </div>
              </div>

              {paymentRunning ? (
                <div className="flex items-center justify-center space-x-2 py-2 text-indigo-700 font-semibold bg-white border border-indigo-200 rounded-lg">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Waiting for UPI authentication...</span>
                </div>
              ) : (
                <button 
                  onClick={handleSimulatePayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition duration-200 active:scale-95 flex items-center justify-center space-x-1 p-1 hover:shadow-lg shadow-indigo-200"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Scan QR & Pay ₹{(couponApplied ? finalBillTotal : totalWithTax).toLocaleString('en-IN')} / UPI</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl flex items-center space-x-2 text-[10px] text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold">UPI Transaction Cleared</h4>
                <p className="text-[9px] text-slate-500 font-mono">ID: tx_904328574923 &bull; Verified</p>
              </div>
            </div>
          )}

          {/* Static Disclaimer */}
          <div className="text-center text-[8.5px] text-slate-400 uppercase tracking-widest leading-normal pt-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-300" /> Authorized StayHub Digital Asset receipt
          </div>

        </div>
      </div>
    </div>
  );
}
