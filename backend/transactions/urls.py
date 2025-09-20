from django.urls import path
from . import views

urlpatterns = [
    # Purchase Order URLs
    path('purchase-orders/', views.PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('purchase-orders/<int:pk>/', views.PurchaseOrderDetailView.as_view(), name='purchase-order-detail'),
    
    # Vendor Bill URLs
    path('vendor-bills/', views.VendorBillListCreateView.as_view(), name='vendor-bill-list-create'),
    path('vendor-bills/<int:pk>/', views.VendorBillDetailView.as_view(), name='vendor-bill-detail'),
    
    # Sales Order URLs
    path('sales-orders/', views.SalesOrderListCreateView.as_view(), name='sales-order-list-create'),
    path('sales-orders/<int:pk>/', views.SalesOrderDetailView.as_view(), name='sales-order-detail'),
    
    # Customer Invoice URLs
    path('customer-invoices/', views.CustomerInvoiceListCreateView.as_view(), name='customer-invoice-list-create'),
    path('customer-invoices/<int:pk>/', views.CustomerInvoiceDetailView.as_view(), name='customer-invoice-detail'),
    
    # Payment URLs
    path('payments/', views.PaymentListCreateView.as_view(), name='payment-list-create'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    
    # Contact User URLs
    path('contact-user/invoices/', views.contact_user_invoices, name='contact-user-invoices'),
    path('contact-user/bills/', views.contact_user_bills, name='contact-user-bills'),
    
    # Summary and Dashboard URLs
    path('summary/', views.transaction_summary, name='transaction-summary'),
    path('pending/', views.pending_transactions, name='pending-transactions'),

    # Conversion and Payments
    path('sales-orders/<int:pk>/convert-to-invoice/', views.convert_sales_order_to_invoice, name='convert-so-to-invoice'),
    path('purchase-orders/<int:pk>/convert-to-bill/', views.convert_purchase_order_to_bill, name='convert-po-to-bill'),
    path('payments/quick-allocate/', views.quick_allocate_payment, name='quick-allocate-payment'),

    # Create/Update with items
    path('sales-orders/create-with-items/', views.create_sales_order_with_items, name='so-create-with-items'),
    path('sales-orders/<int:pk>/update-with-items/', views.update_sales_order_with_items, name='so-update-with-items'),
    path('purchase-orders/create-with-items/', views.create_purchase_order_with_items, name='po-create-with-items'),
    path('purchase-orders/<int:pk>/update-with-items/', views.update_purchase_order_with_items, name='po-update-with-items'),
    path('customer-invoices/create-with-items/', views.create_customer_invoice_with_items, name='inv-create-with-items'),
    path('customer-invoices/<int:pk>/update-with-items/', views.update_customer_invoice_with_items, name='inv-update-with-items'),
    path('vendor-bills/create-with-items/', views.create_vendor_bill_with_items, name='bill-create-with-items'),
    path('vendor-bills/<int:pk>/update-with-items/', views.update_vendor_bill_with_items, name='bill-update-with-items'),
]
