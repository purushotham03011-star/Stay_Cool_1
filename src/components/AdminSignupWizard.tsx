import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Bed,
  Search,
  Image as ImageIcon,
  Sparkles,
  Check,
  Minus,
  Info,
  Layers,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Property, Room, Bed as BedType, Tenant, Booking, Invoice, HousekeepingTask, Staff } from '../types';
import { getLocalStorageData, setLocalStorageData, generateAdminId } from '../mockData';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

interface AdminSignupWizardProps {
  onClose: () => void;
  onSignupSuccess: (adminData: { name: string; email: string; phone: string; propertyId: string }) => void;
}

interface TempRoom {
  id: string;
  roomNumber: string;
  category: 'Standard' | 'Deluxe' | 'Suite' | 'Dormitory' | 'Single sharing' | 'Double sharing' | 'Triple sharing';
  personsCount: number;
  pricingType: 'room' | 'person';
  roomPricePerDay: number;
  personPricing: {
    daily: number;
    weekly: number;
    monthly: number;
    seasonal: number;
  };
}

interface TempFloor {
  id: string;
  level: number;
  name: string;
  rooms: TempRoom[];
}

export default function AdminSignupWizard({ onClose, onSignupSuccess }: AdminSignupWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // Step 5 is Success Page
  const [errorText, setErrorText] = useState('');
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
  const [seedDemoData, setSeedDemoData] = useState<boolean>(false);

  // Step 1: Admin Details State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1 Amenities selection state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'AC', 'TV', 'Food', 'Laundry']);
  const [showOtherAmenityInput, setShowOtherAmenityInput] = useState(false);
  const [customAmenityText, setCustomAmenityText] = useState('');

  // Step 2: Property & Address Details State
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<'PG' | 'Hotel'>('PG');
  const [stateSearch, setStateSearch] = useState('Karnataka');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [propertyImages, setPropertyImages] = useState<string[]>(['', '', '', '']);
  const [locationLink, setLocationLink] = useState('');

  // Step 3: Room Setup Configuration (Expandable Floors)
  const [floors, setFloors] = useState<TempFloor[]>([
    {
      id: 'floor-0',
      level: 0,
      name: 'Ground Floor',
      rooms: [
        {
          id: 'room-init-1',
          roomNumber: '101',
          category: 'Standard',
          personsCount: 2,
          pricingType: 'room',
          roomPricePerDay: 1200,
          personPricing: { daily: 450, weekly: 2800, monthly: 9000, seasonal: 25000 }
        }
      ]
    }
  ]);
  const [expandedFloorIds, setExpandedFloorIds] = useState<string[]>(['floor-0']);

  // Room Creator Modal & Form Settings
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [targetFloorId, setTargetFloorId] = useState<string | null>(null);
  
  // Custom states inside the single unified modal
  const [modalRoomId, setModalRoomId] = useState<string | null>(null);
  const [modalRoomNumber, setModalRoomNumber] = useState('');
  const [modalCategory, setModalCategory] = useState<TempRoom['category']>('Standard');
  const [modalPersonsCount, setModalPersonsCount] = useState(2);
  const [modalPricingType, setModalPricingType] = useState<'room' | 'person'>('room');
  const [modalRoomPricePerDay, setModalRoomPricePerDay] = useState(1500);
  
  // Active pricing tab for preview edits
  const [activePricingTab, setActivePricingTab] = useState<'daily' | 'weekly' | 'monthly' | 'seasonal'>('daily');
  const [modalDailyPrice, setModalDailyPrice] = useState(400);
  const [modalWeeklyPrice, setModalWeeklyPrice] = useState(2500);
  const [modalMonthlyPrice, setModalMonthlyPrice] = useState(8500);
  const [modalSeasonalPrice, setModalSeasonalPrice] = useState(24000);
  const [registeredPropertyId, setRegisteredPropertyId] = useState<string>('');

  // Indian State Autocomplete filtering
  const filteredStates = INDIAN_STATES.filter(s => 
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Auto trigger default changes when category card is clicked
  const handleSelectCategoryCard = (cat: TempRoom['category']) => {
    setModalCategory(cat);
    // Standard Defaults according to literal prompt
    if (['Standard', 'Deluxe', 'Suite'].includes(cat)) {
      setModalPricingType('room');
      if (cat === 'Standard') {
        setModalPersonsCount(2);
        setModalRoomPricePerDay(1200);
      } else if (cat === 'Deluxe') {
        setModalPersonsCount(2);
        setModalRoomPricePerDay(2000);
      } else {
        setModalPersonsCount(3);
        setModalRoomPricePerDay(3500);
      }
    } else {
      setModalPricingType('person');
      if (cat === 'Single sharing') {
        setModalPersonsCount(1);
        setModalDailyPrice(500);
        setModalWeeklyPrice(3200);
        setModalMonthlyPrice(11000);
        setModalSeasonalPrice(28000);
      } else if (cat === 'Double sharing') {
        setModalPersonsCount(2);
        setModalDailyPrice(400);
        setModalWeeklyPrice(2500);
        setModalMonthlyPrice(8500);
        setModalSeasonalPrice(24000);
      } else if (cat === 'Triple sharing') {
        setModalPersonsCount(3);
        setModalDailyPrice(300);
        setModalWeeklyPrice(1900);
        setModalMonthlyPrice(6800);
        setModalSeasonalPrice(20000);
      } else { // Dormitory
        setModalPersonsCount(4);
        setModalDailyPrice(250);
        setModalWeeklyPrice(1500);
        setModalMonthlyPrice(5000);
        setModalSeasonalPrice(15000);
      }
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!fullName.trim() || !mobileNumber.trim() || !emailAddress.trim() || !password) {
      setErrorText('Please fill out all credentials safely.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorText('Password verification failed: PINs do not watch correctly.');
      return;
    }

    // Trigger standard skeleton loader simulation for futuristic app feel
    setIsSkeletonLoading(true);
    setTimeout(() => {
      setIsSkeletonLoading(false);
      setStep(2);
    }, 450);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!propertyName.trim() || !district.trim() || !pincode.trim() || !area.trim() || !street.trim() || !houseNo.trim()) {
      setErrorText('All geographical state parameters are required.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setErrorText('Pin code must contain exactly 6 digits.');
      return;
    }

    const uploadedCount = propertyImages.filter(img => img !== '').length;
    if (uploadedCount < 4) {
      setErrorText('You must upload at least 4 property images before proceeding.');
      return;
    }

    // Load state
    setIsSkeletonLoading(true);
    setTimeout(() => {
      setIsSkeletonLoading(false);
      setStep(3);
    }, 450);
  };

  // Floor expandable controls
  const toggleFloorExpansion = (floorId: string) => {
    if (expandedFloorIds.includes(floorId)) {
      setExpandedFloorIds(expandedFloorIds.filter(id => id !== floorId));
    } else {
      setExpandedFloorIds([...expandedFloorIds, floorId]);
    }
  };

  const handleAddFloorLevel = () => {
    const nextLevel = floors.length > 0 ? Math.max(...floors.map(f => f.level)) + 1 : 0;
    const floorLabel = nextLevel === 0 ? 'Ground Floor' : `Floor ${nextLevel}`;
    const newFloorId = `floor-${Date.now()}`;
    const newFloor: TempFloor = {
      id: newFloorId,
      level: nextLevel,
      name: floorLabel,
      rooms: []
    };
    setFloors([...floors, newFloor]);
    setExpandedFloorIds([...expandedFloorIds, newFloorId]);
  };

  const handleDeleteFloorLevel = (floorId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (floors.length <= 1) {
      alert('Your assets must contain at least one floor layer.');
      return;
    }
    if (confirm('Delete floor and all associated inventory units?')) {
      setFloors(floors.filter(f => f.id !== floorId));
      setExpandedFloorIds(expandedFloorIds.filter(id => id !== floorId));
    }
  };

  // Open Room Modal
  const handleOpenRoomModal = (floorId: string, prefillRoom?: TempRoom) => {
    setTargetFloorId(floorId);
    if (prefillRoom) {
      setModalRoomId(prefillRoom.id);
      setModalRoomNumber(prefillRoom.roomNumber);
      setModalCategory(prefillRoom.category);
      setModalPersonsCount(prefillRoom.personsCount);
      setModalPricingType(prefillRoom.pricingType);
      setModalRoomPricePerDay(prefillRoom.roomPricePerDay);
      setModalDailyPrice(prefillRoom.personPricing.daily);
      setModalWeeklyPrice(prefillRoom.personPricing.weekly);
      setModalMonthlyPrice(prefillRoom.personPricing.monthly);
      setModalSeasonalPrice(prefillRoom.personPricing.seasonal);
    } else {
      setModalRoomId(null);
      const floorOrder = floors.find(f => f.id === floorId)?.level || 0;
      const roomIndex = (floors.find(f => f.id === floorId)?.rooms?.length || 0) + 1;
      setModalRoomNumber(`${floorOrder}0${roomIndex}`);
      setModalCategory('Standard');
      setModalPersonsCount(2);
      setModalPricingType('room');
      setModalRoomPricePerDay(1200);
      setModalDailyPrice(400);
      setModalWeeklyPrice(2500);
      setModalMonthlyPrice(8500);
      setModalSeasonalPrice(24000);
    }
    setIsRoomModalOpen(true);
  };

  const handleSaveModalRoom = () => {
    if (!modalRoomNumber.trim()) {
      alert('Specify a room tag or digit numbering.');
      return;
    }
    if (!targetFloorId) return;

    const savedRoom: TempRoom = {
      id: modalRoomId || `room-${Date.now()}`,
      roomNumber: modalRoomNumber,
      category: modalCategory,
      personsCount: modalPersonsCount,
      pricingType: modalPricingType,
      roomPricePerDay: modalRoomPricePerDay,
      personPricing: {
        daily: modalDailyPrice,
        weekly: modalWeeklyPrice,
        monthly: modalMonthlyPrice,
        seasonal: modalSeasonalPrice
      }
    };

    setFloors(floors.map(flr => {
      if (flr.id === targetFloorId) {
        const isEditing = flr.rooms.some(r => r.id === savedRoom.id);
        const updatedRooms = isEditing 
          ? flr.rooms.map(r => r.id === savedRoom.id ? savedRoom : r)
          : [...flr.rooms, savedRoom];
        return { ...flr, rooms: updatedRooms };
      }
      return flr;
    }));

    setIsRoomModalOpen(false);
    setTargetFloorId(null);
  };

  const handleDeleteRoom = (floorId: string, roomId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFloors(floors.map(f => {
      if (f.id === floorId) {
        return { ...f, rooms: f.rooms.filter(r => r.id !== roomId) };
      }
      return f;
    }));
  };

  const handleNextStep3 = () => {
    setErrorText('');
    const totalRooms = floors.reduce((sum, f) => sum + f.rooms.length, 0);
    if (totalRooms === 0) {
      setErrorText('Please layout at least 1 functional room on any floor directory to continue.');
      return;
    }
    setStep(4);
  };

  // Final confirmation build persistence
  const handleFinalizeAndCreate = () => {
    setIsSkeletonLoading(true);
    
    setTimeout(() => {
      const newPropertyId = `prop-${Date.now()}`;
      setRegisteredPropertyId(newPropertyId);
      const finalAddress = `${houseNo}, ${street}, ${area}, ${district}, ${stateSearch} - ${pincode}`;
      
      const newPropertyObj: Property = {
        id: newPropertyId,
        name: propertyName,
        type: propertyType,
        city: district,
        address: finalAddress,
        totalRooms: floors.reduce((sum, f) => sum + f.rooms.length, 0),
        amenities: selectedAmenities,
        rules: ['Aadhaar copy mandatory', 'Bill due on 5th of each month'],
        orgId: 'org-default',
        adminName: fullName,
        adminEmail: emailAddress,
        adminPhone: mobileNumber,
        adminPassword: password,
        adminId: generateAdminId(),
        classification: propertyType === 'PG' ? 'Paying Guest' : 'Hotel residency',
        imageUrl: propertyImages[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600',
        images: propertyImages.filter(Boolean),
        state: stateSearch,
        district: district,
        pincode: pincode,
        area: area,
        street: street,
        houseNumber: houseNo,
        locks: {},
        status: 'Active',
        locationLink: locationLink
      };

      // Propagate starting amenities into system setting storage
      localStorage.setItem('hotel_pg_settings_amenities', JSON.stringify(selectedAmenities));

      const finalRooms: Room[] = [];
      const finalBeds: BedType[] = [];

      floors.forEach(f => {
        f.rooms.forEach(rm => {
          let databaseType: Room['type'] = 'Single';
          if (rm.category === 'Double sharing' || rm.personsCount === 2) {
            databaseType = 'Double';
          } else if (rm.category === 'Triple sharing' || rm.personsCount === 3) {
            databaseType = 'Triple';
          } else if (rm.category === 'Dormitory' || rm.personsCount >= 4) {
            databaseType = 'Four-Sharing';
          }

          let rateDay = rm.pricingType === 'room' ? rm.roomPricePerDay : rm.personPricing.daily;
          let rateMonth = rm.pricingType === 'room' ? rm.roomPricePerDay * 24 : rm.personPricing.monthly;
          let rateWeekly = rm.pricingType === 'room' ? rm.roomPricePerDay * 7 : rm.personPricing.weekly;
          let rateSeasonal = rm.pricingType === 'room' ? rm.roomPricePerDay * 30 * 1.2 : rm.personPricing.seasonal;

          const roomUid = `room-${newPropertyId}-${rm.roomNumber}`;
          finalRooms.push({
            id: roomUid,
            propertyId: newPropertyId,
            roomNumber: rm.roomNumber,
            floor: f.level,
            type: databaseType,
            pricePerMonth: rateMonth,
            pricePerDay: rateDay,
            priceWeekly: rateWeekly,
            priceSeasonal: rateSeasonal,
            amenities: ['Lockable Closets', 'Personal power points'],
            occupancyStatus: 'Available'
          });

          for (let pIndex = 0; pIndex < rm.personsCount; pIndex++) {
            const charId = String.fromCharCode(65 + pIndex);
            finalBeds.push({
              id: `bed-${roomUid}-${charId.toLowerCase()}`,
              roomId: roomUid,
              roomNumber: rm.roomNumber,
              bedNumber: charId,
              isOccupied: false
            });
          }
        });
      });

      // Seed Demo Data if selected
      if (seedDemoData && finalBeds.length >= 2) {
        finalBeds[0].isOccupied = true;
        finalBeds[0].occupantTenantId = `demo-t1-${newPropertyId}`;
        finalBeds[1].isOccupied = true;
        finalBeds[1].occupantTenantId = `demo-t2-${newPropertyId}`;
        
        const r1 = finalRooms.find(r => r.id === finalBeds[0].roomId);
        if (r1) r1.occupancyStatus = 'Full';
        const r2 = finalRooms.find(r => r.id === finalBeds[1].roomId);
        if (r2) r2.occupancyStatus = 'Full';

        const targetRoom1 = finalRooms[0];
        const targetRoom2 = finalRooms[1] || finalRooms[0];
        const targetBed1 = finalBeds[0];
        const targetBed2 = finalBeds[1] || finalBeds[0];

        const demoTenants: Tenant[] = [
          {
            id: `demo-t1-${newPropertyId}`,
            name: 'Rahul Sharma',
            email: `rahul.sharma.${newPropertyId}@example.com`,
            phone: '+91 98765 11111',
            gender: 'Male',
            bloodGroup: 'O+',
            emergencyContactName: 'Rajesh Sharma (Father)',
            emergencyContactPhone: '+91 98765 43219',
            docUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
            docType: 'Aadhaar',
            roomId: targetRoom1?.id || 'room-1',
            roomNumber: targetRoom1?.roomNumber || '101',
            bedId: targetBed1?.id || 'bed-1',
            bedNumber: targetBed1?.bedNumber || 'A',
            propertyId: newPropertyId,
            propertyName: propertyName,
            status: 'Active',
            joinedDate: '2026-05-10'
          },
          {
            id: `demo-t2-${newPropertyId}`,
            name: 'Pooja Hegde',
            email: `pooja.hegde.${newPropertyId}@example.com`,
            phone: '+91 98765 22222',
            gender: 'Female',
            bloodGroup: 'A+',
            emergencyContactName: 'Mehta Hegde (Mother)',
            emergencyContactPhone: '+91 98765 00000',
            docUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
            docType: 'Passport',
            roomId: targetRoom2?.id || 'room-2',
            roomNumber: targetRoom2?.roomNumber || '102',
            bedId: targetBed2?.id || 'bed-2',
            bedNumber: targetBed2?.bedNumber || 'B',
            propertyId: newPropertyId,
            propertyName: propertyName,
            status: 'Active',
            joinedDate: '2026-05-15'
          }
        ];

        const demoBookings: Booking[] = [
          {
            id: `demo-bk1-${newPropertyId}`,
            propertyId: newPropertyId,
            propertyName: propertyName,
            roomId: targetRoom1?.id || 'room-1',
            roomNumber: targetRoom1?.roomNumber || '101',
            bedId: targetBed1?.id || 'bed-1',
            bedNumber: targetBed1?.bedNumber || 'A',
            customerName: 'Rahul Sharma',
            customerEmail: `rahul.sharma.${newPropertyId}@example.com`,
            customerPhone: '+91 98765 11111',
            checkInDate: '2026-06-01',
            checkOutDate: '2026-12-01',
            mealPlan: 'Full Board',
            status: 'Confirmed',
            totalAmount: (targetRoom1?.pricePerMonth || 10000) * 6,
            bookingDate: '2026-05-20',
            paymentMethod: 'UPI',
            requestedRoomType: 'Single'
          },
          {
            id: `demo-bk2-${newPropertyId}`,
            propertyId: newPropertyId,
            propertyName: propertyName,
            roomId: targetRoom2?.id || 'room-2',
            roomNumber: targetRoom2?.roomNumber || '102',
            bedId: targetBed2?.id || 'bed-2',
            bedNumber: targetBed2?.bedNumber || 'B',
            customerName: 'Pooja Hegde',
            customerEmail: `pooja.hegde.${newPropertyId}@example.com`,
            customerPhone: '+91 98765 22222',
            checkInDate: '2026-06-01',
            checkOutDate: '2026-12-01',
            mealPlan: 'Breakfast Only',
            status: 'Confirmed',
            totalAmount: (targetRoom2?.pricePerMonth || 8000) * 6,
            bookingDate: '2026-05-22',
            paymentMethod: 'UPI',
            requestedRoomType: 'Double'
          }
        ];

        const demoInvoices: Invoice[] = [
          {
            id: `demo-inv1-${newPropertyId}`,
            tenantId: `demo-t1-${newPropertyId}`,
            tenantName: 'Rahul Sharma',
            propertyName: propertyName,
            month: 'June 2026',
            amount: targetRoom1?.pricePerMonth || 10000,
            dueDate: '2026-06-05',
            status: 'Paid',
            generatedAt: '2026-06-01T08:00:00Z',
            type: 'Rent',
            paymentMethod: 'UPI',
            paidAt: '2026-06-03T12:00:00Z'
          },
          {
            id: `demo-inv2-${newPropertyId}`,
            tenantId: `demo-t2-${newPropertyId}`,
            tenantName: 'Pooja Hegde',
            propertyName: propertyName,
            month: 'June 2026',
            amount: targetRoom2?.pricePerMonth || 8000,
            dueDate: '2026-06-05',
            status: 'Unpaid',
            generatedAt: '2026-06-01T08:05:00Z',
            type: 'Rent'
          }
        ];

        const demoHousekeeping: HousekeepingTask[] = [
          {
            id: `demo-hk1-${newPropertyId}`,
            propertyId: newPropertyId,
            propertyName: propertyName,
            roomNumber: targetRoom1?.roomNumber || '101',
            assignedStaff: 'Ravi Kumar',
            date: '2026-06-15',
            status: 'Completed',
            notes: 'Initial room setup completed.'
          },
          {
            id: `demo-hk2-${newPropertyId}`,
            propertyId: newPropertyId,
            propertyName: propertyName,
            roomNumber: targetRoom2?.roomNumber || '102',
            assignedStaff: 'Ravi Kumar',
            date: '2026-06-16',
            status: 'Pending',
            notes: 'Deep sweep requested.'
          }
        ];

        const demoStaff: Staff[] = [
          {
            id: `demo-st1-${newPropertyId}`,
            propertyId: newPropertyId,
            fullName: 'Ravi Kumar',
            phone: '+91 98800 12345',
            address: 'HSR Layout, Bangalore',
            role: 'Cleaning Staff',
            shiftTiming: 'Morning Shift (07:00 AM - 03:00 PM)',
            joiningDate: '2026-01-01',
            salary: 15000,
            status: 'Active',
            profilePhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
            notes: 'Handles regular room sweep and linen updates.',
            tasks: ['Clean Unit 101 bathrooms', 'Inspect floor corridors']
          },
          {
            id: `demo-st2-${newPropertyId}`,
            propertyId: newPropertyId,
            fullName: 'Sita Ram',
            phone: '+91 99000 77766',
            address: 'Bommanahalli, Bangalore',
            role: 'Watchman',
            shiftTiming: 'Night Shift (08:00 PM - 08:00 AM)',
            joiningDate: '2026-02-15',
            salary: 12000,
            status: 'Active',
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            notes: 'Night security shift controller.',
            tasks: ['Verify gates are locked', 'Log midnight visitors register']
          }
        ];

        const existingTenants = getLocalStorageData<Tenant[]>('tenants', []);
        const existingBookings = getLocalStorageData<Booking[]>('bookings', []);
        const existingInvoices = getLocalStorageData<Invoice[]>('invoices', []);
        const existingHousekeeping = getLocalStorageData<HousekeepingTask[]>('housekeeping', []);
        const existingStaff = getLocalStorageData<Staff[]>('staff', []);

        setLocalStorageData('tenants', [...demoTenants, ...existingTenants]);
        setLocalStorageData('bookings', [...demoBookings, ...existingBookings]);
        setLocalStorageData('invoices', [...demoInvoices, ...existingInvoices]);
        setLocalStorageData('housekeeping', [...demoHousekeeping, ...existingHousekeeping]);
        setLocalStorageData('staff', [...demoStaff, ...existingStaff]);
      }

      // Save arrays in mock database
      const existingProps = getLocalStorageData<Property[]>('properties', []);
      const existingRooms = getLocalStorageData<Room[]>('rooms', []);
      const existingBeds = getLocalStorageData<BedType[]>('beds', []);

      setLocalStorageData('properties', [newPropertyObj, ...existingProps]);
      setLocalStorageData('rooms', [...finalRooms, ...existingRooms]);
      setLocalStorageData('beds', [...finalBeds, ...existingBeds]);

      // Save state variables
      const sessionObj = {
        name: fullName,
        email: emailAddress,
        phone: mobileNumber,
        propertyName: propertyName,
        propertyId: newPropertyId,
        adminId: newPropertyObj.adminId
      };
      setLocalStorageData('active_admin_session', sessionObj);

      setIsSkeletonLoading(false);
      setStep(5); // Show absolute success badge Screen!
    }, 800);
  };

  return (
    <div id="adm-root-wrapper" className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-y-auto pb-safe">
      
      {/* Container simulating high end responsive wrapper */}
      <div id="adm-card-container" className="bg-slate-50 w-full flex-1 flex flex-col overflow-y-auto">
        
        {/* Core Header section */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center shrink-0 pr-safe pl-safe pt-safe">
          <div className="flex items-center space-x-3">
            <div className="bg-[#f25a24] p-2 rounded-xl shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight font-display">Onboard Partner Enterprise</h2>
              <span className="text-[10px] text-slate-500 font-medium block">Multi-step Smart Allocation Wizard</span>
            </div>
          </div>
          {step < 5 && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Wizard Progress steps indicator at top */}
        {step < 5 && (
          <div className="bg-white py-3 px-6 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 shrink-0">
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full justify-center">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > 1 ? 'bg-emerald-600 text-white font-mono' : step === 1 ? 'bg-[#f25a24] text-white font-mono' : 'bg-slate-200 text-slate-650'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <div className={`h-1.5 flex-1 mx-2 rounded-full ${step > 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              </div>
              <span className={`mt-1 tracking-tight text-center ${step === 1 ? 'text-[#f25a24] font-bold' : step > 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>Admin Details</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full justify-center">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > 2 ? 'bg-emerald-600 text-white font-mono' : step === 2 ? 'bg-[#f25a24] text-white font-mono' : 'bg-slate-200 text-slate-650'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <div className={`h-1.5 flex-1 mx-2 rounded-full ${step > 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              </div>
              <span className={`mt-1 tracking-tight text-center ${step === 2 ? 'text-[#f25a24] font-bold' : step > 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>Location</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full justify-center">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > 3 ? 'bg-emerald-600 text-white font-mono' : step === 3 ? 'bg-[#f25a24] text-white font-mono' : 'bg-slate-200 text-slate-650'
                }`}>
                  {step > 3 ? '✓' : '3'}
                </span>
                <div className={`h-1.5 flex-1 mx-2 rounded-full ${step > 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              </div>
              <span className={`mt-1 tracking-tight text-center ${step === 3 ? 'text-[#f25a24] font-bold' : step > 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>Rooms</span>
            </div>

            <div className="flex flex-col items-center">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 4 ? 'bg-[#f25a24] text-white font-mono animate-pulse' : 'bg-slate-200 text-slate-650'
              }`}>
                4
              </span>
              <span className={`mt-1 tracking-tight ${step === 4 ? 'text-[#f25a24] font-bold' : 'text-slate-400'}`}>Review</span>
            </div>
          </div>
        )}

        {/* Wizard interactive elements body */}
        <div className="flex-1 p-5 overflow-y-auto min-h-[300px]">
          {errorText && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100/60 rounded-xl text-xs font-semibold text-rose-700 leading-normal">
              {errorText}
            </div>
          )}

          {/* SKELETON LOADER SIMULATION FOR UX REFINEMENT */}
          {isSkeletonLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
            </div>
          ) : (
            <>
              {/* STEP 1: ADMIN PROFILE CONFIGURATION (FLOATING LABELS ONLY) */}
              {step === 1 && (
                <form onSubmit={handleNextStep1} className="space-y-5 animate-fadeIn">
                  
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Operator Profiling</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-sans">
                        Configure master administrator account. This lets you inspect analytical indicators, collect receipts and record tenants on mobile devices.
                      </p>
                    </div>
                  </div>

                  {/* FORM FIELDS WITH ICONS AND MODERN FLOATING LABELS */}
                  <div className="space-y-4">
                    
                    {/* Full Name */}
                    <div className="relative group border border-slate-200 rounded-xl bg-white p-2 flex items-center gap-2 focus-within:border-indigo-550 transition shadow-xs">
                      <User className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder=" "
                          className="peer w-full bg-transparent text-xs font-bold pt-4 pb-1 text-slate-900 outline-none placeholder-shown:placeholder-transparent"
                          required
                        />
                        <label 
                          htmlFor="fullName" 
                          className="absolute left-0 top-0 text-[10px] uppercase tracking-wide font-semibold text-slate-400 transform scale-100 transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-80 peer-focus:translate-y-0 peer-focus:text-indigo-600"
                        >
                          Full Name
                        </label>
                      </div>
                    </div>

                    {/* Mobile Phone */}
                    <div className="relative group border border-slate-200 rounded-xl bg-white p-2 flex items-center gap-2 focus-within:border-indigo-550 transition shadow-xs">
                      <Smartphone className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                      <div className="flex-1 relative">
                        <input 
                          type="tel" 
                          id="mobileNumber"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d+ ]/g, ''))}
                          placeholder=" "
                          className="peer w-full bg-transparent text-xs font-bold pt-4 pb-1 text-slate-900 outline-none"
                          required
                        />
                        <label 
                          htmlFor="mobileNumber" 
                          className="absolute left-0 top-0 text-[10px] uppercase tracking-wide font-semibold text-slate-400 transform scale-100 transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-80 peer-focus:translate-y-0 peer-focus:text-indigo-600"
                        >
                          Mobile Contact Number
                        </label>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative group border border-slate-200 rounded-xl bg-white p-2 flex items-center gap-2 focus-within:border-indigo-550 transition shadow-xs">
                      <Mail className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                      <div className="flex-1 relative">
                        <input 
                          type="email" 
                          id="emailAddress"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder=" "
                          className="peer w-full bg-transparent text-xs font-bold pt-4 pb-1 text-slate-900 outline-none"
                          required
                        />
                        <label 
                          htmlFor="emailAddress" 
                          className="absolute left-0 top-0 text-[10px] uppercase tracking-wide font-semibold text-slate-400 transform scale-100 transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-80 peer-focus:translate-y-0 peer-focus:text-indigo-600"
                        >
                          Email Address
                        </label>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="relative group border border-slate-200 rounded-xl bg-white p-2 flex items-center justify-between gap-2 focus-within:border-indigo-550 transition shadow-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <Lock className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                        <div className="flex-1 relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder=" "
                            className="peer w-full bg-transparent text-xs font-bold pt-4 pb-1 text-slate-900 outline-none"
                            required
                          />
                          <label 
                            htmlFor="password" 
                            className="absolute left-0 top-0 text-[10px] uppercase tracking-wide font-semibold text-slate-400 transform scale-100 transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-80 peer-focus:translate-y-0 peer-focus:text-indigo-600"
                          >
                            Password
                          </label>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-650 px-2.5 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group border border-slate-200 rounded-xl bg-white p-2 flex items-center justify-between gap-2 focus-within:border-indigo-550 transition shadow-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <Lock className="text-slate-400 w-4 h-4 shrink-0 mx-1" />
                        <div className="flex-1 relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder=" "
                            className="peer w-full bg-transparent text-xs font-bold pt-4 pb-1 text-slate-900 outline-none"
                            required
                          />
                          <label 
                            htmlFor="confirmPassword" 
                            className="absolute left-0 top-0 text-[10px] uppercase tracking-wide font-semibold text-slate-400 transform scale-100 transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-80 peer-focus:translate-y-0 peer-focus:text-indigo-600"
                          >
                            Confirm Password
                          </label>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-650 px-2.5 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Amenities Selection (WiFi, AC, TV, Food, Laundry, etc.) */}
                    <div className="space-y-2 border-t pt-4">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">
                        Select Shared Property Amenities & Services
                      </label>
                      
                      <div className="flex gap-2">
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'others') {
                              setShowOtherAmenityInput(true);
                            } else if (val && !selectedAmenities.includes(val)) {
                              setSelectedAmenities([...selectedAmenities, val]);
                            }
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none text-slate-900 shadow-xs focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                        >
                          <option value="">-- Dropdown: Add Default Amenity --</option>
                          <option value="WiFi">WiFi</option>
                          <option value="AC">AC</option>
                          <option value="TV">TV</option>
                          <option value="Food">Food</option>
                          <option value="Laundry">Laundry</option>
                          <option value="others">Others / Custom Input...</option>
                        </select>
                      </div>

                      {showOtherAmenityInput && (
                        <div className="flex gap-2 animate-slideDown">
                          <input
                            type="text"
                            value={customAmenityText}
                            onChange={(e) => setCustomAmenityText(e.target.value)}
                            placeholder="Type custom amenity (e.g., Gym, Swimming Pool)"
                            className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = customAmenityText.trim();
                              if (trimmed) {
                                if (!selectedAmenities.includes(trimmed)) {
                                  setSelectedAmenities([...selectedAmenities, trimmed]);
                                }
                                setCustomAmenityText('');
                                setShowOtherAmenityInput(false);
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition uppercase cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      {/* Selected Amenities Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold text-[10px] flex items-center gap-1.5 shadow-5xs animate-fadeIn"
                          >
                            <span>{amenity}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))}
                              className="text-slate-400 hover:text-red-500 font-black cursor-pointer text-xs"
                              title="Remove"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {selectedAmenities.length === 0 && (
                          <span className="text-[10px] text-slate-400 italic">No amenities selected. Choose default or input own.</span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Footers controls */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      className="curved-orange-border-btn py-2.5 px-6 text-xs transition inline-flex items-center space-x-1 uppercase tracking-wider shadow-sm"
                    >
                      <span>Next: Location Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PROPERTY LOCATION WITH AUTOCUT STATE DRILL */}
              {step === 2 && (
                <form onSubmit={handleNextStep2} className="space-y-4 animate-fadeIn">
                  
                  <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 flex items-start gap-2 text-indigo-900">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-black uppercase">🏠 Real Estate Address</h4>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        Define physical property parameters inside the 28 states of India. Correct location triggers localized tourist tax computation models.
                      </p>
                    </div>
                  </div>

                  {/* STATE SEARCHABLE COMPONENT DROPDOWN OR INPUT TYPE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Business Name */}
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Property Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={propertyName}
                          onChange={(e) => setPropertyName(e.target.value)}
                          placeholder="Silicon Valley PG, Green Park Suites"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 font-bold outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Class Ecosystem */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Classification</label>
                      <select 
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as 'PG' | 'Hotel')}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-bold outline-none text-slate-900 shadow-xs"
                      >
                        <option value="PG">Paying Guest (PG) House</option>
                        <option value="Hotel">Hotel Premium Suites</option>
                      </select>
                    </div>

                    {/* SEARCHABLE INDIAN STATE dropdown */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">State of Location (Searchable)</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={stateSearch}
                          onChange={(e) => {
                            setStateSearch(e.target.value);
                            setIsStateDropdownOpen(true);
                          }}
                          onFocus={() => setIsStateDropdownOpen(true)}
                          placeholder="Type state E.g. Karnataka"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-605 font-bold outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>

                      {/* Filter matches list dropdown block */}
                      {isStateDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-40 p-1 divide-y divide-slate-100">
                          {filteredStates.length > 0 ? (
                            filteredStates.map(st => (
                              <button 
                                key={st}
                                type="button"
                                onClick={() => {
                                  setStateSearch(st);
                                  setIsStateDropdownOpen(false);
                                }}
                                className="w-full text-left py-2 px-3 text-xs text-slate-800 hover:bg-slate-100 rounded-lg transition font-medium flex items-center justify-between"
                              >
                                <span>{st}</span>
                                {stateSearch === st && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                              </button>
                            ))
                          ) : (
                            <div className="py-2 px-3 text-xs text-slate-400 italic">No states match search query</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* District */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">District</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Bangalore Urban"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-605 font-medium outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Pin Code (India)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="560102"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 font-mono outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Area / Locality */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Area / Neighborhood</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="HSR Layout Sector 2"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Street */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Street Address / Road Cross</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="19th Main Road"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* House No */}
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">House / Building Number</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          placeholder="No. 405 Flat A / Block C"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 font-medium outline-none text-slate-900 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Property Image Uploader (At least 4 required) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">
                        Property Photos (Minimum 4 images required) *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((index) => (
                          <div 
                            key={index} 
                            className="flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-xs hover:shadow-md transition relative"
                          >
                            {propertyImages[index] ? (
                              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-slate-100">
                                <img 
                                  src={propertyImages[index]} 
                                  alt={`Preview ${index + 1}`} 
                                  className="w-full h-full object-cover bg-white" 
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImgs = [...propertyImages];
                                    nextImgs[index] = '';
                                    setPropertyImages(nextImgs);
                                  }}
                                  className="absolute top-1 right-1 bg-rose-650 hover:bg-rose-700 text-white rounded-full p-1 cursor-pointer transition z-10"
                                  title="Remove image"
                                >
                                  <X className="w-2.5 h-2.5 text-white" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5 text-slate-350 mb-1" />
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Empty Slot</span>
                              </div>
                            )}
                            <div className="mt-2 w-full">
                              <input 
                                type="file" 
                                accept="image/*"
                                id={`wizard-property-image-uploader-${index}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        const nextImgs = [...propertyImages];
                                        nextImgs[index] = reader.result;
                                        setPropertyImages(nextImgs);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                              <label 
                                htmlFor={`wizard-property-image-uploader-${index}`}
                                className="block w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold py-1 rounded-lg text-[9px] cursor-pointer text-center transition select-none uppercase tracking-wider"
                              >
                                {propertyImages[index] ? 'Change' : `Upload ${index + 1}`}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Property Location Link */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Google Maps Location Link (Optional)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="url"
                          value={locationLink}
                          onChange={(e) => setLocationLink(e.target.value)}
                          placeholder="E.g., https://maps.app.goo.gl/..."
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900 shadow-xs font-semibold"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Footers controls */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="curved-orange-border-btn py-2.5 px-5 text-xs transition inline-flex items-center space-x-1 uppercase tracking-wider shadow-xs"
                    >
                      <span>Rooms Configuration</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </form>
              )}

              {/* STEP 3: PHYSICAL ROOMS SETUP WITH EXPANDABLE FLOOR CARDS */}
              {step === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 text-emerald-900 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase">Floor Directory Setup</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 max-w-sm">
                        Create physical floor divisions. Build custom inventory rooms with tiered prices (Daily, Monthly, Seasonal).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFloorLevel}
                      className="curved-orange-border-btn py-1.5 px-3.5 text-[10px] transition uppercase tracking-wider shadow-xs"
                    >
                      + Floor
                    </button>
                  </div>

                  {/* LOOP THRU PHYSICAL FLOOR LAYERS (EXPANDABLE) */}
                  <div className="space-y-3">
                    {floors.map((flr) => {
                      const isExpanded = expandedFloorIds.includes(flr.id);
                      return (
                        <div key={flr.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-transform duration-200">
                          
                          {/* Floor expandable Header Bar */}
                          <div 
                            onClick={() => toggleFloorExpansion(flr.id)}
                            className="bg-slate-50/70 p-3.5 px-4 flex justify-between items-center cursor-pointer hover:bg-slate-100/60 transition"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-mono font-black text-white bg-slate-900 px-2 py-0.5 rounded-md">
                                FL-{flr.level}
                              </span>
                              <input 
                                type="text"
                                value={flr.name}
                                onClick={(e) => e.stopPropagation()} // stop toggle behavior on text edit
                                onChange={(e) => {
                                  setFloors(floors.map(f => f.id === flr.id ? { ...f, name: e.target.value } : f));
                                }}
                                className="text-xs font-black text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-indigo-600 max-w-[130px] font-display"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({flr.rooms.length} units mapped)
                              </span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <button 
                                type="button"
                                onClick={(e) => handleDeleteFloorLevel(flr.id, e)}
                                className="text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 p-1 rounded-lg border border-rose-100 transition"
                                title="Delete Floor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-slate-400 text-xs font-mono font-bold">
                                {isExpanded ? '▼' : '►'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Content View Panel */}
                          {isExpanded && (
                            <div className="p-4 bg-white divide-y divide-slate-100 space-y-3">
                              
                              {/* Rooms layout mapping */}
                              {flr.rooms.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">
                                  {flr.rooms.map(rm => (
                                    <div 
                                      key={rm.id} 
                                      className="border border-slate-200 rounded-xl p-3 flex justify-between items-start bg-slate-50/40 relative shadow-2xs hover:scale-[1.01] transition-all"
                                    >
                                      <div>
                                        <div className="flex items-center space-x-1.5">
                                          <span className="font-mono text-xs font-black text-indigo-750 bg-indigo-50/80 px-1.5 py-0.5 rounded">R. {rm.roomNumber}</span>
                                          <span className="text-[9px] font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{rm.category}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium block mt-1">
                                          Capacity: <strong className="text-slate-800">{rm.personsCount} pax</strong>
                                        </p>
                                        <div className="text-[11px] font-mono font-extrabold text-emerald-600 mt-1">
                                          {rm.pricingType === 'room' ? (
                                            <span>₹{rm.roomPricePerDay}/day (Rate)</span>
                                          ) : (
                                            <span>₹{rm.personPricing.monthly || rm.personPricing.daily*30}/mo (Person)</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1">
                                        <button 
                                          onClick={() => handleOpenRoomModal(flr.id, rm)}
                                          className="p-1 text-slate-500 hover:text-indigo-600 bg-white rounded border border-slate-100 hover:border-slate-300 transition"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={(e) => handleDeleteRoom(flr.id, rm.id, e)}
                                          className="p-1 text-rose-500 hover:text-rose-700 bg-white rounded border border-rose-100 hover:border-rose-300 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-slate-400 text-xs italic">
                                  No physical inventory units configured on this floor levels.
                                </div>
                              )}

                              {/* [+ Add Room] trigger button */}
                              <div className="pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoomModal(flr.id)}
                                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer border border-dashed border-indigo-200"
                                >
                                  <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span>Add Room Unit to Floor</span>
                                </button>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                  {/* Footers controls */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep3}
                      className="curved-orange-border-btn py-2.5 px-6 text-xs transition inline-flex items-center space-x-1 uppercase tracking-wider shadow-xs"
                    >
                      <span>Final Summary Review</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 4: FINAL REVIEW */}
              {step === 4 && (
                <div className="space-y-5 animate-fadeIn font-sans">
                  
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-indigo-900">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase">Complete Setup Verification</h4>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        Please review your admin registry data. Clicking 'Create Account' will activate the database structures immediately.
                      </p>
                    </div>
                  </div>

                  {/* Admin Details Summary Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>👤 Admin Details</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">Master Host Name</span>
                        <strong className="text-slate-800">{fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">Mobile Contact</span>
                        <strong className="text-slate-800">{mobileNumber}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">System Email ID</span>
                        <strong className="text-indigo-700">{emailAddress}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Property Details Summary Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>🏠 Property Details</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">Asset Brand Label</span>
                        <strong className="text-slate-800">{propertyName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">Business Category</span>
                        <strong className="text-slate-800">{propertyType === 'PG' ? 'Paying Guest House / PG' : 'Hotel residency'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-410 uppercase font-bold block">Regional Location State</span>
                        <strong className="text-slate-800">{houseNo}, {street}, {area}, {district}, {stateSearch} - {pincode}</strong>
                      </div>
                      {locationLink && (
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-410 uppercase font-bold block">Location Map Link</span>
                          <a href={locationLink} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline break-all font-mono font-bold">
                            {locationLink}
                          </a>
                        </div>
                      )}
                      {propertyImages.some(Boolean) && (
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-410 uppercase font-bold block mb-1">Uploaded Property Images ({propertyImages.filter(Boolean).length}/4)</span>
                          <div className="grid grid-cols-4 gap-2">
                            {propertyImages.filter(Boolean).map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt={`Uploaded Preview ${idx + 1}`} 
                                className="w-full h-16 object-cover border border-slate-200 rounded-lg shadow-2xs" 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rooms Layout Setup Summary Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Bed className="w-4 h-4 text-indigo-600" />
                      <span>🗄️ Floor & Room Mapping</span>
                    </h5>
                    <div className="text-xs space-y-1.5">
                      {floors.map(f => (
                        <div key={f.id} className="flex justify-between items-center bg-slate-50/60 p-2 rounded-xl text-slate-700">
                          <span className="font-bold">{f.name} (FL-{f.level})</span>
                          <span className="font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black text-[10px]">
                            {f.rooms.length} room units mapped
                          </span>
                        </div>
                      ))}
                      <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-[11px] text-teal-800 flex justify-between items-center">
                        <strong>Total System Mapped Units:</strong>
                        <strong className="bg-teal-600 text-white font-mono rounded px-2 py-0.5">
                          {floors.reduce((s, f) => s + f.rooms.length, 0)} Rooms
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Seed Demo Data Option Checkbox */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-3 mt-4 text-slate-800">
                    <input
                      type="checkbox"
                      id="seedDemoDataCheckbox"
                      checked={seedDemoData}
                      onChange={(e) => setSeedDemoData(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-650 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="seedDemoDataCheckbox" className="text-xs text-slate-700 cursor-pointer select-none">
                      <span className="font-extrabold text-slate-900 block text-[11px] uppercase tracking-wide">Pre-seed property with demo records (Recommended)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Generates mock tenants, active leases, invoices, and cleaning staff logs immediately so you can test the operator dashboard in full.</span>
                    </label>
                  </div>

                  {/* Footers controls */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center pr-safe pl-safe pb-safe">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalizeAndCreate}
                      className="curved-orange-border-btn py-2.5 px-6 text-xs transition inline-flex items-center space-x-1.5 uppercase font-display shadow-md active:scale-98"
                    >
                      <Check className="w-4 h-4" />
                      <span>Deploy Setup Profile</span>
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 5: ANIMATED ACCOUNT SUCCESS SCREEN */}
              {step === 5 && (
                <div className="text-center py-10 px-5 space-y-6 flex flex-col items-center justify-center animate-scale-up">
                  
                  {/* Big pulsing Animated success badge */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-100/60 rounded-full scale-125 animate-ping" />
                    <div className="bg-emerald-600 text-white p-6 rounded-full shadow-lg relative z-10">
                      <CheckCircle2 className="w-16 h-16 text-white stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-lg font-black text-slate-900 uppercase font-display tracking-tight">Active Deployment Online</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Congratulations! Your Master Host Operator session was provisioned inside the local index databases successfully.
                    </p>
                  </div>

                  <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-4 w-full text-left text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase">Host Login ID:</span>
                      <span className="text-slate-800 font-bold">{emailAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase">Property Code:</span>
                      <span className="text-slate-800 font-bold text-indigo-700">ONLINE_VERIFIED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase">Provisioned Keys:</span>
                      <span className="text-emerald-705 font-bold">
                        {floors.reduce((s,f) => s + f.rooms.length, 0)} Units Mapped
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      // Trigger main callback and dismiss this wizard layout
                      onSignupSuccess({
                        name: fullName,
                        email: emailAddress,
                        phone: mobileNumber,
                        propertyId: registeredPropertyId || 'mock-prop'
                      });
                    }}
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition shadow-md active:scale-98 font-display"
                  >
                    Enter Real-Time Dashboard
                  </button>

                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* DETAILED BOTTOM SHEET / MODAL SLIDE-UP DOCK PANEL FOR ADDING/EDITING A PHYSICAL ROOM */}
      {isRoomModalOpen && (
        <div id="room-sheet-backdrop" className="fixed inset-0 bg-slate-950/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pr-safe pl-safe">
          <div 
            id="room-sheet-container" 
            className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border-t sm:border border-slate-200 flex flex-col overflow-hidden max-h-[92vh] font-sans animate-slide-up pb-safe"
          >
            
            {/* Header with visual drawer handles indicating slide status */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Configure Occupancy Unit</span>
              <button 
                onClick={() => setIsRoomModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-xs font-extrabold"
              >
                ✖
              </button>
            </div>

            {/* Modal Scroll area */}
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Room custom digits */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Room Number Label</label>
                <input 
                  type="text"
                  value={modalRoomNumber}
                  onChange={(e) => setModalRoomNumber(e.target.value)}
                  placeholder="E.g. A101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-600 font-mono font-bold text-slate-900 outline-none shadow-xs"
                />
              </div>

              {/* CARD BASED SELECTION INSTEAD OF DROPDOWNS */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Category Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Standard', name: 'Standard (FLAT)' },
                    { id: 'Deluxe', name: 'Deluxe (FLAT)' },
                    { id: 'Suite', name: 'Suite (LUXURY)' },
                    { id: 'Dormitory', name: 'Dormitory (BED)' },
                    { id: 'Single sharing', name: 'Single Bed' },
                    { id: 'Double sharing', name: 'Double Bed' },
                    { id: 'Triple sharing', name: 'Triple Bed' }
                  ].map(item => {
                    const isSelected = modalCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCategoryCard(item.id as TempRoom['category'])}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.01]' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                        }`}
                      >
                        <span className="text-[10.5px] font-black block leading-none font-display uppercase tracking-tight">
                          {item.id}
                        </span>
                        <span className={`text-[8.5px] mt-0.5 block leading-none ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OCCUPANCY CONTROLS USING STEPPER BUTTONS */}
              <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Occupancy Capacity</label>
                    <span className="text-[9px] text-slate-500 block leading-tight">Total persons allowed in unit</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-250 p-0.5">
                    <button 
                      type="button"
                      onClick={() => setModalPersonsCount(Math.max(1, modalPersonsCount - 1))}
                      className="bg-slate-100 p-1 rounded hover:bg-slate-200 text-slate-700 text-xs font-bold transition duration-150"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black font-mono w-6 text-center text-slate-900">
                      {modalPersonsCount}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setModalPersonsCount(Math.min(12, modalPersonsCount + 1))}
                      className="bg-slate-100 p-1 rounded hover:bg-slate-200 text-slate-700 text-xs font-bold transition duration-150"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* PRICING WITH TABS COMPONENT CONFIGURATION */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono block">Pricing Configuration</label>
                
                {modalPricingType === 'room' ? (
                  // Daily flat price for Suites/Standard/Deluxe
                  <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 text-xs font-sans">
                    <span className="text-[9px] text-indigo-750 font-bold uppercase tracking-wider block">Flat Daily Room Rate (Whole Unit Charges)</span>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                      <input 
                        type="number"
                        value={modalRoomPricePerDay}
                        onChange={(e) => setModalRoomPricePerDay(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-6 pr-3 font-mono font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  // Tiered tabs pricing for Dormitories and Sharings
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
                    
                    {/* TABS HEADER CONTROL */}
                    <div className="bg-white p-0.5 rounded-lg border border-slate-200/80 flex divide-x divide-slate-150 font-sans font-bold">
                      {['daily', 'weekly', 'monthly', 'seasonal'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActivePricingTab(tab as any)}
                          className={`flex-1 py-1 text-[9.5px] rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                            activePricingTab === tab 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* DYNAMIC TAB BODY */}
                    <div className="p-1">
                      {activePricingTab === 'daily' && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] uppercase font-mono font-bold block text-slate-400">Daily Per Person Rate</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                            <input 
                              type="number" 
                              value={modalDailyPrice}
                              onChange={(e) => setModalDailyPrice(parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-250 rounded-lg py-1.5 pl-5 pr-2 outline-none font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      )}

                      {activePricingTab === 'weekly' && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] uppercase font-mono font-bold block text-slate-400">Weekly Per Person Rate</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                            <input 
                              type="number" 
                              value={modalWeeklyPrice}
                              onChange={(e) => setModalWeeklyPrice(parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-250 rounded-lg py-1.5 pl-5 pr-2 outline-none font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      )}

                      {activePricingTab === 'monthly' && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] uppercase font-mono font-bold block text-slate-400">Monthly Per Person Rate</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                            <input 
                              type="number" 
                              value={modalMonthlyPrice}
                              onChange={(e) => setModalMonthlyPrice(parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-250 rounded-lg py-1.5 pl-5 pr-2 outline-none font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      )}

                      {activePricingTab === 'seasonal' && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] uppercase font-mono font-bold block text-slate-400">Seasonal Per Person Rate</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                            <input 
                              type="number" 
                              value={modalSeasonalPrice}
                              onChange={(e) => setModalSeasonalPrice(parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-250 rounded-lg py-1.5 pl-5 pr-2 outline-none font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Modal slide up card actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 gap-2.5 flex justify-end shrink-0 pr-safe pl-safe">
              <button 
                type="button"
                onClick={() => setIsRoomModalOpen(false)}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 px-5 rounded-xl text-xs font-bold transition active:scale-98"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveModalRoom}
                className="curved-orange-border-btn py-2 px-5 text-xs transition shadow-sm active:scale-98 cursor-pointer"
              >
                Save Room Asset
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
