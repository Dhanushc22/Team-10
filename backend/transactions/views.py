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
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from decimal import Decimal


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


# Conversion Endpoints
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def convert_sales_order_to_invoice(request, pk):
    """Convert a Sales Order to a Customer Invoice"""
    so = get_object_or_404(SalesOrder, pk=pk)
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    with db_transaction.atomic():
        invoice = CustomerInvoice.objects.create(
            invoice_number=f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer=so.customer,
            invoice_date=timezone.now().date(),
            due_date=timezone.now().date(),
            reference=so.so_number,
            sales_order=so,
            status='pending',
            subtotal=so.subtotal,
            tax_total=so.tax_total,
            grand_total=so.grand_total,
            created_by=request.user,
        )
        # Create invoice items mirroring SO items
        for item in so.items.all():
            CustomerInvoiceItem.objects.create(
                customer_invoice=invoice,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                tax_amount=item.tax_amount,
                total=item.total,
            )
        serializer = CustomerInvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def convert_purchase_order_to_bill(request, pk):
    """Convert a Purchase Order to a Vendor Bill"""
    po = get_object_or_404(PurchaseOrder, pk=pk)
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    with db_transaction.atomic():
        bill = VendorBill.objects.create(
            bill_number=f"BILL-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            vendor=po.vendor,
            bill_date=timezone.now().date(),
            due_date=timezone.now().date(),
            purchase_order=po,
            status='pending',
            subtotal=po.subtotal,
            tax_total=po.tax_total,
            grand_total=po.grand_total,
            created_by=request.user,
        )
        # Create bill items mirroring PO items
        for item in po.items.all():
            VendorBillItem.objects.create(
                vendor_bill=bill,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                tax_amount=item.tax_amount,
                total=item.total,
            )
        serializer = VendorBillSerializer(bill)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Quick Payment Allocation
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def quick_allocate_payment(request):
    """Create a payment and allocate to a single invoice/bill."""
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    target_type = request.data.get('target_type')  # 'invoice' | 'bill'
    target_id = request.data.get('target_id')
    amount = Decimal(str(request.data.get('amount', '0')))
    method = request.data.get('payment_method', 'cash')

    if target_type not in ['invoice', 'bill'] or amount <= 0:
        return Response({'error': 'Invalid parameters'}, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        if target_type == 'invoice':
            invoice = get_object_or_404(CustomerInvoice, pk=target_id)
            contact = invoice.customer
            payment = Payment.objects.create(
                payment_number=f"PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                payment_type='customer_payment',
                contact=contact,
                payment_date=timezone.now().date(),
                payment_method=method,
                amount=amount,
                created_by=request.user,
            )
            PaymentAllocation.objects.create(
                payment=payment,
                customer_invoice=invoice,
                allocated_amount=amount,
            )
            invoice.paid_amount = (invoice.paid_amount or 0) + amount
            # Auto-update status when fully paid
            if invoice.paid_amount >= invoice.grand_total:
                invoice.status = 'paid'
            invoice.save()
            return Response({'message': 'Payment allocated to invoice', 'payment_number': payment.payment_number})
        else:
            bill = get_object_or_404(VendorBill, pk=target_id)
            contact = bill.vendor
            payment = Payment.objects.create(
                payment_number=f"PAY-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                payment_type='vendor_payment',
                contact=contact,
                payment_date=timezone.now().date(),
                payment_method=method,
                amount=amount,
                created_by=request.user,
            )
            PaymentAllocation.objects.create(
                payment=payment,
                vendor_bill=bill,
                allocated_amount=amount,
            )
            bill.paid_amount = (bill.paid_amount or 0) + amount
            # Auto-update status when fully paid
            if bill.paid_amount >= bill.grand_total:
                bill.status = 'paid'
            bill.save()
            return Response({'message': 'Payment allocated to bill', 'payment_number': payment.payment_number})


# ---------- Create/Update with Items (SO/PO) ----------

def _calc_totals_from_items(items_payload):
    """Given list of items {quantity, unit_price, tax_percent}, return (subtotal, tax_total, grand_total)."""
    subtotal = Decimal('0')
    tax_total = Decimal('0')
    for it in items_payload:
        qty = Decimal(str(it.get('quantity', '0')))
        price = Decimal(str(it.get('unit_price', '0')))
        tax_pct = Decimal(str(it.get('tax_percent', '0')))
        line_sub = qty * price
        line_tax = (line_sub * tax_pct) / Decimal('100')
        subtotal += line_sub
        tax_total += line_tax
    return subtotal, tax_total, subtotal + tax_total


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_sales_order_with_items(request):
    """Create Sales Order with line items and computed totals."""
    print(f"DEBUG: User: {request.user}, Role: {request.user.role}, is_admin: {request.user.is_admin()}, is_invoicing: {request.user.is_invoicing_user()}")
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        customer_id = payload.get('customer_id')
        customer = get_object_or_404(Contact, pk=customer_id)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        so = SalesOrder.objects.create(
            so_number=f"SO-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            so_date=payload.get('so_date') or timezone.now().date(),
            customer=customer,
            delivery_date=payload.get('delivery_date'),
            status=payload.get('status', 'draft'),
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            created_by=request.user,
        )
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            SalesOrderItem.objects.create(
                sales_order=so,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(SalesOrderSerializer(so).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_sales_order_with_items(request, pk):
    """Update Sales Order and replace items."""
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        so = get_object_or_404(SalesOrder, pk=pk)
        if 'customer_id' in payload:
            so.customer = get_object_or_404(Contact, pk=payload['customer_id'])
        so.so_date = payload.get('so_date') or so.so_date
        so.delivery_date = payload.get('delivery_date')
        so.status = payload.get('status', so.status)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        so.subtotal, so.tax_total, so.grand_total = subtotal, tax_total, grand_total
        so.save()
        # replace items
        so.items.all().delete()
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            SalesOrderItem.objects.create(
                sales_order=so,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(SalesOrderSerializer(so).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_purchase_order_with_items(request):
    """Create Purchase Order with line items and computed totals."""
    print(f"DEBUG PO: User: {request.user}, Role: {request.user.role}, is_admin: {request.user.is_admin()}, is_invoicing: {request.user.is_invoicing_user()}")
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        vendor_id = payload.get('vendor_id')
        vendor = get_object_or_404(Contact, pk=vendor_id)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        po = PurchaseOrder.objects.create(
            po_number=f"PO-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            po_date=payload.get('po_date') or timezone.now().date(),
            vendor=vendor,
            delivery_date=payload.get('delivery_date'),
            status=payload.get('status', 'draft'),
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            created_by=request.user,
        )
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_purchase_order_with_items(request, pk):
    """Update Purchase Order and replace items."""
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        po = get_object_or_404(PurchaseOrder, pk=pk)
        if 'vendor_id' in payload:
            po.vendor = get_object_or_404(Contact, pk=payload['vendor_id'])
        po.po_date = payload.get('po_date') or po.po_date
        po.delivery_date = payload.get('delivery_date')
        po.status = payload.get('status', po.status)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        po.subtotal, po.tax_total, po.grand_total = subtotal, tax_total, grand_total
        po.save()
        po.items.all().delete()
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(PurchaseOrderSerializer(po).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_customer_invoice_with_items(request):
    """Create Customer Invoice with line items and computed totals."""
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)

    with db_transaction.atomic():
        customer = get_object_or_404(Contact, pk=payload.get('customer_id'))
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        inv = CustomerInvoice.objects.create(
            invoice_number=f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            customer=customer,
            invoice_date=payload.get('invoice_date') or timezone.now().date(),
            due_date=payload.get('due_date') or timezone.now().date(),
            reference=payload.get('reference'),
            sales_order_id=payload.get('sales_order_id'),
            status=payload.get('status', 'pending'),
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            created_by=request.user,
        )
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            CustomerInvoiceItem.objects.create(
                customer_invoice=inv,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(CustomerInvoiceSerializer(inv).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_customer_invoice_with_items(request, pk):
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)
    with db_transaction.atomic():
        inv = get_object_or_404(CustomerInvoice, pk=pk)
        if 'customer_id' in payload:
            inv.customer = get_object_or_404(Contact, pk=payload['customer_id'])
        inv.invoice_date = payload.get('invoice_date') or inv.invoice_date
        inv.due_date = payload.get('due_date') or inv.due_date
        inv.reference = payload.get('reference', inv.reference)
        inv.status = payload.get('status', inv.status)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        inv.subtotal, inv.tax_total, inv.grand_total = subtotal, tax_total, grand_total
        inv.save()
        inv.items.all().delete()
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            CustomerInvoiceItem.objects.create(
                customer_invoice=inv,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(CustomerInvoiceSerializer(inv).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_vendor_bill_with_items(request):
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)
    with db_transaction.atomic():
        vendor = get_object_or_404(Contact, pk=payload.get('vendor_id'))
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        bill = VendorBill.objects.create(
            bill_number=f"BILL-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            vendor=vendor,
            bill_date=payload.get('bill_date') or timezone.now().date(),
            due_date=payload.get('due_date') or timezone.now().date(),
            purchase_order_id=payload.get('purchase_order_id'),
            status=payload.get('status', 'pending'),
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            created_by=request.user,
        )
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            VendorBillItem.objects.create(
                vendor_bill=bill,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(VendorBillSerializer(bill).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_vendor_bill_with_items(request, pk):
    if not (request.user.is_admin() or request.user.is_invoicing_user()):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    payload = request.data
    items = payload.get('items', [])
    if not items:
        return Response({
            'error': 'At least one line item with a selected product is required',
            'details': 'Please add products to the line items before saving.'
        }, status=status.HTTP_400_BAD_REQUEST)
    with db_transaction.atomic():
        bill = get_object_or_404(VendorBill, pk=pk)
        if 'vendor_id' in payload:
            bill.vendor = get_object_or_404(Contact, pk=payload['vendor_id'])
        bill.bill_date = payload.get('bill_date') or bill.bill_date
        bill.due_date = payload.get('due_date') or bill.due_date
        bill.purchase_order_id = payload.get('purchase_order_id', bill.purchase_order_id)
        bill.status = payload.get('status', bill.status)
        subtotal, tax_total, grand_total = _calc_totals_from_items(items)
        bill.subtotal, bill.tax_total, bill.grand_total = subtotal, tax_total, grand_total
        bill.save()
        bill.items.all().delete()
        for it in items:
            product = get_object_or_404(Product, pk=it.get('product_id'))
            qty = Decimal(str(it.get('quantity', '0')))
            price = Decimal(str(it.get('unit_price', '0')))
            tax_pct = Decimal(str(it.get('tax_percent', '0')))
            line_sub = qty * price
            line_tax = (line_sub * tax_pct) / Decimal('100')
            VendorBillItem.objects.create(
                vendor_bill=bill,
                product=product,
                quantity=qty,
                unit_price=price,
                tax_percent=tax_pct,
                tax_amount=line_tax,
                total=line_sub + line_tax,
            )
        return Response(VendorBillSerializer(bill).data)
