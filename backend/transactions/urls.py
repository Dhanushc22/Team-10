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
]
