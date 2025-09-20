#!/usr/bin/env python
"""
Test product search functionality
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shiv_accounts.settings')
django.setup()

from master_data.models import Product
from django.db.models import Q

def test_product_search():
    print("🔍 Testing Product Search Functionality")
    print("=" * 50)
    
    # Test 1: Check all products
    all_products = Product.objects.filter(is_active=True)
    print(f"📊 Total active products: {all_products.count()}")
    
    # Test 2: Search for "sofa" (case insensitive)
    search_term = "sofa"
    sofa_products = Product.objects.filter(
        Q(name__icontains=search_term) | 
        Q(hsn_code__icontains=search_term) | 
        Q(category__icontains=search_term),
        is_active=True
    )
    
    print(f"\n🔍 Search results for '{search_term}':")
    print(f"Found {sofa_products.count()} products:")
    
    for product in sofa_products:
        print(f"  - ID: {product.id}")
        print(f"    Name: {product.name}")
        print(f"    Type: {product.type}")
        print(f"    Sales Price: ₹{product.sales_price}")
        print(f"    Purchase Price: ₹{product.purchase_price}")
        print(f"    Sales Tax: {product.sale_tax_percent}%")
        print(f"    Purchase Tax: {product.purchase_tax_percent}%")
        print(f"    HSN Code: {product.hsn_code}")
        print(f"    Category: {product.category}")
        print(f"    Active: {product.is_active}")
        print()
    
    # Test 3: Simulate API search fields
    print("🎯 Testing API search fields:")
    api_search_fields = ['name', 'hsn_code', 'category']
    
    for field in api_search_fields:
        field_query = {f"{field}__icontains": search_term}
        results = Product.objects.filter(is_active=True, **field_query)
        print(f"  - {field}: {results.count()} results")
    
    # Test 4: Test exact ID search
    print("\n🎯 Testing exact ID search:")
    id_results = Product.objects.filter(id=2, is_active=True)
    print(f"  - ID=2: {id_results.count()} results")
    if id_results.exists():
        product = id_results.first()
        print(f"    Found: {product.name}")

if __name__ == "__main__":
    test_product_search()
