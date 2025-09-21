from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

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
        
        # GST API endpoint
        gst_api_url = 'https://services.gst.gov.in/commonservices/hsn/search/q'
        
        # Parameters for GST API
        params = {
            'inputText': input_text,
            'selectedType': selected_type,
            'category': category
        }
        
        # Headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://services.gst.gov.in/',
            'Origin': 'https://services.gst.gov.in'
        }
        
        # Make request to GST API with timeout
        response = requests.get(
            gst_api_url, 
            params=params, 
            headers=headers, 
            timeout=10,
            verify=True
        )
        
        # Check if request was successful
        if response.status_code == 200:
            try:
                data = response.json()
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