import React, { useState, useEffect } from 'react';
import { 
  Property, 
  Room, 
  Bed, 
  Tenant, 
  Booking, 
  Invoice, 
  HousekeepingTask, 
  FoodMenuDay, 
  VisitorRecord,
  AuditLog,
  Staff,
  QueryMessage
} from '../types';
import { 
  getLocalStorageData, 
  setLocalStorageData,
  syncAllFromBackend
} from '../mockData';
import { 
  LayoutGrid, 
  Bed as BedIcon, 
  Users, 
  CreditCard, 
  CheckSquare, 
  Utensils, 
  Activity, 
  PieChart, 
  MapPin,
  Sparkles,
  Wrench,
  Wand2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Settings,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Menu,
  Moon,
  Sun,
  Clock,
  Percent,
  MessageSquare,
  Send
} from 'lucide-react';

// Subtab component import declarations
import DashboardView from '../components/admin/DashboardView';
import RoomsView from '../components/admin/RoomsView';
import TenantsView from '../components/admin/TenantsView';
import StaffView from '../components/admin/StaffView';
import BillingView from '../components/admin/BillingView';
import HousekeepingView from '../components/admin/HousekeepingView';
import FoodView from '../components/admin/FoodView';
import VisitorsView from '../components/admin/VisitorsView';
import ReportsView from '../components/admin/ReportsView';
import SettingsView from '../components/admin/SettingsView';
import BookingQueueView from '../components/admin/BookingQueueView';
import CampaignsView from '../components/admin/CampaignsView';

interface AdminPanelProps {
  propertyId?: string;
  onAddAuditLog: (action: string, module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor') => void;
  onLogoutAdmin?: () => void;
}

export default function AdminPanel({ propertyId, onAddAuditLog, onLogoutAdmin }: AdminPanelProps) {
  // Database states
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [foodMenu, setFoodMenu] = useState<FoodMenuDay[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Toggle states
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(false);

  // Selected property
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || 'prop-1');

  // Subtab navigation switcher: 
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'user_management' | 'property_management' | 'booking_management' | 'billing_management' | 'dining' | 'campaigns' | 'reports' | 'settings' | 'corporate_chat'>('dashboard');

  // Sub-navigation triggers inside the combined parent tabs
  const [userTab, setUserTab] = useState<'tenants' | 'staff'>('tenants');
  const [propertyTab, setPropertyTab] = useState<'rooms' | 'housekeeping'>('rooms');
  const [bookingTab, setBookingTab] = useState<'reservations' | 'visitors'>('reservations');

  // Load database structures on boot
  const reloadAdminData = () => {
    setProperties(getLocalStorageData<Property[]>('properties', []));
    setRooms(getLocalStorageData<Room[]>('rooms', []));
    setBeds(getLocalStorageData<Bed[]>('beds', []));
    setTenants(getLocalStorageData<Tenant[]>('tenants', []));
    setBookings(getLocalStorageData<Booking[]>('bookings', []));
    setInvoices(getLocalStorageData<Invoice[]>('invoices', []));
    setHousekeeping(getLocalStorageData<HousekeepingTask[]>('housekeeping', []));
    setFoodMenu(getLocalStorageData<FoodMenuDay[]>('food_menu', []));
    setVisitors(getLocalStorageData<VisitorRecord[]>('visitors', []));
    setAuditLogs(getLocalStorageData<AuditLog[]>('audit_logs', []));
    setStaff(getLocalStorageData<Staff[]>('staff', []));
  };

  useEffect(() => {
    syncAllFromBackend().then(reloadAdminData);

    // Reactively reload when tenants or bookings are updated from customer portal
    const handleDataUpdate = (e: Event) => {
      const { key } = (e as CustomEvent).detail || {};
      if (['tenants', 'bookings', 'invoices', 'rooms', 'beds', 'staff', 'housekeeping'].includes(key)) {
        reloadAdminData();
      }
    };
    window.addEventListener('stayhub-data-updated', handleDataUpdate);

    const pollInterval = setInterval(() => {
      syncAllFromBackend().then(reloadAdminData);
    }, 5000);

    return () => {
      window.removeEventListener('stayhub-data-updated', handleDataUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  useEffect(() => {
    const checkUnreadReplies = () => {
      const queries = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);
      const unreadCount = queries.filter(q => q.type === 'admin' && q.propertyId === selectedPropertyId && q.status === 'replied').length;
      setUnreadChatCount(unreadCount);
    };

    checkUnreadReplies();
    const interval = setInterval(checkUnreadReplies, 3000);
    return () => clearInterval(interval);
  }, [selectedPropertyId]);

  // Sync selectedPropertyId if propertyId prop updates
  useEffect(() => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
  }, [propertyId]);

  // Shared synchronize functions mapping back to localStorage persisted DB
  const syncRoomsAndBeds = (updatedRooms: Room[], updatedBeds: Bed[]) => {
    setRooms(updatedRooms);
    setBeds(updatedBeds);
    setLocalStorageData('rooms', updatedRooms);
    setLocalStorageData('beds', updatedBeds);
  };

  const syncTenants = (updatedTenants: Tenant[]) => {
    setTenants(updatedTenants);
    setLocalStorageData('tenants', updatedTenants);
  };

  const syncStaff = (updatedStaff: Staff[]) => {
    setStaff(updatedStaff);
    setLocalStorageData('staff', updatedStaff);
  };

  const syncInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    setLocalStorageData('invoices', updatedInvoices);
  };

  const syncHousekeeping = (updatedHk: HousekeepingTask[]) => {
    setHousekeeping(updatedHk);
    setLocalStorageData('housekeeping', updatedHk);
  };

  const syncVisitorRecords = (updatedVisitors: VisitorRecord[]) => {
    setVisitors(updatedVisitors);
    setLocalStorageData('visitors', updatedVisitors);
  };

  const syncFoodMenu = (updatedMenu: FoodMenuDay[]) => {
    setFoodMenu(updatedMenu);
    setLocalStorageData('food_menu', updatedMenu);
  };

  const syncProperties = (updatedProperties: Property[]) => {
    setProperties(updatedProperties);
    setLocalStorageData('properties', updatedProperties);
  };

  const currentPropertyObj = properties.find(p => p.id === selectedPropertyId);

  return (
    <div id="operator-admin-interface" className={`grid grid-cols-1 md:grid-cols-12 min-h-[640px] font-sans transition-colors duration-200 super-hq-peach-theme ${isDarkMode ? 'dark bg-[#0f111a] text-slate-200' : 'bg-white text-slate-900'}`}>
      
      {/* PERSISTENT COLLAPSIBLE SIDEBAR NAVIGATION PANEL */}
      <aside className={`no-uiverse transition-all duration-300 flex flex-col justify-between border-r ${
        isSidebarExpanded ? 'md:col-span-3 p-5' : 'md:col-span-1 p-3.5 items-center'
      } ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="space-y-4 w-full">
          
          {/* Header Organization Brand Title & Collapse Toggle */}
          <div className="flex items-center justify-between gap-2">
            {isSidebarExpanded ? (
              <div className={`flex items-center justify-between shadow-xs p-3.5 rounded-2xl w-full select-none border relative ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <div className="flex items-center space-x-2.5">
                  <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white p-2 rounded-xl font-display font-black text-[12px] tracking-wider shadow-sm">
                    HS
                  </div>
                  <div>
                    <h2 className={`text-xs font-black font-display tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>StayHub HQ</h2>
                    <span className={`text-[9px] font-mono font-bold block mt-0.5 ${isDarkMode ? 'text-cyan-400' : 'text-indigo-650'}`}>ADMIN CORE NODE</span>
                  </div>
                </div>

                <div className="block md:hidden absolute right-4 top-2.5 z-50">
                  <label className="folder-card">
                    <input 
                      type="checkbox" 
                      className="folder-toggle" 
                      checked={isFolderOpen}
                      onChange={(e) => setIsFolderOpen(e.target.checked)}
                    />

                    <div className="hint-wrapper">
                      <span className="hint-text">Click to open</span>
                      <svg
                        className="hint-arrow"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M 35 5 C 35 5, 15 5, 10 25 M 10 25 L 3 18 M 10 25 L 18 22"
                          stroke="#60a5fa"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>

                    <div className="folder-container">
                      <svg className="folder-back" viewBox="0 0 50 40" fill="none">
                        <path
                          d="M0 4C0 1.79086 1.79086 0 4 0H16.524C17.721 0 18.8415 0.54051 19.574 1.4673L22.426 5.0654C23.1585 5.99219 24.279 6.5327 25.476 6.5327H46C48.2091 6.5327 50 8.32356 50 10.5327V36C50 38.2091 48.2091 40 46 40H4C1.79086 40 0 38.2091 0 36V4Z"
                          fill="#0056b3"
                        ></path>
                      </svg>

                      <div className="file file-5" onClick={() => { setIsFolderOpen(false); localStorage.removeItem('adminToken'); window.location.reload(); }}>
                        <div className="shine"></div>
                        <ArrowLeft className="file-icon text-white" />
                        <div className="file-text">Sign Out</div>
                        <div className="file-tag">LOGOUT</div>
                      </div>

                      <div className="file file-4" onClick={() => { setIsFolderOpen(false); setIsDarkMode(!isDarkMode); }}>
                        <div className="shine"></div>
                        {isDarkMode ? <Sun className="file-icon text-white" /> : <Moon className="file-icon text-white" />}
                        <div className="file-text">{isDarkMode ? 'Daylight Mode' : 'Dark Mode'}</div>
                        <div className="file-tag">THEME</div>
                      </div>

                      <div className="file file-3" onClick={() => { setActiveSubTab('booking_management'); setIsFolderOpen(false); }}>
                        <div className="shine"></div>
                        <Clock className="file-icon text-white" />
                        <div className="file-text">Bookings</div>
                        <div className="file-tag">RESERVE</div>
                      </div>

                      <div className="file file-2" onClick={() => { setActiveSubTab('property_management'); setIsFolderOpen(false); }}>
                        <div className="shine"></div>
                        <BedIcon className="file-icon text-white" />
                        <div className="file-text">Property</div>
                        <div className="file-tag">STAYS</div>
                      </div>

                      <div className="file file-1" onClick={() => { setActiveSubTab('dashboard'); setIsFolderOpen(false); }}>
                        <div className="shine"></div>
                        <LayoutGrid className="file-icon text-white" />
                        <div className="file-text">Dashboard</div>
                        <div className="file-tag">STATS</div>
                      </div>

                      <div className="folder-front-wrapper">
                        <svg className="folder-front" viewBox="0 0 50 34" fill="none">
                          <path
                            d="M0 4C0 1.79086 1.79086 0 4 0H46C48.2091 0 50 1.79086 50 4V30C50 32.2091 48.2091 34 46 34H4C1.79086 34 0 32.2091 0 30V4Z"
                            fill="rgba(0, 123, 255, 0.65)"
                          ></path>
                        </svg>
                        <div className="folder-label"></div>
                        <div className="counter">
                          <div className="status-dot"></div>
                          <span className="counter-label">MENU</span>
                          <span className="counter-number">10</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Transparent dropdown card menu */}
                  {isFolderOpen && (
                    <div className="absolute right-0 top-[52px] w-64 max-w-sm overflow-hidden z-50 bg-white dark:bg-black p-4 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800 space-y-1 before:w-24 before:h-24 before:absolute before:bg-purple-500/40 before:rounded-full before:-z-10 before:blur-2xl before:top-0 before:left-0 after:w-32 after:h-32 after:absolute after:bg-sky-400/40 after:rounded-full after:-z-10 after:blur-xl after:bottom-0 after:-right-12">
                      <button
                        onClick={() => { setActiveSubTab('dashboard'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'dashboard' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>1. Dashboard</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('user_management'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'user_management' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Users className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>2. User Management</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('property_management'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'property_management' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <BedIcon className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>3. Property Management</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('booking_management'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'booking_management' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Clock className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>4. Booking Management</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('billing_management'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'billing_management' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>5. Billing Management</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('dining'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'dining' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Utensils className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>6. Canteen & Meals</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('campaigns'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'campaigns' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Percent className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>7. Discounts & Campaigns</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('reports'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'reports' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <PieChart className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>8. Reports</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('settings'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'settings' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>9. System Settings</span>
                      </button>

                      <button
                        onClick={() => { setActiveSubTab('corporate_chat'); setIsFolderOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                          activeSubTab === 'corporate_chat' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                        <span>10. HQ Corporate Chat</span>
                      </button>

                      {/* Integrated Daylight Switch */}
                      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-150/40 dark:border-slate-800 mt-1.5 pt-2 relative z-10">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daylight Mode</span>
                        <div className="scale-[0.7] origin-right">
                          <label className="togglesw-premium" title="Change daylight/dark mode">
                            <input className="togglesw-input" type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                            <div className="togglesw-indicator left"></div>
                            <div className="togglesw-indicator right"></div>
                            <div className="togglesw-btn"></div>
                          </label>
                        </div>
                      </div>

                      {/* Integrated Sign Out Button */}
                      <button
                        onClick={() => { setIsFolderOpen(false); localStorage.removeItem('adminToken'); window.location.reload(); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 relative z-10"
                      >
                        <ArrowLeft className="w-4 h-4 text-rose-500" />
                        <span>Sign Out Profile</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full pb-1">
                <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white p-2.5 rounded-xl font-display font-black text-[12px] tracking-wider shadow-sm">
                  HS
                </div>
              </div>
            )}

            {/* Collapse Control Desktop */}
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="hidden md:flex p-1.5 rounded-lg border hover:bg-slate-200/60 transition text-slate-400 dark:border-slate-850 dark:hover:bg-slate-800"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="hidden md:block h-[1px] bg-slate-200 dark:bg-slate-800 w-full my-1" />

          {/* Dynamic Nav Tabs */}
          <nav className="hidden md:flex md:flex-col md:space-y-1 text-xs font-semibold scrollbar-none w-full">
            
            {/* Category separator A: MAIN ANALYTICS */}
            {isSidebarExpanded && (
              <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-widest pl-3 pt-3.5 pb-1 block">Main Overview</span>
            )}

            <button 
              onClick={() => setActiveSubTab('dashboard')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
               } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Welcome & KPI Stats Dashboard"
            >
              <LayoutGrid className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Dashboard</span>}
            </button>

            {/* Category separator B: OPERATIONAL CHANNELS */}
            {isSidebarExpanded && (
              <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-widest pl-3 pt-2.5 pb-1 block">Management Matrix</span>
            )}

            <button 
              onClick={() => setActiveSubTab('user_management')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'user_management' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="User Management"
            >
              <Users className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>User Management</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('property_management')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'property_management' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Property Management"
            >
              <Wand2 className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Property Management</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('booking_management')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'booking_management' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Booking Management"
            >
              <Clock className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Booking Management</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('billing_management')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'billing_management' 
                  ? 'bg-indigo-50 text-indigo-755 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Billing Management"
            >
              <CreditCard className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Billing Management</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('dining')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'dining' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Canteen and Meals"
            >
              <Utensils className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Canteen and Meals</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('reports')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'reports' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Reports"
            >
              <PieChart className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Reports</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('campaigns')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'campaigns' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="Discounts & Campaigns"
            >
              <Percent className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>Discounts & Campaigns</span>}
            </button>

            {/* Category separator C: SYSTEM SETUP */}
            {isSidebarExpanded && (
              <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-widest pl-3 pt-2.5 pb-1 block">Policies & Setup</span>
            )}

            <button 
              onClick={() => setActiveSubTab('settings')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 ${
                activeSubTab === 'settings' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="System Settings"
            >
              <Settings className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>System Settings</span>}
            </button>

            <button 
              onClick={() => setActiveSubTab('corporate_chat')} 
              className={`no-uiverse flex items-center px-3.5 py-3 rounded-xl transition gap-3 justify-start shrink-0 relative ${
                activeSubTab === 'corporate_chat' 
                  ? 'bg-indigo-50 text-indigo-750 font-bold border-l-2 border-indigo-600 dark:bg-slate-850 dark:text-cyan-400' 
                  : 'text-slate-550 hover:bg-slate-200/50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${!isSidebarExpanded ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
              title="HQ Corporate Chat"
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-indigo-600 dark:text-cyan-500" />
              {isSidebarExpanded && <span>HQ Corporate Chat</span>}
              {unreadChatCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

          </nav>
          
          {/* Dark Mode toggle & Sign Out Area */}
          <div className="hidden md:block pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 shrink-0 space-y-2">
            
            <div
              className={`w-full border text-[10.5px] font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-5xs ${isDarkMode ? 'bg-[#161925] border-[#222638] text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0055ff]" />
              {isSidebarExpanded && <span>Operator Node Secure</span>}
            </div>

            {onLogoutAdmin && (
              <button
                onClick={onLogoutAdmin}
                className="hidden md:flex w-full bg-slate-200/80 hover:bg-rose-50 text-slate-700 hover:text-rose-750 text-[11px] font-bold py-2.5 rounded-xl transition items-center justify-center space-x-1.5 border border-slate-350/20 shadow-xs cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/20"
              >
                {isSidebarExpanded ? <span>Sign Out Host Profile</span> : <span className="font-mono text-[9px]">OUT</span>}
              </button>
            )}

            <div className={`hidden md:flex w-full justify-center transition-all ${isSidebarExpanded ? 'py-3 scale-90' : 'py-1 scale-[0.45] -my-5'}`}>
              <label className="togglesw-premium" title="Change daylight/dark mode">
                <input className="togglesw-input" type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                <div className="togglesw-indicator left"></div>
                <div className="togglesw-indicator right"></div>
                <div className="togglesw-btn"></div>
              </label>
            </div>
            
          </div>
        </div>
      </aside>

      {/* VIEWPORT CONTROLS CONTAINER */}
      <main className={`${
        isSidebarExpanded ? 'md:col-span-9' : 'md:col-span-11'
      } p-6 space-y-6`}>
        
        {/* Universal Top Branding Real Estate Asset Header Bar */}
        {activeSubTab === 'dashboard' && (
          <div className={`p-5 rounded-3xl shadow-xs border flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-850'
          }`}>
            <div className="space-y-1">
              <span className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-150 text-indigo-750 dark:text-indigo-300 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase font-mono tracking-wider">
                {currentPropertyObj ? currentPropertyObj.type : 'PG Hostel'} Operator System
              </span>
              <h2 className="text-xl font-black font-display tracking-tight text-slate-950 dark:text-white leading-tight">
                {currentPropertyObj ? currentPropertyObj.name : 'StayHub PG Portal'}
              </h2>
              <p className="inline-flex items-center text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
                <span>{currentPropertyObj ? currentPropertyObj.address : 'Central Location'}</span>
              </p>
            </div>

            <div className="text-left sm:text-right pt-2.5 sm:pt-0 shrink-0 space-y-1">
              <span className="font-mono text-[9px] font-black uppercase text-slate-400 block tracking-wider">Real-Time Sync active</span>
              <span className="text-[10px] block">Status: <strong className="text-emerald-500 font-black uppercase inline-flex items-center gap-1">● Online & secured</strong></span>
              {currentPropertyObj && (
                <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[9px] font-black tracking-wider">
                  🏢 Prop ID: {currentPropertyObj.id}
                </span>
              )}
            </div>
          </div>
        )}

        {/* DYNAMIC VIEWS SWITCHBOARD PORTS */}
        {activeSubTab === 'dashboard' && (
          <DashboardView 
            properties={properties}
            rooms={rooms}
            beds={beds}
            tenants={tenants}
            bookings={bookings}
            invoices={invoices}
            selectedPropertyId={selectedPropertyId}
            setBookings={setBookings}
            syncRoomsAndBeds={syncRoomsAndBeds}
            syncTenants={syncTenants}
            onAddAuditLog={onAddAuditLog}
            staff={staff}
            syncStaff={syncStaff}
            syncInvoices={syncInvoices}
          />
        )}

        {/* COMBINED TAB 1: USER MANAGEMENT (PEOPLE) */}
        {activeSubTab === 'user_management' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 flex space-x-1 w-max">
              <button 
                onClick={() => setUserTab('tenants')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition ${
                  userTab === 'tenants' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Residents Directory
              </button>
              <button 
                onClick={() => setUserTab('staff')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition ${
                  userTab === 'staff' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Staffing & Tasks Allocation
              </button>
            </div>

            {userTab === 'tenants' ? (
              <TenantsView 
                properties={properties}
                rooms={rooms}
                beds={beds}
                tenants={tenants}
                invoices={invoices}
                bookings={bookings}
                syncRoomsAndBeds={syncRoomsAndBeds}
                syncTenants={syncTenants}
                selectedPropertyId={selectedPropertyId}
                onAddAuditLog={onAddAuditLog}
              />
            ) : (
              <StaffView 
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                staffList={staff}
                syncStaff={syncStaff}
                onAddAuditLog={onAddAuditLog}
              />
            )}
          </div>
        )}

        {/* COMBINED TAB 2: PROPERTY MANAGEMENT (BUILDINGS + ROOMS) */}
        {activeSubTab === 'property_management' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 flex space-x-1 w-max overflow-x-auto">
              <button 
                onClick={() => setPropertyTab('rooms')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition whitespace-nowrap ${
                  propertyTab === 'rooms' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:bg-slate-50'
                }`}
              >
                Unit Inventory
              </button>
              <button 
                onClick={() => setPropertyTab('housekeeping')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition whitespace-nowrap ${
                  propertyTab === 'housekeeping' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:bg-slate-50'
                }`}
              >
                Housekeeping Unit
              </button>
            </div>

            {propertyTab === 'rooms' && (
              <RoomsView 
                properties={properties}
                rooms={rooms}
                beds={beds}
                tenants={tenants}
                housekeeping={housekeeping}
                bookings={bookings}
                syncRoomsAndBeds={syncRoomsAndBeds}
                syncTenants={syncTenants}
                selectedPropertyId={selectedPropertyId}
                onAddAuditLog={onAddAuditLog}
              />
            )}

            {propertyTab === 'housekeeping' && (
              <HousekeepingView 
                properties={properties}
                rooms={rooms}
                housekeeping={housekeeping}
                syncHousekeeping={syncHousekeeping}
                selectedPropertyId={selectedPropertyId}
                onAddAuditLog={onAddAuditLog}
              />
            )}
          </div>
        )}

        {/* COMBINED TAB 3: BOOKING MANAGEMENT (RESERVATIONS) */}
        {activeSubTab === 'booking_management' && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 flex space-x-1 w-max">
              <button 
                onClick={() => setBookingTab('reservations')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition ${
                  bookingTab === 'reservations' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:bg-slate-50'
                }`}
              >
                Vouchers & Reservations
              </button>
              <button 
                onClick={() => setBookingTab('visitors')}
                className={`no-uiverse px-4 py-2 text-[11px] font-bold rounded-xl transition ${
                  bookingTab === 'visitors' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:bg-slate-50'
                }`}
              >
                Visitor Gate Registers
              </button>
            </div>

            {bookingTab === 'reservations' ? (
              <BookingQueueView 
                properties={properties}
                rooms={rooms}
                beds={beds}
                tenants={tenants}
                bookings={bookings}
                selectedPropertyId={selectedPropertyId}
                setBookings={setBookings}
                syncRoomsAndBeds={syncRoomsAndBeds}
                syncTenants={syncTenants}
                onAddAuditLog={onAddAuditLog}
              />
            ) : (
              <VisitorsView 
                properties={properties}
                rooms={rooms}
                tenants={tenants}
                visitorRecords={visitors}
                syncVisitorRecords={syncVisitorRecords}
                selectedPropertyId={selectedPropertyId}
                onAddAuditLog={onAddAuditLog}
              />
            )}
          </div>
        )}

        {/* COMBINED TAB 4: BILLING MANAGEMENT (MONEY) */}
        {activeSubTab === 'billing_management' && (
          <BillingView 
            properties={properties}
            rooms={rooms}
            beds={beds}
            tenants={tenants}
            invoices={invoices}
            syncInvoices={syncInvoices}
            selectedPropertyId={selectedPropertyId}
            onAddAuditLog={onAddAuditLog}
          />
        )}

        {/* COMBINED TAB 5: CANTEEN & MEALS */}
        {activeSubTab === 'dining' && (
          <FoodView 
            properties={properties}
            tenants={tenants}
            bookings={bookings}
            foodMenu={foodMenu}
            setFoodMenu={syncFoodMenu}
            selectedPropertyId={selectedPropertyId}
            onAddAuditLog={onAddAuditLog}
          />
        )}

        {/* COMBINED TAB 6: REPORTS */}
        {activeSubTab === 'reports' && (
          <ReportsView 
            properties={properties}
            rooms={rooms}
            tenants={tenants}
            invoices={invoices}
            auditLogs={auditLogs}
            selectedPropertyId={selectedPropertyId}
          />
        )}

        {/* COMBINED TAB 6.5: CAMPAIGNS & DISCOUNTS */}
        {activeSubTab === 'campaigns' && (
          <CampaignsView 
            properties={properties}
            rooms={rooms}
            beds={beds}
            selectedPropertyId={selectedPropertyId}
            syncProperties={syncProperties}
            syncRoomsAndBeds={syncRoomsAndBeds}
            onAddAuditLog={onAddAuditLog}
            isDarkMode={isDarkMode}
          />
        )}

        {/* COMBINED TAB 7: SYSTEM SETTINGS */}
        {activeSubTab === 'settings' && (
          <SettingsView 
            properties={properties}
            syncProperties={syncProperties}
            selectedPropertyId={selectedPropertyId}
            onAddAuditLog={onAddAuditLog}
            auditLogsList={auditLogs}
          />
        )}

        {/* COMBINED TAB 7.5: HQ CORPORATE CHAT */}
        {activeSubTab === 'corporate_chat' && (
          <div className="p-4 sm:p-6 space-y-6 animate-scale-up max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-bold uppercase tracking-wider block">HQ Portal Communication</span>
                <h2 className="text-xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight mt-1">Corporate HQ Chat</h2>
                <p className="text-xs text-slate-500 mt-1">Direct messaging channel between property managers and corporate Super Admin.</p>
              </div>
            </div>

            {/* Chat Area */}
            <AdminHQChat selectedPropertyId={selectedPropertyId} onAddAuditLog={onAddAuditLog} properties={properties} />
          </div>
        )}

      </main>

    </div>
  );
}

function AdminHQChat({ 
  selectedPropertyId, 
  onAddAuditLog,
  properties 
}: { 
  selectedPropertyId: string; 
  onAddAuditLog: (action: string, module: any) => void;
  properties: Property[];
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  const loadChatHistory = () => {
    const queries = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);
    const adminQueries = queries.filter(q => q.type === 'admin' && q.propertyId === selectedPropertyId);
    
    const bubbles: any[] = [];
    adminQueries.forEach(q => {
      bubbles.push({
        id: q.id,
        sender: 'Admin',
        message: q.message,
        timestamp: q.timestamp
      });
      q.replies.forEach((r, rIdx) => {
        bubbles.push({
          id: `${q.id}-reply-${rIdx}`,
          sender: 'Super Admin',
          message: r.message,
          timestamp: r.timestamp
        });
      });
    });

    bubbles.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setMessages(bubbles);
  };

  useEffect(() => {
    loadChatHistory();
    const interval = setInterval(loadChatHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedPropertyId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const queries = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);
    const currentProp = properties.find(p => p.id === selectedPropertyId);
    const propName = currentProp ? currentProp.name : 'Branch Manager';
    const propEmail = currentProp ? currentProp.adminEmail || '' : '';

    const newQuery: QueryMessage = {
      id: `query-${Date.now()}`,
      type: 'admin',
      senderName: propName,
      senderEmail: propEmail,
      message: inputText,
      timestamp: new Date().toISOString(),
      status: 'unread',
      replies: [],
      propertyId: selectedPropertyId
    };

    setLocalStorageData('stayhub_queries', [...queries, newQuery]);
    onAddAuditLog(`Sent corporate chat message to Super Admin HQ: "${inputText.substring(0, 30)}..."`, 'SuperAdmin');
    
    setInputText('');
    loadChatHistory();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-sm">
      {/* Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-350 dark:text-slate-700 animate-bounce" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-400">No message history with corporate HQ</p>
            <p className="text-xs text-slate-400 max-w-sm">Send a request, issue report, or suggestion directly to the Super Admin corporate office.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isAdmin = msg.sender === 'Admin';
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl p-3 shadow-5xs ${
                  isAdmin 
                    ? 'bg-indigo-650 text-white rounded-br-none hq-chat-bubble-right' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-bl-none hq-chat-bubble-left'
                }`}>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider opacity-60 block mb-0.5">
                    {msg.sender}
                  </span>
                  <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <span className="text-[8px] opacity-50 block mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type your message to Super Admin HQ..."
          className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs font-semibold px-4 py-2.5 rounded-2xl text-slate-850 dark:text-white outline-none focus:border-indigo-650"
        />
        <button
          type="submit"
          className="bg-indigo-650 hover:bg-indigo-700 text-white p-2.5 rounded-2xl transition duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
