import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
import models

def seed_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.Organization).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding database...")

        # 1. Organizations
        org1 = models.Organization(id='org-1', name='Homely Stays Group', logo_url='https://images.unsplash.com/photo-1542838132-92c53300491e?w=120', gstin='29AAACH1234F1Z5', address='Bangalore Head Office')
        org2 = models.Organization(id='org-2', name='Apex Hospitality Inc', logo_url='', gstin='27BBBCI9876A2X8', address='Mumbai Regional Office')
        db.add_all([org1, org2])
        db.commit()

        # 2. Properties
        p1 = models.Property(id='prop-1', organization_id='org-1', name='Silicon Valley Elite PG', type='PG', address='Plot 42, 100 Feet Rd, HSR Layout Sector 2, Bangalore - 560102', city='Bangalore', active=True)
        p2 = models.Property(id='prop-2', organization_id='org-1', name='The Grand Residency Hotel', type='Hotel', address='Near DLF Cyber City, Gachibowli, Hyderabad - 500032', city='Hyderabad', active=True)
        p3 = models.Property(id='prop-3', organization_id='org-2', name='Graceful Living Co-Living', type='PG', address='Floor 3, Sunshine Towers, Senapati Bapat Marg, Lower Parel, Mumbai - 400013', city='Mumbai', active=True)
        db.add_all([p1, p2, p3])
        db.commit()

        # 3. Rooms
        rooms = [
            # Silicon Valley PG
            models.Room(id='room-101', property_id='prop-1', room_number='101', floor=1, category='Standard', sharing_type='Single', price_daily=800, price_weekly=4800, price_monthly=18000, status='Available'),
            models.Room(id='room-102', property_id='prop-1', room_number='102', floor=1, category='Standard', sharing_type='Double', price_daily=500, price_weekly=3000, price_monthly=11000, status='Available'),
            models.Room(id='room-201', property_id='prop-1', room_number='201', floor=2, category='Deluxe', sharing_type='Double', price_daily=550, price_weekly=3300, price_monthly=11500, status='Occupied'),
            models.Room(id='room-202', property_id='prop-1', room_number='202', floor=2, category='Standard', sharing_type='Triple', price_daily=400, price_weekly=2400, price_monthly=8500, status='Available'),
            models.Room(id='room-301', property_id='prop-1', room_number='301', floor=3, category='Standard', sharing_type='Dormitory', price_daily=300, price_weekly=1800, price_monthly=6500, status='Available'),
            models.Room(id='room-302', property_id='prop-1', room_number='302', floor=3, category='Standard', sharing_type='Single', price_daily=750, price_weekly=4500, price_monthly=16500, status='Maintenance'),
            
            # Grand Residency Hotel
            models.Room(id='room-h101', property_id='prop-2', room_number='101', floor=1, category='Suite', sharing_type='Single', price_daily=2200, price_weekly=15000, price_monthly=45000, status='Available'),
            models.Room(id='room-h102', property_id='prop-2', room_number='102', floor=1, category='Deluxe', sharing_type='Double', price_daily=3000, price_weekly=20000, price_monthly=60000, status='Occupied'),
            models.Room(id='room-h201', property_id='prop-2', room_number='201', floor=2, category='Deluxe', sharing_type='Double', price_daily=3200, price_weekly=22000, price_monthly=65000, status='Available')
        ]
        db.add_all(rooms)
        db.commit()

        # 4. Beds
        beds = [
            models.Bed(id='bed-101-a', room_id='room-101', bed_number='A', status='Available'),
            models.Bed(id='bed-102-a', room_id='room-102', bed_number='A', status='Occupied'),
            models.Bed(id='bed-102-b', room_id='room-102', bed_number='B', status='Available'),
            models.Bed(id='bed-201-a', room_id='room-201', bed_number='A', status='Occupied'),
            models.Bed(id='bed-201-b', room_id='room-201', bed_number='B', status='Occupied'),
            models.Bed(id='bed-202-a', room_id='room-202', bed_number='A', status='Occupied'),
            models.Bed(id='bed-202-b', room_id='room-202', bed_number='B', status='Available'),
            models.Bed(id='bed-202-c', room_id='room-202', bed_number='C', status='Available'),
            models.Bed(id='bed-301-a', room_id='room-301', bed_number='A', status='Available'),
            models.Bed(id='bed-301-b', room_id='room-301', bed_number='B', status='Available'),
            models.Bed(id='bed-301-c', room_id='room-301', bed_number='C', status='Available'),
            models.Bed(id='bed-301-d', room_id='room-301', bed_number='D', status='Available'),
            models.Bed(id='bed-h101-a', room_id='room-h101', bed_number='A', status='Available'),
            models.Bed(id='bed-h102-a', room_id='room-h102', bed_number='A', status='Occupied')
        ]
        db.add_all(beds)
        db.commit()

        # 5. Tenants
        tenants = [
            models.Tenant(id='tenant-1', name='Aditya Sharma', email='aditya.sharma@example.com', phone='+91 98765 43210', parent_name='Rajesh Sharma', emergency_contact='+91 98765 43219', id_proof_url='https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', rent_due=0.0, password='customer123'),
            models.Tenant(id='tenant-2', name='Priya Patel', email='priya.patel@example.com', phone='+91 87654 32109', parent_name='Mehta Patel', emergency_contact='+91 87654 00000', id_proof_url='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', rent_due=11000.0, password='customer123'),
            models.Tenant(id='tenant-3', name='Rohan Verma', email='rohan.v@example.com', phone='+91 76543 21098', parent_name='Sanjay Verma', emergency_contact='+91 76543 99999', id_proof_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', rent_due=11500.0, password='customer123'),
            models.Tenant(id='tenant-4', name='Sneha Reddy', email='sneha.reddy@example.com', phone='+91 99887 76655', parent_name='Govinda Reddy', emergency_contact='+91 99887 44444', id_proof_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', rent_due=0.0, password='customer123'),
            models.Tenant(id='tenant-5', name='Michael Scott', email='michael.dunder@example.com', phone='+1 570 555 1212', parent_name='Dwight Schrute', emergency_contact='+1 570 555 1313', id_proof_url='https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', rent_due=0.0, password='customer123')
        ]
        db.add_all(tenants)
        db.commit()

        # 6. Bookings
        bookings = [
            models.Booking(id='booking-101', property_id='prop-1', room_id='room-101', bed_id='bed-101-a', tenant_id='tenant-1', check_in_date=datetime.date(2026, 6, 1), check_out_date=datetime.date(2026, 11, 30), total_amount=112000, status='Active', created_at=datetime.datetime(2026, 5, 20)),
            models.Booking(id='booking-202', property_id='prop-2', room_id='room-h201', bed_id=None, tenant_id='tenant-3', check_in_date=datetime.date(2026, 5, 28), check_out_date=datetime.date(2026, 6, 2), total_amount=16000, status='Pending', created_at=datetime.datetime(2026, 5, 23)),
            models.Booking(id='booking-203', property_id='prop-1', room_id='room-102', bed_id=None, tenant_id='tenant-2', check_in_date=datetime.date(2026, 6, 5), check_out_date=datetime.date(2026, 7, 5), total_amount=11500, status='Pending', created_at=datetime.datetime(2026, 5, 25)),
            models.Booking(id='booking-303', property_id='prop-1', room_id='room-102', bed_id='bed-102-b', tenant_id='tenant-4', check_in_date=datetime.date(2026, 5, 15), check_out_date=datetime.date(2026, 5, 20), total_amount=2500, status='Completed', created_at=datetime.datetime(2026, 5, 2))
        ]
        db.add_all(bookings)
        db.commit()

        # 7. Invoices
        invoices = [
            models.Invoice(id='inv-1001', booking_id='booking-101', tenant_id='tenant-1', amount=11500, cgst=1035, sgst=1035, total=11500, status='Paid', due_date=datetime.date(2026, 5, 5), created_at=datetime.datetime(2026, 5, 1)),
            models.Invoice(id='inv-1002', booking_id='booking-203', tenant_id='tenant-2', amount=11000, cgst=990, sgst=990, total=11000, status='Unpaid', due_date=datetime.date(2026, 5, 5), created_at=datetime.datetime(2026, 5, 1)),
            models.Invoice(id='inv-1003', booking_id='booking-203', tenant_id='tenant-3', amount=11500, cgst=1035, sgst=1035, total=11500, status='Unpaid', due_date=datetime.date(2026, 5, 5), created_at=datetime.datetime(2026, 5, 1)),
            models.Invoice(id='inv-1004', booking_id='booking-101', tenant_id='tenant-1', amount=850, cgst=76.5, sgst=76.5, total=850, status='Paid', due_date=datetime.date(2026, 5, 15), created_at=datetime.datetime(2026, 5, 10))
        ]
        db.add_all(invoices)
        db.commit()

        # 8. Housekeeping Tasks
        hk_tasks = [
            models.HousekeepingTask(id='task-1', room_id='room-101', task_description='Deep sweep and bed linen changed', status='Completed', assigned_staff='Ramesh Kumar', scheduled_date=datetime.date(2026, 5, 24)),
            models.HousekeepingTask(id='task-2', room_id='room-201', task_description='Clean toilets and dust cupboards', status='Pending', assigned_staff='Ramesh Kumar', scheduled_date=datetime.date(2026, 5, 24)),
            models.HousekeepingTask(id='task-3', room_id='room-102', task_description='Standard room cleanup', status='Pending', assigned_staff='Shanti Devi', scheduled_date=datetime.date(2026, 5, 24))
        ]
        db.add_all(hk_tasks)
        db.commit()

        # 9. Food Menu
        food_menu = [
            models.FoodMenuItem(id='menu-1', day_of_week='Monday', meal_type='Breakfast', menu_description='Idli, Vada, Sambhar & Filter Coffee'),
            models.FoodMenuItem(id='menu-2', day_of_week='Monday', meal_type='Lunch', menu_description='North Indian Meals: Roti, Paneer Masala, Daal, Rice, Curd'),
            models.FoodMenuItem(id='menu-3', day_of_week='Monday', meal_type='Dinner', menu_description='Aloo Paratha, Pickle, Veg Raita & Kheer'),
            models.FoodMenuItem(id='menu-4', day_of_week='Tuesday', meal_type='Breakfast', menu_description='Puri Sagu, Fruit Bowl & Tea'),
            models.FoodMenuItem(id='menu-5', day_of_week='Tuesday', meal_type='Lunch', menu_description='Veg Biryani, Mirchi ka Salan, Raita & Salad'),
            models.FoodMenuItem(id='menu-6', day_of_week='Tuesday', meal_type='Dinner', menu_description='Jeera Rice, Yellow Tadka Daal, Bhindi Fry & Roti')
        ]
        db.add_all(food_menu)
        db.commit()

        # 10. Visitors
        visitors = [
            models.Visitor(id='vis-1', name='Rajesh Sharma', phone='+91 98765 43219', tenant_id='tenant-1', purpose='Parents visit to deliver home-made food', entry_time=datetime.datetime(2026, 5, 24, 10, 15), exit_time=datetime.datetime(2026, 5, 24, 12, 0), approved=True),
            models.Visitor(id='vis-2', name='Vinay Kumar', phone='+91 99999 88888', tenant_id='tenant-3', purpose='Academic group study', entry_time=datetime.datetime(2026, 5, 24, 13, 30), exit_time=None, approved=False)
        ]
        db.add_all(visitors)
        db.commit()

        # 11. Audit Logs
        logs = [
            models.AuditLog(id='log-1', user_email='sunny.diploma033@gmail.com', role='Super Admin', action='Created organization Homely Stays Group', module='SuperAdmin', timestamp=datetime.datetime(2026, 5, 23, 11, 20)),
            models.AuditLog(id='log-2', user_email='sunny.diploma033@gmail.com', role='Super Admin', action='Assigned prop Silicon Valley Elite PG to Admin Priya', module='SuperAdmin', timestamp=datetime.datetime(2026, 5, 23, 11, 45)),
            models.AuditLog(id='log-3', user_email='admin.hsr@homelystays.com', role='Admin', action='Checked-in Tenant Sneha Reddy into Room 202 Bed A', module='Tenants', timestamp=datetime.datetime(2026, 5, 24, 9, 30)),
            models.AuditLog(id='log-4', user_email='admin.hsr@homelystays.com', role='Admin', action='Generated 4 invoices for rent May 2026', module='Billing', timestamp=datetime.datetime(2026, 5, 24, 10, 0))
        ]
        db.add_all(logs)
        db.commit()

        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
