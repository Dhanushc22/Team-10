from django.db import models
from django.core.validators import MinValueValidator
from master_data.models import Contact, Product, Tax, ChartOfAccount
from accounts.models import User


class PurchaseOrder(models.Model):
    """Purchase Order model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ]
    
    po_number = models.CharField(max_length=50, unique=True)
    po_date = models.DateField()
    vendor = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='purchase_orders')
    delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_purchase_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'purchase_orders'
        ordering = ['-po_date', '-created_at']
    
    def __str__(self):
        return f"PO-{self.po_number} - {self.vendor.name}"
    
    @property
    def is_fully_paid(self):
        """Check if this purchase order is fully paid via vendor bills"""
        # If no vendor bills exist, it's not paid
        if not self.vendor_bills.exists():
            return False
        
        # Calculate total paid amount from all related vendor bills
        total_bill_amount = self.vendor_bills.aggregate(
            total=models.Sum('grand_total')
        )['total'] or 0
        
        total_paid_amount = self.vendor_bills.aggregate(
            total=models.Sum('paid_amount')
        )['total'] or 0
        
        # Check if all bills are paid (paid amount >= bill amount)
        return total_paid_amount >= total_bill_amount and total_bill_amount > 0
    
    @property 
    def payment_status(self):
        """Get payment status string"""
        if not self.vendor_bills.exists():
            return 'unpaid'
        elif self.is_fully_paid:
            return 'paid'
        else:
            # Check if partially paid
            total_paid = self.vendor_bills.aggregate(
                total=models.Sum('paid_amount')
            )['total'] or 0
            return 'partial' if total_paid > 0 else 'unpaid'


class PurchaseOrderItem(models.Model):
    """Purchase Order Line Items"""
    
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'purchase_order_items'
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} x {self.unit_price}"


class VendorBill(models.Model):
    """Vendor Bill model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    bill_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='vendor_bills')
    bill_date = models.DateField()
    due_date = models.DateField()
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, blank=True, null=True, related_name='vendor_bills')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_vendor_bills')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vendor_bills'
        ordering = ['-bill_date', '-created_at']
    
    def __str__(self):
        return f"Bill-{self.bill_number} - {self.vendor.name}"
    
    def save(self, *args, **kwargs):
        self.balance_due = self.grand_total - self.paid_amount
        
        # Auto-update status based on payment
        if self.paid_amount >= self.grand_total:
            self.status = 'paid'
        elif self.paid_amount > 0:
            # Keep existing status for partial payments unless it's already paid
            if self.status not in ['paid', 'cancelled']:
                pass  # Keep current status (pending/overdue)
        
        super().save(*args, **kwargs)


class VendorBillItem(models.Model):
    """Vendor Bill Line Items"""
    
    vendor_bill = models.ForeignKey(VendorBill, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'vendor_bill_items'
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} x {self.unit_price}"


class SalesOrder(models.Model):
    """Sales Order model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    so_number = models.CharField(max_length=50, unique=True)
    so_date = models.DateField()
    customer = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='sales_orders')
    delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sales_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sales_orders'
        ordering = ['-so_date', '-created_at']
    
    def __str__(self):
        return f"SO-{self.so_number} - {self.customer.name}"
    
    @property
    def is_fully_paid(self):
        """Check if this sales order is fully paid via customer invoices"""
        # If no customer invoices exist, it's not paid
        if not self.customer_invoices.exists():
            return False
        
        # Calculate total paid amount from all related customer invoices
        total_invoice_amount = self.customer_invoices.aggregate(
            total=models.Sum('grand_total')
        )['total'] or 0
        
        total_paid_amount = self.customer_invoices.aggregate(
            total=models.Sum('paid_amount')
        )['total'] or 0
        
        # Check if all invoices are paid (paid amount >= invoice amount)
        return total_paid_amount >= total_invoice_amount and total_invoice_amount > 0
    
    @property 
    def payment_status(self):
        """Get payment status string"""
        if not self.customer_invoices.exists():
            return 'unpaid'
        elif self.is_fully_paid:
            return 'paid'
        else:
            # Check if partially paid
            total_paid = self.customer_invoices.aggregate(
                total=models.Sum('paid_amount')
            )['total'] or 0
            return 'partial' if total_paid > 0 else 'unpaid'


class SalesOrderItem(models.Model):
    """Sales Order Line Items"""
    
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'sales_order_items'
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} x {self.unit_price}"


class CustomerInvoice(models.Model):
    """Customer Invoice model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='customer_invoices')
    invoice_date = models.DateField()
    due_date = models.DateField()
    reference = models.CharField(max_length=255, blank=True, null=True)
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, blank=True, null=True, related_name='customer_invoices')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_customer_invoices')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_invoices'
        ordering = ['-invoice_date', '-created_at']
    
    def __str__(self):
        return f"INV-{self.invoice_number} - {self.customer.name}"
    
    def save(self, *args, **kwargs):
        self.balance_due = self.grand_total - self.paid_amount
        
        # Auto-update status based on payment
        if self.paid_amount >= self.grand_total:
            self.status = 'paid'
        elif self.paid_amount > 0:
            # Keep existing status for partial payments unless it's already paid
            if self.status not in ['paid', 'cancelled']:
                pass  # Keep current status (pending/overdue)
        
        super().save(*args, **kwargs)


class CustomerInvoiceItem(models.Model):
    """Customer Invoice Line Items"""
    
    customer_invoice = models.ForeignKey(CustomerInvoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'customer_invoice_items'
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} x {self.unit_price}"


class Payment(models.Model):
    """Payment model for both customer and vendor payments"""
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank', 'Bank'),
        ('cheque', 'Cheque'),
        ('online', 'Online'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('customer_payment', 'Customer Payment'),
        ('vendor_payment', 'Vendor Payment'),
    ]
    
    payment_number = models.CharField(max_length=50, unique=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0.01)])
    reference = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date', '-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-generate payment number if not provided
        if not self.payment_number:
            from django.db import transaction
            import time
            
            with transaction.atomic():
                # Use a more robust approach with database locking
                # Get the current maximum ID to use as a base
                try:
                    # Use the auto-increment ID as base for uniqueness
                    # This ensures even simultaneous requests get different numbers
                    temp_save = kwargs.get('force_insert', False)
                    
                    # First, save with a temporary number to get the ID
                    temp_number = f'TEMP-{int(time.time() * 1000000)}'
                    self.payment_number = temp_number
                    
                    # Save to get the auto-generated ID
                    super().save(*args, **kwargs)
                    
                    # Now create the final payment number using the ID
                    timestamp = int(time.time())
                    final_number = f'PAY-{timestamp}{self.id:04d}'
                    
                    # Update with the final number
                    Payment.objects.filter(id=self.id).update(payment_number=final_number)
                    self.payment_number = final_number
                    
                    return  # Exit early since we've already saved
                    
                except Exception as e:
                    # Fallback to UUID if anything goes wrong
                    import uuid
                    self.payment_number = f'PAY-{uuid.uuid4().hex[:12].upper()}'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.payment_number} - {self.contact.name}"


class PaymentAllocation(models.Model):
    """Payment allocation to specific invoices/bills"""
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='allocations')
    customer_invoice = models.ForeignKey(CustomerInvoice, on_delete=models.CASCADE, blank=True, null=True, related_name='payment_allocations')
    vendor_bill = models.ForeignKey(VendorBill, on_delete=models.CASCADE, blank=True, null=True, related_name='payment_allocations')
    allocated_amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0.01)])
    
    class Meta:
        db_table = 'payment_allocations'
    
    def __str__(self):
        if self.customer_invoice:
            return f"Payment allocation for Invoice {self.customer_invoice.invoice_number}"
        elif self.vendor_bill:
            return f"Payment allocation for Bill {self.vendor_bill.bill_number}"
        return f"Payment allocation {self.id}"
