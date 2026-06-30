import React from 'react';
import { Property, Room, Booking, Tenant } from '../types';
import { Badge } from './Badge';
import { 
  Building2, 
  MapPin, 
  ArrowUpRight, 
  Bed, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Briefcase 
} from 'lucide-react';

// 1. HOTEL/PROPERTY CARD
export interface HotelCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  className?: string;
  badge?: React.ReactNode;
}

export const HotelCard: React.FC<HotelCardProps> = ({ property, onSelect, className = '', badge }) => {
  return (
    <div className={`group bg-white rounded-2xl border border-slate-150 p-4 shadow-xs transition hover:shadow-md hover:border-slate-300 md:p-5 flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100 p-2.5 rounded-xl text-indigo-600 group-hover:scale-105 transition-all">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 tracking-tight group-hover:text-indigo-600 transition">
                {property.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {property.type === 'PG' ? 'Co-living PG Asset' : 'Luxury Hotel Complex'}
              </span>
            </div>
          </div>
          {badge || (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide border ${
              property.type === 'Hotel' ? 'bg-cyan-50 text-cyan-700 border-cyan-150' : 'bg-emerald-50 text-emerald-700 border-emerald-150'
            }`}>
              {property.type}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-650 space-y-1.5 border-t border-slate-100 pt-2.5">
          <div className="flex items-start space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight text-slate-500">{property.address}, <strong className="text-slate-800">{property.city}</strong></span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total active units in state ledger: <strong className="text-slate-800 font-bold">{property.totalRooms || 12} rooms</strong>
          </p>
        </div>

        {property.amenities && (
          <div className="flex flex-wrap gap-1 pt-1.5">
            {property.amenities.slice(0, 3).map((am, i) => (
              <span key={i} className="bg-slate-50 border text-slate-550 px-2 py-0.5 rounded text-[10px] uppercase font-mono max-w-[120px] truncate">
                {am}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[9px] text-slate-400 font-bold px-1.5 pt-0.5">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(property)}
          className="mt-4 w-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
        >
          <span>Configure Rooms</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// 2. ROOM CARD
export interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  className?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-150 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between ${className}`}>
      <div className="space-y-3.5">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 font-display">Room {room.roomNumber}</h4>
            <span className="text-[10px] text-slate-400 font-mono">Floor {room.floor} &bull; {room.type}</span>
          </div>
          <Badge type={room.occupancyStatus === 'Available' ? 'Available' : room.occupancyStatus === 'Full' ? 'Occupied' : 'Maintenance'} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block">Monthly Billing</span>
            <span className="font-extrabold text-slate-950 font-mono text-xs">₹{room.pricePerMonth.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block">Daily Tariff</span>
            <span className="font-extrabold text-slate-950 font-mono text-xs">₹{room.pricePerDay.toLocaleString()}</span>
          </div>
        </div>

        {room.amenities && (
          <div className="flex flex-wrap gap-1 pt-1">
            {room.amenities.map((am, i) => (
              <span key={i} className="text-[10px] bg-slate-50 border text-slate-500 px-2 py-0.5 rounded-md font-mono">
                {am}
              </span>
            ))}
          </div>
        )}
      </div>

      {onEdit && (
        <button
          onClick={() => onEdit(room)}
          className="mt-3.5 w-full bg-slate-50 hover:bg-slate-100 border text-slate-700 font-bold py-1.5 px-3 rounded-lg text-xs transition"
        >
          View Assets & Occupants
        </button>
      )}
    </div>
  );
};

// 3. BOOKING CARD
export interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (id: string, nextStatus: Booking['status']) => void;
  className?: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusChange, className = '' }) => {
  const statusColors = {
    Pending: 'bg-amber-50 text-amber-800 border-amber-200',
    Confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Completed: 'bg-indigo-50 text-indigo-800 border-indigo-250',
    Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-150 p-4 shadow-xs space-y-3.5 hover:shadow-md transition ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 font-display">{booking.customerName}</h4>
          <span className="text-[10px] text-indigo-600 font-bold tracking-tight inline-flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-indigo-400" />
            {booking.propertyName}
          </span>
        </div>
        <span className={`px-2 py-0.5 border text-[10px] font-black rounded-md ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      <div className="text-xs text-slate-650 space-y-1.5 border-t border-slate-100 pt-2.5">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{booking.customerPhone}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]" title={booking.customerEmail}>{booking.customerEmail}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 pt-1 border-t border-dashed">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded-xl border flex justify-between items-center">
        <div>
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Billable</span>
          <span className="text-xs font-black font-mono text-slate-900">₹{booking.totalAmount.toLocaleString()}</span>
        </div>
        
        {booking.status === 'Pending' && onStatusChange && (
          <div className="flex space-x-1">
            <button
              onClick={() => onStatusChange(booking.id, 'Confirmed')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px]"
            >
              Confirm
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'Cancelled')}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-2 py-1 rounded text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. TENANT/CO-LIVING RESIDENT CARD
export interface TenantCardProps {
  tenant: Tenant;
  onCheckOut?: (tenant: Tenant) => void;
  className?: string;
}

export const TenantCard: React.FC<TenantCardProps> = ({ tenant, onCheckOut, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-150 p-4.5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-50 border text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm">
            {tenant.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-display leading-tight">{tenant.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono block">Bed {tenant.bedNumber || 'Unassigned'} &bull; Room {tenant.roomNumber || 'None'}</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Operational Complex:</span>
            <span className="font-semibold text-slate-800">{tenant.propertyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Resident Email:</span>
            <span className="font-mono text-slate-850">{tenant.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Joined StayHub:</span>
            <span className="font-medium">{new Date(tenant.joinedDate).toLocaleDateString()}</span>
          </div>
          {tenant.bloodGroup && (
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Blood Group:</span>
              <span className="text-rose-600 font-bold font-mono">{tenant.bloodGroup}</span>
            </div>
          )}
        </div>
      </div>

      {tenant.status === 'Active' && onCheckOut && (
        <button
          onClick={() => onCheckOut(tenant)}
          className="mt-3.5 w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Authorize Secure Check-Out
        </button>
      )}
    </div>
  );
};

// 5. ANALYTICS CARD
export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'primary',
  className = '',
}) => {
  const badgeColors = {
    primary: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    warning: 'bg-amber-50 border-amber-100 text-amber-600',
    danger: 'bg-rose-50 border-rose-100 text-rose-600',
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-150 p-4 shadow-xs flex justify-between items-start hover:shadow-md transition ${className}`}>
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
          {title}
        </span>
        <h3 className="text-xl font-bold font-display text-slate-900 leading-tight">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center space-x-1">
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-550" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className={`text-[11px] font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
              {trend.value}
            </span>
            <span className="text-[10px] text-slate-400">vs last month</span>
          </div>
        )}
        {!trend && description && (
          <p className="text-[11px] text-slate-400 font-medium">
            {description}
          </p>
        )}
      </div>

      {icon && (
        <div className={`p-3 rounded-xl border ${badgeColors[variant]}`}>
          {icon}
        </div>
      )}
    </div>
  );
};
