import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CartManager from '../../services/CartManager';
import AddToCartModal from '../AddToCartModal/AddToCartModal';
import './AddToCartButton.css';

/**
 * AddToCartButton Component
 * 
 * Renders a button that allows users to add products to their shopping cart.
 * Supports direct add or opening a modal for products with required options.
 * 
 * @component
 */
class AddToCartButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isAdded: false,
      quantity: props.defaultQuantity || 1,
      selectedOptions: props.defaultOptions || {},
      error: null,
      isModalOpen: false
    };

    this.cartManager = new CartManager();
  }

  /**
   * Handles the click event on the Add to Cart button
   * Either directly adds the product or opens the options modal
   */
  handleClick = () => {
    const { productId, showOptionsSelector, useModal } = this.props;
    
    // If product has options and we should use a modal, open it
    if ((showOptionsSelector || this.shouldShowOptionsModal()) && useModal) {
      this.openOptionsModal();
      return;
    }

    // Otherwise directly add to cart
    this.processAddToCart();
  };

  /**
   * Determines if we need to show options modal based on product metadata
   * @returns {boolean} Whether options modal should be shown
   */
  shouldShowOptionsModal = () => {
    // In a real implementation, this would check product metadata
    // to see if this product requires option selection
    return this.props.hasRequiredOptions || false;
  };

  /**
   * Opens the modal for selecting product options
   */
  openOptionsModal = () => {
    this.setState({ isModalOpen: true });
  };

  /**
   * Closes the options modal
   */
  closeOptionsModal = () => {
    this.setState({ isModalOpen: false });
  };

  /**
   * Updates the selected options state
   * @param {Object} options - The selected product options
   */
  handleOptionsChange = (options) => {
    this.setState({ selectedOptions: options });
  };

  /**
   * Updates the quantity state
   * @param {number} quantity - The selected quantity
   */
  handleQuantityChange = (quantity) => {
    this.setState({ quantity });
  };

  /**
   * Process the actual add to cart action
   * Makes API call, updates state, shows notifications
   */
  processAddToCart = async () => {
    const { productId, onAddToCartSuccess, onAddToCartError } = this.props;
    const { quantity, selectedOptions } = this.state;

    // Set loading state
    this.setState({ isLoading: true, error: null });

    try {
      // Call the cart manager to add the item
      const result = await this.cartManager.addToCart({
        productId,
        quantity,
        options: selectedOptions
      });

      if (result.success) {
        // Update state to show success
        this.setState({ isLoading: false, isAdded: true });
        
        // Close modal if it's open
        if (this.state.isModalOpen) {
          this.closeOptionsModal();
        }
        
        // Call success callback if provided
        if (onAddToCartSuccess) {
          onAddToCartSuccess(result);
        }
        
        // Reset button state after delay
        this.resetButtonState(3000);
      } else {
        throw new Error(result.error?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.setState({ isLoading: false, error });
      
      // Call error callback if provided
      if (onAddToCartError) {
        onAddToCartError(error);
      }
    }
  };

  /**
   * Reset button state after successful add or error
   * @param {number} delay - Delay in milliseconds before resetting
   */
  resetButtonState = (delay = 0) => {
    setTimeout(() => {
      this.setState({ isAdded: false });
    }, delay);
  };

  /**
   * Render the button component
   */
  render() {
    const { 
      size = 'medium', 
      variant = 'primary',
      productId,
      showQuantitySelector 
    } = this.props;
    
    const { isLoading, isAdded, error, isModalOpen } = this.state;

    // Determine button class names based on props and state
    const buttonClasses = [
      'add-to-cart-button',
      `size-${size}`,
      `variant-${variant}`,
      isLoading ? 'is-loading' : '',
      isAdded ? 'is-added' : '',
      error ? 'has-error' : ''
    ].filter(Boolean).join(' ');

    // Determine button content based on state
    let buttonContent;
    
    if (isLoading) {
      buttonContent = <span className="loading-spinner"></span>;
    } else if (isAdded) {
      buttonContent = (
        <>
          <span className="icon-check"></span>
          <span>Added to Cart</span>
        </>
      );
    } else if (error) {
      buttonContent = (
        <>
          <span className="icon-error"></span>
          <span>Try Again</span>
        </>
      );
    } else {
      buttonContent = (
        <>
          <span className="icon-cart"></span>
          <span>Add to Cart</span>
        </>
      );
    }

    return (
      <>
        <button
          className={buttonClasses}
          onClick={this.handleClick}
          disabled={isLoading}
          aria-label="Add to cart"
          data-product-id={productId}
          type="button"
        >
          {buttonContent}
        </button>
        
        {error && <div className="error-message">{error.message}</div>}
        
        {isModalOpen && (
          <AddToCartModal
            productId={productId}
            isOpen={isModalOpen}
            onClose={this.closeOptionsModal}
            onSubmit={this.processAddToCart}
            onOptionsChange={this.handleOptionsChange}
            onQuantityChange={this.handleQuantityChange}
            showQuantitySelector={showQuantitySelector}
            initialQuantity={this.state.quantity}
            initialOptions={this.state.selectedOptions}
          />
        )}
      </>
    );
  }
}

AddToCartButton.propTypes = {
  productId: PropTypes.string.isRequired,
  defaultOptions: PropTypes.object,
  defaultQuantity: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
  showQuantitySelector: PropTypes.bool,
  showOptionsSelector: PropTypes.bool,
  useModal: PropTypes.bool,
  onAddToCartSuccess: PropTypes.func,
  onAddToCartError: PropTypes.func,
  hasRequiredOptions: PropTypes.bool
};

AddToCartButton.defaultProps = {
  defaultQuantity: 1,
  defaultOptions: {},
  size: 'medium',
  variant: 'primary',
  showQuantitySelector: false,
  showOptionsSelector: false,
  useModal: true,
  hasRequiredOptions: false
};

export default AddToCartButton;

// File: src/components/AddToCartButton/AddToCartButton.css

.add-to-cart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.add-to-cart-button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Size variants */
.add-to-cart-button.size-small {
  padding: 8px 16px;
  font-size: 14px;
}

.add-to-cart-button.size-medium {
  padding: 12px 20px;
  font-size: 16px;
}

.add-to-cart-button.size-large {
  padding: 16px 24px;
  font-size: 18px;
}

/* Color variants */
.add-to-cart-button.variant-primary {
  background-color: #0066cc;
  color: white;
}

.add-to-cart-button.variant-primary:hover {
  background-color: #0052a3;
}

.add-to-cart-button.variant-secondary {
  background-color: white;
  color: #0066cc;
  border: 1px solid #0066cc;
}

.add-to-cart-button.variant-secondary:hover {
  background-color: #f0f7ff;
}

.add-to-cart-button.variant-tertiary {
  background-color: #f4f4f4;
  color: #333333;
}

.add-to-cart-button.variant-tertiary:hover {
  background-color: #e0e0e0;
}

/* States */
.add-to-cart-button.is-loading {
  pointer-events: none;
  opacity: 0.8;
}

.add-to-cart-button.is-added {
  background-color: #2ea44f;
  color: white;
}

.add-to-cart-button.has-error {
  background-color: #e53935;
  color: white;
}

.add-to-cart-button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error message */
.error-message {
  color: #e53935;
  font-size: 14px;
  margin-top: 8px;
}

/* Icons */
.icon-cart, .icon-check, .icon-error {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.icon-cart {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>');
}

.icon-check {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
}

.icon-error {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>');
}

// File: src/components/ProductOptionsSelector/ProductOptionsSelector.js

import React from 'react';
import PropTypes from 'prop-types';
import ProductService from '../../services/ProductService';
import './ProductOptionsSelector.css';

/**
 * ProductOptionsSelector Component
 * 
 * Renders selectors for product options like size, color, etc.
 * Handles option selection and validation.
 * 
 * @component
 */
class ProductOptionsSelector extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      options: props.options || [],
      validationErrors: {},
      isLoading: !props.options
    };

    this.productService = new ProductService();
  }

  /**
   * Fetch product options if not provided
   */
  componentDidMount() {
    if (!this.props.options) {
      this.fetchProductOptions();
    }
  }

  /**
   * Fetch options for the product from the service
   */
  fetchProductOptions = async () => {
    try {
      this.setState({ isLoading: true });
      const productDetails = await this.productService.getProductDetails(this.props.productId);
      
      if (productDetails && productDetails.options) {
        this.setState({
          options: productDetails.options,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching product options:', error);
      this.setState({
        error: 'Failed to load product options',
        isLoading: false
      });
    }
  };

  /**
   * Handle option selection change
   * 
   * @param {string} optionId - The ID of the changed option
   * @param {string} valueId - The ID of the selected value
   */
  handleOptionChange = (optionId, valueId) => {
    const { onChange, selectedOptions } = this.props;
    
    // Create a new selectedOptions object with the updated selection
    const updatedOptions = {
      ...selectedOptions,
      [optionId]: valueId
    };
    
    // Clear validation error for this option if exists
    if (this.state.validationErrors[optionId]) {
      this.setState(prevState => ({
        validationErrors: {
          ...prevState.validationErrors,
          [optionId]: null
        }
      }));
    }
    
    // Call the onChange handler with the updated options
    if (onChange) {
      onChange(optionId, valueId);
    }
  };

  /**
   * Validate if all required options are selected
   * 
   * @returns {{isValid: boolean, errors: Object}} Validation result with any errors
   */
  validateOptions = () => {
    const { selectedOptions } = this.props;
    const { options } = this.state;
    const errors = {};
    let isValid = true;
    
    // Check each option to see if it's required and selected
    options.forEach(option => {
      if (option.required && !selectedOptions[option.id]) {
        errors[option.id] = `Please select a ${option.name.toLowerCase()}`;
        isValid = false;
      }
    });
    
    this.setState({ validationErrors: errors });
    return { isValid, errors };
  };

  /**
   * Check if a specific option value is available (in stock)
   * 
   * @param {string} optionId - The option ID
   * @param {string} valueId - The value ID to check
   * @returns {boolean} Whether the option value is available
   */
  isOptionValueAvailable = (optionId, valueId) => {
    const { options } = this.state;
    
    const option = options.find(opt => opt.id === optionId);
    if (!option) return false;
    
    const value = option.values.find(val => val.id === valueId);
    return value ? value.inStock : false;
  };

  /**
   * Generate option-specific class names
   * 
   * @param {Object} option - The option object
   * @returns {string} CSS class names
   */
  getOptionClassNames = (option) => {
    return [
      'product-option',
      `option-type-${option.type}`,
      this.state.validationErrors[option.id] ? 'has-error' : ''
    ].filter(Boolean).join(' ');
  };

  /**
   * Renders color swatch option selector
   * 
   * @param {Object} option - The color option object
   * @returns {JSX.Element} Color selector component
   */
  renderColorOption = (option) => {
    const { selectedOptions } = this.props;
    const selectedValue = selectedOptions[option.id];
    
    return (
      <div className="color-options">
        {option.values.map(value => {
          const isSelected = selectedValue === value.id;
          const isAvailable = value.inStock;
          const swatchClasses = [
            'color-swatch',
            isSelected ? 'selected' : '',
            !isAvailable ? 'unavailable' : ''
          ].filter(Boolean).join(' ');
          
          return (
            <button
              key={value.id}
              className={swatchClasses}
              style={{ backgroundColor: value.colorCode }}
              onClick={() => isAvailable && this.handleOptionChange(option.id, value.id)}
              disabled={!isAvailable}
              aria-label={`${option.name}: ${value.name}`}
              aria-selected={isSelected}
              title={!isAvailable ? `${value.name} - Out of Stock` : value.name}
            >
              {isSelected && <span className="swatch-checkmark"></span>}
              <span className="swatch-label">{value.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * Renders size option selector
   * 
   * @param {Object} option - The size option object
   * @returns {JSX.Element} Size selector component
   */
  renderSizeOption = (option) => {
    const { selectedOptions } = this.props;
    const selectedValue = selectedOptions[option.id];
    
    return (
      <div className="size-options">
        {option.values.map(value => {
          const isSelected = selectedValue === value.id;
          const isAvailable = value.inStock;
          const sizeClasses = [
            'size-button',
            isSelected ? 'selected' : '',
            !isAvailable ? 'unavailable' : ''
          ].filter(Boolean).join(' ');
          
          return (
            <button
              key={value.id}
              className={sizeClasses}
              onClick={() => isAvailable && this.handleOptionChange(option.id, value.id)}
              disabled={!isAvailable}
              aria-label={`${option.name}: ${value.name}`}
              aria-selected={isSelected}
            >
              {value.name}
              {!isAvailable && <span className="out-of-stock-label">Out of Stock</span>}
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * Renders select dropdown option selector
   * 
   * @param {Object} option - The option object
   * @returns {JSX.Element} Select dropdown component
   */
  renderSelectOption = (option) => {
    const { selectedOptions } = this.props;
    const selectedValue = selectedOptions[option.id] || '';
    
    return (
      <div className="select-option">
        <select
          id={`option-${option.id}`}
          value={selectedValue}
          onChange={(e) => this.handleOptionChange(option.id, e.target.value)}
          aria-label={option.name}
          className={selectedValue ? 'has-value' : ''}
        >
          <option value="">{option.required ? 'Please select' : 'Select (optional)'}</option>
          {option.values.map(value => (
            <option 
              key={value.id} 
              value={value.id}
              disabled={!value.inStock}
            >
              {value.name}{!value.inStock ? ' (Out of Stock)' : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /**
   * Renders radio button option selector
   * 
   * @param {Object} option - The option object
   * @returns {JSX.Element} Radio button group component
   */
  renderRadioOption = (option) => {
    const { selectedOptions } = this.props;
    const selectedValue = selectedOptions[option.id];
    const radioGroupName = `option-${option.id}`;
    
    return (
      <div className="radio-options">
        {option.values.map(value => {
          const isSelected = selectedValue === value.id;
          const isAvailable = value.inStock;
          const radioId = `${radioGroupName}-${value.id}`;
          
          return (
            <div key={value.id} className="radio-option">
              <input
                type="radio"
                id={radioId}
                name={radioGroupName}
                value={value.id}
                checked={isSelected}
                onChange={() => this.handleOptionChange(option.id, value.id)}
                disabled={!isAvailable}
              />
              <label htmlFor={radioId} className={!isAvailable ? 'unavailable' : ''}>
                {value.name}
                {!isAvailable && <span className="out-of-stock-label"> (Out of Stock)</span>}
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Renders checkbox option selector
   * 
   * @param {Object} option - The option object
   * @returns {JSX.Element} Checkbox group component
   */
  renderCheckboxOption = (option) => {
    const { selectedOptions } = this.props;
    const selectedValues = selectedOptions[option.id] || [];
    
    return (
      <div className="checkbox-options">
        {option.values.map(value => {
          const isSelected = Array.isArray(selectedValues) && selectedValues.includes(value.id);
          const isAvailable = value.inStock;
          const checkboxId = `option-${option.id}-${value.id}`;
          
          return (
            <div key={value.id} className="checkbox-option">
              <input
                type="checkbox"
                id={checkboxId}
                value={value.id}
                checked={isSelected}
                onChange={() => {
                  // Toggle the value in the array
                  const newValues = isSelected
                    ? selectedValues.filter(id => id !== value.id)
                    : [...selectedValues, value.id];
                  
                  this.handleOptionChange(option.id, newValues);
                }}
                disabled={!isAvailable}
              />
              <label htmlFor={checkboxId} className={!isAvailable ? 'unavailable' : ''}>
                {value.name}
                {!isAvailable && <span className="out-of-stock-label"> (Out of Stock)</span>}
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render the appropriate option UI based on option type
   * 
   * @param {Object} option - The option object
   * @returns {JSX.Element} Option selector component
   */
  renderOptionSelector = (option) => {
    switch (option.type) {
      case 'color':
        return this.renderColorOption(option);
      case 'size':
        return this.renderSizeOption(option);
      case 'select':
        return this.renderSelectOption(option);
      case 'radio':
        return this.renderRadioOption(option);
      case 'checkbox':
        return this.renderCheckboxOption(option);
      default:
        return this.renderSelectOption(option);
    }
  };

  /**
   * Render the component
   */
  render() {
    const { layout = 'vertical', showOutOfStock = false } = this.props;
    const { options, validationErrors, isLoading, error } = this.state;
    
    if (isLoading) {
      return <div className="options-loading">Loading product options...</div>;
    }
    
    if (error) {
      return <div className="options-error">{error}</div>;
    }
    
    // Filter out options based on showOutOfStock prop
    const displayOptions = showOutOfStock 
      ? options 
      : options.filter(option => option.values.some(value => value.inStock));
    
    if (displayOptions.length === 0) {
      return null;
    }
    
    return (
      <div className={`product-options-container layout-${layout}`}>
        {displayOptions.map(option => (
          <div key={option.id} className={this.getOptionClassNames(option)}>
            <label className="option-label">
              {option.name}
              {option.required && <span className="required-indicator">*</span>}
            </label>
            
            {this.renderOptionSelector(option)}
            
            {validationErrors[option.id] && (
              <div className="validation-error">{validationErrors[option.id]}</div>
            )}
          </div>
        ))}
      </div>
    );
  }
}

ProductOptionsSelector.propTypes = {
  productId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      required: PropTypes.bool.isRequired,
      type: PropTypes.oneOf(['select', 'color', 'size', 'radio', 'checkbox']).isRequired,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          inStock: PropTypes.bool.isRequired,
          image: PropTypes.string,
          colorCode: PropTypes.string
        })
      ).isRequired
    })
  ),
  selectedOptions: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['vertical', 'horizontal', 'grid']),
  showOutOfStock: PropTypes.bool
};

ProductOptionsSelector.defaultProps = {
  selectedOptions: {},
  layout: 'vertical',
  showOutOfStock: false
};

export default ProductOptionsSelector;

// File: src/components/ProductOptionsSelector/ProductOptionsSelector.css

.product-options-container {
  margin-bottom: 20px;
  width: 100%;
}

/* Layout variants */
.product-options-container.layout-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.product-options-container.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-options-container.layout-vertical .product-option {
  margin-bottom: 16px;
}

/* Option styling */
.product-option {
  margin-bottom: 12px;
}

.option-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.required-indicator {
  color: #e53935;
  margin-left: 4px;
}

.validation-error {
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
}

/* Color swatch styling */
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-swatch {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 0;
}

.color-swatch.selected {
  transform: scale(1.1);
  border-color: #333;
}

.color-swatch.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  position: relative;
}

.color-swatch.unavailable::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23333333"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>') center no-repeat;
  background-size: 80%;
}

.swatch-checkmark {
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>') center no-repeat;
  background-size: contain;
}

.swatch-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Size buttons styling */
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-button {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.size-button:hover:not(.unav