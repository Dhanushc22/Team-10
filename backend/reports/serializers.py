from rest_framework import serializers
from .models import StockMovement, StockBalance
from master_data.serializers import ProductListSerializer


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for Stock Movement model"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'product_name', 'movement_type', 'quantity', 
                 'unit_price', 'total_value', 'reference_document', 'movement_date', 
                 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class StockBalanceSerializer(serializers.ModelSerializer):
    """Serializer for Stock Balance model"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = StockBalance
        fields = ['id', 'product', 'product_name', 'opening_quantity', 'purchased_quantity',
                 'sold_quantity', 'adjusted_quantity', 'current_quantity', 'average_cost',
                 'stock_value', 'last_updated']
        read_only_fields = ['id', 'current_quantity', 'stock_value', 'last_updated']


class BalanceSheetSerializer(serializers.Serializer):
    """Serializer for Balance Sheet report"""
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_total = serializers.BooleanField(default=False)


class ProfitLossSerializer(serializers.Serializer):
    """Serializer for Profit & Loss report"""
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_total = serializers.BooleanField(default=False)


class PartnerLedgerSerializer(serializers.Serializer):
    """Serializer for Partner Ledger report"""
    date = serializers.DateField()
    transaction_type = serializers.CharField()
    reference = serializers.CharField()
    description = serializers.CharField()
    debit = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit = serializers.DecimalField(max_digits=15, decimal_places=2)
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)


class StockReportSerializer(serializers.Serializer):
    """Serializer for Stock Report"""
    product_name = serializers.CharField()
    product_type = serializers.CharField()
    opening_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    purchased_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    sold_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    current_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
