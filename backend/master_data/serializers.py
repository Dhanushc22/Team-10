from rest_framework import serializers
from .models import Contact, Product, Tax, ChartOfAccount


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for Contact model"""
    
    class Meta:
        model = Contact
        fields = ['id', 'name', 'type', 'email', 'mobile', 'address', 
                 'city', 'state', 'pincode', 'gst_number', 'profile_image', 'user', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'type', 'sales_price', 'purchase_price', 
                 'sale_tax_percent', 'purchase_tax_percent', 'hsn_code', 
                 'category', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaxSerializer(serializers.ModelSerializer):
    """Serializer for Tax model"""
    
    class Meta:
        model = Tax
        fields = ['id', 'name', 'computation_method', 'applicable_on', 
                 'percentage_value', 'fixed_value', 'description', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate that either percentage_value or fixed_value is provided based on computation_method"""
        computation_method = attrs.get('computation_method')
        percentage_value = attrs.get('percentage_value')
        fixed_value = attrs.get('fixed_value')
        
        if computation_method == 'percentage' and not percentage_value:
            raise serializers.ValidationError("Percentage value is required for percentage computation method")
        
        if computation_method == 'fixed_value' and not fixed_value:
            raise serializers.ValidationError("Fixed value is required for fixed value computation method")
        
        return attrs


class ChartOfAccountSerializer(serializers.ModelSerializer):
    """Serializer for Chart of Account model"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = ChartOfAccount
        fields = ['id', 'name', 'type', 'code', 'parent', 'parent_name', 
                 'full_name', 'description', 'opening_balance', 'current_balance', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactListSerializer(serializers.ModelSerializer):
    """Simplified serializer for contact lists"""
    
    class Meta:
        model = Contact
        fields = ['id', 'name', 'type', 'email', 'mobile', 'gst_number']


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'type', 'sales_price', 'purchase_price', 
                 'sale_tax_percent', 'purchase_tax_percent', 'hsn_code']


class TaxListSerializer(serializers.ModelSerializer):
    """Simplified serializer for tax lists"""
    
    class Meta:
        model = Tax
        fields = ['id', 'name', 'computation_method', 'percentage_value', 'fixed_value']


class ChartOfAccountListSerializer(serializers.ModelSerializer):
    """Simplified serializer for chart of accounts lists"""
    
    class Meta:
        model = ChartOfAccount
        fields = ['id', 'name', 'type', 'code', 'current_balance']
