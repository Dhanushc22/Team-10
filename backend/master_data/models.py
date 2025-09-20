from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User


class Contact(models.Model):
    """Contact Master - Customers and Vendors"""
    
    TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('both', 'Both'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    email = models.EmailField(blank=True, null=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    profile_image = models.ImageField(upload_to='contact_images/', blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True, related_name='contact_profile')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contacts'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Product(models.Model):
    """Product Master - Goods and Services"""
    
    TYPE_CHOICES = [
        ('goods', 'Goods'),
        ('service', 'Service'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    sale_tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    purchase_tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    hsn_code = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Tax(models.Model):
    """Tax Master - GST and other taxes"""
    
    COMPUTATION_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed_value', 'Fixed Value'),
    ]
    
    APPLICABLE_CHOICES = [
        ('sales', 'Sales'),
        ('purchase', 'Purchase'),
        ('both', 'Both'),
    ]
    
    name = models.CharField(max_length=100)
    computation_method = models.CharField(max_length=20, choices=COMPUTATION_CHOICES)
    applicable_on = models.CharField(max_length=20, choices=APPLICABLE_CHOICES)
    percentage_value = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)], blank=True, null=True)
    fixed_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'taxes'
        ordering = ['name']
    
    def __str__(self):
        if self.computation_method == 'percentage':
            return f"{self.name} ({self.percentage_value}%)"
        else:
            return f"{self.name} (₹{self.fixed_value})"


class ChartOfAccount(models.Model):
    """Chart of Accounts Master"""
    
    TYPE_CHOICES = [
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('expense', 'Expense'),
        ('income', 'Income'),
        ('equity', 'Equity'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='children')
    description = models.TextField(blank=True, null=True)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chart_of_accounts'
        ordering = ['code', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_full_name(self):
        """Get full account name with hierarchy"""
        if self.parent:
            return f"{self.parent.get_full_name()} > {self.name}"
        return self.name
