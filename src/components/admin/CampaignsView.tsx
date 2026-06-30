import React, { useState, useEffect } from 'react';
import { Property, Room, Bed } from '../../types';
import { Tag, Save, Percent, Sliders, Gift, Sparkles } from 'lucide-react';

interface CampaignsViewProps {
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  selectedPropertyId: string;
  syncProperties: (updatedProperties: Property[]) => void;
  syncRoomsAndBeds: (updatedRooms: Room[], updatedBeds: Bed[]) => void;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
  isDarkMode?: boolean;
}

export default function CampaignsView({
  properties,
  rooms,
  beds,
  selectedPropertyId,
  syncProperties,
  syncRoomsAndBeds,
  onAddAuditLog,
  isDarkMode = false
}: CampaignsViewProps) {
  const currentProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyRooms = rooms.filter(r => r.propertyId === selectedPropertyId);

  // Form states
  const [campaignText, setCampaignText] = useState('');
  const [discountType, setDiscountType] = useState<'all' | 'custom'>('all');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  
  // Room-by-room discount map
  const [roomDiscounts, setRoomDiscounts] = useState<Record<string, number>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Load initial settings
  useEffect(() => {
    if (currentProperty) {
      setCampaignText(currentProperty.campaignText || '');
      setDiscountType(currentProperty.discountType || 'all');
      setGlobalDiscount(currentProperty.discountPercentage || 0);

      // Populate room-by-room map
      const map: Record<string, number> = {};
      propertyRooms.forEach(r => {
        map[r.id] = r.discountPercentage || 0;
      });
      setRoomDiscounts(map);
    }
  }, [selectedPropertyId, properties]);

  const handleRoomDiscountChange = (roomId: string, val: number) => {
    setRoomDiscounts(prev => ({
      ...prev,
      [roomId]: val
    }));
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProperty) return;

    setSuccessMsg('');

    // 1. Update Property Schema
    const updatedProperties = properties.map(p => {
      if (p.id === selectedPropertyId) {
        return {
          ...p,
          campaignText: campaignText.trim(),
          discountType,
          discountPercentage: discountType === 'all' ? globalDiscount : 0
        };
      }
      return p;
    });

    // 2. Update Room Schemas
    const updatedRooms = rooms.map(r => {
      if (r.propertyId === selectedPropertyId) {
        return {
          ...r,
          discountPercentage: discountType === 'all' ? globalDiscount : (roomDiscounts[r.id] || 0)
        };
      }
      return r;
    });

    // Sync to store & database
    syncProperties(updatedProperties);
    syncRoomsAndBeds(updatedRooms, beds);

    // Audit log
    const campaignName = campaignText.trim() || 'General Discount';
    onAddAuditLog(
      `Updated campaign settings: "${campaignName}" (${discountType === 'all' ? `${globalDiscount}% global` : 'room-by-room custom'})`,
      'SuperAdmin'
    );

    setSuccessMsg('Discount campaign settings updated and synchronized successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Intro */}
      <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-black font-display text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <Percent className="w-5 h-5 text-indigo-650 dark:text-cyan-400" />
            <span>Discounts & Campaigns</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Launch promo offers, set room discount rates, and publish live announcement banners on the customer companion portal.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-2 animate-scale-up">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveCampaign} className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Left Section: Campaign Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-5xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display flex items-center gap-1.5 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <Gift className="w-4.5 h-4.5 text-indigo-505 dark:text-cyan-400" />
              <span>Campaign Header</span>
            </h3>

            {/* Campaign Text Banner */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Campaign Offer Title</label>
              <input 
                type="text"
                placeholder="e.g. Diwali Offer, Monsoon Sale, Weekend Deal"
                value={campaignText}
                onChange={(e) => setCampaignText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-900 dark:text-white font-semibold"
              />
              <span className="text-[9px] text-slate-450 dark:text-slate-500 block leading-tight">
                This banner text (e.g. "Diwali Offer") will be displayed on the Customer Portal property details page.
              </span>
            </div>

            {/* Discount Scope selection */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">Discount Allocation Scope</label>
              <div className="space-y-2 mt-1.5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="discountType" 
                    value="all"
                    checked={discountType === 'all'}
                    onChange={() => setDiscountType('all')}
                    className="accent-indigo-600"
                  />
                  <span>Apply same percentage to all rooms</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="discountType" 
                    value="custom"
                    checked={discountType === 'custom'}
                    onChange={() => setDiscountType('custom')}
                    className="accent-indigo-600"
                  />
                  <span>Configure different percentages per room</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition tracking-wide flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-650/10 active:scale-98 cursor-pointer mt-4"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Campaign Settings</span>
            </button>
          </div>
        </div>

        {/* Right Section: Discount Setup */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-5xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display flex items-center gap-1.5 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <Sliders className="w-4.5 h-4.5 text-indigo-505 dark:text-cyan-400" />
              <span>Discount Configuration Rates</span>
            </h3>

            {discountType === 'all' ? (
              /* Global Property-wide discount slider */
              <div className="space-y-3 py-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Property-wide Discount Rate</label>
                  <span className="text-lg font-black text-indigo-650 dark:text-cyan-400">{globalDiscount}% OFF</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="50"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                  All rooms inside this property will have a flat {globalDiscount}% discount applied to their daily and monthly pricing schedules. Set to 0% to disable the discount campaign.
                </p>
              </div>
            ) : (
              /* Room-by-room discount configuration grid */
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {propertyRooms.length === 0 ? (
                  <p className="text-xs text-slate-450 italic py-6 text-center">No active rooms found on this property.</p>
                ) : (
                  propertyRooms.map(room => {
                    const currentDisc = roomDiscounts[room.id] || 0;
                    const discountedPrice = Math.round(room.pricePerMonth * (1 - currentDisc / 100));
                    return (
                      <div 
                        key={room.id}
                        className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors hover:border-slate-250 dark:hover:border-slate-700"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">ROOM {room.roomNumber} &bull; {room.type}</div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                            {currentDisc > 0 ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="text-indigo-600 dark:text-cyan-400">₹{discountedPrice}/mo</span>
                                <span className="text-[10px] text-slate-400 line-through font-normal">₹{room.pricePerMonth}</span>
                              </div>
                            ) : (
                              <span>₹{room.pricePerMonth}/mo</span>
                            )}
                          </div>
                        </div>

                        {/* Slider for this room */}
                        <div className="w-full sm:w-48 space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 dark:text-slate-500">
                            <span>Discount Percentage:</span>
                            <span className="text-indigo-650 dark:text-cyan-400 font-black">{currentDisc}% OFF</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="50"
                            value={currentDisc}
                            onChange={(e) => handleRoomDiscountChange(room.id, Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
