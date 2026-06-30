import os

original_path = "c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/scratch/SuperAdminPanel_original.tsx"
target_path = "c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/pages/SuperAdminPanel.tsx"

print(f"Reading {original_path}...")
content = open(original_path, "r", encoding="utf-8").read()

# 1. Update lucide-react imports
old_imports = """import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  UserPlus, 
  FileLock2, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Settings, 
  Globe, 
  Mail, 
  Home, 
  FileText, 
  Upload, 
  ToggleLeft, 
  ToggleRight, 
  Laptop, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  UserCheck, 
  History, 
  Image,
  Store,
  MapPin,
  Phone,
  Briefcase,
  Sliders,
  Sparkles
} from 'lucide-react';"""

new_imports = """import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  UserPlus, 
  FileLock2, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Settings, 
  Globe, 
  Mail, 
  Home, 
  FileText, 
  Upload, 
  ToggleLeft, 
  ToggleRight, 
  Laptop, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  UserCheck, 
  History, 
  Image,
  Store,
  MapPin,
  Phone,
  Briefcase,
  Sliders,
  Sparkles,
  Unlock,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';"""

assert old_imports in content, "Could not find old lucide imports in original file!"
content = content.replace(old_imports, new_imports)
print("Updated lucide imports.")

# 2. Add properties inline editing states after selectedPropertyInsightId state
old_insight_state = "const [selectedPropertyInsightId, setSelectedPropertyInsightId] = useState<string | null>(null);"

new_insight_states_and_funcs = """const [selectedPropertyInsightId, setSelectedPropertyInsightId] = useState<string | null>(null);

  // States for inline editing inside HQ Master Property Console
  const [editingField, setEditingField] = useState<{ propId: string; fieldKey: string } | null>(null);
  const [fieldInputValue, setFieldInputValue] = useState<string>('');
  const [fieldShowPasswords, setFieldShowPasswords] = useState<{ [key: string]: boolean }>({});
  
  // States for editing room rates
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editDailyPrice, setEditDailyPrice] = useState<number>(0);
  const [editWeeklyPrice, setEditWeeklyPrice] = useState<number>(0);
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<number>(0);
  const [editSeasonalPrice, setEditSeasonalPrice] = useState<number>(0);

  const handleToggleFieldLock = (fieldKey: string, propertyId: string, propertyName: string) => {
    const updatedProperties = properties.map(p => {
      if (p.id === propertyId) {
        const locks = p.locks || {};
        return {
          ...p,
          locks: {
            ...locks,
            [fieldKey]: !locks[fieldKey]
          }
        };
      }
      return p;
    });
    setProperties(updatedProperties);
    setLocalStorageData('properties', updatedProperties);
    onAddAuditLog(`Toggled lock on field "${fieldKey}" for property "${propertyName}"`, 'SuperAdmin');
  };

  const handleStartFieldEdit = (fieldKey: string, currentValue: string) => {
    setEditingField({ propId: selectedPropertyInsightId!, fieldKey });
    setFieldInputValue(currentValue);
  };

  const handleSaveFieldEdit = (fieldKey: string, propertyId: string, propertyName: string) => {
    const updatedProperties = properties.map(p => {
      if (p.id === propertyId) {
        const updatedProp = {
          ...p,
          [fieldKey]: fieldInputValue
        };
        if (['houseNumber', 'street', 'area', 'district', 'state', 'pincode'].includes(fieldKey)) {
          const houseNo = fieldKey === 'houseNumber' ? fieldInputValue : p.houseNumber || '';
          const street = fieldKey === 'street' ? fieldInputValue : p.street || '';
          const area = fieldKey === 'area' ? fieldInputValue : p.area || '';
          const dist = fieldKey === 'district' ? fieldInputValue : p.district || '';
          const state = fieldKey === 'state' ? fieldInputValue : p.state || '';
          const pin = fieldKey === 'pincode' ? fieldInputValue : p.pincode || '';
          updatedProp.address = `${houseNo}, ${street}, ${area}, ${dist}, ${state} - ${pin}`;
        }
        return updatedProp;
      }
      return p;
    });
    setProperties(updatedProperties);
    setLocalStorageData('properties', updatedProperties);
    setEditingField(null);
    setFieldInputValue('');
    onAddAuditLog(`Modified field "${fieldKey}" for property "${propertyName}"`, 'SuperAdmin');
  };

  const handleStartRoomRatesEdit = (room: any) => {
    setEditingRoomId(room.id);
    setEditDailyPrice(room.pricePerDay || 0);
    setEditWeeklyPrice(room.priceWeekly || (room.pricePerDay || 0) * 7);
    setEditMonthlyPrice(room.pricePerMonth || 0);
    setEditSeasonalPrice(room.priceSeasonal || (room.pricePerMonth || 0) * 1.2);
  };

  const handleSaveRoomRates = (roomId: string) => {
    const storedRooms = getLocalStorageData<any[]>('rooms', []);
    const updatedRooms = storedRooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          pricePerDay: Number(editDailyPrice),
          priceWeekly: Number(editWeeklyPrice),
          pricePerMonth: Number(editMonthlyPrice),
          priceSeasonal: Number(editSeasonalPrice)
        };
      }
      return r;
    });
    setLocalStorageData('rooms', updatedRooms);
    setEditingRoomId(null);
    onAddAuditLog(`Super Admin updated room rates for unit ID: ${roomId}`, 'SuperAdmin');
  };"""

assert old_insight_state in content, "Could not find selectedPropertyInsightId state in original file!"
content = content.replace(old_insight_state, new_insight_states_and_funcs)
print("Added states and helper functions.")

# 3. Add locationLink property to propertyForm state initialization
old_form_init = """  const [propertyForm, setPropertyForm] = useState({
    name: '',
    type: 'Hotel' as 'Hotel' | 'PG',
    city: '',
    address: '',
    totalRooms: 6,
    amenities: 'WiFi, AC, TV, Food, Laundry, CCTV, Power Backup',
    rules: 'Gate closes at 10:30 PM, No smoking in rooms, Identification is mandatory',
    orgId: 'org-1'
  });"""

new_form_init = """  const [propertyForm, setPropertyForm] = useState({
    name: '',
    type: 'Hotel' as 'Hotel' | 'PG',
    city: '',
    address: '',
    totalRooms: 6,
    amenities: 'WiFi, AC, TV, Food, Laundry, CCTV, Power Backup',
    rules: 'Gate closes at 10:30 PM, No smoking in rooms, Identification is mandatory',
    orgId: 'org-1',
    locationLink: ''
  });"""

assert old_form_init in content, "Could not find propertyForm initialization in original file!"
content = content.replace(old_form_init, new_form_init)
print("Updated propertyForm state initialization.")

# 4. Update handleSaveProperty to support locationLink
old_save_edit = """          return {
            ...p,
            name: propertyForm.name,
            type: propertyForm.type,
            city: propertyForm.city,
            address: propertyForm.address,
            totalRooms: Number(propertyForm.totalRooms),
            amenities: amenitiesArray,
            rules: rulesArray,
            orgId: propertyForm.orgId
          };"""

new_save_edit = """          return {
            ...p,
            name: propertyForm.name,
            type: propertyForm.type,
            city: propertyForm.city,
            address: propertyForm.address,
            totalRooms: Number(propertyForm.totalRooms),
            amenities: amenitiesArray,
            rules: rulesArray,
            orgId: propertyForm.orgId,
            locationLink: propertyForm.locationLink
          };"""

assert old_save_edit in content, "Could not find save edit in handleSaveProperty!"
content = content.replace(old_save_edit, new_save_edit)

old_save_create = """      const newProp: Property = {
        id: `prop-${Date.now()}`,
        name: propertyForm.name,
        type: propertyForm.type,
        city: propertyForm.city,
        address: propertyForm.address,
        totalRooms: Number(propertyForm.totalRooms),
        amenities: amenitiesArray,
        rules: rulesArray,
        orgId: propertyForm.orgId
      };"""

new_save_create = """      const newProp: Property = {
        id: `prop-${Date.now()}`,
        name: propertyForm.name,
        type: propertyForm.type,
        city: propertyForm.city,
        address: propertyForm.address,
        totalRooms: Number(propertyForm.totalRooms),
        amenities: amenitiesArray,
        rules: rulesArray,
        orgId: propertyForm.orgId,
        locationLink: propertyForm.locationLink,
        locks: {},
        status: 'Active'
      };"""

assert old_save_create in content, "Could not find save create in handleSaveProperty!"
content = content.replace(old_save_create, new_save_create)

old_save_reset = """    setShowPropertyModal(false);
    setEditingPropertyId(null);
    setPropertyForm({
      name: '',
      type: 'Hotel',
      city: '',
      address: '',
      totalRooms: 6,
      amenities: 'WiFi, AC, TV, Food, Laundry, CCTV, Power Backup',
      rules: 'Gate closes at 10:30 PM, No smoking in rooms, Identification is mandatory',
      orgId: selectedOrgId
    });"""

new_save_reset = """    setShowPropertyModal(false);
    setEditingPropertyId(null);
    setPropertyForm({
      name: '',
      type: 'Hotel',
      city: '',
      address: '',
      totalRooms: 6,
      amenities: 'WiFi, AC, TV, Food, Laundry, CCTV, Power Backup',
      rules: 'Gate closes at 10:30 PM, No smoking in rooms, Identification is mandatory',
      orgId: selectedOrgId,
      locationLink: ''
    });"""

assert old_save_reset in content, "Could not find save reset in handleSaveProperty!"
content = content.replace(old_save_reset, new_save_reset)
print("Updated handleSaveProperty locationLink mappings and resets.")

# 5. Update click handlers to set/reset locationLink
old_edit_click = """                            setEditingPropertyId(prop.id);
                            setPropertyForm({
                              name: prop.name,
                              type: prop.type,
                              city: prop.city,
                              address: prop.address,
                              totalRooms: prop.totalRooms || 6,
                              amenities: prop.amenities.join(', '),
                              rules: prop.rules ? prop.rules.join(', ') : '',
                              orgId: prop.orgId || selectedOrgId
                            });"""

new_edit_click = """                            setEditingPropertyId(prop.id);
                            setPropertyForm({
                              name: prop.name,
                              type: prop.type,
                              city: prop.city,
                              address: prop.address,
                              totalRooms: prop.totalRooms || 6,
                              amenities: (prop.amenities || []).join(', '),
                              rules: prop.rules ? (prop.rules || []).join(', ') : '',
                              orgId: prop.orgId || selectedOrgId,
                              locationLink: prop.locationLink || ''
                            });"""

assert old_edit_click in content, "Could not find edit click setPropertyForm in original file!"
content = content.replace(old_edit_click, new_edit_click)

old_new_click = """              <button 
                onClick={() => {
                  setEditingPropertyId(null);
                  setPropertyForm({
                    name: '',
                    type: 'Hotel',
                    city: '',
                    address: '',
                    totalRooms: 6,
                    amenities: 'WiFi, AC, TV, Food Menu, Housekeeping, CCTV Security',
                    rules: 'No smoking, Gate closed after 10:30 PM, Guests allowed in visitor area only',
                    orgId: selectedOrgId
                  });
                  setShowPropertyModal(true);
                }}"""

new_new_click = """              <button 
                onClick={() => {
                  setEditingPropertyId(null);
                  setPropertyForm({
                    name: '',
                    type: 'Hotel',
                    city: '',
                    address: '',
                    totalRooms: 6,
                    amenities: 'WiFi, AC, TV, Food Menu, Housekeeping, CCTV Security',
                    rules: 'No smoking, Gate closed after 10:30 PM, Guests allowed in visitor area only',
                    orgId: selectedOrgId,
                    locationLink: ''
                  });
                  setShowPropertyModal(true);
                }}"""

assert old_new_click in content, "Could not find new click setPropertyForm in original file!"
content = content.replace(old_new_click, new_new_click)
print("Updated edit/new click setPropertyForm calls.")

# 6. Add locationLink input field to showPropertyModal form
old_form_input = """              <div>
                <label className="block text-slate-600 mb-1 font-bold text-slate-500">Premises Code of Conduct & Rules (comma-separated)</label>
                <input 
                  type="text" 
                  value={propertyForm.rules}
                  onChange={(e) => setPropertyForm({ ...propertyForm, rules: e.target.value })}
                  placeholder="No smoking, Gate closed after 10:30 PM"
                  className="w-full border rounded-xl p-2.5 bg-slate-50"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider font-display shadow-md transition pt-3.5 mt-2"
              >"""

new_form_input = """              <div>
                <label className="block text-slate-600 mb-1 font-bold text-slate-500">Premises Code of Conduct & Rules (comma-separated)</label>
                <input 
                  type="text" 
                  value={propertyForm.rules}
                  onChange={(e) => setPropertyForm({ ...propertyForm, rules: e.target.value })}
                  placeholder="No smoking, Gate closed after 10:30 PM"
                  className="w-full border rounded-xl p-2.5 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold text-slate-500">Google Maps Location Link (Optional)</label>
                <input 
                  type="url" 
                  value={propertyForm.locationLink}
                  onChange={(e) => setPropertyForm({ ...propertyForm, locationLink: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full border rounded-xl p-2.5 bg-slate-50 font-semibold"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider font-display shadow-md transition pt-3.5 mt-2"
              >"""

assert old_form_input in content, "Could not find form end in showPropertyModal in original file!"
content = content.replace(old_form_input, new_form_input)
print("Added locationLink input to showPropertyModal form.")

# 7. Replace selectedPropertyInsightId modal block with custom HQ Master Property Console
original_modal_start = """      {/* OCCUPANCY INSIGHT & REALTIME GUEST REGISTRY LOGS OVERLAY */}
      {selectedPropertyInsightId && (() => {"""

original_modal_end = """        return (
          <div id="property-insights-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-3xl p-6 space-y-6 shadow-2xl relative my-8 text-left max-h-[90vh] overflow-y-auto">
              
              {/* Overlay Modal Header */}
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[8px] px-2 py-0.5 font-black uppercase">
                      Executive Analytics Summary
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">ID CODE: {selectedPropertyInsightId}</span>
                  </div>
                  <h3 className="font-extrabold text-lg font-display text-slate-950 mt-1 leading-snug">
                    {selectedPropObj ? selectedPropObj.name : 'Unknown Property'}
                  </h3>
                  <p className="text-[10px] text-slate-500">{selectedPropObj?.address}, {selectedPropObj?.city}</p>
                </div>
                <button 
                  onClick={() => setSelectedPropertyInsightId(null)} 
                  className="p-1 hover:bg-slate-100 rounded-full border border-slate-205 transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Grid 1: Numerical Core Stats Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border rounded-2xl p-4 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Occupancy Level</span>
                  <div className="font-mono text-2xl font-black text-indigo-700 mt-0.5">{occupancyPercentage}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    <strong>{occupiedCount}</strong> of <strong>{totalRoomsRegistered}</strong> rooms active
                  </p>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Resident Guests Count</span>
                  <div className="font-mono text-2xl font-black text-emerald-700 mt-0.5">{filteredTenants.length}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Checked-in system tenants</p>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">New Booking Requests</span>
                  <div className="font-mono text-2xl font-black text-purple-700 mt-0.5">{filteredBookings.length}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Reserved schedules logs</p>
                </div>
              </div>

              {/* Left & Right Detail Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rooms Inventory Grid */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest border-b pb-1.5 flex justify-between">
                    <span>Rooms Status Index</span>
                    <span className="text-[9px] text-slate-400 normal-case font-mono">{filteredRooms.length} managed units</span>
                  </h4>
                  {filteredRooms.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-[11px] italic">
                      No units custom-seeded yet. Sub-admin will configure room numbers from their dashboard tab!
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {filteredRooms.map(rm => (
                        <div key={rm.id} className="bg-slate-50 border rounded-xl p-2.5 flex justify-between items-center text-[10.5px]">
                          <div>
                            <span className="font-mono font-black text-slate-900 block">Rm {rm.roomNumber}</span>
                            <span className="text-[9px] text-slate-400 block truncate max-w-[90px]">{rm.type}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-slate-800 block">₹{rm.price}</span>
                            <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              rm.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {rm.available ? 'VACANT' : 'FULL'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checked-In Active Resident Guests directory */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest border-b pb-1.5 flex justify-between">
                    <span>Resident Tenants Log</span>
                    <span className="text-[9px] text-slate-400 normal-case font-mono">{filteredTenants.length} tenants</span>
                  </h4>
                  {filteredTenants.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-[11px] italic">
                      Zero guests checked-in currently under this property code.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {filteredTenants.map(t => (
                        <div key={t.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-[10.5px]">
                          <div>
                            <span className="font-black text-slate-900 block">{t.name}</span>
                            <span className="text-[9.5px] text-slate-400 block font-mono">Room Number &raquo; Rm {t.roomNumber}</span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[8.5px] rounded-md px-2 py-0.5 uppercase">
                            Checked-In
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom: Booking Requests Timeline */}
              <div className="space-y-3">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest border-b pb-1.5 flex justify-between">
                  <span>Customer Booking Reservation Schedules Log</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">Total Reservations ({filteredBookings.length})</span>
                </h4>
                {filteredBookings.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-[11px] italic">
                    No active booking reservations logged for this property.
                  </div>
                ) : (
                  <div className="bg-slate-50 border rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 border-b font-bold text-slate-500 uppercase text-[9px]">
                          <th className="p-3">Customer</th>
                          <th className="p-3">Accommodation Room Type</th>
                          <th className="p-3">Schedules (In/Out)</th>
                          <th className="p-3">Calculated Price</th>
                          <th className="p-3 text-center">Confirmation Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="border-b last:border-b-0">
                            <td className="p-3 font-black text-slate-900">{b.customerName}</td>
                            <td className="p-3 text-slate-650 font-bold">{b.roomType}</td>
                            <td className="p-3 text-slate-500 font-mono">
                              {b.checkInDate} &raquo; {b.checkOutDate}
                            </td>
                            <td className="p-3 font-mono font-extrabold text-indigo-705">₹{b.totalAmount}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-md font-extrabold text-[8.5px] uppercase ${
                                b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {b.status}
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
          </div>
        );
      })()}"""

assert original_modal_start in content, "Could not find original_modal_start in original file!"
assert original_modal_end in content, "Could not find original_modal_end in original file!"

new_modal_full = """      {/* OCCUPANCY INSIGHT & REALTIME GUEST REGISTRY LOGS OVERLAY */}
      {selectedPropertyInsightId && (() => {
        const selectedPropObj = properties.find(p => p.id === selectedPropertyInsightId);
        if (!selectedPropObj) return null;
        
        // Dynamic fetch of stashed operational indices
        const storedRooms = getLocalStorageData<any[]>('rooms', []);
        const storedTenants = getLocalStorageData<any[]>('tenants', []);
        const storedBookings = getLocalStorageData<any[]>('bookings', []);
        
        const filteredRooms = storedRooms.filter(r => r.propertyId === selectedPropertyInsightId);
        const filteredTenants = storedTenants.filter(t => t.propertyId === selectedPropertyInsightId);
        const filteredBookings = storedBookings.filter(b => b.propertyId === selectedPropertyInsightId);

        // Group rooms by floor
        const floorRooms: { [key: number]: any[] } = {};
        filteredRooms.forEach(rm => {
          const fl = rm.floor || 0;
          if (!floorRooms[fl]) floorRooms[fl] = [];
          floorRooms[fl].push(rm);
        });

        const sortedFloors = Object.keys(floorRooms).map(Number).sort((a, b) => a - b);

        const renderEditField = (label: string, fieldKey: string, value: string, isPassword = false) => {
          const isEditing = editingField?.propId === selectedPropObj.id && editingField?.fieldKey === fieldKey;
          const isLocked = selectedPropObj.locks?.[fieldKey] || false;
          const showPassword = fieldShowPasswords[fieldKey] || false;

          return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 last:border-0 text-[11px] gap-2">
              <div className="flex items-center gap-1.5 shrink-0 min-w-[120px]">
                <span className="text-slate-400 font-bold uppercase">{label}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFieldLock(fieldKey, selectedPropObj.id, selectedPropObj.name)}
                  className={`p-1 transition hover:bg-slate-100 ${isLocked ? "text-rose-600" : "text-slate-400"}`}
                  title={isLocked ? "Field locked for Admin" : "Field unlocked for Admin"}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between flex-1 gap-2 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type={isPassword && !showPassword ? "password" : "text"}
                      value={fieldInputValue}
                      onChange={e => setFieldInputValue(e.target.value)}
                      className="bg-slate-50 border border-slate-205 rounded-none px-2 py-1 text-xs w-full font-semibold outline-none"
                    />
                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => setFieldShowPasswords({ ...fieldShowPasswords, [fieldKey]: !showPassword })}
                        className="text-slate-400 p-1 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveFieldEdit(fieldKey, selectedPropObj.id, selectedPropObj.name)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-none text-[10px]"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold px-2 py-1 rounded-none text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-slate-800 font-black truncate max-w-[200px]">
                      {isPassword && !showPassword ? "••••••••" : value || "N/A"}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => setFieldShowPasswords({ ...fieldShowPasswords, [fieldKey]: !showPassword })}
                          className="text-slate-400 p-1 hover:text-slate-655"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartFieldEdit(fieldKey, value || "")}
                        className="text-slate-400 hover:text-indigo-650 p-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        };

        return (
          <div id="property-insights-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 overflow-y-auto">
            <div className="bg-white rounded-none w-full max-w-5xl p-6 space-y-6 shadow-2xl relative my-8 text-left max-h-[90vh] overflow-y-auto">
              
              {/* Overlay Modal Header */}
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-650 text-white rounded-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                      HQ Master Property Console
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-405">ID: {selectedPropertyInsightId}</span>
                  </div>
                  <h3 className="font-black text-lg font-display text-slate-950 mt-1 leading-none">
                    {selectedPropObj.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    📍 {selectedPropObj.houseNumber || ''}, {selectedPropObj.street || ''}, {selectedPropObj.area || ''}, {selectedPropObj.district || ''}, {selectedPropObj.state || ''} - {selectedPropObj.pincode || ''}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedPropertyInsightId(null)} 
                  className="p-1.5 hover:bg-slate-100 rounded-none border border-slate-205 transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Grid 1: Details and specs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Admin details & specs */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* Card 1: Admin Profile Credentials */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3">
                    <h4 className="font-black text-xs text-indigo-755 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                      <span>👤 Admin Profile Credentials</span>
                    </h4>
                    <div className="space-y-1">
                      {renderEditField("Admin Name", "adminName", selectedPropObj.adminName || "")}
                      {renderEditField("Phone Number", "adminPhone", selectedPropObj.adminPhone || "")}
                      {renderEditField("Email Address", "adminEmail", selectedPropObj.adminEmail || "")}
                      {renderEditField("Access Password", "adminPassword", selectedPropObj.adminPassword || "", true)}
                    </div>
                  </div>

                  {/* Card 2: Property Specs & Address */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3">
                    <h4 className="font-black text-xs text-indigo-755 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                      <span>🏠 Property Specs & Address</span>
                    </h4>
                    <div className="space-y-1">
                      {renderEditField("Property Name", "name", selectedPropObj.name || "")}
                      {renderEditField("Classification", "classification", selectedPropObj.classification || "")}
                      {renderEditField("State", "state", selectedPropObj.state || "")}
                      {renderEditField("District", "district", selectedPropObj.district || "")}
                      {renderEditField("Pincode", "pincode", selectedPropObj.pincode || "")}
                      {renderEditField("Area Name", "area", selectedPropObj.area || "")}
                      {renderEditField("Street Road", "street", selectedPropObj.street || "")}
                      {renderEditField("House Number", "houseNumber", selectedPropObj.houseNumber || "")}
                      {renderEditField("Banner Image", "imageUrl", selectedPropObj.imageUrl || "")}
                      {renderEditField("Location Link", "locationLink", selectedPropObj.locationLink || "")}
                    </div>
                  </div>
                </div>

                {/* Right side: Room rates list */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3">
                    <h4 className="font-black text-xs text-indigo-755 uppercase tracking-wider border-b pb-2 flex justify-between items-center">
                      <span>🗄️ Floor-by-Floor Inventory Rates</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Total rooms: {filteredRooms.length}</span>
                    </h4>
                    {filteredRooms.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 italic text-[11px]">No physical rooms registered for this property asset.</p>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {sortedFloors.map(flNum => (
                          <div key={flNum} className="space-y-2 border border-slate-200 bg-white p-3 rounded-none">
                            <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-none font-mono">Floor {flNum}</span>
                            <div className="space-y-2 pt-1.5">
                              {floorRooms[flNum].map(rm => {
                                const isEditingRoom = editingRoomId === rm.id;
                                return (
                                  <div key={rm.id} className="border border-slate-105 p-2.5 flex flex-col sm:flex-row justify-between sm:items-center text-[10.5px] gap-2 hover:bg-slate-50/50">
                                    <div className="shrink-0">
                                      <strong className="text-slate-900 font-mono block">Room {rm.roomNumber}</strong>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block">{rm.type} ({rm.occupancyStatus})</span>
                                    </div>
                                    {isEditingRoom ? (
                                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                        <div>
                                          <span className="text-[8px] text-slate-400 block font-bold">Daily (₹)</span>
                                          <input
                                            type="number"
                                            value={editDailyPrice}
                                            onChange={e => setEditDailyPrice(Number(e.target.value) || 0)}
                                            className="w-full border p-1 font-mono font-bold"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[8px] text-slate-400 block font-bold">Weekly (₹)</span>
                                          <input
                                            type="number"
                                            value={editWeeklyPrice}
                                            onChange={e => setEditWeeklyPrice(Number(e.target.value) || 0)}
                                            className="w-full border p-1 font-mono font-bold"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[8px] text-slate-400 block font-bold">Monthly (₹)</span>
                                          <input
                                            type="number"
                                            value={editMonthlyPrice}
                                            onChange={e => setEditMonthlyPrice(Number(e.target.value) || 0)}
                                            className="w-full border p-1 font-mono font-bold"
                                          />
                                        </div>
                                        <div>
                                          <span className="text-[8px] text-slate-400 block font-bold">Seasonal (₹)</span>
                                          <input
                                            type="number"
                                            value={editSeasonalPrice}
                                            onChange={e => setEditSeasonalPrice(Number(e.target.value) || 0)}
                                            className="w-full border p-1 font-mono font-bold"
                                          />
                                        </div>
                                        <div className="col-span-full flex justify-end gap-1 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => handleSaveRoomRates(rm.id)}
                                            className="bg-emerald-600 text-white font-bold px-2 py-0.5 text-[9px]"
                                          >
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingRoomId(null)}
                                            className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 text-[9px]"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex-1 flex justify-between items-center gap-3 font-semibold">
                                        <div className="grid grid-cols-4 gap-3 text-right flex-1 font-mono">
                                          <div>
                                            <span className="text-[8px] text-slate-400 block uppercase font-sans">Day</span>
                                            <span className="font-bold">₹{rm.pricePerDay}</span>
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-slate-400 block uppercase font-sans">Week</span>
                                            <span className="font-bold">₹{rm.priceWeekly || rm.pricePerDay * 7}</span>
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-slate-400 block uppercase font-sans">Month</span>
                                            <span className="font-bold">₹{rm.pricePerMonth}</span>
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-slate-400 block uppercase font-sans">Season</span>
                                            <span className="font-bold">₹{rm.priceSeasonal || rm.pricePerMonth * 1.2}</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleStartRoomRatesEdit(rm)}
                                          className="text-indigo-650 hover:text-indigo-800 p-1 border border-slate-100 hover:border-indigo-150 flex items-center justify-center shrink-0"
                                          title="Edit room rates"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card 3: Resident guests list */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3">
                    <h4 className="font-black text-xs text-indigo-755 uppercase tracking-wider border-b pb-2 flex justify-between">
                      <span>Resident Tenants Log</span>
                      <span className="text-[9px] text-slate-450 font-mono font-bold">{filteredTenants.length} checked-in guests</span>
                    </h4>
                    {filteredTenants.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 italic text-[11px]">No resident guests checked-in currently.</p>
                    ) : (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {filteredTenants.map(t => (
                          <div key={t.id} className="p-3 bg-white border border-slate-150 rounded-none flex justify-between items-center text-[10.5px]">
                            <div>
                              <strong className="text-slate-900 block">{t.name}</strong>
                              <span className="text-[9.5px] text-slate-400 block font-mono">Room Number » Rm {t.roomNumber}</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[8.5px] px-2 py-0.5 rounded-none uppercase">Checked-In</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}"""

content = content.replace(original_modal_start + original_modal_end, new_modal_full)
print("Replaced selectedPropertyInsightId modal block with custom HQ Master Property Console.")

# 8. Safeguard other amenities/rules arrays inside property registry view
content = content.replace("prop.amenities.slice(0, 5)", "(prop.amenities || []).slice(0, 5)")
content = content.replace("prop.amenities.length > 5", "(prop.amenities || []).length > 5")
content = content.replace("prop.amenities.length - 5", "(prop.amenities || []).length - 5")
print("Safeguarded prop.amenities slice and length checks.")

# 9. Save file
open(target_path, "w", encoding="utf-8").write(content)
print(f"Reconstruction completed successfully! Saved to {target_path}")
