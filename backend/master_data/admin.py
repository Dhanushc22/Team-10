from django.contrib import admin
from .models import Contact, Product, Tax, ChartOfAccount

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'email', 'mobile', 'city', 'is_active', 'created_at')
    list_filter = ('type', 'is_active', 'city', 'state', 'created_at')
    search_fields = ('name', 'email', 'mobile')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'type', 'user')}),
        ('Contact Details', {'fields': ('email', 'mobile', 'profile_image')}),
        ('Address', {'fields': ('address', 'city', 'state', 'pincode')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'sales_price', 'purchase_price', 'sale_tax_percent', 'category', 'is_active')
    list_filter = ('type', 'is_active', 'category', 'created_at')
    search_fields = ('name', 'hsn_code', 'category')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'type', 'category', 'description')}),
        ('Pricing', {'fields': ('sales_price', 'purchase_price')}),
        ('Tax Info', {'fields': ('sale_tax_percent', 'purchase_tax_percent', 'hsn_code')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ('name', 'computation_method', 'applicable_on', 'percentage_value', 'fixed_value', 'is_active')
    list_filter = ('computation_method', 'applicable_on', 'is_active', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ChartOfAccount)
class ChartOfAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'type', 'opening_balance', 'current_balance', 'parent', 'is_active')
    list_filter = ('type', 'is_active', 'created_at')
    search_fields = ('name', 'code')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'code', 'type', 'parent')}),
        ('Balances', {'fields': ('opening_balance', 'current_balance')}),
        ('Details', {'fields': ('description',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
