from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Contact, Product, Tax, ChartOfAccount
from .serializers import (
    ContactSerializer, ProductSerializer, TaxSerializer, ChartOfAccountSerializer,
    ContactListSerializer, ProductListSerializer, TaxListSerializer, ChartOfAccountListSerializer
)


class ContactListCreateView(generics.ListCreateAPIView):
    """View for listing and creating contacts"""
    queryset = Contact.objects.filter(is_active=True)
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['name', 'email', 'mobile']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ContactListSerializer
        return ContactSerializer


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting contacts"""
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        """Soft delete - mark as inactive instead of hard delete"""
        instance.is_active = False
        instance.save()


class ProductListCreateView(generics.ListCreateAPIView):
    """View for listing and creating products"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'category']
    search_fields = ['name', 'hsn_code', 'category', '=id']  # Added =id for exact ID search
    ordering_fields = ['name', 'sales_price', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductListSerializer
        return ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting products"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        """Soft delete - mark as inactive instead of hard delete"""
        instance.is_active = False
        instance.save()


class TaxListCreateView(generics.ListCreateAPIView):
    """View for listing and creating taxes"""
    queryset = Tax.objects.filter(is_active=True)
    serializer_class = TaxSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['computation_method', 'applicable_on']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TaxListSerializer
        return TaxSerializer


class TaxDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting taxes"""
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        """Soft delete - mark as inactive instead of hard delete"""
        instance.is_active = False
        instance.save()


class ChartOfAccountListCreateView(generics.ListCreateAPIView):
    """View for listing and creating chart of accounts"""
    queryset = ChartOfAccount.objects.filter(is_active=True)
    serializer_class = ChartOfAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'parent']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['code', 'name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ChartOfAccountListSerializer
        return ChartOfAccountSerializer


class ChartOfAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting chart of accounts"""
    queryset = ChartOfAccount.objects.all()
    serializer_class = ChartOfAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        """Soft delete - mark as inactive instead of hard delete"""
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def master_data_summary(request):
    """Get summary of all master data"""
    summary = {
        'contacts': {
            'total': Contact.objects.filter(is_active=True).count(),
            'customers': Contact.objects.filter(is_active=True, type='customer').count(),
            'vendors': Contact.objects.filter(is_active=True, type='vendor').count(),
            'both': Contact.objects.filter(is_active=True, type='both').count(),
        },
        'products': {
            'total': Product.objects.filter(is_active=True).count(),
            'goods': Product.objects.filter(is_active=True, type='goods').count(),
            'services': Product.objects.filter(is_active=True, type='service').count(),
        },
        'taxes': {
            'total': Tax.objects.filter(is_active=True).count(),
            'percentage': Tax.objects.filter(is_active=True, computation_method='percentage').count(),
            'fixed': Tax.objects.filter(is_active=True, computation_method='fixed_value').count(),
        },
        'accounts': {
            'total': ChartOfAccount.objects.filter(is_active=True).count(),
            'assets': ChartOfAccount.objects.filter(is_active=True, type='asset').count(),
            'liabilities': ChartOfAccount.objects.filter(is_active=True, type='liability').count(),
            'income': ChartOfAccount.objects.filter(is_active=True, type='income').count(),
            'expenses': ChartOfAccount.objects.filter(is_active=True, type='expense').count(),
            'equity': ChartOfAccount.objects.filter(is_active=True, type='equity').count(),
        }
    }
    
    return Response(summary)
