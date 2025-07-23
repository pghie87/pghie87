```python
from django.db import models
from django.utils import timezone
import uuid

class Invoice(models.Model):
    """
    Model representing an invoice in the system
    
    Stores all invoice data including relationships to trip data,
    client information, and tax details
    """
    
    # Status choices for invoices
    STATUS_DRAFT = 'DRAFT'
    STATUS_PENDING_APPROVAL = 'PENDING_APPROVAL'
    STATUS_APPROVED = 'APPROVED'
    STATUS_REJECTED = 'REJECTED'
    STATUS_SENT = 'SENT'
    STATUS_PAID = 'PAID'
    STATUS_CANCELLED = 'CANCELLED'
    
    INVOICE_STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PENDING_APPROVAL, 'Pending Approval'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_SENT, 'Sent'),
        (STATUS_PAID, 'Paid'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]
    
    # Base invoice fields
    invoice_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    client_id = models.CharField(max_length=50, db_index=True)
    trip_id = models.CharField(max_length=50, db_index=True)
    template_id = models.CharField(max_length=50)
    
    # Date fields
    created_date = models.DateTimeField(default=timezone.now)
    issued_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Financial fields
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    
    # Status and metadata
    status = models.CharField(
        max_length=20, 
        choices=INVOICE_STATUS_CHOICES,
        default=STATUS_DRAFT,
        db_index=True
    )
    is_signed = models.BooleanField(default=False)
    document_url = models.URLField(max_length=255, null=True, blank=True)
    
    # Tracking and audit
    created_by = models.CharField(max_length=50)
    approved_by = models.CharField(max_length=50, null=True, blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    last_modified = models.DateTimeField(auto_now=True)
    last_modified_by = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        db_table = 'invoice'
        ordering = ['-created_date']
        indexes = [
            models.Index(fields=['client_id', 'created_date']),
            models.Index(fields=['status', 'created_date']),
        ]
    
    def calculate_total(self):
        """Calculate the total amount of the invoice"""
        self.total_amount = self.subtotal_amount + self.tax_amount
        return self.total_amount
    
    def validate(self):
        """Validate invoice data completeness and consistency"""
        errors = []
        
        # Check required fields
        if not self.invoice_number:
            errors.append("Invoice number is required")
        if not self.client_id:
            errors.append("Client ID is required")
        if not self.trip_id:
            errors.append("Trip ID is required")
        
        # Validate amounts
        if self.subtotal_amount < 0:
            errors.append("Subtotal amount cannot be negative")
        if self.tax_amount < 0:
            errors.append("Tax amount cannot be negative")
            
        # Verify total calculation
        expected_total = self.subtotal_amount + self.tax_amount
        if abs(self.total_amount - expected_total) > 0.01:
            errors.append("Total amount calculation mismatch")
            
        return errors
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.get_status_display()}"


class InvoiceItem(models.Model):
    """
    Model representing an individual line item in an invoice
    
    Each invoice can have multiple items representing different
    charges or services
    """
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        'Invoice', 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    hsn_code = models.CharField(max_length=20, null=True, blank=True)
    tax_category = models.CharField(max_length=50, null=True, blank=True)
    
    created_date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'invoice_item'
    
    def calculate_amount(self):
        """Calculate the amount based on quantity and rate"""
        self.amount = self.quantity * self.rate
        return self.amount
    
    def __str__(self):
        return f"{self.description} - {self.amount}"


class TaxDetail(models.Model):
    """
    Model representing tax details for an invoice
    
    Stores the breakdown of different tax components
    like CGST, SGST, and IGST
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        'Invoice', 
        on_delete=models.CASCADE,
        related_name='tax_details'
    )
    tax_type = models.CharField(max_length=20)  # CGST, SGST, IGST, etc.
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    
    class Meta:
        db_table = 'tax_detail'
    
    def __str__(self):
        return f"{self.tax_type} @ {self.tax_rate}%: {self.tax_amount}"
```