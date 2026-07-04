import React, { useState, useEffect } from 'react';
import { Property, AuditLog } from '../../types';
import { 
  Building2, 
  Settings, 
  Percent, 
  Store, 
  BellRing, 
  ShieldCheck, 
  Layout, 
  History, 
  Save, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  Lock, 
  Eye, 
  EyeOff,
  UserCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface SettingsViewProps {
  properties: Property[];
  syncProperties?: (updatedProperties: Property[]) => void;
  selectedPropertyId: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
  auditLogsList: AuditLog[];
}

export default function SettingsView({
  properties,
  syncProperties,
  selectedPropertyId,
  onAddAuditLog,
  auditLogsList
}: SettingsViewProps) {
  // Configured states with fallback storage
  const [companyName, setCompanyName] = useState('Homely Stays Group Pvt Ltd');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?w=120');
  const [companyEmail, setCompanyEmail] = useState('contact@homelystays.com');
  const [companyPhone, setCompanyPhone] = useState('+91 80 4321 0000');
  const [gstin, setGstin] = useState('29AAACH1234F1Z5');
  const [cgstRate, setCgstRate] = useState(9); // 9%
  const [sgstRate, setSgstRate] = useState(9); // 9%
  const [branchCode, setBranchCode] = useState('BLR-HSR-02');
  const [branchManager, setBranchManager] = useState('Priya Narayanan');
  const [supportHotline, setSupportHotline] = useState('+91 97700 45678');

  // Notification Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [upiReminders, setUpiReminders] = useState(true);
  const [hkAutoAssign, setHkAutoAssign] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Corporate Amenities Configuration
  const [systemAmenities, setSystemAmenities] = useState<string[]>(['WiFi', 'AC', 'TV', 'Food', 'Laundry']);
  const [newSystemAmenity, setNewSystemAmenity] = useState('');
  const [editingAmenityIndex, setEditingAmenityIndex] = useState<number | null>(null);
  const [editingAmenityValue, setEditingAmenityValue] = useState('');

  // Preferences
  const [billingCurrency, setBillingCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('IST (UTC+05:30)');
  const [enableAutoPdf, setEnableAutoPdf] = useState(true);

  // Custom persistent states for safe iframe notification alerts
  const [settingsAlert, setSettingsAlert] = useState<string | null>(null);
  const [settingsConfirmReset, setSettingsConfirmReset] = useState<boolean>(false);

  const currentProperty = properties.find(p => p.id === selectedPropertyId);

  // Property Profile State (dynamic from currentProperty)
  const [propAdminName, setPropAdminName] = useState('');
  const [propAdminPhone, setPropAdminPhone] = useState('');
  const [propAdminEmail, setPropAdminEmail] = useState('');
  const [propAdminPassword, setPropAdminPassword] = useState('');
  const [propName, setPropName] = useState('');
  const [propClassification, setPropClassification] = useState('');
  const [propImageUrl, setPropImageUrl] = useState('');
  const [propState, setPropState] = useState('');
  const [propDistrict, setPropDistrict] = useState('');
  const [propPincode, setPropPincode] = useState('');
  const [propArea, setPropArea] = useState('');
  const [propStreet, setPropStreet] = useState('');
  const [propHouseNumber, setPropHouseNumber] = useState('');
  const [showPropPassword, setShowPropPassword] = useState(false);

  useEffect(() => {
    if (currentProperty) {
      setPropAdminName(currentProperty.adminName || '');
      setPropAdminPhone(currentProperty.adminPhone || '');
      setPropAdminEmail(currentProperty.adminEmail || '');
      setPropAdminPassword(currentProperty.adminPassword || '');
      setPropName(currentProperty.name || '');
      setPropClassification(currentProperty.classification || '');
      setPropImageUrl(currentProperty.imageUrl || '');
      setPropState(currentProperty.state || '');
      setPropDistrict(currentProperty.district || '');
      setPropPincode(currentProperty.pincode || '');
      setPropArea(currentProperty.area || '');
      setPropStreet(currentProperty.street || '');
      setPropHouseNumber(currentProperty.houseNumber || '');
    }
  }, [currentProperty, selectedPropertyId]);

  // Read initial saved values if any
  useEffect(() => {
    try {
      const savedCompany = localStorage.getItem('hotel_pg_settings_company');
      if (savedCompany) {
        const parsed = JSON.parse(savedCompany);
        setCompanyName(parsed.companyName || companyName);
        setCompanyLogoUrl(parsed.companyLogoUrl || companyLogoUrl);
        setCompanyEmail(parsed.companyEmail || companyEmail);
        setCompanyPhone(parsed.companyPhone || companyPhone);
      }

      const savedTax = localStorage.getItem('hotel_pg_settings_tax');
      if (savedTax) {
        const parsed = JSON.parse(savedTax);
        setGstin(parsed.gstin || gstin);
        setCgstRate(parsed.cgstRate || cgstRate);
        setSgstRate(parsed.sgstRate || sgstRate);
        setBranchCode(parsed.branchCode || branchCode);
        setBranchManager(parsed.branchManager || branchManager);
        setSupportHotline(parsed.supportHotline || supportHotline);
      }

      const savedAmenities = localStorage.getItem('hotel_pg_settings_amenities');
      if (savedAmenities) {
        setSystemAmenities(JSON.parse(savedAmenities));
      }
    } catch (e) {
      console.warn("Could not read custom settings from storage", e);
    }
  }, []);

  const handleSaveSettings = (category: string) => {
    // Audit Logging
    onAddAuditLog(`Updated system policy settings: ${category}`, 'SuperAdmin');

    // Persist category specifically
    if (category === 'Company Profile') {
      localStorage.setItem('hotel_pg_settings_company', JSON.stringify({
        companyName,
        companyLogoUrl,
        companyEmail,
        companyPhone
      }));
    } else if (category === 'Business & GST') {
      localStorage.setItem('hotel_pg_settings_tax', JSON.stringify({
        gstin,
        cgstRate,
        sgstRate,
        branchCode,
        branchManager,
        supportHotline
      }));
    } else if (category === 'Amenities Configuration') {
      localStorage.setItem('hotel_pg_settings_amenities', JSON.stringify(systemAmenities));
    }

    setSettingsAlert(`${category} specifications saved and synchronized successfully in sandbox backend.`);
  };

  const handleSavePropertyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProperty || !syncProperties) return;

    const updatedAddress = `${propHouseNumber}, ${propStreet}, ${propArea}, ${propDistrict}, ${propState} - ${propPincode}`;

    const updatedProps = properties.map(p => {
      if (p.id === currentProperty.id) {
        return {
          ...p,
          adminName: propAdminName,
          adminPhone: propAdminPhone,
          adminEmail: propAdminEmail,
          adminPassword: propAdminPassword,
          name: propName,
          classification: propClassification,
          imageUrl: propImageUrl,
          state: propState,
          district: propDistrict,
          pincode: propPincode,
          area: propArea,
          street: propStreet,
          houseNumber: propHouseNumber,
          address: updatedAddress
        };
      }
      return p;
    });

    syncProperties(updatedProps);
    onAddAuditLog(`Updated Property Profile Settings for ${propName}`, 'SuperAdmin');
    setSettingsAlert('Property & Operator profile settings saved successfully.');
  };

  const handleResetSettings = () => {
    setSettingsConfirmReset(true);
  };

  const executeResetSettings = () => {
    setCompanyName('Homely Stays Group Pvt Ltd');
    setCompanyLogoUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=120');
    setCompanyEmail('contact@homelystays.com');
    setCompanyPhone('+91 80 4321 0000');
    setGstin('29AAACH1234F1Z5');
    setCgstRate(9);
    setSgstRate(9);
    setBranchCode('BLR-HSR-02');
    setBranchManager('Priya Narayanan');
    setSupportHotline('+91 97700 45678');
    setEmailAlerts(true);
    setSmsAlerts(true);
    setUpiReminders(true);
    setHkAutoAssign(false);
    setTwoFactorAuth(true);
    setSystemAmenities(['WiFi', 'AC', 'TV', 'Food', 'Laundry']);

    localStorage.removeItem('hotel_pg_settings_company');
    localStorage.removeItem('hotel_pg_settings_tax');
    localStorage.removeItem('hotel_pg_settings_amenities');

    onAddAuditLog('Reset entire business configuration node to factory rules', 'SuperAdmin');
    setSettingsConfirmReset(false);
    setSettingsAlert('Settings flushed to factory defaults.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setSettingsAlert('Please specify a valid security string.');
      return;
    }
    setCurrentPassword('••••••••••••');
    setNewPassword('');
    setShowPasswordFields(false);
    onAddAuditLog('Modified master administrative panel login password credentials', 'SuperAdmin');
    setSettingsAlert('Security keys rotated successfully.');
  };

  // Mock login histories logs
  const mockLoginHistories = [
    { id: 'lh-1', user: 'sunny.diploma033@gmail.com', location: 'Gachibowli, Hyderabad', device: 'Chome 124 / macOS Monterey', timestamp: '2026-05-26 10:45 AM', outcome: 'Succeeded' },
    { id: 'lh-2', user: 'sunny.diploma033@gmail.com', location: 'HSR Layout, Bangalore', device: 'Safari 17 / iPhone 15 Pro Max', timestamp: '2026-05-25 09:12 PM', outcome: 'Succeeded' },
    { id: 'lh-3', user: 'admin.hsr@homelystays.com', location: 'HSR Layout, Bangalore', device: 'Edge 123 / Windows 11', timestamp: '2026-05-24 09:00 AM', outcome: 'Succeeded' },
    { id: 'lh-4', user: 'guest_test@stayhub.co', location: 'Indiranagar, Bangalore', device: 'Mobile Chrome / Android 14', timestamp: '2026-05-23 04:22 PM', outcome: 'Succeeded' }
  ];

  const renderLockedInput = (
    label: string,
    fieldKey: string,
    value: string,
    setValue: (val: string) => void,
    type = 'text'
  ) => {
    const isLocked = currentProperty?.locks?.[fieldKey] === true;
    const handleContainerClick = () => {
      if (isLocked) {
        setSettingsAlert(`You do not have access to change the "${label}" field. It has been locked by the corporate HQ Super Admin.`);
      }
    };
    return (
      <div className="space-y-1" onClick={handleContainerClick}>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">{label}</label>
          {isLocked && <span title="Locked by corporate HQ Super Admin"><Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>}
        </div>
        <input 
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLocked}
          className={`w-full border rounded-xl py-2 px-3 text-xs font-bold outline-none transition ${
            isLocked 
              ? 'bg-slate-100 text-slate-400 border-slate-205 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-indigo-650 focus:bg-white text-slate-900'
          }`}
          required
        />
      </div>
    );
  };

  const renderLockedPasswordInput = (
    label: string,
    fieldKey: string,
    value: string,
    setValue: (val: string) => void
  ) => {
    const isLocked = currentProperty?.locks?.[fieldKey] === true;
    const handleContainerClick = () => {
      if (isLocked) {
        setSettingsAlert(`You do not have access to change the "${label}" field. It has been locked by the corporate HQ Super Admin.`);
      }
    };
    return (
      <div className="space-y-1" onClick={handleContainerClick}>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">{label}</label>
          {isLocked && <span title="Locked by corporate HQ Super Admin"><Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>}
        </div>
        <div className="relative">
          <input 
            type={showPropPassword ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLocked}
            className={`w-full border rounded-xl py-2 pl-3 pr-10 text-xs font-bold outline-none transition ${
              isLocked 
                ? 'bg-slate-100 text-slate-400 border-slate-205 cursor-not-allowed' 
                : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-indigo-650 focus:bg-white text-slate-900'
            }`}
            required
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPropPassword(!showPropPassword);
            }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
          >
            {showPropPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  };

  const renderLockedImageUploader = (
    label: string,
    fieldKey: string,
    value: string,
    setValue: (val: string) => void
  ) => {
    const isLocked = currentProperty?.locks?.[fieldKey] === true;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isLocked) {
        setSettingsAlert(`You do not have access to change the "${label}". It has been locked by the corporate HQ Super Admin.`);
        return;
      }
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setValue(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleContainerClick = () => {
      if (isLocked) {
        setSettingsAlert(`You do not have access to change the "${label}". It has been locked by the corporate HQ Super Admin.`);
      }
    };

    return (
      <div className="space-y-1" onClick={handleContainerClick}>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">{label}</label>
          {isLocked && <span title="Locked by corporate HQ Super Admin"><Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>}
        </div>
        <div className={`flex items-center space-x-2.5 border rounded-xl p-1.5 transition ${
          isLocked ? 'bg-slate-100 border-slate-205' : 'bg-slate-50 border-slate-200'
        }`}>
          <img 
            src={value || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120'} 
            alt="Property preview" 
            className="w-12 h-10 rounded-lg border object-cover bg-white shrink-0" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120';
            }}
          />
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*"
              id="admin-property-image-uploader"
              onChange={handleFileChange}
              disabled={isLocked}
              className="hidden"
            />
            <label 
              htmlFor={isLocked ? undefined : "admin-property-image-uploader"}
              className={`inline-block bg-white border border-slate-300 text-slate-700 font-extrabold py-1 px-2.5 rounded-lg text-[9.5px] shadow-5xs text-center transition select-none uppercase tracking-wide ${
                isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-slate-100'
              }`}
            >
              Upload Photo
            </label>
            <span className="block text-[8px] text-slate-400 mt-0.5 leading-none">JPEG, PNG supported</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn">
      
      {/* Settings general description */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">System Settings & Policies</h3>
          <p className="text-xs text-slate-400">Configure corporate taxation rates, update active branch meta headers, toggles, and inspect compliance registers.</p>
        </div>

        <button
          onClick={handleResetSettings}
          className="bg-white border border-slate-200 text-slate-600 hover:text-red-500 font-bold py-2.5 px-4 rounded-xl text-xs transition inline-flex items-center space-x-1.5 shadow-5xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Settings Node</span>
        </button>
      </div>

      {/* Global Iframe simulated alerts alert */}
      {settingsAlert && (
        <div className="bg-indigo-50 border border-indigo-150 p-4 text-xs font-semibold text-indigo-800 flex justify-between items-center rounded-2xl">
          <span>{settingsAlert}</span>
          <button 
            onClick={() => setSettingsAlert(null)}
            className="text-slate-400 hover:text-indigo-900 font-mono font-bold text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Reset Confirmation Overlay */}
      {settingsConfirmReset && (
        <div className="bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 space-y-3 rounded-2xl">
          <p className="font-bold">Are you absolutely sure you want to restore default mock configurations? This flushes company metadata, taxation composites, and custom amenities definitions.</p>
          <div className="flex gap-2">
            <button 
              onClick={executeResetSettings}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-3 rounded-lg text-[10.5px] uppercase shadow-sm"
            >
              Reset Database Settings
            </button>
            <button 
              onClick={() => setSettingsConfirmReset(false)}
              className="bg-white border border-slate-250 text-slate-700 font-bold py-1 px-3 rounded-lg text-[10.5px] uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1 - settings panels */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section 0: PROPERTY PROFILE & OPERATOR SETTINGS */}
          {currentProperty && (
            <form onSubmit={handleSavePropertyProfile} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-2">
                <Store className="w-4.5 h-4.5 text-indigo-650" />
                <span>Property Profile & Owner Account Settings</span>
              </h4>

              {/* Sub-group: Operator Account Profile */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 block">👤 Operator Account Profile</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderLockedInput("Operator Name", "adminName", propAdminName, setPropAdminName)}
                  {renderLockedInput("Operator Phone", "adminPhone", propAdminPhone, setPropAdminPhone)}
                  {renderLockedInput("Operator Email ID", "adminEmail", propAdminEmail, setPropAdminEmail)}
                  {renderLockedPasswordInput("Operator Access Password", "adminPassword", propAdminPassword, setPropAdminPassword)}
                </div>
              </div>

              {/* Sub-group: Property Specifications */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 block">🏢 Property Specifications & Classification</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderLockedInput("Property Brand Name", "name", propName, setPropName)}
                  {renderLockedInput("Property Classification", "classification", propClassification, setPropClassification)}
                  <div className="col-span-1 md:col-span-2">
                    {renderLockedImageUploader("Property Photo Banner (Upload Image)", "imageUrl", propImageUrl, setPropImageUrl)}
                  </div>
                </div>
              </div>

              {/* Sub-group: Detailed Address Coordinates */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 block">📍 Detailed Address Coordinates</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {renderLockedInput("State of Location", "state", propState, setPropState)}
                  {renderLockedInput("District", "district", propDistrict, setPropDistrict)}
                  {renderLockedInput("Pincode (India)", "pincode", propPincode, setPropPincode)}
                  {renderLockedInput("Area / Neighborhood", "area", propArea, setPropArea)}
                  {renderLockedInput("Street Address", "street", propStreet, setPropStreet)}
                  {renderLockedInput("House / Block Number", "houseNumber", propHouseNumber, setPropHouseNumber)}
                </div>
              </div>

              {/* Save changes footer bar */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium italic">
                  Note: Locked inputs must be altered by corporate HQ Super Admin.
                </span>
                <button 
                  type="submit"
                  className="bg-indigo-655 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition inline-flex items-center space-x-1.5 shadow-md active:scale-98 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Settings</span>
                </button>
              </div>
            </form>
          )}
          
          {/* Section A: COMPANY PROFILE */}
          <div className="bg-white p-5 rounded-3xl border border-slate-205/80 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-2">
              <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              <span>Company Profile & Branding</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Organization/Company Name</label>
                <input 
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-bold outline-none text-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Company Logo Image (Upload)</label>
                <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <img 
                    src={companyLogoUrl} 
                    alt="Logo preview" 
                    className="w-10 h-10 rounded-lg border object-cover bg-white shrink-0" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback preview
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120';
                    }}
                  />
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="branding-logo-uploader"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setCompanyLogoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label 
                      htmlFor="branding-logo-uploader"
                      className="inline-block bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold py-1 px-2.5 rounded-lg text-[9.5px] cursor-pointer shadow-5xs text-center transition select-none uppercase tracking-wide"
                    >
                      Upload File
                    </label>
                    <span className="block text-[8px] text-slate-400 mt-0.5 leading-none">JPEG, PNG, SVG supported</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Corporate Contact Email</label>
                <input 
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Corporate Telephone hotline</label>
                <input 
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium italic">Simulated branding propagates to client receipts & invoices</span>
              <button 
                onClick={() => handleSaveSettings('Company Profile')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition inline-flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Branding</span>
              </button>
            </div>
          </div>

          {/* Section B: BUSINESS & GST CONFIG */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-2">
              <Percent className="w-4.5 h-4.5 text-indigo-600" />
              <span>Taxation and Active Branch Settings</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">GSTIN Register</label>
                <input 
                  type="text"
                  disabled
                  value={gstin}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold uppercase text-slate-500 cursor-not-allowed transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">CGST Surcharge (%)</label>
                <input 
                  type="number"
                  disabled
                  value={cgstRate}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-500 cursor-not-allowed transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">SGST Surcharge (%)</label>
                <input 
                  type="number"
                  disabled
                  value={sgstRate}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-500 cursor-not-allowed transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Branch Unique ID</label>
                <input 
                  type="text"
                  disabled
                  value={branchCode}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Branch Supervisor</label>
                <input 
                  type="text"
                  disabled
                  value={branchManager}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Help Desk Line</label>
                <input 
                  type="text"
                  disabled
                  value={supportHotline}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium italic">Standard GST taxation is set at {(cgstRate + sgstRate)}% overall composite rate.</span>
              <span className="text-[10.5px] text-indigo-705 font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Managed by Super Admin</span>
              </span>
            </div>
          </div>

          {/* Section C: NOTIFICATIONS & PREFERENCES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             {/* Amenities Management panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-1">
                <Store className="w-4.5 h-4.5 text-indigo-600" />
                <span>Amenities Management Settings</span>
              </h4>

              <div className="space-y-3 pt-1">
                
                {/* Add Custom Amenity Section */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Add Custom Property Amenity</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text"
                      value={newSystemAmenity}
                      onChange={(e) => setNewSystemAmenity(e.target.value)}
                      placeholder="E.g., Swimming Pool, Covered Parking"
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 font-bold transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const trimmed = newSystemAmenity.trim();
                        if (trimmed) {
                          if (!systemAmenities.includes(trimmed)) {
                            const updated = [...systemAmenities, trimmed];
                            setSystemAmenities(updated);
                            localStorage.setItem('hotel_pg_settings_amenities', JSON.stringify(updated));
                            onAddAuditLog(`Added custom corporate amenity setting: ${trimmed}`, 'SuperAdmin');
                          }
                          setNewSystemAmenity('');
                        }
                      }}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-2 px-3.5 rounded-xl text-xs transition uppercase select-none cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Manage Active Amenities list with in-place rename support */}
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Active Amenities List:</span>
                  
                  {systemAmenities.map((amenity, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 p-2 border border-slate-100 rounded-xl">
                      {editingAmenityIndex === index ? (
                        <div className="flex gap-1.5 w-full">
                          <input 
                            type="text"
                            value={editingAmenityValue}
                            onChange={(e) => setEditingAmenityValue(e.target.value)}
                            className="flex-grow bg-white border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const val = editingAmenityValue.trim();
                              if (val) {
                                const copy = [...systemAmenities];
                                copy[index] = val;
                                setSystemAmenities(copy);
                                localStorage.setItem('hotel_pg_settings_amenities', JSON.stringify(copy));
                                setEditingAmenityIndex(null);
                                onAddAuditLog(`Modified corporate amenity name to ${val}`, 'SuperAdmin');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2 rounded-lg text-[9px] uppercase cursor-pointer shrink-0"
                          >
                            Save
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingAmenityIndex(null)}
                            className="text-slate-400 hover:text-slate-650 text-xs font-bold font-mono px-0.5"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-800">{amenity}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAmenityIndex(index);
                                setEditingAmenityValue(amenity);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = systemAmenities.filter((_, i) => i !== index);
                                setSystemAmenities(filtered);
                                localStorage.setItem('hotel_pg_settings_amenities', JSON.stringify(filtered));
                                onAddAuditLog(`Deleted corporate amenity setting: ${amenity}`, 'SuperAdmin');
                              }}
                              className="text-slate-400 hover:text-rose-600 font-black cursor-pointer text-sm font-sans"
                              title="Delete"
                            >
                              &times;
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {systemAmenities.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic">No amenities registered. Please declare items above.</span>
                  )}
                </div>

              </div>
            </div>

            {/* Application Preferences */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-1">
                <Layout className="w-4 h-4 text-emerald-500" />
                <span>App Preferences</span>
              </h4>

              <div className="space-y-3 text-xs pt-1">
                
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono uppercase block">Billing Ledger Currency</span>
                  <select 
                    value={billingCurrency}
                    onChange={(e) => setBillingCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono uppercase block">Office Timezone node</span>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="IST">IST (UTC+05:30) Bangalore/Kolkata</option>
                    <option value="EST">EST (UTC-05:00) New York</option>
                    <option value="GMT">GMT (UTC+00:00) London</option>
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer pt-2">
                  <div>
                    <span className="font-bold text-slate-800 block">Print Automatic PDFs</span>
                    <span className="text-[9.5px] text-slate-400 font-medium">Render download triggers automatically</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={enableAutoPdf}
                    onChange={(e) => setEnableAutoPdf(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-505"
                  />
                </label>

              </div>
            </div>

          </div>

          {/* Section D: SECURITY CONFIGURATION */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-2">
              <ShieldCheck className="w-4.5 h-4.5 text-red-500" />
              <span>Identity Rotation & Security</span>
            </h4>

            <div className="flex justify-between items-center bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Administrative Security PIN Code</span>
                <p className="text-[10px] text-slate-400">Current Login Auth: <strong className="font-mono text-indigo-750">sunny.diploma033@gmail.com</strong></p>
              </div>

              {!showPasswordFields ? (
                <button 
                  onClick={() => setShowPasswordFields(true)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3.5 rounded-lg text-xs font-bold transition"
                >
                  Rotate Key Password
                </button>
              ) : (
                <button 
                  onClick={() => setShowPasswordFields(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold underline"
                >
                  Cancel
                </button>
              )}
            </div>

            {showPasswordFields && (
              <form onSubmit={handlePasswordChange} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3 animate-slideDown">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 block font-mono">CURRENT PASSCODE</span>
                    <input 
                      type="text"
                      value={currentPassword}
                      className="w-full bg-slate-200 border border-slate-300 text-slate-500 font-mono rounded-lg py-1.5 px-3 text-xs select-none outline-none"
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 block font-mono">SPECIFY ROTATING SECURE PASSWORD</span>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Type letters & numbers..."
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs outline-none font-bold text-slate-900 focus:ring-1 focus:ring-indigo-605"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="bg-indigo-650 text-white font-bold py-1.5 px-4 rounded-lg text-xs hover:bg-indigo-700 inline-flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Keys</span>
                </button>
              </form>
            )}

            <label className="flex items-center justify-between text-xs cursor-pointer p-1">
              <div>
                <span className="font-bold text-slate-800 block">Enforce Biometric/2-Factor Client Authorization</span>
                <span className="text-[9.5px] text-slate-400 font-medium">Verify OTP pin on checkin actions logs</span>
              </div>
              <input 
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-505"
              />
            </label>
          </div>

        </div>

        {/* Column 2 - Sidebar diagnostics & Logs */}
        <div className="lg:col-span-4 space-y-6">

          {/* Section: Simulated Logins History */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center justify-between font-mono">
              <span>Login History</span>
              <UserCheck className="w-4 h-4 text-indigo-500" />
            </h3>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
              {mockLoginHistories.map(lh => (
                <div key={lh.id} className="p-2.5 border-b border-slate-100 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-800">
                    <span className="truncate max-w-[150px]">{lh.user}</span>
                    <span className="text-emerald-600 font-mono">{lh.outcome}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-light truncate">{lh.device} &middot; {lh.location}</span>
                  <span className="text-[8.5px] text-slate-400 font-mono tracking-normal">{lh.timestamp}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-3 rounded-2xl text-[10px] font-medium leading-relaxed">
              👍 <strong>Compliance Verified</strong>: All recent admin sessions validated under regional security certificates.
            </div>
          </div>

        </div>

      </div>

      {/* CUSTOM OVERLAYS FOR SETTINGS */}
      {settingsAlert && (
        <div id="settings-alert-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border text-center text-slate-800 animate-fadeIn">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ℹ️
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-950">Settings Service Alert</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{settingsAlert}</p>
            </div>
            <button 
              onClick={() => setSettingsAlert(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition"
            >
              Acknowledge & Sync
            </button>
          </div>
        </div>
      )}

      {settingsConfirmReset && (
        <div id="settings-reset-confirm-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl border text-center text-slate-800 animate-fadeIn font-display">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🔄
            </div>
            <div className="space-y-1.5 font-sans">
              <h4 className="font-extrabold text-sm text-slate-950">Reset Configuration?</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to reset all custom company profile settings and tax rules back to the original PG corporate defaults?
              </p>
            </div>
            <div className="flex gap-2.5 font-sans">
              <button 
                onClick={() => setSettingsConfirmReset(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-2.5 rounded-xl uppercase text-[10px] transition"
              >
                Keep Settings
              </button>
              <button 
                onClick={executeResetSettings}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition shadow-md"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
