#!/usr/bin/env python
"""
Test script to verify Payment creation works properly
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from django.test import TestCase
from transactions.models import Payment
from master_data.models import Contact
from accounts.models import User
from datetime import date

def test_payment_creation():
    """Test if Payment can be created without errors"""
    
    # Create test user
    try:
        user = User.objects.get(username='admin')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    # Create test contact
    try:
        contact = Contact.objects.filter(type='customer').first()
        if not contact:
            contact = Contact.objects.create(
                name='Test Customer',
                type='customer',
                email='customer@test.com',
                mobile='1234567890'
            )
    except Exception as e:
        print(f"Error creating contact: {e}")
        return False
    
    # Test Payment creation
    try:
        payment = Payment.objects.create(
            payment_type='customer_payment',
            contact=contact,
            payment_date=date.today(),
            payment_method='cash',
            amount=1000.00,
            reference='TEST-REF-001',
            notes='Test payment creation',
            created_by=user
        )
        print(f"✅ Payment created successfully: {payment}")
        print(f"Payment Number: {payment.payment_number}")
        print(f"Payment ID: {payment.id}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating payment: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Testing Payment Model Creation...")
    success = test_payment_creation()
    if success:
        print("✅ Payment test passed!")
    else:
        print("❌ Payment test failed!")