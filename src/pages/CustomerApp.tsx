import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Room, Bed, Booking, Notification, Tenant } from '../types';
import { 
  getLocalStorageData, 
  setLocalStorageData 
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
  ArrowLeft
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
    } else {
      setProfileCompleted(false);
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
        id: matchedIdx !== -1 ? currentTenants[matchedIdx].id : `tenant-${Date.now()}`,
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
        id: user.id || `tenant-${Date.now()}`,
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

  // New review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<string>('');

  // Booking form fields
  const [checkInDate, setCheckInDate] = useState('2026-06-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-06-15');
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
  useEffect(() => {
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
    // Search physically on property name, address, or city
    const matchesQuery = (prop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (prop.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prop.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prop.amenities || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = selectedCity === 'All' || prop.city === selectedCity;

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

      // 3- Sharing Type: Single sharing, Double sharing, Triple sharing, etc.
      let matchesSharingType = true;
      if (filterSharingTypes.length > 0) {
        let rShareClass = 'Single sharing';
        if (r.type === 'Double') rShareClass = 'Double sharing';
        if (r.type === 'Triple') rShareClass = 'Triple sharing';
        if (r.type === 'Four-Sharing') rShareClass = 'Triple sharing'; // Fallback
        matchesSharingType = filterSharingTypes.includes(rShareClass);
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

    return matchesQuery && matchesCity && matchesCategory && matchesCategorySharing && hasMatchingRooms;
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
    setSelectedProperty(prop);
    const propRooms = rooms.filter(r => r.propertyId === prop.id);
    setPropertyRooms(propRooms);
    setActiveImgIdx(0);
    setReviewStatus('');
    setUserComment('');
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

    let baseOriginalRate = 0;
    let baseRate = 0;
    if (selectedProperty.type === 'PG') {
      const months = Math.max(1, Math.round(diffDays / 30));
      baseOriginalRate = bookingRoom.pricePerMonth * months;
      const discountedMonthPrice = Math.round(bookingRoom.pricePerMonth * (1 - roomDiscountPct / 100));
      baseRate = discountedMonthPrice * months;
    } else {
      baseOriginalRate = bookingRoom.pricePerDay * diffDays;
      const discountedDayPrice = Math.round(bookingRoom.pricePerDay * (1 - roomDiscountPct / 100));
      baseRate = discountedDayPrice * diffDays;
    }

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
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-75"
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
    <div id="customer-container shadow-inner" className={`w-full max-w-7xl mx-auto bg-slate-50 min-h-[750px] pb-24 shadow-2xl relative md:rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 ${
      settingsToggles.mockDarkOverlay ? 'brightness-90 select-none grayscale-10 transition' : 'transition'
    }`}>
      
      {/* Primary Mobile Header Bar */}
      <header id="customer-header" className="bg-white px-4 py-3 border-b border-slate-100 shadow-xs flex justify-between items-center relative z-20">
        <div id="mobile-branding" className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1.5 rounded-xl text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black font-display text-slate-950 hover:text-indigo-600 cursor-pointer" onClick={() => setActiveTab('home')}>StayHub</h1>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest font-mono">Mobile Hub</p>
          </div>
        </div>

        {/* Header toolbar Actions */}
        <div id="header-interactive-actions" className="no-uiverse flex items-center space-x-2">
          <button 
            id="notifications-bell"
            onClick={() => setShowNotificationsOverlay(!showNotificationsOverlay)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 relative transition-transform active:scale-90"
            title="Notification Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifCount > 0 && (
              <span id="unread-dot" className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <button 
              id="user-profile-menu-button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/75 p-1 rounded-full pr-2.5 transition active:scale-95"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                {currentUser.name[0]}
              </div>
              <span className="text-[10px] font-extrabold text-indigo-950 truncate max-w-[65px]">{currentUser.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button 
              id="login-button-trigger"
              onClick={() => setShowAuthModal(true)}
              className="text-[10px] font-black uppercase bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-md text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      {/* Main Container viewport */}
      <main id="customer-main-view" className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        
        {/* VIEW TAB 1: Search Hub (Home) */}
        {activeTab === 'home' && (
          <div id="customer-tab-home" className="space-y-4 animate-fade-in text-slate-800">
            
            {/* Elegant contextual welcome card */}
            <div className="bg-gradient-to-tr from-indigo-800 via-indigo-900 to-slate-950 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 opacity-15">
                <Sparkles className="w-24 h-24 text-indigo-200" />
              </div>
              <span className="text-[8px] tracking-widest font-mono font-bold text-amber-300 uppercase block">Zero broker charges</span>
              <h2 className="text-base font-black font-display leading-tight mt-0.5">Stay Anywhere Instantly</h2>
              <p className="text-[10.5px] text-slate-300 leading-relaxed max-w-[90%] mt-1">Book premium hostels, boutique hotel rooms, and elite PG co-living with fully automated verification clearances.</p>
              
              <div className="flex items-center space-x-1 bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg text-[9px] w-max mt-3 font-mono">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Cities: Bangalore, Hyderabad, Mumbai</span>
              </div>
            </div>

            {/* LOCATION ACCESS PERMISSION MESSAGE FROM CUSTOMER AS A REQUEST MESSAGE */}
            {locationPermission === 'prompt' && (
              <div id="location-permission-prompt" className="bg-gradient-to-r from-cyan-50/75 via-indigo-50/75 to-violet-50/75 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in shadow-xs text-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11.5px] font-black text-indigo-950 uppercase tracking-wide">📍 Location Access Needed</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      We use your coordinates to calculate distance from your exact position to discover nearby hotels and elite PGs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            setUserCoords(coords);
                            setLocationPermission('granted');
                            localStorage.setItem('hotel_pg_loc_permission', 'granted');
                            localStorage.setItem('hotel_pg_user_coords', JSON.stringify(coords));
                            onAddAuditLog('Customer enabled geological GPS permissions', 'Bookings');
                          },
                          () => {
                            // Safe fallback in case they block system permissions: Bangalore Central
                            const fallbackCoords = { lat: 12.9716, lng: 77.5946 };
                            setUserCoords(fallbackCoords);
                            setLocationPermission('granted');
                            localStorage.setItem('hotel_pg_loc_permission', 'granted');
                            localStorage.setItem('hotel_pg_user_coords', JSON.stringify(fallbackCoords));
                            onAddAuditLog('Customer simulated coordinates fallback to Bangalore Central', 'Bookings');
                          }
                        );
                      } else {
                        const fallbackCoords = { lat: 12.9716, lng: 77.5946 };
                        setUserCoords(fallbackCoords);
                        setLocationPermission('granted');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100 hover:shadow-md text-white font-extrabold text-[10px] uppercase px-3 py-2 rounded-xl transition cursor-pointer active:scale-95"
                  >
                    Grant Location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationPermission('denied');
                      localStorage.setItem('hotel_pg_loc_permission', 'denied');
                    }}
                    className="text-slate-500 hover:bg-slate-100 border border-slate-200 bg-white font-bold text-[10px] uppercase px-3 py-2 rounded-xl transition"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            )}

            {locationPermission === 'granted' && (
              <div id="location-active-badge" className="bg-emerald-50/85 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-[10.5px] text-emerald-800 font-medium font-sans">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>📍 GPS Linked ({userCoords ? `${userCoords.lat.toFixed(3)}, ${userCoords.lng.toFixed(3)}` : 'Bangalore Central'}): Showing nearest listings & distance away.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocationPermission('prompt');
                    setUserCoords(null);
                    localStorage.removeItem('hotel_pg_loc_permission');
                    localStorage.removeItem('hotel_pg_user_coords');
                  }}
                  className="text-slate-500 hover:text-rose-600 hover:underline text-[9.5px]"
                >
                  Disconnect GPS
                </button>
              </div>
            )}

            {/* Quick Search Hub Form */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask for property names, city, Wifi, features..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none text-slate-800"
                />
              </div>

              {/* Below search bar some transparent buttons */}
              <div className="space-y-1.5 pt-0.5 border-t border-slate-50">
                <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Quick Presets:</span>
                <div className="flex space-x-1.5 overflow-x-auto select-none no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: '🌍 All Stays' },
                    { id: 'hotel', label: '🏨 Hotels' },
                    { id: 'pg', label: '🏠 PGs' },
                    { id: 'colive', label: '🤝 Co-Living' },
                    { id: '2-share', label: '👥 2-Share' },
                    { id: '3-share', label: '👥👥 3-Share' },
                    { id: '4-share', label: '🛌 4-Share' },
                    { id: 'dormitory', label: '🏫 Dormitory' }
                  ].map((cat) => {
                    const active = activeCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryFilter(cat.id as any)}
                        className={`text-[9.5px] font-bold border px-3 py-1.5 rounded-full transition shrink-0 uppercase tracking-tight duration-200 ${
                          active 
                            ? 'bg-indigo-50/50 border-indigo-600 text-indigo-600 font-extrabold shadow-xs active:scale-95' 
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtering row choices */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <div className="flex space-x-1 overflow-x-auto select-none no-scrollbar flex-1">
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-[10px] border border-slate-200 bg-white font-medium rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 max-w-[80px]"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <button 
                    onClick={() => setSelectedType(selectedType === 'All' ? 'PG' : selectedType === 'PG' ? 'Hotel' : 'All')}
                    className={`text-[10px] font-bold border px-2.5 py-1 rounded-lg transition shrink-0 ${
                      selectedType !== 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedType === 'All' ? 'All Formats' : selectedType === 'Hotel' ? '🏨 Hotels' : '🏠 PG living'}
                  </button>

                  <select 
                    value={selectedSharing} 
                    onChange={(e) => setSelectedSharing(e.target.value)}
                    className="text-[10px] border border-slate-200 bg-white font-medium rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="All">All Sharings</option>
                    <option value="Single">Single occupant</option>
                    <option value="Double">Double (2 Sharing)</option>
                    <option value="Triple">Triple (3 Sharing)</option>
                    <option value="Four-Sharing">Four occupant</option>
                  </select>
                </div>

                <div 
                  onClick={() => setActiveTab('filters')}
                  className="p-2 border rounded-lg transition shrink-0 bg-slate-50 border-slate-200 hover:border-slate-350 text-indigo-600 flex items-center gap-1 font-bold text-[10px] cursor-pointer no-uiverse"
                  title="Configure advanced filters parameters"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </div>
              </div>
            </div>

            {/* FEATURED HOTELS HORIZONTAL SECTION */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">🏨 Featured Boutique Hotels</h3>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
                 {featuredHotels.map(prop => {
                  const hotelRooms = rooms.filter(r => r.propertyId === prop.id);
                  
                  let maxDiscount = 0;
                  if (prop.discountType === 'all') {
                    maxDiscount = prop.discountPercentage || 0;
                  } else if (prop.discountType === 'custom') {
                    const discounts = hotelRooms.map(r => r.discountPercentage || 0);
                    maxDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;
                  }

                  const minOriginalPrice = hotelRooms.length > 0 ? hotelRooms[0].pricePerDay : 2200;
                  let minDiscountedPrice = minOriginalPrice;
                  if (hotelRooms.length > 0) {
                    const discountPct = prop.discountType === 'all' ? (prop.discountPercentage || 0) : (hotelRooms[0].discountPercentage || 0);
                    minDiscountedPrice = Math.round(minOriginalPrice * (1 - discountPct / 100));
                  }

                  return (
                    <div 
                      key={prop.id}
                      onClick={() => handleViewProperty(prop)}
                      className="bg-white rounded-xl border border-slate-150 p-2 min-w-[190px] max-w-[190px] text-left shrink-0 cursor-pointer shadow-xs hover:shadow-md hover:border-slate-300 transition relative"
                    >
                      <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-105 relative">
                        <img 
                          src={prop.imageUrl || PROPERTY_IMAGES[prop.id]?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'} 
                          alt={prop.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-indigo-650 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                          HOTEL
                        </span>
                        {maxDiscount > 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 animate-pulse">
                            <Tag className="w-2.5 h-2.5 text-white" />
                            {prop.discountType === 'all' ? `${maxDiscount}% OFF` : `Up to ${maxDiscount}%`}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-900 truncate mt-1.5">{prop.name}</h4>
                      <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">{prop.city} &bull; Nearby Stay</p>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 truncate">
                          {maxDiscount > 0 ? (
                            <span className="flex items-center gap-1">
                              <span className="text-slate-450 line-through">₹{minOriginalPrice}</span>
                              <span className="text-indigo-650 text-indigo-650 font-bold">₹{minDiscountedPrice}</span>
                            </span>
                          ) : (
                            <span>From ₹{minOriginalPrice}</span>
                          )}
                        </span>
                        <span className="text-amber-500 font-bold flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-amber-500 inline" />
                          <span>4.8</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FEATURED PGS SEPARATOR */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">🏠 Premium Co-Living PGs</h3>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
                 {featuredPGs.map(prop => {
                  const pgRooms = rooms.filter(r => r.propertyId === prop.id);
                  
                  let maxDiscount = 0;
                  if (prop.discountType === 'all') {
                    maxDiscount = prop.discountPercentage || 0;
                  } else if (prop.discountType === 'custom') {
                    const discounts = pgRooms.map(r => r.discountPercentage || 0);
                    maxDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;
                  }

                  const minOriginalPrice = pgRooms.length > 0 ? pgRooms[0].pricePerMonth : 8500;
                  let minDiscountedPrice = minOriginalPrice;
                  if (pgRooms.length > 0) {
                    const discountPct = prop.discountType === 'all' ? (prop.discountPercentage || 0) : (pgRooms[0].discountPercentage || 0);
                    minDiscountedPrice = Math.round(minOriginalPrice * (1 - discountPct / 100));
                  }

                  return (
                    <div 
                      key={prop.id}
                      onClick={() => handleViewProperty(prop)}
                      className="bg-white rounded-xl border border-slate-150 p-2 min-w-[190px] max-w-[190px] text-left shrink-0 cursor-pointer shadow-xs hover:shadow-md hover:border-slate-300 transition relative"
                    >
                      <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-105 relative">
                        <img 
                          src={prop.imageUrl || PROPERTY_IMAGES[prop.id]?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'} 
                          alt={prop.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                          CO-LIVING
                        </span>
                        {maxDiscount > 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 animate-pulse">
                            <Tag className="w-2.5 h-2.5 text-white" />
                            {prop.discountType === 'all' ? `${maxDiscount}% OFF` : `Up to ${maxDiscount}%`}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-900 truncate mt-1.5">{prop.name}</h4>
                      <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">{prop.city} &bull; Shared Nest</p>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 truncate">
                          {maxDiscount > 0 ? (
                            <span className="flex items-center gap-1">
                              <span className="text-slate-455 line-through">₹{minOriginalPrice}</span>
                              <span className="text-indigo-650 font-bold">₹{minDiscountedPrice}</span>
                            </span>
                          ) : (
                            <span>From ₹{minOriginalPrice}</span>
                          )}
                        </span>
                        <span className="text-amber-500 font-bold flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-amber-500 inline" />
                          <span>4.7</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CORE GRID LISTING ROW */}
            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">🗺️ Main Location Matches ({filteredProperties.length})</h3>
                {(searchQuery || selectedCity !== 'All' || selectedType !== 'All') && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('All');
                      setSelectedType('All');
                      setSelectedSharing('All');
                      setMaxPrice(30000);
                    }}
                    className="text-[10px] text-indigo-650 font-bold hover:underline"
                  >
                    Wipe Filters
                  </button>
                )}
              </div>

              {sortedProperties.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 px-6">
                  <p className="text-xs text-slate-500 font-semibold">No results found matching listings.</p>
                  <p className="text-[10.5px] text-slate-400 mt-1">Try relaxing filters range or changing query strings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
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
                        className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs hover:border-slate-200 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between h-full relative"
                      >
                        <div>
                          {/* Top photo cover */}
                          <div className="w-full h-44 bg-slate-100 relative shrink-0">
                            <img 
                              src={prop.imageUrl || PROPERTY_IMAGES[prop.id]?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'} 
                              alt={prop.name}
                              className="w-full h-full object-cover"
                            />
                            <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white ${
                              prop.type === 'Hotel' ? 'bg-indigo-600 shadow-xs' : 'bg-emerald-600 shadow-xs'
                            }`}>
                              {prop.type}
                            </span>
                            {maxDiscount > 0 && (
                              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-white bg-rose-600 shadow-xs flex items-center gap-0.5 animate-pulse">
                                <Tag className="w-2.5 h-2.5 text-white" />
                                {prop.discountType === 'all' ? `${maxDiscount}% OFF` : `Up to ${maxDiscount}% OFF`}
                              </span>
                            )}
                          </div>

                          {/* Detail text columns */}
                          <div className="p-4 space-y-2">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-sm font-bold text-slate-950 leading-snug line-clamp-1">{prop.name}</h4>
                              <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-sm text-[8px] font-black tracking-tight shrink-0 uppercase">
                                Popular
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-505 font-mono flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{prop.city} &bull; {prop.address.split(',')[1] || 'Central Area'}</span>
                            </p>

                            {/* Amenities highlights */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(prop.amenities || []).slice(0, 3).map((amenity, adIx) => (
                                <span key={adIx} className="bg-slate-55 text-slate-600 border border-slate-105 text-[9px] px-2 py-0.5 rounded-md font-semibold">
                                  {amenity}
                                </span>
                              ))}
                              {(prop.amenities || []).length > 3 && (
                                <span className="bg-slate-50 text-slate-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">+{(prop.amenities || []).length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Base invoice display banner */}
                        <div className="bg-slate-50/50 border-t border-slate-150 p-4 pt-3 mt-1 flex justify-between items-center text-[10.5px] font-mono leading-none">
                          <span className="text-slate-500 font-bold text-[9.5px]">
                            {(prop as any).distance !== undefined ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md font-sans">📍 {(prop as any).distance} km away</span>
                            ) : (
                              <span className="text-slate-450">Nearest Metro &bull; 1.2km</span>
                            )}
                          </span>
                          <strong className="text-indigo-655 text-indigo-700 font-black">
                            {hasDiscount && minDiscountedPrice < minOriginalPrice ? (
                              <span className="flex items-center gap-1">
                                <span className="text-slate-455 line-through font-normal text-[9.5px]">₹{minOriginalPrice.toLocaleString('en-IN')}</span>
                                <span>₹{minDiscountedPrice.toLocaleString('en-IN')}</span>
                              </span>
                            ) : (
                              <span>From ₹{minOriginalPrice.toLocaleString('en-IN')}</span>
                            )}
                            <span className="text-slate-400 font-normal">/{prop.type === 'PG' ? 'mo' : 'day'}</span>
                          </strong>
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

        {/* VIEW TAB 3: Digital Check-In */}
        {activeTab === 'checkin' && (
          <div id="customer-tab-checkin" className="space-y-4 animate-fade-in text-slate-800">
            <h2 className="text-sm font-black font-display uppercase tracking-wide">KYC Verification Gate</h2>
            <p className="text-[10.5px] text-slate-500 leading-relaxed">Instantly verify your biometric facial identity and legal files photo copy matching to expedite reception desk lobby keys collection.</p>
            
            {!currentUser ? (
              <div className="bg-white border rounded-2xl p-6 text-center shadow-xs space-y-3">
                <FileText className="w-10 h-10 mx-auto text-indigo-400" />
                <p className="text-xs text-slate-650 font-bold">Log in to construct digital KYC record</p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-extrabold rounded-xl px-5 py-2.5 transition mt-2"
                >
                  Configure Simulated Credentials
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3.5 text-xs">
                
                {/* Document Type Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Government ID Format type</label>
                  <select 
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 bg-white font-medium rounded-xl p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Aadhaar">Aadhaar National Card (India)</option>
                    <option value="Passport">Passport International Book</option>
                    <option value="Driving License">Government Driving License</option>
                  </select>
                </div>

                {/* 2-Column Responsive Layout for Upload Zones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID select area */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDocDrop}
                    onClick={() => triggerManualFile('id')}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                      isDragOver ? 'border-indigo-500 bg-indigo-50' : 
                      idFileUploaded ? 'border-emerald-500 bg-emerald-50/20 shadow-inner' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UploadCloud className={`w-8 h-8 mx-auto mb-1.5 ${idFileUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-[11px] font-bold text-slate-900">
                      {idFileUploaded ? 'ID verification file recorded' : `Drag and drop front photo of your ${documentType}`}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-1 font-light">Supports PNG, PDF up to 6MB limits. Click to simulator auto upload.</p>
                    
                    {idFileUploaded && (
                      <span className="inline-flex items-center space-x-1 text-[9.5px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2 font-mono">
                        <Check className="w-3 h-3" />
                        <span>verified_{documentType.toLowerCase()}_scan.jpg</span>
                      </span>
                    )}
                  </div>

                  {/* Selfie verification */}
                  <div 
                    onClick={() => triggerManualFile('selfie')}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                      selfieUploaded ? 'border-emerald-500 bg-emerald-50/20 shadow-inner' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Camera className={`w-8 h-8 mx-auto mb-1.5 ${selfieUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-[11px] font-bold text-slate-900">
                      {selfieUploaded ? 'Facial identification selfie match secure' : 'Capture check-in portrait Selfie photo'}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-1 font-light">Verify background has clear white ambient light. Tap to simulate portrait upload.</p>
                    
                    {selfieUploaded && (
                      <span className="inline-flex items-center space-x-1 text-[9.5px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2 font-mono">
                        <Check className="w-3 h-3" />
                        <span>live_face_portrait_matching_100.png</span>
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={submitDigitalKycCheckIn}
                  className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wide shadow-sm hover:shadow-indigo-100 transition active:scale-95 cursor-pointer pt-3"
                >
                  Submit Biometric Verification Data
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white flex items-center justify-center text-lg font-black font-mono shadow-md">
                      {currentUser.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 font-display flex items-center gap-1">
                        {currentUser.name}
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">Verified</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
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

        {/* VIEW TAB 5: Advanced Filter Engine Page */}
        {activeTab === 'filters' && (
          <div id="customer-tab-filters" className="space-y-4 animate-fade-in text-slate-800">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-none">Advanced Filter Engine</h3>
                  <p className="text-[10px] text-slate-405 mt-1">Refine your search results</p>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('home')} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition text-[10px] font-extrabold cursor-pointer no-uiverse"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-5">
              {/* PRICE SCALE SLIDER */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Price Range (min to maximum)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-tight">Minimum Price:</span>
                    <input 
                      type="number" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-tight">Maximum Price:</span>
                    <input 
                      type="number" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ROOM TYPE CHECKBOXES */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Room Type Selection</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {['Standard', 'Deluxe', 'Suite', 'Dormitory', 'PGs'].map((roomType) => {
                    const active = filterRoomTypes.includes(roomType);
                    return (
                      <div
                        key={roomType}
                        onClick={() => {
                          if (active) {
                            setFilterRoomTypes(filterRoomTypes.filter(x => x !== roomType));
                          } else {
                            setFilterRoomTypes([...filterRoomTypes, roomType]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition text-[11px] font-bold flex items-center justify-between cursor-pointer no-uiverse ${
                          active 
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{roomType}</span>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 font-extrabold shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHARING TYPE CHECKBOXES */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Sharing Type Configuration</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {['Single sharing', 'Double sharing', 'Triple sharing'].map((sharing) => {
                    const active = filterSharingTypes.includes(sharing);
                    return (
                      <div
                        key={sharing}
                        onClick={() => {
                          if (active) {
                            setFilterSharingTypes(filterSharingTypes.filter(x => x !== sharing));
                          } else {
                            setFilterSharingTypes([...filterSharingTypes, sharing]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition text-[11px] font-bold flex items-center justify-between cursor-pointer no-uiverse ${
                          active 
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{sharing}</span>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 font-extrabold shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AMENITIES CHECKBOXES */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Amenities & Utilities Included</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {['WiFi', 'AC', 'TV', 'Food', 'Laundry'].map((amenity) => {
                    const active = filterAmenities.includes(amenity);
                    return (
                      <div
                        key={amenity}
                        onClick={() => {
                          if (active) {
                            setFilterAmenities(filterAmenities.filter(x => x !== amenity));
                          } else {
                            setFilterAmenities([...filterAmenities, amenity]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition text-[11px] font-bold flex items-center justify-between cursor-pointer no-uiverse ${
                          active 
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{amenity}</span>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 font-extrabold shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AVAILABILITY STATUS */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between">
                <div>
                  <h4 className="text-[11.5px] font-black text-slate-800">Show Available Only</h4>
                  <p className="text-[9.5px] text-slate-500 font-medium font-sans">Ignore fully occupied bookings matches</p>
                </div>
                <div
                  onClick={() => setFilterShowOnlyAvailable(!filterShowOnlyAvailable)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer no-uiverse ${
                    filterShowOnlyAvailable ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                      filterShowOnlyAvailable ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Reset/Apply Actions */}
              <div className="flex gap-3 pt-2 font-bold text-xs uppercase font-sans">
                <div
                  onClick={() => {
                    setFilterRoomTypes([]);
                    setFilterSharingTypes([]);
                    setFilterAmenities([]);
                    setFilterShowOnlyAvailable(false);
                    setMinPrice(0);
                    setMaxPrice(65000);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition text-center cursor-pointer no-uiverse"
                >
                  Reset All
                </div>
                <div
                  onClick={() => {
                    setActiveTab('home'); // focus search results
                  }}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition tracking-wide text-center cursor-pointer no-uiverse"
                >
                  Apply ({sortedProperties.length} Matches)
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: Clicked Property Details Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            id="property-details-backdrop" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-end"
          >
            <motion.div 
              id="property-details-sheet" 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 120, mass: 0.9 }}
              className="bg-white rounded-t-3xl max-h-[85%] overflow-y-auto p-4 space-y-4 text-slate-800"
            >
            
            {/* Header section info */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md uppercase tracking-widest block w-max">
                  {selectedProperty.type} Details Listing
                </span>
                <h3 className="text-sm font-black font-display text-slate-950 mt-1">{selectedProperty.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Announcement Bar */}
            {selectedProperty.campaignText && (
              <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-[10.5px] font-bold text-white shadow-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                <span>🎉 Special Offer: {selectedProperty.campaignText} active now!</span>
              </div>
            )}

            {/* Gallery Thumbnail Carousel */}
            <div className="space-y-1.5">
              <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-100 relative shadow-sm border border-slate-105">
                <img 
                  src={activeImgIdx === 0 && selectedProperty.imageUrl ? selectedProperty.imageUrl : ((PROPERTY_IMAGES[selectedProperty.id] || [])[activeImgIdx] || selectedProperty.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600')} 
                  alt={selectedProperty.name}
                  className="w-full h-full object-cover transition duration-300"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-slate-950/60 text-white text-[8px] font-mono font-black px-2 py-0.5 rounded-full">
                  PHOTO {activeImgIdx + 1} OF 4
                </span>
              </div>
              
              {/* Sliders buttons layout */}
              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                {(() => {
                  const imgs = [...(PROPERTY_IMAGES[selectedProperty.id] || [])];
                  if (selectedProperty.imageUrl) {
                    if (imgs.length > 0) {
                      imgs[0] = selectedProperty.imageUrl;
                    } else {
                      imgs.push(selectedProperty.imageUrl);
                    }
                  }
                  return imgs.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImgIdx(idx)}
                      className={`w-6 h-6 rounded-md overflow-hidden border-2 transition ${activeImgIdx === idx ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Address parameters details */}
            <p className="text-[10px] text-slate-500 leading-relaxed font-light flex items-start gap-1">
              <MapPin className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span><strong>Explicit Location Address:</strong> {selectedProperty.address}</span>
                {selectedProperty.locationLink && (
                  <a 
                    href={selectedProperty.locationLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-indigo-600 hover:underline font-extrabold text-[9.5px] mt-1.5 flex items-center gap-1 w-max"
                  >
                    <span>🗺️ View on Google Maps</span>
                  </a>
                )}
              </div>
            </p>

            {/* Display Common Facilities */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Spot Shared Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {(selectedProperty.amenities || []).map((item, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-150 text-[9.5px] text-slate-700 px-2 py-0.5 rounded-lg font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Matrix Rule details */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Spot Stay Guidelines & Conduct</h4>
              <ul className="text-[10px] text-slate-600 space-y-1 pl-4 list-disc mb-1 leading-relaxed">
                {(selectedProperty.rules || []).map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Dynamic Ratings & Reviews and Submission Form */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-slate-905">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Property Reviews FEED & RATINGS</h4>
                <div className="flex items-center space-x-1 font-bold text-xs text-amber-500">
                  <Star className="w-4.5 h-4.5 fill-amber-500" />
                  <span>4.8 Ratings</span>
                </div>
              </div>

              {/* Individual reviews stack list */}
              <div className="space-y-2.5 max-h-[170px] overflow-y-auto no-scrollbar pr-1">
                {reviewsList.filter(r => r.propertyId === selectedProperty.id).map(rev => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-150/50 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-start text-[10px]">
                      <span className="font-extrabold text-slate-950 font-display flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400 inline" /> {rev.userName}
                      </span>
                      <div className="flex space-x-0.5 items-center">
                        <span className="text-slate-400 font-mono text-[9px] mr-1">{rev.date}</span>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-500 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-605 leading-relaxed text-slate-600 font-light italic">
                      "{rev.comment}"
                    </p>
                    <div className="text-[8px] font-mono text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200/40">
                      <ThumbsUp className="w-2.5 h-2.5 text-indigo-400" /> Was review helpful? ({rev.helpfulCount + (rev.id.includes('dyn') ? 1 : 0)} agree)
                    </div>
                  </div>
                ))}
              </div>

              {/* Review submit subform */}
              {currentUser ? (
                <form onSubmit={handleSubmitReview} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Post Guest Experience</span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-[9.5px] text-slate-500">Service Rating:</span>
                    <select 
                      value={userRating} 
                      onChange={(e) => setUserRating(Number(e.target.value))}
                      className="text-[10px] border border-slate-200 bg-white p-1 rounded-md max-w-[60px]"
                    >
                      <option value="5">5 ★★★★★</option>
                      <option value="4">4 ★★★★</option>
                      <option value="3">3 ★★★</option>
                      <option value="2">2 ★★</option>
                      <option value="1">1 ★</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <textarea 
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Comment on room sizes, food service board, hygiene, etc..."
                      className="w-full text-[10px] border border-slate-200 bg-white p-1.5 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 h-11"
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3.5 rounded-md text-[9px] transition active:scale-95 cursor-pointer block"
                    >
                      Submit Feedback Review
                    </button>
                  </div>

                  {reviewStatus && (
                    <p className="text-[8.5px] font-bold text-center text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 p-1 rounded-sm animate-pulse">
                      {reviewStatus}
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-[9px] text-slate-400 text-center italic bg-slate-50 p-2 rounded-xl">
                  Sign in stays companion session to write a review.
                </p>
              )}
            </div>

            {/* Inventory listing matrix */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-[10.5px] font-bold text-slate-800 mb-2 uppercase tracking-wide">Available Units Room Inventory</h4>
              <div className="space-y-2">
                {propertyRooms.map(rm => (
                  <div 
                    key={rm.id}
                    className={`p-3 border rounded-xl flex justify-between items-center text-xs transition ${
                      rm.occupancyStatus === 'Maintenance' ? 'bg-slate-50/70 border-slate-200 opacity-60 pointer-events-none' : 'bg-white border-slate-150 hover:border-indigo-400 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-slate-900 font-display">Unit {rm.roomNumber}</span>
                        <span className="text-[8.5px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">{rm.type} Cap</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-1">Floor No. {rm.floor} &bull; {(rm.amenities || []).slice(0, 2).join(', ')}</div>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const roomDiscountPct = selectedProperty.discountType === 'all' 
                          ? (selectedProperty.discountPercentage || 0) 
                          : (rm.discountPercentage || 0);
                        const originalPrice = selectedProperty.type === 'PG' ? rm.pricePerMonth : rm.pricePerDay;
                        const discountedPrice = Math.round(originalPrice * (1 - roomDiscountPct / 100));

                        return roomDiscountPct > 0 ? (
                          <div className="space-y-0.5">
                            <div className="text-[9.5px] text-slate-400 line-through font-mono">
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="font-black text-indigo-600 text-[12px] font-mono leading-none flex items-center justify-end gap-1">
                              <span className="text-[8px] bg-rose-50 text-rose-700 px-1 py-0.2 rounded-md font-sans font-bold">-{roomDiscountPct}%</span>
                              <span>₹{discountedPrice.toLocaleString('en-IN')}</span>
                              <span className="text-[8.5px] text-slate-400 font-mono font-light">/{selectedProperty.type === 'PG' ? 'mo' : 'day'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-black text-slate-950 text-[12px] font-mono leading-none">
                            ₹{originalPrice.toLocaleString('en-IN')}
                            <span className="text-[8.5px] text-slate-400 font-mono font-light">/{selectedProperty.type === 'PG' ? 'mo' : 'day'}</span>
                          </div>
                        );
                      })()}
                      
                      {rm.occupancyStatus === 'Maintenance' ? (
                        <span className="text-[8px] uppercase font-bold text-rose-500 font-mono block mt-1">Maintenance</span>
                      ) : (
                        <button 
                          onClick={() => handleOpenBooking(rm)}
                          className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-[8.5px] uppercase tracking-wide font-black px-3 py-1.5 rounded-lg mt-1.5 transition active:scale-95 cursor-pointer inline-block"
                        >
                          Book Unit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
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
                      className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-lg text-[10px] transition cursor-pointer"
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

      {/* Bottom Safe Area Phone Navigation Tab Bar */}
      <nav id="customer-bottom-nav" className="no-uiverse fixed bottom-0 inset-x-0 max-w-7xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-150 p-2 pb-5 flex justify-around items-center text-slate-500 z-40 shadow-lg select-none leading-none">
        <button 
          onClick={() => {
            setActiveTab('home');
            setShowFooterFiltersModal(false);
          }}
          className={`flex flex-col items-center space-y-1.5 transition px-2.5 py-1 ${activeTab === 'home' ? 'text-indigo-600 font-black scale-105' : 'hover:text-slate-800'}`}
        >
          <Search className="w-4.5 h-4.5" />
          <span className="text-[8.5px] uppercase tracking-wider">Search Hub</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('bookings');
            setShowFooterFiltersModal(false);
          }}
          className={`flex flex-col items-center space-y-1.5 transition px-2.5 py-1 relative ${activeTab === 'bookings' ? 'text-indigo-600 font-black scale-105' : 'hover:text-slate-800'}`}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span className="text-[8.5px] uppercase tracking-wider">Your Stays</span>
          {userBookings.length > 0 && (
            <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('checkin');
            setShowFooterFiltersModal(false);
          }}
          className={`flex flex-col items-center space-y-1.5 transition px-2.5 py-1 ${activeTab === 'checkin' ? 'text-indigo-600 font-black scale-105' : 'hover:text-slate-800'}`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span className="text-[8.5px] uppercase tracking-wider">KYC Upload</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('filters');
            setShowFooterFiltersModal(false);
          }}
          className={`flex flex-col items-center space-y-1.5 transition px-2.5 py-1 ${activeTab === 'filters' ? 'text-indigo-600 font-black scale-105' : 'hover:text-slate-800 animate-pulse'}`}
          title="Adjust Price, Room type, Sharing type, Amenities & Availability"
        >
          <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-500" />
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-indigo-950">Filters</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('profile');
            setShowFooterFiltersModal(false);
          }}
          className={`flex flex-col items-center space-y-1.5 transition px-2.5 py-1 ${activeTab === 'profile' ? 'text-indigo-600 font-black scale-105' : 'hover:text-slate-800'}`}
        >
          <User className="w-4.5 h-4.5" />
          <span className="text-[8.5px] uppercase tracking-wider">Profile</span>
        </button>
      </nav>

    </div>
  );
}
