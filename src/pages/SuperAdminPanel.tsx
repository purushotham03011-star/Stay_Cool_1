import React, { useState, useEffect } from 'react';
import { Organization, Property, AuditLog, Tenant, QueryMessage } from '../types';
import { 
  getLocalStorageData, 
  setLocalStorageData,
  syncAllFromBackend
} from '../mockData';
import { 
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
  Pencil,
  ArrowLeft,
  MessageSquare,
  Send,
  Sun,
  Moon
} from 'lucide-react';





interface SuperAdminPanelProps {

  auditLogs: AuditLog[];

  onAddAuditLog: (action: string, module: 'SuperAdmin') => void;

  onLogout: () => void;

}





// Custom internal data structure definitions

interface CompanyDetails {

  gstin: string;

  regNo: string;

  address: string;

  phone: string;

  revenueTarget: string;

  incorporationDate: string;

}



interface Branch {

  id: string;

  orgId: string;

  name: string;

  location: string;

  manager: string;

  contact: string;

}







interface LoginRecord {

  id: string;

  userEmail: string;

  role: string;

  timestamp: string;

  ipAddress: string;

  device: string;

  status: 'Success' | 'Failure';

}



export default function SuperAdminPanel({ auditLogs, onAddAuditLog, onLogout }: SuperAdminPanelProps) {

  // -----------------------------------------

  // CORE STORAGE STATES

  // -----------------------------------------

  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [properties, setProperties] = useState<Property[]>([]);

  

  // Selected Organization to scope details & branches

  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-1');



  // Deactivated properties tracking array

  const [deactivatedPropIds, setDeactivatedPropIds] = useState<string[]>(() => {

    return getLocalStorageData<string[]>('deactivated_properties', []);

  });



  // Switchboard navigation tracker

  // "property-setup" | "customers" | "org-setup" | "user-management" | "audit-logs"

  const [activeTab, setActiveTab ] = useState<'property-setup' | 'customers' | 'org-setup' | 'audit-logs' | 'queries-notifications'>('property-setup');

  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [selectedCustomerDetailId, setSelectedCustomerDetailId] = useState<string | null>(null);

  const [propertySearchQuery, setPropertySearchQuery] = useState('');

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const [isFolderOpen, setIsFolderOpen] = useState(false);



  // --- NEW: QUERIES & CORPORATE CHATS SYSTEM ---

  const [queriesList, setQueriesList] = useState<QueryMessage[]>([]);

  const [unreadQueriesCount, setUnreadQueriesCount] = useState<number>(0);

  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  const [queryFilter, setQueryFilter] = useState<'all' | 'customer' | 'admin'>('all');

  const [querySearch, setQuerySearch] = useState('');

  const [replyText, setReplyText] = useState('');



  useEffect(() => {

    const updateQueries = () => {

      const list = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);

      const sorted = [...list].sort((a, b) => {

        const aTime = a.replies.length > 0 ? a.replies[a.replies.length - 1].timestamp : a.timestamp;

        const bTime = b.replies.length > 0 ? b.replies[b.replies.length - 1].timestamp : b.timestamp;

        return new Date(bTime).getTime() - new Date(aTime).getTime();

      });

      setQueriesList(sorted);

      setUnreadQueriesCount(list.filter(q => q.status === 'unread').length);

    };

    

    updateQueries();

    const interval = setInterval(updateQueries, 3000);

    return () => clearInterval(interval);

  }, []);



  useEffect(() => {

    if (selectedQueryId) {

      const currentList = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);

      const match = currentList.find(q => q.id === selectedQueryId);

      if (match && match.status === 'unread') {

        const updated = currentList.map(q => {

          if (q.id === selectedQueryId) {

            return { ...q, status: 'read' as const };

          }

          return q;

        });

        setLocalStorageData('stayhub_queries', updated);

        setQueriesList(updated);

        setUnreadQueriesCount(updated.filter(q => q.status === 'unread').length);

      }

    }

  }, [selectedQueryId]);



  // Secondary nested categories for organization/property setup

  const [propertyFilter, setPropertyFilter] = useState<'All' | 'Hotel' | 'PG'>('All');

  const [userSection, setUserSection] = useState<'admins' | 'staff' | 'permissions'>('admins');

  const [logSection, setLogSection] = useState<'login-history' | 'change-logs' | 'all-timeline'>('login-history');



  // -----------------------------------------

  // COMPANY DETAILS SIMULATED CRUD

  // -----------------------------------------

  const [companyDetailsMap, setCompanyDetailsMap] = useState<Record<string, CompanyDetails>>(() => {

    return getLocalStorageData<Record<string, CompanyDetails>>('company_details_map', {

      'org-1': {

        gstin: '29AAAAA0000A1Z2',

        regNo: 'U72200KA2025PTC14256',

        address: 'StayHub Corporate Plaza, 15th Main, HSR Layout, Sector 4, Bangalore East - 560102',

        phone: '+91 80 4991 3829',

        revenueTarget: '₹2.4 Crore / Year',

        incorporationDate: '2025-01-15'

      },

      'org-2': {

        gstin: '27BBBBB1111B2Y4',

        regNo: 'U74999MH2025PTC18925',

        address: 'Apex Towers, floor 14, Senapati Bapat Marg, Lower Parel, Mumbai - 400013',

        phone: '+91 22 6609 1122',

        revenueTarget: '₹4.8 Crore / Year',

        incorporationDate: '2025-03-10'

      }

    });

  });



  const activeDetails = companyDetailsMap[selectedOrgId] || {

    gstin: 'N/A - Set GSTIN',

    regNo: 'N/A - Set Reg Number',

    address: 'N/A - Set Address',

    phone: 'N/A - Set Phone',

    revenueTarget: '₹0.00 / Mock Target',

    incorporationDate: '2026-05-24'

  };



  const [editDetailsForm, setEditDetailsForm] = useState<CompanyDetails>({ ...activeDetails });



  // Update Edit form whenever the organization dropdown selector triggers

  useEffect(() => {

    if (companyDetailsMap[selectedOrgId]) {

      setEditDetailsForm({ ...companyDetailsMap[selectedOrgId] });

    } else {

      setEditDetailsForm({

        gstin: '',

        regNo: '',

        address: '',

        phone: '',

        revenueTarget: '₹1.0 Crore / Year',

        incorporationDate: '2026-05-24'

      });

    }

  }, [selectedOrgId, companyDetailsMap]);



  const handleSaveCompanyDetails = (e: React.FormEvent) => {

    e.preventDefault();

    const updatedMap = {

      ...companyDetailsMap,

      [selectedOrgId]: editDetailsForm

    };

    setCompanyDetailsMap(updatedMap);

    setLocalStorageData('company_details_map', updatedMap);

    

    const orgName = organizations.find(o => o.id === selectedOrgId)?.name || 'Organization';

    onAddAuditLog(`Updated company registry stats, Address & GSTIN for ${orgName}`, 'SuperAdmin');

    alert('Corporate Details updated successfully into browser cache ledger.');

  };



  // -----------------------------------------

  // BRANCH MANAGEMENT CRUD

  // -----------------------------------------

  const [branches, setBranches] = useState<Branch[]>(() => {

    return getLocalStorageData<Branch[]>('branches_list', [

      { id: 'br-1', orgId: 'org-1', name: 'Bangalore South Hub', location: 'HSR Layout, Sector 2', manager: 'Aditi Nair', contact: '+91 99002 88122' },

      { id: 'br-2', orgId: 'org-1', name: 'Hyderabad Gachibowli HQ', location: 'Cyber City Ring Rd', manager: 'Srinadh Mohan', contact: '+91 99044 11332' },

      { id: 'br-3', orgId: 'org-2', name: 'West Lower Parel Station office', location: 'Sunshine Towers, Parel', manager: 'Kabir Singhania', contact: '+91 91100 22002' }

    ]);

  });



  const [showBranchModal, setShowBranchModal] = useState(false);

  const [newBranchForm, setNewBranchForm] = useState({

    name: '',

    location: '',

    manager: '',

    contact: ''

  });



  const handleCreateBranch = (e: React.FormEvent) => {

    e.preventDefault();

    if (!newBranchForm.name || !newBranchForm.location) return;



    const newBr: Branch = {

      id: `br-${Date.now()}`,

      orgId: selectedOrgId,

      name: newBranchForm.name,

      location: newBranchForm.location,

      manager: newBranchForm.manager || 'Unassigned',

      contact: newBranchForm.contact || 'N/A'

    };



    const updated = [...branches, newBr];

    setBranches(updated);

    setLocalStorageData('branches_list', updated);

    

    onAddAuditLog(`Created new geographical Branch: "${newBr.name}" under Corporate ID: ${selectedOrgId}`, 'SuperAdmin');

    setShowBranchModal(false);

    setNewBranchForm({ name: '', location: '', manager: '', contact: '' });

  };



  const handleDeleteBranch = (id: string, name: string) => {

    if (!confirm(`Are you sure you want to delete branch "${name}" from the system registry?`)) return;

    const updated = branches.filter(b => b.id !== id);

    setBranches(updated);

    setLocalStorageData('branches_list', updated);

    onAddAuditLog(`Removed Branch: "${name}" from active operational channels`, 'SuperAdmin');

  };



  // -----------------------------------------

  // BRAND LOGO UPLOAD COMPONENT

  // -----------------------------------------

  const [orgLogoMap, setOrgLogoMap] = useState<Record<string, string>>(() => {

    return getLocalStorageData<Record<string, string>>('org_logos_map', {

      'org-1': 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?w=200&auto=format&fit=crop&q=60', // Pre-seeded organic logo

      'org-2': 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&auto=format&fit=crop&q=60'

    });

  });



  const [simulatedUploading, setSimulatedUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);



  // Available pristine SVG style logostamps for user quick selection

  const predesignedLogos = [

    { name: 'Sovereign Shield', color: 'from-amber-400 to-yellow-600', char: '🛡️' },

    { name: 'Co-Living Lotus', color: 'from-teal-400 to-emerald-600', char: '🏵️' },

    { name: 'Skyline Hospitality', color: 'from-blue-500 to-indigo-700', char: '🏢' },

    { name: 'Apex Circle', color: 'from-fuchsia-500 to-purple-800', char: '🔮' }

  ];



  const handleSelectQuickLogo = (stamp: string) => {

    const updated = {

      ...orgLogoMap,

      [selectedOrgId]: stamp

    };

    setOrgLogoMap(updated);

    setLocalStorageData('org_logos_map', updated);

    

    const orgName = organizations.find(o => o.id === selectedOrgId)?.name || 'Organization';

    onAddAuditLog(`Updated brand design stamp for organization: ${orgName}`, 'SuperAdmin');

    alert(`Brand logo set to "${stamp}" emblem successfully for ${orgName}.`);

  };



  const handleSimulatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      const fileName = e.target.files[0].name;

      setSimulatedUploading(true);

      setUploadProgress(10);

      

      const timer = setInterval(() => {

        setUploadProgress((prev) => {

          if (prev >= 100) {

            clearInterval(timer);

            setSimulatedUploading(false);

            

            // Assign a nice photo avatar as simulated upload string

            const randomLogoUrl = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=60';

            const updatedLogos = {

              ...orgLogoMap,

              [selectedOrgId]: randomLogoUrl

            };

            setOrgLogoMap(updatedLogos);

            setLocalStorageData('org_logos_map', updatedLogos);

            

            const orgName = organizations.find(o => o.id === selectedOrgId)?.name || 'Organization';

            onAddAuditLog(`Uploaded simulated branding file ${fileName} for ${orgName}`, 'SuperAdmin');

            alert(`File "${fileName}" uploaded successfully! Brand logo synchronized.`);

            return 100;

          }

          return prev + 30;

        });

      }, 300);

    }

  };



  // -----------------------------------------

  // PROPERTY DISCOVERY & STATUS TOGGLES

  // -----------------------------------------

  const handleTogglePropertyStatus = (id: string, name: string) => {

    let updated: string[];

    const isCurrentlyDeactivated = deactivatedPropIds.includes(id);

    

    if (isCurrentlyDeactivated) {

      updated = deactivatedPropIds.filter(pId => pId !== id);

      onAddAuditLog(`Restored & Toggled Property Asset "${name}" status to ACTIVE`, 'SuperAdmin');

    } else {

      updated = [...deactivatedPropIds, id];

      onAddAuditLog(`Suspended Property Asset "${name}" and un-published live booking allocations`, 'SuperAdmin');

    }

    

    setDeactivatedPropIds(updated);

    setLocalStorageData('deactivated_properties', updated);

  };



  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // --- NEW: PROPERTY REPLACEMENT / EXTRA CRUD FUNCTIONS ---

  const [showPropertyModal, setShowPropertyModal] = useState(false);

  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  const [propertyForm, setPropertyForm] = useState({
    name: '',
    type: 'Hotel' as 'Hotel' | 'PG',
    city: '',
    address: '',
    totalRooms: 6,
    amenities: 'WiFi, AC, TV, Food, Laundry, CCTV, Power Backup',
    rules: 'Gate closes at 10:30 PM, No smoking in rooms, Identification is mandatory',
    orgId: 'org-1',
    locationLink: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: ''
  });



  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();

    if (!propertyForm.name || !propertyForm.city || !propertyForm.address) return;

    const amenitiesArray = propertyForm.amenities.split(',').map(a => a.trim()).filter(Boolean);
    const rulesArray = propertyForm.rules.split(',').map(r => r.trim()).filter(Boolean);

    let updatedProps: Property[];

    if (editingPropertyId) {
      updatedProps = properties.map(p => {
        if (p.id === editingPropertyId) {
          return {
            ...p,
            name: propertyForm.name,
            type: propertyForm.type,
            city: propertyForm.city,
            address: propertyForm.address,
            totalRooms: Number(propertyForm.totalRooms),
            amenities: amenitiesArray,
            rules: rulesArray,
            orgId: propertyForm.orgId,
            locationLink: propertyForm.locationLink,
            adminName: propertyForm.adminName,
            adminEmail: propertyForm.adminEmail,
            adminPhone: propertyForm.adminPhone,
            adminPassword: propertyForm.adminPassword,
            adminId: p.adminId || `admin-${Date.now()}`
          };
        }
        return p;
      });
      onAddAuditLog(`Modified details for property asset "${propertyForm.name}"`, 'SuperAdmin');
      alert(`Property "${propertyForm.name}" updated successfully.`);
    } else {
      const newProp: Property = {
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
        status: 'Active',
        adminName: propertyForm.adminName,
        adminEmail: propertyForm.adminEmail,
        adminPhone: propertyForm.adminPhone,
        adminPassword: propertyForm.adminPassword,
        adminId: `admin-${Date.now()}`
      };
      updatedProps = [...properties, newProp];
      onAddAuditLog(`Added brand new property asset "${propertyForm.name}" in ${propertyForm.city}`, 'SuperAdmin');
      alert(`Property "${propertyForm.name}" added successfully.`);
    }

    setProperties(updatedProps);
    setLocalStorageData('properties', updatedProps);
    setShowPropertyModal(false);
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
      locationLink: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      adminPassword: ''
    });
  };



  const handleDeleteProperty = (id: string, name: string) => {

    if (!confirm(`Are you sure you want to completely delete "${name}"? This action cannot be undone.`)) return;

    const updated = properties.filter(p => p.id !== id);

    setProperties(updated);

    setLocalStorageData('properties', updated);

    onAddAuditLog(`Completely deleted property asset "${name}"`, 'SuperAdmin');

    alert(`Property "${name}" deleted.`);

  };



  const handleDeleteTenant = (id: string, name: string) => {

    if (!confirm(`Are you sure you want to completely delete customer "${name}"? This action cannot be undone.`)) return;

    const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);

    const updated = currentTenants.filter(t => t.id !== id);

    setTenants(updated);

    setLocalStorageData('tenants', updated);

    onAddAuditLog(`Completely deleted customer "${name}"`, 'SuperAdmin');

    alert(`Customer "${name}" deleted.`);

  };



  const handleSendReply = (e: React.FormEvent) => {

    e.preventDefault();

    if (!selectedQueryId || !replyText.trim()) return;



    const currentList = getLocalStorageData<QueryMessage[]>('stayhub_queries', []);

    const updated = currentList.map(q => {

      if (q.id === selectedQueryId) {

        return {

          ...q,

          status: 'replied' as const,

          replies: [

            ...q.replies,

            {

              sender: 'Super Admin' as const,

              message: replyText.trim(),

              timestamp: new Date().toISOString()

            }

          ]

        };

      }

      return q;

    });



    setLocalStorageData('stayhub_queries', updated);

    

    const match = currentList.find(q => q.id === selectedQueryId);

    if (match) {

      onAddAuditLog(`Super Admin replied to ${match.type} query from "${match.senderName}"`, 'SuperAdmin');

    }



    setReplyText('');

    

    const sorted = [...updated].sort((a, b) => {

      const aTime = a.replies.length > 0 ? a.replies[a.replies.length - 1].timestamp : a.timestamp;

      const bTime = b.replies.length > 0 ? b.replies[b.replies.length - 1].timestamp : b.timestamp;

      return new Date(bTime).getTime() - new Date(aTime).getTime();

    });

    setQueriesList(sorted);

  };



  const [selectedPropertyInsightId, setSelectedPropertyInsightId] = useState<string | null>(null);



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

  };



  // -----------------------------------------

  // LOGIN HISTORY SIMULATION

  // -----------------------------------------

  const [loginHistoryList, setLoginHistoryList] = useState<LoginRecord[]>(() => {

    return getLocalStorageData<LoginRecord[]>('login_history_list', [

      { id: 'log-in-1', userEmail: 'sunny.diploma033@gmail.com', role: 'Super Admin', timestamp: '2026-05-24T14:10:00Z', ipAddress: '157.48.192.15', device: 'Chrome / macOS Intel', status: 'Success' },

      { id: 'log-in-2', userEmail: 'priya.s@homelystays.com', role: 'Property Admin', timestamp: '2026-05-24T13:22:15Z', ipAddress: '106.51.38.204', device: 'Firefox / Windows 11', status: 'Success' },

      { id: 'log-in-3', userEmail: 'visitor-guard@stayhub.co', role: 'Staff Gatekeeper', timestamp: '2026-05-24T12:05:00Z', ipAddress: '192.168.1.115', device: 'Safari / iPhone 15 Pro', status: 'Success' },

      { id: 'log-in-4', userEmail: 'intruder-hacker@badactor.net', role: 'Unauthorised Attempt', timestamp: '2026-05-24T11:45:10Z', ipAddress: '45.22.181.9', device: 'Curl Client / Linux x64', status: 'Failure' },

      { id: 'log-in-5', userEmail: 'kabir.s@apexhospitality.net', role: 'Property Admin', timestamp: '2026-05-24T09:12:00Z', ipAddress: '182.72.10.45', device: 'Chrome Mobile / Android', status: 'Success' }

    ]);

  });



  const pushMockLoginRecord = (email: string, role: string, status: 'Success' | 'Failure') => {

    const newRecord: LoginRecord = {

      id: `log-in-${Date.now()}`,

      userEmail: email,

      role,

      timestamp: new Date().toISOString(),

      ipAddress: '192.168.4.' + Math.floor(Math.random() * 254),

      device: 'Edge Browser / Windows 11',

      status

    };

    const updated = [newRecord, ...loginHistoryList];

    setLoginHistoryList(updated);

    setLocalStorageData('login_history_list', updated);

  };



  // -----------------------------------------

  // INITIALIZERS / REFRESHERS

  // -----------------------------------------

  useEffect(() => {

    syncAllFromBackend().then(() => {

      setOrganizations(getLocalStorageData<Organization[]>('organizations', []));

      setProperties(getLocalStorageData<Property[]>('properties', []));

      setTenants(getLocalStorageData<Tenant[]>('tenants', []));

    });

  }, []);



  const syncOrganizations = (updatedOrgs: Organization[]) => {

    setOrganizations(updatedOrgs);

    setLocalStorageData('organizations', updatedOrgs);

  };



  // Create Parent Organization CRUD

  const [showOrgModal, setShowOrgModal] = useState(false);

  const [newOrgForm, setNewOrgForm] = useState({

    name: '',

    domain: '',

    contactEmail: ''

  });



  const handleCreateOrg = (e: React.FormEvent) => {

    e.preventDefault();

    if (!newOrgForm.name || !newOrgForm.domain) return;



    const newOrg: Organization = {

      id: `org-${Date.now()}`,

      name: newOrgForm.name,

      domain: newOrgForm.domain,

      registeredAt: new Date().toISOString(),

      contactEmail: newOrgForm.contactEmail || `info@${newOrgForm.domain}`,

      status: 'Active'

    };



    const updated = [...organizations, newOrg];

    syncOrganizations(updated);



    // Seed default company details for of this new organization

    const updatedDetailsMap = {

      ...companyDetailsMap,

      [newOrg.id]: {

        gstin: 'PENDING_REGISTRATION',

        regNo: 'MOCK-REG-' + Math.floor(Math.random() * 99999),

        address: 'HQ Address, Registration pending',

        phone: '+91 80 4000 0000',

        revenueTarget: '₹50 Lakh / Year',

        incorporationDate: new Date().toISOString().split('T')[0]

      }

    };

    setCompanyDetailsMap(updatedDetailsMap);

    setLocalStorageData('company_details_map', updatedDetailsMap);



    onAddAuditLog(`Setup Multi-tenant Enterprise Organization: ${newOrg.name}`, 'SuperAdmin');

    setShowOrgModal(false);

    setNewOrgForm({ name: '', domain: '', contactEmail: '' });

    setSelectedOrgId(newOrg.id);

  };



  // -----------------------------------------

  // BRAND STAMP RENDERER

  // -----------------------------------------

  const renderLogoStamp = (orgId: string) => {

    const rawLogo = orgLogoMap[orgId];

    if (!rawLogo) return <div className="w-10 h-10 bg-slate-200 text-slate-400 font-bold rounded-lg flex items-center justify-center">N/A</div>;

    

    // Check if user set a pre-designed emoji stamp

    if (rawLogo.length < 5) {

      return (

        <span className="text-2xl w-10 h-10 bg-indigo-50 border border-indigo-150 rounded-lg flex items-center justify-center shadow-inner">

          {rawLogo}

        </span>

      );

    }

    

    // Else render full image

    return (

      <div className="w-10 h-10 border border-slate-200 rounded-lg bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-sm shrink-0">

        <img 

          src={rawLogo} 

          alt="Org Branding Emblem" 

          className="max-w-full max-h-full object-contain"

          referrerPolicy="no-referrer"

        />

      </div>

    );

  };



  // -----------------------------------------

  // FILTERED PROPERTY LISTS

  // -----------------------------------------

  const filteredProperties = properties.filter(p => {

    const matchesFilter = propertyFilter === 'All' || p.type === propertyFilter;

    const query = propertySearchQuery.trim().toLowerCase();

    const matchesSearch = !query || 

      (p.name && p.name.toLowerCase().includes(query)) ||

      (p.address && p.address.toLowerCase().includes(query)) ||

      (p.city && p.city.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;

  });



  const hotelCount = properties.filter(p => p.type === 'Hotel').length;

  const pgCount = properties.filter(p => p.type === 'PG').length;

  const suspendedCount = deactivatedPropIds.length;



  if (selectedCustomerDetailId) {

    const selectedTenant = tenants.find(t => t.id === selectedCustomerDetailId);

    if (selectedTenant) {

      const isStaying = selectedTenant.propertyId && selectedTenant.propertyId !== 'none';

      const matchedProp = properties.find(p => p.id === selectedTenant.propertyId);

      const propAddress = matchedProp ? matchedProp.address : 'N/A';

      const propCity = matchedProp ? matchedProp.city : 'N/A';

      

      return (

        <div className="bg-[#0f111a] text-[#8c9ab8] min-h-screen p-6 font-sans flex flex-col justify-between">

          <div className="max-w-4xl mx-auto w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">

            {/* Background elements */}

            <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">

              <UserCheck className="w-56 h-56" />

            </div>



            {/* Header / Back Action */}

            <div className="flex justify-between items-center pb-4 border-b border-slate-800">

              <div 

                onClick={() => setSelectedCustomerDetailId(null)}

                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition text-[10px] font-extrabold cursor-pointer no-uiverse"

              >

                <ArrowLeft className="w-3.5 h-3.5" />

                <span>BACK TO DIRECTORY</span>

              </div>

              <div>

                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 block font-mono text-right">stayhub enterprise</span>

                <h2 className="text-sm font-black uppercase text-white tracking-wider mt-0.5">Customer Profile details</h2>

              </div>

            </div>



            {/* Profile Content */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Photo & Status */}

              <div className="space-y-4 md:col-span-1">

                {selectedTenant.docUrl ? (

                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">

                    <img 

                      src={selectedTenant.docUrl} 

                      alt={selectedTenant.name} 

                      className="w-full h-full object-cover"

                    />

                  </div>

                ) : (

                  <div className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center bg-slate-950 border border-dashed border-slate-800 text-slate-500">

                    <Image className="w-8 h-8 mb-2" />

                    <span className="text-[10px] font-bold uppercase tracking-wider">No KYC Uploaded</span>

                  </div>

                )}

                

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">

                  <div className="flex justify-between items-center text-[11px]">

                    <span className="text-slate-450 uppercase font-extrabold tracking-wider font-mono">Current Status:</span>

                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${isStaying ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>

                      {isStaying ? 'Staying' : 'Not Staying'}

                    </span>

                  </div>

                  {isStaying && (

                    <div className="space-y-1.5 pt-2 border-t border-slate-850">

                      <div>

                        <span className="text-[9px] text-slate-500 uppercase block font-mono">Stayed Property:</span>

                        <span className="text-xs font-black text-white">{selectedTenant.propertyName}</span>

                      </div>

                      <div>

                        <span className="text-[9px] text-slate-500 block font-mono">Room/Bed:</span>

                        <span className="text-xs font-bold text-slate-300">Room {selectedTenant.roomNumber || 'N/A'}, Bed {selectedTenant.bedNumber || 'N/A'}</span>

                      </div>

                    </div>

                  )}

                </div>

              </div>



              {/* Personal & Registry Details */}

              <div className="md:col-span-2 space-y-4">

                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">

                  <h3 className="text-xs font-black uppercase text-white tracking-wider border-b border-slate-850 pb-2">Identification & Contact Info</h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Full Name:</span>

                      <span className="font-extrabold text-white text-sm">{selectedTenant.name}</span>

                    </div>

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Mobile Phone:</span>

                      <span className="font-extrabold text-white text-sm">{selectedTenant.phone || 'N/A'}</span>

                    </div>

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Email Address:</span>

                      <span className="font-bold text-slate-300">{selectedTenant.email}</span>

                    </div>

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Emergency Name:</span>

                      <span className="font-bold text-slate-300">{selectedTenant.emergencyContactName || 'N/A'}</span>

                    </div>

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Emergency Phone:</span>

                      <span className="font-bold text-slate-300">{selectedTenant.emergencyContactPhone || 'N/A'}</span>

                    </div>

                    <div>

                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Joined Date:</span>

                      <span className="font-mono text-slate-400">{selectedTenant.joinedDate || 'N/A'}</span>

                    </div>

                  </div>

                </div>



                {/* Session login history */}

                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">

                  <h3 className="text-xs font-black uppercase text-white tracking-wider border-b border-slate-850 pb-2">Session Login/Logout Records</h3>

                  <div className="space-y-2">

                    <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">

                      <div className="flex items-center space-x-2">

                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                        <span className="text-[10px] uppercase font-bold text-slate-400">Last Authentication:</span>

                      </div>

                      <span className="text-[11px] font-mono text-emerald-400 font-bold">{selectedTenant.lastLogin || 'No active login session'}</span>

                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">

                      <div className="flex items-center space-x-2">

                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />

                        <span className="text-[10px] uppercase font-bold text-slate-400">Last Sign-out:</span>

                      </div>

                      <span className="text-[11px] font-mono text-rose-400 font-bold">{selectedTenant.lastLogout || 'No active sign-out session'}</span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      );

    }

  }



  if (selectedPropertyInsightId) {

    const selectedPropObj = properties.find(p => p.id === selectedPropertyInsightId);

    if (selectedPropObj) {

      const storedRooms = getLocalStorageData<any[]>('rooms', []);

      const storedTenants = getLocalStorageData<any[]>('tenants', []);

      const storedBookings = getLocalStorageData<any[]>('bookings', []);



      const filteredRooms = storedRooms.filter(r => r.propertyId === selectedPropertyInsightId);

      const filteredTenants = storedTenants.filter(t => t.propertyId === selectedPropertyInsightId);

      const filteredBookings = storedBookings.filter(b => b.propertyId === selectedPropertyInsightId);



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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800 last:border-0 text-[11px] gap-2">

            <div className="flex items-center gap-1.5 shrink-0 min-w-[140px]">

              <span className="text-slate-400 font-bold uppercase tracking-wider">{label}</span>

              <button

                type="button"

                onClick={() => handleToggleFieldLock(fieldKey, selectedPropObj.id, selectedPropObj.name)}

                className={`p-1 transition rounded hover:bg-slate-850 ${isLocked ? "text-rose-500" : "text-slate-500 hover:text-slate-350"}`}

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

                    className="bg-[#0b0f19] border border-[#1f293d] rounded px-2 py-1 text-xs w-full font-semibold text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"

                    autoFocus

                  />

                  {isPassword && (

                    <button

                      type="button"

                      onClick={() => setFieldShowPasswords({ ...fieldShowPasswords, [fieldKey]: !showPassword })}

                      className="text-slate-400 p-1 hover:text-white"

                    >

                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}

                    </button>

                  )}

                  <button

                    type="button"

                    onClick={() => handleSaveFieldEdit(fieldKey, selectedPropObj.id, selectedPropObj.name)}

                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] transition active:scale-95"

                  >

                    Save

                  </button>

                  <button

                    type="button"

                    onClick={() => setEditingField(null)}

                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded text-[10px] transition active:scale-95"

                  >

                    Cancel

                  </button>

                </div>

              ) : (

                <div className="flex items-center justify-between w-full gap-2">

                  <span className="text-slate-200 font-black truncate max-w-[280px]">

                    {isPassword && !showPassword ? "••••••••" : value || "N/A"}

                  </span>

                  <div className="flex items-center gap-1 shrink-0">

                    {isPassword && (

                      <button

                        type="button"

                        onClick={() => setFieldShowPasswords({ ...fieldShowPasswords, [fieldKey]: !showPassword })}

                        className="text-slate-500 p-1 hover:text-white"

                      >

                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}

                      </button>

                    )}

                    <button

                      type="button"

                      onClick={() => handleStartFieldEdit(fieldKey, value || "")}

                      className="text-slate-500 hover:text-indigo-400 p-1 rounded hover:bg-slate-800"

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

        <div id="hq-property-console" className="min-h-screen bg-[#090d16] text-slate-100 p-6 flex flex-col space-y-6 w-full animate-fadeIn">

          

          {/* Header Section */}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1f293d] pb-4 gap-4">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">

                  HQ MASTER PROPERTY CONSOLE

                </span>

                <span className="text-xs font-mono font-bold text-slate-400">ID: {selectedPropertyInsightId}</span>

                <button 
                  onClick={() => {
                    setPropertyForm({
                      name: selectedPropObj.name || '',
                      type: selectedPropObj.type || 'Hotel',
                      city: selectedPropObj.city || '',
                      address: selectedPropObj.address || '',
                      totalRooms: selectedPropObj.totalRooms || 6,
                      amenities: (selectedPropObj.amenities || []).join(', '),
                      rules: (selectedPropObj.rules || []).join(', '),
                      orgId: selectedPropObj.orgId || selectedPropObj.orgId || 'org-1',
                      locationLink: selectedPropObj.locationLink || '',
                      adminName: selectedPropObj.adminName || '',
                      adminEmail: selectedPropObj.adminEmail || '',
                      adminPhone: selectedPropObj.adminPhone || '',
                      adminPassword: selectedPropObj.adminPassword || ''
                    });
                    setEditingPropertyId(selectedPropObj.id);
                    setSelectedPropertyInsightId(null);
                    setActiveTab('property-setup');
                    setShowPropertyModal(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-350 hover:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Details</span>
                </button>

                <button 

                  onClick={() => handleDeleteProperty(selectedPropObj.id, selectedPropObj.name)}

                  className="text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px] font-bold flex items-center gap-1 transition"

                >

                  <Trash2 className="w-3 h-3" />

                  <span>Delete Property</span>

                </button>

              </div>

              <h3 className="font-extrabold text-2xl font-display text-white mt-2 leading-none">

                {selectedPropObj.name}

              </h3>

              <span className="text-[11px] text-slate-400 mt-2 block">

                📍 {selectedPropObj.houseNumber || 'N/A'}, {selectedPropObj.street || 'N/A'}, {selectedPropObj.area || 'N/A'}, {selectedPropObj.district || 'N/A'}, {selectedPropObj.state || 'N/A'} - {selectedPropObj.pincode || 'N/A'}

              </span>

            </div>

            

            <button 

              onClick={() => setSelectedPropertyInsightId(null)} 

              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition border border-slate-750 hover:border-slate-600 active:scale-95 cursor-pointer shadow-md"

            >

              <ArrowLeft className="w-4 h-4" />

              <span>Back to Dashboard</span>

            </button>

          </div>



          {/* Grid Layout */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            

            {/* Left side: Credentials & Address Specs */}

            <div className="lg:col-span-5 space-y-6">

              

              {/* Card 1: Admin Profile Credentials */}

              <div className="bg-[#111827] border border-[#1f293d] p-5 rounded-2xl space-y-4 shadow-lg">

                <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest border-b border-[#1f293d] pb-2 flex items-center gap-1.5">

                  <span>👤 ADMIN PROFILE CREDENTIALS</span>

                </h4>

                <div className="space-y-1">

                  {renderEditField("Admin Name", "adminName", selectedPropObj.adminName || "")}

                  {renderEditField("Phone Number", "adminPhone", selectedPropObj.adminPhone || "")}

                  {renderEditField("Email Address", "adminEmail", selectedPropObj.adminEmail || "")}

                  {renderEditField("Access Password", "adminPassword", selectedPropObj.adminPassword || "", true)}

                </div>

              </div>



              {/* Card 2: Property Specs & Address */}

              <div className="bg-[#111827] border border-[#1f293d] p-5 rounded-2xl space-y-4 shadow-lg">

                <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest border-b border-[#1f293d] pb-2 flex items-center gap-1.5">

                  <span>🏠 PROPERTY SPECS & ADDRESS</span>

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



            {/* Right side: Room inventory rates & Tenants log */}

            <div className="lg:col-span-7 space-y-6">

              

              {/* Card 1: Floor-by-Floor Inventory Rates */}

              <div className="bg-[#111827] border border-[#1f293d] p-5 rounded-2xl space-y-4 shadow-lg">

                <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest border-b border-[#1f293d] pb-2 flex justify-between items-center">

                  <span>🗄️ FLOOR-BY-FLOOR INVENTORY RATES</span>

                  <span className="text-[10px] text-slate-400 font-mono font-bold">TOTAL ROOMS: {filteredRooms.length}</span>

                </h4>

                {filteredRooms.length === 0 ? (

                  <p className="text-center py-8 text-slate-455 italic text-[11px]">No physical rooms registered for this property asset.</p>

                ) : (

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">

                    {sortedFloors.map(flNum => (

                      <div key={flNum} className="space-y-2 border border-[#1f293d] bg-[#131b2e]/50 p-4 rounded-xl">

                        <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded font-mono">Floor {flNum}</span>

                        <div className="space-y-2 pt-1.5">

                          {floorRooms[flNum].map(rm => {

                            const isEditingRoom = editingRoomId === rm.id;

                            return (

                              <div key={rm.id} className="border border-[#1f293d] bg-[#111827] p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center text-[10.5px] gap-3 hover:border-slate-700 transition">

                                <div className="shrink-0">

                                  <strong className="text-white font-mono text-xs block">Room {rm.roomNumber}</strong>

                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{rm.type} ({rm.occupancyStatus || rm.status || 'Available'})</span>

                                </div>

                                {isEditingRoom ? (

                                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">

                                    <div>

                                      <span className="text-[8px] text-slate-400 block font-bold">Daily (₹)</span>

                                      <input

                                        type="number"

                                        value={editDailyPrice}

                                        onChange={e => setEditDailyPrice(Number(e.target.value) || 0)}

                                        className="w-full bg-[#0b0f19] border border-[#1f293d] text-white p-1 font-mono font-bold rounded"

                                      />

                                    </div>

                                    <div>

                                      <span className="text-[8px] text-slate-400 block font-bold">Weekly (₹)</span>

                                      <input

                                        type="number"

                                        value={editWeeklyPrice}

                                        onChange={e => setEditWeeklyPrice(Number(e.target.value) || 0)}

                                        className="w-full bg-[#0b0f19] border border-[#1f293d] text-white p-1 font-mono font-bold rounded"

                                      />

                                    </div>

                                    <div>

                                      <span className="text-[8px] text-slate-400 block font-bold">Monthly (₹)</span>

                                      <input

                                        type="number"

                                        value={editMonthlyPrice}

                                        onChange={e => setEditMonthlyPrice(Number(e.target.value) || 0)}

                                        className="w-full bg-[#0b0f19] border border-[#1f293d] text-white p-1 font-mono font-bold rounded"

                                      />

                                    </div>

                                    <div>

                                      <span className="text-[8px] text-slate-400 block font-bold">Seasonal (₹)</span>

                                      <input

                                        type="number"

                                        value={editSeasonalPrice}

                                        onChange={e => setEditSeasonalPrice(Number(e.target.value) || 0)}

                                        className="w-full bg-[#0b0f19] border border-[#1f293d] text-white p-1 font-mono font-bold rounded"

                                      />

                                    </div>

                                    <div className="col-span-full flex justify-end gap-1.5 pt-1">

                                      <button

                                        type="button"

                                        onClick={() => handleSaveRoomRates(rm.id)}

                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[9px] transition active:scale-95"

                                      >

                                        Save

                                      </button>

                                      <button

                                        type="button"

                                        onClick={() => setEditingRoomId(null)}

                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded text-[9px] transition active:scale-95"

                                      >

                                        Cancel

                                      </button>

                                    </div>

                                  </div>

                                ) : (

                                  <div className="flex-1 flex justify-between items-center gap-3 font-semibold">

                                    <div className="grid grid-cols-4 gap-3 text-right flex-1 font-mono">

                                      <div>

                                        <span className="text-[8px] text-slate-450 block uppercase font-sans">Day</span>

                                        <span className="font-bold text-slate-200">₹{rm.pricePerDay || rm.price || 0}</span>

                                      </div>

                                      <div>

                                        <span className="text-[8px] text-slate-455 block uppercase font-sans">Week</span>

                                        <span className="font-bold text-slate-200">₹{rm.priceWeekly || (rm.pricePerDay || rm.price || 0) * 7}</span>

                                      </div>

                                      <div>

                                        <span className="text-[8px] text-slate-450 block uppercase font-sans">Month</span>

                                        <span className="font-bold text-slate-200">₹{rm.pricePerMonth || (rm.pricePerDay || rm.price || 0) * 22}</span>

                                      </div>

                                      <div>

                                        <span className="text-[8px] text-slate-450 block uppercase font-sans">Season</span>

                                        <span className="font-bold text-slate-200">₹{rm.priceSeasonal || (rm.pricePerMonth || 0) * 1.2 || (rm.pricePerDay || rm.price || 0) * 26}</span>

                                      </div>

                                    </div>

                                    <button

                                      type="button"

                                      onClick={() => handleStartRoomRatesEdit(rm)}

                                      className="text-slate-500 hover:text-indigo-400 p-1.5 border border-[#1f293d] hover:border-indigo-500/30 rounded-lg flex items-center justify-center shrink-0 transition"

                                      title="Edit room rates"

                                    >

                                      <Pencil className="w-3.5 h-3.5" />

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



              {/* Card 2: Resident Tenants Log */}

              <div className="bg-[#111827] border border-[#1f293d] p-5 rounded-2xl space-y-4 shadow-lg">

                <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest border-b border-[#1f293d] pb-2 flex justify-between">

                  <span>RESIDENT TENANTS LOG</span>

                  <span className="text-[9px] text-slate-400 font-mono font-bold">{filteredTenants.length} CHECKED-IN GUESTS</span>

                </h4>

                {filteredTenants.length === 0 ? (

                  <p className="text-center py-8 text-slate-455 italic text-[11px]">No resident guests checked-in currently.</p>

                ) : (

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">

                    {filteredTenants.map(t => (

                      <div key={t.id} className="p-3 bg-[#131b2e]/50 border border-[#1f293d] rounded-xl flex justify-between items-center text-[10.5px]">

                        <div>

                          <strong className="text-white block">{t.name}</strong>

                          <span className="text-[9.5px] text-slate-400 block font-mono">Room Number » Room {t.roomNumber}</span>

                        </div>

                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider">

                          Checked-In

                        </span>

                      </div>

                    ))}

                  </div>

                )}

              </div>



            </div>



          </div>



        </div>

      );

    }

  }



  return (



    <div id="super-admin-interface" className={`grid grid-cols-1 lg:grid-cols-12 min-h-[640px] bg-slate-50 text-slate-800 font-sans super-hq-peach-theme ${isDarkMode ? 'dark' : ''}`}>

      

      {/* LEFT PRIMARY EMBARK SIDEBAR CONTROL PANEL */}

      <aside className="lg:col-span-3 bg-slate-100 text-slate-705 p-5 flex flex-col justify-between border-r border-slate-200">

        <div className="space-y-6">

          

          {/* Header Brand Seal */}

          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-xs relative">

            <div className="flex items-center space-x-3">

              <div className="hq-brand-seal bg-gradient-to-tr from-purple-500 to-indigo-700 text-white p-2.5 rounded-xl font-display font-black text-sm shadow">

                HQ

              </div>

              <div>

                <h3 className="text-xs font-black font-display text-slate-900 tracking-widest uppercase">StayHub HQ</h3>

                <span className="text-[9px] text-fuchsia-600 font-mono font-bold block mt-0.5">SUPER ADMIN CENTRAL</span>

              </div>

            </div>

            <div className="block lg:hidden absolute right-4 top-2.5 z-50">
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

                  <div className="file file-5" onClick={() => { setIsFolderOpen(false); onLogout(); }}>
                    <div className="shine"></div>
                    <ArrowLeft className="file-icon text-white" />
                    <div className="file-text">Logout HQ</div>
                    <div className="file-tag">LOGOUT</div>
                  </div>

                  <div className="file file-4" onClick={() => { setIsFolderOpen(false); setIsDarkMode(!isDarkMode); }}>
                    <div className="shine"></div>
                    {isDarkMode ? <Sun className="file-icon text-white" /> : <Moon className="file-icon text-white" />}
                    <div className="file-text">{isDarkMode ? 'Daylight Mode' : 'Dark Mode'}</div>
                    <div className="file-tag">THEME</div>
                  </div>

                  <div className="file file-3" onClick={() => { setActiveTab('customers'); setIsFolderOpen(false); }}>
                    <div className="shine"></div>
                    <UserCheck className="file-icon text-white" />
                    <div className="file-text">Customers</div>
                    <div className="file-tag">TENANTS</div>
                  </div>

                  <div className="file file-2" onClick={() => { setActiveTab('property-setup'); setIsFolderOpen(false); }}>
                    <div className="shine"></div>
                    <Home className="file-icon text-white" />
                    <div className="file-text">Stays</div>
                    <div className="file-tag">PROPERTIES</div>
                  </div>

                  <div className="file file-1" onClick={() => { setActiveTab('org-setup'); setIsFolderOpen(false); }}>
                    <div className="shine"></div>
                    <Building2 className="file-icon text-white" />
                    <div className="file-text">Corporate</div>
                    <div className="file-tag">SETUP</div>
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
                      <span className="counter-number">05</span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Transparent dropdown card menu */}
              {isFolderOpen && (
                <div className="absolute right-0 top-[52px] w-64 max-w-sm overflow-hidden z-50 bg-white dark:bg-black p-4 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800 space-y-1 before:w-24 before:h-24 before:absolute before:bg-purple-500/40 before:rounded-full before:-z-10 before:blur-2xl before:top-0 before:left-0 after:w-32 after:h-32 after:absolute after:bg-sky-400/40 after:rounded-full after:-z-10 after:blur-xl after:bottom-0 after:-right-12">
                  <button
                    onClick={() => {
                      setActiveTab('org-setup');
                      setIsFolderOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                      activeTab === 'org-setup' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>1. Corporate Setup</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('property-setup');
                      setIsFolderOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                      activeTab === 'property-setup' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Home className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>2. Stays Registry</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('customers');
                      setIsFolderOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                      activeTab === 'customers' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>3. Customers Directory</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('audit-logs');
                      setIsFolderOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                      activeTab === 'audit-logs' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileLock2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>4. Forensic Audit Logs</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('queries-notifications');
                      setIsFolderOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition relative z-10 ${
                      activeTab === 'queries-notifications' ? 'bg-indigo-50 text-indigo-750 font-bold' : 'text-slate-750 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>5. Queries & Chats</span>
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
                    onClick={() => {
                      setIsFolderOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 relative z-10"
                  >
                    <ArrowLeft className="w-4 h-4 text-rose-500" />
                    <span>Logout HQ</span>
                  </button>
                </div>
              )}
            </div>
            
            </div>



          {/* Quick Select Scope Entity */}

          <div className="space-y-1">

            <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Current SCOPED Corporate</label>

            <select 

              value={selectedOrgId}

              onChange={(e) => setSelectedOrgId(e.target.value)}

              className="w-full text-xs font-bold bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 shadow-xs"

            >

              {organizations.map(org => (

                <option key={org.id} value={org.id}>

                  {org.name} ({org.status})

                </option>

              ))}

            </select>

          </div>



          {/* Central Nav Tabs */}

          <nav className="hidden lg:flex lg:flex-col lg:space-y-1 text-xs lg:pb-0 scrollbar-none">
            <button 
              onClick={() => setActiveTab('org-setup')}
              className={`w-auto lg:w-full shrink-0 flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                activeTab === 'org-setup' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
              <span>1. Corporate & Branch Setup</span>
            </button>

            <button 
              onClick={() => setActiveTab('property-setup')}
              className={`w-auto lg:w-full shrink-0 flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                activeTab === 'property-setup' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Home className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
              <span>2. Stays / Assets Registry</span>
            </button>

            <button 
              onClick={() => setActiveTab('customers')}
              className={`w-auto lg:w-full shrink-0 flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                activeTab === 'customers' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
              <span>3. Customers Directory</span>
            </button>

            <button 
              onClick={() => setActiveTab('audit-logs')}
              className={`w-auto lg:w-full shrink-0 flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                activeTab === 'audit-logs' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <FileLock2 className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
              <span>4. Forensic Audit Logs</span>
            </button>

            <button 
              onClick={() => setActiveTab('queries-notifications')}
              className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                activeTab === 'queries-notifications' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
                <span>5. Queries & Chats</span>
              </div>
              {unreadQueriesCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {unreadQueriesCount}
                </span>
              )}
            </button>

            <button 
              onClick={onLogout}
              className="hidden lg:flex w-full shrink-0 items-center space-x-3 px-3.5 py-3 rounded-xl transition text-rose-600 hover:bg-rose-50 font-bold"
            >
              <ArrowLeft className="w-4.5 h-4.5 shrink-0 text-rose-500" />
              <span>Logout HQ</span>
            </button>

            <div className="hidden lg:flex w-full justify-center py-2 scale-[0.8] lg:scale-100 -my-2.5">
              <label className="togglesw-premium" title="Change daylight/dark mode">
                <input className="togglesw-input" type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                <div className="togglesw-indicator left"></div>
                <div className="togglesw-indicator right"></div>
                <div className="togglesw-btn"></div>
              </label>
            </div>
          </nav>



        </div>



        {/* Console Health Meter */}

        <div className="bg-white p-4 rounded-2xl border border-slate-250 space-y-1.5 shadow-xs mt-4 hidden lg:block">

          <span className="font-bold text-[9px] text-slate-500 font-mono uppercase block tracking-wider">Enterprise Status Monitor</span>

          <div className="flex items-center space-x-2 text-indigo-600">

            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse inline-block" />

            <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">SYSTEM SECURE & COMPLIANT</span>

          </div>

        </div>

      </aside>



      {/* RIGHT MAIN WORKSPACE */}

      <main className="lg:col-span-9 p-6 space-y-6 overflow-y-auto max-h-[85vh] sm:max-h-none">

        

        {/* Top universal Header Block */}

        <div className="bg-white p-5 rounded-3xl border border-slate-150/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div className="space-y-1">

            <span className="bg-fuchsia-150 text-fuchsia-800 border border-fuchsia-200 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase font-mono tracking-wider">

              HQ Administration Console

            </span>

            <h2 className="text-xl font-black text-slate-1000 font-display tracking-tight flex items-center gap-2">

              <span>{organizations.find(o => o.id === selectedOrgId)?.name || 'HQ Console'}</span>

              <span className="text-slate-300">/</span>

              <span className="text-slate-500 text-sm font-semibold tracking-normal font-sans">Multi-Tenant Setup Panel</span>

            </h2>

          </div>

        </div>



        {/* =========================================================================

            TAB 1: CORPORATE SETUP & BRAND LOGO & BRANCHES

            ========================================================================= */}

        {activeTab === 'org-setup' && (

          <div className="space-y-6 animate-fadeIn text-xs">

            

            {/* Split Grid: Details form + Logo Sandbox */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              

              {/* Company Details */}

              <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">

                <div className="border-b pb-2 flex justify-between items-center">

                  <div>

                    <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-1.5">

                      <Briefcase className="w-4 h-4 text-indigo-500" />

                      <span>Company Registry Details</span>

                    </h3>

                    <p className="text-[10px] text-slate-405">Manage business identification, registration keys, & billing addresses</p>

                  </div>

                  <button 

                    onClick={() => setShowOrgModal(true)}

                    className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center space-x-1"

                  >

                    <Plus className="w-3.5 h-3.5" />

                    <span>New Org</span>

                  </button>

                </div>



                <form onSubmit={handleSaveCompanyDetails} className="space-y-3 pt-1">

                  <div className="grid grid-cols-2 gap-2">

                    <div>

                      <label className="block text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Incorporation Date</label>

                      <input 

                        type="date"

                        value={editDetailsForm.incorporationDate}

                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, incorporationDate: e.target.value })}

                        className="w-full border rounded-lg p-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white"

                      />

                    </div>

                    <div>

                      <label className="block text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Headquarters Phone</label>

                      <input 

                        type="text"

                        value={editDetailsForm.phone}

                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, phone: e.target.value })}

                        placeholder="+91 80 4000 0000"

                        className="w-full border rounded-lg p-2 bg-slate-50/20 focus:bg-white font-mono"

                      />

                    </div>

                  </div>



                  <div className="grid grid-cols-2 gap-2">

                    <div>

                      <label className="block text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-wider">GSTIN Number</label>

                      <input 

                        type="text"

                        value={editDetailsForm.gstin}

                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, gstin: e.target.value })}

                        placeholder="GSTIN Code"

                        className="w-full border rounded-lg p-2 bg-slate-50/20 focus:bg-white font-mono uppercase font-black"

                      />

                    </div>

                    <div>

                      <label className="block text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Corporate Reg Number</label>

                      <input 

                        type="text"

                        value={editDetailsForm.regNo}

                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, regNo: e.target.value })}

                        placeholder="U12500..."

                        className="w-full border rounded-lg p-2 bg-slate-50/20 focus:bg-white font-mono"

                      />

                    </div>

                  </div>



                  <div>

                    <label className="block text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Registered Corporate Headquarters Address</label>

                    <textarea 

                      value={editDetailsForm.address}

                      onChange={(e) => setEditDetailsForm({ ...editDetailsForm, address: e.target.value })}

                      placeholder="Full administrative address..."

                      className="w-full border rounded-lg p-2 bg-slate-50/20 focus:bg-white h-16 leading-relaxed font-semibold text-slate-700"

                    />

                  </div>



                  <button 

                    type="submit"

                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider transition shadow-sm"

                  >

                    Save Corporate Profile Credentials

                  </button>

                </form>

              </div>



              {/* Logo Upload Interface section */}

              <div className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">

                <div>

                  <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-1.5">

                    <Upload className="w-4 h-4 text-emerald-500" />

                    <span>Brand Logo Setup Console</span>

                  </h3>

                  <p className="text-[10px] text-slate-400">Configure visual system stamp. Supported in standard high-fidelity layout scales</p>

                </div>



                {/* Main active logo rendering area */}

                <div className="bg-slate-50 p-4 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">

                  <div className="flex items-center space-x-3">

                    <div className="shrink-0">

                      {renderLogoStamp(selectedOrgId)}

                    </div>

                    <div>

                      <div className="font-bold text-slate-900">Current Corporate Logo</div>

                      <span className="text-[10px] text-slate-400 block mt-0.5">Asset rendering code: <strong className="font-mono text-slate-600 text-[9px]">{orgLogoMap[selectedOrgId]?.substring(0, 30) || 'None'}...</strong></span>

                    </div>

                  </div>



                  {/* Manual trigger form */}

                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 px-3 rounded-lg text-[10px] uppercase cursor-pointer shrink-0 text-center shadow-xs">

                    <span>Choose File</span>

                    <input 

                      type="file" 

                      accept="image/*" 

                      onChange={handleSimulatedImageUpload}

                      className="hidden" 

                    />

                  </label>

                </div>



                {/* Simulated progress indicator */}

                {simulatedUploading && (

                  <div className="space-y-1.5 bg-amber-50 border border-amber-100 p-3 rounded-xl animate-pulse">

                    <div className="flex justify-between text-[9px] font-bold text-amber-800">

                      <span>Simulating crop and resize matrix...</span>

                      <span>{uploadProgress}%</span>

                    </div>

                    <div className="w-full bg-amber-200 rounded-full h-1.5">

                      <div className="bg-amber-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />

                    </div>

                  </div>

                )}



                {/* Predefined Beautiful Stamp Presets */}

                <div className="space-y-2">

                  <span className="text-[10px] block text-slate-500 uppercase font-bold tracking-wider">Or Select Corporate Logo Stamps</span>

                  <div className="grid grid-cols-2 gap-2">

                    {predesignedLogos.map((preset, idx) => (

                      <button 

                        key={idx}

                        type="button"

                        onClick={() => handleSelectQuickLogo(preset.char)}

                        className="bg-slate-50 hover:bg-indigo-50 border hover:border-indigo-200 p-2 rounded-xl flex items-center space-x-2 transition text-left"

                      >

                        <span className="text-xl shrink-0">{preset.char}</span>

                        <div>

                          <strong className="text-[10px] text-slate-700 block leading-none font-bold">{preset.name}</strong>

                          <span className="text-[8px] text-slate-400 font-mono">Quick Stamp</span>

                        </div>

                      </button>

                    ))}

                  </div>

                </div>

              </div>



            </div>



            {/* Geographical Branch Management Console */}

            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">

                <div>

                  <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-1.5">

                    <Store className="w-4.5 h-4.5 text-indigo-500" />

                    <span>Primary Regional Branches</span>

                  </h3>

                  <p className="text-[10px] text-slate-400">Manage separate hub centers, operational branches, and contact phone terminals</p>

                </div>



                <button 

                  onClick={() => setShowBranchModal(true)}

                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl leading-none transition text-[10px] flex items-center space-x-1"

                >

                  <Plus className="w-3.5 h-3.5" />

                  <span>Establish Regional Branch</span>

                </button>

              </div>



              {/* Branches registry list */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {branches.filter(b => b.orgId === selectedOrgId).map(branch => {

                  // Count property assets registered under this branch area as simulation

                  const matchingBranchProps = properties.filter(p => p.orgId === selectedOrgId && p.city.toLowerCase().includes(branch.location.toLowerCase().split(',')[0].trim().toLowerCase()));

                  return (

                    <div key={branch.id} className="bg-slate-50/50 border rounded-2xl p-4 flex flex-col justify-between space-y-3 relative hover:bg-slate-50 transition">

                      <div className="space-y-1">

                        <div className="flex justify-between items-start">

                          <h4 className="font-black text-slate-900 text-xs leading-snug">{branch.name}</h4>

                          <button 

                            onClick={() => handleDeleteBranch(branch.id, branch.name)}

                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"

                            title="Decommission Branch"

                          >

                            <Trash2 className="w-3.5 h-3.5" />

                          </button>

                        </div>

                        <span className="text-[10px] text-slate-500 flex items-center gap-1">

                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />

                          <span>{branch.location}</span>

                        </span>

                      </div>



                      <div className="border-t border-slate-100 pt-2 text-[10.5px] space-y-1 text-slate-600">

                        <div className="flex justify-between">

                          <span>Branch Area Lead:</span>

                          <span className="font-bold text-slate-800">{branch.manager}</span>

                        </div>

                        <div className="flex justify-between">

                          <span>Urgent Helpline:</span>

                          <span className="font-mono text-slate-700 font-bold">{branch.contact}</span>

                        </div>

                      </div>



                      <div className="bg-white border rounded-lg p-1.5 text-center text-[9px] font-bold text-slate-500 uppercase flex justify-between items-center px-2">

                        <span>Active properties link:</span>

                        <span className="text-indigo-650 font-black">{matchingBranchProps.length || 1} units</span>

                      </div>

                    </div>

                  );

                })}



                {branches.filter(b => b.orgId === selectedOrgId).length === 0 && (

                  <div className="col-span-full text-center py-12 space-y-2">

                    <Store className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1} />

                    <p className="italic text-slate-400">No geographical branches recorded for this scoped enterprise organization. Add your first branch above!</p>

                  </div>

                )}

              </div>

            </div>



          </div>

        )}



        {/* =========================================================================

            TAB 2: PROPERTY SETUP: HOTEL LIST, PG LIST & ACTIVATION TOGGLE

            ========================================================================= */}

        {activeTab === 'property-setup' && (
          showPropertyModal ? (
            <div className="space-y-6 animate-fadeIn text-xs font-semibold bg-white p-6 sm:p-8 rounded-3xl border border-slate-205 shadow-md max-w-2xl mx-auto my-4 text-slate-800 text-left">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-base font-display text-slate-950">
                    {editingPropertyId ? 'Modify Property Asset Record' : 'Establish New Property Registry'}
                  </h3>
                  <p className="text-[10px] text-slate-405 mt-0.5 font-sans font-medium">Configure operational metrics, global definitions, and regional manager profile</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingPropertyId(null);
                  }} 
                  className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to List</span>
                </button>
              </div>

              <form onSubmit={handleSaveProperty} className="space-y-4 font-sans font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Property Form Type *</label>
                    <select 
                      value={propertyForm.type}
                      onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value as 'Hotel' | 'PG' })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold focus:bg-white outline-none"
                    >
                      <option value="Hotel">🏨 Hotel structure</option>
                      <option value="PG">🏘️ Paying Guest Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Total Rooms *</label>
                    <input 
                      type="number" 
                      value={propertyForm.totalRooms}
                      onChange={(e) => setPropertyForm({ ...propertyForm, totalRooms: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-mono font-bold focus:bg-white outline-none"
                      required
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Property Asset Name *</label>
                  <input 
                    type="text" 
                    value={propertyForm.name}
                    onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                    placeholder="E.g., Grand Palace Oasis"
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Operational City *</label>
                    <input 
                      type="text" 
                      value={propertyForm.city}
                      onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                      placeholder="E.g., Bangalore East"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-bold focus:bg-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Google Maps Location Link (Optional)</label>
                    <input 
                      type="url" 
                      value={propertyForm.locationLink}
                      onChange={(e) => setPropertyForm({ ...propertyForm, locationLink: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-semibold focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Physical Postal Address *</label>
                  <textarea 
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                    placeholder="Enter complete postal location address..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px] text-slate-500">Perks & Shared Amenities (comma-separated)</label>
                    <input 
                      type="text" 
                      value={propertyForm.amenities}
                      onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                      placeholder="WiFi, AC, TV, Food Menu, CCTV, Security"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-650 mb-1.5 font-bold text-[11px] text-slate-500">Premises Code of Conduct & Rules (comma-separated)</label>
                    <input 
                      type="text" 
                      value={propertyForm.rules}
                      onChange={(e) => setPropertyForm({ ...propertyForm, rules: e.target.value })}
                      placeholder="No smoking, Gate closed after 10:30 PM"
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                  <h4 className="font-extrabold text-[12px] font-display text-indigo-650 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>👤 Regional Property Manager / Admin Credentials</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-normal">Specify credentials for this property's supervisor. They can log in to the Operator Console using their Email and Password.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Admin Full Name *</label>
                      <input 
                        type="text" 
                        value={propertyForm.adminName}
                        onChange={(e) => setPropertyForm({ ...propertyForm, adminName: e.target.value })}
                        placeholder="E.g., Priya Sharma"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Admin Phone Number *</label>
                      <input 
                        type="text" 
                        value={propertyForm.adminPhone}
                        onChange={(e) => setPropertyForm({ ...propertyForm, adminPhone: e.target.value })}
                        placeholder="E.g., +91 98765 43210"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Admin Email Username *</label>
                      <input 
                        type="email" 
                        value={propertyForm.adminEmail}
                        onChange={(e) => setPropertyForm({ ...propertyForm, adminEmail: e.target.value })}
                        placeholder="E.g., manager_hsr@homelystays.com"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-650 mb-1.5 font-bold text-[11px]">Admin Access Password *</label>
                      <input 
                        type="password" 
                        value={propertyForm.adminPassword}
                        onChange={(e) => setPropertyForm({ ...propertyForm, adminPassword: e.target.value })}
                        placeholder="Create password for admin login"
                        className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-black py-3 rounded-xl uppercase tracking-wider font-display shadow-md transition-all duration-200 mt-2 text-xs cursor-pointer"
                >
                  {editingPropertyId ? 'Apply Property Improvements' : 'Confirm Property Registration Seal'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn text-xs font-semibold">
              <div className="bg-white p-3.5 border rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-3 text-left">
                <div className="flex flex-wrap space-x-1.5 w-full sm:w-auto">
                  <button 
                    onClick={() => setPropertyFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      propertyFilter === 'All' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>All Operational Assets</span>
                    <span className="font-mono text-[9px] font-bold bg-indigo-50 text-indigo-705 px-1.5 py-0.5 rounded-md">{properties.length}</span>
                  </button>

                  <button 
                    onClick={() => setPropertyFilter('Hotel')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      propertyFilter === 'Hotel' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-658'
                    }`}
                  >
                    <span>Hotels ({hotelCount})</span>
                  </button>

                  <button 
                    onClick={() => setPropertyFilter('PG')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      propertyFilter === 'PG' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-658'
                    }`}
                  >
                    <span>Paying Guest units ({pgCount})</span>
                  </button>
                </div>

                <button 
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
                      locationLink: '',
                      adminName: '',
                      adminEmail: '',
                      adminPhone: '',
                      adminPassword: ''
                    });
                    setShowPropertyModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-3.5 rounded-xl text-[10.5px] flex items-center space-x-1 shadow-sm shrink-0 uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Property Registry</span>
                </button>
              </div>

              <div className="relative bg-white p-3 border rounded-2xl shadow-sm text-left">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search stays by name, city or address..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition"
                  />
                  {propertySearchQuery && (
                    <button
                      onClick={() => setPropertySearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 text-left">
                {filteredProperties.map(prop => {
                  const isDeactivated = deactivatedPropIds.includes(prop.id);
                  
                  return (
                    <div 
                      key={prop.id} 
                      onClick={() => setSelectedPropertyInsightId(prop.id)}
                      className={`hq-property-card cursor-pointer hover:shadow-md hover:border-indigo-400 bg-white border text-xs rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm space-y-1.5 sm:space-y-3.5 transition flex flex-col justify-between ${
                        isDeactivated ? 'border-dashed border-rose-200 bg-slate-50/50 opacity-90' : 'hover:border-slate-350'
                      }`}
                    >
                      <div className="space-y-1 sm:space-y-2 flex-grow">
                        {prop.imageUrl ? (
                          <div className="w-full h-14 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-slate-105 border border-slate-150">
                            <img 
                              src={prop.imageUrl} 
                              alt={prop.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-14 sm:h-28 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-slate-400">
                            <span className="text-[7px] sm:text-[10px] font-bold uppercase tracking-wider text-center px-1">No Image</span>
                          </div>
                        )}

                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="flex justify-between items-center gap-0.5">
                            <span className="bg-indigo-50 text-indigo-705 border border-indigo-100 rounded text-[6px] sm:text-[7.5px] px-0.5 sm:px-1 py-0.5 font-black uppercase w-max">
                              {prop.type === 'Hotel' ? '🏨 Hotel' : '🏘️ PG'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-[6px] sm:text-[9px] font-mono font-bold text-slate-400">ID: {prop.id}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPropertyForm({
                                    name: prop.name || '',
                                    type: prop.type || 'Hotel',
                                    city: prop.city || '',
                                    address: prop.address || '',
                                    totalRooms: prop.totalRooms || 6,
                                    amenities: (prop.amenities || []).join(', '),
                                    rules: (prop.rules || []).join(', '),
                                    orgId: prop.orgId || selectedOrgId,
                                    locationLink: prop.locationLink || '',
                                    adminName: prop.adminName || '',
                                    adminEmail: prop.adminEmail || '',
                                    adminPhone: prop.adminPhone || '',
                                    adminPassword: prop.adminPassword || ''
                                  });
                                  setEditingPropertyId(prop.id);
                                  setShowPropertyModal(true);
                                }}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-indigo-600 transition flex items-center justify-center cursor-pointer border border-slate-200/50"
                                title="Edit Property"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-[10px] sm:text-sm font-display tracking-tight leading-snug line-clamp-2 sm:line-clamp-1">
                            {prop.name}
                          </h4>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 sm:pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex flex-col">
                          <span className="text-[5.5px] sm:text-[8px] text-slate-400 uppercase tracking-widest font-black font-mono">ROOMS COUNT</span>
                          <span className="font-mono text-slate-900 font-extrabold text-[9px] sm:text-xs">
                            {prop.totalRooms || 6} Units
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full ${isDeactivated ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          <span className="text-[6.5px] sm:text-[8.5px] font-black uppercase text-slate-400">
                            {isDeactivated ? 'DEACTIVE' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}



        {/* =========================================================================

            TAB 2: CUSTOMERS DIRECTORY AND PROFILE MATRIX

            ========================================================================= */}

        {activeTab === 'customers' && (

          <div className="space-y-6 animate-fadeIn text-xs">

            {/* Header */}

            <div className="bg-white p-5 rounded-3xl border border-slate-150/80 shadow-sm flex justify-between items-center">

              <div>

                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-none">Customers Directory</h3>

                <p className="text-[10px] text-slate-400 mt-1">Directory of all registered, onboarding, and stayed customers</p>

              </div>

              <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg">

                Total: {tenants.length} Accounts

              </span>

            </div>



            {/* SEARCH BAR FOR CUSTOMERS */}

            <div className="relative bg-white p-3 border rounded-2xl shadow-sm">

              <div className="relative">

                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input

                  type="text"

                  placeholder="Search customers by name, phone, or stayed property address..."

                  value={customerSearchQuery}

                  onChange={(e) => setCustomerSearchQuery(e.target.value)}

                  className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition"

                />

                {customerSearchQuery && (

                  <button

                    onClick={() => setCustomerSearchQuery('')}

                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"

                  >

                    <X className="w-3.5 h-3.5" />

                  </button>

                )}

              </div>

            </div>



            {/* List Grid */}

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">

              {tenants.filter(tenant => {

                const query = customerSearchQuery.trim().toLowerCase();

                if (!query) return true;

                const matchedProp = properties.find(p => p.id === tenant.propertyId);

                const propAddress = matchedProp ? matchedProp.address : 'N/A';

                const propCity = matchedProp ? matchedProp.city : 'N/A';

                

                return (

                  tenant.name.toLowerCase().includes(query) ||

                  (tenant.phone && tenant.phone.toLowerCase().includes(query)) ||

                  (tenant.propertyName && tenant.propertyName.toLowerCase().includes(query)) ||

                  propAddress.toLowerCase().includes(query) ||

                  propCity.toLowerCase().includes(query)

                );

              }).map(tenant => {

                const isStaying = tenant.propertyId && tenant.propertyId !== 'none';

                const matchedProp = properties.find(p => p.id === tenant.propertyId);

                const propAddress = matchedProp ? matchedProp.address : 'N/A';

                const propCity = matchedProp ? matchedProp.city : 'N/A';

                

                return (

                  <div 

                    key={tenant.id} 

                    onClick={() => setSelectedCustomerDetailId(tenant.id)}

                    className="hq-customer-card cursor-pointer hover:shadow-md hover:border-indigo-400 bg-white border text-xs rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm space-y-1.5 sm:space-y-3.5 transition flex flex-col justify-between"

                  >

                    <div className="space-y-1 sm:space-y-2 flex-grow">

                      {/* Uploaded KYC photo */}

                      {tenant.docUrl ? (

                        <div className="w-full h-14 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 border border-slate-150">

                          <img 

                            src={tenant.docUrl} 

                            alt={tenant.name} 

                            className="w-full h-full object-cover"

                          />

                        </div>

                      ) : (

                        <div className="w-full h-14 sm:h-28 rounded-lg sm:rounded-xl flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-slate-400">

                          <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider text-center px-1">No KYC</span>

                        </div>

                      )}



                      <div className="space-y-0.5 sm:space-y-1">

                        <h4 className="font-extrabold text-slate-900 text-[10px] sm:text-xs truncate">{tenant.name}</h4>

                        <div className="text-[8px] sm:text-[10px] text-slate-500 font-mono font-bold truncate">{tenant.phone || 'No Mobile'}</div>

                      </div>



                      {/* Staying Status Pill */}

                      <div className="pt-0.5 sm:pt-1 flex items-center justify-between">

                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[7px] sm:text-[8.5px] uppercase ${isStaying ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-slate-105 text-slate-600 border border-slate-200'}`}>

                          {isStaying ? 'Staying' : 'Not Staying'}

                        </span>

                      </div>



                      {isStaying && (

                        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 text-[8px] sm:text-[10px] space-y-0.5 sm:space-y-1 text-slate-500">

                          <div className="truncate">

                            <span className="font-extrabold text-slate-700">Stay:</span> {tenant.propertyName}

                          </div>

                          <div className="truncate font-mono text-[7px] sm:text-[9px]">

                            {propAddress}, {propCity}

                          </div>

                        </div>

                      )}

                    </div>



                    <div className="pt-1.5 sm:pt-2.5 border-t border-slate-100/80 flex items-center justify-between gap-1">

                      <div className="text-[7px] sm:text-[9px] text-slate-400 font-mono truncate">

                        ID: {tenant.id.split('-')[1] || tenant.id}

                      </div>

                      <button

                        onClick={(e) => {

                          e.stopPropagation();

                          handleDeleteTenant(tenant.id, tenant.name);

                        }}

                        className="p-0.5 sm:p-1 px-1 sm:px-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-transparent hover:border-rose-200 shrink-0"

                        title="Delete Customer Account"

                      >

                        <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />

                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}



        {/* =========================================================================

            TAB 3: USER MANAGEMENT: ADMIN LIST, STAFF CRUD & ROLE PERMISSION MATRIX

            ========================================================================= */}

        



        {/* =========================================================================

            TAB 4: FORENSIC AUDIT TRAILS & SESSIONS LEDGER

            ========================================================================= */}

        {activeTab === 'audit-logs' && (

          <div className="space-y-6 animate-fadeIn text-xs">

            

            {/* Split subtab links */}

            <div className="bg-white p-2.5 rounded-2xl border flex space-x-1 font-bold">

              <button 

                onClick={() => setLogSection('login-history')}

                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${

                  logSection === 'login-history' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600 font-semibold'

                }`}

              >

                <History className="w-4 h-4" />

                <span>Login History & Sessions Ledger</span>

              </button>



              <button 

                onClick={() => setLogSection('change-logs')}

                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${

                  logSection === 'change-logs' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600 font-semibold'

                }`}

              >

                <FileText className="w-4 h-4" />

                <span>SuperAdmin Change Logs</span>

              </button>



              <button 

                onClick={() => setLogSection('all-timeline')}

                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${

                  logSection === 'all-timeline' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600 font-semibold'

                }`}

              >

                <Sliders className="w-4 h-4" />

                <span>All Event Timelines ({auditLogs.length})</span>

              </button>

            </div>



            {/* login-history content */}

            {logSection === 'login-history' && (

              <div className="space-y-4">

                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="font-extrabold text-sm text-slate-950 font-display">System Active Access Sessions Ledger</h3>

                    <p className="text-[10px] text-slate-400">Chronological history of signed admin terminals with IP locations & device stamps</p>

                  </div>

                  <button 

                    onClick={() => {

                      pushMockLoginRecord('unknown-intruder@anonymous.net', 'Public Device', 'Failure');

                      alert('Pushed simulated login validation failure into system auditing trail.');

                    }}

                    className="bg-rose-50 border border-rose-200 text-rose-705 p-1 px-3 rounded-lg text-[10px]"

                  >

                    Simulate Failed Login

                  </button>

                </div>



                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase">

                        <th className="p-4 text-[10px]">User email signature</th>

                        <th className="p-4 text-[10px]">Role Clear</th>

                        <th className="p-4 text-[10px]">Timestamp (UTC)</th>

                        <th className="p-4 text-[10px]">Logged IP Code</th>

                        <th className="p-4 text-[10px]">Browser Client</th>

                        <th className="p-4 text-center text-[10px]">Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {loginHistoryList.map(rec => (

                        <tr key={rec.id} className="border-b last:border-b-0">

                          <td className="p-4 font-black text-slate-900">{rec.userEmail}</td>

                          <td className="p-4 text-slate-550 font-semibold">{rec.role}</td>

                          <td className="p-4 font-mono font-bold text-slate-500">

                            {rec.timestamp.replace('T', ' ').substring(0, 19)}

                          </td>

                          <td className="p-4 font-mono font-black text-slate-900">{rec.ipAddress}</td>

                          <td className="p-4 font-mono text-slate-450 text-[10px]">{rec.device}</td>

                          <td className="p-4 text-center">

                            {rec.status === 'Success' ? (

                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 font-bold text-[9px] uppercase">

                                SUCCESS

                              </span>

                            ) : (

                              <span className="bg-rose-50 text-rose-700 border border-rose-200 rounded px-2 py-0.5 font-bold text-[9px] uppercase animate-pulse">

                                FAILED

                              </span>

                            )}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}



            {/* change-logs records */}

            {logSection === 'change-logs' && (

              <div className="space-y-4">

                <div>

                  <h3 className="font-extrabold text-sm text-slate-950 font-display">Administrative Modifications ledger</h3>

                  <p className="text-[10px] text-slate-400">Strictly filter actions executed under Level-3 Super Corporate privilege</p>

                </div>



                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase">

                        <th className="p-4 text-[10px]">Transaction action Trace</th>

                        <th className="p-4 text-[10px]">Executive</th>

                        <th className="p-4 text-[10px]">Logged Station IP</th>

                        <th className="p-4 text-[10px]">Audit timestamp</th>

                        <th className="p-4 text-center text-[10px]">Scope Seal</th>

                      </tr>

                    </thead>

                    <tbody>

                      {auditLogs.filter(l => l.module === 'SuperAdmin').map(log => (

                        <tr key={log.id} className="border-b last:border-b-0 hover:bg-slate-50/40">

                          <td className="p-4 font-black font-sans text-slate-900 leading-snug">{log.action}</td>

                          <td className="p-4 font-mono text-indigo-700 text-[11px]">{log.userEmail}</td>

                          <td className="p-4 font-mono font-bold text-slate-700">{log.ip}</td>

                          <td className="p-4 font-mono text-slate-500">

                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; {new Date(log.timestamp).toLocaleDateString()}

                          </td>

                          <td className="p-4 text-center">

                            <span className="bg-slate-100 text-slate-705 border rounded-md px-1.5 py-0.5 font-mono text-[8px] tracking-wider uppercase font-extrabold">

                              SOC2 SECURED

                            </span>

                          </td>

                        </tr>

                      ))}



                      {auditLogs.filter(l => l.module === 'SuperAdmin').length === 0 && (

                        <tr>

                          <td colSpan={5} className="text-center py-12 italic text-slate-400">

                            No SuperAdmin transactions logged in active context session. Trigger organizational additions or toggles!

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}



            {/* all timelines registry */}

            {logSection === 'all-timeline' && (

              <div className="space-y-4">

                <div>

                  <h3 className="font-extrabold text-sm text-slate-950 font-display">System Consolidated Timelines</h3>

                  <p className="text-[10px] text-slate-400">Consolidated history tracking all modules: billing, visitors, dining schedules and unit allocations</p>

                </div>



                <div className="bg-white border rounded-3xl p-4 shadow-sm max-h-[460px] overflow-y-auto space-y-2">

                  {auditLogs.map(log => (

                    <div key={log.id} className="p-3 bg-slate-50 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px]">

                      <div className="flex items-start gap-2">

                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-707 rounded text-[8.5px] px-1.5 py-0.5 font-bold uppercase font-mono mt-0.5">

                          {log.module}

                        </span>

                        <div>

                          <p className="text-slate-900 font-extrabold tracking-tight">{log.action}</p>

                          <span className="text-[9.5px] text-slate-400">Executor: <strong>{log.userEmail}</strong> &bull; IP: {log.ip}</span>

                        </div>

                      </div>

                      <span className="text-[9.5px] font-mono text-slate-500 shrink-0 uppercase tracking-widest font-extrabold text-right">

                        {log.timestamp.replace('T', ' ').substring(11, 19)}

                      </span>

                    </div>

                  ))}

                </div>

              </div>

            )}



          </div>

        )}

        {/* =========================================================================

            TAB 5: QUERIES & CORPORATE CHATS SYSTEM

            ========================================================================= */}

        {activeTab === 'queries-notifications' && (

          <div className="space-y-6 animate-fadeIn text-xs">

            

            {/* Header banner */}

            <div className="bg-white p-5 rounded-3xl border border-slate-150/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

              <div className="space-y-1">

                <span className="bg-indigo-50 border border-indigo-150 text-indigo-707 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase font-mono tracking-wider">

                  Communications & Notifications Portal

                </span>

                <h2 className="text-xl font-black text-slate-1000 font-display tracking-tight flex items-center gap-2">

                  <span>Customer Queries & Corporate Admin Chats</span>

                </h2>

                <p className="text-slate-400 mt-1 text-[11px]">Respond to client messages and chat in real-time with property branch managers.</p>

              </div>

            </div>

            

            {/* Split panel grid: left side is list, right side is detailed message log */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[500px]">

              

              {/* Left pane: Threads list (col-span-4) */}

              <div className="lg:col-span-4 bg-white border border-slate-150 rounded-3xl p-4 flex flex-col gap-4 shadow-sm">

                

                {/* Search & Pills */}

                <div className="space-y-3 shrink-0">

                  

                  {/* Category Filter Pills */}

                  <div className="bg-slate-50 border border-slate-200/80 p-1 rounded-xl flex font-bold gap-0.5">

                    <button

                      onClick={() => setQueryFilter('all')}

                      className={`flex-1 py-1 px-2 rounded-lg text-center text-[10px] transition ${

                        queryFilter === 'all' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'

                      }`}

                    >

                      All

                    </button>

                    <button

                      onClick={() => setQueryFilter('customer')}

                      className={`flex-1 py-1 px-2 rounded-lg text-center text-[10px] transition ${

                        queryFilter === 'customer' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'

                      }`}

                    >

                      Customers

                    </button>

                    <button

                      onClick={() => setQueryFilter('admin')}

                      className={`flex-1 py-1 px-2 rounded-lg text-center text-[10px] transition ${

                        queryFilter === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'

                      }`}

                    >

                      Admins

                    </button>

                  </div>

                  

                  {/* Search thread input */}

                  <div className="relative">

                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

                    <input

                      type="text"

                      placeholder="Search threads..."

                      value={querySearch}

                      onChange={e => setQuerySearch(e.target.value)}

                      className="w-full pl-8 pr-7 py-1.5 text-[10.5px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"

                    />

                    {querySearch && (

                      <button

                        onClick={() => setQuerySearch('')}

                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"

                      >

                        <X className="w-3 h-3" />

                      </button>

                    )}

                  </div>

                  

                </div>



                {/* Scrollable list */}

                <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[500px] space-y-2 pr-1 scrollbar-none">

                  {queriesList

                    .filter(q => {

                      const matchesType = queryFilter === 'all' || q.type === queryFilter;

                      const qSearch = querySearch.trim().toLowerCase();

                      const matchesSearch = !qSearch || 

                        q.senderName.toLowerCase().includes(qSearch) ||

                        q.senderEmail.toLowerCase().includes(qSearch) ||

                        q.message.toLowerCase().includes(qSearch);

                      return matchesType && matchesSearch;

                    })

                    .map(q => {

                      const isSelected = selectedQueryId === q.id;

                      const lastMessage = q.replies.length > 0 ? q.replies[q.replies.length - 1].message : q.message;

                      const lastTime = q.replies.length > 0 ? q.replies[q.replies.length - 1].timestamp : q.timestamp;

                      

                      return (

                        <div

                          key={q.id}

                          onClick={() => setSelectedQueryId(q.id)}

                          className={`p-3 rounded-2xl border text-left cursor-pointer transition select-none flex flex-col gap-1.5 ${

                            isSelected 

                              ? 'bg-indigo-50/70 border-indigo-300' 

                              : 'bg-slate-50/40 hover:bg-slate-50 border-slate-200/60'

                          }`}

                        >

                          <div className="flex justify-between items-center">

                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono ${

                              q.type === 'customer' 

                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 

                                : 'bg-blue-105 text-blue-700 border border-blue-200'

                            }`}>

                              {q.type === 'customer' ? 'Customer' : 'Admin'}

                            </span>

                            

                            <span className="text-[8px] text-slate-400 font-mono">

                              {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                            </span>

                          </div>



                          <div className="space-y-0.5">

                            <h4 className="font-extrabold text-slate-900 text-[11px] truncate">

                              {q.senderName}

                            </h4>

                            <p className="text-[9.5px] text-slate-450 truncate font-mono">

                              {q.senderEmail}

                            </p>

                          </div>



                          <p className="text-[10px] text-slate-600 line-clamp-1 italic font-medium">

                            {lastMessage}

                          </p>



                          <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-200/50">

                            <span className="text-[8px] text-slate-400 font-mono">

                              {new Date(q.timestamp).toLocaleDateString()}

                            </span>



                            <span className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider ${

                              q.status === 'unread' 

                                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' 

                                : q.status === 'read'

                                ? 'bg-slate-100 text-slate-600 border border-slate-200'

                                : 'bg-emerald-100 text-emerald-700 border border-emerald-250'

                            }`}>

                              {q.status}

                            </span>

                          </div>

                        </div>

                      );

                    })}



                  {queriesList.filter(q => {

                    const matchesType = queryFilter === 'all' || q.type === queryFilter;

                    const qSearch = querySearch.trim().toLowerCase();

                    const matchesSearch = !qSearch || 

                      q.senderName.toLowerCase().includes(qSearch) ||

                      q.senderEmail.toLowerCase().includes(qSearch) ||

                      q.message.toLowerCase().includes(qSearch);

                    return matchesType && matchesSearch;

                  }).length === 0 && (

                    <div className="text-center py-12 space-y-2">

                      <MessageSquare className="w-7 h-7 text-slate-300 mx-auto" strokeWidth={1} />

                      <p className="italic text-slate-400">No communication threads found.</p>

                    </div>

                  )}

                </div>



              </div>



              {/* Right pane: Chat details pane (col-span-8) */}

              <div className="lg:col-span-8 bg-white border border-slate-150 rounded-3xl p-4 flex flex-col justify-between shadow-sm min-h-[450px]">

                

                {selectedQueryId ? (

                  (() => {

                    const q = queriesList.find(item => item.id === selectedQueryId);

                    if (!q) return null;

                    

                    return (

                      <div className="flex flex-col h-full justify-between gap-4">

                        

                        {/* Header details */}

                        <div className="border-b border-slate-150 pb-3 flex justify-between items-start shrink-0">

                          <div className="space-y-1">

                            <div className="flex items-center gap-2">

                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono ${

                                q.type === 'customer' 

                                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 

                                  : 'bg-blue-105 text-blue-700 border border-blue-200'

                              }`}>

                                {q.type === 'customer' ? 'Customer portal query' : 'Branch operator chat'}

                              </span>

                              

                              <span className="text-[10px] text-slate-400 font-mono">

                                Registered: {new Date(q.timestamp).toLocaleString()}

                              </span>

                            </div>

                            

                            <h3 className="font-extrabold text-slate-900 text-sm">

                              {q.senderName}

                            </h3>

                            <p className="text-[10px] text-slate-500 font-mono font-bold">

                              Email signature: {q.senderEmail || 'N/A'}

                            </p>

                          </div>



                          <button

                            onClick={() => setSelectedQueryId(null)}

                            className="bg-slate-50 hover:bg-slate-100 border p-1.5 rounded-lg text-slate-400 transition"

                            title="Close thread"

                          >

                            <X className="w-3.5 h-3.5" />

                          </button>

                        </div>



                        {/* Message list scrolling container */}

                        <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl max-h-[300px] lg:max-h-[360px]">

                          

                          {/* Original Query Message */}

                          <div className="flex justify-start">

                            <div className="max-w-[80%] rounded-2xl p-3 shadow-5xs bg-white text-slate-800 border border-slate-150/80 rounded-bl-none">

                              <span className="text-[8.5px] uppercase font-extrabold tracking-wider text-indigo-650 opacity-80 block mb-0.5">

                                {q.senderName} ({q.type === 'customer' ? 'Customer' : 'Admin'})

                              </span>

                              <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{q.message}</p>

                              <span className="text-[8px] text-slate-400 block mt-1 text-right font-mono">

                                {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                              </span>

                            </div>

                          </div>



                          {/* Replies list */}

                          {q.replies.map((reply, rIdx) => {

                            const isMe = reply.sender === 'Super Admin';

                            return (

                              <div key={rIdx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>

                                <div className={`max-w-[80%] rounded-2xl p-3 shadow-5xs ${

                                  isMe

                                    ? 'bg-fuchsia-600 text-white rounded-br-none' 

                                    : 'bg-white text-slate-800 border border-slate-150/80 rounded-bl-none'

                                }`}>

                                  <span className="text-[8.5px] uppercase font-extrabold tracking-wider opacity-85 block mb-0.5">

                                    {reply.sender}

                                  </span>

                                  <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{reply.message}</p>

                                  <span className="text-[8px] opacity-75 block mt-1 text-right font-mono">

                                    {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                                  </span>

                                </div>

                              </div>

                            );

                          })}



                        </div>



                        {/* Reply Form */}
                        {q.type === 'customer' ? (
                          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 shrink-0">
                            <p className="text-[10px] text-slate-400 italic font-medium">Customer queries are answered directly via email client.</p>
                            <a
                              href={`mailto:${q.senderEmail}?subject=${encodeURIComponent('Re: StayHub Query - ' + q.message.substring(0, 30) + '...')}&body=${encodeURIComponent('\n\n--- Original Query ---\n' + q.message)}`}
                              onClick={() => {
                                // Mark as replied when clicking
                                const updated = queriesList.map(item => {
                                  if (item.id === q.id) {
                                    return {
                                      ...item,
                                      status: 'replied' as const
                                    };
                                  }
                                  return item;
                                });
                                setLocalStorageData('stayhub_queries', updated);
                                setQueriesList(updated);
                                onAddAuditLog(`Super Admin initiated email response to customer "${q.senderName}"`, 'SuperAdmin');
                              }}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold p-3 rounded-2xl transition duration-200 text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-650/10 text-xs"
                            >
                              <Mail className="w-4 h-4 text-white" />
                              <span>Reply via Email ({q.senderEmail})</span>
                            </a>
                          </div>
                        ) : (
                          <form onSubmit={handleSendReply} className="flex gap-2 border-t border-slate-100 pt-3 shrink-0">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={`Type reply to ${q.senderName}...`}
                              className="flex-1 bg-slate-50 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-650 focus:bg-white text-slate-850"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-2xl transition duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
                              disabled={!replyText.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        )}



                      </div>

                    );

                  })()

                ) : (

                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">

                    <div className="bg-indigo-50 p-4 rounded-full">

                      <MessageSquare className="w-8 h-8 text-indigo-500 animate-bounce" />

                    </div>

                    <h4 className="font-bold text-slate-700 text-sm">Select a Conversation Thread</h4>

                    <p className="text-xs text-slate-400 max-w-xs leading-normal">

                      Click on any customer contact query or regional branch admin chat on the left panel to review and issue replies.

                    </p>

                  </div>

                )}



              </div>



            </div>



          </div>

        )}



      </main>



      {/* BRANCH MANAGEMENT POPUP CREATOR MODAL */}

      {showBranchModal && (

        <div id="branch-management-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">

          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative animate-scaleUp">

            <div className="flex justify-between items-center border-b pb-2 text-left">

              <div>

                <h3 className="font-extrabold text-sm font-display text-slate-950">Add Geographical Branch</h3>

                <p className="text-[10px] text-slate-400 mt-0.5">Define business sub-region hub to bundle active hotels or co-lives</p>

              </div>

              <button onClick={() => setShowBranchModal(false)} className="p-1 hover:bg-slate-100 rounded-full border transition-colors">

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>



            <form onSubmit={handleCreateBranch} className="space-y-3 pt-1 text-xs">

              <div>

                <label className="block text-slate-600 mb-1">Branch Name *</label>

                <input 

                  type="text" 

                  value={newBranchForm.name}

                  onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}

                  placeholder="E.g., Bangalore East Hub"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 hover:bg-slate-50 focus:bg-white"

                  required

                />

              </div>



              <div>

                <label className="block text-slate-600 mb-1">Geographical Location Area *</label>

                <input 

                  type="text" 

                  value={newBranchForm.location}

                  onChange={(e) => setNewBranchForm({ ...newBranchForm, location: e.target.value })}

                  placeholder="E.g., Whitefield Area Sector 3"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 hover:bg-slate-50 focus:bg-white"

                  required

                />

              </div>



              <div>

                <label className="block text-slate-600 mb-1">Branch Area Lead Manager</label>

                <input 

                  type="text" 

                  value={newBranchForm.manager}

                  onChange={(e) => setNewBranchForm({ ...newBranchForm, manager: e.target.value })}

                  placeholder="E.g., Srinadh Mohan"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 hover:bg-slate-50 focus:bg-white"

                />

              </div>



              <div>

                <label className="block text-slate-600 mb-1">Helpline Phone Call Contact</label>

                <input 

                  type="text" 

                  value={newBranchForm.contact}

                  onChange={(e) => setNewBranchForm({ ...newBranchForm, contact: e.target.value })}

                  placeholder="E.g., +91 99312 00388"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 hover:bg-slate-50 focus:bg-white font-mono"

                />

              </div>



              <button 

                type="submit"

                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider font-display shadow-md transition"

              >

                Provision Functional Branch Office

              </button>

            </form>

          </div>
        </div>
      )}









      {/* ADMIN CREATION MODAL */}

      



      {/* STAFF ADDITION MODAL */}

      



      {/* ORG REGISTRATION MODAL */}

      {showOrgModal && (

        <div id="org-registration-center" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">

          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">

            <div className="flex justify-between items-center border-b pb-2">

              <div>

                <h3 className="font-extrabold text-sm font-display text-slate-950">Add Multi-Tenant Corporate Entity</h3>

                <p className="text-[10px] text-slate-350">Setup parent corporate license for the Hotel or PG chain</p>

              </div>

              <button onClick={() => setShowOrgModal(false)} className="p-1 hover:bg-slate-100 rounded-full border">

                <X className="w-5 h-5" />

              </button>

            </div>



            <form onSubmit={handleCreateOrg} className="space-y-3.5 text-xs text-slate-700">

              <div>

                <label className="block text-slate-550 mb-1">Parent Corporate Name *</label>

                <input 

                  type="text" 

                  value={newOrgForm.name}

                  onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}

                  placeholder="E.g., StayNest Hospitality Services"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white"

                  required

                />

              </div>



              <div>

                <label className="block text-slate-550 mb-1">Enterprise Domain URL *</label>

                <input 

                  type="text" 

                  value={newOrgForm.domain}

                  onChange={(e) => setNewOrgForm({ ...newOrgForm, domain: e.target.value })}

                  placeholder="E.g., staynesthotels.co.in"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-mono"

                  required

                />

              </div>



              <div>

                <label className="block text-slate-550 mb-1">Corporate Contact Email</label>

                <input 

                  type="email" 

                  value={newOrgForm.contactEmail}

                  onChange={(e) => setNewOrgForm({ ...newOrgForm, contactEmail: e.target.value })}

                  placeholder="E.g., partner@staynesthotels.com"

                  className="w-full border rounded-xl p-2.5 bg-slate-50 focus:bg-white font-mono"

                />

              </div>



              <button 

                type="submit"

                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase tracking-wider font-display shadow-md transition"

              >

                Create Corporate license

              </button>

            </form>

          </div>

        </div>

      )}



    </div>

  );

}
