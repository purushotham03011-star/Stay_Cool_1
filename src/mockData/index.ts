import { 
  Organization, 
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
  Notification 
} from '../types';

// Helper to interact with LocalStorage safely
export function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`hotel_pg_${key}`);
    const parsed = item ? JSON.parse(item) : defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setLocalStorageData<T>(key: string, value: T): void {
  try {
    const oldValueStr = localStorage.getItem(`hotel_pg_${key}`);
    localStorage.setItem(`hotel_pg_${key}`, JSON.stringify(value));
    
    // Dispatch a custom DOM event so all active portals can reactively reload
    window.dispatchEvent(new CustomEvent('stayhub-data-updated', { detail: { key, value } }));

    // Propagate changes asynchronously to backend FastAPI server
    propagateToBackend(key, value, oldValueStr);
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

/** Generate a unique Admin ID */
export function generateAdminId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ADMIN-${ts}-${rand}`;
}

/** Generate a unique Customer ID */
export function generateCustomerId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CUST-${ts}-${rand}`;
}

async function propagateToBackend(key: string, value: any, oldValueStr: string | null) {
  try {
    const oldValue = oldValueStr ? JSON.parse(oldValueStr) : [];
    
    const getNewItems = (newArr: any[], oldArr: any[]) => {
      if (!Array.isArray(newArr)) return [];
      const oldIds = new Set((oldArr || []).map(item => item.id));
      return newArr.filter(item => !oldIds.has(item.id));
    };

    const getModifiedItems = (newArr: any[], oldArr: any[]) => {
      if (!Array.isArray(newArr) || !Array.isArray(oldArr)) return [];
      const oldMap = new Map(oldArr.map(item => [item.id, item]));
      return newArr.filter(item => {
        const oldItem = oldMap.get(item.id);
        return oldItem && JSON.stringify(item) !== JSON.stringify(oldItem);
      });
    };

    const getDeletedItems = (newArr: any[], oldArr: any[]) => {
      if (!Array.isArray(newArr) || !Array.isArray(oldArr)) return [];
      const newIds = new Set(newArr.map(item => item.id));
      return oldArr.filter(item => !newIds.has(item.id));
    };

    if (key === 'audit_logs') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: item.userEmail,
            role: item.role,
            action: item.action,
            module: item.module,
            ip: item.ip
          })
        });
      }
    }
    else if (key === 'organizations') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
    }
    else if (key === 'properties') {
      const newItems = getNewItems(value, oldValue);
      const modifiedItems = getModifiedItems(value, oldValue);
      const allProps = [...newItems, ...modifiedItems];
      for (const item of allProps) {
        await fetch('http://localhost:8000/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            organization_id: item.orgId || 'org-1',
            name: item.name,
            type: item.type,
            address: item.address,
            city: item.city,
            active: true,
            admin_name: item.adminName || '',
            admin_email: item.adminEmail || '',
            admin_phone: item.adminPhone || '',
            admin_password: item.adminPassword || '',
            admin_id: item.adminId || '',
            location_link: item.locationLink || '',
            image_url: item.imageUrl || '',
            amenities: item.amenities || [],
            rules: item.rules || [],
            locks: item.locks || {},
            images: item.images || [],
            status: item.status || 'Active'
          })
        });

      }
      const deletedProps = getDeletedItems(value, oldValue);
      for (const item of deletedProps) {
        try {
          await fetch(`http://localhost:8000/api/properties/${item.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error(e);
        }
      }
    }
    else if (key === 'rooms') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            property_id: item.propertyId,
            room_number: item.roomNumber,
            floor: item.floor,
            category: item.type === 'Single' ? 'Standard' : item.type === 'Double' ? 'Deluxe' : 'Suite',
            sharing_type: item.type,
            price_daily: item.pricePerDay || 0,
            price_weekly: (item.pricePerDay || 0) * 7,
            price_monthly: item.pricePerMonth || 0,
            status: item.occupancyStatus || 'Available'
          })
        });
      }
    }
    else if (key === 'beds') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/beds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            room_id: item.roomId,
            bed_number: item.bedNumber,
            status: item.isOccupied ? 'Occupied' : 'Available'
          })
        });
      }
    }
    else if (key === 'tenants') {
      const newItems = getNewItems(value, oldValue);
      const modifiedItems = getModifiedItems(value, oldValue);
      const allToSync = [...newItems, ...modifiedItems];
      for (const item of allToSync) {
        await fetch('http://localhost:8000/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            parent_name: item.emergencyContactName?.split(' ')[0] || '',
            emergency_contact: item.emergencyContactPhone || '',
            id_proof_url: item.docUrl || '',
            rent_due: 0.0,
            password: item.password || 'customer123',
            last_login: item.lastLogin || null,
            last_logout: item.lastLogout || null
          })
        });
      }
      const deletedTenants = getDeletedItems(value, oldValue);
      for (const item of deletedTenants) {
        try {
          await fetch(`http://localhost:8000/api/tenants/${item.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error(e);
        }
      }
    }
    else if (key === 'bookings') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            property_id: item.propertyId,
            room_id: item.roomId || null,
            bed_id: item.bedId || null,
            tenant_email: item.customerEmail || 'tenant@stayhub.co',
            check_in_date: item.checkInDate,
            check_out_date: item.checkOutDate,
            total_amount: item.totalAmount || 0,
            status: item.status || 'Pending'
          })
        });
      }

      const modifiedItems = getModifiedItems(value, oldValue);
      for (const item of modifiedItems) {
        const oldItem = oldValue.find((o: any) => o.id === item.id);
        if (oldItem) {
          if ((item.status === 'Confirmed' || item.status === 'Active') && oldItem.status === 'Pending') {
            await fetch(`http://localhost:8000/api/bookings/${item.id}/approve?room_id=${item.roomId}&bed_id=${item.bedId}`, {
              method: 'POST'
            });
          }
          else if (item.status === 'Completed' && oldItem.status !== 'Completed') {
            await fetch(`http://localhost:8000/api/bookings/${item.id}/checkout`, {
              method: 'POST'
            });
          }
        }
      }
    }
    else if (key === 'invoices') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            booking_id: item.bookingId || 'booking-placeholder',
            tenant_id: item.tenantId,
            amount: item.amount,
            cgst: item.amount * 0.09,
            sgst: item.amount * 0.09,
            total: item.amount * 1.18,
            status: item.status || 'Unpaid',
            due_date: item.dueDate || new Date().toISOString().split('T')[0]
          })
        });
      }

      const modifiedItems = getModifiedItems(value, oldValue);
      for (const item of modifiedItems) {
        const oldItem = oldValue.find((o: any) => o.id === item.id);
        if (oldItem && item.status === 'Paid' && oldItem.status !== 'Paid') {
          await fetch(`http://localhost:8000/api/invoices/${item.id}/pay`, {
            method: 'POST'
          });
        }
      }
    }
    else if (key === 'housekeeping') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        const rooms = JSON.parse(localStorage.getItem('hotel_pg_rooms') || '[]');
        const targetRoom = rooms.find((r: any) => r.roomNumber === item.roomNumber);
        await fetch('http://localhost:8000/api/housekeeping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            room_id: targetRoom?.id || 'room-101',
            task_description: item.notes || 'Routine cleaning',
            status: item.status || 'Pending',
            assigned_staff: item.assignedStaff || '',
            scheduled_date: item.date || new Date().toISOString().split('T')[0]
          })
        });
      }

      const modifiedItems = getModifiedItems(value, oldValue);
      for (const item of modifiedItems) {
        await fetch(`http://localhost:8000/api/housekeeping/${item.id}?status=${encodeURIComponent(item.status)}`, {
          method: 'PATCH'
        });
      }
    }
    else if (key === 'food_menu') {
      const itemsToSync = value.flatMap((dayItem: any) => [
        { id: `${dayItem.id}-b`, day_of_week: dayItem.day, meal_type: 'Breakfast', menu_description: dayItem.breakfast },
        { id: `${dayItem.id}-l`, day_of_week: dayItem.day, meal_type: 'Lunch', menu_description: dayItem.lunch },
        { id: `${dayItem.id}-d`, day_of_week: dayItem.day, meal_type: 'Dinner', menu_description: dayItem.dinner }
      ]);
      await fetch('http://localhost:8000/api/food-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsToSync)
      });
    }
    else if (key === 'visitors') {
      const newItems = getNewItems(value, oldValue);
      for (const item of newItems) {
        await fetch('http://localhost:8000/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            name: item.visitorName,
            phone: item.phone || '',
            tenant_id: item.hostTenantId,
            purpose: item.purpose || '',
            approved: !!item.checkInTime
          })
        });
      }

      const modifiedItems = getModifiedItems(value, oldValue);
      for (const item of modifiedItems) {
        const oldItem = oldValue.find((o: any) => o.id === item.id);
        if (oldItem) {
          if (item.checkOutTime && !oldItem.checkOutTime) {
            await fetch(`http://localhost:8000/api/visitors/${item.id}/exit`, {
              method: 'PATCH'
            });
          }
          if (item.checkInTime && !oldItem.checkInTime) {
            await fetch(`http://localhost:8000/api/visitors/${item.id}/approve`, {
              method: 'PATCH'
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn("Backend offline or request failed, local state updated only:", e);
  }
}

export async function syncAllFromBackend() {
  try {
    const resLogs = await fetch('http://localhost:8000/api/audit-logs');
    if (resLogs.ok) {
      const data = await resLogs.json();
      if (data.length > 0) {
        const mapped = data.map((log: any) => ({
          id: log.id,
          userEmail: log.user_email,
          role: log.role,
          action: log.action,
          module: log.module,
          timestamp: log.timestamp,
          ip: log.ip
        }));
        localStorage.setItem('hotel_pg_audit_logs', JSON.stringify(mapped));
      }
    }
    
    const resOrgs = await fetch('http://localhost:8000/api/organizations');
    if (resOrgs.ok) {
      const data = await resOrgs.json();
      if (data.length > 0) localStorage.setItem('hotel_pg_organizations', JSON.stringify(data));
    }

    const resProps = await fetch('http://localhost:8000/api/properties');
    if (resProps.ok) {
      const data = await resProps.json();
      if (data.length > 0) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          city: p.city || 'Bangalore',
          address: p.address || '',
          orgId: p.organization_id,
          adminName: p.admin_name || '',
          adminEmail: p.admin_email || '',
          adminPhone: p.admin_phone || '',
          adminPassword: p.admin_password || '',
          adminId: p.admin_id || '',
          locationLink: p.location_link || '',
          imageUrl: p.image_url || '',
          amenities: p.amenities || [],
          rules: p.rules || [],
          locks: p.locks || {},
          images: p.images || [],
          status: p.status || 'Active'
        }));

        localStorage.setItem('hotel_pg_properties', JSON.stringify(mapped));
      }
    }

    const resRooms = await fetch('http://localhost:8000/api/rooms');
    if (resRooms.ok) {
      const rooms = await resRooms.json();
      if (rooms.length > 0) {
        const mappedRooms = rooms.map((r: any) => ({
          id: r.id,
          propertyId: r.property_id,
          roomNumber: r.room_number,
          floor: r.floor,
          type: r.sharing_type,
          pricePerMonth: r.price_monthly,
          pricePerDay: r.price_daily,
          occupancyStatus: r.status
        }));
        localStorage.setItem('hotel_pg_rooms', JSON.stringify(mappedRooms));
        
        const allBeds = rooms.flatMap((r: any) => (r.beds || []).map((b: any) => ({
          id: b.id,
          roomId: b.room_id,
          roomNumber: r.room_number,
          bedNumber: b.bed_number,
          isOccupied: b.status === 'Occupied'
        })));
        if (allBeds.length > 0) {
          localStorage.setItem('hotel_pg_beds', JSON.stringify(allBeds));
        }
      }
    }

    const resTenants = await fetch('http://localhost:8000/api/tenants');
    if (resTenants.ok) {
      const data = await resTenants.json();
      if (data.length > 0) {
        const existingLocalTenants = JSON.parse(localStorage.getItem('hotel_pg_tenants') || '[]');
        const mapped = data.map((t: any) => {
          const localMatch = existingLocalTenants.find((lt: any) => lt.id === t.id) || SEED_TENANTS.find((st: any) => st.id === t.id) || {};
          return {
            ...localMatch,
            id: t.id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            emergencyContactName: t.parent_name ? `${t.parent_name} (Parent)` : (localMatch.emergencyContactName || ''),
            emergencyContactPhone: t.emergency_contact || localMatch.emergencyContactPhone || '',
            docUrl: t.id_proof_url || localMatch.docUrl || '',
            docType: localMatch.docType || 'Aadhaar',
            status: localMatch.status || 'Active',
            password: t.password || localMatch.password || 'customer123',
            lastLogin: t.last_login || localMatch.lastLogin || '',
            lastLogout: t.last_logout || localMatch.lastLogout || '',
            gender: localMatch.gender || 'Male',
            bloodGroup: localMatch.bloodGroup || 'O+',
            roomNumber: localMatch.roomNumber || '',
            roomId: localMatch.roomId || '',
            bedNumber: localMatch.bedNumber || '',
            bedId: localMatch.bedId || '',
            propertyId: localMatch.propertyId || 'prop-1',
            propertyName: localMatch.propertyName || 'Silicon Valley Elite PG',
            joinedDate: localMatch.joinedDate || '2025-02-10'
          };
        });
        localStorage.setItem('hotel_pg_tenants', JSON.stringify(mapped));
      }
    }

    const resBookings = await fetch('http://localhost:8000/api/bookings');
    if (resBookings.ok) {
      const data = await resBookings.json();
      if (data.length > 0) {
        const mapped = data.map((b: any) => ({
          id: b.id,
          propertyId: b.property_id,
          propertyName: b.property?.name || 'StayHub Property',
          roomId: b.room_id,
          roomNumber: b.room?.room_number || b.room?.roomNumber || '101',
          bedId: b.bed_id,
          customerName: b.tenant?.name || 'Aarav Mehta',
          customerEmail: b.tenant?.email || b.tenant_id,
          customerPhone: b.tenant?.phone || '+91 99999 88888',
          checkInDate: b.check_in_date,
          checkOutDate: b.check_out_date,
          status: b.status === 'Active' ? 'Confirmed' : b.status,
          totalAmount: b.total_amount,
          requestedRoomType: b.room?.type || 'Double'
        }));
        localStorage.setItem('hotel_pg_bookings', JSON.stringify(mapped));
      }
    }

    const resInvoices = await fetch('http://localhost:8000/api/invoices');
    if (resInvoices.ok) {
      const data = await resInvoices.json();
      if (data.length > 0) {
        const localTenants = JSON.parse(localStorage.getItem('hotel_pg_tenants') || '[]');
        const localInvoices = JSON.parse(localStorage.getItem('hotel_pg_invoices') || '[]');
        const mapped = data.map((inv: any) => {
          const matchLocal = localInvoices.find((li: any) => li.id === inv.id) || {};
          const tenantObj = localTenants.find((t: any) => t.id === inv.tenant_id);
          return {
            ...matchLocal,
            id: inv.id,
            tenantId: inv.tenant_id,
            tenantName: tenantObj ? tenantObj.name : (matchLocal.tenantName || 'Active Resident'),
            propertyName: tenantObj ? tenantObj.propertyName : (matchLocal.propertyName || 'StayHub PG'),
            month: matchLocal.month || 'June 2026',
            amount: inv.amount,
            dueDate: inv.due_date,
            status: inv.status,
            type: matchLocal.type || 'Rent'
          };
        });
        localStorage.setItem('hotel_pg_invoices', JSON.stringify(mapped));
      }
    }

    const resHousekeeping = await fetch('http://localhost:8000/api/housekeeping');
    if (resHousekeeping.ok) {
      const data = await resHousekeeping.json();
      if (data.length > 0) {
        const mapped = data.map((hk: any) => ({
          id: hk.id,
          roomNumber: '101',  // Default fallback
          assignedStaff: hk.assigned_staff,
          date: hk.scheduled_date,
          status: hk.status,
          notes: hk.task_description
        }));
        localStorage.setItem('hotel_pg_housekeeping', JSON.stringify(mapped));
      }
    }

    const resVisitors = await fetch('http://localhost:8000/api/visitors');
    if (resVisitors.ok) {
      const data = await resVisitors.json();
      if (data.length > 0) {
        const mapped = data.map((v: any) => ({
          id: v.id,
          visitorName: v.name,
          phone: v.phone,
          purpose: v.purpose,
          hostTenantId: v.tenant_id,
          checkInTime: v.entry_time,
          checkOutTime: v.exit_time
        }));
        localStorage.setItem('hotel_pg_visitors', JSON.stringify(mapped));
      }
    }
    console.log("StayHub Frontend successfully synchronized with FastAPI database.");
  } catch (e) {
    console.warn("Backend server offline, running in offline/cached simulation mode.", e);
  }
}


// Seed Organizations
export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Homely Stays Group',
    domain: 'homelystays.com',
    registeredAt: '2025-01-15T09:00:00Z',
    contactEmail: 'corp@homelystays.com',
    status: 'Active'
  },
  {
    id: 'org-2',
    name: 'Apex Hospitality Inc',
    domain: 'apexhospitality.net',
    registeredAt: '2025-03-10T11:30:00Z',
    contactEmail: 'contact@apexhospitality.net',
    status: 'Active'
  }
];

// Seed Properties
export const SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Silicon Valley Elite PG',
    type: 'PG',
    city: 'Bangalore',
    address: 'Plot 42, 100 Feet Rd, HSR Layout Sector 2, Bangalore - 560102',
    totalRooms: 8,
    amenities: ['Wi-Fi', 'Daily Cleaning', 'Geyser', 'Washing Machine', 'Smart TV', 'A/C', 'GYM Access', 'Elevator', '24/7 Security'],
    rules: ['No loud music after 10 PM', 'No smoking inside rooms', 'Visitors allowed 9 AM - 8 PM only', 'Gate closes at 11:30 PM'],
    orgId: 'org-1',
    adminName: 'Priya Sharma',
    adminEmail: 'priya@stayhub.co',
    adminPhone: '+91 98765 43210',
    adminPassword: 'admin123',
    classification: 'Luxury PG',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    pincode: '560102',
    area: 'HSR Layout Sector 2',
    street: '100 Feet Rd',
    houseNumber: 'Plot 42',
    locks: {},
    status: 'Active'
  },
  {
    id: 'prop-2',
    name: 'The Grand Residency Hotel',
    type: 'Hotel',
    city: 'Hyderabad',
    address: 'Near DLF Cyber City, Gachibowli, Hyderabad - 500032',
    totalRooms: 6,
    amenities: ['Free Wi-Fi', 'Valet Parking', 'Swimming Pool', 'Room Service', 'Mini Bar', 'A/C', 'Complimentary Breakfast', 'Bath Tub'],
    rules: ['Valid ID mandatory during entry', 'Checkout time is 11 AM', 'Pets not allowed', 'Quiet hours 11 PM - 7 AM'],
    orgId: 'org-1',
    adminName: 'Kiran Kumar',
    adminEmail: 'kiran@stayhub.co',
    adminPhone: '+91 87654 32109',
    adminPassword: 'admin123',
    classification: '3 Star Hotel',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
    state: 'Telangana',
    district: 'Rangareddy',
    pincode: '500032',
    area: 'Gachibowli',
    street: 'Near DLF Cyber City',
    houseNumber: 'B-12',
    locks: {},
    status: 'Active'
  },
  {
    id: 'prop-3',
    name: 'Graceful Living Co-Living',
    type: 'PG',
    city: 'Mumbai',
    address: 'Floor 3, Sunshine Towers, Senapati Bapat Marg, Lower Parel, Mumbai - 400013',
    totalRooms: 6,
    amenities: ['High-speed Wi-Fi', 'Professional Housekeeping', 'Buffet Dining Hall', 'Biometric Security', 'PlayStation Lounge'],
    rules: ['Rent payment in advance by 5th', 'Washing machines are self-service', 'No outside cooks allowed'],
    orgId: 'org-2',
    adminName: 'Amit Patel',
    adminEmail: 'amit@stayhub.co',
    adminPhone: '+91 76543 21098',
    adminPassword: 'admin123',
    classification: 'Co-living PG',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    state: 'Maharashtra',
    district: 'Mumbai City',
    pincode: '400013',
    area: 'Lower Parel',
    street: 'Senapati Bapat Marg',
    houseNumber: 'Sunshine Towers, Floor 3',
    locks: {},
    status: 'Active'
  }
];

// Seed Rooms
export const SEED_ROOMS: Room[] = [
  // Silicon Valley Elite PG Rooms
  {
    id: 'room-101',
    propertyId: 'prop-1',
    roomNumber: '101',
    floor: 1,
    type: 'Single',
    pricePerMonth: 18000,
    pricePerDay: 800,
    priceWeekly: 5000,
    priceSeasonal: 20000,
    amenities: ['A/C', 'Attached Bath', 'Balcony', 'Study Table'],
    occupancyStatus: 'Available'
  },
  {
    id: 'room-102',
    propertyId: 'prop-1',
    roomNumber: '102',
    floor: 1,
    type: 'Double',
    pricePerMonth: 11000,
    pricePerDay: 500,
    priceWeekly: 3200,
    priceSeasonal: 12500,
    amenities: ['Attached Bath', 'Wardrobe', 'Study Table'],
    occupancyStatus: 'Available'
  },
  {
    id: 'room-201',
    propertyId: 'prop-1',
    roomNumber: '201',
    floor: 2,
    type: 'Double',
    pricePerMonth: 11500,
    pricePerDay: 550,
    priceWeekly: 3500,
    priceSeasonal: 13000,
    amenities: ['A/C', 'Attached Bath', 'Balcony'],
    occupancyStatus: 'Full'
  },
  {
    id: 'room-202',
    propertyId: 'prop-1',
    roomNumber: '202',
    floor: 2,
    type: 'Triple',
    pricePerMonth: 8500,
    pricePerDay: 400,
    priceWeekly: 2500,
    priceSeasonal: 9500,
    amenities: ['Attached Bath', 'Locker Wardrobes', 'Balcony'],
    occupancyStatus: 'Available'
  },
  {
    id: 'room-301',
    propertyId: 'prop-1',
    roomNumber: '301',
    floor: 3,
    type: 'Four-Sharing',
    pricePerMonth: 6500,
    pricePerDay: 300,
    priceWeekly: 1900,
    priceSeasonal: 7200,
    amenities: ['Attached Bath', 'Lockers', 'Study Area'],
    occupancyStatus: 'Available'
  },
  {
    id: 'room-302',
    propertyId: 'prop-1',
    roomNumber: '302',
    floor: 3,
    type: 'Single',
    pricePerMonth: 16500,
    pricePerDay: 750,
    priceWeekly: 4800,
    priceSeasonal: 18500,
    amenities: ['Attached Bath', 'Desk chair', 'Air Purifier'],
    occupancyStatus: 'Maintenance'
  },

  // The Grand Residency Hotel Rooms
  {
    id: 'room-h101',
    propertyId: 'prop-2',
    roomNumber: '101',
    floor: 1,
    type: 'Single',
    pricePerMonth: 45000,
    pricePerDay: 2200,
    priceWeekly: 14000,
    priceSeasonal: 50000,
    amenities: ['A/C', 'King Bed', 'Coffee Maker', 'Mini Bar'],
    occupancyStatus: 'Available'
  },
  {
    id: 'room-h102',
    propertyId: 'prop-2',
    roomNumber: '102',
    floor: 1,
    type: 'Double',
    pricePerMonth: 60000,
    pricePerDay: 3000,
    priceWeekly: 19000,
    priceSeasonal: 68000,
    amenities: ['A/C', 'Two Queen Beds', 'Jacuzzi Space', 'Working Desk'],
    occupancyStatus: 'Full'
  },
  {
    id: 'room-h201',
    propertyId: 'prop-2',
    roomNumber: '201',
    floor: 2,
    type: 'Double',
    pricePerMonth: 65000,
    pricePerDay: 3200,
    priceWeekly: 20000,
    priceSeasonal: 73000,
    amenities: ['A/C', 'Balcony overlooking Pool', 'Smart TV'],
    occupancyStatus: 'Available'
  }
];

// Seed Beds
export const SEED_BEDS: Bed[] = [
  // Room 101 (Single)
  { id: 'bed-101-a', roomId: 'room-101', roomNumber: '101', bedNumber: 'A', isOccupied: false },
  
  // Room 102 (Double)
  { id: 'bed-102-a', roomId: 'room-102', roomNumber: '102', bedNumber: 'A', isOccupied: true, occupantTenantId: 'tenant-2' },
  { id: 'bed-102-b', roomId: 'room-102', roomNumber: '102', bedNumber: 'B', isOccupied: false },

  // Room 201 (Double)
  { id: 'bed-201-a', roomId: 'room-201', roomNumber: '201', bedNumber: 'A', isOccupied: true, occupantTenantId: 'tenant-1' },
  { id: 'bed-201-b', roomId: 'room-201', roomNumber: '201', bedNumber: 'B', isOccupied: true, occupantTenantId: 'tenant-3' },

  // Room 202 (Triple)
  { id: 'bed-202-a', roomId: 'room-202', roomNumber: '202', bedNumber: 'A', isOccupied: true, occupantTenantId: 'tenant-4' },
  { id: 'bed-202-b', roomId: 'room-202', roomNumber: '202', bedNumber: 'B', isOccupied: false },
  { id: 'bed-202-c', roomId: 'room-202', roomNumber: '202', bedNumber: 'C', isOccupied: false },

  // Room 301 (Four-Sharing)
  { id: 'bed-301-a', roomId: 'room-301', roomNumber: '301', bedNumber: 'A', isOccupied: false },
  { id: 'bed-301-b', roomId: 'room-301', roomNumber: '301', bedNumber: 'B', isOccupied: false },
  { id: 'bed-301-c', roomId: 'room-301', roomNumber: '301', bedNumber: 'C', isOccupied: false },
  { id: 'bed-301-d', roomId: 'room-301', roomNumber: '301', bedNumber: 'D', isOccupied: false },

  // Hotel rooms generally don't lease as individual beds, but we support bed mapping for PG models
  { id: 'bed-h101-a', roomId: 'room-h101', roomNumber: '101', bedNumber: 'A', isOccupied: false },
  { id: 'bed-h102-a', roomId: 'room-h102', roomNumber: '102', bedNumber: 'A', isOccupied: true, occupantTenantId: 'tenant-5' }
];

// Seed Tenants
export const SEED_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98765 43210',
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContactName: 'Rajesh Sharma (Father)',
    emergencyContactPhone: '+91 98765 43219',
    docUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=60',
    docType: 'Aadhaar',
    roomNumber: '201',
    roomId: 'room-201',
    bedNumber: 'A',
    bedId: 'bed-201-a',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    status: 'Active',
    joinedDate: '2025-02-10'
  },
  {
    id: 'tenant-2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 87654 32109',
    gender: 'Female',
    bloodGroup: 'A+',
    emergencyContactName: 'Mehta Patel (Mother)',
    emergencyContactPhone: '+91 87654 00000',
    docUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
    docType: 'Passport',
    roomNumber: '102',
    roomId: 'room-102',
    bedNumber: 'A',
    bedId: 'bed-102-a',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    status: 'Active',
    joinedDate: '2025-03-01'
  },
  {
    id: 'tenant-3',
    name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    phone: '+91 76543 21098',
    gender: 'Male',
    bloodGroup: 'B+',
    emergencyContactName: 'Sanjay Verma (Father)',
    emergencyContactPhone: '+91 76543 99999',
    docUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    docType: 'Driving License',
    roomNumber: '201',
    roomId: 'room-201',
    bedNumber: 'B',
    bedId: 'bed-201-b',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    status: 'Active',
    joinedDate: '2025-02-15'
  },
  {
    id: 'tenant-4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '+91 99887 76655',
    gender: 'Female',
    bloodGroup: 'O-',
    emergencyContactName: 'Govinda Reddy (Uncle)',
    emergencyContactPhone: '+91 99887 44444',
    docUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    docType: 'Aadhaar',
    roomNumber: '202',
    roomId: 'room-202',
    bedNumber: 'A',
    bedId: 'bed-202-a',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    status: 'Active',
    joinedDate: '2025-05-01'
  },
  {
    id: 'tenant-5',
    name: 'Michael Scott',
    email: 'michael.dunder@example.com',
    phone: '+1 570 555 1212',
    gender: 'Male',
    bloodGroup: 'AB+',
    emergencyContactName: 'Dwight Schrute (Assistant)',
    emergencyContactPhone: '+1 570 555 1313',
    docUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60',
    docType: 'Passport',
    roomNumber: '102',
    roomId: 'room-h102',
    bedNumber: 'A',
    bedId: 'bed-h102-a',
    propertyId: 'prop-2',
    propertyName: 'The Grand Residency Hotel',
    status: 'Active',
    joinedDate: '2025-04-10'
  },
  {
    id: 'tenant-6',
    name: 'Amit Verma',
    email: 'amit.verma@example.com',
    phone: '+91 98765 00001',
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContactName: 'Ramesh Verma (Father)',
    emergencyContactPhone: '+91 98765 00002',
    docUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    docType: 'Aadhaar',
    propertyId: 'none',
    propertyName: 'Not Stayed',
    status: 'Active',
    joinedDate: '2026-06-16',
    password: 'customer123'
  },
  {
    id: 'tenant-7',
    name: 'Shalini Sen',
    email: 'shalini.sen@example.com',
    phone: '+91 87654 00001',
    gender: 'Female',
    bloodGroup: 'A+',
    emergencyContactName: 'Gaurav Sen (Father)',
    emergencyContactPhone: '+91 87654 00002',
    docUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
    docType: 'Aadhaar',
    propertyId: 'none',
    propertyName: 'Not Stayed',
    status: 'Active',
    joinedDate: '2026-06-16',
    password: 'customer123'
  }
];

// Seed Bookings
export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'booking-101',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomId: 'room-101',
    roomNumber: '101',
    bedId: 'bed-101-a',
    bedNumber: 'A',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    customerPhone: '+91 95555 12345',
    checkInDate: '2026-06-01',
    checkOutDate: '2026-11-30',
    mealPlan: 'Full Board',
    status: 'Confirmed',
    totalAmount: 112000,
    bookingDate: '2026-05-20',
    notes: 'Requires North Indian vegetarian meals option.',
    paymentMethod: 'Cash',
    requestedRoomType: 'Single'
  },
  {
    id: 'booking-202',
    propertyId: 'prop-2',
    propertyName: 'The Grand Residency Hotel',
    roomId: 'room-h201',
    roomNumber: '201',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@example.com',
    customerPhone: '+91 91111 22222',
    checkInDate: '2026-05-28',
    checkOutDate: '2026-06-02',
    mealPlan: 'Breakfast Only',
    status: 'Pending',
    totalAmount: 16000,
    bookingDate: '2026-05-23',
    notes: 'Airport pick-up check requested if available.',
    paymentMethod: 'Card',
    requestedRoomType: 'Double'
  },
  {
    id: 'booking-203',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomId: 'room-102',
    roomNumber: '102',
    customerName: 'Ananya Iyer',
    customerEmail: 'ananya.iyer@example.com',
    customerPhone: '+91 94444 88888',
    checkInDate: '2026-06-05',
    checkOutDate: '2026-07-05',
    mealPlan: 'Breakfast Only',
    status: 'Pending',
    totalAmount: 11500,
    bookingDate: '2026-05-25',
    notes: 'Preferred double sharing room. Needs a high floor with proper ventilation.',
    paymentMethod: 'UPI',
    requestedRoomType: 'Double'
  },
  {
    id: 'booking-303',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomId: 'room-102',
    roomNumber: '102',
    bedId: 'bed-102-b',
    bedNumber: 'B',
    customerName: 'Kabir Dev',
    customerEmail: 'kabir.dev@example.com',
    customerPhone: '+91 93333 44444',
    checkInDate: '2026-05-15',
    checkOutDate: '2026-05-20',
    mealPlan: 'None',
    status: 'Completed',
    totalAmount: 2500,
    bookingDate: '2026-05-02',
    paymentMethod: 'UPI',
    requestedRoomType: 'Double'
  }
];

// Seed Invoices
export const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    tenantId: 'tenant-1',
    tenantName: 'Aditya Sharma',
    propertyName: 'Silicon Valley Elite PG',
    month: 'May 2026',
    amount: 11500,
    dueDate: '2026-05-05',
    status: 'Paid',
    generatedAt: '2026-05-01T08:00:00Z',
    type: 'Rent',
    paymentMethod: 'UPI',
    paidAt: '2026-05-04T14:22:00Z'
  },
  {
    id: 'inv-1002',
    tenantId: 'tenant-2',
    tenantName: 'Priya Patel',
    propertyName: 'Silicon Valley Elite PG',
    month: 'May 2026',
    amount: 11000,
    dueDate: '2026-05-05',
    status: 'Unpaid',
    generatedAt: '2026-05-01T08:05:00Z',
    type: 'Rent'
  },
  {
    id: 'inv-1003',
    tenantId: 'tenant-3',
    tenantName: 'Rohan Verma',
    propertyName: 'Silicon Valley Elite PG',
    month: 'May 2026',
    amount: 11500,
    dueDate: '2026-05-05',
    status: 'Overdue',
    generatedAt: '2026-05-01T08:00:00Z',
    type: 'Rent'
  },
  {
    id: 'inv-1004',
    tenantId: 'tenant-1',
    tenantName: 'Aditya Sharma',
    propertyName: 'Silicon Valley Elite PG',
    month: 'May 2026',
    amount: 850,
    dueDate: '2026-05-15',
    status: 'Paid',
    generatedAt: '2026-05-10T09:00:00Z',
    type: 'Electricity',
    paymentMethod: 'Card',
    paidAt: '2026-05-12T16:45:00Z'
  }
];

// Seed Housekeeping
export const SEED_HOUSEKEEPING: HousekeepingTask[] = [
  {
    id: 'task-1',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomNumber: '101',
    assignedStaff: 'Ramesh Kumar',
    date: '2026-05-24',
    status: 'Completed',
    notes: 'Deep sweep and bed linen changed.'
  },
  {
    id: 'task-2',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomNumber: '201',
    assignedStaff: 'Ramesh Kumar',
    date: '2026-05-24',
    status: 'In Progress'
  },
  {
    id: 'task-3',
    propertyId: 'prop-1',
    propertyName: 'Silicon Valley Elite PG',
    roomNumber: '102',
    assignedStaff: 'Shanti Devi',
    date: '2026-05-24',
    status: 'Pending'
  }
];

// Seed Menus (PG Dining Hall)
export const SEED_FOOD_MENU: FoodMenuDay[] = [
  {
    id: 'menu-1',
    propertyId: 'prop-1',
    day: 'Monday',
    breakfast: 'Idli, Vada, Sambhar & Filter Coffee',
    lunch: 'North Indian Meals: Roti, Paneer Masala, Daal, Rice, Curd',
    dinner: 'Aloo Paratha, Pickle, Veg Raita & Kheer',
    attendanceBreakfast: 38,
    attendanceLunch: 24,
    attendanceDinner: 42
  },
  {
    id: 'menu-2',
    propertyId: 'prop-1',
    day: 'Tuesday',
    breakfast: 'Puri Sagu, Fruit Bowl & Tea',
    lunch: 'Veg Biryani, Mirchi ka Salan, Raita & Salad',
    dinner: 'Jeera Rice, Yellow Tadka Daal, Bhindi Fry & Roti',
    attendanceBreakfast: 40,
    attendanceLunch: 29,
    attendanceDinner: 44
  },
  {
    id: 'menu-3',
    propertyId: 'prop-1',
    day: 'Wednesday',
    breakfast: 'Poha, Sheera & Coffee',
    lunch: 'Roti, Chana Masala, Veg Pulao, Curd & Salad',
    dinner: 'Phulka Roti, Kadai Paneer, Rice, Sambhar & Ice Cream',
    attendanceBreakfast: 36,
    attendanceLunch: 22,
    attendanceDinner: 47
  },
  {
    id: 'menu-4',
    propertyId: 'prop-1',
    day: 'Thursday',
    breakfast: 'Masala Dosa, Chutney & Tea',
    lunch: 'Roti, Mix Veg Handi, Tomato Daal & Rice',
    dinner: 'Khichdi, Kadhi, Papad, Aloo Fry',
    attendanceBreakfast: 45,
    attendanceLunch: 18,
    attendanceDinner: 38
  },
  {
    id: 'menu-5',
    propertyId: 'prop-1',
    day: 'Friday',
    breakfast: 'Bread Toast, Omelette/Sprouts & Juice',
    lunch: 'Roti, Dal Makhani, Palak Paneer, Peas Pulao',
    dinner: 'Veg Schezwan Fried Rice/Noodles with Gobi Manchurian',
    attendanceBreakfast: 42,
    attendanceLunch: 31,
    attendanceDinner: 51
  },
  {
    id: 'menu-6',
    propertyId: 'prop-1',
    day: 'Saturday',
    breakfast: 'Uttapam, Coconut Chutney & Tea',
    lunch: 'Roti, Baingan Bharta, Moong Dal & Ghee Rice',
    dinner: 'Butter Naan, Shahi Paneer, Jeera Rice & Jalebi',
    attendanceBreakfast: 32,
    attendanceLunch: 15,
    attendanceDinner: 40
  },
  {
    id: 'menu-7',
    propertyId: 'prop-1',
    day: 'Sunday',
    breakfast: 'Aloo Poori, Halwa & Coffee',
    lunch: 'Special Buffet Lunch (Paneer, Veg Curry, Pulao, Sweets)',
    dinner: 'Phulka Roti, Sev Tamatar Sabzi, Rice & Moong Dal Halwa',
    attendanceBreakfast: 48,
    attendanceLunch: 41,
    attendanceDinner: 35
  }
];

// Seed Visitor record
export const SEED_VISITORS: VisitorRecord[] = [
  {
    id: 'vis-1',
    propertyId: 'prop-1',
    visitorName: 'Rajesh Sharma',
    phone: '+91 98765 43219',
    purpose: 'Parents visit to deliver home-made food',
    hostTenantId: 'tenant-1',
    hostTenantName: 'Aditya Sharma',
    checkInTime: '2026-05-24T10:15:00Z',
    checkOutTime: '2026-05-24T12:00:00Z'
  },
  {
    id: 'vis-2',
    propertyId: 'prop-1',
    visitorName: 'Vinay Kumar',
    phone: '+91 99999 88888',
    purpose: 'Academic project preparation group study',
    hostTenantId: 'tenant-3',
    hostTenantName: 'Rohan Verma',
    checkInTime: '2026-05-24T13:30:00Z'
  }
];

// Seed Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userEmail: 'sunny.diploma033@gmail.com',
    role: 'Super Admin',
    action: 'Created organization Homely Stays Group',
    module: 'SuperAdmin',
    timestamp: '2026-05-23T11:20:00Z',
    ip: '192.168.1.10'
  },
  {
    id: 'log-2',
    userEmail: 'sunny.diploma033@gmail.com',
    role: 'Super Admin',
    action: 'Assigned prop Silicon Valley Elite PG to Admin Priya',
    module: 'SuperAdmin',
    timestamp: '2026-05-23T11:45:00Z',
    ip: '192.168.1.10'
  },
  {
    id: 'log-3',
    userEmail: 'admin.hsr@homelystays.com',
    role: 'Admin',
    action: 'Checked-in Tenant Sneha Reddy into Room 202 Bed A',
    module: 'Tenants',
    timestamp: '2026-05-24T09:30:00Z',
    ip: '192.168.1.25'
  },
  {
    id: 'log-4',
    userEmail: 'admin.hsr@homelystays.com',
    role: 'Admin',
    action: 'Generated 4 invoices for rent May 2026',
    module: 'Billing',
    timestamp: '2026-05-24T10:00:00Z',
    ip: '192.168.1.25'
  }
];

// Seed Notifications
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'tenant-1',
    title: 'Rent Bill Paid Successfully',
    message: 'Your rent bill for May 2026 of amount ₹11,500 was processed successfully via UPI.',
    date: '2026-05-04',
    isRead: true,
    type: 'Success'
  },
  {
    id: 'notif-2',
    userId: 'tenant-2',
    title: 'Pending Rental Payment Alert',
    message: 'Your rent bill for May 2026 of ₹11,000 is still pending. Late fee may be applicable after the 10th.',
    date: '2026-05-08',
    isRead: false,
    type: 'Alert'
  },
  {
    id: 'notif-3',
    userId: 'tenant-1',
    title: 'Special Menu Notification',
    message: 'Sunday buffet lunch is scheduled at 1:00 PM: Veg Biryani, Paneer, Jalebi and more in the Dining Hall!',
    date: '2026-05-23',
    isRead: false,
    type: 'Success'
  }
];

export const SEED_STAFF = [
  {
    id: 'staff-1',
    propertyId: 'prop-1',
    fullName: 'Ravi Kumar',
    phone: '+91 98800 12345',
    address: 'No 15, HSR Sector 1, Bangalore',
    role: 'Cleaning Staff',
    shiftTiming: 'Morning Shift (07:00 AM - 03:00 PM)',
    joiningDate: '2025-02-01',
    salary: 15005,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    notes: 'In charge of Floor 1 and Floor 2 deep cleaning.',
    tasks: ['Clean Room 101 toilet', 'Deep clean lobby on Floor 2', 'Inspect Room 102 check-out state']
  },
  {
    id: 'staff-2',
    propertyId: 'prop-1',
    fullName: 'Suresh Gowda',
    phone: '+91 99000 88877',
    address: 'Sector 5, Outer Ring Rd, HSR, Bangalore',
    role: 'Watchman',
    shiftTiming: 'Night Shift (08:00 PM - 08:00 AM)',
    joiningDate: '2025-01-10',
    salary: 18000,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    notes: 'Handles front gate security, logs overnight visitor registers.',
    tasks: ['Verify gate is locked at 11:30 PM', 'Log visitor entry at 9:00 PM', 'Daily night patrolling record']
  },
  {
    id: 'staff-3',
    propertyId: 'prop-1',
    fullName: 'Priya Narayanan',
    phone: '+91 97700 45678',
    address: 'Silk Board Layout, Sector 6, Bangalore',
    role: 'Reception Staff',
    shiftTiming: 'Day Shift (09:00 AM - 06:00 PM)',
    joiningDate: '2025-03-01',
    salary: 22000,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    notes: 'Manages walk-in customer requests, emergency host support.',
    tasks: ['Settle invoice for Sneha Reddy', 'Conduct check-in interview for new tenant']
  },
  {
    id: 'staff-4',
    propertyId: 'prop-1',
    fullName: 'Aniket Rawat',
    phone: '+91 91100 22233',
    address: 'Bommanahalli Main Rd, Bangalore',
    role: 'Maintenance Staff',
    shiftTiming: 'Morning Shift (09:00 AM - 05:00 PM)',
    joiningDate: '2025-02-15',
    salary: 20000,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    notes: 'AC servicing and bathroom water pump maintenance specialist.',
    tasks: ['Repair washbasin leak in Room 301', 'Inspect Geyer connection Room 102']
  }
];

// Master store getter/setter
export function initializeSeedData(): void {
  if (!localStorage.getItem('hotel_pg_initialized')) {
    setLocalStorageData('organizations', SEED_ORGANIZATIONS);
    setLocalStorageData('properties', SEED_PROPERTIES);
    setLocalStorageData('rooms', SEED_ROOMS);
    setLocalStorageData('beds', SEED_BEDS);
    setLocalStorageData('tenants', SEED_TENANTS);
    setLocalStorageData('bookings', SEED_BOOKINGS);
    setLocalStorageData('invoices', SEED_INVOICES);
    setLocalStorageData('housekeeping', SEED_HOUSEKEEPING);
    setLocalStorageData('food_menu', SEED_FOOD_MENU);
    setLocalStorageData('visitors', SEED_VISITORS);
    setLocalStorageData('audit_logs', SEED_AUDIT_LOGS);
    setLocalStorageData('notifications', SEED_NOTIFICATIONS);
    setLocalStorageData('staff', SEED_STAFF);
    localStorage.setItem('hotel_pg_initialized', 'true');
    console.log('Hotel & PG system database initialized successfully with comprehensive seed values.');
  }
}
