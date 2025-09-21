from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_gst_rate_for_code(hsn_code):
    """
    Get GST rate for common HSN codes.
    This is a simplified mapping - in production, you might want to
    fetch this from a database or a more comprehensive API.
    """
    # Common furniture and related HSN codes with their GST rates
    gst_rates = {
        '9401': '12',  # Seats/chairs
        '940140': '12',  # Seats convertible into beds
        '940161': '12',  # Other seats with wooden frames
        '940169': '12',  # Other seats with other frames
        '9402': '12',  # Medical/dental/surgical furniture
        '9403': '12',  # Other furniture
        '940310': '12',  # Metal furniture for offices
        '940320': '12',  # Other metal furniture
        '940330': '12',  # Wooden furniture for offices
        '940340': '12',  # Wooden furniture for kitchen
        '940350': '12',  # Wooden furniture for bedroom
        '940360': '12',  # Other wooden furniture
        '940370': '12',  # Furniture of plastics
        '9404': '12',  # Mattresses, pillows, etc.
        '4409': '5',   # Wood strips
        '4412': '12',  # Plywood
        '4418': '12',  # Wooden carpentry
        '8302': '18',  # Metal mountings/fittings
        '830242': '18', # Furniture fittings
        '7318': '18',  # Screws, bolts, nuts
        '9997': '5',   # Transport services (first 4 digits)
        '9972': '18',  # Installation services
        '9983': '18',  # Design services
    }
    
    # Check exact match first
    if hsn_code in gst_rates:
        return gst_rates[hsn_code]
    
    # Check by prefix (first 4 digits)
    if len(hsn_code) >= 4:
        prefix = hsn_code[:4]
        if prefix in gst_rates:
            return gst_rates[prefix]
    
    # Check by first 6 digits for more specific codes
    if len(hsn_code) >= 6:
        prefix = hsn_code[:6]
        if prefix in gst_rates:
            return gst_rates[prefix]
    
    # Default rates by category
    if hsn_code.startswith('94'):  # Furniture category
        return '12'
    elif hsn_code.startswith('44'):  # Wood category
        return '12'
    elif hsn_code.startswith('83'):  # Metal fittings
        return '18'
    elif hsn_code.startswith('999'):  # Services
        return '18'
    
    # Default if unknown
    return '18'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_hsn_codes(request):
    """
    Proxy endpoint for GST HSN search to avoid CORS issues
    """
    try:
        # Get parameters from request
        input_text = request.GET.get('inputText', '')
        selected_type = request.GET.get('selectedType', 'byCode')
        category = request.GET.get('category', 'null')
        
        if not input_text:
            return Response(
                {'error': 'inputText parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Basic validation to match GST API requirements
        # Require at least 3 characters to prevent 400 from upstream
        if len(input_text.strip()) < 3:
            return Response(
                {'error': 'inputText must be at least 3 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # GST API endpoint - Updated to working endpoint
        gst_api_url = 'https://services.gst.gov.in/commonservices/hsn/search/qsearch'
        
        # Parameters for GST API
        params = {
            'inputText': input_text,
            'selectedType': selected_type,
            'category': category
        }
        
        # Headers to mimic a browser request - simplified since basic request works
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Make request to GST API with timeout
        response = requests.get(
            gst_api_url, 
            params=params, 
            headers=headers, 
            timeout=15,  # Increased timeout
            verify=True
        )
        
        # Check if request was successful
        if response.status_code == 200:
            try:
                data = response.json()
                
                # Transform the API response to match frontend expectations
                if 'data' in data and isinstance(data['data'], list):
                    transformed_data = []
                    for item in data['data']:
                        # Transform the response format
                        transformed_item = {
                            'hsn_code': item.get('c', ''),
                            'description': item.get('n', ''),
                            # GST rate would need to be fetched separately or from a mapping
                            # For now, we'll use a basic mapping for common codes
                            'gst_rate': get_gst_rate_for_code(item.get('c', ''))
                        }
                        transformed_data.append(transformed_item)
                    
                    return Response(transformed_data, status=status.HTTP_200_OK)
                else:
                    # Return raw data if structure is unexpected
                    return Response(data, status=status.HTTP_200_OK)
                    
            except ValueError:
                # If response is not JSON, return as text
                return Response(
                    {'data': response.text}, 
                    status=status.HTTP_200_OK
                )
        else:
            logger.error(f"GST API returned status {response.status_code}: {response.text}")
            return Response(
                {
                    'error': 'GST API request failed',
                    'status_code': response.status_code,
                    'message': 'Unable to fetch HSN codes from GST server'
                }, 
                status=status.HTTP_502_BAD_GATEWAY
            )
            
    except requests.exceptions.Timeout:
        logger.error("GST API request timed out")
        return Response(
            {'error': 'Request timeout', 'message': 'GST API is taking too long to respond'}, 
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
        
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to GST API")
        return Response(
            {'error': 'Connection error', 'message': 'Unable to connect to GST API server'}, 
            status=status.HTTP_502_BAD_GATEWAY
        )
        
    except Exception as e:
        logger.error(f"Unexpected error in HSN search: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'message': 'An unexpected error occurred'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_hsn_search(request):
    """
    Mock HSN search endpoint for testing when GST API is not available
    """
    input_text = request.GET.get('inputText', '').lower()
    selected_type = request.GET.get('selectedType', 'byCode')
    
    # Mock data for common HSN codes
    mock_data = [
        {
            'hsn_code': '1001',
            'description': 'Wheat and meslin',
            'gst_rate': '0'
        },
        {
            'hsn_code': '1006',
            'description': 'Rice',
            'gst_rate': '0'
        },
        {
            'hsn_code': '2208',
            'description': 'Undenatured ethyl alcohol; spirits, liqueurs and other spirituous beverages',
            'gst_rate': '28'
        },
        {
            'hsn_code': '8471',
            'description': 'Automatic data processing machines and units thereof',
            'gst_rate': '18'
        },
        {
            'hsn_code': '6403',
            'description': 'Footwear with outer soles of rubber, plastics, leather or composition leather',
            'gst_rate': '18'
        },
        {
            'hsn_code': '9403',
            'description': 'Other furniture and parts thereof',
            'gst_rate': '12'
        },
        {
            'hsn_code': '999799',
            'description': 'Transport of goods by road',
            'gst_rate': '5'
        },
        {
            'hsn_code': '998314',
            'description': 'Business support services',
            'gst_rate': '18'
        }
    ]
    
    # Filter based on input
    if selected_type == 'byCode':
        filtered_data = [item for item in mock_data if input_text in item['hsn_code']]
    else:
        filtered_data = [item for item in mock_data if input_text in item['description'].lower()]
    
    return Response(filtered_data, status=status.HTTP_200_OK)