from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Sum, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    PurchaseOrder, PurchaseOrderItem, VendorBill, VendorBillItem,
    SalesOrder, SalesOrderItem, CustomerInvoice, CustomerInvoiceItem,
    Payment, PaymentAllocation
)
from .serializers import (
    PurchaseOrderSerializer, PurchaseOrderListSerializer, PurchaseOrderItemSerializer,
    VendorBillSerializer, VendorBillListSerializer, VendorBillItemSerializer,
    SalesOrderSerializer, SalesOrderListSerializer, SalesOrderItemSerializer,
    CustomerInvoiceSerializer, CustomerInvoiceListSerializer, CustomerInvoiceItemSerializer,
    PaymentSerializer, PaymentListSerializer, PaymentAllocationSerializer
)
from master_data.models import Contact, Product


# Purchase Order Views
class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    """View for listing and creating purchase orders"""
    queryset = PurchaseOrder.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'vendor']
    search_fields = ['po_number', 'vendor__name']
    ordering_fields = ['po_date', 'created_at', 'grand_total']
    ordering = ['-po_date', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PurchaseOrderListSerializer
        return PurchaseOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting purchase orders"""
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vendor Bill Views
class VendorBillListCreateView(generics.ListCreateAPIView):
    """View for listing and creating vendor bills"""
    queryset = VendorBill.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'vendor']
    search_fields = ['bill_number', 'vendor__name']
    ordering_fields = ['bill_date', 'created_at', 'grand_total']
    ordering = ['-bill_date', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return VendorBillListSerializer
        return VendorBillSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VendorBillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting vendor bills"""
    queryset = VendorBill.objects.all()
    serializer_class = VendorBillSerializer
    permission_classes = [permissions.IsAuthenticated]


# Sales Order Views
class SalesOrderListCreateView(generics.ListCreateAPIView):
    """View for listing and creating sales orders"""
    queryset = SalesOrder.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer']
    search_fields = ['so_number', 'customer__name']
    ordering_fields = ['so_date', 'created_at', 'grand_total']
    ordering = ['-so_date', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SalesOrderListSerializer
        return SalesOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SalesOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting sales orders"""
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


# Customer Invoice Views
class CustomerInvoiceListCreateView(generics.ListCreateAPIView):
    """View for listing and creating customer invoices"""
    queryset = CustomerInvoice.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer']
    search_fields = ['invoice_number', 'customer__name']
    ordering_fields = ['invoice_date', 'created_at', 'grand_total']
    ordering = ['-invoice_date', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CustomerInvoiceListSerializer
        return CustomerInvoiceSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CustomerInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting customer invoices"""
    queryset = CustomerInvoice.objects.all()
    serializer_class = CustomerInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]


# Payment Views
class PaymentListCreateView(generics.ListCreateAPIView):
    """View for listing and creating payments"""
    queryset = Payment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['payment_type', 'payment_method', 'contact']
    search_fields = ['payment_number', 'contact__name']
    ordering_fields = ['payment_date', 'created_at', 'amount']
    ordering = ['-payment_date', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PaymentListSerializer
        return PaymentSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


# Special Views for Contact Users
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contact_user_invoices(request):
    """Get invoices for contact users (customers)"""
    if not request.user.is_contact():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        contact = request.user.contact_profile
        invoices = CustomerInvoice.objects.filter(customer=contact)
        serializer = CustomerInvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)
    except:
        return Response({'error': 'Contact profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contact_user_bills(request):
    """Get bills for contact users (vendors)"""
    if not request.user.is_contact():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        contact = request.user.contact_profile
        bills = VendorBill.objects.filter(vendor=contact)
        serializer = VendorBillListSerializer(bills, many=True)
        return Response(serializer.data)
    except:
        return Response({'error': 'Contact profile not found'}, status=status.HTTP_404_NOT_FOUND)


# Dashboard and Summary Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_summary(request):
    """Get transaction summary for dashboard"""
    user = request.user
    
    if user.is_admin() or user.is_invoicing_user():
        # Admin and Invoicing User summary
        summary = {
            'purchase_orders': {
                'total': PurchaseOrder.objects.count(),
                'draft': PurchaseOrder.objects.filter(status='draft').count(),
                'sent': PurchaseOrder.objects.filter(status='sent').count(),
                'received': PurchaseOrder.objects.filter(status='received').count(),
            },
            'vendor_bills': {
                'total': VendorBill.objects.count(),
                'pending': VendorBill.objects.filter(status='pending').count(),
                'paid': VendorBill.objects.filter(status='paid').count(),
                'overdue': VendorBill.objects.filter(status='overdue').count(),
                'total_amount': VendorBill.objects.aggregate(total=Sum('grand_total'))['total'] or 0,
                'pending_amount': VendorBill.objects.filter(status='pending').aggregate(total=Sum('balance_due'))['total'] or 0,
            },
            'sales_orders': {
                'total': SalesOrder.objects.count(),
                'draft': SalesOrder.objects.filter(status='draft').count(),
                'confirmed': SalesOrder.objects.filter(status='confirmed').count(),
                'delivered': SalesOrder.objects.filter(status='delivered').count(),
            },
            'customer_invoices': {
                'total': CustomerInvoice.objects.count(),
                'pending': CustomerInvoice.objects.filter(status='pending').count(),
                'paid': CustomerInvoice.objects.filter(status='paid').count(),
                'overdue': CustomerInvoice.objects.filter(status='overdue').count(),
                'total_amount': CustomerInvoice.objects.aggregate(total=Sum('grand_total'))['total'] or 0,
                'pending_amount': CustomerInvoice.objects.filter(status='pending').aggregate(total=Sum('balance_due'))['total'] or 0,
            },
            'payments': {
                'total': Payment.objects.count(),
                'customer_payments': Payment.objects.filter(payment_type='customer_payment').count(),
                'vendor_payments': Payment.objects.filter(payment_type='vendor_payment').count(),
                'total_amount': Payment.objects.aggregate(total=Sum('amount'))['total'] or 0,
            }
        }
    else:
        # Contact user summary
        try:
            contact = request.user.contact_profile
            summary = {
                'invoices': {
                    'total': CustomerInvoice.objects.filter(customer=contact).count(),
                    'pending': CustomerInvoice.objects.filter(customer=contact, status='pending').count(),
                    'paid': CustomerInvoice.objects.filter(customer=contact, status='paid').count(),
                    'total_amount_due': CustomerInvoice.objects.filter(customer=contact, status='pending').aggregate(total=Sum('balance_due'))['total'] or 0,
                },
                'bills': {
                    'total': VendorBill.objects.filter(vendor=contact).count(),
                    'pending': VendorBill.objects.filter(vendor=contact, status='pending').count(),
                    'paid': VendorBill.objects.filter(vendor=contact, status='paid').count(),
                    'total_amount_due': VendorBill.objects.filter(vendor=contact, status='pending').aggregate(total=Sum('balance_due'))['total'] or 0,
                }
            }
        except:
            summary = {'error': 'Contact profile not found'}
    
    return Response(summary)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_transactions(request):
    """Get pending transactions for payment processing"""
    user = request.user
    
    if user.is_admin() or user.is_invoicing_user():
        # Get all pending invoices and bills
        pending_invoices = CustomerInvoice.objects.filter(status='pending').select_related('customer')
        pending_bills = VendorBill.objects.filter(status='pending').select_related('vendor')
        
        return Response({
            'pending_invoices': CustomerInvoiceListSerializer(pending_invoices, many=True).data,
            'pending_bills': VendorBillListSerializer(pending_bills, many=True).data,
        })
    else:
        # Get pending transactions for the contact user
        try:
            contact = request.user.contact_profile
            pending_invoices = CustomerInvoice.objects.filter(customer=contact, status='pending')
            pending_bills = VendorBill.objects.filter(vendor=contact, status='pending')
            
            return Response({
                'pending_invoices': CustomerInvoiceListSerializer(pending_invoices, many=True).data,
                'pending_bills': VendorBillListSerializer(pending_bills, many=True).data,
            })
        except:
            return Response({'error': 'Contact profile not found'}, status=status.HTTP_404_NOT_FOUND)
