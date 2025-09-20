from django.urls import path
from . import views

urlpatterns = [
    # Contact URLs
    path('contacts/', views.ContactListCreateView.as_view(), name='contact-list-create'),
    path('contacts/<int:pk>/', views.ContactDetailView.as_view(), name='contact-detail'),
    
    # Product URLs
    path('products/', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Tax URLs
    path('taxes/', views.TaxListCreateView.as_view(), name='tax-list-create'),
    path('taxes/<int:pk>/', views.TaxDetailView.as_view(), name='tax-detail'),
    
    # Chart of Accounts URLs
    path('chart-of-accounts/', views.ChartOfAccountListCreateView.as_view(), name='chart-of-account-list-create'),
    path('chart-of-accounts/<int:pk>/', views.ChartOfAccountDetailView.as_view(), name='chart-of-account-detail'),
    
    # Summary
    path('summary/', views.master_data_summary, name='master-data-summary'),
]
