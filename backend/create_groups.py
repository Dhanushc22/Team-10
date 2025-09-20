#!/usr/bin/env python
"""
Simple script to create user groups for Shiv Accounts Cloud
Run with: python create_groups.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from accounts.models import User

def create_groups():
    print("🔧 Creating User Groups for Shiv Accounts Cloud")
    print("=" * 50)
    
    # Step 1: Create Admin Group
    print("\n1️⃣  Creating Admin (Business Owner) Group...")
    admin_group, created = Group.objects.get_or_create(name='Admin (Business Owner)')
    if created:
        print("✅ Admin group created")
    else:
        print("ℹ️  Admin group already exists")
    
    # Give admin group ALL permissions
    all_permissions = Permission.objects.all()
    admin_group.permissions.set(all_permissions)
    print(f"   → Assigned {all_permissions.count()} permissions")
    
    # Step 2: Create Invoicing User Group
    print("\n2️⃣  Creating Invoicing User (Accountant) Group...")
    invoicing_group, created = Group.objects.get_or_create(name='Invoicing User (Accountant)')
    if created:
        print("✅ Invoicing User group created")
    else:
        print("ℹ️  Invoicing User group already exists")
    
    # Give invoicing users specific permissions
    invoicing_permissions = Permission.objects.filter(
        content_type__app_label__in=['master_data', 'transactions', 'reports']
    ).exclude(
        codename__startswith='delete_chartofaccount'  # Cannot delete chart of accounts
    )
    invoicing_group.permissions.set(invoicing_permissions)
    print(f"   → Assigned {invoicing_permissions.count()} permissions")
    
    # Step 3: Create Contact User Group  
    print("\n3️⃣  Creating Contact User (Customer/Vendor) Group...")
    contact_group, created = Group.objects.get_or_create(name='Contact User (Customer/Vendor)')
    if created:
        print("✅ Contact User group created")
    else:
        print("ℹ️  Contact User group already exists")
    
    # Give contact users very limited permissions
    contact_permissions = Permission.objects.filter(
        content_type__app_label='transactions',
        codename__in=['view_customerinvoice', 'view_vendorbill', 'view_payment']
    )
    contact_group.permissions.set(contact_permissions)
    print(f"   → Assigned {contact_permissions.count()} permissions")
    
    # Step 4: Show current users
    print("\n4️⃣  Current Users:")
    users = User.objects.all()
    for user in users:
        print(f"   👤 {user.email} (Role: {user.role})")
    
    print(f"\n📊 Summary:")
    print(f"   - Admin Group: {admin_group.permissions.count()} permissions")
    print(f"   - Invoicing Group: {invoicing_group.permissions.count()} permissions")
    print(f"   - Contact Group: {contact_group.permissions.count()} permissions")
    
    return admin_group, invoicing_group, contact_group

def assign_users_to_groups():
    print("\n5️⃣  Assigning Users to Groups...")
    
    # Get groups
    admin_group = Group.objects.get(name='Admin (Business Owner)')
    invoicing_group = Group.objects.get(name='Invoicing User (Accountant)')
    contact_group = Group.objects.get(name='Contact User (Customer/Vendor)')
    
    # Assign users based on their role
    for user in User.objects.all():
        user.groups.clear()  # Clear existing groups
        
        if user.role == 'admin':
            user.groups.add(admin_group)
            user.is_staff = True
            user.is_superuser = True
            print(f"   👑 {user.email} → Admin Group")
            
        elif user.role == 'invoicing_user':
            user.groups.add(invoicing_group)
            user.is_staff = True  # Can access Django admin
            user.is_superuser = False
            print(f"   📝 {user.email} → Invoicing User Group")
            
        elif user.role == 'contact':
            user.groups.add(contact_group)
            user.is_staff = False  # Cannot access Django admin
            user.is_superuser = False
            print(f"   👤 {user.email} → Contact User Group")
        
        user.save()
    
    print("\n✅ All users assigned to appropriate groups!")

if __name__ == "__main__":
    create_groups()
    assign_users_to_groups()
    
    print("\n🎉 Setup Complete!")
    print("\nNext Steps:")
    print("1. Go to Django Admin → Groups to see the created groups")
    print("2. Go to Django Admin → Users to see group assignments")
    print("3. Test permissions by logging in as different users")
