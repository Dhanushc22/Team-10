from rest_framework import serializers
from .models import (
    PurchaseOrder, PurchaseOrderItem, VendorBill, VendorBillItem,
    SalesOrder, SalesOrderItem, CustomerInvoice, CustomerInvoiceItem,
    Payment, PaymentAllocation
)
from master_data.serializers import ContactListSerializer, ProductListSerializer


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Order Items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_id', 'product_name', 'quantity', 
                 'unit_price', 'tax_percent', 'tax_amount', 'total']
        read_only_fields = ['id', 'tax_amount', 'total']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer for Purchase Orders"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor = ContactListSerializer(read_only=True)
    vendor_id = serializers.IntegerField(write_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'po_date', 'vendor', 'vendor_id', 'vendor_name',
                 'delivery_date', 'status', 'subtotal', 'tax_total',
                 'grand_total', 'items', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'po_number', 'subtotal', 'tax_total', 'grand_total', 'created_at', 'updated_at']


class VendorBillItemSerializer(serializers.ModelSerializer):
    """Serializer for Vendor Bill Items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = VendorBillItem
        fields = ['id', 'product', 'product_id', 'product_name', 'quantity', 
                 'unit_price', 'tax_percent', 'tax_amount', 'total']
        read_only_fields = ['id', 'tax_amount', 'total']


class VendorBillSerializer(serializers.ModelSerializer):
    """Serializer for Vendor Bills"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor = ContactListSerializer(read_only=True)
    vendor_id = serializers.IntegerField(write_only=True)
    items = VendorBillItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = VendorBill
        fields = ['id', 'bill_number', 'vendor', 'vendor_id', 'vendor_name',
                 'bill_date', 'due_date', 'purchase_order',
                 'status', 'subtotal', 'tax_total', 'grand_total', 'paid_amount',
                 'balance_due', 'items', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'bill_number', 'subtotal', 'tax_total', 'grand_total', 
                           'paid_amount', 'balance_due', 'created_at', 'updated_at']


class SalesOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for Sales Order Items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SalesOrderItem
        fields = ['id', 'product', 'product_id', 'product_name', 'quantity', 
                 'unit_price', 'tax_percent', 'tax_amount', 'total']
        read_only_fields = ['id', 'tax_amount', 'total']


class SalesOrderSerializer(serializers.ModelSerializer):
    """Serializer for Sales Orders"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer = ContactListSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    items = SalesOrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = ['id', 'so_number', 'so_date', 'customer', 'customer_id', 'customer_name',
                 'delivery_date', 'status', 'subtotal', 'tax_total',
                 'grand_total', 'items', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'so_number', 'subtotal', 'tax_total', 'grand_total', 'created_at', 'updated_at']


class CustomerInvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for Customer Invoice Items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CustomerInvoiceItem
        fields = ['id', 'product', 'product_id', 'product_name', 'quantity', 
                 'unit_price', 'tax_percent', 'tax_amount', 'total']
        read_only_fields = ['id', 'tax_amount', 'total']


class CustomerInvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Customer Invoices"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer = ContactListSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    items = CustomerInvoiceItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = CustomerInvoice
        fields = ['id', 'invoice_number', 'customer', 'customer_id', 'customer_name',
                 'invoice_date', 'due_date', 'reference', 'sales_order',
                 'status', 'subtotal', 'tax_total', 'grand_total', 'paid_amount',
                 'balance_due', 'items', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'invoice_number', 'subtotal', 'tax_total', 'grand_total', 
                           'paid_amount', 'balance_due', 'created_at', 'updated_at']


class PaymentAllocationSerializer(serializers.ModelSerializer):
    """Serializer for Payment Allocations"""
    customer_invoice_number = serializers.CharField(source='customer_invoice.invoice_number', read_only=True)
    vendor_bill_number = serializers.CharField(source='vendor_bill.bill_number', read_only=True)
    
    class Meta:
        model = PaymentAllocation
        fields = ['id', 'customer_invoice', 'vendor_bill', 'customer_invoice_number',
                 'vendor_bill_number', 'allocated_amount']
        read_only_fields = ['id']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payments"""
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact = ContactListSerializer(read_only=True)
    contact_id = serializers.IntegerField(write_only=True)
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'payment_number', 'payment_type', 'contact', 'contact_id', 'contact_name',
                 'payment_date', 'payment_method', 'amount', 'reference', 'notes',
                 'allocations', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'payment_number', 'created_at', 'updated_at']


# Simplified serializers for lists
class PurchaseOrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for Purchase Order lists"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    has_vendor_bills = serializers.SerializerMethodField()
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'po_date', 'vendor_name', 'status', 'grand_total', 'has_vendor_bills']
    
    def get_has_vendor_bills(self, obj):
        """Check if this PO has been converted to vendor bills"""
        return obj.vendor_bills.exists()


class VendorBillListSerializer(serializers.ModelSerializer):
    """Simplified serializer for Vendor Bill lists"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = VendorBill
        fields = ['id', 'bill_number', 'vendor_name', 'bill_date', 'due_date', 'status', 'grand_total', 'balance_due']


class SalesOrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for Sales Order lists"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    has_customer_invoices = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesOrder
        fields = ['id', 'so_number', 'so_date', 'customer_name', 'status', 'grand_total', 'has_customer_invoices']
    
    def get_has_customer_invoices(self, obj):
        """Check if this SO has been converted to customer invoices"""
        return obj.customer_invoices.exists()


class CustomerInvoiceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for Customer Invoice lists"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = CustomerInvoice
        fields = ['id', 'invoice_number', 'customer_name', 'invoice_date', 'due_date', 'status', 'grand_total', 'balance_due']


class PaymentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for Payment lists"""
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'payment_number', 'payment_type', 'contact_name', 'payment_date', 'payment_method', 'amount']
