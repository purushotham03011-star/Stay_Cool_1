export interface Organization {
  id: string;
  name: string;
  domain: string;
  registeredAt: string;
  contactEmail: string;
  status: 'Active' | 'Suspended';
}

export interface Property {
  id: string;
  name: string;
  type: 'Hotel' | 'PG';
  city: string;
  address: string;
  totalRooms: number;
  amenities: string[];
  rules: string[];
  orgId: string;
  
  // Admin credentials & details
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  adminPassword?: string;
  adminId?: string;

  
  // Classification & branding
  classification?: string;
  imageUrl?: string;
  
  // Address breakdown
  state?: string;
  district?: string;
  pincode?: string;
  area?: string;
  street?: string;
  houseNumber?: string;
  
  // Administrative control locks
  locks?: Record<string, boolean>;
  status?: 'Active' | 'Suspended';
  locationLink?: string;

  // Campaign & Discounts
  discountType?: 'all' | 'custom';
  discountPercentage?: number;
  campaignText?: string;
  images?: string[];
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: 'Single' | 'Double' | 'Triple' | 'Four-Sharing';
  pricePerMonth: number;
  pricePerDay: number;
  priceWeekly?: number;
  priceSeasonal?: number;
  amenities: string[];
  occupancyStatus: 'Available' | 'Full' | 'Maintenance';
  discountPercentage?: number;
}

export interface Bed {
  id: string;
  roomId: string;
  roomNumber: string; // denormalized for search simplicity
  bedNumber: string; // e.g. "A", "B", "C"
  isOccupied: boolean;
  occupantTenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  docUrl?: string;
  docType?: 'Aadhaar' | 'Passport' | 'Driving License';
  roomNumber?: string;
  roomId?: string;
  bedNumber?: string;
  bedId?: string;
  propertyId: string;
  propertyName: string;
  status: 'Active' | 'Checked-Out' | 'Incoming';
  joinedDate: string;
  password?: string;
  lastLogin?: string;
  lastLogout?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  roomId?: string;
  roomNumber?: string;
  bedId?: string;
  bedNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  mealPlan: 'None' | 'Breakfast Only' | 'Full Board';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  totalAmount: number;
  notes?: string;
  bookingDate: string;
  paymentMethod?: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  requestedRoomType?: 'Single' | 'Double' | 'Triple' | 'Four-Sharing';
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  month: string; // e.g., "May 2026"
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  generatedAt: string;
  type: 'Rent' | 'Electricity' | 'Food' | 'Penalty';
  paymentMethod?: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  paidAt?: string;
}

export interface HousekeepingTask {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  assignedStaff: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface FoodMenuDay {
  id: string;
  propertyId: string;
  day: string; // e.g., "Monday", "Tuesday"
  breakfast: string;
  lunch: string;
  dinner: string;
  attendanceBreakfast: number;
  attendanceLunch: number;
  attendanceDinner: number;
}

export interface VisitorRecord {
  id: string;
  propertyId: string;
  visitorName: string;
  phone: string;
  purpose: string;
  hostTenantId: string;
  hostTenantName: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  role: 'Super Admin' | 'Admin' | 'Customer';
  action: string;
  module: 'Rooms' | 'Tenants' | 'Billing' | 'SuperAdmin' | 'Bookings' | 'Housekeeping' | 'Food' | 'Visitor';
  timestamp: string;
  ip: string;
}

export interface Notification {
  id: string;
  userId: string; // email or tenantId
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'Alert' | 'Success' | 'Billing';
}

export interface Staff {
  id: string;
  propertyId: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'Watchman' | 'Cleaning Staff' | 'Reception Staff' | 'Maintenance Staff' | 'Other Staff';
  shiftTiming: string;
  joiningDate: string;
  salary?: number;
  status: 'Active' | 'Inactive';
  profilePhoto?: string;
  notes?: string;
  tasks?: string[];
}

export interface QueryMessage {
  id: string;
  type: 'customer' | 'admin';
  senderName: string;
  senderEmail: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  replies: {
    sender: 'Super Admin' | 'Admin';
    message: string;
    timestamp: string;
  }[];
  propertyId?: string;
}
