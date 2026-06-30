from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

# Organization
class OrganizationBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    id: str

class Organization(OrganizationBase):
    id: str
    class Config:
        from_attributes = True

# Property
class PropertyBase(BaseModel):
    name: str
    type: str  # 'hotel' | 'pg'
    address: Optional[str] = None
    city: Optional[str] = None
    active: bool = True
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    admin_phone: Optional[str] = None
    admin_password: Optional[str] = None
    location_link: Optional[str] = None
    amenities: Optional[List[str]] = None
    rules: Optional[List[str]] = None
    locks: Optional[dict] = None
    image_url: Optional[str] = None


class PropertyCreate(PropertyBase):
    id: str
    organization_id: str

class Property(PropertyBase):
    id: str
    organization_id: str
    class Config:
        from_attributes = True

# Bed
class BedBase(BaseModel):
    bed_number: str
    status: str = "Available"

class BedCreate(BedBase):
    id: str
    room_id: str

class Bed(BedBase):
    id: str
    room_id: str
    class Config:
        from_attributes = True

# Room
class RoomBase(BaseModel):
    room_number: str
    floor: int
    category: str
    sharing_type: str
    price_daily: float = 0.0
    price_weekly: float = 0.0
    price_monthly: float = 0.0
    status: str = "Available"

class RoomCreate(RoomBase):
    id: str
    property_id: str

class Room(RoomBase):
    id: str
    property_id: str
    beds: List[Bed] = []
    class Config:
        from_attributes = True

# Tenant
class TenantBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    emergency_contact: Optional[str] = None
    id_proof_url: Optional[str] = None
    rent_due: float = 0.0
    password: Optional[str] = "customer123"
    last_login: Optional[str] = None
    last_logout: Optional[str] = None

class TenantCreate(TenantBase):
    id: str

class Tenant(TenantBase):
    id: str
    class Config:
        from_attributes = True

# Booking
class BookingBase(BaseModel):
    check_in_date: datetime.date
    check_out_date: datetime.date
    total_amount: float = 0.0
    status: str = "Pending"

class BookingCreate(BookingBase):
    id: str
    property_id: str
    room_id: Optional[str] = None
    bed_id: Optional[str] = None
    tenant_email: str  # Creating booking uses tenant email to lookup/create tenant

class Booking(BookingBase):
    id: str
    property_id: str
    room_id: Optional[str] = None
    bed_id: Optional[str] = None
    tenant_id: str
    created_at: datetime.datetime
    tenant: Optional[Tenant] = None
    class Config:
        from_attributes = True

# Invoice
class InvoiceBase(BaseModel):
    amount: float
    cgst: float = 0.0
    sgst: float = 0.0
    total: float
    status: str = "Unpaid"
    due_date: datetime.date

class InvoiceCreate(InvoiceBase):
    id: str
    booking_id: str
    tenant_id: str

class Invoice(InvoiceBase):
    id: str
    booking_id: str
    tenant_id: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# AuditLog
class AuditLogBase(BaseModel):
    user_email: str
    role: str
    action: str
    module: str
    ip: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    id: str

class AuditLog(AuditLogBase):
    id: str
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

# Housekeeping
class HousekeepingBase(BaseModel):
    task_description: str
    status: str = "Pending"
    assigned_staff: Optional[str] = None
    scheduled_date: Optional[datetime.date] = None

class HousekeepingCreate(HousekeepingBase):
    id: str
    room_id: str

class Housekeeping(HousekeepingBase):
    id: str
    room_id: str
    class Config:
        from_attributes = True

# FoodMenu
class FoodMenuBase(BaseModel):
    day_of_week: str
    meal_type: str
    menu_description: str

class FoodMenuCreate(FoodMenuBase):
    id: str

class FoodMenu(FoodMenuBase):
    id: str
    class Config:
        from_attributes = True

# Visitor
class VisitorBase(BaseModel):
    name: str
    phone: Optional[str] = None
    purpose: Optional[str] = None
    exit_time: Optional[datetime.datetime] = None
    approved: bool = False

class VisitorCreate(VisitorBase):
    id: str
    tenant_id: str

class Visitor(VisitorBase):
    id: str
    tenant_id: str
    entry_time: datetime.datetime
    class Config:
        from_attributes = True
