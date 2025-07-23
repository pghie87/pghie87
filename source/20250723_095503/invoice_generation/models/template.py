```python
from django.db import models
from django.utils import timezone
import uuid
import json

class Template(models.Model):
    """
    Model representing an invoice template
    
    Templates define the structure, layout, and formatting
    of generated invoices
    """
    
    template_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    version = models.CharField(max_length=20, default='1.0')
    client_id = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # JSON field for layout configuration
    layout = models.JSONField(default=dict)
    
    # Tracking fields
    created_date = models.DateTimeField(default=timezone.now)
    created_by = models.CharField(max_length=50)
    last_modified = models.DateTimeField(auto_now=True)
    last_modified_by = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        db_table = 'template'
        unique_together = ('name', 'version', 'client_id')
        indexes = [
            models.Index(fields=['client_id', 'is_active']),
        ]
    
    def render(self, data):
        """
        Render the template with provided data
        
        Args:
            data (dict): Data to be inserted into the template
            
        Returns:
            str: Rendered HTML content
        """
        # This is a placeholder for actual rendering logic
        # In a real implementation, this would use the layout definition
        # to generate HTML with the provided data
        try:
            # Sample rendering logic - would be more complex in reality
            sections = self.get_sections()
            rendered_content = []
            
            for section in sections:
                if self._should_render_section(section, data):
                    rendered_section = self._render_section(section, data)
                    rendered_content.append(rendered_section)
            
            return "\n".join(rendered_content)
        except Exception as e:
            raise TemplateRenderError(f"Failed to render template: {str(e)}")
    
    def validate(self):
        """
        Validate template structure and required fields
        
        Returns:
            list: List of validation errors, empty if valid
        """
        errors = []
        
        # Check required fields
        if not self.name:
            errors.append("Template name is required")
        
        # Validate layout structure
        try:
            # Ensure layout has required components
            layout = self.layout
            if not layout:
                errors.append("Template layout is empty")
            
            # Validate sections exist
            if 'sections' not in layout:
                errors.append("Template must have sections defined")
            elif not isinstance(layout['sections'], list):
                errors.append("Template sections must be a list")
            elif len(layout['sections']) == 0:
                errors.append("Template must have at least one section")
                
            # Check for header section
            header_exists = False
            for section in layout.get('sections', []):
                if section.get('type') == 'header':
                    header_exists = True
                    break
            
            if not header_exists:
                errors.append("Template must have a header section")
            
        except Exception as e:
            errors.append(f"Invalid layout structure: {str(e)}")
            
        return errors
    
    def get_sections(self):
        """
        Get all sections defined in the template
        
        Returns:
            list: List of section objects
        """
        return self.layout.get('sections', [])
    
    def _should_render_section(self, section, data):
        """
        Determine if a section should be rendered based on conditions
        
        Args:
            section (dict): Section definition
            data (dict): Data available for rendering
            
        Returns:
            bool: Whether the section should be rendered
        """
        conditions = section.get('conditions', [])
        
        # If no conditions, always render
        if not conditions:
            return True
        
        # Check each condition
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if not field or not operator:
                continue
                
            field_value = data.get(field)
            
            if operator == 'equals' and field_value != value:
                return False
            elif operator == 'not_equals' and field_value == value:
                return False
            elif operator == 'contains' and value not in str(field_value):
                return False
            elif operator == 'greater_than' and not (field_value and field_value > value):
                return False
            elif operator == 'less_than' and not (field_value and field_value < value):
                return False
                
        return True
    
    def _render_section(self, section, data):
        """
        Render a single section with the provided data
        
        Args:
            section (dict): Section definition
            data (dict): Data available for rendering
            
        Returns:
            str: Rendered HTML content for the section
        """
        section_type = section.get('type', '')
        content = section.get('content', '')
        
        # This is simplified - real implementation would be more complex
        # and would handle different section types differently
        if section_type == 'header':
            return f"<header>{self._replace_placeholders(content, data)}</header>"
        elif section_type == 'footer':
            return f"<footer>{self._replace_placeholders(content, data)}</footer>"
        elif section_type == 'table':
            return self._render_table_section(section, data)
        else:
            return f"<div class='{section_type}'>{self._replace_placeholders(content, data)}</div>"
    
    def _replace_placeholders(self, content, data):
        """
        Replace placeholders in content with actual data
        
        Args:
            content (str): Content with placeholders
            data (dict): Data to substitute
            
        Returns:
            str: Content with placeholders replaced
        """
        result = content
        
        # Replace simple placeholders like {{field_name}}
        import re
        placeholders = re.findall(r'{{(.*?)}}', content)
        
        for placeholder in placeholders:
            field_name = placeholder.strip()
            field_value = str(data.get(field_name, ''))
            result = result.replace(f"{{{{{field_name}}}}}", field_value)
            
        return result
    
    def _render_table_section(self, section, data):
        """
        Render a table section with the provided data
        
        Args:
            section (dict): Table section definition
            data (dict): Data available for rendering
            
        Returns:
            str: Rendered HTML table
        """
        data_source = section.get('data_source', '')
        columns = section.get('columns', [])
        
        if not data_source or not columns:
            return "<div>Invalid table configuration</div>"
            
        items = data.get(data_source, [])
        if not items:
            return "<div>No data available for table</div>"
            
        # Generate table HTML
        html = "<table border='1'><thead><tr>"
        
        # Headers
        for column in columns:
            html += f"<th>{column.get('header', '')}</th>"
        html += "</tr></thead><tbody>"
        
        # Rows
        for item in items:
            html += "<tr>"
            for column in columns:
                field = column.get('field', '')
                value = item.get(field, '')
                html += f"<td>{value}</td>"
            html += "</tr>"
            
        html += "</tbody></table>"
        return html
    
    def __str__(self):
        client_info = f" ({self.client_id})" if self.client_id else ""
        return f"{self.name} v{self.version}{client_info}"


class TemplateSection(models.Model):
    """
    Model representing a section within a template
    
    Each template consists of multiple sections that can be
    conditionally rendered based on invoice data
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        'Template', 
        on_delete=models.CASCADE,
        related_name='sections'
    )
    section_id = models.CharField(max_length=50)
    type = models.CharField(max_length=50)  # header, footer, items, summary, etc.
    title = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    
    # JSON fields for advanced configuration
    conditions = models.JSONField(null=True, blank=True)
    styling = models.JSONField(null=True, blank=True)
    
    # Ordering within the template
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'template_section'
        ordering = ['order']
    
    def evaluate(self, data):
        """
        Evaluate whether this section should be rendered
        based on conditions and provided data
        
        Args:
            data (dict): Invoice data to evaluate against conditions
            
        Returns:
            bool: Whether the section should be rendered
        """
        if not self.conditions:
            return True
            
        try:
            conditions = self.conditions if isinstance(self.conditions, list) else []
            
            for condition in conditions:
                field = condition.get('field')
                operator = condition.get('operator')
                expected_value = condition.get('value')
                
                if not field or not operator:
                    continue
                    
                actual_value = data.get(field)
                
                if operator == 'equals' and actual_value != expected_value:
                    return False
                elif operator == 'not_equals' and actual_value == expected_value:
                    return False
                elif operator == 'contains' and expected_value not in str(actual_value):
                    return False
                elif operator == 'greater_than' and not (actual_value and actual_value > expected_value):
                    return False
                elif operator == 'less_than' and not (actual_value and actual_value < expected_value):
                    return False
                    
            return True
        except Exception as e:
            # Log error but default to showing the section
            print(f"Error evaluating section condition: {str(e)}")
            return True
    
    def render(self, data):
        """
        Render the section with provided data
        
        Args:
            data (dict): Data to be inserted into the section
            
        Returns:
            str: Rendered HTML content for this section
        """
        # Simplified rendering - real implementation would be more complex
        try:
            if self.type == 'header':
                return self._render_header(data)
            elif self.type == 'footer':
                return self._render_footer(data)
            elif self.type == 'items':
                return self._render_items(data)
            elif self.type == 'summary':
                return self._render_summary(data)
            else:
                return self._render_generic(data)
        except Exception as e:
            return f"<div class='error'>Error rendering section: {str(e)}</div>"
    
    def _render_header(self, data):
        """Render a header section"""
        content = self.content or ""
        
        # Replace placeholders
        import re
        placeholders = re.findall(r'{{(.*?)}}', content)
        
        for placeholder in placeholders:
            field_name = placeholder.strip()
            field_value = str(data.get(field_name, ''))
            content = content.replace(f"{{{{{field_name}}}}}", field_value)
        
        return f"<header>{content}</header>"
    
    def _render_footer(self, data):
        """Render a footer section"""
        content = self.content or ""
        
        # Replace placeholders
        import re
        placeholders = re.findall(r'{{(.*?)}}', content)
        
        for placeholder in placeholders:
            field_name = placeholder.strip()
            field_value = str(data.get(field_name, ''))
            content = content.replace(f"{{{{{field_name}}}}}", field_value)
        
        return f"<footer>{content}</footer>"
    
    def _render_items(self, data):
        """Render an items section with table of line items"""
        items = data.get('items', [])
        
        if not items:
            return "<div>No items to display</div>"
            
        html = "<table class='items'><thead><tr>"
        html += "<th>Description</th>"
        html += "<th>Quantity</th>"
        html += "<th>Rate</th>"
        html += "<th>Amount</th>"
        html += "</tr></thead><tbody>"
        
        for item in items:
            html += "<tr>"
            html += f"<td>{item.get('description', '')}</td>"
            html += f"<td>{item.get('quantity', '')}</td>"
            html += f"<td>{item.get('rate', '')}</td>"
            html += f"<td>{item.get('amount', '')}</td>"
            html += "</tr>"
            
        html += "</tbody></table>"
        return html
    
    def _render_summary(self, data):
        """Render a summary section with totals"""
        html = "<div class='summary'>"
        html += "<table>"
        html += f"<tr><td>Subtotal</td><td>{data.get('subtotal_amount', '')}</td></tr>"
        
        # Tax details
        tax_details = data.get('tax_details', [])
        for tax in tax_details:
            html += f"<tr><td>{tax.get('tax_type', '')} ({tax.get('tax_rate', '')}%)</td>"
            html += f"<td>{tax.get('tax_amount', '')}</td></tr>"
        
        html += f"<tr class='total'><td>Total</td><td>{data.get('total_amount', '')}</td></tr>"
        html += "</table></div>"
        return html
    
    def _render_generic(self, data):
        """Render a generic section"""
        content = self.content or ""
        
        # Replace placeholders
        import re
        placeholders = re.findall(r'{{(.*?)}}', content)
        
        for placeholder in placeholders:
            field_name = placeholder.strip()
            field_value = str(data.get(field_name, ''))
            content = content.replace(f"{{{{{field_name}}}}}", field_value)
        
        title = self.title or ""
        if title:
            return f"<section><h2>{title}</h2>{content}</section>"
        else:
            return f"<section>{content}</section>"
    
    def __str__(self):
        return f"{self.type} section for {self.template.name}"


class TemplateRenderError(Exception):
    """Exception raised for errors during template rendering"""
    pass
```