import React, { useState } from 'react';
import TemplateListContainer from './TemplateListContainer';
import TemplateDetailsContainer from './TemplateDetailsContainer';
import TemplateEditorContainer from './TemplateEditorContainer';
import TemplateApprovalWorkflow from './TemplateApprovalWorkflow';

/**
 * Main component for the Template Management feature
 * Manages overall state and navigation between sub-components
 */
const TemplateManagementModule = () => {
  const [activeView, setActiveView] = useState('list'); // list, details, editor, approval
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Handler for template selection from list
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setActiveView('details');
  };
  
  // Handler for creating a new template
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditMode(true);
    setActiveView('editor');
  };
  
  // Handler for editing an existing template
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditMode(true);
    setActiveView('editor');
  };
  
  // Handler for submitting a template for approval
  const handleSubmitForApproval = (template) => {
    setSelectedTemplate(template);
    setActiveView('approval');
  };
  
  // Handler for returning to template list
  const handleBackToList = () => {
    setActiveView('list');
  };
  
  return (
    <div className="template-management-module">
      {activeView === 'list' && (
        <TemplateListContainer 
          onTemplateSelect={handleTemplateSelect}
          onCreateTemplate={handleCreateTemplate}
        />
      )}
      
      {activeView === 'details' && (
        <TemplateDetailsContainer 
          template={selectedTemplate}
          onEditTemplate={handleEditTemplate}
          onBackToList={handleBackToList}
          onSubmitForApproval={handleSubmitForApproval}
        />
      )}
      
      {activeView === 'editor' && (
        <TemplateEditorContainer 
          template={selectedTemplate}
          isNewTemplate={!selectedTemplate}
          onSave={(updatedTemplate) => {
            setSelectedTemplate(updatedTemplate);
            setIsEditMode(false);
            setActiveView('details');
          }}
          onCancel={() => {
            setIsEditMode(false);
            setActiveView(selectedTemplate ? 'details' : 'list');
          }}
          onSubmitForApproval={handleSubmitForApproval}
        />
      )}
      
      {activeView === 'approval' && (
        <TemplateApprovalWorkflow
          template={selectedTemplate}
          onApprovalComplete={() => {
            setActiveView('details');
          }}
          onCancel={() => {
            setActiveView('details');
          }}
        />
      )}
    </div>
  );
};

export default TemplateManagementModule;

// File: src/components/TemplateListContainer.jsx
import React, { useState, useEffect } from 'react';
import TemplateSearchFilter from './TemplateSearchFilter';
import TemplateTable from './TemplateTable';
import PaginationControl from './common/PaginationControl';
import { fetchTemplates } from '../services/templateService';
import { handleApiError } from '../utils/errorHandler';

/**
 * Container component for listing and filtering templates
 * @param {Object} props - Component props
 * @param {Function} props.onTemplateSelect - Function to handle template selection
 * @param {Function} props.onCreateTemplate - Function to handle creating new template
 */
const TemplateListContainer = ({ onTemplateSelect, onCreateTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    client: '',
    serviceType: '',
    status: 'active',
    searchTerm: '',
    dateFrom: null,
    dateTo: null
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });

  // Load templates on component mount and when filters/pagination change
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetchTemplates({
          ...filters,
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        });
        
        setTemplates(response.templates);
        setPagination(prev => ({
          ...prev,
          totalItems: response.totalCount
        }));
        setError(null);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to load templates');
        setError(errorMessage);
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, [filters, pagination.currentPage, pagination.pageSize]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="template-list-container">
      <div className="template-list-header d-flex justify-content-between align-items-center mb-4">
        <h2>Invoice Templates</h2>
        <button 
          className="btn btn-primary" 
          onClick={onCreateTemplate}
          data-testid="create-template-btn"
        >
          Create New Template
        </button>
      </div>
      
      <TemplateSearchFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {loading ? (
        <div className="loading-indicator text-center py-5" data-testid="loading-indicator">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading templates...</span>
          </div>
          <p className="mt-2">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert" data-testid="error-message">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="no-templates-message alert alert-info" role="alert" data-testid="no-templates-message">
          <i className="bi bi-info-circle-fill me-2"></i>
          No templates found matching your criteria.
        </div>
      ) : (
        <>
          <TemplateTable 
            templates={templates} 
            onTemplateSelect={onTemplateSelect} 
          />
          
          <PaginationControl 
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default TemplateListContainer;

// File: src/components/TemplateSearchFilter.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchClients, fetchServiceTypes } from '../services/masterDataService';
import { handleApiError } from '../utils/errorHandler';
import * as Yup from 'yup';

/**
 * Component for template filtering and search
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 */
const TemplateSearchFilter = ({ filters, onFilterChange }) => {
  const [clients, setClients] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load master data for dropdowns
  useEffect(() => {
    const loadMasterData = async () => {
      setLoading(true);
      try {
        const [clientsData, serviceTypesData] = await Promise.all([
          fetchClients(),
          fetchServiceTypes()
        ]);
        
        setClients(clientsData);
        setServiceTypes(serviceTypesData);
        setError(null);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Error loading filter data');
        setError(errorMessage);
        console.error('Error loading master data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMasterData();
  }, []);

  // Validation schema
  const validationSchema = Yup.object().shape({
    dateFrom: Yup.date()
      .nullable()
      .test(
        'date-range',
        'Start date cannot be after end date',
        function (value) {
          const { dateTo } = this.parent;
          if (!value || !dateTo) return true;
          return new Date(value) <= new Date(dateTo);
        }
      ),
    dateTo: Yup.date()
      .nullable()
      .test(
        'date-range',
        'End date cannot be before start date',
        function (value) {
          const { dateFrom } = this.parent;
          if (!value || !dateFrom) return true;
          return new Date(value) >= new Date(dateFrom);
        }
      )
  });

  return (
    <div className="template-search-filter card mb-4" data-testid="template-filter">
      <div className="card-header bg-light">
        <i className="bi bi-funnel me-2"></i>
        Filter Templates
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <span className="ms-2">Loading filter options...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <Formik
            initialValues={filters}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={(values) => {
              onFilterChange(values);
            }}
          >
            {({ values, setFieldValue, isSubmitting, resetForm }) => (
              <Form>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="client" className="form-label">Client</label>
                    <Field
                      as="select"
                      name="client"
                      id="client"
                      className="form-select"
                      data-testid="client-filter"
                    >
                      <option value="">All Clients</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </Field>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="serviceType" className="form-label">Service Type</label>
                    <Field
                      as="select"
                      name="serviceType"
                      id="serviceType"
                      className="form-select"
                      data-testid="service-type-filter"
                    >
                      <option value="">All Service Types</option>
                      {serviceTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Field>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <Field
                      as="select"
                      name="status"
                      id="status"
                      className="form-select"
                      data-testid="status-filter"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                    </Field>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="searchTerm" className="form-label">Search</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <Field
                        type="text"
                        name="searchTerm"
                        id="searchTerm"
                        placeholder="Template name or description"
                        className="form-control"
                        data-testid="search-term-filter"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Created From</label>
                    <DatePicker
                      selected={values.dateFrom}
                      onChange={date => setFieldValue('dateFrom', date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select start date"
                      isClearable
                      data-testid="date-from-filter"
                    />
                    <ErrorMessage name="dateFrom" component="div" className="text-danger small" />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Created To</label>
                    <DatePicker
                      selected={values.dateTo}
                      onChange={date => setFieldValue('dateTo', date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select end date"
                      isClearable
                      data-testid="date-to-filter"
                    />
                    <ErrorMessage name="dateTo" component="div" className="text-danger small" />
                  </div>
                </div>
                
                <div className="d-flex justify-content-end mt-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={() => {
                      const resetFilters = {
                        client: '',
                        serviceType: '',
                        status: 'active',
                        searchTerm: '',
                        dateFrom: null,
                        dateTo: null
                      };
                      
                      resetForm({ values: resetFilters });
                      onFilterChange(resetFilters);
                    }}
                    data-testid="reset-filters-btn"
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Reset
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    data-testid="apply-filters-btn"
                  >
                    <i className="bi bi-funnel-fill me-1"></i>
                    Apply Filters
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default TemplateSearchFilter;

// File: src/components/TemplateTable.jsx
import React from 'react';
import TemplateTableRow from './TemplateTableRow';
import { formatDate } from '../utils/dateUtils';

/**
 * Component for displaying templates in a table format
 * @param {Object} props - Component props
 * @param {Array} props.templates - Array of template objects
 * @param {Function} props.onTemplateSelect - Function to handle template selection
 */
const TemplateTable = ({ templates, onTemplateSelect }) => {
  if (!templates || templates.length === 0) {
    return null;
  }
  
  return (
    <div className="template-table mb-4">
      <div className="table-responsive">
        <table className="table table-striped table-hover" data-testid="template-table">
          <thead className="table-light">
            <tr>
              <th>Template Name</th>
              <th>Client</th>
              <th>Service Type</th>
              <th>Version</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <TemplateTableRow 
                key={template.id} 
                template={template}
                onTemplateSelect={onTemplateSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemplateTable;

// File: src/components/TemplateTableRow.jsx
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/statusUtils';

/**
 * Component for displaying a single template row in the template table
 * @param {Object} props - Component props
 * @param {Object} props.template - Template data object
 * @param {Function} props.onTemplateSelect - Function to handle template selection
 */
const TemplateTableRow = ({ template, onTemplateSelect }) => {
  // Destructure template properties with defaults for safety
  const {
    id,
    name = 'Unnamed Template',
    client = { name: 'Unknown Client' },
    serviceType = { name: 'Unknown Service' },
    version = '1.0',
    status = 'draft',
    createdAt,
    createdBy = { name: 'System' }
  } = template;

  const statusBadgeClass = getStatusBadgeClass(status);

  return (
    <tr 
      className="template-table-row"
      data-testid={`template-row-${id}`}
    >
      <td>
        <button
          className="btn btn-link text-decoration-none text-start text-primary fw-semibold p-0"
          onClick={() => onTemplateSelect(template)}
          data-testid={`template-name-${id}`}
        >
          {name}
        </button>
      </td>
      <td>{client.name}</td>
      <td>{serviceType.name}</td>
      <td>{version}</td>
      <td>
        <span className={`badge ${statusBadgeClass}`}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td>{formatDate(createdAt)}</td>
      <td>{createdBy.name}</td>
      <td>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => onTemplateSelect(template)}
            title="View Details"
            data-testid={`view-template-${id}`}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            title="Download Template"
            data-testid={`download-template-${id}`}
          >
            <i className="bi bi-download"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TemplateTableRow;

// File: src/components/TemplateDetailsContainer.jsx
import React, { useState, useEffect } from 'react';
import TemplateMetadataPanel from './TemplateMetadataPanel';
import TemplatePreviewPanel from './TemplatePreviewPanel';
import TemplateVersionHistory from './TemplateVersionHistory';
import TemplateActions from './TemplateActions';
import { fetchTemplateById, fetchTemplateVersions } from '../services/templateService';
import { handleApiError } from '../utils/errorHandler';

/**
 * Container component for displaying template details
 * @param {Object} props - Component props
 * @param {Object} props.template - Template object
 * @param {Function} props.onEditTemplate - Function to handle edit action
 * @param {Function} props.onBackToList - Function to handle back navigation
 * @param {Function} props.onSubmitForApproval - Function to handle approval submission
 */
const TemplateDetailsContainer = ({
  template,
  onEditTemplate,
  onBackToList,
  onSubmitForApproval
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templateDetails, setTemplateDetails] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    if (!template || !template.id) {
      setError('Template not found');
      setLoading(false);
      return;
    }

    const loadTemplateData = async () => {
      setLoading(true);
      try {
        const [details, versionHistory] = await Promise.all([
          fetchTemplateById(template.id),
          fetchTemplateVersions(template.id)
        ]);
        
        setTemplateDetails(details);
        setVersions(versionHistory);
        setError(null);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Failed to load template details');
        setError(errorMessage);
        console.error('Error loading template details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplateData();
  }, [template]);

  if (loading) {
    return (
      <div className="template-details-loading text-center py-5" data-testid="loading-details">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading template details...</span>
        </div>
        <p className="mt-2">Loading template details...</p>
      </div>
    );
  }

  if (error || !templateDetails) {
    return (
      <div className="template-details-error">
        <div className="alert alert-danger" role="alert" data-testid="template-details-error">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'Template details not available'}
        </div>
        <button className="btn btn-secondary" onClick={onBackToList} data-testid="back-to-list-btn">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="template-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="template-details-title" data-testid="template-details-title">
          {templateDetails.name} <small className="text-muted">v{templateDetails.version}</small>
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={onBackToList}
          data-testid="back-button"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Templates
        </button>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          <TemplateMetadataPanel template={templateDetails} />
          
          <TemplateActions 
            template={templateDetails}
            onEdit={() => onEditTemplate(templateDetails)}
            onSubmitForApproval={() => onSubmitForApproval(templateDetails)}
          />
        </div>
        
        <div className="col-md-8">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
                data-testid="preview-tab"
              >
                <i className="bi bi-eye me-1"></i>
                Preview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'versions' ? 'active' : ''}`}
                onClick={() => setActiveTab('versions')}
                data-testid="versions-tab"
              >
                <i className="bi bi-clock-history me-1"></i>
                Version History
              </button>
            </li>
          </ul>
          
          {activeTab === 'preview' && (
            <TemplatePreviewPanel template={templateDetails} />
          )}
          
          {activeTab === 'versions' && (
            <TemplateVersionHistory 
              versions={versions} 
              currentVersion={templateDetails.version}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailsContainer;

// File: src/components/TemplateMetadataPanel.jsx
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/statusUtils';

/**
 * Component for displaying template metadata
 * @param {Object} props - Component props
 * @param {Object} props.template - Template data object
 */
const TemplateMetadataPanel = ({ template }) => {
  if (!template) return null;

  const {
    name,
    description,
    client,
    serviceType,
    status,
    version,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    effectiveDate,
    expirationDate
  } = template;

  const statusBadgeClass = getStatusBadgeClass(status);

  return (
    <div className="template-metadata-panel card mb-4" data-testid="template-metadata">
      <div className="card-header bg-light">
        <i className="bi bi-info-circle me-2"></i>
        Template Information
      </div>
      <div className="card-body">
        <div className="mb-3">
          <span className={`badge ${statusBadgeClass} float-end`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
          <h5 className="card-title">{name}</h5>
          <p className="text-muted mb-0">Version {version}</p>
        </div>
        
        {description && (
          <div className="mb-3">
            <h6>Description</h6>
            <p className="mb-0">{description}</p>
          </div>
        )}
        
        <div className="row mb-3">
          <div className="col-md-6">
            <h6>Client</h6>
            <p className="mb-0">{client?.name || 'N/A'}</p>
          </div>
          <div className="col-md-6">
            <h6>Service Type</h6>
            <p className="mb-0">{serviceType?.name || 'N/A'}</p>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <h6>Created By</h6>
            <p className="mb-0">{createdBy?.name || 'N/A'}</p>
          </div>
          <div className="col-md-6">
            <h6>Created Date</h6>
            <p className="mb-0">{formatDate(createdAt) || 'N/A'}</p>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <h6>Modified By</h6>
            <p className="mb-0">{modifiedBy?.name || 'N/A'}</p>
          </div>
          <div className="col-md-6">
            <h6>Modified Date</h6>
            <p className="mb-0">{formatDate(modifiedAt) || 'N/A'}</p>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <h6>Effective Date</h6>
            <p className="mb-0">{formatDate(effectiveDate) || 'N/A'}</p>
          </div>
          <div className="col-md-6">
            <h6>Expiration Date</h6>
            <p className="mb-0">{formatDate(expirationDate) || 'Indefinite'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMetadataPanel;

// File: src/components/TemplatePreviewPanel.jsx
import React, { useState } from 'react';
import { downloadTemplateFile } from '../services/templateService';

/**
 * Component for previewing template files
 * @param {Object} props - Component props
 * @param {Object} props.template - Template data object
 */
const TemplatePreviewPanel = ({ template }) => {
  const [previewMode, setPreviewMode] = useState('pdf'); // pdf, fields
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!template) return null;
  
  const { id, fileUrl, fileType, fields = [] } = template;
  
  // Handle template download
  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await downloadTemplateFile(id, template.name);
    } catch (err) {
      setError('Failed to download template file. Please try again.');
      console.error('Error downloading template:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="template-preview-panel card" data-testid="template-preview">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-file-earmark me-2"></i>
          Template Preview
        </div>
        <div className="btn-group btn-group-sm">
          <button 
            type="button" 
            className={`btn ${previewMode === 'pdf' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPreviewMode('pdf')}
            data-testid="document-view-btn"
          >
            <i className="bi bi-file-earmark-pdf me-1"></i