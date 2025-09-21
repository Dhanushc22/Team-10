#!/usr/bin/env python
"""
Stress test script to create multiple payments simultaneously
"""
import os
import sys
import django
import threading
import time

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from transactions.models import Payment
from master_data.models import Contact
from accounts.models import User
from datetime import date

def create_test_payment(thread_id):
    """Create a test payment"""
    try:
        # Get test user and contact
        user = User.objects.first()
        contact = Contact.objects.first()
        
        if not user or not contact:
            print(f"Thread {thread_id}: Missing user or contact")
            return False
        
        payment = Payment.objects.create(
            payment_type='customer_payment',
            contact=contact,
            payment_date=date.today(),
            payment_method='cash',
            amount=100.00 + thread_id,  # Different amounts
            reference=f'TEST-{thread_id}',
            notes=f'Test payment from thread {thread_id}',
            created_by=user
        )
        print(f"Thread {thread_id}: ✅ Created payment {payment.payment_number}")
        return True
        
    except Exception as e:
        print(f"Thread {thread_id}: ❌ Error: {e}")
        return False

def stress_test_payments():
    """Create multiple payments simultaneously"""
    print("=== STRESS TESTING PAYMENT CREATION ===")
    
    num_threads = 5
    threads = []
    results = []
    
    def worker(thread_id):
        result = create_test_payment(thread_id)
        results.append(result)
    
    # Start all threads
    print(f"Starting {num_threads} simultaneous payment creations...")
    for i in range(num_threads):
        thread = threading.Thread(target=worker, args=(i+1,))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check results
    success_count = sum(results)
    print(f"\nResults: {success_count}/{num_threads} payments created successfully")
    
    if success_count == num_threads:
        print("✅ Stress test PASSED - No race conditions detected!")
    else:
        print("❌ Stress test FAILED - Some payments failed to create")
    
    return success_count == num_threads

if __name__ == '__main__':
    print("Stress Testing Payment Creation...")
    stress_test_payments()
    
    # Show all payment numbers created
    print("\n=== ALL PAYMENT NUMBERS ===")
    payments = Payment.objects.all().order_by('-created_at')[:10]
    for payment in payments:
        print(f"{payment.payment_number} - Created: {payment.created_at}")
    
    print("\nStress test complete!")