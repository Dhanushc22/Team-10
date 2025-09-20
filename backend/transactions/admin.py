from django.contrib import admin
from .models import PurchaseOrder, VendorBill, SalesOrder, CustomerInvoice, Payment

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'vendor', 'grand_total', 'status', 'po_date', 'created_at')
    list_filter = ('status', 'po_date', 'created_at')
    search_fields = ('po_number', 'vendor__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'po_date'

@admin.register(VendorBill)
class VendorBillAdmin(admin.ModelAdmin):
    list_display = ('bill_number', 'vendor', 'grand_total', 'status', 'bill_date', 'due_date')
    list_filter = ('status', 'bill_date', 'due_date')
    search_fields = ('bill_number', 'vendor__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'bill_date'

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('so_number', 'customer', 'grand_total', 'status', 'so_date', 'created_at')
    list_filter = ('status', 'so_date', 'created_at')
    search_fields = ('so_number', 'customer__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'so_date'

@admin.register(CustomerInvoice)
class CustomerInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'grand_total', 'status', 'invoice_date', 'due_date')
    list_filter = ('status', 'invoice_date', 'due_date')
    search_fields = ('invoice_number', 'customer__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'invoice_date'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'contact', 'amount', 'payment_type', 'payment_method', 'payment_date')
    list_filter = ('payment_type', 'payment_method', 'payment_date')
    search_fields = ('payment_number', 'contact__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'payment_date'
