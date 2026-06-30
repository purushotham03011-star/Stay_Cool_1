from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    logo_url = Column(Text, nullable=True)
    gstin = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    properties = relationship("Property", back_populates="organization", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = "properties"
    id = Column(String(50), primary_key=True, index=True)
    organization_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # 'hotel' | 'pg'
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    active = Column(Boolean, default=True)
    admin_name = Column(String(100), nullable=True)
    admin_email = Column(String(100), nullable=True)
    admin_phone = Column(String(50), nullable=True)
    admin_password = Column(String(100), nullable=True)
    location_link = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    
    _amenities = Column("amenities", Text, nullable=True)
    _rules = Column("rules", Text, nullable=True)
    _locks = Column("locks", Text, nullable=True)


    @property
    def amenities(self):
        import json
        if self._amenities:
            try:
                return json.loads(self._amenities)
            except Exception:
                return []
        return []

    @amenities.setter
    def amenities(self, value):
        import json
        if value is not None:
            self._amenities = json.dumps(value)
        else:
            self._amenities = None

    @property
    def rules(self):
        import json
        if self._rules:
            try:
                return json.loads(self._rules)
            except Exception:
                return []
        return []

    @rules.setter
    def rules(self, value):
        import json
        if value is not None:
            self._rules = json.dumps(value)
        else:
            self._rules = None

    @property
    def locks(self):
        import json
        if self._locks:
            try:
                return json.loads(self._locks)
            except Exception:
                return {}
        return {}

    @locks.setter
    def locks(self, value):
        import json
        if value is not None:
            self._locks = json.dumps(value)
        else:
            self._locks = None


    organization = relationship("Organization", back_populates="properties")
    rooms = relationship("Room", back_populates="property", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(String(50), primary_key=True, index=True)
    property_id = Column(String(50), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String(50), nullable=False)
    floor = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # 'Standard' | 'Deluxe' | 'Suite'
    sharing_type = Column(String(50), nullable=False)  # 'Single' | 'Double' | 'Triple' | 'Dormitory'
    price_daily = Column(Float, default=0.0)
    price_weekly = Column(Float, default=0.0)
    price_monthly = Column(Float, default=0.0)
    status = Column(String(50), default="Available")  # 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning'

    property = relationship("Property", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="room")
    housekeeping = relationship("HousekeepingTask", back_populates="room", cascade="all, delete-orphan")

class Bed(Base):
    __tablename__ = "beds"
    id = Column(String(50), primary_key=True, index=True)
    room_id = Column(String(50), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    bed_number = Column(String(50), nullable=False)
    status = Column(String(50), default="Available")  # 'Available' | 'Occupied'

    room = relationship("Room", back_populates="beds")
    bookings = relationship("Booking", back_populates="bed")

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    parent_name = Column(String(100), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    id_proof_url = Column(Text, nullable=True)
    rent_due = Column(Float, default=0.0)
    password = Column(String(100), nullable=True, default="customer123")
    last_login = Column(String(100), nullable=True)
    last_logout = Column(String(100), nullable=True)
    
    bookings = relationship("Booking", back_populates="tenant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")
    visitors = relationship("Visitor", back_populates="tenant", cascade="all, delete-orphan")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String(50), primary_key=True, index=True)
    property_id = Column(String(50), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=True)
    bed_id = Column(String(50), ForeignKey("beds.id"), nullable=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default="Pending")  # 'Pending' | 'Active' | 'Completed' | 'Cancelled'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    property = relationship("Property", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    bed = relationship("Bed", back_populates="bookings")
    tenant = relationship("Tenant", back_populates="bookings")
    invoices = relationship("Invoice", back_populates="booking", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String(50), primary_key=True, index=True)
    booking_id = Column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String(50), default="Unpaid")  # 'Paid' | 'Unpaid'
    due_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="invoices")
    tenant = relationship("Tenant", back_populates="invoices")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(50), primary_key=True, index=True)
    user_email = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(200), nullable=False)
    module = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip = Column(String(50), nullable=True)

class HousekeepingTask(Base):
    __tablename__ = "housekeeping"
    id = Column(String(50), primary_key=True, index=True)
    room_id = Column(String(50), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    task_description = Column(String(200), nullable=False)
    status = Column(String(50), default="Pending")  # 'Pending' | 'Completed'
    assigned_staff = Column(String(100), nullable=True)
    scheduled_date = Column(Date, nullable=True)

    room = relationship("Room", back_populates="housekeeping")

class FoodMenuItem(Base):
    __tablename__ = "food_menu"
    id = Column(String(50), primary_key=True, index=True)
    day_of_week = Column(String(20), nullable=False)  # 'Monday', 'Tuesday', etc.
    meal_type = Column(String(20), nullable=False)  # 'Breakfast', 'Lunch', 'Dinner'
    menu_description = Column(String(200), nullable=False)

class Visitor(Base):
    __tablename__ = "visitors"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    purpose = Column(String(200), nullable=True)
    entry_time = Column(DateTime, default=datetime.datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    approved = Column(Boolean, default=False)

    tenant = relationship("Tenant", back_populates="visitors")
