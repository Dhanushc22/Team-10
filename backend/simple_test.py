#!/usr/bin/env python3
"""
Simple test to verify payment API endpoint is working
"""
import requests
import json

# Test basic API connectivity
def test_basic_connectivity():
    """Test if the server is running and API root is accessible"""
    try:
        response = requests.get('http://127.0.0.1:8000/')
        print(f"✓ Server is running - Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        return True
    except Exception as e:
        print(f"✗ Server connection failed: {e}")
        return False

def test_payments_endpoint():
    """Test the payments endpoint"""
    try:
        # Test GET request (list payments)
        response = requests.get('http://127.0.0.1:8000/api/transactions/payments/')
        print(f"\n=== GET /api/transactions/payments/ ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text[:500]}...")
        
        return response.status_code in [200, 401, 403]  # Any of these means endpoint exists
    except Exception as e:
        print(f"✗ Payments endpoint test failed: {e}")
        return False

def main():
    print("🧪 Testing Payment API Endpoints\n")
    
    if not test_basic_connectivity():
        print("❌ Cannot connect to server")
        return
    
    if test_payments_endpoint():
        print("\n✅ Payment endpoint is accessible")
    else:
        print("\n❌ Payment endpoint test failed")

if __name__ == "__main__":
    main()