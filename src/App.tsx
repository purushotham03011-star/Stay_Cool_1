import React, { useState, useEffect } from 'react';
import { initializeSeedData, getLocalStorageData, setLocalStorageData, syncAllFromBackend } from './mockData';
import { AuditLog, Property } from './types';
import CustomerApp from './pages/CustomerApp';
import AdminPanel from './pages/AdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import AdminSignupWizard from './components/AdminSignupWizard';
import LandingPromo from './components/LandingPromo';
import { IonApp, IonPage, IonContent } from '@ionic/react';

// Import portal icon images
import customerPortalImg from './assets/customer_portal.png';
import adminPortalImg from './assets/admin_portal.png';
import superAdminImg from './assets/super_admin.png';

import { 
  Building2, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Info,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mail
} from 'lucide-react';

const SUPER_ADMINS = [
  { name: 'Sunny', email: 'sunny.diploma033@gmail.com', password: 'super123' },
  { name: 'Rohan Verma', email: 'rohan.director@stayhub.co', password: 'super123' },
  { name: 'HQ General Control', email: 'hq@stayhub.co', password: 'super123' },
  { name: 'Athinz Super Admin', email: 'nsn@athinz.com', password: 'aTzdemo' }
];

const KATAKANA_LIST = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ".split("");

const MatrixRain: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const chars = (katakana + alphabet).split("");

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize) + 1;

    const drops = Array.from({ length: columns }, () => ({
      y: Math.random() * -100,
      speed: 0.08 + Math.random() * 0.22,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'bold ' + fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        const x = i * fontSize;
        const y = Math.floor(drop.y) * fontSize;

        if (y >= 0 && y <= canvas.height) {
          const isPink = i % 4 === 0;
          const isHead = Math.random() > 0.96;

          if (isHead) {
            ctx.fillStyle = '#0f172a';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#0f172a';
          } else if (isPink) {
            ctx.fillStyle = '#db2777';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#db2777';
          } else {
            ctx.fillStyle = '#0891b2';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#0891b2';
          }

          ctx.fillText(text, x, y);
          ctx.shadowBlur = 0;
        }

        drop.y += drop.speed;

        if (y > canvas.height && Math.random() > 0.98) {
          drop.y = -10;
          drop.speed = 0.08 + Math.random() * 0.22;
        }
      }
    };

    const interval = setInterval(draw, 45);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: '#ffffff' }}
    />
  );
};

export default function App() {
  // Switchable top-level roles/portals
  // 'customer' | 'admin' | 'superadmin'
  const [activePortal, setActivePortal] = useState<'customer' | 'admin' | 'superadmin' | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [customerInitialView, setCustomerInitialView] = useState<'login' | 'register' | null>(null);

  // Active Admin Session State
  const [adminSession, setAdminSession] = useState<{ name: string; email: string; phone: string; propertyId: string } | null>(null);
  const [isAdminWizardOpen, setIsAdminWizardOpen] = useState<boolean>(false);
  
  // Login input fields for existing Admin
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Active Super Admin Session State
  const [superAdminSession, setSuperAdminSession] = useState<{ name: string; email: string } | null>(null);
  const [superLoginEmail, setSuperLoginEmail] = useState('');
  const [superLoginPassword, setSuperLoginPassword] = useState('');
  const [superLoginError, setSuperLoginError] = useState('');

  // Shared security/activity logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Simulator View Settings for the Customer companion app
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Initialize seed database in localStorage on load
  useEffect(() => {
    initializeSeedData();
    syncAllFromBackend().then(() => {
      setAuditLogs(getLocalStorageData<AuditLog[]>('audit_logs', []));
    });

    // Load active admin session from previous signups
    const savedSession = getLocalStorageData<{ name: string; email: string; phone: string; propertyId: string } | null>('active_admin_session', null);
    if (savedSession) {
      setAdminSession(savedSession);
    }

    // Load active super admin session from localStorage
    const savedSuperSession = getLocalStorageData<{ name: string; email: string } | null>('active_super_admin_session', null);
    if (savedSuperSession) {
      setSuperAdminSession(savedSuperSession);
    }
  }, []);

  // Central audit logger function passed down to subportals
  const handleAddAuditLog = (action: string, module: AuditLog['module']) => {
    const currentLogs = getLocalStorageData<AuditLog[]>('audit_logs', []);
    
    let activeUserEmail = 'guest@stayhub.co';
    if (activePortal === 'customer') {
      const loggedInCust = getLocalStorageData<{ email: string } | null>('logged_in_customer', null);
      activeUserEmail = loggedInCust ? loggedInCust.email : 'customer@stayhub.co';
    } else if (activePortal === 'admin') {
      activeUserEmail = adminSession ? adminSession.email : 'manager_hsr@homelystays.com';
    } else if (activePortal === 'superadmin') {
      activeUserEmail = superAdminSession ? superAdminSession.email : 'sunny.diploma033@gmail.com';
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userEmail: activeUserEmail,
      role: activePortal === 'customer' ? 'Customer' : activePortal === 'admin' ? 'Admin' : 'Super Admin',
      action,
      module,
      timestamp: new Date().toISOString(),
      ip: '192.168.4.15'
    };
    
    const updated = [newLog, ...currentLogs];
    setAuditLogs(updated);
    setLocalStorageData('audit_logs', updated);
  };

  const handleResetStorage = () => {
    if (confirm('Wipe and reset state? This resets properties, rooms, active tenants, and invoice logs back to pristine seed defaults.')) {
      localStorage.removeItem('hotel_pg_initialized');
      localStorage.removeItem('hotel_pg_organizations');
      localStorage.removeItem('hotel_pg_properties');
      localStorage.removeItem('hotel_pg_rooms');
      localStorage.removeItem('hotel_pg_beds');
      localStorage.removeItem('hotel_pg_tenants');
      localStorage.removeItem('hotel_pg_bookings');
      localStorage.removeItem('hotel_pg_invoices');
      localStorage.removeItem('hotel_pg_housekeeping');
      localStorage.removeItem('hotel_pg_food_menu');
      localStorage.removeItem('hotel_pg_visitors');
      localStorage.removeItem('hotel_pg_audit_logs');
      localStorage.removeItem('hotel_pg_notifications');
      localStorage.removeItem('hotel_pg_logged_in_customer');
      localStorage.removeItem('hotel_pg_active_admin_session');
      localStorage.removeItem('hotel_pg_active_super_admin_session');
      
      initializeSeedData();
      setAuditLogs(getLocalStorageData<AuditLog[]>('audit_logs', []));
      
      // Force reload page to apply fresh state
      window.location.reload();
    }
  };

  return (
    <IonApp>
      <IonPage>
        <IonContent 
          scrollY={true} 
          style={activePortal === 'superadmin' && !superAdminSession ? { '--background': 'transparent' } as React.CSSProperties : undefined}
        >
          <div className={`min-h-screen ${
            activePortal === null 
              ? 'bg-[#fcd2e2]' 
              : activePortal === 'superadmin' && !superAdminSession
                ? 'bg-[#ffffff]'
                : 'bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/40'
          } text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden ${activePortal === 'customer' || activePortal === null ? '' : 'pb-3'}`}>
            
            {/* JP Matrix background for Super Admin login */}
            {activePortal === 'superadmin' && !superAdminSession && (
              <MatrixRain />
            )}
      
      {/* Primary Context Workspace with dynamic layout frames */}
      <main className={`flex-1 bg-transparent relative z-10 ${activePortal || activePortal === null ? 'p-0 m-0' : 'p-2 sm:p-6'} flex flex-col justify-center`}>
        
        {/* LANDING SYSTEM PORTAL SELECTION PANEL */}
        {activePortal === null && (
          <LandingPromo 
            onSelectPortal={(portal, initialView) => {
              setActivePortal(portal);
              if (portal === 'customer') {
                setCustomerInitialView(initialView || null);
                handleAddAuditLog('Switched active viewport context to Customer App', 'Bookings');
              } else if (portal === 'admin') {
                handleAddAuditLog('Switched active viewport context to Property Admin Panel', 'Rooms');
              } else {
                handleAddAuditLog('Switched active viewport context to Super Corporate Admin center', 'SuperAdmin');
              }
            }}
            onSearchSubmit={(query) => {
              setInitialSearchQuery(query);
              setActivePortal('customer');
              handleAddAuditLog(`Switched active viewport context to Customer App with query: ${query}`, 'Bookings');
            }}
            onResetStorage={handleResetStorage}
            customerPortalImg={customerPortalImg}
            adminPortalImg={adminPortalImg}
            superAdminImg={superAdminImg}
          />
        )}

        {/* Isolated Customer App View */}
        {activePortal === 'customer' && (
          <div className="w-full">
            <CustomerApp 
              initialSearchQuery={initialSearchQuery}
              initialAuthView={customerInitialView}
              onAddAuditLog={handleAddAuditLog} 
              onLogout={() => {
                setActivePortal(null);
                setInitialSearchQuery('');
                setCustomerInitialView(null);
              }}
            />
          </div>
        )}

        {/* Isolated Full Desktop Property Admin Dashboard */}
        {activePortal === 'admin' && (
          <div id="admin-outer-root" className="w-full">
            {adminSession ? (
              <div id="admin-portal-root" className="w-full min-h-screen bg-white text-slate-800">
                <AdminPanel 
                  propertyId={adminSession.propertyId}
                  onAddAuditLog={handleAddAuditLog} 
                  onLogoutAdmin={() => {
                    setAdminSession(null);
                    localStorage.removeItem('hotel_pg_active_admin_session');
                    handleAddAuditLog('Administrator signed out of core session', 'SuperAdmin');
                    setActivePortal(null);
                  }} 
                />
              </div>
            ) : (
              <div className="w-full min-h-screen relative flex items-center justify-center p-4 bg-[#f8fafc]">
                {/* Radar background */}
                <div className="radar-pattern absolute inset-0 z-0">
                  <div className="radar-center"></div>
                </div>

                {/* Transparent Card Replaced with 2nd Card Style */}
                <div className="hq-security-login-card w-full max-w-md p-8 shadow-2xl space-y-6 animate-scale-up relative overflow-hidden z-10">
                  <p className="heading">Operator Verification</p>
                  <p className="sub-text">Access registered co-living rooms, occupancy grids, and collect rental payments.</p>

                  {adminLoginError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10.5px] font-semibold text-rose-700 relative z-10">
                      {adminLoginError}
                    </div>
                  )}

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setAdminLoginError('');
                    
                    if (!adminLoginEmail || !adminLoginPassword) {
                      setAdminLoginError('Kindly enter operating security email and password PIN.');
                      return;
                    }

                    const registeredProps = getLocalStorageData<Property[]>('properties', []);
                    let matchedProp = registeredProps.find(
                      p => p.adminEmail?.toLowerCase() === adminLoginEmail.toLowerCase() && p.adminPassword === adminLoginPassword
                    );

                    // Backward compatibility for legacy demo logins
                    if (!matchedProp && adminLoginEmail.toLowerCase() === 'manager_hsr@homelystays.com' && adminLoginPassword === 'admin123') {
                      matchedProp = registeredProps.find(p => p.id === 'prop-1');
                    }

                    if (matchedProp) {
                      const deactivatedPropIds = getLocalStorageData<string[]>('deactivated_properties', []);
                      const isSuspended = deactivatedPropIds.includes(matchedProp.id) || matchedProp.status === 'Suspended';
                      if (isSuspended) {
                        setAdminLoginError('This administrator account has been suspended. Please contact corporate HQ.');
                        return;
                      }
                      const sessionObj = {
                        name: matchedProp.adminName || 'Regional Host Manager',
                        email: matchedProp.adminEmail || adminLoginEmail,
                        phone: matchedProp.adminPhone || '+91 99000 12345',
                        propertyId: matchedProp.id,
                        adminId: matchedProp.adminId || `admin-${matchedProp.id.split('-')[1]}`
                      };
                      setLocalStorageData('active_admin_session', sessionObj);
                      setAdminSession(sessionObj);
                      handleAddAuditLog(`Administrator session verified for property ${matchedProp.name}: ${adminLoginEmail}`, 'SuperAdmin');
                    } else {
                      setAdminLoginError('Invalid email address or access PIN password combination.');
                    }
                  }} className="space-y-4 font-sans text-slate-800 relative z-10">
                    
                    <div className="hq-input-container">
                      <Mail className="hq-input-icon w-4 h-4 text-slate-600" />
                      <input 
                        type="email"
                        value={adminLoginEmail}
                        onChange={(e) => setAdminLoginEmail(e.target.value)}
                        placeholder="Email Username"
                        className="hq-input-field"
                        required
                      />
                    </div>

                    <div className="hq-input-container">
                      <Lock className="hq-input-icon w-4 h-4 text-slate-600" />
                      <input 
                        type="password"
                        value={adminLoginPassword}
                        onChange={(e) => setAdminLoginPassword(e.target.value)}
                        placeholder="Access PIN / Password"
                        className="hq-input-field"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="hq-submit-btn-purple"
                    >
                      Submit
                    </button>

                    <div className="text-center pt-1">
                      <button 
                        type="button"
                        onClick={() => setActivePortal(null)}
                        className="hq-forgot-link"
                      >
                        ← Back to System Portal Selection
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-150 text-center space-y-3 relative z-10">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">First-Time Host Onboarding</span>
                      
                      <button 
                        type="button" 
                        onClick={() => setIsAdminWizardOpen(true)}
                        className="w-full bg-transparent hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-bold py-2.5 rounded-xl text-xs transition tracking-wide flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Register New Admin & Property Setup</span>
                      </button>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Onboard regional assets inside India, configure physical floors, adjust room numbers, and set tiered daily or seasonal pricing.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Isolated Enterprise Super Admin Panel */}
        {activePortal === 'superadmin' && (
          <div id="superadmin-portal-root" className="w-full flex-1 flex flex-col">
            {superAdminSession ? (
              <div className="w-full min-h-screen bg-slate-50 text-slate-900">
                <SuperAdminPanel 
                  auditLogs={auditLogs} 
                  onAddAuditLog={handleAddAuditLog} 
                  onLogout={() => {
                    handleAddAuditLog('Super Administrator signed out of core session', 'SuperAdmin');
                    setSuperAdminSession(null);
                    localStorage.removeItem('hotel_pg_active_super_admin_session');
                    setActivePortal(null);
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center p-4 z-10 relative">
                {/* Floating Back Button in the top right corner (Static) */}
                <button 
                  type="button"
                  onClick={() => setActivePortal(null)}
                  className="hq-static-blue-btn hq-back-btn-static"
                >
                  ← Back to Selection
                </button>

                {/* Login card container (Purple login theme) */}
                <div 
                  className="hq-security-login-card w-full max-w-md p-8 shadow-2xl space-y-6 animate-scale-up relative overflow-hidden"
                >
                  <p className="heading">HQ Security Check</p>
                  <p className="sub-text">Access organization setup, property scopes, audit logs, and global parameters.</p>

                  {superLoginError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10.5px] font-semibold text-rose-600 relative z-10">
                      {superLoginError}
                    </div>
                  )}

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setSuperLoginError('');
                    
                    if (!superLoginEmail || !superLoginPassword) {
                      setSuperLoginError('Kindly enter corporate security email and password PIN.');
                      return;
                    }

                    const matchedSuper = SUPER_ADMINS.find(
                      s => s.email.toLowerCase() === superLoginEmail.toLowerCase() && s.password === superLoginPassword
                    );

                    if (matchedSuper) {
                      const sessionObj = {
                        name: matchedSuper.name,
                        email: matchedSuper.email
                      };
                      setLocalStorageData('active_super_admin_session', sessionObj);
                      setSuperAdminSession(sessionObj);
                      handleAddAuditLog(`Super Administrator session verified: ${superLoginEmail}`, 'SuperAdmin');
                    } else {
                      setSuperLoginError('Invalid corporate email address or access PIN password.');
                    }
                  }} className="space-y-4 font-sans text-slate-800 relative z-10">
                    
                    <div className="hq-input-container">
                      <Mail className="hq-input-icon w-4 h-4 text-slate-600" />
                      <input 
                        type="email"
                        value={superLoginEmail}
                        onChange={(e) => setSuperLoginEmail(e.target.value)}
                        placeholder="Corporate Email"
                        className="hq-input-field"
                        required
                      />
                    </div>

                    <div className="hq-input-container">
                      <Lock className="hq-input-icon w-4 h-4 text-slate-600" />
                      <input 
                        type="password"
                        value={superLoginPassword}
                        onChange={(e) => setSuperLoginPassword(e.target.value)}
                        placeholder="Access PIN"
                        className="hq-input-field"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="hq-submit-btn-purple"
                    >
                      Submit
                    </button>

                    <div className="text-center pt-2">
                      <button 
                        type="button" 
                        onClick={() => setActivePortal(null)}
                        className="hq-forgot-link"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </main>



      {isAdminWizardOpen && (
        <AdminSignupWizard 
          onClose={() => setIsAdminWizardOpen(false)}
          onSignupSuccess={(sessionData) => {
            setAdminSession(sessionData);
            setIsAdminWizardOpen(false);
            handleAddAuditLog(`New Admin Onboarded successfully: ${sessionData.name} - ${sessionData.phone}`, 'SuperAdmin');
          }}
        />
      )}
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}
