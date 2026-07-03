import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Room, Bed, Booking, Notification, Tenant } from '../types';
import { 
  getLocalStorageData, 
  setLocalStorageData,
  generateCustomerId
} from '../mockData';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Star, 
  Calendar, 
  FileText, 
  Bell, 
  X, 
  Check, 
  ArrowRight, 
  User, 
  Clock, 
  CheckCircle, 
  Camera, 
  UploadCloud, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  Sparkles,
  Info,
  Tag,
  ThumbsUp,
  Settings,
  Shield,
  LogOut,
  Edit,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Lock as LockIcon,
  ArrowLeft,
  Phone,
  Mail,
  Play,
  Bed as BedIcon,
  Bath,
  Maximize,
  Users,
  Share2,
  Wind,
  Tv,
  Wifi,
  Volume2,
  Sofa,
  Utensils,
  ShieldCheck,
  Lock
} from 'lucide-react';


// Modular data and components
import { 
  ACTIVE_COUPONS, 
  MOCK_REVIEWS, 
  PROPERTY_IMAGES, 
  Review, 
  Coupon 
} from '../data/customerData';
import AuthWizard from '../components/AuthWizard';
import InvoiceModal from '../components/InvoiceModal';

interface CustomerAppProps {
  onAddAuditLog: (action: string, module: 'Bookings' | 'Tenants' | 'Rooms') => void;
  onLogout?: () => void;
  initialSearchQuery?: string;
  initialAuthView?: 'login' | 'register' | null;
}

export default function CustomerApp({ 
  onAddAuditLog, 
  onLogout,
  initialSearchQuery = '',
  initialAuthView = null
}: CustomerAppProps) {
  // Core lists loaded from storage
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Simulated reviews list starting seeded but dynamically appendable
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    return getLocalStorageData<Review[]>('customer_reviews', MOCK_REVIEWS);
  });

  // Auth simulation
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone: string; profileCompleted?: boolean } | null>(() => {
    return getLocalStorageData<{ name: string; email: string; phone: string; profileCompleted?: boolean } | null>('logged_in_customer', null);
  });

  const [profileCompleted, setProfileCompleted] = useState<boolean>(() => {
    const savedCustomer = localStorage.getItem('hotel_pg_logged_in_customer');
    if (!savedCustomer) return false;
    try {
      const parsed = JSON.parse(savedCustomer);
      return !!parsed.profileCompleted;
    } catch {
      return false;
    }
  });

  // Wizard form states for light-wizard-flow
  const [wizardName, setWizardName] = useState('');
  const [wizardMobile, setWizardMobile] = useState('');
  const [wizardEmail, setWizardEmail] = useState('');
  const [wizardGender, setWizardGender] = useState('Male');
  const [wizardPassword, setWizardPassword] = useState('');
  const [wizardConfirmPassword, setWizardConfirmPassword] = useState('');
  const [wizardKycType, setWizardKycType] = useState('Aadhaar Card');
  const [wizardKycFile, setWizardKycFile] = useState<string>('');
  const [wizardIsDragOver, setWizardIsDragOver] = useState(false);
  const [wizardError, setWizardError] = useState('');
  const [wizardCompletedState, setWizardCompletedState] = useState(false);

  // Sync profileCompleted and form defaults when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const savedCustomer = localStorage.getItem('hotel_pg_logged_in_customer');
      if (savedCustomer) {
        try {
          const parsed = JSON.parse(savedCustomer);
          setProfileCompleted(!!parsed.profileCompleted);
        } catch {
          setProfileCompleted(false);
        }
      }
      setWizardName(currentUser.name || '');
      setWizardMobile(currentUser.phone || '');
      setWizardEmail(currentUser.email || '');
      setBookingName(currentUser.name || '');
      setBookingPhone(currentUser.phone || '');
    } else {
      setProfileCompleted(false);
      setBookingName('');
      setBookingPhone('');
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialAuthView === 'register') {
      localStorage.removeItem('hotel_pg_logged_in_customer');
      localStorage.removeItem('logged_in_customer');
      setProfileCompleted(false);
      setCurrentUser({ name: '', email: '', phone: '' });
      setLocalAuthView(null);
    } else if (initialAuthView === 'login') {
      setLocalAuthView('login');
    }
  }, [initialAuthView]);

  const wizardContainerRef = useRef<HTMLDivElement>(null);
  const [wizardScrollOffset, setWizardScrollOffset] = useState<number>(0);

  const handleWizardScroll = () => {
    if (wizardContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = wizardContainerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight || 1);
      // scrollProgress goes from 0 to -2400 as progress goes from 0 to 1
      const strokeScroll = - (2400 * progress);
      setWizardScrollOffset(strokeScroll);
    }
  };

  const handleWizardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWizardKycFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWizardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setWizardIsDragOver(true);
  };

  const handleWizardDragLeave = () => {
    setWizardIsDragOver(false);
  };

  const handleWizardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setWizardIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWizardKycFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardName.trim()) {
      setWizardError('Please enter Name on Card 1.');
      return;
    }
    if (!wizardMobile.trim()) {
      setWizardError('Please enter Mobile Number on Card 1.');
      return;
    }
    if (!wizardEmail.trim()) {
      setWizardError('Please enter Email on Card 1.');
      return;
    }
    if (!wizardPassword) {
      setWizardError('Please enter Password on Card 2.');
      return;
    }
    if (wizardPassword !== wizardConfirmPassword) {
      setWizardError('Passwords do not match on Card 2.');
      return;
    }
    if (!wizardKycFile) {
      setWizardError('Please upload a photo of your KYC document on Card 3.');
      return;
    }

    setWizardError('');
    setWizardCompletedState(true);

    setTimeout(() => {
      const updatedUser = {
        name: wizardName,
        email: wizardEmail,
        phone: wizardMobile,
        gender: wizardGender,
        kycType: wizardKycType,
        kycPhoto: wizardKycFile,
        profileCompleted: true
      };
      
      setLocalStorageData('logged_in_customer', updatedUser);
      setCurrentUser(updatedUser);
      setProfileCompleted(true);
      setWizardCompletedState(false);

      const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);
      const matchedIdx = currentTenants.findIndex(t => t.email?.toLowerCase() === wizardEmail.toLowerCase());
      
      const tenantData: Tenant = {
        id: matchedIdx !== -1 ? currentTenants[matchedIdx].id : generateCustomerId(),
        name: wizardName,
        email: wizardEmail,
        phone: wizardMobile,
        gender: wizardGender as 'Male' | 'Female' | 'Other',
        emergencyContactName: matchedIdx !== -1 ? currentTenants[matchedIdx].emergencyContactName : '',
        emergencyContactPhone: matchedIdx !== -1 ? currentTenants[matchedIdx].emergencyContactPhone : '',
        docUrl: wizardKycFile || (matchedIdx !== -1 ? currentTenants[matchedIdx].docUrl : undefined),
        docType: (wizardKycType.includes('Aadhaar') ? 'Aadhaar' : wizardKycType.includes('Passport') ? 'Passport' : 'Driving License') as any,
        propertyId: matchedIdx !== -1 ? currentTenants[matchedIdx].propertyId : 'none',
        propertyName: matchedIdx !== -1 ? currentTenants[matchedIdx].propertyName : 'Not Stayed',
        status: matchedIdx !== -1 ? currentTenants[matchedIdx].status : 'Active',
        joinedDate: matchedIdx !== -1 ? currentTenants[matchedIdx].joinedDate : new Date().toISOString().split('T')[0],
        roomNumber: matchedIdx !== -1 ? currentTenants[matchedIdx].roomNumber : undefined,
        roomId: matchedIdx !== -1 ? currentTenants[matchedIdx].roomId : undefined,
        bedNumber: matchedIdx !== -1 ? currentTenants[matchedIdx].bedNumber : undefined,
        bedId: matchedIdx !== -1 ? currentTenants[matchedIdx].bedId : undefined,
        password: wizardPassword || (matchedIdx !== -1 ? currentTenants[matchedIdx].password : 'customer123'),
      };

      if (matchedIdx !== -1) {
        currentTenants[matchedIdx] = tenantData;
      } else {
        currentTenants.push(tenantData);
      }
      setLocalStorageData('tenants', currentTenants);
      
      if (onAddAuditLog) {
        onAddAuditLog(`Customer completed profile onboarding: ${wizardName}`, 'Bookings');
      }
    }, 1500);
  };

  // Bottom Navigation tab: 'home' | 'bookings' | 'checkin' | 'profile' | 'filters'
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'checkin' | 'profile' | 'filters'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roomTypeDropdownOpen, setRoomTypeDropdownOpen] = useState(false);
  const [amenitiesDropdownOpen, setAmenitiesDropdownOpen] = useState(false);
  const [filterDuration, setFilterDuration] = useState<'All' | 'night' | 'day' | 'month' | 'seasonal'>('All');

  const handleCustomerLogin = (user: any, isRegister?: boolean) => {
    const nowStr = new Date().toLocaleString();
    const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);
    const matchedIdx = currentTenants.findIndex(t => t.email?.toLowerCase() === user.email.toLowerCase());
    let tenantObj: Tenant;

    if (matchedIdx !== -1) {
      currentTenants[matchedIdx].lastLogin = nowStr;
      if (user.password) currentTenants[matchedIdx].password = user.password;
      currentTenants[matchedIdx].name = user.name;
      currentTenants[matchedIdx].phone = user.phone;
      tenantObj = currentTenants[matchedIdx];
    } else {
      tenantObj = {
        id: user.id || generateCustomerId(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password || 'customer123',
        gender: 'Male',
        emergencyContactName: '',
        emergencyContactPhone: '',
        propertyId: 'none',
        propertyName: 'Not Stayed',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastLogin: nowStr
      };
      currentTenants.push(tenantObj);
    }
    setLocalStorageData('tenants', currentTenants);

    const completeUser = { ...tenantObj, profileCompleted: !isRegister };
    setLocalStorageData('logged_in_customer', completeUser);
    setCurrentUser(completeUser);
    setProfileCompleted(!isRegister);
  };


  // Search, filter, and categorisation options
  const [searchDates, setSearchDates] = useState('3 Jul - 6 Jul');
  const [searchGuests, setSearchGuests] = useState(2);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Hotel' | 'PG'>('All');
  const [selectedSharing, setSelectedSharing] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(65000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters state matching precise requirements
  const [filterRoomTypes, setFilterRoomTypes] = useState<string[]>([]); // Standard, Deluxe, Suite, Dormitory, PGs
  const [filterSharingTypes, setFilterSharingTypes] = useState<string[]>([]); // Single sharing, Double sharing, Triple sharing
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]); // WiFi, AC, TV, Food, Laundry
  const [filterShowOnlyAvailable, setFilterShowOnlyAvailable] = useState<boolean>(false);

  // Quick transparent category button filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'hotel' | 'pg' | 'colive' | '2-share' | '3-share' | '4-share' | 'dormitory'>('all');

  // Location Access states
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>(() => {
    return (localStorage.getItem('hotel_pg_loc_permission') as 'prompt' | 'granted' | 'denied') || 'prompt';
  });
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('hotel_pg_user_coords');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // Focus Modal states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyRooms, setPropertyRooms] = useState<Room[]>([]);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [stayDurationOption, setStayDurationOption] = useState<string>('day');

  // Auto scroll gallery images for 2 seconds
  useEffect(() => {
    if (!selectedProperty) return;
    
    const rawImages = [
      ...(selectedProperty.images || []),
      selectedProperty.imageUrl,
      ...(PROPERTY_IMAGES[selectedProperty.id] || [])
    ].filter(Boolean);
    const galleryImages = Array.from(new Set(rawImages));
    while (galleryImages.length < 4) {
      galleryImages.push('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600');
    }
    const totalImages = galleryImages.length;
    
    const interval = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % totalImages);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedProperty]);

  // New review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<string>('');

  // Booking form fields
  const [checkInDate, setCheckInDate] = useState('2026-06-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-06-15');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingAdults, setBookingAdults] = useState('1');
  const [bookingChildren, setBookingChildren] = useState('0');
  const [bookingNumRooms, setBookingNumRooms] = useState('1');
  const [mealPlan, setMealPlan] = useState<'None' | 'Breakfast Only' | 'Full Board'>('None');
  const [bookingNotes, setBookingNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'NetBanking'>('UPI');
  const [bookingSuccessMode, setBookingSuccessMode] = useState<boolean>(false);
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);

  // Coupon application state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<string>('');

  // Promoted coupons clipboard feedback
  const [copiedCouponIndex, setCopiedCouponIndex] = useState<number | null>(null);

  // Document upload state
  const [isDragOver, setIsDragOver] = useState(false);
  const [idFileUploaded, setIdFileUploaded] = useState<boolean>(false);
  const [selfieUploaded, setSelfieUploaded] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<'Aadhaar' | 'Passport' | 'Driving License'>('Aadhaar');
  const [checkInStatusMessage, setCheckInStatusMessage] = useState<string>('');

  // Profile Edit fields (stores all details entered by user on sign-up)
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [profileEditForm, setProfileEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    kycType: 'Aadhaar Card',
    kycPhoto: '',
    password: '',
    emergencyName: 'Rajesh Mehta (Father)',
    emergencyPhone: '+91 98765 00000',
    bloodGroup: 'O+'
  });

  // Client Toggles
  const [settingsToggles, setSettingsToggles] = useState({
    pushNotifications: true,
    emailStatement: true,
    gateBiometricAccess: false,
    mockDarkOverlay: false
  });

  // Auth Overlay Modal Toggle
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authWizardInitialView, setAuthWizardInitialView] = useState<'login' | 'register'>('login');
  const [localAuthView, setLocalAuthView] = useState<'login' | 'register' | null>(initialAuthView);
  const [activeInvoice, setActiveInvoice] = useState<Booking | null>(null);

  // System Notifications Bell Overlay list
  const [showNotificationsOverlay, setShowNotificationsOverlay] = useState<boolean>(false);
  const [showFooterFiltersModal, setShowFooterFiltersModal] = useState<boolean>(false);

  // Change Password states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [oldPasswordInput, setOldPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string>('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string>('');

  // Load Seed Database data
  const loadAppData = () => {
    const rawProperties = getLocalStorageData<Property[]>('properties', []);
    const deactivatedPropIds = getLocalStorageData<string[]>('deactivated_properties', []);
    const activeProperties = rawProperties.filter(
      p => p.status !== 'Suspended' && !deactivatedPropIds.includes(p.id)
    );
    setProperties(activeProperties);
    setRooms(getLocalStorageData<Room[]>('rooms', []));
    setBeds(getLocalStorageData<Bed[]>('beds', []));
    setBookings(getLocalStorageData<Booking[]>('bookings', []));
    setNotifications(getLocalStorageData<Notification[]>('notifications', []));
  };

  useEffect(() => {
    loadAppData();

    // Reactively reload when any portal writes new properties/data
    const handleDataUpdate = (e: Event) => {
      const { key } = (e as CustomEvent).detail || {};
      if (['properties', 'rooms', 'beds', 'bookings', 'deactivated_properties'].includes(key)) {
        loadAppData();
      }
    };
    window.addEventListener('stayhub-data-updated', handleDataUpdate);
    return () => window.removeEventListener('stayhub-data-updated', handleDataUpdate);
  }, []);

  // Sync Logged-In User changes
  useEffect(() => {
    setLocalStorageData('logged_in_customer', currentUser);
  }, [currentUser]);

  // Sync internal Dynamic Reviews back to storage
  useEffect(() => {
    setLocalStorageData('customer_reviews', reviewsList);
  }, [reviewsList]);

  // Handle coupon clip mock copying
  const handleCopyCoupon = (coupon: Coupon, index: number) => {
    setCopiedCouponIndex(index);
    // Autofill into state for seamless mock flow
    setCouponCodeInput(coupon.code);
    setTimeout(() => setCopiedCouponIndex(null), 1800);
  };

  // Profile fields initialize
  useEffect(() => {
    if (currentUser) {
      setProfileEditForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        gender: (currentUser as any).gender || 'Male',
        kycType: (currentUser as any).kycType || 'Aadhaar Card',
        kycPhoto: (currentUser as any).kycPhoto || '',
        password: (currentUser as any).password || '••••••••',
        emergencyName: 'Rajesh Mehta (Father)',
        emergencyPhone: '+91 98765 00000',
        bloodGroup: 'O+'
      });
    }
  }, [currentUser]);

  // Scroll reveal IntersectionObserver for onboarding cards
  useEffect(() => {
    if (!currentUser || profileCompleted) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -5% 0px'
        }
      );

      const cardElements = document.querySelectorAll('.light-wizard-flow .cardWrapper');
      cardElements.forEach((card) => {
        observer.observe(card);
      });

      return () => {
        cardElements.forEach((card) => {
          observer.unobserve(card);
        });
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, profileCompleted]);

  // Save changes to profile details
  const saveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEditForm.name || !profileEditForm.phone || !profileEditForm.email) return;
    
    const updatedUser = {
      ...currentUser,
      name: profileEditForm.name,
      phone: profileEditForm.phone,
      email: profileEditForm.email,
      gender: profileEditForm.gender,
      kycType: profileEditForm.kycType,
      kycPhoto: profileEditForm.kycPhoto,
      password: profileEditForm.password,
      profileCompleted: true
    };
    setCurrentUser(updatedUser as any);
    setLocalStorageData('logged_in_customer', updatedUser);
    setShowEditProfileModal(false);
    onAddAuditLog(`Customer updated all profile details (Name: ${profileEditForm.name}, Phone: ${profileEditForm.phone})`, 'Tenants');
  };

  // Helper to get property coordinates
  const getPropertyCoords = (propId: string, city: string) => {
    if (propId === 'prop-1') return { lat: 12.9102, lng: 77.6450 }; // Bangalore
    if (propId === 'prop-2') return { lat: 17.4483, lng: 78.3741 }; // Hyderabad
    if (propId === 'prop-3') return { lat: 18.9930, lng: 72.8251 }; // Mumbai
    
    // Match based on city
    const c = city.toLowerCase();
    if (c.includes('bangalore') || c.includes('blr') || c.includes('hsr')) return { lat: 12.9716, lng: 77.5946 };
    if (c.includes('hyderabad') || c.includes('hyd') || c.includes('gachi')) return { lat: 17.3850, lng: 78.4867 };
    if (c.includes('mumbai') || c.includes('bom') || c.includes('parel')) return { lat: 19.0760, lng: 72.8777 };
    return { lat: 12.9716, lng: 77.5946 };
  };

  // Helper to calculate distance
  const calculateDistance = (pLat: number, pLng: number, uLat: number, uLng: number) => {
    const dLat = pLat - uLat;
    const dLng = pLng - uLng;
    return Math.sqrt(dLat * dLat + dLng * dLng) * 111; // simple Euclidean 111km approximation
  };

  // Filter & sort query properties
  const filteredProperties = properties.filter(prop => {
    if ((prop as any).status === 'Deleted') return false;
    // Search physically on property name, address, or city
    const matchesQuery = (prop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (prop.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prop.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prop.amenities || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = selectedCity === 'All' || prop.city === selectedCity;

    let matchesDuration = true;
    if (filterDuration === 'night' || filterDuration === 'day') {
      matchesDuration = prop.type === 'Hotel';
    } else if (filterDuration === 'month' || filterDuration === 'seasonal') {
      matchesDuration = prop.type === 'PG';
    }

    // Quick category list selections (from transparent buttons)
    let matchesCategory = true;
    if (activeCategoryFilter === 'hotel') {
      matchesCategory = prop.type === 'Hotel';
    } else if (activeCategoryFilter === 'pg') {
      matchesCategory = prop.type === 'PG';
    } else if (activeCategoryFilter === 'colive') {
      matchesCategory = prop.type === 'PG'; // co-live is PG format in stayhub
    }

    const propertyRoomList = rooms.filter(r => r.propertyId === prop.id);

    // Filter by sharing selection from quick transparent category pill: 2-share, 3-share, 4-share, dormitory
    let matchesCategorySharing = true;
    if (activeCategoryFilter === '2-share') {
      matchesCategorySharing = propertyRoomList.some(r => r.type === 'Double');
    } else if (activeCategoryFilter === '3-share') {
      matchesCategorySharing = propertyRoomList.some(r => r.type === 'Triple');
    } else if (activeCategoryFilter === '4-share') {
      matchesCategorySharing = propertyRoomList.some(r => r.type === 'Four-Sharing');
    } else if (activeCategoryFilter === 'dormitory') {
      matchesCategorySharing = propertyRoomList.some(r => r.type === 'Four-Sharing' || (r.amenities || []).some(a => a.toLowerCase().includes('dorm')));
    }

    // Checking individual rooms in property for all footer-level filters
    const matchingRooms = propertyRoomList.filter(r => {
      // 1- Price Range (min scale to max scale)
      const price = prop.type === 'PG' ? r.pricePerMonth : r.pricePerDay;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      // 2- Room Type: Standard, Deluxe, Suite, Dormitory, PGs
      let matchesRoomType = true;
      if (filterRoomTypes.length > 0) {
        let rTypeClass = 'Standard';
        if (prop.type === 'Hotel') {
          if (price >= 3000) rTypeClass = 'Suite';
          else if (price >= 2000) rTypeClass = 'Deluxe';
          else rTypeClass = 'Standard';
        } else {
          if (r.type === 'Four-Sharing') rTypeClass = 'Dormitory';
          else rTypeClass = 'PGs';
        }
        matchesRoomType = filterRoomTypes.includes(rTypeClass);
      }

      // 3- Sharing Type: single, double, triple, 4 share, dormitory
      let matchesSharingType = true;
      if (filterSharingTypes.length > 0) {
        let rShareClass = 'single';
        if (r.type === 'Double') rShareClass = 'double';
        else if (r.type === 'Triple') rShareClass = 'triple';
        else if (r.type === 'Four-Sharing') rShareClass = '4 share';
        
        const isDorm = r.type === 'Four-Sharing' || (r.amenities || []).some(a => a.toLowerCase().includes('dorm'));
        
        matchesSharingType = filterSharingTypes.some(selected => {
          if (selected === 'dormitory') return isDorm;
          return selected === rShareClass;
        });
      }

      // 4- Amenities: WiFi, AC, TV, Food, Laundry
      let matchesAmenities = true;
      if (filterAmenities.length > 0) {
        const combinedAmenities = [...(prop.amenities || []), ...(r.amenities || [])].map(a => a.toLowerCase());
        matchesAmenities = filterAmenities.every(amenity => {
          if (amenity === 'WiFi') {
            return combinedAmenities.some(a => a.includes('wi-fi') || a.includes('wifi'));
          } else if (amenity === 'AC') {
            return combinedAmenities.some(a => a.includes('a/c') || a.includes('ac') || a.includes('air conditioning') || a.includes('cooler'));
          } else if (amenity === 'TV') {
            return combinedAmenities.some(a => a.includes('tv') || a.includes('television') || a.includes('smart tv'));
          } else if (amenity === 'Food') {
            return combinedAmenities.some(a => a.includes('breakfast') || a.includes('food') || a.includes('meals') || a.includes('dining') || a.includes('buffet'));
          } else if (amenity === 'Laundry') {
            return combinedAmenities.some(a => a.includes('washing') || a.includes('laundry') || a.includes('iron'));
          }
          return false;
        });
      }

      // 5- Availability (occupied in all - price, room type, sharing type, amenities)
      let matchesAvailability = true;
      if (filterShowOnlyAvailable) {
        matchesAvailability = r.occupancyStatus === 'Available';
      }

      return matchesPrice && matchesRoomType && matchesSharingType && matchesAmenities && matchesAvailability;
    });

    const hasMatchingRooms = matchingRooms.length > 0;

    return matchesQuery && matchesCity && matchesCategory && matchesCategorySharing && matchesDuration && hasMatchingRooms;
  }).map(prop => {
    // Inject calculated distance if user has granted coords
    if (userCoords) {
      const pCoords = getPropertyCoords(prop.id, prop.city);
      const dist = calculateDistance(pCoords.lat, pCoords.lng, userCoords.lat, userCoords.lng);
      return { ...prop, distance: Number(dist.toFixed(1)) };
    }
    return prop;
  });

  // Sort properties so closest is shown first!
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if ((a as any).distance !== undefined && (b as any).distance !== undefined) {
      return (a as any).distance - (b as any).distance;
    }
    return 0;
  });

  const featuredHotels = properties.filter(p => p.type === 'Hotel');
  const featuredPGs = properties.filter(p => p.type === 'PG');
  const cities = ['All', ...Array.from(new Set(properties.map(p => p.city)))];

  // Open specific property and configure detail values
  const handleViewProperty = (prop: Property) => {
    if (prop.status === 'Deleted') {
      alert("This property is permanently closed and no longer accepting reservations.");
      return;
    }
    setSelectedProperty(prop);
    const propRooms = rooms.filter(r => r.propertyId === prop.id);
    setPropertyRooms(propRooms);
    // Auto-select first available room of the property
    const firstAvail = propRooms.find(r => r.occupancyStatus === 'Available') || propRooms[0] || null;
    setBookingRoom(firstAvail);
    setActiveImgIdx(0);
    setReviewStatus('');
    setUserComment('');
    setBookingSuccessMode(false);
  };

  // Trigger Booking flow
  const handleOpenBooking = (room: Room) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setBookingRoom(room);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponMessage('');
    setShowBookingModal(true);
    setBookingSuccessMode(false);
  };

  // Submit dynamic review inside details modal
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProperty) return;
    if (!userComment.trim()) {
      setReviewStatus('Review feedback text is mandatory.');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      propertyId: selectedProperty.id,
      userName: currentUser.name,
      rating: userRating,
      date: new Date().toISOString().split('T')[0],
      comment: userComment,
      helpfulCount: 0
    };

    setReviewsList([newReview, ...reviewsList]);
    setUserComment('');
    setReviewStatus('Success! Posted your review feedback.');
    onAddAuditLog(`Customer ${currentUser.name} posted ${userRating}-star review for Property ${selectedProperty.name}`, 'Bookings');
  };

  // Calculate booking stays and coupons variables
  const calculateBookingCosts = () => {
    if (!bookingRoom || !selectedProperty) return { base: 0, meal: 0, discount: 0, tax: 0, final: 0, baseOriginal: 0 };
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const roomDiscountPct = selectedProperty.discountType === 'all' 
      ? (selectedProperty.discountPercentage || 0) 
      : (bookingRoom.discountPercentage || 0);

    const numRooms = parseInt(bookingNumRooms as any) || 1;
    const numAdults = parseInt(bookingAdults as any) || 1;

    const priceDay = bookingRoom.pricePerDay || bookingRoom.price || 1200;
    const priceWeek = bookingRoom.priceWeekly || priceDay * 7;
    const priceMonth = bookingRoom.pricePerMonth || priceDay * 22;
    const priceSeasonal = bookingRoom.priceSeasonal || priceMonth * 1.2;

    let selectedRate = priceDay;
    let optionDays = 1;
    if (stayDurationOption === 'week') {
      selectedRate = priceWeek;
      optionDays = 7;
    } else if (stayDurationOption === 'month') {
      selectedRate = priceMonth;
      optionDays = 30;
    } else if (stayDurationOption === 'seasonal') {
      selectedRate = priceSeasonal;
      optionDays = 90;
    }

    const calculatedDayCost = selectedRate / optionDays;
    const baseOriginalRate = Math.round(calculatedDayCost * diffDays * numRooms * numAdults);
    const discountedDayCost = calculatedDayCost * (1 - roomDiscountPct / 100);
    const baseRate = Math.round(discountedDayCost * diffDays * numRooms * numAdults);

    let mealSurcharge = 0;
    if (mealPlan === 'Breakfast Only') mealSurcharge = 150 * diffDays;
    if (mealPlan === 'Full Board') mealSurcharge = 450 * diffDays;

    const baseCombine = baseRate + mealSurcharge;

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = Math.round(baseCombine * (appliedCoupon.discountValue / 100));
      } else {
        discount = appliedCoupon.discountValue;
      }
    }

    const priceAfterReduct = Math.max(0, baseCombine - discount);
    const tax = Math.round(priceAfterReduct * 0.18);
    const final = priceAfterReduct + tax;

    return { base: baseRate, meal: mealSurcharge, discount, tax, final, baseOriginal: baseOriginalRate };
  };

  const costBreakdown = calculateBookingCosts();

  // Code coupon eligibility checkers
  const handleApplyBookingCoupon = () => {
    setCouponMessage('');
    const findCode = ACTIVE_COUPONS.find(c => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase());
    if (!findCode) {
      setCouponMessage('This promotional code is not valid.');
      return;
    }

    // Check minimum stay duration if applicable
    if (findCode.minStayDays) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < findCode.minStayDays) {
        setCouponMessage(`Code requires minimum stay of ${findCode.minStayDays} days (Current stay: ${diffDays} days).`);
        return;
      }
    }

    setAppliedCoupon(findCode);
    setCouponMessage(`Successful! Coupon ${findCode.code} discount applied.`);
  };

  // Submit booking order
  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bookingRoom || !selectedProperty) return;

    const prices = calculateBookingCosts();
    const invoiceBill = prices.final;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      roomId: bookingRoom.id,
      roomNumber: bookingRoom.roomNumber,
      customerName: bookingName || currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: bookingPhone || currentUser.phone,
      checkInDate,
      checkOutDate,
      mealPlan,
      status: 'Pending',
      totalAmount: invoiceBill,
      bookingDate: new Date().toISOString().split('T')[0],
      notes: bookingNotes,
      paymentMethod,
      requestedRoomType: bookingRoom.type
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    setLocalStorageData('bookings', updatedBookings);

    const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);
    const matchedIdx = currentTenants.findIndex(t => t.email?.toLowerCase() === currentUser.email.toLowerCase());
    if (matchedIdx !== -1) {
      currentTenants[matchedIdx].propertyId = selectedProperty.id;
      currentTenants[matchedIdx].propertyName = selectedProperty.name;
      currentTenants[matchedIdx].roomId = bookingRoom.id;
      currentTenants[matchedIdx].roomNumber = bookingRoom.roomNumber;
      setLocalStorageData('tenants', currentTenants);
    } else {
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        gender: 'Male',
        emergencyContactName: '',
        emergencyContactPhone: '',
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        roomId: bookingRoom.id,
        roomNumber: bookingRoom.roomNumber,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      currentTenants.push(newTenant);
      setLocalStorageData('tenants', currentTenants);
    }

    // Dynamic state notifications
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.email,
      title: 'Booking Request Received',
      message: `Your booking for Room ${bookingRoom.roomNumber} at ${selectedProperty.name} is awaiting host invoice clearance of ₹${invoiceBill.toLocaleString('en-IN')}`,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      type: 'Billing'
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    setLocalStorageData('notifications', updatedNotifs);

    onAddAuditLog(`Created Booking Reservation for '${selectedProperty.name}' Room ${bookingRoom.roomNumber}`, 'Bookings');
    setLastCreatedBooking(newBooking);
    setBookingSuccessMode(true);
  };

  // Simulated Document checking uploading
  const handleDocDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIdFileUploaded(true);
  };

  const triggerManualFile = (target: 'id' | 'selfie') => {
    if (target === 'id') {
      setIdFileUploaded(true);
    } else {
      setSelfieUploaded(true);
    }
  };

  const submitDigitalKycCheckIn = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!idFileUploaded || !selfieUploaded) {
      setCheckInStatusMessage('Both secure document photograph and facial identification are strictly mandatory.');
      return;
    }

    setCheckInStatusMessage('Analyzing biometric logs and text extraction...');
    setTimeout(() => {
      setCheckInStatusMessage('Approved! Your digital KYC profile is verified. Checked in record state created.');
      
      const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);
      const matchedIdx = currentTenants.findIndex(t => t.email?.toLowerCase() === currentUser?.email?.toLowerCase());

      if (matchedIdx !== -1) {
        currentTenants[matchedIdx].docType = documentType;
        currentTenants[matchedIdx].docUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400';
        currentTenants[matchedIdx].status = 'Active';
        setLocalStorageData('tenants', currentTenants);
      }

      const verifiedNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: currentUser.email,
        title: 'Check-In Verification Successful',
        message: `Your ${documentType} biometric scanning and selfie match have been instantly cleared. Welcome in!`,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        type: 'Success'
      };

      const updatedNotifs = [verifiedNotif, ...notifications];
      setNotifications(updatedNotifs);
      setLocalStorageData('notifications', updatedNotifs);

      onAddAuditLog(`Customer completed digital KYC Check-In validation matching: ${documentType}`, 'Tenants');
    }, 1500);
  };

  // Simulated live billing payments from UPI scan
  const handlePaymentCleared = (bookingId: string) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'Confirmed' as const } : b);
    setBookings(updated);
    setLocalStorageData('bookings', updated);

    // Create system log
    const payNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.email || 'customer@stayhub.co',
      title: 'UPI Payment Successful',
      message: `Checked-In stay invoice for booking ${bookingId} has been successfully cleared. Receipt generated.`,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      type: 'Success'
    };
    
    setNotifications([payNotification, ...notifications]);
    setLocalStorageData('notifications', [payNotification, ...notifications]);

    onAddAuditLog(`Cleared billing stay invoice via UPI for booking: ${bookingId}`, 'Bookings');
    
    // Auto sync state inside active modals
    if (activeInvoice && activeInvoice.id === bookingId) {
      setActiveInvoice({ ...activeInvoice, status: 'Confirmed' });
    }
  };

  // Extract variables for specific user safely
  const userBookings = currentUser?.email
    ? bookings.filter(b => b.customerEmail?.toLowerCase() === currentUser.email.toLowerCase())
    : [];
  const userNotifications = currentUser?.email
    ? notifications.filter(n => n.userId?.toLowerCase() === currentUser.email.toLowerCase())
    : [];
  const unreadNotifCount = userNotifications.filter(n => !n.isRead).length;

  if (!currentUser) {
    if (localAuthView === null) {
      return (
        <div className="background no-uiverse relative min-h-screen overflow-hidden flex flex-row flex-wrap items-center justify-center p-6 gap-8 select-none">
          {/* Soft, gorgeous dark blur overlays matching the cityscape aesthetic */}
          <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          {/* Absolute header branding */}
          <div className="absolute top-6 left-6 flex items-center space-x-2 text-white/90">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold uppercase tracking-widest text-[11px] font-sans">StayHub Premium Customer Portal</span>
          </div>

          <button 
            type="button"
            className="button btn1"
            onClick={() => {
              localStorage.removeItem('hotel_pg_logged_in_customer');
              localStorage.removeItem('logged_in_customer');
              setProfileCompleted(false);
              setCurrentUser({ name: '', email: '', phone: '' });
            }}
          >
            SIGN-UP
          </button>
          <button 
            type="button"
            className="button btn2"
            onClick={() => setLocalAuthView('login')}
          >
            LOGIN
          </button>
        </div>
      );
    }

    return (
      <div className="background relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Soft, gorgeous dark blur overlays matching the cityscape aesthetic */}
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[500px]">
          <div className="w-full max-w-[340px] flex flex-col items-center space-y-4 animate-fade-in">
            <div className="text-center mb-2 animate-bounce-slow">
              <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase font-mono bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-500/20">
                Secure Identity verification
              </span>
            </div>
            
            <AuthWizard 
              isOpen={true}
              isInline={true}
              onClose={() => setLocalAuthView(null)}
              initialView={localAuthView}
              onLoginSuccess={(user, isRegister) => {
                handleCustomerLogin(user, isRegister);
              }}
              onAddAuditLog={onAddAuditLog as any}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentUser && !profileCompleted) {
    return (
      <div 
        ref={wizardContainerRef}
        onScroll={handleWizardScroll}
        className="light-wizard-flow no-uiverse relative h-screen w-full overflow-y-auto"
        style={{ '--strokeDashoffset': `${wizardScrollOffset}` } as React.CSSProperties}
      >
        {/* Ambient floating bubbles for elegant background decoration */}
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[5%] w-80 h-80 rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />

        {/* Scroll Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-slate-100/60 z-50">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-75"
            style={{ 
              width: `${
                wizardContainerRef.current 
                  ? (wizardContainerRef.current.scrollTop / (wizardContainerRef.current.scrollHeight - wizardContainerRef.current.clientHeight || 1)) * 100 
                  : 0
              }%` 
            }}
          />
        </div>

        {/* Main scroll paths matching user style */}
        <svg id="svgPaths" width="740" height="2000" xmlns="http://www.w3.org/2000/svg">
          <use href="#linePath01" />
          <use href="#linePath02" />
          <use href="#linePath03" />
          <use href="#linePath04" />
        </svg>        <form onSubmit={handleWizardSubmit} className="relative z-10 w-full animate-fade-in">
          <div className="cards">
            
            {/* CARD 1: Customer Profile Details */}
            <div className="cardWrapper">
              <div className="card" id="codepen">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase font-mono bg-indigo-50 px-2 py-1 rounded-md">Card 01 / 04</span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('hotel_pg_logged_in_customer');
                          setCurrentUser(null);
                          onLogout?.();
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <LogOut className="w-3 h-3 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                    <header className="!m-0 text-lg font-extrabold text-slate-800">
                      Personal Details
                    </header>
                    <p className="text-xs text-slate-500 mb-4">Let's start with your contact information for reservation records.</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="light-label">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={wizardName}
                          onChange={(e) => setWizardName(e.target.value)}
                          placeholder="e.g. Aarav Mehta"
                          className="light-input"
                        />
                      </div>
                      <div>
                        <label className="light-label">Mobile Number</label>
                        <input 
                          type="tel" 
                          required
                          value={wizardMobile}
                          onChange={(e) => setWizardMobile(e.target.value)}
                          placeholder="e.g. +91 95555 12345"
                          className="light-input"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="light-label">Email address</label>
                          <input 
                            type="email" 
                            required
                            value={wizardEmail}
                            onChange={(e) => setWizardEmail(e.target.value)}
                            placeholder="aarav@example.com"
                            className="light-input"
                          />
                        </div>
                        <div>
                          <label className="light-label">Gender</label>
                          <select 
                            value={wizardGender}
                            onChange={(e) => setWizardGender(e.target.value)}
                            className="light-select"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1 justify-center animate-bounce">
                      <span>↓ Scroll down to continue</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Security Credentials */}
            <div className="cardWrapper">
              <div className="card" id="html">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase font-mono bg-emerald-50 px-2 py-1 rounded-md">Card 02 / 04</span>
                    </div>
                    <header className="!m-0 text-lg font-extrabold text-slate-800">
                      Security & Password
                    </header>
                    <p className="text-xs text-slate-500 mb-4">Create a secure password to access your StayHub bookings securely.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="light-label">Enter Password</label>
                        <input 
                          type="password" 
                          required
                          value={wizardPassword}
                          onChange={(e) => setWizardPassword(e.target.value)}
                          placeholder="••••••••"
                          className="light-input"
                        />
                      </div>
                      <div>
                        <label className="light-label">Confirm Password</label>
                        <input 
                          type="password" 
                          required
                          value={wizardConfirmPassword}
                          onChange={(e) => setWizardConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="light-input"
                        />
                      </div>

                      {wizardPassword && wizardConfirmPassword && (
                        <div className="flex items-center space-x-1.5 text-xs">
                          {wizardPassword === wizardConfirmPassword ? (
                            <span className="text-emerald-600 font-semibold flex items-center">
                              <Check className="w-3.5 h-3.5 mr-1" /> Passwords match
                            </span>
                          ) : (
                            <span className="border border-rose-150 bg-rose-50/50 text-rose-600 font-semibold px-2.5 py-1 rounded-lg flex items-center">
                              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> Passwords do not match
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1 justify-center animate-bounce">
                      <span>↓ Scroll down to continue</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: KYC Details */}
            <div className="cardWrapper">
              <div className="card" id="css">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold tracking-widest text-cyan-600 uppercase font-mono bg-cyan-50 px-2 py-1 rounded-md">Card 03 / 04</span>
                    </div>
                    <header className="!m-0 text-lg font-extrabold text-slate-800">
                      KYC Verification
                    </header>
                    <p className="text-xs text-slate-500 mb-3 font-normal">Select a valid identification card and upload a clear photo scan.</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="light-label">Select KYC Document type</label>
                        <select 
                          value={wizardKycType}
                          onChange={(e) => setWizardKycType(e.target.value)}
                          className="light-select"
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                          <option value="Other ID Card">Other ID Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="light-label">Photo upload of KYC</label>
                        <div 
                          onDragOver={handleWizardDragOver}
                          onDragLeave={handleWizardDragLeave}
                          onDrop={handleWizardDrop}
                          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1 relative h-32 ${
                            wizardIsDragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                          }`}
                        >
                          {wizardKycFile ? (
                            <div className="absolute inset-1 rounded-lg bg-white overflow-hidden flex flex-col items-center justify-center z-10">
                              <img 
                                src={wizardKycFile} 
                                alt="KYC Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="w-7 h-7 text-slate-400" />
                              <div className="text-[11px]">
                                <span className="text-indigo-600 font-extrabold">Drag & drop</span> or <span className="text-indigo-600 font-extrabold">browse</span>
                              </div>
                              <span className="text-[9px] text-slate-400">PNG or JPG up to 5MB</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleWizardFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1 justify-center animate-bounce">
                      <span>↓ Scroll down to continue</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Submission Confirmation */}
            <div className="cardWrapper">
              <div className="card" id="js">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold tracking-widest text-purple-600 uppercase font-mono bg-purple-50 px-2 py-1 rounded-md">Card 04 / 04</span>
                    </div>
                    <header className="!m-0 text-lg font-extrabold text-slate-800">
                      Submit Student Profile
                    </header>
                    <p className="text-xs text-slate-500 mb-3">Verify your details below and submit to complete your account setup.</p>
                    
                    <div className="bg-slate-100/40 backdrop-blur-xs border border-slate-200/40 rounded-xl p-3 space-y-2 text-[11px] text-slate-700">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Name</span>
                        <span className="font-extrabold text-slate-800 truncate max-w-[170px]">{wizardName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Phone</span>
                        <span className="font-extrabold text-slate-800">{wizardMobile || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Email</span>
                        <span className="font-extrabold text-slate-800 truncate max-w-[170px]">{wizardEmail || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Gender</span>
                        <span className="font-extrabold text-slate-800">{wizardGender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">KYC Type</span>
                        <span className="font-extrabold text-slate-800 flex items-center">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mr-0.5" /> {wizardKycType}
                        </span>
                      </div>
                    </div>

                    {wizardError && (
                      <div className="mt-2.5 p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-semibold flex items-start space-x-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{wizardError}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    {wizardCompletedState ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 animate-pulse">
                        <CheckCircle className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span>Saving Registration Profile...</span>
                      </div>
                    ) : (
                      <button 
                        type="submit"
                        className="light-submit-btn flex items-center justify-center space-x-2"
                      >
                        <span>Submit Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Hidden defs & linear gradients matching custom design */}
        <svg width="0" height="0" className="absolute opacity-0 pointer-events-none" style={{ width: 0, height: 0, overflow: 'hidden' }} role="none">
          <defs>
            <linearGradient id="cl1" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
              <stop offset="20%" stopColor="#b169db" />
              <stop offset="45%" stopColor="#f7d152" />
              <stop offset="65%" stopColor="#46cf71" />
              <stop offset="85%" stopColor="#0fbffa" />
              <stop offset="100%" stopColor="#0fbffa" />
            </linearGradient>
            
            <path id="linePath01" d="m 106,45h 375c 114,0 226,128 226,235v 236c 0,136 -122,222 -224,221l -182,-2c -89,1 -141,42 -142,158l -2,204c -1,117 37,173 134,173h 186c 110,-3 230,111 230,220v 242c 0,113 -125,225 -248,225H 105" />   
            <path id="linePath02" d="m 33,85h 444c 96,0 190,107 190,201v 224c 0,116 -98,188 -190,187l -192,-2c -92,0 -166,75 -166,168v 278c 0,94 74,169 166,169h 194c 92,0 188,94 188,188v 228c 0,94 -104,191 -214,191H 105" />
            <path id="linePath03" d="m 155,127h 308c 94,0 162,86 162,177v 178c 0,109 -50,174 -166,173L 277,653C 158,653 77,762 77,849v 302c 0,118 107,196 180,197l 204,4c 92,0 164,67 164,160v 200c 0,91 -89,163 -188,163H 105" />
            <path id="linePath04" d="m 283,173c 2,0 165,0 165,0C 544,175 577,238 577,330v 156c 0,94 -48,126 -140,125L 269,609C 167,602 29,702 29,851v 312c 0,111 101,235 242,235h 162c 109,1 144,49 144,136v 162c 0,73 -53,130 -118,130l -353,1" />

            <path id="codepenIcon" fill="#FFFFFF" d="m 214,306 -57,37c -1,0 -2,2 -2,3v 40c 0,1 1,2 2,3l 57,40c 2,1 6,1 7,0l 58,-40c 1,0 2,-1 2,-3v -40c 0,-2 -2,-3 -2,-3l -57,-37c -4,-3 -8,0 -8,0zm -2,13 1,26 -24,16 -19,-14zm 10,0 43,28 -19,14 -24,-16zm -6,35 19,14 -19,14 -19,-14zm -52,3 14,9 -14,9zm 106,0v 19l -14,-9zm -84,15 24,16v 26l -42,-28zm 59,0 17,14 -42,28v -26z" />
            <path id="htmlIcon" fill="#FFFFFF" d="m 94,318v 109h 16v -47h 12v 47h 16V 318h -16v 45h -12v -45zm 47,0v 18h 14v 92h 15v -92h 14v -18zm 45,0v 109h 15v -54l 7,41h 12l 5,-42v 55h 15V 318h -16l -11,72 -11,-72zm 62,0 1,109h 34v -19h -19v -91z" />
            <path id="cssIcon" fill="#FFFFFF" d="m 94,398c 0,26 18,31 30,31 9,0 32,-3 31,-34h -19c 0,23 -22,21 -22,0v -43c 0,-25 22,-21 22,1h 18c 1,-32 -22,-35 -30,-35 -10,0 -30,3 -30,32zm 105,-1c 0,22 -23,18 -23,-2h -18c 0,0 1,33 30,33 9,0 30,-4 30,-31 0,-42 -39,-26 -39,-50 0,-16 22,-20 22,3h 18c -2,-21 -11,-31 -30,-31 -9,0 -28,0 -29,28 -1,40 39,23 39,50zm 62,0c 0,21 -22,22 -23,-2h -17c 0,0 0,33 30,33 18,0 30,-9 30,-31 0,-41 -39,-27 -39,-50 0,-15 22,-20 22,3h 18c -1,-22 -13,-31 -27,-31 -11,0 -32,1 -33,27 1,38 39,25 39,51z" />
            <path id="jsIcon" fill="#FFFFFF" d="m 262,395c 0,20 -22,20 -22,-1h -18c 0,14 5,31 28,31 16,0 30,-9 30,-31 0,-41 -39,-26 -39,-49 0,-16 20,-19 20,3h 18c -1,-27 -14,-30 -27,-30 -19,-1 -29,8 -29,27 -2,38 39,24 39,50zm -67,-76v 74c 0,22 -22,20 -22,-1h -19c -1,26 15,34 30,34 27,0 30,-20 30,-30v -77z" />

            <mask id="block"><path fill="#FFFFFF" d="M 0,0 H 300 V 450 H 0 Z" /></mask>
            <mask id="codepenMask"><use href="#codepenIcon" /></mask>
            <mask id="htmlMask"><use href="#htmlIcon" /></mask>
            <mask id="cssMask"><use href="#cssIcon" /></mask>
            <mask id="jsMask"><use href="#jsIcon" /></mask>
            <mask id="codepenMask2"><use href="#codepenIcon" stroke="#FFFFFF" strokeWidth="4" /></mask>
            <mask id="htmlMask2"><use href="#htmlIcon" stroke="#FFFFFF" strokeWidth="4" /></mask>
            <mask id="cssMask2"><use href="#cssIcon" stroke="#FFFFFF" strokeWidth="4" /></mask>
            <mask id="jsMask2"><use href="#jsIcon" stroke="#FFFFFF" strokeWidth="4" /></mask>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div id="customer-container" className={`w-full bg-white h-screen relative overflow-hidden flex flex-col ${
      settingsToggles.mockDarkOverlay ? 'brightness-90 select-none grayscale-10 transition' : 'transition'
    }`}>
      
      {/* Primary Mobile Header Bar */}
      <header id="customer-header" className="bg-white px-4 py-2 border-b border-slate-100 shadow-md flex justify-between items-center relative z-40 gap-4">
        {/* Left Brand Area */}
        <div id="mobile-branding" className="flex items-center space-x-2 shrink-0">
          <div className="bg-gradient-to-tr from-amber-500 to-[#f25a24] p-1.5 rounded-xl text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black font-display text-slate-950 hover:text-[#f25a24] cursor-pointer" onClick={() => setActiveTab('home')}>StayHub</h1>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest font-mono">Mobile Hub</p>
          </div>
        </div>

        {/* Unified Search component in the header (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-2xl items-center bg-white border-2 border-[#b8d935] rounded-full px-4 py-1.5 shadow-sm hover:shadow-md transition relative gap-2 text-slate-700">
          {/* Text input with Search icon */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#f25a24] shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your dream relocation stay or next adventure..."
              className="w-full bg-transparent text-xs font-semibold focus:outline-none placeholder-slate-450 text-slate-800"
            />
          </div>

          {/* Let's go Button (Curved Rectangle) */}
          <button 
            type="button"
            onClick={() => {
              document.getElementById('customer-main-view')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="lets-go-btn bg-[#f25a24] hover:bg-[#ea580c] text-white rounded-xl px-4 py-1.5 text-xs font-black transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Let's go!</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Mobile View Search Input Fallback */}
        <div className="md:hidden flex-1 relative max-w-[180px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stays..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-7 pr-2 text-[10.5px] focus:outline-none focus:bg-white text-slate-800"
          />
        </div>

        {/* Right Logout/Portal Selection Button */}
        <button 
          onClick={() => onLogout?.()}
          className="text-[10px] font-extrabold uppercase border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-md shrink-0"
          title="Return to main portal select screen"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Portal Select</span>
        </button>
      </header>

      {/* Main Container viewport */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Pinned Vertical Toggle Bar on the left when sidebar is closed (mobile only) */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#f25a24] hover:bg-[#ea580c] text-white rounded-r-xl py-4 px-2 shadow-lg flex flex-col items-center gap-1.5 transition-all duration-300 z-30 group cursor-pointer border-y border-r border-orange-500 lg:hidden"
            title="Open Filter Sidebar"
          >
            <SlidersHorizontal className="w-4 h-4 text-white group-hover:scale-110 transition" />
            <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* Collapsible Left Sidebar */}
        <aside className={`bg-slate-50 border-r border-slate-200/60 shrink-0 flex flex-col justify-between transition-all duration-300 z-35 absolute lg:static inset-y-0 left-0 h-full ${
          sidebarOpen 
            ? 'w-80 translate-x-0' 
            : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}>
          <div className={`flex-1 overflow-y-auto space-y-6 no-scrollbar ${sidebarOpen ? 'p-5' : 'py-5 px-1.5'}`}>
            {/* Navigation Section */}
            <div className="space-y-2">
              <div className={`flex ${sidebarOpen ? 'justify-between items-center' : 'justify-center'} py-1`}>
                {sidebarOpen && <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Navigation</label>}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {sidebarOpen ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 text-[#f25a24]" />}
                </button>
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sidebarOpen ? 'w-full px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto p-0'
                  } ${
                    activeTab === 'home' 
                      ? 'curved-orange-border-btn shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-200/50'
                  }`}
                  title="Explore Stays"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>Explore Stays</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('bookings');
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    sidebarOpen ? 'w-full px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto p-0'
                  } ${
                    activeTab === 'bookings' 
                      ? 'curved-orange-border-btn shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-200/50'
                  }`}
                  title="My Bookings"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>My Bookings</span>}
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            {sidebarOpen && (
              <div className="space-y-5 pt-4 border-t border-slate-200/60">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Search Filters</label>
                <button 
                  type="button"
                  onClick={() => {
                    setFilterDuration('All');
                    setMinPrice(0);
                    setMaxPrice(65000);
                    setFilterRoomTypes([]);
                    setFilterSharingTypes([]);
                    setFilterAmenities([]);
                  }}
                  className="text-[9px] font-black uppercase text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* 1. STAY DURATION */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Stay Duration</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['night', 'day', 'month', 'seasonal'].map((dur) => {
                    const active = filterDuration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setFilterDuration(active ? 'All' : (dur as any))}
                        className={`px-2 py-2 rounded-xl text-xs font-bold capitalize border transition cursor-pointer ${
                          active 
                            ? 'curved-orange-border-btn font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                        }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. COST RANGE BAR */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Average price per night</span>
                
                {/* Min / Max Input Fields */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2 px-3 shadow-xs relative">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Min</span>
                    <div className="flex items-center text-xs font-black text-slate-900 mt-0.5">
                      <span className="text-slate-400 mr-0.5">₹</span>
                      <input
                        type="number"
                        value={minPrice}
                        min="0"
                        max={maxPrice - 500}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), maxPrice - 500);
                          setMinPrice(val);
                        }}
                        className="w-full bg-transparent focus:outline-none border-none p-0"
                      />
                    </div>
                  </div>
                  <span className="text-slate-400 font-extrabold text-xs">-</span>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2 px-3 shadow-xs relative">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Max</span>
                    <div className="flex items-center text-xs font-black text-slate-900 mt-0.5">
                      <span className="text-slate-400 mr-0.5">₹</span>
                      <input
                        type="number"
                        value={maxPrice}
                        min={minPrice + 500}
                        max="65000"
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), minPrice + 500);
                          setMaxPrice(val);
                        }}
                        className="w-full bg-transparent focus:outline-none border-none p-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider bar */}
                <div className="relative h-5 w-full mt-1.5 double-range-slider select-none">
                  <input
                    type="range"
                    min="0"
                    max="65000"
                    step="500"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), maxPrice - 500);
                      setMinPrice(val);
                    }}
                    className="absolute w-full pointer-events-none appearance-none z-20 h-1 bg-transparent focus:outline-none"
                  />
                  <input
                    type="range"
                    min="0"
                    max="65000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), minPrice + 500);
                      setMaxPrice(val);
                    }}
                    className="absolute w-full pointer-events-none appearance-none z-20 h-1 bg-transparent focus:outline-none"
                  />
                  <div className="absolute left-0 right-0 top-1.5 h-1 bg-slate-200 rounded-full"></div>
                  <div 
                    className="absolute top-1.5 h-1 bg-indigo-600 rounded-full"
                    style={{
                      left: `${(minPrice / 65000) * 100}%`,
                      right: `${100 - (maxPrice / 65000) * 100}%`
                    }}
                  ></div>
                </div>

                {/* Tick marks under slider */}
                <div className="space-y-1">
                  <div className="flex justify-between px-1 text-slate-200 select-none">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="w-[1px] h-1.5 bg-slate-200/80"></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 px-1">
                    <span>₹0</span>
                    <span>₹65,000</span>
                  </div>
                </div>
              </div>

              {/* 3. ROOM TYPE DROPDOWN */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Room Type</span>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setRoomTypeDropdownOpen(!roomTypeDropdownOpen)}
                    className="w-full flex items-center justify-between border border-slate-200 bg-white px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="truncate">
                      {filterRoomTypes.length === 0 ? "Select Room Types" : `${filterRoomTypes.length} Selected`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${roomTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {roomTypeDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2 animate-scale-up">
                      {['Standard', 'Deluxe', 'Suite', 'Dormitory', 'PGs'].map((roomType) => {
                        const isChecked = filterRoomTypes.includes(roomType);
                        return (
                          <label key={roomType} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setFilterRoomTypes(filterRoomTypes.filter(x => x !== roomType));
                                } else {
                                  setFilterRoomTypes([...filterRoomTypes, roomType]);
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span>{roomType}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. SHARING TYPE BUTTONS */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sharing Type</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['single', 'double', 'triple', '4 share', 'dormitory'].map((type) => {
                    const active = filterSharingTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setFilterSharingTypes(filterSharingTypes.filter(x => x !== type));
                          } else {
                            setFilterSharingTypes([...filterSharingTypes, type]);
                          }
                        }}
                        className={`px-2 py-2 rounded-xl text-xs font-bold capitalize border transition cursor-pointer ${
                          active 
                            ? 'bg-indigo-600 border-indigo-650 text-white font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. AMENITIES DROPDOWN */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Amenities</span>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setAmenitiesDropdownOpen(!amenitiesDropdownOpen)}
                    className="w-full flex items-center justify-between border border-slate-200 bg-white px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="truncate">
                      {filterAmenities.length === 0 ? "Select Amenities" : `${filterAmenities.length} Selected`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${amenitiesDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {amenitiesDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2 animate-scale-up">
                      {['WiFi', 'AC', 'TV', 'Food', 'Laundry'].map((amenity) => {
                        const isChecked = filterAmenities.includes(amenity);
                        return (
                          <label key={amenity} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setFilterAmenities(filterAmenities.filter(x => x !== amenity));
                                } else {
                                  setFilterAmenities([...filterAmenities, amenity]);
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

          {/* User profile quick section at sidebar bottom */}
          <div className={`p-4 border-t border-slate-200 bg-slate-100/50 flex ${
            sidebarOpen ? 'items-center justify-between' : 'flex-col items-center gap-3'
          } shrink-0`}>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-650 bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black font-mono shadow-xs shrink-0">
                  {currentUser.name[0]}
                </div>
                {sidebarOpen && (
                  <div className="truncate max-w-[120px]">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>
            ) : (
              sidebarOpen ? (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Guest Session</span>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-250 text-slate-500 flex items-center justify-center text-[11px] font-black shrink-0 border border-slate-200" title="Guest Session">
                  G
                </div>
              )
            )}
            <button 
              type="button"
              onClick={() => {
                setActiveTab('profile');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-650 hover:text-slate-900 transition cursor-pointer shrink-0"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="customer-main-view" className="flex-1 overflow-y-auto px-4 py-3 space-y-4 h-full">
        
        {/* VIEW TAB 1: Search Hub (Home) */}
        {activeTab === 'home' && (
          <div id="customer-tab-home" className="space-y-4 animate-fade-in text-slate-800">
            



            {/* Unified Listing Section */}
            <div className="space-y-3.5 pt-2">
              {(searchQuery || selectedCity !== 'All' || selectedType !== 'All') && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('All');
                      setSelectedType('All');
                      setSelectedSharing('All');
                      setMaxPrice(30000);
                    }}
                    className="text-[10px] text-indigo-655 font-bold hover:underline"
                  >
                    Wipe Filters
                  </button>
                </div>
              )}

              {sortedProperties.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 px-6">
                  <p className="text-xs text-slate-505 font-semibold">No results found matching listings.</p>
                  <p className="text-[10.5px] text-slate-400 mt-1">Try relaxing filters range or changing query strings.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 font-sans">
                  {sortedProperties.map(prop => {
                    const propRooms = rooms.filter(r => r.propertyId === prop.id);
                    
                    let maxDiscount = 0;
                    if (prop.discountType === 'all') {
                      maxDiscount = prop.discountPercentage || 0;
                    } else if (prop.discountType === 'custom') {
                      const discounts = propRooms.map(r => r.discountPercentage || 0);
                      maxDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;
                    }

                    let minOriginalPrice = 800;
                    let minDiscountedPrice = 800;
                    let hasDiscount = false;

                    if (propRooms.length > 0) {
                      const prices = propRooms.map(r => {
                        const original = prop.type === 'PG' ? r.pricePerMonth : r.pricePerDay;
                        const discountPct = prop.discountType === 'all' ? (prop.discountPercentage || 0) : (r.discountPercentage || 0);
                        const discounted = Math.round(original * (1 - discountPct / 100));
                        if (discountPct > 0) hasDiscount = true;
                        return { original, discounted };
                      });
                      minOriginalPrice = Math.min(...prices.map(p => p.original));
                      minDiscountedPrice = Math.min(...prices.map(p => p.discounted));
                    }

                    return (
                      <div 
                        key={prop.id}
                        onClick={() => handleViewProperty(prop)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-350 hover:shadow-md cursor-pointer transition duration-200 flex flex-col sm:flex-row p-4 gap-5 relative text-left"
                      >
                        {/* Left Side: Thumbnail/Photo Carousel */}
                        <div className="w-full sm:w-64 h-40 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                          <img 
                            src={prop.imageUrl || PROPERTY_IMAGES[prop.id]?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'} 
                            alt={prop.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Carousel dots indicator overlay */}
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                          </div>
                        </div>

                        {/* Right Side Details Layout */}
                        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                          {/* Details Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              {/* Property Type Badge */}
                              <div className="flex items-center gap-2">
                                <span className="bg-rose-50 text-rose-700 border border-rose-100/50 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider block w-fit">
                                  {prop.type}
                                </span>
                                {(prop as any).status === 'Deleted' && (
                                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider block w-fit">
                                    Permanently Closed / Terminated
                                  </span>
                                )}
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-base font-black text-slate-950 leading-snug tracking-tight">{prop.name}</h3>
                              
                              {/* Ratings Score Row */}
                              <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>10 Superb</span>
                                <span className="text-slate-400 font-normal">(3)</span>
                              </div>
                              
                              {/* Distance */}
                              <p className="text-[11px] text-slate-400 font-bold">
                                {((prop as any).distance !== undefined ? `${(prop as any).distance}km` : '2.7km')} from city centre
                              </p>
                            </div>

                            {/* Circular Amenities Icons List */}
                            <div className="flex items-center gap-1.5 mt-3 select-none">
                              <span className="w-6.5 h-6.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600" title="Wifi"><Wifi className="w-3.5 h-3.5" /></span>
                              <span className="w-6.5 h-6.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600" title="TV"><Tv className="w-3.5 h-3.5" /></span>
                              <span className="w-6.5 h-6.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600" title="AC"><Wind className="w-3.5 h-3.5" /></span>
                              <span className="w-6.5 h-6.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600" title="Laundry/Safe"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                            </div>
                          </div>

                          {/* Pricing details and availability */}
                          <div className="w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-end items-start sm:items-end text-left sm:text-right select-none">
                            <div className="space-y-1 w-full">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                {prop.type === 'PG' ? 'Dorms From' : 'Rooms From'}
                              </span>
                              
                              <div className="flex items-center justify-start sm:justify-end gap-1.5">
                                {maxDiscount > 0 && (
                                  <span className="bg-rose-50 text-rose-600 border border-rose-100 px-1 py-0.5 rounded text-[10px] font-black">
                                    -{maxDiscount}%
                                  </span>
                                )}
                                {hasDiscount && minDiscountedPrice < minOriginalPrice ? (
                                  <>
                                    <span className="text-slate-400 line-through text-[11px] font-bold">₹{minOriginalPrice}</span>
                                    <span className="text-slate-900 font-black text-lg">₹{minDiscountedPrice}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-900 font-black text-lg">₹{minOriginalPrice}</span>
                                )}
                              </div>

                              <span className="text-[9.5px] text-slate-400 font-bold block pt-1">No Privates Available</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Context location tracker static warning */}
            <div className="flex items-start space-x-1.5 p-3 rounded-2xl bg-slate-100/50 border border-slate-200/55 text-[10px] text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>StayHub filters local records depending on active container parameters in localStorage. No real financial credit details required during demo.</span>
            </div>

          </div>
        )}

        {/* VIEW TAB 2: Bookings Stays Tracking */}
        {activeTab === 'bookings' && (
          <div id="customer-tab-bookings" className="space-y-4 animate-fade-in text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-150 pb-2">
              <h2 className="text-sm font-black font-display uppercase tracking-wide">Your Booking Companion Stays</h2>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 font-bold font-mono rounded-lg text-[9px]">
                {userBookings.length} bookings
              </span>
            </div>

            {!currentUser ? (
              <div className="bg-white border rounded-2xl p-6 text-center shadow-xs space-y-3">
                <User className="w-10 h-10 mx-auto text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Authorize Simulated Member Profile</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Configure active customer profiles in stay parameters to book, update rentals and pay invoices.</p>
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10.5px] rounded-xl px-5 py-2.5 transition shrink-0"
                >
                  Configure Customer Credentials
                </button>
              </div>
            ) : userBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 px-6 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs text-slate-600 font-bold">No Registered Bookings Found</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[80%] mx-auto">Rent boutique rooms and co-living PGs in Bangalore or Hyderabad. Your bookings will instantly sync here.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] px-4 py-2 rounded-xl font-bold transition inline-flex items-center space-x-1"
                >
                  <span>Select Perfect Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBookings.map(bk => (
                  <div key={bk.id} className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden hover:border-slate-305 hover:shadow-md transition duration-200">
                    <div className="p-3 space-y-2.5">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h3 className="text-xs font-black text-slate-900 leading-tight">{bk.propertyName}</h3>
                          <span className="text-[8.5px] text-slate-400 font-mono block mt-0.5">BOOKING ID: {bk.id.split('-')[1]}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider block shrink-0 ${
                          bk.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          bk.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                          bk.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {bk.status === 'Pending' ? 'UNPAID - PENDING' : bk.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[10.5px] leading-relaxed">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-light">Duration:</span>
                          <span className="font-extrabold text-slate-900 font-mono tracking-tighter">{bk.checkInDate} &rarr; {bk.checkOutDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-light">Assigned unit:</span>
                          <span className="font-extrabold text-slate-900">Room Number {bk.roomNumber || 'Awaiting'}</span>
                        </div>
                      </div>

                      {bk.mealPlan !== 'None' && (
                        <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-600 bg-indigo-50/60 p-1.5 rounded-lg border border-indigo-100/50">
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Includes Dining Board: <strong>{bk.mealPlan}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Footer receipt details navigation */}
                    <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex justify-between items-center text-[10.5px]">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-slate-400">Rate Total:</span>
                        <strong className="text-indigo-605 font-bold text-indigo-700">₹{bk.totalAmount.toLocaleString('en-IN')}</strong>
                      </div>

                      <button 
                        onClick={() => setActiveInvoice(bk)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-wide transition active:scale-95 cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>Invoice & UPI QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* VIEW TAB 4: Profile Desk Dashboard */}
        {activeTab === 'profile' && (
          <div id="customer-tab-profile" className="space-y-4 animate-fade-in text-slate-800">
            <h2 className="text-sm font-black font-display uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">Member Companion Profiles</h2>

            {!currentUser ? (
              <div className="bg-white border rounded-2xl p-6 text-center shadow-xs space-y-3">
                <User className="w-10 h-10 mx-auto text-indigo-400" />
                <p className="text-xs text-slate-650 font-bold">Retrieve customized stay accounts data</p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10.5px] rounded-xl px-5 py-2.5 transition mt-2 cursor-pointer"
                >
                  Launch Member Verification
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Dynamic user personal profile banner panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                    <User className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center text-lg font-black font-mono shadow-md">
                      {currentUser.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 font-display flex items-center gap-1">
                        {currentUser.name}
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">Verified</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                      {(currentUser as any).id && (
                        <span className="inline-block mt-1 bg-orange-50 border border-orange-100 text-orange-700 text-[8.5px] font-mono font-black tracking-wider px-1.5 py-0.5 rounded-md">
                          🔒 Customer ID: {(currentUser as any).id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Edit button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono">Verified Phone: {currentUser.phone}</span>
                    <button 
                      onClick={() => setShowEditProfileModal(true)}
                      className="text-indigo-650 text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit details
                    </button>
                  </div>
                </div>

                {/* KYC Verification Gate */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3.5 shadow-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 font-display">KYC Verification Gate</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Verify your biometric facial identity and government legal files matching.</p>
                  </div>
                  
                  {/* Document Type Picker */}
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-450 text-slate-400 block uppercase mb-1">Government ID Format type</label>
                    <select 
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 bg-white font-semibold rounded-xl p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Aadhaar">Aadhaar National Card (India)</option>
                      <option value="Passport">Passport International Book</option>
                      <option value="Driving License">Government Driving License</option>
                    </select>
                  </div>

                  {/* 2-Column Responsive Layout for Upload Zones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* ID select area */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDocDrop}
                      onClick={() => triggerManualFile('id')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                        isDragOver ? 'border-indigo-500 bg-indigo-50' : 
                        idFileUploaded ? 'border-emerald-500 bg-emerald-50/20 shadow-inner' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className={`w-7 h-7 mx-auto mb-1.5 ${idFileUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-[10.5px] font-bold text-slate-900">
                        {idFileUploaded ? 'ID verification file recorded' : `Upload Front Photo of ${documentType}`}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-light">PDF/PNG up to 6MB. Click to simulate upload.</p>
                      
                      {idFileUploaded && (
                        <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2 font-mono">
                          <Check className="w-3.5 h-3.5" />
                          <span>verified_{documentType.toLowerCase()}_scan.jpg</span>
                        </span>
                      )}
                    </div>

                    {/* Selfie verification */}
                    <div 
                      onClick={() => triggerManualFile('selfie')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                        selfieUploaded ? 'border-emerald-500 bg-emerald-50/20 shadow-inner' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Camera className={`w-7 h-7 mx-auto mb-1.5 ${selfieUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-[10.5px] font-bold text-slate-900">
                        {selfieUploaded ? 'Selfie match secured' : 'Capture portrait Selfie photo'}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-light">Clear ambient lighting required. Click to simulate capture.</p>
                      
                      {selfieUploaded && (
                        <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2 font-mono">
                          <Check className="w-3.5 h-3.5" />
                          <span>live_face_portrait_matching_100.png</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={submitDigitalKycCheckIn}
                    className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wide shadow-sm hover:shadow-indigo-100 transition active:scale-95 cursor-pointer"
                  >
                    Submit KYC Verification Data
                  </button>

                  {checkInStatusMessage && (
                    <div className={`p-3 rounded-xl text-[10.5px] font-medium leading-relaxed border ${
                      checkInStatusMessage.includes('Success') || checkInStatusMessage.includes('Approved') 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}>
                      {checkInStatusMessage}
                    </div>
                  )}
                </div>

                {/* Security & Password section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block font-display">Security & Password</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Update your account authentication credentials.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOldPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmNewPasswordInput('');
                        setChangePasswordError('');
                        setChangePasswordSuccess('');
                        setShowChangePasswordModal(true);
                      }}
                      className="text-[10px] font-extrabold uppercase px-3 py-1.5 border border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50/80 rounded-lg transition shrink-0"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Sub action: Sign out details */}
                <button 
                  onClick={() => {
                    const nowStr = new Date().toLocaleString();
                    if (currentUser) {
                      const currentTenants = getLocalStorageData<Tenant[]>('tenants', []);
                      const matchedIdx = currentTenants.findIndex(t => t.email?.toLowerCase() === currentUser.email.toLowerCase());
                      if (matchedIdx !== -1) {
                        currentTenants[matchedIdx].lastLogout = nowStr;
                        setLocalStorageData('tenants', currentTenants);
                      }
                    }
                    localStorage.removeItem('hotel_pg_logged_in_customer');
                    setCurrentUser(null);
                    onAddAuditLog('Customer logged out of app UI console', 'Bookings');
                    onLogout?.();
                  }}
                  className="w-full border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold py-2.5 rounded-xl py-3 transition flex items-center justify-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out of stay companion session</span>
                </button>

              </div>
            )}
          </div>
        )}

      </main>
    </div>

      {/* MODAL 1: Clicked Property Details Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            id="property-details-backdrop" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 overflow-y-auto"
          >
            {/* The Outer Wrapper */}
            <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
              
              {/* TOP BAR */}
              <div className="bg-indigo-900 text-white/90 text-[11px] py-2.5 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-white/10 select-none">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{selectedProperty.adminPhone || "(000) 000-0000"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{selectedProperty.adminEmail || "example@gmail.com"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{selectedProperty.address || "2464 Royal Ln. Mesa, New Jersey 45463"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-300 transition">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3H5v2h2v7h3v-7h3V11h-3V9c0-.5.5-1 1-1h2V6H9v2z"/></svg>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-300 transition">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.48.75 2.78 1.9 3.55-.7 0-1.35-.2-1.94-.53v.05c0 2.05 1.46 3.75 3.39 4.14-.36.1-.73.15-1.12.15-.27 0-.54-.03-.8-.08.54 1.68 2.1 2.9 3.96 2.94-1.45 1.14-3.29 1.82-5.27 1.82-.34 0-.68-.02-1.02-.06C3.04 20.37 5.3 21 7.7 21 15.65 21 20 14.4 20 8.69v-.56c.85-.6 1.57-1.37 2.16-2.25z"/></svg>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-300 transition">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-300 transition">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                </div>
              </div>

              {/* NAV BAR */}
              <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 py-3.5 px-4 sm:px-8 flex justify-between items-center select-none sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="font-serif font-black text-base text-indigo-900 tracking-wide leading-none">{selectedProperty.name}</h1>
                    <span className="text-[9px] text-indigo-500 font-mono uppercase tracking-widest font-extrabold">Royelle Premium</span>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="curved-orange-border-btn text-[10px] font-extrabold uppercase px-5 py-2.5 rounded-xl transition active:scale-95 tracking-widest shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
                    <span>Back to Search</span>
                  </button>
                </div>
              </header>

              {/* HERO BANNER SECTION */}
              <div className="relative h-[220px] bg-slate-900 overflow-hidden flex items-center justify-center select-none">
                <img 
                  src={selectedProperty.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600'} 
                  alt="Hero Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs scale-105"
                />
                <div className="relative text-center z-10 space-y-1">
                  <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">Room Details</h2>
                  <div className="text-[10px] text-white/70 uppercase tracking-widest font-mono">
                    <span>Home</span> &bull; <span>Room Details</span>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
                
                {/* GALLERY SECTION (MEDIA GRID) */}
                {(() => {
                  const rawImages = [
                    ...(selectedProperty.images || []),
                    selectedProperty.imageUrl,
                    ...(PROPERTY_IMAGES[selectedProperty.id] || [])
                  ].filter(Boolean);
                  const galleryImages = Array.from(new Set(rawImages));
                  while (galleryImages.length < 4) {
                    galleryImages.push('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600');
                  }
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Left stack of thumbnails (desktop only) */}
                      <div className="hidden md:flex flex-col gap-3 h-[380px] w-full">
                        {galleryImages.slice(0, 4).map((img, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setActiveImgIdx(idx)}
                            className={`relative flex-1 rounded-xl overflow-hidden cursor-pointer border-2 transition duration-200 ${
                              activeImgIdx === idx ? 'border-indigo-600 scale-[1.02]' : 'border-transparent opacity-85 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                            {idx === 3 && (
                              <div className="absolute inset-0 bg-indigo-900/65 backdrop-blur-xs flex items-center justify-center text-white text-[10px] uppercase font-bold tracking-wider text-center p-1 leading-tight">
                                <span>View All Photos</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Right large display image */}
                      <div className="md:col-span-3 h-[380px] rounded-2xl overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200">
                        <img 
                          src={galleryImages[activeImgIdx] || selectedProperty.imageUrl} 
                          alt={selectedProperty.name}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                        
                        {/* Left Edge Scroll Arrow */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImgIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white text-slate-850 rounded-full shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer z-30"
                          title="Previous Image"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>

                        {/* Right Edge Scroll Arrow */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImgIdx((prev) => (prev + 1) % galleryImages.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white text-slate-850 rounded-full shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer z-30"
                          title="Next Image"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-700" />
                        </button>

                        {/* Image Counter Badge */}
                        <span className="absolute bottom-4 right-4 bg-slate-950/70 text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-full tracking-wider select-none">
                          PHOTO {activeImgIdx + 1} OF {galleryImages.length}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* TWO COLUMN GRID DETAILS AND BOOKING FORM */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* LEFT COLUMN: details, overview, amenities, rules, map */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Header parameters card */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-2xl font-bold text-indigo-900">{selectedProperty.type === 'Hotel' ? 'Standard Rooms' : selectedProperty.name}</h3>
                            <span className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-indigo-150">
                              {selectedProperty.type === 'Hotel' ? 'Luxury Rooms' : 'Premium PG'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{selectedProperty.address}</span>
                          </p>
                        </div>

                        {/* Star review ratings */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center font-bold text-xs text-amber-500 bg-amber-50 border border-amber-200/40 px-2.5 py-1.5 rounded-lg select-none">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>4.9 (245 Reviews)</span>
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1 select-none">
                        <span className="font-serif text-3xl font-black text-indigo-900">
                          ₹{(bookingRoom ? (selectedProperty.type === 'PG' ? bookingRoom.pricePerMonth : bookingRoom.pricePerDay) : 1500).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium font-sans">/ {selectedProperty.type === 'PG' ? 'month' : 'night'}</span>
                      </div>

                      {/* Room details specs line */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 select-none">
                        <span className="flex items-center gap-1.5">
                          <BedIcon className="w-4 h-4 text-slate-400" />
                          <span>{bookingRoom?.type || "Single"} sharing</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-slate-400" />
                          <span>1 Bath</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Maximize className="w-4 h-4 text-slate-400" />
                          <span>300 sqft</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Max {bookingRoom?.type === 'Single' ? '1' : bookingRoom?.type === 'Double' ? '2' : '3'} Guests</span>
                        </span>
                        
                        {/* Share link button */}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Listing link copied to clipboard!");
                          }}
                          className="ml-auto flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                          type="button"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Overview text details */}
                    <div className="space-y-2">
                      <h4 className="font-serif text-lg font-bold text-indigo-950">Overview</h4>
                      <p className="text-xs text-slate-650 leading-relaxed font-normal">
                        Welcome to {selectedProperty.name}, where modern elegance meets comfort. Located in the heart of {selectedProperty.city}, this property offers state-of-the-art infrastructure, fully-furnished spaces, and superior hygiene. Designed to provide a luxurious residential experience for student scholars and working professionals alike.
                      </p>
                    </div>

                    {/* Room Amenities Grid cards */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-indigo-950">Room Amenities</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Designed to provide you the ultimate level of comfort and convenience.</p>
                      </div>

                      {(() => {
                        const getAmenityIcon = (name: string) => {
                          const n = name.toLowerCase();
                          if (n.includes('wifi') || n.includes('internet')) return <Wifi className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('ac') || n.includes('air conditioning')) return <Wind className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('tv') || n.includes('television') || n.includes('flat-screen')) return <Tv className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('safe') || n.includes('locker')) return <Lock className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('sound') || n.includes('speaker') || n.includes('music')) return <Volume2 className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('bath') || n.includes('shower') || n.includes('bathtub')) return <Bath className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('sofa') || n.includes('seating') || n.includes('chair')) return <Sofa className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('food') || n.includes('meal') || n.includes('menu')) return <Utensils className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('cctv') || n.includes('security')) return <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />;
                          if (n.includes('clock') || n.includes('alarm')) return <Clock className="w-4.5 h-4.5 text-indigo-600" />;
                          return <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />;
                        };

                        const defaultAmenityList = [
                          "Air Conditioning", "Flat-Screen TV", "High-Speed Wi-Fi", 
                          "Electronic Safe", "Sound System", "Vanity mirror", 
                          "Bathtubs", "Seating area", "Alarm clock"
                        ];
                        const amenitiesToRender = selectedProperty.amenities && selectedProperty.amenities.length > 0 
                          ? selectedProperty.amenities 
                          : defaultAmenityList;

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {amenitiesToRender.map((amenity, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-600/30 hover:shadow-xs transition duration-200"
                              >
                                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 border border-slate-100">
                                  {getAmenityIcon(amenity)}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Booking Rules Checklist */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-lg font-bold text-indigo-955">Booking Rules</h4>
                      
                      {(() => {
                        const rules = selectedProperty.rules || [];
                        const half = Math.ceil(rules.length / 2);
                        const leftRules = rules.slice(0, half);
                        const rightRules = rules.slice(half);

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 select-none">
                            <div className="space-y-2.5">
                              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">Check In</h5>
                              <ul className="space-y-2 text-xs text-slate-650 font-semibold">
                                {leftRules.map((rule, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <span>{rule}</span>
                                  </li>
                                ))}
                                {leftRules.length === 0 && (
                                  <>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Check-in time starts at 12:00 PM</span></li>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Original KYC documents mandatory for security check</span></li>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Standard security deposit is 1 month rent equivalent</span></li>
                                  </>
                                )}
                              </ul>
                            </div>
                            
                            <div className="space-y-2.5">
                              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">Check Out</h5>
                              <ul className="space-y-2 text-xs text-slate-655 font-semibold">
                                {rightRules.map((rule, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <span>{rule}</span>
                                  </li>
                                ))}
                                {rightRules.length === 0 && (
                                  <>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Check-out time is by 11:00 AM</span></li>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Ensure utility dues cleared before exit clearance</span></li>
                                    <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /> <span>Notify management 30 days prior to checkout</span></li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Location simulated Map */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-lg font-bold text-indigo-950">Location</h4>
                      
                      <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner select-none">
                        <svg className="w-full h-full opacity-60" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0" y="0" width="800" height="300" fill="#f1f5f9"/>
                          <path d="M50 0 C100 50, 150 50, 200 0 L250 0 C300 100, 200 200, 100 300 L0 300 Z" fill="#e2e8f0"/>
                          <circle cx="650" cy="100" r="80" fill="#cbd5e1" opacity="0.5"/>
                          
                          <path d="M0 80 H800" stroke="white" strokeWidth="16" />
                          <path d="M0 80 H800" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                          
                          <path d="M300 0 V300" stroke="white" strokeWidth="16" />
                          <path d="M300 0 V300" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                          
                          <path d="M0 240 L800 120" stroke="white" strokeWidth="16" />
                          
                          <text x="40" y="70" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Worth St.</text>
                          <text x="320" y="280" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Leonard St.</text>
                          <text x="600" y="160" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">W Broadway</text>
                        </svg>
                        
                        <div className="absolute top-1/2 left-[300px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className="w-10 h-10 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-white animate-bounce">
                            <Building className="w-5 h-5" />
                          </div>
                          <div className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                            {selectedProperty.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reviews section inside Left Column */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center text-slate-900">
                        <h4 className="font-serif text-lg font-bold text-indigo-950">Property Reviews Feed & Ratings</h4>
                        <div className="flex items-center space-x-1.5 font-bold text-sm text-amber-500 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-lg">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>4.8 Ratings</span>
                        </div>
                      </div>

                      {/* Individual reviews stack list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                        {reviewsList.filter(r => r.propertyId === selectedProperty.id).map(rev => (
                          <div key={rev.id} className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start text-xs">
                                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400 inline" /> {rev.userName}
                                </span>
                                <div className="flex space-x-0.5 items-center">
                                  <span className="text-slate-400 text-[9px] mr-1">{rev.date}</span>
                                  {Array.from({ length: rev.rating }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-slate-605 leading-relaxed font-light italic mt-2">
                                "{rev.comment}"
                              </p>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-200/40 mt-2">
                              <ThumbsUp className="w-3 h-3 text-indigo-600" /> Was review helpful? ({rev.helpfulCount + (rev.id.includes('dyn') ? 1 : 0)} agree)
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Review submit subform */}
                      {currentUser ? (
                        <form onSubmit={handleSubmitReview} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 text-xs max-w-xl">
                          <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">Post Guest Experience</span>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-650">Service Rating:</span>
                            <select 
                              value={userRating} 
                              onChange={(e) => setUserRating(Number(e.target.value))}
                              className="text-xs border border-slate-200 bg-white p-1.5 rounded-lg max-w-[80px] focus:outline-none"
                            >
                              <option value="5">5 ★★★★★</option>
                              <option value="4">4 ★★★★</option>
                              <option value="3">3 ★★★</option>
                              <option value="2">2 ★★</option>
                              <option value="1">1 ★</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <textarea 
                              value={userComment}
                              onChange={(e) => setUserComment(e.target.value)}
                              placeholder="Comment on room sizes, food service board, hygiene, etc..."
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 h-16 resize-none font-medium"
                            />
                            <button 
                              type="submit"
                              className="curved-orange-border-btn font-bold py-2 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer block"
                            >
                              Submit Feedback Review
                            </button>
                          </div>

                          {reviewStatus && (
                            <p className={`text-[10px] font-bold text-center uppercase tracking-widest p-2 rounded-lg ${
                              reviewStatus.includes('mandatory') ? 'text-rose-700 bg-rose-50 border border-rose-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                            }`}>
                              {reviewStatus}
                            </p>
                          )}
                        </form>
                      ) : (
                        <p className="text-xs text-slate-400 text-center italic bg-slate-50 p-3 rounded-2xl max-w-xl">
                          Sign in stays companion session to write a review.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: STICKY BOOKING FORM CARD */}
                  <div className="lg:sticky lg:top-20">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
                      <div className="text-center">
                        <h4 className="font-serif text-xl font-bold text-indigo-900 tracking-wide">Book Room</h4>
                        <div className="h-0.5 w-12 bg-indigo-500 mx-auto mt-2 rounded-full"></div>
                      </div>

                      {bookingSuccessMode && lastCreatedBooking ? (
                        /* Inline Booking Confirmation Ticket Details */
                        <div className="space-y-4 py-2 animate-scale-up">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">Stay Registration Request Complete!</h5>
                            <p className="text-[10.5px] text-slate-500 mt-1.5 leading-relaxed">
                              Pending approval from hostel admin. View invoice bill breakdown details and make simulated payments to confirm instantly.
                            </p>
                          </div>
                          
                          {/* visual companion receipt ticket wrapper */}
                          <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-xs leading-relaxed font-sans">
                            <div className="flex justify-between font-bold">
                              <span>Stay Unit:</span> <span className="font-mono">Rm {lastCreatedBooking.roomNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Invoice Bill:</span> <strong className="text-indigo-700">₹{lastCreatedBooking.totalAmount.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Reference ID:</span> <span>STAY-{lastCreatedBooking.id.split('-')[1]}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button 
                              onClick={() => {
                                setSelectedProperty(null);
                                setBookingRoom(null);
                                setBookingSuccessMode(false);
                                setActiveInvoice(lastCreatedBooking);
                                setActiveTab('bookings');
                              }}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase py-3 rounded-xl transition cursor-pointer text-center block tracking-wider"
                            >
                              View in My Bookings
                            </button>
                            <button 
                              onClick={() => {
                                setBookingSuccessMode(false);
                                setSelectedProperty(null);
                              }}
                              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-extrabold uppercase py-2.5 rounded-xl transition cursor-pointer text-center block tracking-wider"
                            >
                              Back to Search
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Inline Booking Inputs form */
                        <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs font-sans">
                          {/* Name Input */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Your Name *</label>
                            <input 
                              type="text" 
                              placeholder="Ex. John Doe"
                              value={bookingName}
                              onChange={(e) => setBookingName(e.target.value)}
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                              required
                            />
                          </div>

                          {/* Phone Input */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Phone Number *</label>
                            <input 
                              type="tel" 
                              placeholder="Enter Phone Number"
                              value={bookingPhone}
                              onChange={(e) => setBookingPhone(e.target.value)}
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                              required
                            />
                          </div>

                          {/* Check in / Check out row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-700">Check-in Date *</label>
                              <input 
                                type="date"
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono font-medium"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-700">Check-out Date *</label>
                              <input 
                                type="date"
                                value={checkOutDate}
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono font-medium"
                                required
                              />
                            </div>
                          </div>

                          {/* Stay Duration scheme selection */}
                          {(() => {
                            const pDay = bookingRoom?.pricePerDay || bookingRoom?.price || 1200;
                            const pWeek = bookingRoom?.priceWeekly || pDay * 7;
                            const pMonth = bookingRoom?.pricePerMonth || pDay * 22;
                            const pSeasonal = bookingRoom?.priceSeasonal || pMonth * 1.2;

                            return (
                              <div className="space-y-1.5">
                                <label className="block font-bold text-slate-700">Stay Duration *</label>
                                <select 
                                  id="stay-duration"
                                  value={stayDurationOption} 
                                  onChange={(e) => setStayDurationOption(e.target.value)}
                                  className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium font-sans"
                                  required
                                >
                                  <option value="day">Day - ₹{pDay.toLocaleString('en-IN')}</option>
                                  <option value="week">Week - ₹{pWeek.toLocaleString('en-IN')}</option>
                                  <option value="month">Month - ₹{pMonth.toLocaleString('en-IN')}</option>
                                  <option value="seasonal">Seasonal - ₹{pSeasonal.toLocaleString('en-IN')}</option>
                                </select>
                              </div>
                            );
                          })()}

                          {/* Adult Input selection (Full width, children removed) */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Adult *</label>
                            <select 
                              value={bookingAdults} 
                              onChange={(e) => setBookingAdults(e.target.value)}
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                            >
                              <option value="1">1 Adult</option>
                              <option value="2">2 Adults</option>
                              <option value="3">3 Adults</option>
                              <option value="4">4+ Adults</option>
                            </select>
                          </div>

                          {/* Room Type dropdown select */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Room Type *</label>
                            <select 
                              value={bookingRoom?.id || ""} 
                              onChange={(e) => {
                                const rm = propertyRooms.find(r => r.id === e.target.value);
                                if (rm) setBookingRoom(rm);
                              }}
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                              required
                            >
                              <option value="">Select a Room Unit</option>
                              {propertyRooms.map(rm => (
                                <option key={rm.id} value={rm.id}>
                                  Unit {rm.roomNumber} ({rm.type} - {selectedProperty.type === 'PG' ? '₹' + rm.pricePerMonth + '/mo' : '₹' + rm.pricePerDay + '/day'})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Number of Rooms select */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Number of Rooms *</label>
                            <select 
                              value={bookingNumRooms} 
                              onChange={(e) => setBookingNumRooms(e.target.value)}
                              className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                            >
                              <option value="1">1 Room</option>
                              <option value="2">2 Rooms</option>
                              <option value="3">3 Rooms</option>
                            </select>
                          </div>

                          {/* Live Dynamic Pricing breakdown */}
                          {bookingRoom && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 select-none">
                              <div className="flex justify-between text-slate-500 font-medium">
                                <span>Base Rate ({costBreakdown.meal > 0 ? 'inc meal' : 'room only'}):</span>
                                <span className="font-mono text-slate-700 font-bold">₹{costBreakdown.baseOriginal.toLocaleString('en-IN')}</span>
                              </div>
                              {costBreakdown.discount > 0 && (
                                <div className="flex justify-between text-rose-600 font-semibold">
                                  <span>Discount Applied:</span>
                                  <span className="font-mono">-₹{costBreakdown.discount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-500 font-medium">
                                <span>GST Tax (18%):</span>
                                <span className="font-mono text-slate-700 font-bold">₹{costBreakdown.tax.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="border-t border-slate-200/80 pt-2 flex justify-between font-black text-slate-900 text-sm">
                                <span>Total Pricing:</span>
                                <span className="font-mono text-indigo-900 text-[15px]">₹{costBreakdown.final.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Promo code inputs */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Apply Promo Code</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="PROMO CODE"
                                value={couponCodeInput}
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                className="flex-1 text-xs border border-slate-200 bg-white px-2.5 py-2 rounded-lg uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                              />
                              <button 
                                type="button" 
                                onClick={handleApplyBookingCoupon}
                                className="curved-orange-border-btn text-xs font-bold px-3 py-2 rounded-xl transition shrink-0 cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                            {couponMessage && (
                              <p className={`text-[10px] font-semibold mt-1 ${couponMessage.includes('Successful') ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {couponMessage}
                              </p>
                            )}
                          </div>

                          {/* Submit Booking Now button */}
                          <button 
                            type="submit"
                            className="curved-orange-border-btn w-full py-3 rounded-xl font-bold transition active:scale-[0.98] uppercase tracking-wider text-xs shadow-xs cursor-pointer select-none"
                          >
                            Book Now
                          </button>
                          
                          {/* Authentication note */}
                          {!currentUser && (
                            <p className="text-[10px] text-center text-slate-400 italic bg-amber-50/50 border border-amber-100 p-2 rounded-lg mt-2">
                              Note: You will be asked to sign in or complete guest profile registration to complete the reservation.
                            </p>
                          )}
                        </form>
                      )}
                    </div>
                  </div>

                </div>

              </div>
              
              {/* Footer Spacer */}
              <footer className="bg-slate-900 py-6 text-center text-slate-500 text-[10px] select-none mt-12 border-t border-slate-850">
                <p>&copy; {new Date().getFullYear()} {selectedProperty.name} &bull; StayHub Customer Console. All rights reserved.</p>
              </footer>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Dynamic booking Wizard configuration form */}
      {showBookingModal && bookingRoom && selectedProperty && (
        <div id="booking-modal-overlay" className="absolute inset-0 bg-slate-950/75 z-50 backdrop-blur-xs flex flex-col justify-end">
          <div id="booking-sheet-container" className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto space-y-4 animate-slide-up text-slate-900 border-t border-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 block pb-0.5">Stay Register Form</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-none">{selectedProperty.name} &bull; Unit room {bookingRoom.roomNumber}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMode && lastCreatedBooking ? (
              /* TICKETS BOOKING CONFIRMATION SCREEN */
              <div className="text-center py-6 space-y-4 animate-scale-up">
                <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-950">Stay Registration Request Complete!</h4>
                  <p className="text-[10px] text-slate-500 max-w-[85%] mx-auto mt-1">Pending approval from admin. View invoice bill breakdown details and make simulated payments to confirm instantly.</p>
                </div>
                
                {/* Visual companion receipt ticket wrapper */}
                <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-left max-w-[240px] mx-auto text-[10px] leading-relaxed">
                  <div className="flex justify-between font-bold">
                    <span>Stay Unit:</span> <span className="font-mono">Rm {lastCreatedBooking.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice Bill:</span> <strong className="text-indigo-650 text-indigo-700">₹{lastCreatedBooking.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Reference ID:</span> <span>STAY-{lastCreatedBooking.id.split('-')[1]}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-1.5">
                  <button 
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedProperty(null);
                      setBookingRoom(null);
                      setActiveInvoice(lastCreatedBooking);
                      setActiveTab('bookings');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-[9.5px] rounded-lg px-4 py-2 uppercase tracking-wide cursor-pointer transition shadow-xs"
                  >
                    Pay Invoice / Show UPI QR
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="space-y-3.5 text-xs">
                
                {/* Multi date input rows */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Check-in Date</label>
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full border border-slate-200 bg-white font-mono rounded-lg p-2 text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Check-out Date</label>
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full border border-slate-200 bg-white font-mono rounded-lg p-2 text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* Diet selections */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Culinary Meal Board Plans</label>
                  <div className="grid grid-cols-3 gap-1.5 text-center select-none text-[9.5px]">
                    <div 
                      onClick={() => setMealPlan('None')}
                      className={`p-2 border rounded-xl cursor-pointer transition flex flex-col justify-center leading-normal ${
                        mealPlan === 'None' ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">No meals option</span>
                      <span className="text-[8px] text-slate-400 font-mono font-normal mt-0.5">₹0 / day</span>
                    </div>

                    <div 
                      onClick={() => setMealPlan('Breakfast Only')}
                      className={`p-2 border rounded-xl cursor-pointer transition flex flex-col justify-center leading-normal ${
                        mealPlan === 'Breakfast Only' ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">Breakfast Only</span>
                      <span className="text-[8px] text-slate-400 font-mono font-normal mt-0.5">+₹150 / day</span>
                    </div>

                    <div 
                      onClick={() => setMealPlan('Full Board')}
                      className={`p-2 border rounded-xl cursor-pointer transition flex flex-col justify-center leading-normal ${
                        mealPlan === 'Full Board' ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">Full meals boarding</span>
                      <span className="text-[8px] text-slate-400 font-mono font-normal mt-0.5">+₹450 / day</span>
                    </div>
                  </div>
                </div>

                {/* Preferred Payment Mode */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Preferred Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-200 bg-white font-mono rounded-lg p-2 text-[10.5px] text-slate-800 rounded-xl"
                  >
                    <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                    <option value="Card">Credit or Debit Card</option>
                    <option value="Cash">Cash payment at Counter / Venue</option>
                    <option value="NetBanking">Net Banking (NEFT/IMPS)</option>
                  </select>
                </div>

                {/* Notes input */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Additional occupant profile notes</label>
                  <textarea 
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="E.g., Vegetarian kitchen preference, quiet area, low floor, single corporate profile details."
                    className="w-full border border-slate-200 bg-white font-mono rounded-lg p-2 h-14 text-[10.5px] text-slate-800"
                  />
                </div>

                {/* PROMOTION CODES INPUT FIELD */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Apply Promotion Coupon</label>
                  <div className="flex items-center space-x-1.5">
                    <input 
                      type="text" 
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Try: WELCOME10 or STAYSAFE"
                      className="flex-1 border border-slate-200 bg-white font-mono rounded-lg p-2 uppercase text-slate-800 text-[10px]"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyBookingCoupon}
                      className="curved-orange-border-btn font-bold py-2 px-3.5 rounded-xl text-[10px] transition cursor-pointer"
                    >
                      Apply Code
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-[9.5px] mt-1 font-semibold ${
                      couponMessage.includes('Success') ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Interactive Dynamic cost itemization preview matrix */}
                <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-[10px] text-slate-650 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Base stay price:</span>
                    <span>
                      {costBreakdown.baseOriginal && costBreakdown.baseOriginal > costBreakdown.base ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through">₹{costBreakdown.baseOriginal.toLocaleString('en-IN')}</span>
                          <span className="text-indigo-600 font-bold">₹{costBreakdown.base.toLocaleString('en-IN')}</span>
                        </span>
                      ) : (
                        <span>₹{costBreakdown.base.toLocaleString('en-IN')}</span>
                      )}
                    </span>
                  </div>
                  {costBreakdown.meal > 0 && (
                    <div className="flex justify-between">
                      <span>Dining buffet subscription:</span>
                      <span>+₹{costBreakdown.meal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {costBreakdown.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[9.5px]">
                      <span>Coupon applied discount:</span>
                      <span>-₹{costBreakdown.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Government GST tax rate (18%):</span>
                    <span>₹{costBreakdown.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-slate-200 my-1" />
                  <div className="flex justify-between text-[12px] font-black font-display text-slate-900 leading-none pt-1">
                    <span>Final Account Bill:</span>
                    <span className="text-indigo-650 text-indigo-700 font-mono">₹{costBreakdown.final.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-1 p-1 text-[8px] text-slate-400 leading-normal">
                  <Info className="w-3.5 h-3.5 shrink-0 text-slate-350" />
                  <span>By submitting, you instantly register a lease requests database record. No actual payment required.</span>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl uppercase tracking-wider text-[10.5px] transition hover:shadow-lg shadow-indigo-150 active:scale-98 cursor-pointer text-center block pt-3"
                >
                  Create Reservation request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PROFILE EDIT DIALOG DRAWERS */}
      {showEditProfileModal && currentUser && (
        <div id="edit-profile-backdrop" className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div id="edit-profile-sheet" className="bg-white rounded-2xl w-full max-w-[365px] p-5 space-y-4 animate-scale-up text-slate-800 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Edit Customer Information</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveProfileChanges} className="space-y-4 text-xs leading-relaxed">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Edit Name</label>
                <input 
                  type="text" 
                  value={profileEditForm.name} 
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Edit Phone</label>
                  <input 
                    type="text" 
                    value={profileEditForm.phone} 
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Gender</label>
                  <select 
                    value={profileEditForm.gender} 
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, gender: e.target.value })}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Email Address</label>
                <input 
                  type="email" 
                  value={profileEditForm.email} 
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Government KYC Type</label>
                  <select 
                    value={profileEditForm.kycType} 
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, kycType: e.target.value })}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs font-medium"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN Card">PAN Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">KYC Document Status</label>
                  <select
                    value={profileEditForm.kycPhoto ? 'uploaded' : 'pending'}
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, kycPhoto: e.target.value === 'uploaded' ? 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=100' : '' })}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs font-medium"
                  >
                    <option value="uploaded">Mock Uploaded</option>
                    <option value="pending">Awaiting File</option>
                  </select>
                </div>
              </div>

              <hr className="border-slate-100" />
              <div className="space-y-2">
                <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-400 block">Emergency & Medical Information</span>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Emergency contact person</label>
                  <input 
                    type="text" 
                    value={profileEditForm.emergencyName} 
                    onChange={(e) => setProfileEditForm({ ...profileEditForm, emergencyName: e.target.value })}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Emergency phone</label>
                    <input 
                      type="text" 
                      value={profileEditForm.emergencyPhone} 
                      onChange={(e) => setProfileEditForm({ ...profileEditForm, emergencyPhone: e.target.value })}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Blood Group</label>
                    <select 
                      value={profileEditForm.bloodGroup} 
                      onChange={(e) => setProfileEditForm({ ...profileEditForm, bloodGroup: e.target.value })}
                      className="w-full p-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-2.5 rounded-xl text-xs mt-3 cursor-pointer tracking-wider transition active:scale-95 shadow-sm"
              >
                Save and Sync Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD DIALOG */}
      {showChangePasswordModal && currentUser && (
        <div id="change-password-backdrop" className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div id="change-password-sheet" className="bg-white rounded-2xl w-full max-w-[345px] p-5 space-y-4 animate-scale-up text-slate-800 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <LockIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Change Password</h3>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(false)} 
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setChangePasswordError('');
                setChangePasswordSuccess('');

                const currentSavedPass = (currentUser as any).password || '123456';
                
                if (oldPasswordInput !== currentSavedPass) {
                  setChangePasswordError('The current password you entered is incorrect.');
                  return;
                }

                if (!newPasswordInput) {
                  setChangePasswordError('Please enter a new password.');
                  return;
                }

                if (newPasswordInput.length < 4) {
                  setChangePasswordError('New password must be at least 4 characters.');
                  return;
                }

                if (newPasswordInput !== confirmNewPasswordInput) {
                  setChangePasswordError('Passwords do not match.');
                  return;
                }

                const updatedUser = {
                  ...currentUser,
                  password: newPasswordInput
                };

                setCurrentUser(updatedUser as any);
                setLocalStorageData('logged_in_customer', updatedUser);
                
                setProfileEditForm(prev => ({
                  ...prev,
                  password: newPasswordInput
                }));

                setChangePasswordSuccess('Password updated successfully!');
                onAddAuditLog('Customer updated security password', 'Tenants');
                
                setOldPasswordInput('');
                setNewPasswordInput('');
                setConfirmNewPasswordInput('');

                setTimeout(() => {
                  setShowChangePasswordModal(false);
                }, 1500);
              }} 
              className="space-y-3.5 text-xs"
            >
              {changePasswordError && (
                <div className="p-2 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] rounded-lg font-medium flex items-start gap-1.5 leading-normal">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-lg font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Current Password</label>
                <input 
                  type="password"
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">New Password</label>
                <input 
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-xs"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-2.5 rounded-xl text-xs mt-4 tracking-wider transition active:scale-95 shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MULTI_SCREEN DIALOG 4: SYSTEM NOTIFICATIONS OVERLAYS */}
      {showNotificationsOverlay && (
        <div id="notifications-backdrop" className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-start">
          <div id="notifications-modal-drawer" className="bg-white max-h-[70%] overflow-y-auto rounded-b-3xl p-4 space-y-4 animate-scale-down text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">StayHub Alerts desk</span>
              <div className="flex space-x-1">
                <button 
                  onClick={() => {
                    const read = notifications.map(n => ({ ...n, isRead: true }));
                    setNotifications(read);
                    setLocalStorageData('notifications', read);
                  }}
                  className="text-[9.5px] text-indigo-600 hover:underline font-bold"
                >
                  Mark all as read
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => setShowNotificationsOverlay(false)} className="p-0.5 hover:bg-slate-100 rounded-full">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {!currentUser || userNotifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-slate-200" />
                <p className="text-xs font-bold text-slate-500">Inbox is empty</p>
                <p className="text-[9px]">We will notify you on reservation clears or invoice balances.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {userNotifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed flex gap-2 ${
                      n.isRead ? 'bg-white border-slate-100 text-slate-600' : 'bg-indigo-50/40 border-indigo-100 font-medium'
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      {n.type === 'Alert' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-baseline gap-1.5">
                        <h4 className="font-extrabold text-[10.5px] text-slate-900 line-clamp-1">{n.title}</h4>
                        <span className="text-[8px] text-slate-400 font-mono shrink-0">{n.date}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-600 leading-normal">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER MODULAR SIMULATORS */}
      <AuthWizard 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authWizardInitialView}
        onLoginSuccess={(user, isRegister) => {
          handleCustomerLogin(user, isRegister);
          setShowAuthModal(false);
        }}
        onAddAuditLog={onAddAuditLog as any}
      />

      {activeInvoice && (
        <InvoiceModal 
          isOpen={!!activeInvoice}
          onClose={() => setActiveInvoice(null)}
          booking={activeInvoice}
          onPaymentSuccess={handlePaymentCleared}
        />
      )}



    </div>
  );
}
