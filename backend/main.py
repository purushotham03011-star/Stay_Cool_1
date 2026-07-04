from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
from typing import List

import models
import schemas
from database import get_db, init_db

# Initialize database schema
init_db()

app = FastAPI(title="StayHub API", description="FastAPI Backend for StayHub Hotel & PG Management System")

# Configure CORS for frontend access (Ionic Web/Capacitor/Vite dev endpoints)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Support local testing from any origin or native apps
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to generate clean IDs
def make_id(prefix: str) -> str:
    import uuid
    return f"{prefix}-{str(uuid.uuid4())[:8]}"

# --- AUDIT LOGS ---
@app.get("/api/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

@app.post("/api/audit-logs", response_model=schemas.AuditLog)
def create_audit_log(log: schemas.AuditLogBase, db: Session = Depends(get_db)):
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email=log.user_email,
        role=log.role,
        action=log.action,
        module=log.module,
        ip=log.ip or "127.0.0.1",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# --- ORGANIZATIONS ---
@app.get("/api/organizations", response_model=List[schemas.Organization])
def get_organizations(db: Session = Depends(get_db)):
    return db.query(models.Organization).all()

@app.post("/api/organizations", response_model=schemas.Organization)
def create_or_update_organization(org: schemas.OrganizationCreate, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org.id).first()
    if db_org:
        db_org.name = org.name
        db_org.logo_url = org.logo_url
        db_org.gstin = org.gstin
        db_org.address = org.address
    else:
        db_org = models.Organization(
            id=org.id,
            name=org.name,
            logo_url=org.logo_url,
            gstin=org.gstin,
            address=org.address
        )
        db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

# --- PROPERTIES ---
@app.get("/api/properties", response_model=List[schemas.Property])
def get_properties(db: Session = Depends(get_db)):
    return db.query(models.Property).all()

@app.post("/api/properties", response_model=schemas.Property)
def create_property(prop: schemas.PropertyCreate, db: Session = Depends(get_db)):
    # Check if organization exists, if not create a placeholder one for integrity
    db_org = db.query(models.Organization).filter(models.Organization.id == prop.organization_id).first()
    if not db_org:
        db_org = models.Organization(id=prop.organization_id, name="Corporate Franchise Parent")
        db.add(db_org)
        db.commit()

    db_prop = db.query(models.Property).filter(models.Property.id == prop.id).first()
    if db_prop:
        db_prop.organization_id = prop.organization_id
        db_prop.name = prop.name
        db_prop.type = prop.type
        db_prop.address = prop.address
        db_prop.city = prop.city
        db_prop.active = prop.active
        db_prop.admin_name = prop.admin_name
        db_prop.admin_email = prop.admin_email
        db_prop.admin_phone = prop.admin_phone
        db_prop.admin_password = prop.admin_password
        db_prop.admin_id = prop.admin_id
        db_prop.location_link = prop.location_link
        db_prop.image_url = prop.image_url
        db_prop.amenities = prop.amenities
        db_prop.rules = prop.rules
        db_prop.locks = prop.locks
        db_prop.images = prop.images
        db_prop.status = prop.status
    else:
        db_prop = models.Property(
            id=prop.id,
            organization_id=prop.organization_id,
            name=prop.name,
            type=prop.type,
            address=prop.address,
            city=prop.city,
            active=prop.active,
            admin_name=prop.admin_name,
            admin_email=prop.admin_email,
            admin_phone=prop.admin_phone,
            admin_password=prop.admin_password,
            admin_id=prop.admin_id,
            location_link=prop.location_link,
            image_url=prop.image_url,
            amenities=prop.amenities,
            rules=prop.rules,
            locks=prop.locks,
            images=prop.images,
            status=prop.status
        )

        db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

@app.patch("/api/properties/{id}", response_model=schemas.Property)
def toggle_property(id: str, active: bool, db: Session = Depends(get_db)):
    db_prop = db.query(models.Property).filter(models.Property.id == id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db_prop.active = active
    db.commit()
    db.refresh(db_prop)
    return db_prop

# --- ROOMS & BEDS ---
@app.get("/api/rooms", response_model=List[schemas.Room])
def get_rooms(property_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Room)
    if property_id:
        query = query.filter(models.Room.property_id == property_id)
    return query.all()

@app.post("/api/rooms", response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = models.Room(
        id=room.id,
        property_id=room.property_id,
        room_number=room.room_number,
        floor=room.floor,
        category=room.category,
        sharing_type=room.sharing_type,
        price_daily=room.price_daily,
        price_weekly=room.price_weekly,
        price_seasonal=room.price_seasonal,
        price_monthly=room.price_monthly,
        status=room.status
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@app.post("/api/beds", response_model=schemas.Bed)
def create_bed(bed: schemas.BedCreate, db: Session = Depends(get_db)):
    db_bed = models.Bed(
        id=bed.id,
        room_id=bed.room_id,
        bed_number=bed.bed_number,
        status=bed.status
    )
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    return db_bed

# --- TENANTS ---
@app.get("/api/tenants", response_model=List[schemas.Tenant])
def get_tenants(db: Session = Depends(get_db)):
    return db.query(models.Tenant).all()

@app.get("/api/tenants/{email}", response_model=schemas.Tenant)
def get_tenant_by_email(email: str, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.email == email).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return db_tenant

@app.post("/api/tenants", response_model=schemas.Tenant)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.email == tenant.email).first()
    if db_tenant:
        # Update existing record
        db_tenant.name = tenant.name
        db_tenant.phone = tenant.phone
        db_tenant.parent_name = tenant.parent_name
        db_tenant.emergency_contact = tenant.emergency_contact
        db_tenant.id_proof_url = tenant.id_proof_url
        if tenant.password:
            db_tenant.password = tenant.password
        if tenant.last_login:
            db_tenant.last_login = tenant.last_login
        if tenant.last_logout:
            db_tenant.last_logout = tenant.last_logout
    else:
        db_tenant = models.Tenant(
            id=tenant.id,
            name=tenant.name,
            email=tenant.email,
            phone=tenant.phone,
            parent_name=tenant.parent_name,
            emergency_contact=tenant.emergency_contact,
            id_proof_url=tenant.id_proof_url,
            rent_due=tenant.rent_due,
            password=tenant.password,
            last_login=tenant.last_login,
            last_logout=tenant.last_logout
        )
        db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

# --- BOOKINGS (Relational Synergy Core) ---
@app.get("/api/bookings", response_model=List[schemas.Booking])
def get_bookings(property_id: str = None, status: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Booking)
    if property_id:
        query = query.filter(models.Booking.property_id == property_id)
    if status:
        query = query.filter(models.Booking.status == status)
    return query.order_by(models.Booking.created_at.desc()).all()

@app.post("/api/bookings", response_model=schemas.Booking)
def create_booking_request(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # 1. Lookup or create a placeholder tenant profile using email
    db_tenant = db.query(models.Tenant).filter(models.Tenant.email == booking.tenant_email).first()
    if not db_tenant:
        db_tenant = models.Tenant(
            id=make_id("tenant"),
            name=booking.tenant_email.split("@")[0].capitalize(),
            email=booking.tenant_email,
            phone="+91 99999 88888"
        )
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)

    # 2. Add Booking Request
    db_booking = models.Booking(
        id=booking.id,
        property_id=booking.property_id,
        room_id=booking.room_id,
        bed_id=booking.bed_id,
        tenant_id=db_tenant.id,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        total_amount=booking.total_amount,
        status="Pending",
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.post("/api/bookings/{id}/approve", response_model=schemas.Booking)
def approve_booking(id: str, room_id: str, bed_id: str, cgst_rate: float = 9.0, sgst_rate: float = 9.0, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    # Verify room and bed are available
    db_bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if not db_bed or db_bed.status == "Occupied":
        raise HTTPException(status_code=400, detail="Target sleeping bed is not available.")

    # 1. Assign inventory
    db_booking.room_id = room_id
    db_booking.bed_id = bed_id
    db_booking.status = "Active"

    # 2. Lock bed resource
    db_bed.status = "Occupied"

    # 3. Check if all beds in room are occupied to toggle room state
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room:
        total_beds = db.query(models.Bed).filter(models.Bed.room_id == room_id).count()
        occupied_beds = db.query(models.Bed).filter(models.Bed.room_id == room_id, models.Bed.status == "Occupied").count()
        if occupied_beds >= total_beds:
            db_room.status = "Occupied"
        else:
            db_room.status = "Reserved"

    # 4. Generate Auto Invoice (Module 6)
    subtotal = db_booking.total_amount
    cgst = round(subtotal * (cgst_rate / 100.0), 2)  # Dynamic CGST Surcharge
    sgst = round(subtotal * (sgst_rate / 100.0), 2)  # Dynamic SGST Surcharge
    total_taxed = subtotal + cgst + sgst

    db_invoice = models.Invoice(
        id=make_id("invoice"),
        booking_id=db_booking.id,
        tenant_id=db_booking.tenant_id,
        amount=subtotal,
        cgst=cgst,
        sgst=sgst,
        total=total_taxed,
        status="Unpaid",
        due_date=datetime.date.today() + datetime.timedelta(days=5),
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_invoice)

    # 5. Add audit log
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email="manager@stayhub.co",
        role="Admin",
        action=f"Approved booking {id} & allocated bed {db_bed.bed_number} in Room {db_room.room_number}",
        module="Rooms"
    )
    db.add(db_log)

    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.post("/api/bookings/{id}/checkout", response_model=schemas.Booking)
def process_checkout(id: str, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Active booking not found")

    # Release sleeping bed
    if db_booking.bed_id:
        db_bed = db.query(models.Bed).filter(models.Bed.id == db_booking.bed_id).first()
        if db_bed:
            db_bed.status = "Available"

    # Update room status
    if db_booking.room_id:
        db_room = db.query(models.Room).filter(models.Room.id == db_booking.room_id).first()
        if db_room:
            # Shift room status back to available or cleaning
            db_room.status = "Cleaning"

    # Complete booking
    db_booking.status = "Completed"

    # Add audit log
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email="manager@stayhub.co",
        role="Admin",
        action=f"Processed Checkout for booking {id} & released inventory slots",
        module="Tenants"
    )
    db.add(db_log)

    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.post("/api/bookings/{id}/reject", response_model=schemas.Booking)
def reject_booking(id: str, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    db_booking.status = "Rejected"

    # Add audit log
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email="manager@stayhub.co",
        role="Admin",
        action=f"Rejected booking request {id}",
        module="Bookings"
    )
    db.add(db_log)

    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.post("/api/bookings/{id}/cancel", response_model=schemas.Booking)
def cancel_booking(id: str, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    db_booking.status = "Cancelled"

    # Release sleeping bed if it was allocated
    if db_booking.bed_id:
        db_bed = db.query(models.Bed).filter(models.Bed.id == db_booking.bed_id).first()
        if db_bed:
            db_bed.status = "Available"

    # Update room status
    if db_booking.room_id:
        db_room = db.query(models.Room).filter(models.Room.id == db_booking.room_id).first()
        if db_room:
            db_room.status = "Available"

    # Add audit log
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email="guest@stayhub.co",
        role="Customer",
        action=f"Cancelled booking {id}",
        module="Bookings"
    )
    db.add(db_log)

    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.post("/api/bookings/{id}/shift", response_model=schemas.Booking)
def shift_booking_bed(id: str, room_id: str, bed_id: str, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Active booking not found")

    old_room_id = db_booking.room_id

    # Release old bed if allocated
    if db_booking.bed_id:
        old_bed = db.query(models.Bed).filter(models.Bed.id == db_booking.bed_id).first()
        if old_bed:
            old_bed.status = "Available"

    # Verify new bed is available
    new_bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if not new_bed:
         raise HTTPException(status_code=404, detail="Target bed not found.")
    new_bed.status = "Occupied"

    # Assign new room and bed
    db_booking.room_id = room_id
    db_booking.bed_id = bed_id

    # Update old and new rooms statuses
    for rid in {room_id, old_room_id}:
        if rid:
            db_room = db.query(models.Room).filter(models.Room.id == rid).first()
            if db_room:
                total = db.query(models.Bed).filter(models.Bed.room_id == rid).count()
                occupied = db.query(models.Bed).filter(models.Bed.room_id == rid, models.Bed.status == "Occupied").count()
                if occupied == 0:
                    db_room.status = "Available"
                elif occupied >= total:
                    db_room.status = "Full"
                else:
                    db_room.status = "Available"

    # Add audit log
    db_log = models.AuditLog(
        id=make_id("log"),
        user_email="manager@stayhub.co",
        role="Admin",
        action=f"Shifted booking {id} to bed {new_bed.bed_number} in Room Room {room_id}",
        module="Rooms"
    )
    db.add(db_log)

    db.commit()
    db.refresh(db_booking)
    return db_booking


# --- INVOICES & BILLING ---
@app.get("/api/invoices", response_model=List[schemas.Invoice])
def get_invoices(tenant_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Invoice)
    if tenant_id:
        query = query.filter(models.Invoice.tenant_id == tenant_id)
    return query.order_by(models.Invoice.created_at.desc()).all()

@app.post("/api/invoices", response_model=schemas.Invoice)
def create_manual_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = models.Invoice(
        id=invoice.id,
        booking_id=invoice.booking_id,
        tenant_id=invoice.tenant_id,
        amount=invoice.amount,
        cgst=invoice.cgst,
        sgst=invoice.sgst,
        total=invoice.total,
        status=invoice.status,
        due_date=invoice.due_date,
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_invoice)
    
    # Add rent due to tenant total
    db_tenant = db.query(models.Tenant).filter(models.Tenant.id == invoice.tenant_id).first()
    if db_tenant and invoice.status == "Unpaid":
        db_tenant.rent_due += invoice.total

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.post("/api/invoices/{id}/pay", response_model=schemas.Invoice)
def pay_invoice(id: str, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if db_invoice.status == "Unpaid":
        db_invoice.status = "Paid"
        
        # Subtract rent due from tenant total
        db_tenant = db.query(models.Tenant).filter(models.Tenant.id == db_invoice.tenant_id).first()
        if db_tenant:
            db_tenant.rent_due = max(0.0, db_tenant.rent_due - db_invoice.total)

        db_log = models.AuditLog(
            id=make_id("log"),
            user_email="customer@stayhub.co",
            role="Customer",
            action=f"Settled invoice bill payment of ₹{db_invoice.total}",
            module="Billing"
        )
        db.add(db_log)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# --- HOUSEKEEPING ---
@app.get("/api/housekeeping", response_model=List[schemas.Housekeeping])
def get_housekeeping_tasks(db: Session = Depends(get_db)):
    return db.query(models.HousekeepingTask).all()

@app.post("/api/housekeeping", response_model=schemas.Housekeeping)
def create_housekeeping_task(task: schemas.HousekeepingCreate, db: Session = Depends(get_db)):
    db_task = models.HousekeepingTask(
        id=task.id,
        room_id=task.room_id,
        task_description=task.task_description,
        status=task.status,
        assigned_staff=task.assigned_staff,
        scheduled_date=task.scheduled_date or datetime.date.today()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.patch("/api/housekeeping/{id}", response_model=schemas.Housekeeping)
def toggle_housekeeping_status(id: str, status: str, db: Session = Depends(get_db)):
    db_task = db.query(models.HousekeepingTask).filter(models.HousekeepingTask.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.status = status
    
    # If completed, toggle room cleaning status back to Available
    if status == "Completed" and db_task.room_id:
        db_room = db.query(models.Room).filter(models.Room.id == db_task.room_id).first()
        if db_room and db_room.status == "Cleaning":
            db_room.status = "Available"

    db.commit()
    db.refresh(db_task)
    return db_task

# --- FOOD MENU ---
@app.get("/api/food-menu", response_model=List[schemas.FoodMenu])
def get_food_menu(db: Session = Depends(get_db)):
    return db.query(models.FoodMenuItem).all()

@app.put("/api/food-menu", response_model=List[schemas.FoodMenu])
def update_food_menu(items: List[schemas.FoodMenuCreate], db: Session = Depends(get_db)):
    # Clear previous menu to update
    db.query(models.FoodMenuItem).delete()
    db_items = []
    for it in items:
        db_item = models.FoodMenuItem(
            id=it.id,
            day_of_week=it.day_of_week,
            meal_type=it.meal_type,
            menu_description=it.menu_description
        )
        db.add(db_item)
        db_items.append(db_item)
    db.commit()
    return db_items

# --- VISITORS ---
@app.get("/api/visitors", response_model=List[schemas.Visitor])
def get_visitors(db: Session = Depends(get_db)):
    return db.query(models.Visitor).order_by(models.Visitor.entry_time.desc()).all()

@app.post("/api/visitors", response_model=schemas.Visitor)
def register_visitor(visitor: schemas.VisitorCreate, db: Session = Depends(get_db)):
    db_visitor = models.Visitor(
        id=visitor.id,
        name=visitor.name,
        phone=visitor.phone,
        tenant_id=visitor.tenant_id,
        purpose=visitor.purpose,
        entry_time=datetime.datetime.utcnow(),
        approved=visitor.approved
    )
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

@app.patch("/api/visitors/{id}/approve", response_model=schemas.Visitor)
def approve_visitor(id: str, db: Session = Depends(get_db)):
    db_visitor = db.query(models.Visitor).filter(models.Visitor.id == id).first()
    if not db_visitor:
        raise HTTPException(status_code=404, detail="Visitor log not found")
    db_visitor.approved = True
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

@app.patch("/api/visitors/{id}/exit", response_model=schemas.Visitor)
def log_visitor_exit(id: str, db: Session = Depends(get_db)):
    db_visitor = db.query(models.Visitor).filter(models.Visitor.id == id).first()
    if not db_visitor:
        raise HTTPException(status_code=404, detail="Visitor log not found")
    db_visitor.exit_time = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

@app.delete("/api/properties/{property_id}")
def delete_property_endpoint(property_id: str, db: Session = Depends(get_db)):
    db_prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(db_prop)
    db.commit()
    return {"message": "Property deleted successfully"}

@app.delete("/api/tenants/{tenant_id}")
def delete_tenant_endpoint(tenant_id: str, db: Session = Depends(get_db)):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(db_tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}
