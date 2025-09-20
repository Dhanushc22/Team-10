#!/usr/bin/env python
"""
Create sample data to demonstrate the role-based access system
Run with: python create_sample_data.py
"""
import os
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from accounts.models import User
from master_data.models import Contact, Product, Tax, ChartOfAccount
from django.contrib.auth.models import Group

def create_sample_users():
    print("👥 Creating Sample Users...")
    
    # Get groups
    admin_group = Group.objects.get(name='Admin (Business Owner)')
    invoicing_group = Group.objects.get(name='Invoicing User (Accountant)')
    contact_group = Group.objects.get(name='Contact User (Customer/Vendor)')
    
    # Create sample contact user (customer)
    customer_user, created = User.objects.get_or_create(
        email='customer@demo.com',
        defaults={
            'username': 'demo_customer',
            'first_name': 'Demo',
            'last_name': 'Customer',
            'role': 'contact',
            'is_staff': False,
            'is_superuser': False,
            'mobile': '+1234567890'
        }
    )
    if created:
        customer_user.set_password('demo123')
        customer_user.groups.add(contact_group)
        customer_user.save()
        print("✅ Customer user created: customer@demo.com / demo123")
    
    # Create sample vendor user
    vendor_user, created = User.objects.get_or_create(
        email='vendor@demo.com',
        defaults={
            'username': 'demo_vendor',
            'first_name': 'Demo',
            'last_name': 'Vendor',
            'role': 'contact',
            'is_staff': False,
            'is_superuser': False,
            'mobile': '+1234567891'
        }
    )
    if created:
        vendor_user.set_password('demo123')
        vendor_user.groups.add(contact_group)
        vendor_user.save()
        print("✅ Vendor user created: vendor@demo.com / demo123")

def create_sample_master_data():
    print("\n📊 Creating Sample Master Data...")
    
    # Create sample contacts
    customer_contact, created = Contact.objects.get_or_create(
        name='ABC Corporation',
        defaults={
            'type': 'customer',
            'email': 'contact@abc-corp.com',
            'mobile': '+1234567892',
            'address': '123 Business Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'pincode': '400001'
        }
    )
    if created:
        print("✅ Customer contact created: ABC Corporation")
    
    vendor_contact, created = Contact.objects.get_or_create(
        name='XYZ Suppliers',
        defaults={
            'type': 'vendor',
            'email': 'sales@xyz-suppliers.com',
            'mobile': '+1234567893',
            'address': '456 Supplier Lane',
            'city': 'Delhi',
            'state': 'Delhi',
            'pincode': '110001'
        }
    )
    if created:
        print("✅ Vendor contact created: XYZ Suppliers")
    
    # Create sample products
    product1, created = Product.objects.get_or_create(
        name='Office Chair',
        defaults={
            'type': 'goods',
            'sales_price': Decimal('5000.00'),
            'purchase_price': Decimal('3000.00'),
            'sale_tax_percent': Decimal('18.00'),
            'purchase_tax_percent': Decimal('18.00'),
            'hsn_code': '9401',
            'category': 'Furniture'
        }
    )
    if created:
        print("✅ Product created: Office Chair")
    
    # Create sample tax
    gst_tax, created = Tax.objects.get_or_create(
        name='GST 18%',
        defaults={
            'computation_method': 'percentage',
            'applicable_on': 'both',
            'percentage_value': Decimal('18.00')
        }
    )
    if created:
        print("✅ Tax created: GST 18%")
    
    # Create sample chart of accounts
    cash_account, created = ChartOfAccount.objects.get_or_create(
        name='Cash Account',
        defaults={
            'type': 'asset',
            'code': 'CASH001',
            'opening_balance': Decimal('50000.00'),
            'current_balance': Decimal('50000.00')
        }
    )
    if created:
        print("✅ Chart of Account created: Cash Account")

def show_access_summary():
    print("\n🔐 Access Control Summary:")
    print("=" * 50)
    
    print("\n👑 ADMIN (Business Owner)")
    print("   Login: admin@gmail.com / admin123")
    print("   Access: Django Admin + Full permissions")
    print("   Can: Manage everything")
    
    print("\n📝 INVOICING USER (Accountant)")
    print("   Login: kakumaniakshar@gmail.com / [existing password]")
    print("   Access: Django Admin + Transaction/Master data permissions")
    print("   Can: Create master data, record transactions, view reports")
    print("   Cannot: Delete chart of accounts, manage users")
    
    print("\n👤 CONTACT USERS (Customers/Vendors)")
    print("   Login: customer@demo.com / demo123")
    print("   Login: vendor@demo.com / demo123")
    print("   Access: React App only + View own data")
    print("   Can: View own invoices/bills, make payments")
    print("   Cannot: Access Django admin, view other users' data")
    
    print("\n🌐 Access URLs:")
    print("   Django Admin: http://localhost:8000/admin/")
    print("   React App: http://localhost:3000/")
    print("   API: http://localhost:8000/api/")

if __name__ == "__main__":
    print("🎯 Creating Sample Data for Role-Based Access Demo")
    print("=" * 60)
    
    create_sample_users()
    create_sample_master_data()
    show_access_summary()
    
    print("\n✅ Sample data creation complete!")
    print("\n🔍 To test the permissions:")
    print("1. Login to Django Admin with different user accounts")
    print("2. Notice how different users see different sections")
    print("3. Try accessing restricted areas with limited users")
    print("4. Check the Groups section to see permission details")
