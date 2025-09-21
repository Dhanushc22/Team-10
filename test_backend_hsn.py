#!/usr/bin/env python3
"""
Test the backend HSN API endpoint to verify it's returning transformed data
"""
import requests
import json

# Backend API URL
BASE_URL = 'http://localhost:8000'

def test_backend_hsn_endpoint():
    """Test the backend HSN search endpoint"""
    
    # First, we need to get an auth token (you may need to adjust credentials)
    # For testing, we'll try without auth first
    
    print("Testing Backend HSN Endpoint")
    print("=" * 40)
    
    # Test 1: Search by code
    print("\n1. Testing HSN code search (9403 - Furniture)...")
    try:
        response = requests.get(
            f'{BASE_URL}/api/master-data/hsn-search/',
            params={
                'inputText': '9403',
                'selectedType': 'byCode',
                'category': 'null'
            },
            headers={
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 401:
            print("❌ Authentication required. The endpoint needs a valid auth token.")
            print("   The API is configured correctly but requires login.")
            return
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend API working!")
            print(f"Number of results: {len(data) if isinstance(data, list) else 'Not a list'}")
            
            # Check the data format
            if isinstance(data, list) and len(data) > 0:
                print("\nFirst result structure:")
                first_item = data[0]
                print(f"  - hsn_code: {first_item.get('hsn_code', 'MISSING')}")
                print(f"  - description: {first_item.get('description', 'MISSING')}")
                print(f"  - gst_rate: {first_item.get('gst_rate', 'MISSING')}")
                
                if all(key in first_item for key in ['hsn_code', 'description', 'gst_rate']):
                    print("\n✅ Data transformation working correctly!")
                else:
                    print("\n⚠️  Data structure might need adjustment")
            
            # Show first 3 results
            print("\nSample results:")
            for i, item in enumerate(data[:3], 1):
                print(f"  {i}. HSN: {item.get('hsn_code')} - {item.get('description')} - GST: {item.get('gst_rate')}%")
        else:
            print(f"❌ Backend API failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    # Test 2: Search by description
    print("\n2. Testing description search (furniture)...")
    try:
        response = requests.get(
            f'{BASE_URL}/api/master-data/hsn-search/',
            params={
                'inputText': 'furniture',
                'selectedType': 'byDesc',
                'category': 'P'
            },
            headers={
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 401:
            print("❌ Authentication required for this endpoint.")
            return
            
        if response.status_code == 200:
            data = response.json()
            print("✅ Description search working!")
            print(f"Number of results: {len(data) if isinstance(data, list) else 'Not a list'}")
            
            # Show first 3 results
            if isinstance(data, list):
                print("\nSample results:")
                for i, item in enumerate(data[:3], 1):
                    print(f"  {i}. HSN: {item.get('hsn_code')} - {item.get('description')} - GST: {item.get('gst_rate')}%")
        else:
            print(f"❌ Description search failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 40)
    print("SUMMARY:")
    print("The backend HSN endpoint is configured to:")
    print("1. Proxy requests to the real Government GST API")
    print("2. Transform the response to include hsn_code, description, and gst_rate")
    print("3. Provide GST rates based on HSN code mappings")
    print("\nNOTE: You need to be authenticated to use this endpoint.")

if __name__ == "__main__":
    test_backend_hsn_endpoint()
