import uuid
import json
import difflib
import logging
from django.core.files import File
from django.conf import settings
from typing import List, Tuple, Dict, Union, Optional, Any

logger = logging.getLogger(__name__)

class TemplateManager:
    """Implementation of the template management interface"""
    
    def create_template(self, template_data: dict) -> 'Template':
        """
        Create a new template with the provided data
        
        Args:
            template_data (dict): Template data including name, description, etc.
            
        Returns:
            Template: Created template object
            
        Raises:
            ValidationError: If template data is invalid
        """
        from .models import Template
        
        # Validate input data
        required_fields = ['name', 'created_by']
        for field in required_fields:
            if field not in template_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Set default values for missing fields
        template_data.setdefault('description', '')
        template_data.setdefault('status', 'draft')
        template_data.setdefault('content', {})
        
        # Create template record
        template = Template.objects.create(**template_data)
        
        # Initialize template elements if provided
        if 'elements' in template_data:
            self._create_elements(template, template_data['elements'])
            
        # Initialize field mappings if provided
        if 'field_mappings' in template_data:
            self._create_mappings(template, template_data['field_mappings'])
            
        # Set up initial version
        template.create_version(comment="Initial version")
        
        return template
        
    def get_template(self, template_id: uuid.UUID) -> 'Template':
        """
        Retrieve a template by its ID
        
        Args:
            template_id (UUID): Template identifier
            
        Returns:
            Template: Retrieved template
            
        Raises:
            Template.DoesNotExist: If template not found
        """
        from .models import Template
        return Template.objects.get(id=template_id)
        
    def update_template(self, template_id: uuid.UUID, template_data: dict) -> 'Template':
        """
        Update an existing template with new data
        
        Args:
            template_id (UUID): Template identifier
            template_data (dict): Updated template data
            
        Returns:
            Template: Updated template object
            
        Raises:
            Template.DoesNotExist: If template not found
            ValidationError: If template data is invalid
        """
        from .models import Template
        
        # Get template
        template = Template.objects.get(id=template_id)
        
        # Check if we need to create a new version (significant changes)
        create_new_version = self._check_significant_changes(template, template_data)
        
        # Update template fields
        for key, value in template_data.items():
            if key not in ['id', 'created_by', 'created_at', 'elements', 'field_mappings']:
                setattr(template, key, value)
        
        # Save template
        template.save()
        
        # Update elements if provided
        if 'elements' in template_data:
            self._update_elements(template, template_data['elements'])
            
        # Update mappings if provided
        if 'field_mappings' in template_data:
            self._update_mappings(template, template_data['field_mappings'])
            
        # Create new version if needed
        if create_new_version:
            template.create_version(comment="Updated template")
            
        return template
        
    def delete_template(self, template_id: uuid.UUID) -> bool:
        """
        Delete a template by its ID
        
        Args:
            template_id (UUID): Template identifier
            
        Returns:
            bool: Whether deletion was successful
            
        Raises:
            Template.DoesNotExist: If template not found
        """
        from .models import Template
        
        try:
            template = Template.objects.get(id=template_id)
            
            # Check if template is in use
            # This would depend on your specific application logic
            # For example, checking if any invoices use this template
            
            # Perform deletion
            template.delete()
            return True
        except Template.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error deleting template {template_id}: {str(e)}")
            return False
            
    def list_templates(self, filters: dict = None, page: int = 1, page_size: int = 20) -> Tuple[List['Template'], int]:
        """
        List templates with pagination and optional filtering
        
        Args:
            filters (dict): Filtering criteria
            page (int): Page number
            page_size (int): Items per page
            
        Returns:
            Tuple[List[Template], int]: Templates and total count
        """
        from .models import Template
        
        # Start with all templates
        queryset = Template.objects.all()
        
        # Apply filters if provided
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
                
            if 'name' in filters:
                queryset = queryset.filter(name__icontains=filters['name'])
                
            if 'category' in filters:
                queryset = queryset.filter(categories__id=filters['category'])
                
            if 'created_by' in filters:
                queryset = queryset.filter(created_by=filters['created_by'])
                
        # Get total count
        total_count = queryset.count()
        
        # Apply pagination
        start = (page - 1) * page_size
        end = start + page_size
        templates = queryset[start:end]
        
        return list(templates), total_count
        
    def search_templates(self, query: str, filters: dict = None) -> List['Template']:
        """
        Search templates by text query with optional filters
        
        Args:
            query (str): Search query
            filters (dict): Additional filters
            
        Returns:
            List[Template]: Matching templates
        """
        from .models import Template
        from django.db.models import Q
        
        # Basic search query
        queryset = Template.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query)
        )
        
        # Apply additional filters
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
                
            if 'category' in filters:
                queryset = queryset.filter(categories__id=filters['category'])
                
        return list(queryset)
        
    def duplicate_template(self, template_id: uuid.UUID, new_name: str = None) -> 'Template':
        """
        Create a duplicate of an existing template
        
        Args:
            template_id (UUID): Template to duplicate
            new_name (str): Name for the duplicate
            
        Returns:
            Template: Duplicated template
            
        Raises:
            Template.DoesNotExist: If template not found
        """
        from .models import Template, TemplateElement, TemplateFieldMapping
        
        # Get original template
        original = Template.objects.get(id=template_id)
        
        # Create new name if not provided
        if not new_name:
            new_name = f"Copy of {original.name}"
            
        # Create new template
        duplicate = Template.objects.create(
            name=new_name,
            description=original.description,
            status='draft',  # Always start as draft
            created_by=original.created_by,
            content=original.content,
            version=1  # Reset version
        )
        
        # Duplicate elements
        element_map = {}  # Maps original IDs to new IDs
        for element in original.elements.filter(parent=None):
            self._duplicate_element(element, duplicate, element_map)
            
        # Fix parent references in elements
        self._fix_element_parents(duplicate, element_map)
            
        # Duplicate field mappings
        for mapping in original.field_mappings.all():
            element = None
            if mapping.element and mapping.element.id in element_map:
                element = element_map[mapping.element.id]
                
            TemplateFieldMapping.objects.create(
                template=duplicate,
                element=element,
                field_name=mapping.field_name,
                display_name=mapping.display_name,
                data_source_type=mapping.data_source_type,
                data_source_path=mapping.data_source_path,
                default_value=mapping.default_value,
                is_required=mapping.is_required,
                validation_rule=mapping.validation_rule,
                formatting=mapping.formatting
            )
            
        # Set up initial version
        duplicate.create_version(comment="Duplicated from template ID: " + str(original.id))
        
        # Copy categories
        for category in original.categories.all():
            category.templates.add(duplicate)
            
        return duplicate
        
    def recognize_template(self, document_file: File) -> dict:
        """
        Recognize template structure from an uploaded document
        
        Args:
            document_file (File): Document file to analyze
            
        Returns:
            dict: Recognition results with template structure
            
        Raises:
            ValueError: If document format is unsupported
        """
        recognizer = TemplateRecognizer()
        return recognizer.recognize(document_file)
        
    def _create_elements(self, template, elements_data):
        """Create template elements from data"""
        from .models import TemplateElement
        
        element_map = {}  # Maps temporary IDs to actual elements
        
        # First pass: create all elements
        for elem_data in elements_data:
            elem_data['template'] = template
            temp_id = elem_data.pop('temp_id', None)
            parent_id = elem_data.pop('parent', None)
            
            # Create the element
            element = TemplateElement.objects.create(**elem_data)
            
            if temp_id:
                element_map[temp_id] = element
        
        # Second pass: set parent relationships
        for elem_data in elements_data:
            if 'parent' in elem_data and elem_data['parent'] in element_map:
                temp_id = elem_data.get('temp_id')
                if temp_id in element_map:
                    element = element_map[temp_id]
                    element.parent = element_map[elem_data['parent']]
                    element.save()
                    
    def _create_mappings(self, template, mappings_data):
        """Create field mappings from data"""
        from .models import TemplateFieldMapping
        
        for mapping_data in mappings_data:
            mapping_data['template'] = template
            TemplateFieldMapping.objects.create(**mapping_data)
            
    def _update_elements(self, template, elements_data):
        """Update template elements from data"""
        from .models import TemplateElement
        
        # Get existing elements
        existing_elements = {str(e.id): e for e in template.elements.all()}
        
        # Track elements to create, update, or delete
        to_create = []
        to_update = []
        updated_ids = set()
        
        for elem_data in elements_data:
            elem_id = elem_data.get('id')
            
            if elem_id and elem_id in existing_elements:
                # Update existing element
                element = existing_elements[elem_id]
                updated_ids.add(elem_id)
                
                # Update fields
                for key, value in elem_data.items():
                    if key not in ['id', 'template']:
                        setattr(element, key, value)
                        
                to_update.append(element)
            else:
                # New element
                elem_data['template'] = template
                if 'id' in elem_data:
                    del elem_data['id']
                to_create.append(elem_data)
                
        # Delete elements not in the update
        to_delete_ids = set(existing_elements.keys()) - updated_ids
        if to_delete_ids:
            TemplateElement.objects.filter(id__in=to_delete_ids).delete()
            
        # Create new elements
        self._create_elements(template, to_create)
        
        # Update existing elements
        for element in to_update:
            element.save()
            
    def _update_mappings(self, template, mappings_data):
        """Update field mappings from data"""
        from .models import TemplateFieldMapping
        
        # Get existing mappings
        existing_mappings = {str(m.id): m for m in template.field_mappings.all()}
        
        # Track mappings to create, update, or delete
        to_create = []
        to_update = []
        updated_ids = set()
        
        for mapping_data in mappings_data:
            mapping_id = mapping_data.get('id')
            
            if mapping_id and mapping_id in existing_mappings:
                # Update existing mapping
                mapping = existing_mappings[mapping_id]
                updated_ids.add(mapping_id)
                
                # Update fields
                for key, value in mapping_data.items():
                    if key not in ['id', 'template']:
                        setattr(mapping, key, value)
                        
                to_update.append(mapping)
            else:
                # New mapping
                mapping_data['template'] = template
                if 'id' in mapping_data:
                    del mapping_data['id']
                to_create.append(mapping_data)
                
        # Delete mappings not in the update
        to_delete_ids = set(existing_mappings.keys()) - updated_ids
        if to_delete_ids:
            TemplateFieldMapping.objects.filter(id__in=to_delete_ids).delete()
            
        # Create new mappings
        for mapping_data in to_create:
            TemplateFieldMapping.objects.create(**mapping_data)
            
        # Update existing mappings
        for mapping in to_update:
            mapping.save()
            
    def _check_significant_changes(self, template, template_data):
        """Check if changes are significant enough to create a new version"""
        significant_fields = ['content', 'name']
        
        for field in significant_fields:
            if field in template_data and getattr(template, field) != template_data[field]:
                return True
                
        return False
        
    def _duplicate_element(self, element, new_template, element_map):
        """Duplicate an element and its children"""
        from .models import TemplateElement
        
        # Create new element
        new_element = TemplateElement.objects.create(
            template=new_template,
            element_type=element.element_type,
            name=element.name,
            position_x=element.position_x,
            position_y=element.position_y,
            width=element.width,
            height=element.height,
            content=element.content,
            parent=None,  # Will be set in a second pass
            z_index=element.z_index,
            is_visible=element.is_visible,
            condition=element.condition
        )
        
        # Store mapping from original to new ID
        element_map[element.id] = new_element
        
        # Duplicate children
        for child in element.children.all():
            self._duplicate_element(child, new_template, element_map)
            
        return new_element
        
    def _fix_element_parents(self, template, element_map):
        """Fix parent references in duplicated elements"""
        # For each element, if its original had a parent, set the parent to the new parent
        for orig_id, new_element in element_map.items():
            original = self.get_template_element_by_id(orig_id)
            if original and original.parent and original.parent.id in element_map:
                new_element.parent = element_map[original.parent.id]
                new_element.save(update_fields=['parent'])
                
    def get_template_element_by_id(self, element_id):
        """Helper to get a template element by ID"""
        from .models import TemplateElement
        try:
            return TemplateElement.objects.get(id=element_id)
        except TemplateElement.DoesNotExist:
            return None


class TemplateRenderer:
    """Service for rendering templates"""
    
    def __init__(self, template):
        self.template = template
        
    def render(self, data=None, format='html'):
        """
        Render the template with the provided data
        
        Args:
            data (dict): Data to render the template with
            format (str): Output format
            
        Returns:
            Union[str, bytes]: Rendered template
        """
        if data is None:
            data = {}
            
        # Validate format
        if format not in ['html', 'pdf', 'json']:
            raise ValueError(f"Unsupported format: {format}")
            
        # Process template elements
        result = self._process_elements(data)
            
        # Convert to requested format
        if format == 'html':
            return self._to_html(result