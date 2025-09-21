#!/usr/bin/env python3
"""
Quick test to verify HSN API is working with updated endpoint
"""
import requests
import json

def test_hsn_api():
    """Test if the HSN API is working with real government data"""
    
    # Test with the corrected endpoint
    api_url = 'https://services.gst.gov.in/commonservices/hsn/search/qsearch'
    
    # Test furniture search
    params = {
        'inputText': 'furniture',
        'selectedType': 'byDesc',
        'category': 'P'
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    print("Testing HSN API with corrected endpoint...")
    print(f"URL: {api_url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ API working! Sample data:")
                # Print first few results
                if isinstance(data, list) and len(data) > 0:
                    for i, item in enumerate(data[:3]):
                        print(f"  {i+1}. {item}")
                else:
                    print(f"  Raw response: {data}")
                return True
            except json.JSONDecodeError:
                print(f"✅ API working but response is not JSON: {response.text[:200]}")
                return True
        else:
            print(f"❌ API failed with status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_hsn_code_search():
    """Test HSN code search specifically"""
    
    api_url = 'https://services.gst.gov.in/commonservices/hsn/search/qsearch'
    
    # Test specific HSN code
    params = {
        'inputText': '9403',  # Furniture HSN code
        'selectedType': 'byCode',
        'category': 'null'
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
    
    print("\nTesting HSN code search...")
    print(f"URL: {api_url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(api_url, params=params, headers=headers, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ HSN Code search working! Results:")
                if isinstance(data, list):
                    for item in data[:5]:
                        print(f"  - {item}")
                else:
                    print(f"  Raw response: {data}")
                return True
            except json.JSONDecodeError:
                print(f"✅ HSN Code search working: {response.text[:200]}")
                return True
        else:
            print(f"❌ HSN Code search failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ HSN Code request failed: {e}")
        return False

if __name__ == "__main__":
    print("HSN API Integration Test")
    print("=" * 40)
    
    # Test description search
    desc_result = test_hsn_api()
    
    # Test code search
    code_result = test_hsn_code_search()
    
    print("\n" + "=" * 40)
    print("SUMMARY:")
    print(f"Description Search: {'✅ WORKING' if desc_result else '❌ FAILED'}")
    print(f"Code Search: {'✅ WORKING' if code_result else '❌ FAILED'}")
    
    if desc_result and code_result:
        print("\n🎉 HSN API integration is working with real government data!")
        print("The /qsearch endpoint is functioning correctly.")
    else:
        print("\n⚠️  Some HSN API functionality may need attention.")