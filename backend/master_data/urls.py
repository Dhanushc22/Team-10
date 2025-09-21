from django.urls import path
from . import views
from . import hsn_views

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
    
    # HSN Search URLs
    path('hsn-search/', hsn_views.search_hsn_codes, name='hsn-search'),
    path('hsn-search/mock/', hsn_views.mock_hsn_search, name='hsn-search-mock'),
    
    # Summary
    path('summary/', views.master_data_summary, name='master-data-summary'),
]
