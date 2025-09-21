#!/usr/bin/env python
"""
Test the actual API endpoint for payment creation
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from master_data.models import Contact
import json

def test_payment_api():
    """Test the payment API endpoint"""
    
    client = Client()
    User = get_user_model()
    
    # Create or get test user
    user, created = User.objects.get_or_create(
        username='testapi',
        defaults={
            'email': 'testapi@example.com',
            'first_name': 'Test',
            'last_name': 'API'
        }
    )
    
    # Create or get test contact
    contact, created = Contact.objects.get_or_create(
        name='API Test Customer',
        defaults={
            'type': 'customer',
            'email': 'apicustomer@test.com',
            'mobile': '9876543210'
        }
    )
    
    # Login the user
    client.force_login(user)
    
    # Test payment creation via API
    payment_data = {
        'payment_type': 'customer_payment',
        'contact_id': contact.id,
        'payment_date': '2025-09-21',
        'payment_method': 'cash',
        'amount': '500.00',
        'reference': 'API-TEST-001',
        'notes': 'Test payment via API'
    }
    
    print("Testing Payment API Creation...")
    print(f"Payload: {json.dumps(payment_data, indent=2)}")
    
    response = client.post(
        '/api/transactions/payments/',
        data=json.dumps(payment_data),
        content_type='application/json'
    )
    
    print(f"\nResponse Status: {response.status_code}")
    
    if response.status_code == 201:
        response_data = response.json()
        print("✅ Payment created successfully via API!")
        print(f"Payment Number: {response_data.get('payment_number')}")
        print(f"Payment ID: {response_data.get('id')}")
        print(f"Amount: {response_data.get('amount')}")
        return True
    else:
        print("❌ Payment creation failed!")
        print(f"Response: {response.content.decode()}")
        return False

if __name__ == '__main__':
    success = test_payment_api()
    if success:
        print("\n✅ API test passed!")
    else:
        print("\n❌ API test failed!")