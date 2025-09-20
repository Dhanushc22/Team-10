from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    LoginSerializer, ChangePasswordSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """View for user login"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """View for user logout"""
    try:
        # Delete the token
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """View for getting current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """View for updating user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """View for changing password"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    """View for getting dashboard data based on user role"""
    user = request.user
    
    if user.is_admin() or user.is_invoicing_user():
        # Admin and Invoicing User dashboard data
        from transactions.models import SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill
        from master_data.models import Product
        
        # Calculate totals (simplified - in real app, use proper aggregation)
        total_sales = CustomerInvoice.objects.filter(status='paid').count() * 1000  # Mock data
        total_purchases = VendorBill.objects.filter(status='paid').count() * 800   # Mock data
        net_profit = total_sales - total_purchases
        cash_balance = 50000  # Mock data
        
        dashboard_data = {
            'total_sales': total_sales,
            'total_purchases': total_purchases,
            'net_profit': net_profit,
            'cash_balance': cash_balance,
            'pending_invoices': CustomerInvoice.objects.filter(status='pending').count(),
            'pending_bills': VendorBill.objects.filter(status='pending').count(),
        }
    else:
        # Contact user dashboard data
        from transactions.models import CustomerInvoice
        
        user_invoices = CustomerInvoice.objects.filter(customer__user=user)
        dashboard_data = {
            'total_invoices': user_invoices.count(),
            'paid_invoices': user_invoices.filter(status='paid').count(),
            'pending_invoices': user_invoices.filter(status='pending').count(),
            'total_amount_due': sum(inv.grand_total for inv in user_invoices.filter(status='pending')),
        }
    
    return Response(dashboard_data)
