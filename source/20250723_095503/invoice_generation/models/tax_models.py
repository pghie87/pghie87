```python
from django.db import models
from django.utils import timezone
import uuid

class TaxRule(models.Model):
    """
    Model representing a tax rule
    
    Tax rules define how taxes should be calculated for
    different scenarios based on various conditions
    """
    
    rule_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tax_type = models.CharField(max_length=20)  # CGST, SGST, IGST, etc.
    rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    description = models.TextField(null=True, blank=True)
    
    # Validity period
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    
    # Additional conditions stored as JSON
    conditions = models.JSONField(default=dict)
    
    # HSN code information
    hsn_code = models.CharField(max_length=20, null=True, blank=True, db_index=True)
    
    # Tracking fields
    created_date = models.DateTimeField(default=timezone.now)
    created_by = models.CharField(max_length=50)
    last_modified = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tax_rule'
        indexes = [
            models.Index(fields=['tax_type', 'effective_from']),
            models.Index(fields=['hsn_code']),
        ]
    
    def is_applicable(self, context):
        """
        Check if this tax rule is applicable to the given context
        
        Args:
            context (dict): Context information for tax calculation
            
        Returns:
            bool: Whether the rule is applicable
        """
        try:
            # Check if rule is currently effective
            current_date = context.get('date', timezone.now().date())
            if current_date < self.effective_from:
                return False
                
            if self.effective_to and current_date > self.effective_to:
                return False
                
            # Check HSN code if applicable
            if self.hsn_code and context.get('hsn_code'):
                if self.hsn_code != context.get('hsn_code'):
                    return False
            
            # Check additional conditions
            if self.conditions:
                # Source and destination state check for IGST
                if self.tax_type == 'IGST':
                    from_state = context.get('from_state')
                    to_state = context.get('to_state')
                    
                    if from_state and to_state and from_state == to_state:
                        return False  # IGST doesn't apply to intrastate
                
                # Source and destination state check for CGST/SGST
                if self.tax_type in ('CGST', 'SGST'):
                    from_state = context.get('from_state')
                    to_state = context.get('to_state')
                    
                    if from_state and to_state and from_state != to_state:
                        return False  # CGST/SGST don't apply to interstate
                
                # Check other custom conditions
                for condition_key, condition_value in self.conditions.items():
                    if condition_key not in context:
                        continue
                        
                    context_value = context.get(condition_key)
                    
                    # Handle various condition types
                    if isinstance(condition_value, dict):
                        operator = condition_value.get('operator')
                        value = condition_value.get('value')
                        
                        if operator == 'equals' and context_value != value:
                            return False
                        elif operator == 'not_equals' and context_value == value:
                            return False
                        elif operator == 'greater_than' and not (context_value and context_value > value):
                            return False
                        elif operator == 'less_than' and not (context_value and context_value < value):
                            return False
                    else:
                        # Direct equality comparison
                        if context_value != condition_value:
                            return False
            
            return True
        except Exception as e:
            print(f"Error evaluating tax rule applicability: {str(e)}")
            return False
    
    def calculate_tax(self, amount):
        """
        Calculate tax amount based on the rule's rate
        
        Args:
            amount (decimal): The amount to tax
            
        Returns:
            decimal: The calculated tax amount
        """
        try:
            if amount is None:
                return 0
                
            return (amount * self.rate) / 100
        except Exception as e:
            print(f"Error calculating tax: {str(e)}")
            return 0
    
    def __str__(self):
        return f"{self.tax_type} @ {self.rate}% ({self.effective_from} to {self.effective_to or 'ongoing'})"


class TaxJurisdiction(models.Model):
    """
    Model representing a tax jurisdiction
    
    Maps states and regions to their applicable tax rules
    and maintains information needed for proper tax calculation
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    state_code = models.CharField(max_length=2)
    is_union_territory = models.BooleanField(default=False)
    
    # GST registration details for the state
    state_gst_code = models.CharField(max_length=10, null=True, blank=True)
    
    # Additional jurisdiction info as JSON
    additional_info = models.JSONField(null=True, blank=True)
    
    class Meta:
        db_table = 'tax_jurisdiction'
        indexes = [
            models.Index(fields=['state_code']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class HSNCode(models.Model):
    """
    Model representing HSN (Harmonized System Nomenclature) codes
    
    Used for classifying goods and services for taxation purposes
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=100, null=True, blank=True)
    
    # Tax rate information
    default_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Tracking fields
    effective_from = models.DateField(default=timezone.now)
    effective_to = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'hsn_code'
    
    def __str__(self):
        return f"{self.code} - {self.description}"
```