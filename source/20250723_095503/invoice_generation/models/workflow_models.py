```python
from django.db import models
from django.utils import timezone
import uuid
import json

class WorkflowDefinition(models.Model):
    """
    Model defining a workflow template
    
    Contains the structure and steps for workflow processing
    """
    
    WORKFLOW_TYPE_INVOICE = 'INVOICE'
    WORKFLOW_TYPE_APPROVAL = 'APPROVAL'
    WORKFLOW_TYPE_BATCH = 'BATCH'
    
    WORKFLOW_TYPE_CHOICES = [
        (WORKFLOW_TYPE_INVOICE, 'Invoice Generation'),
        (WORKFLOW_TYPE_APPROVAL, 'Approval Process'),
        (WORKFLOW_TYPE_BATCH, 'Batch Processing'),
    ]
    
    workflow_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    workflow_type = models.CharField(
        max_length=20,
        choices=WORKFLOW_TYPE_CHOICES
    )
    
    # JSON definition of workflow