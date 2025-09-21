#!/usr/bin/env python
"""
Debug script to check existing payment numbers and clean up duplicates
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from transactions.models import Payment
from django.db import transaction

def debug_payment_numbers():
    """Check existing payment numbers"""
    
    print("=== EXISTING PAYMENT NUMBERS ===")
    payments = Payment.objects.all().order_by('payment_number')
    
    for payment in payments:
        print(f"ID: {payment.id}, Number: '{payment.payment_number}', Created: {payment.created_at}")
    
    print(f"\nTotal payments: {payments.count()}")
    
    # Check for duplicates
    print("\n=== CHECKING FOR DUPLICATES ===")
    from django.db.models import Count
    duplicates = Payment.objects.values('payment_number').annotate(
        count=Count('payment_number')
    ).filter(count__gt=1)
    
    if duplicates:
        print("Found duplicates:")
        for dup in duplicates:
            print(f"  '{dup['payment_number']}' appears {dup['count']} times")
            
        # Show detailed duplicate records
        for dup in duplicates:
            dup_payments = Payment.objects.filter(payment_number=dup['payment_number'])
            print(f"\nDetails for '{dup['payment_number']}':")
            for p in dup_payments:
                print(f"  ID: {p.id}, Created: {p.created_at}, Contact: {p.contact.name}")
    else:
        print("No duplicates found")

def clean_duplicate_payment_numbers():
    """Clean up duplicate payment numbers by reassigning them"""
    
    print("\n=== CLEANING DUPLICATE PAYMENT NUMBERS ===")
    
    with transaction.atomic():
        # Find all payments with duplicate numbers
        from django.db.models import Count
        duplicates = Payment.objects.values('payment_number').annotate(
            count=Count('payment_number')
        ).filter(count__gt=1)
        
        for dup in duplicates:
            dup_payments = Payment.objects.filter(
                payment_number=dup['payment_number']
            ).order_by('created_at')
            
            print(f"Processing duplicates for '{dup['payment_number']}'...")
            
            # Keep the first one, reassign others
            for i, payment in enumerate(dup_payments):
                if i == 0:
                    print(f"  Keeping payment ID {payment.id} with original number")
                    continue
                
                # Find next available number
                new_number = find_next_available_number()
                print(f"  Reassigning payment ID {payment.id} to {new_number}")
                payment.payment_number = new_number
                payment.save(update_fields=['payment_number'])

def find_next_available_number():
    """Find the next available payment number"""
    
    # Get highest existing number
    last_payment = Payment.objects.filter(
        payment_number__regex=r'^PAY\d{5}$'
    ).order_by('-payment_number').first()
    
    if last_payment:
        try:
            last_number = int(last_payment.payment_number[3:])
            start_number = last_number + 1
        except:
            start_number = 1
    else:
        start_number = 1
    
    # Find first available number
    current = start_number
    while True:
        candidate = f'PAY{current:05d}'
        if not Payment.objects.filter(payment_number=candidate).exists():
            return candidate
        current += 1

if __name__ == '__main__':
    print("Debugging Payment Numbers...")
    debug_payment_numbers()
    
    # Ask user if they want to clean duplicates
    response = input("\nDo you want to clean duplicate payment numbers? (y/n): ")
    if response.lower() == 'y':
        clean_duplicate_payment_numbers()
        print("\nAfter cleanup:")
        debug_payment_numbers()
    
    print("\nDebug complete!")