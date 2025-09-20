from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from django.utils import timezone
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
        from transactions.models import SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill, Payment
        from master_data.models import Product, Contact, ChartOfAccount
        from django.db.models import Sum, Count, Q
        from decimal import Decimal
        
        # Calculate real totals - include all invoices/bills
        total_sales = CustomerInvoice.objects.aggregate(
            total=Sum('grand_total'))['total'] or Decimal('0')
        total_purchases = VendorBill.objects.aggregate(
            total=Sum('grand_total'))['total'] or Decimal('0')
        
        # Calculate proper Net Profit: Total Revenue (paid invoices) - Total Costs (paid bills)
        revenue = CustomerInvoice.objects.filter(status='paid').aggregate(
            total=Sum('grand_total'))['total'] or Decimal('0')
        costs = VendorBill.objects.filter(status='paid').aggregate(
            total=Sum('grand_total'))['total'] or Decimal('0')
        net_profit = revenue - costs
        
        # Calculate cash balance from actual payments
        customer_payments = Payment.objects.filter(payment_type='customer_payment').aggregate(
            total=Sum('amount'))['total'] or Decimal('0')
        vendor_payments = Payment.objects.filter(payment_type='vendor_payment').aggregate(
            total=Sum('amount'))['total'] or Decimal('0')
        cash_balance = customer_payments - vendor_payments
        
        # Count various entities
        total_customers = Contact.objects.filter(Q(type='customer') | Q(type='both'), is_active=True).count()
        total_vendors = Contact.objects.filter(Q(type='vendor') | Q(type='both'), is_active=True).count()
        total_products = Product.objects.filter(is_active=True).count()
        
        # Pending transactions
        pending_invoices = CustomerInvoice.objects.filter(status='pending').count()
        pending_bills = VendorBill.objects.filter(status='pending').count()
        
        # Recent transactions
        recent_pending_invoices = CustomerInvoice.objects.filter(status='pending').order_by('-invoice_date')[:3]
        recent_payments = Payment.objects.order_by('-payment_date')[:3]
        
        # Get actual pending invoices and payments data
        pending_invoices_data = []
        for invoice in recent_pending_invoices:
            pending_invoices_data.append({
                'id': invoice.id,
                'number': invoice.invoice_number,
                'customer': invoice.customer.name,
                'amount': float(invoice.balance_due),
                'date': invoice.invoice_date.strftime('%Y-%m-%d')
            })
        
        recent_payments_data = []
        for payment in recent_payments:
            recent_payments_data.append({
                'id': payment.id,
                'number': payment.payment_number,
                'contact': payment.contact.name,
                'amount': float(payment.amount),
                'date': payment.payment_date.strftime('%Y-%m-%d'),
                'method': payment.payment_method
            })
        
        dashboard_data = {
            'total_sales': float(total_sales),
            'total_purchases': float(total_purchases),
            'revenue': float(revenue),  # Actual received revenue
            'costs': float(costs),      # Actual paid costs
            'net_profit': float(net_profit),
            'cash_balance': float(cash_balance),
            'total_customers': total_customers,
            'total_vendors': total_vendors,
            'total_products': total_products,
            'low_stock_products': 0,  # TODO: Implement stock tracking
            'pending_invoices': pending_invoices,
            'pending_bills': pending_bills,
            'pending_invoices_amount': float(CustomerInvoice.objects.filter(status='pending').aggregate(
                total=Sum('balance_due'))['total'] or Decimal('0')),
            'pending_bills_amount': float(VendorBill.objects.filter(status='pending').aggregate(
                total=Sum('balance_due'))['total'] or Decimal('0')),
            'pending_invoices_data': pending_invoices_data,
            'recent_payments_data': recent_payments_data,
            'last_updated': timezone.now().isoformat(),
        }
    else:
        # Contact user dashboard data
        from transactions.models import CustomerInvoice, VendorBill
        from django.db.models import Sum
        
        if hasattr(user, 'contact_profile') and user.contact_profile:
            contact = user.contact_profile
            user_invoices = CustomerInvoice.objects.filter(customer=contact)
            user_bills = VendorBill.objects.filter(vendor=contact)
            
            dashboard_data = {
                'total_invoices': user_invoices.count(),
                'paid_invoices': user_invoices.filter(status='paid').count(),
                'pending_invoices': user_invoices.filter(status='pending').count(),
                'total_amount_due': float(user_invoices.filter(status='pending').aggregate(
                    total=Sum('balance_due'))['total'] or Decimal('0')),
                'total_bills': user_bills.count(),
                'paid_bills': user_bills.filter(status='paid').count(),
                'pending_bills': user_bills.filter(status='pending').count(),
            }
        else:
            dashboard_data = {
                'total_invoices': 0,
                'paid_invoices': 0,
                'pending_invoices': 0,
                'total_amount_due': 0,
                'total_bills': 0,
                'paid_bills': 0,
                'pending_bills': 0,
            }
    
    return Response(dashboard_data)


# User Management Views (Admin Only)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_list(request):
    """Get list of all users (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_detail(request, user_id):
    """Get user details (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_user(request):
    """Create new user (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user(request, user_id):
    """Update user (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user(request, user_id):
    """Delete user (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        # Don't allow deleting yourself
        if user == request.user:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def groups_list(request):
    """Get list of all groups (Admin only)"""
    if not request.user.is_admin():
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    groups = Group.objects.all()
    groups_data = []
    for group in groups:
        groups_data.append({
            'id': group.id,
            'name': group.name,
            'permissions_count': group.permissions.count(),
            'users_count': group.user_set.count()
        })
    
    return Response(groups_data)
