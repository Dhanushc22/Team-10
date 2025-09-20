from django.db import models
from django.core.validators import MinValueValidator
from master_data.models import Product, ChartOfAccount
from transactions.models import CustomerInvoice, VendorBill, PurchaseOrder, SalesOrder


class StockMovement(models.Model):
    """Stock movement tracking for inventory reports"""
    
    MOVEMENT_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('adjustment', 'Adjustment'),
        ('opening', 'Opening Stock'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_value = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    reference_document = models.CharField(max_length=100, blank=True, null=True)  # PO, SO, Invoice, Bill number
    movement_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-movement_date', '-created_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.movement_type} - {self.quantity}"


class StockBalance(models.Model):
    """Current stock balance for each product"""
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stock_balance')
    opening_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purchased_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sold_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    adjusted_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stock_balances'
    
    def __str__(self):
        return f"{self.product.name} - {self.current_quantity} units"
    
    def save(self, *args, **kwargs):
        # Calculate current quantity
        self.current_quantity = (
            self.opening_quantity + 
            self.purchased_quantity - 
            self.sold_quantity + 
            self.adjusted_quantity
        )
        # Calculate stock value
        self.stock_value = self.current_quantity * self.average_cost
        super().save(*args, **kwargs)
