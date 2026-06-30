import React, { useState, useEffect } from 'react';
import { Organization, Property, AuditLog } from '../types';
import { 
  getLocalStorageData, 
  setLocalStorageData 
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
  Sparkles
} from 'lucide-react';

interface SuperAdminPanelProps {
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, module: 'SuperAdmin') => void;
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

interface StaffMember {
  id: string;
  name: string;
  role: 'Reception' | 'Housekeeping' | 'Kitchen' | 'Security';
  phone: string;
  assignedPropertyId: string;
  email: string;
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

export default function SuperAdminPanel({ auditLogs, onAddAuditLog }: SuperAdminPanelProps) {
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
  // "org-setup" | "property-setup" | "user-management" | "audit-logs"
  const [activeTab, setActiveTab ] = useState<'org-setup' | 'property-setup' | 'user-management' | 'audit-logs'>('org-setup');

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
    orgId: 'org-1'
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
            orgId: propertyForm.orgId
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
        orgId: propertyForm.orgId
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
      orgId: selectedOrgId
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

  const [selectedPropertyInsightId, setSelectedPropertyInsightId] = useState<string | null>(null);

  // -----------------------------------------
  // ADMINS & COMPREHENSIVE STAFF CRUD
  // -----------------------------------------
  const [adminsList, setAdminsList] = useState<{ id: string; name: string; email: string; assignedPropertyId: string; role: string }[]>(() => {
    return getLocalStorageData('admins_list', [
      { id: 'adm-1', name: 'Priya Shinde', email: 'priya.s@homelystays.com', assignedPropertyId: 'prop-1', role: 'Property Manager' },
      { id: 'adm-2', name: 'Kabir Singhania', email: 'kabir.s@apexhospitality.net', assignedPropertyId: 'prop-3', role: 'Regional Admin' },
      { id: 'adm-3', name: 'Naveen Kumar', email: 'naveen.k@grandresidency.co', assignedPropertyId: 'prop-2', role: 'Operations Lead' }
    ]);
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    return getLocalStorageData<StaffMember[]>('staff_directory_list', [
      { id: 'stf-1', name: 'Ramesh Singh', role: 'Housekeeping', phone: '+91 90022 34211', assignedPropertyId: 'prop-1', email: 'ramesh.s@homelystays.com' },
      { id: 'stf-2', name: 'Shanti Devi', role: 'Housekeeping', phone: '+91 80123 00411', assignedPropertyId: 'prop-1', email: 'shanti.d@homelystays.com' },
      { id: 'stf-3', name: 'Chef Balaji Deshpande', role: 'Kitchen', phone: '+91 97721 34509', assignedPropertyId: 'prop-1', email: 'balaji.chef@stayhub.co' },
      { id: 'stf-4', name: 'Raju Gachibowli Guard', role: 'Security', phone: '+91 94432 10098', assignedPropertyId: 'prop-2', email: 'raju.guard@grandresidency.co' },
      { id: 'stf-5', name: 'Meera Patel', role: 'Reception', phone: '+91 88022 90011', assignedPropertyId: 'prop-3', email: 'meera.recept@apexhospitality.net' }
    ]);
  });

  // Modal forms states for Admin & Staff additions
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    assignedPropertyId: '',
    role: 'Property Manager'
  });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Housekeeping' as StaffMember['role'],
    phone: '',
    email: '',
    assignedPropertyId: ''
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.assignedPropertyId) return;

    if (editingAdminId) {
      const updated = adminsList.map(a => {
        if (a.id === editingAdminId) {
          return {
            ...a,
            name: newAdminForm.name,
            email: newAdminForm.email,
            assignedPropertyId: newAdminForm.assignedPropertyId,
            role: newAdminForm.role
          };
        }
        return a;
      });
      setAdminsList(updated);
      setLocalStorageData('admins_list', updated);
      onAddAuditLog(`Modified credentials and settings for sub-admin ${newAdminForm.name}`, 'SuperAdmin');
      setEditingAdminId(null);
      setShowAdminModal(false);
      setNewAdminForm({ name: '', email: '', assignedPropertyId: '', role: 'Property Manager' });
      alert('Sub-Admin credentials updated successfully.');
    } else {
      const newAdm = {
        id: `adm-${Date.now()}`,
        name: newAdminForm.name,
        email: newAdminForm.email,
        assignedPropertyId: newAdminForm.assignedPropertyId,
        role: newAdminForm.role
      };

      const updated = [...adminsList, newAdm];
      setAdminsList(updated);
      setLocalStorageData('admins_list', updated);

      const propName = properties.find(p => p.id === newAdminForm.assignedPropertyId)?.name || 'Property';
      onAddAuditLog(`Assigned Sub-Admin credentials to ${newAdm.name} for managing ${propName}`, 'SuperAdmin');
      
      // Also push a simulated login history event
      pushMockLoginRecord(newAdm.email, newAdm.role, 'Success');

      setShowAdminModal(false);
      setNewAdminForm({ name: '', email: '', assignedPropertyId: '', role: 'Property Manager' });
      alert('Sub-Admin account registered successfully.');
    }
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (!confirm(`Revoke admin assignment and suspend system access for "${name}"?`)) return;
    const updated = adminsList.filter(a => a.id !== id);
    setAdminsList(updated);
    setLocalStorageData('admins_list', updated);
    onAddAuditLog(`Revoked admin privilege and logged out holder: ${name}`, 'SuperAdmin');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.assignedPropertyId || !newStaffForm.phone) return;

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      name: newStaffForm.name,
      role: newStaffForm.role,
      phone: newStaffForm.phone,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '')}@stayhub-staff.com`,
      assignedPropertyId: newStaffForm.assignedPropertyId
    };

    const updated = [...staffList, newStaff];
    setStaffList(updated);
    setLocalStorageData('staff_directory_list', updated);

    const destProp = properties.find(p => p.id === newStaff.assignedPropertyId)?.name || 'Assigned Property';
    onAddAuditLog(`Enrolled operational on-site staff "${newStaff.name}" as ${newStaff.role} inside ${destProp}`, 'SuperAdmin');
    setShowStaffModal(false);
    setNewStaffForm({ name: '', role: 'Housekeeping', phone: '', email: '', assignedPropertyId: '' });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (!confirm(`Are you certain you want to terminate/remove staff member "${name}" from StayHub list?`)) return;
    const updated = staffList.filter(s => s.id !== id);
    setStaffList(updated);
    setLocalStorageData('staff_directory_list', updated);
    onAddAuditLog(`Deregistered premises staff member: ${name}`, 'SuperAdmin');
  };

  // -----------------------------------------
  // SECURITY MATRICES
  // -----------------------------------------
  const [permissionsMatrix, setPermissionsMatrix] = useState<{ roleName: string; viewRooms: boolean; editBilling: boolean; manageHousekeeping: boolean; executeCheckin: boolean }[]>(() => {
    return getLocalStorageData('permissions_matrix', [
      { roleName: 'Super Corporate Executive', viewRooms: true, editBilling: true, manageHousekeeping: true, executeCheckin: true },
      { roleName: 'Property Admin Manager', viewRooms: true, editBilling: true, manageHousekeeping: true, executeCheckin: true },
      { roleName: 'Reception Desk Staff', viewRooms: true, editBilling: false, manageHousekeeping: true, executeCheckin: true },
      { roleName: 'Housekeeping Supervisor', viewRooms: true, editBilling: false, manageHousekeeping: true, executeCheckin: false }
    ]);
  });

  const handleToggleMatrixCheckbox = (idx: number, field: 'viewRooms' | 'editBilling' | 'manageHousekeeping' | 'executeCheckin') => {
    const updated = [...permissionsMatrix];
    updated[idx][field] = !updated[idx][field];
    setPermissionsMatrix(updated);
    setLocalStorageData('permissions_matrix', updated);
    onAddAuditLog(`Adjusted administrative capability matrix for: ${updated[idx].roleName}`, 'SuperAdmin');
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
    setOrganizations(getLocalStorageData<Organization[]>('organizations', []));
    setProperties(getLocalStorageData<Property[]>('properties', []));
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
    return matchesFilter;
  });

  const hotelCount = properties.filter(p => p.type === 'Hotel').length;
  const pgCount = properties.filter(p => p.type === 'PG').length;
  const suspendedCount = deactivatedPropIds.length;

  return (
    <div id="super-admin-interface" className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] bg-slate-50 text-slate-800 font-sans">
      
      {/* LEFT PRIMARY EMBARK SIDEBAR CONTROL PANEL */}
      <aside className="lg:col-span-3 bg-slate-100 text-slate-705 p-5 flex flex-col justify-between border-r border-slate-200">
        <div className="space-y-6">
          
          {/* Header Brand Seal */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-xs">
            <div className="bg-gradient-to-tr from-purple-500 to-indigo-700 text-white p-2.5 rounded-xl font-display font-black text-sm shadow">
              HQ
            </div>
            <div>
              <h3 className="text-xs font-black font-display text-slate-900 tracking-widest uppercase">StayHub HQ</h3>
              <span className="text-[9px] text-fuchsia-600 font-mono font-bold block mt-0.5">SUPER ADMIN CENTRAL</span>
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
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-1 lg:space-x-0 lg:space-y-1 text-xs pb-2 lg:pb-0 scrollbar-none">
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
              <span>2. Property Assets Registry</span>
            </button>

            <button 
              onClick={() => setActiveTab('user-management')}
              className={`w-auto lg:w-full shrink-0 flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                activeTab === 'user-management' ? 'bg-indigo-50 text-indigo-700 border-b-2 lg:border-b-0 lg:border-l-2 border-indigo-600 font-bold rounded-b-none lg:rounded-l-none' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
              <span>3. Security & Staff Control</span>
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
          <div className="space-y-6 animate-fadeIn text-xs font-semibold">
            
            {/* Upper stats bento section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border flex items-center space-x-3.5">
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl text-lg font-black font-display">
                  🏢
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Hotel Locations</span>
                  <strong className="text-base text-slate-900 font-mono font-black">{hotelCount}</strong>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border flex items-center space-x-3.5">
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl text-lg font-black font-display">
                  🏘️
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">PG & Sharing Models</span>
                  <strong className="text-base text-slate-900 font-mono font-black">{pgCount}</strong>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border flex items-center space-x-3.5">
                <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl text-lg font-black font-display">
                  🚫
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">HQ Suspended</span>
                  <strong className="text-base text-slate-900 font-mono font-black">{suspendedCount}</strong>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border flex items-center space-x-3.5 col-span-2 md:col-span-1">
                <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl text-lg font-black font-display">
                  ✅
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Total Active</span>
                  <strong className="text-base text-slate-900 font-mono font-black">{properties.length - suspendedCount}</strong>
                </div>
              </div>
            </div>

            {/* Switch pills between Hotels and PG formats layout */}
            <div className="bg-white p-3.5 border rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex flex-wrap space-x-1.5 w-full sm:w-auto">
                <button 
                  onClick={() => setPropertyFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    propertyFilter === 'All' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>All Operational Assets</span>
                  <span className="font-mono text-[9px] font-bold bg-indigo-50 text-indigo-705 px-1.5 py-0.5 rounded-md">{properties.length}</span>
                </button>

                <button 
                  onClick={() => setPropertyFilter('Hotel')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    propertyFilter === 'Hotel' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-658'
                  }`}
                >
                  <span>Hotels ({hotelCount})</span>
                </button>

                <button 
                  onClick={() => setPropertyFilter('PG')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    propertyFilter === 'PG' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-658'
                  }`}
                >
                  <span>Paying Guest units ({pgCount})</span>
                </button>
              </div>

              {/* ACTION: CREATE NEW PROPERTY INLINE */}
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
                    orgId: selectedOrgId
                  });
                  setShowPropertyModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-3.5 rounded-xl text-[10.5px] flex items-center space-x-1 shadow-sm shrink-0 uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Property Registry</span>
              </button>
            </div>

            {/* GRID OF SEEDED/CREATED PROPERTIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProperties.map(prop => {
                const isDeactivated = deactivatedPropIds.includes(prop.id);
                const associatedBranch = branches.find(b => prop.city.toLowerCase().includes(b.location.toLowerCase().split(',')[0].trim().toLowerCase()));
                
                return (
                  <div 
                    key={prop.id} 
                    className={`bg-white border text-xs rounded-3xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between ${
                      isDeactivated ? 'border-dashed border-rose-200 bg-slate-50/50 opacity-90' : 'hover:border-slate-300'
                    }`}
                  >
                    
                    <div>
                      {/* Header: Name, Format Type & Activation Toggle */}
                      <div className="flex justify-between items-start border-b pb-3 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              prop.type === 'Hotel' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {prop.type === 'Hotel' ? '🏨 Hotel format' : '🏘️ PG Co-Live'}
                            </span>
                            
                            {isDeactivated && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 font-extrabold text-[8px] rounded px-1.5 uppercase font-mono tracking-wider animate-pulse">
                                SUSPENDED OUT-OF-RENTAL
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm font-display mt-1 tracking-tight leading-none">{prop.name}</h4>
                          <span className="text-[10px] text-slate-405 block mt-0.5">{associatedBranch ? associatedBranch.name : 'Central Operational Region'}</span>
                        </div>

                        {/* HIGH INTENSITY CORE HQ ACTIVATION IS_ACTIVE TOGGLE */}
                        <div className="flex flex-col items-end shrink-0 text-right space-y-1">
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black font-mono">STATION SWITCH</span>
                          <button 
                            onClick={() => handleTogglePropertyStatus(prop.id, prop.name)}
                            className="focus:outline-none transition-transform active:scale-95"
                            title={isDeactivated ? "Activate property" : "Deactivate property"}
                          >
                            {isDeactivated ? (
                              <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-100 border p-1 rounded-xl">
                                <span className="text-[9px] text-rose-600 font-mono font-black uppercase">Deactive</span>
                                <ToggleLeft className="w-7 h-7 text-rose-500 hover:text-rose-600" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-indigo-650 font-bold bg-emerald-50 border border-emerald-200 p-1 rounded-xl">
                                <span className="text-[9px] text-emerald-700 font-mono font-black uppercase">Active</span>
                                <ToggleRight className="w-7 h-7 text-emerald-500 hover:text-emerald-600" />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Property Specs details list */}
                      <div className="space-y-1 md:space-y-1.5 text-slate-600 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">Functional operational city:</span>
                          <span className="text-slate-800 font-bold">{prop.city}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">Physical inventory rooms:</span>
                          <span className="font-mono text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {prop.totalRooms || 6} Active Room units
                          </span>
                        </div>

                        <div className="flex justify-between items-start">
                          <span className="text-slate-400 font-semibold shrink-0">Postal location:</span>
                          <p className="text-slate-500 font-medium text-right max-w-[200px] leading-tight text-[10px]" title={prop.address}>
                            {prop.address}
                          </p>
                        </div>
                      </div>

                      {/* Perks Pill Container */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Perks & Shared Amenities</span>
                        <div className="flex flex-wrap gap-1">
                          {prop.amenities.slice(0, 5).map((amen, idx) => (
                            <span key={idx} className="bg-slate-50 border rounded-md px-1.5 py-0.5 text-[8.5px] font-mono font-medium text-slate-550 lowercase">
                              {amen}
                            </span>
                          ))}
                          {prop.amenities.length > 5 && (
                            <span className="bg-indigo-50 text-indigo-750 border border-indigo-100 rounded-md px-1 py-0.5 text-[8.5px] font-bold">
                              +{prop.amenities.length - 5} luxury items
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS: FULL SUPER ADMIN PROPERTY CONTROLS & OCCUPANCY HIGHLIGHTS */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2 mt-4">
                      <button
                        onClick={() => setSelectedPropertyInsightId(prop.id)}
                        className="flex-grow bg-slate-50 border border-slate-200 hover:bg-indigo-55 w-full hover:bg-slate-100 text-slate-700 hover:text-indigo-700 font-black py-2 px-3 rounded-xl text-[10.5px] transition text-center select-none"
                      >
                        ⚡ View Status & Occupants
                      </button>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingPropertyId(prop.id);
                            setPropertyForm({
                              name: prop.name,
                              type: prop.type,
                              city: prop.city,
                              address: prop.address,
                              totalRooms: prop.totalRooms || 6,
                              amenities: prop.amenities.join(', '),
                              rules: prop.rules ? prop.rules.join(', ') : '',
                              orgId: prop.orgId || selectedOrgId
                            });
                            setShowPropertyModal(true);
                          }}
                          className="text-slate-650 hover:text-indigo-600 hover:bg-slate-100 p-2.5 border rounded-xl transition"
                          title="Modify details of specific property"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop.id, prop.name)}
                          className="text-slate-450 hover:text-rose-600 hover:bg-rose-50 p-2.5 border rounded-xl transition"
                          title="Completely destroy property allocation record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        {activeTab === 'user-management' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            
            {/* Upper Category Selector */}
            <div className="bg-white p-3 rounded-2xl border flex space-x-1 font-bold">
              <button 
                onClick={() => setUserSection('admins')}
                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${
                  userSection === 'admins' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>Sub-Admins Registry ({adminsList.length})</span>
              </button>

              <button 
                onClick={() => setUserSection('staff')}
                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${
                  userSection === 'staff' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Briefcase className="w-4.5 h-4.5" />
                <span>On-Site Staff Members ({staffList.length})</span>
              </button>

              <button 
                onClick={() => setUserSection('permissions')}
                className={`flex-1 py-2 px-3.5 rounded-lg text-center transition flex justify-center items-center space-x-2 ${
                  userSection === 'permissions' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Sliders className="w-4.5 h-4.5" />
                <span>Roles & Ability Grid</span>
              </button>
            </div>

            {/* SECTIONS IN THE TAB */}
            {userSection === 'admins' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-display">System Admins Login Credentials</h3>
                    <p className="text-[10px] text-slate-410">Property managers assigned active physical location scopes</p>
                  </div>

                  <button 
                    onClick={() => {
                      setEditingAdminId(null);
                      setNewAdminForm({
                        name: '',
                        email: '',
                        assignedPropertyId: '',
                        role: 'Property Manager'
                      });
                      setShowAdminModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl leading-none transition text-[10px] flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deploy Property Admin</span>
                  </button>
                </div>

                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase">
                        <th className="p-4 text-[10px]">Security Holder</th>
                        <th className="p-4 text-[10px]">Email Address</th>
                        <th className="p-4 text-[10px]">System Access Privilege</th>
                        <th className="p-4 text-[10px]">Assigned Property Scope</th>
                        <th className="p-4 text-[10px] text-center">Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map(adm => {
                        const matchedProp = properties.find(p => p.id === adm.assignedPropertyId);
                        return (
                          <tr key={adm.id} className="border-b last:border-b-0 hover:bg-slate-50/20">
                            <td className="p-4 font-black text-slate-900">{adm.name}</td>
                            <td className="p-4 font-mono font-bold text-indigo-700">{adm.email}</td>
                            <td className="p-4">
                              <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-black text-[9px] uppercase font-mono">
                                {adm.role}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">
                              {matchedProp ? matchedProp.name : 'N/A - Scope Unassigned'}
                            </td>
                            <td className="p-4 text-center flex items-center justify-center gap-1.5 ">
                              <button 
                                onClick={() => {
                                  setEditingAdminId(adm.id);
                                  setNewAdminForm({
                                    name: adm.name,
                                    email: adm.email,
                                    assignedPropertyId: adm.assignedPropertyId,
                                    role: adm.role
                                  });
                                  setShowAdminModal(true);
                                }}
                                className="text-slate-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 border rounded-lg transition"
                                title="Edit Sub-Admin Credentials"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 border rounded-lg transition"
                                title="Revoke Login Privileges"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {userSection === 'staff' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-display">Premises Staff Directory</h3>
                    <p className="text-[10px] text-slate-405">On-site housekeeping crews, receptionists, chefs, & ground security</p>
                  </div>

                  <button 
                    onClick={() => setShowStaffModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl leading-none transition text-[10px] flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enroll On-Site Staff</span>
                  </button>
                </div>

                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b font-bold text-slate-500 uppercase">
                        <th className="p-4 text-[10px]">Staff Fullname</th>
                        <th className="p-4 text-[10px]">Assigned Role</th>
                        <th className="p-4 text-[10px]">Helper Phone</th>
                        <th className="p-4 text-[10px]">Corporate ID Email</th>
                        <th className="p-4 text-[10px]">Station Location</th>
                        <th className="p-4 text-[10px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map(stf => {
                        const matchedProp = properties.find(p => p.id === stf.assignedPropertyId);
                        const rolesStyle = {
                          'Housekeeping': 'bg-teal-50 text-teal-700 border-teal-150',
                          'Kitchen': 'bg-amber-50 text-amber-705 border-amber-150',
                          'Security': 'bg-rose-50 text-rose-705 border-rose-150',
                          'Reception': 'bg-indigo-50 text-indigo-707 border-indigo-150'
                        };
                        return (
                          <tr key={stf.id} className="border-b last:border-b-0 hover:bg-slate-50/25">
                            <td className="p-4 font-black text-slate-905">{stf.name}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase font-mono ${rolesStyle[stf.role] || 'bg-slate-100 text-slate-655'}`}>
                                {stf.role}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-600">{stf.phone}</td>
                            <td className="p-4 text-slate-500">{stf.email}</td>
                            <td className="p-4 text-indigo-950 font-bold">
                              {matchedProp ? matchedProp.name : 'Unknown premise'}
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => handleDeleteStaff(stf.id, stf.name)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 border rounded-lg transition"
                                title="De-register staff"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {userSection === 'permissions' && (
              <div className="space-y-4">
                <div className="bg-white p-4.5 rounded-2xl border">
                  <h3 className="font-extrabold text-slate-905 font-display text-sm leading-tight">System Authority Check Matrix</h3>
                  <p className="text-[10.5px] text-slate-400 mt-1">Configure global capabilities. Check/uncheck options to update actual state rules instantly.</p>
                </div>

                <div className="bg-white border text-xs border-slate-100 rounded-3xl shadow-sm overflow-hidden font-medium">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b font-bold text-slate-500">
                        <th className="p-4 text-[10px] uppercase">Staff Role Option</th>
                        <th className="p-4 text-center text-[10px] uppercase">Inventory Rooms</th>
                        <th className="p-4 text-center text-[10px] uppercase">Edit Billing Rates</th>
                        <th className="p-4 text-center text-[10px] uppercase">Manage Housekeeping</th>
                        <th className="p-4 text-center text-[10px] uppercase">Execute Check-In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissionsMatrix.map((matrix, idx) => (
                        <tr key={idx} className="border-b last:border-b-0 hover:bg-slate-50">
                          <td className="p-4 font-black font-display text-slate-900">{matrix.roleName}</td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={matrix.viewRooms}
                              onChange={() => handleToggleMatrixCheckbox(idx, 'viewRooms')}
                              className="accent-indigo-600 w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={matrix.editBilling}
                              onChange={() => handleToggleMatrixCheckbox(idx, 'editBilling')}
                              className="accent-indigo-600 w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={matrix.manageHousekeeping}
                              onChange={() => handleToggleMatrixCheckbox(idx, 'manageHousekeeping')}
                              className="accent-indigo-600 w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={matrix.executeCheckin}
                              onChange={() => handleToggleMatrixCheckbox(idx, 'executeCheckin')}
                              className="accent-indigo-600 w-4.5 h-4.5 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

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

      {/* PROPERTY DETAILS FORM & REGISTRY MODAL (ADD & EDIT) */}
      {showPropertyModal && (
        <div id="property-registry-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative my-8 text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">
                  {editingPropertyId ? 'Modify Property Asset Record' : 'Establish New Property Registry'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure operational metrics and global definitions</p>
              </div>
              <button 
                onClick={() => {
                  setShowPropertyModal(false);
                  setEditingPropertyId(null);
                }} 
                className="p-1 hover:bg-slate-100 rounded-full border border-slate-205 transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Property Form Type *</label>
                  <select 
                    value={propertyForm.type}
                    onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value as 'Hotel' | 'PG' })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold"
                  >
                    <option value="Hotel">🏨 Hotel structure</option>
                    <option value="PG">🏘️ Paying Guest Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Total Rooms *</label>
                  <input 
                    type="number" 
                    value={propertyForm.totalRooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, totalRooms: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 bg-slate-50 font-mono font-bold"
                    required
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Property Asset Name *</label>
                <input 
                  type="text" 
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  placeholder="E.g., Grand Palace Oasis"
                  className="w-full border rounded-xl p-2.5 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Operational City *</label>
                <input 
                  type="text" 
                  value={propertyForm.city}
                  onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                  placeholder="E.g., Bangalore East"
                  className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Physical Postal Address *</label>
                <textarea 
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  placeholder="Enter complete postal location address..."
                  rows={2}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold text-slate-500">Perks & Shared Amenities (comma-separated)</label>
                <input 
                  type="text" 
                  value={propertyForm.amenities}
                  onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                  placeholder="WiFi, AC, Food Menu, CCTV, Security, Single Rooms"
                  className="w-full border rounded-xl p-2.5 bg-slate-50"
                />
              </div>

              <div>
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
              >
                {editingPropertyId ? 'Apply Property Improvements' : 'Confirm Property Registration Seal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OCCUPANCY INSIGHT & REALTIME GUEST REGISTRY LOGS OVERLAY */}
      {selectedPropertyInsightId && (() => {
        const selectedPropObj = properties.find(p => p.id === selectedPropertyInsightId);
        
        // Dynamic fetch of stashed operational indices
        const storedRooms = getLocalStorageData<any[]>('rooms', []);
        const storedTenants = getLocalStorageData<any[]>('tenants', []);
        const storedBookings = getLocalStorageData<any[]>('bookings', []);

        // Filter scopes
        const filteredRooms = storedRooms.filter(r => r.propertyId === selectedPropertyInsightId);
        const filteredTenants = storedTenants.filter(t => t.propertyId === selectedPropertyInsightId);
        const filteredBookings = storedBookings.filter(b => b.propertyId === selectedPropertyInsightId);

        // Core stats calculations
        const occupiedCount = filteredRooms.filter(r => !r.available).length;
        const totalRoomsRegistered = filteredRooms.length || selectedPropObj?.totalRooms || 6;
        const occupancyPercentage = totalRoomsRegistered > 0 ? Math.round((occupiedCount / totalRoomsRegistered) * 100) : 0;

        return (
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
      })()}

      {/* ADMIN CREATION MODAL */}
      {showAdminModal && (
        <div id="admin-setup-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">
                  {editingAdminId ? 'Modify Sub-Admin Credentials' : 'Add Sub-Admin Login Account'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {editingAdminId ? 'Update assigned properties and access roles' : 'Assign dedicated managing credentials over physical properties'}
                </p>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="p-1 hover:bg-slate-100 rounded-full border">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-650 mb-1">Account Holder Fullname *</label>
                <input 
                  type="text" 
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="Priya Shinde"
                  className="w-full border rounded-xl p-2.5 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-650 mb-1">Corporate Login Email *</label>
                <input 
                  type="email" 
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="priya.s@homelystays.com"
                  className="w-full border rounded-xl p-2.5 bg-slate-50 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-650 mb-1">Assigned Operational Property Scope *</label>
                <select 
                  value={newAdminForm.assignedPropertyId}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, assignedPropertyId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold"
                  required
                >
                  <option value="">-- Choose target allocation --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-650 mb-1">Default security role designation</label>
                <select 
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-slate-50 font-bold"
                >
                  <option value="Property Manager">Property Manager</option>
                  <option value="Operations Lead">Operations Lead</option>
                  <option value="Regional Admin">Regional Admin</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase font-display shadow-md transition"
              >
                {editingAdminId ? 'Save Credential Changes' : 'Register Admin Account Privilege'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAFF ADDITION MODAL */}
      {showStaffModal && (
        <div id="staff-creation-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm font-display text-slate-950">Add premises operational staff</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Add Housekeepers, guard security or kitchen experts directly</p>
              </div>
              <button onClick={() => setShowStaffModal(false)} className="p-1 hover:bg-slate-100 rounded-full border">
                <X className="w-5 h-5 animate-pulse" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-650 mb-1">Staff Fullname *</label>
                <input 
                  type="text" 
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  placeholder="Ramesh Sharma"
                  className="w-full border rounded-xl p-2 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-650 mb-1">Work Role / Duty *</label>
                  <select 
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as any })}
                    className="w-full border rounded-xl p-2 bg-slate-50 font-bold"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Reception">Front Reception</option>
                    <option value="Kitchen">Kitchen Chef</option>
                    <option value="Security">Guard Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-650 mb-1">Urgent Phone *</label>
                  <input 
                    type="text" 
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    placeholder="+91 990..."
                    className="w-full border rounded-xl p-2 bg-slate-50 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-655 mb-1">Corporate email details (Optional)</label>
                <input 
                  type="email" 
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  placeholder="E.g., safety@stayhub.co"
                  className="w-full border rounded-xl p-2 bg-slate-50/70 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-655 mb-1">Station premises *</label>
                <select 
                  value={newStaffForm.assignedPropertyId}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, assignedPropertyId: e.target.value })}
                  className="w-full border rounded-xl p-2 bg-slate-50 font-bold"
                  required
                >
                  <option value="">-- Pin station property --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase font-display tracking-widest shadow-md transition"
              >
                Enroll Staff Member
              </button>
            </form>
          </div>
        </div>
      )}

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
