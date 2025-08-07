```javascript
/**
 * RateCard model - Represents a client-specific rate card with pricing details
 */
class RateCard {
  constructor({
    id = null,
    name,
    clientId,
    description = '',
    effectiveFrom,
    effectiveTo = null,
    status = RateCardStatus.DRAFT,
    createdBy,
    createdAt = new Date(),
    updatedBy,
    updatedAt = new Date(),
    currentVersionId = null
  }) {
    this.id = id || generateUUID();
    this.name = name;
    this.clientId = clientId;
    this.description = description;
    this.effectiveFrom = effectiveFrom instanceof Date ? effectiveFrom : new Date(effectiveFrom);
    this.effectiveTo = effectiveTo ? (effectiveTo instanceof Date ? effectiveTo : new Date(effectiveTo)) : null;
    this.status = status;
    this.createdBy = createdBy;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.currentVersionId = currentVersionId;
    this.rateItems = [];
  }

  /**
   * Add a rate item to this rate card
   * @param {RateItem} item - The rate item to add
   */
  addRateItem(item) {
    if (!item.id) {
      item.id = generateUUID();
    }
    item.rateCardId = this.id;
    this.rateItems.push(item);
  }

  /**
   * Remove a rate item from this rate card
   * @param {string} itemId - ID of the rate item to remove
   * @returns {boolean} True if the item was removed, false if not found
   */
  removeRateItem(itemId) {
    const initialLength = this.rateItems.length;
    this.rateItems = this.rateItems.filter(item => item.id !== itemId);
    return this.rateItems.length < initialLength;
  }

  /**
   * Update an existing rate item
   * @param {string} itemId - ID of the rate item to update
   * @param {RateItem} updatedItem - Updated rate item data
   * @returns {boolean} True if the item was updated, false if not found
   */
  updateRateItem(itemId, updatedItem) {
    const index = this.rateItems.findIndex(item => item.id === itemId);
    if (index === -1) {
      return false;
    }
    
    updatedItem.id = itemId;
    updatedItem.rateCardId = this.id;
    this.rateItems[index] = updatedItem;
    return true;
  }

  /**
   * Calculate rate for a trip using this rate card
   * @param {TripData} tripData - Data about the trip
   * @returns {RateCalculation} The calculated rate
   * @throws {Error} If no applicable rate item is found
   */
  calculateRate(tripData) {
    // Find applicable rate items
    const applicableItems = this.rateItems.filter(item => 
      item.matchesCriteria(tripData.origin, tripData.destination, tripData.vehicleType)
    );

    if (applicableItems.length === 0) {
      throw new Error(`No applicable rate found for trip: ${tripData.id}`);
    }

    // For simplicity, use the first matching rate item
    // In a real implementation, more complex selection logic would be used
    const rateItem = applicableItems[0];
    
    return rateItem.calculateCharge(tripData);
  }

  /**
   * Create a new version of this rate card
   * @returns {RateCardVersion} The new version
   */
  createNewVersion() {
    // Get the latest version number
    const versionNumber = 1; // In real implementation, would get latest + 1
    
    const version = new RateCardVersion({
      rateCardId: this.id,
      versionNumber: versionNumber,
      effectiveFrom: new Date(),
      createdBy: this.updatedBy,
      createdAt: new Date(),
      rateItems: JSON.parse(JSON.stringify(this.rateItems)) // Deep copy
    });
    
    this.currentVersionId = version.id;
    return version;
  }

  /**
   * Check if rate card is currently active
   * @returns {boolean} True if active
   */
  isActive() {
    const now = new Date();
    return (
      this.status === RateCardStatus.ACTIVE &&
      this.effectiveFrom <= now &&
      (!this.effectiveTo || this.effectiveTo >= now)
    );
  }

  /**
   * Check if rate card is expired
   * @returns {boolean} True if expired
   */
  isExpired() {
    const now = new Date();
    return this.effectiveTo && this.effectiveTo < now;
  }

  /**
   * Clear all rate items from this card
   */
  clearRateItems() {
    this.rateItems = [];
  }
}

module.exports = RateCard;
```

### models/rate_item.js
```javascript
/**
 * RateItem model - Represents a specific pricing rule within a rate card
 */
class RateItem {
  constructor({
    id = null,
    rateCardId,
    serviceCode,
    origin,
    destination,
    vehicleType,
    rateType,
    baseRate,
    minCharge = 0,
    additionalCharges = [],
    conditions = [],
    fuelAdjustment = new FuelAdjustment()
  }) {
    this.id = id || generateUUID();
    this.rateCardId = rateCardId;
    this.serviceCode = serviceCode;
    this.origin = origin;
    this.destination = destination;
    this.vehicleType = vehicleType;
    this.rateType = rateType;
    this.baseRate = parseFloat(baseRate);
    this.minCharge = parseFloat(minCharge);
    this.additionalCharges = additionalCharges;
    this.conditions = conditions;
    this.fuelAdjustment = fuelAdjustment;
  }

  /**
   * Calculate charge for a trip using this rate item
   * @param {TripData} tripData - Data about the trip
   * @returns {ChargeCalculation} The calculated charge details
   */
  calculateCharge(tripData) {
    // Check if all conditions are met
    const allConditionsMet = this.conditions.every(condition => 
      condition.evaluate(tripData)
    );
    
    if (!allConditionsMet) {
      throw new Error("Trip does not meet all rate conditions");
    }
    
    // Calculate base charge based on rate type
    let baseCharge = 0;
    
    switch (this.rateType) {
      case RateType.FIXED:
        baseCharge = this.baseRate;
        break;
        
      case RateType.PER_KM:
        baseCharge = this.baseRate * tripData.distance;
        break;
        
      case RateType.PER_KG:
        baseCharge = this.baseRate * tripData.weight;
        break;
        
      case RateType.PER_CBM:
        baseCharge = this.baseRate * tripData.volume;
        break;
        
      case RateType.SLAB_BASED:
        // In a real implementation, would have slab calculation logic
        baseCharge = this.baseRate;
        break;
        
      case RateType.ZONE_BASED:
        // In a real implementation, would have zone lookup logic
        baseCharge = this.baseRate;
        break;
        
      default:
        throw new Error(`Unsupported rate type: ${this.rateType}`);
    }
    
    // Apply minimum charge if needed
    if (baseCharge < this.minCharge) {
      baseCharge = this.minCharge;
    }
    
    // Calculate additional charges
    const additionalCharges = new Map();
    for (const charge of this.additionalCharges) {
      const chargeAmount = charge.calculate(baseCharge, tripData);
      additionalCharges.set(charge.name, chargeAmount);
    }
    
    // Apply fuel adjustment
    const fuelAdjustment = this.fuelAdjustment.calculate(baseCharge);
    
    // Create charge calculation result
    const chargeCalculation = new ChargeCalculation({
      baseCharge,
      additionalCharges,
      fuelAdjustment,
      discounts: new Map(), // In a real implementation, would calculate discounts
      surcharges: new Map() // In a real implementation, would calculate surcharges
    });
    
    return chargeCalculation;
  }

  /**
   * Check if this rate item matches the given criteria
   * @param {string} origin - Trip origin
   * @param {string} destination - Trip destination
   * @param {string} vehicleType - Vehicle type
   * @returns {boolean} True if criteria match
   */
  matchesCriteria(origin, destination, vehicleType) {
    // Simple exact matching - in a real implementation, would have more sophisticated matching
    return (
      (this.origin === '*' || this.origin === origin) &&
      (this.destination === '*' || this.destination === destination) &&
      (this.vehicleType === '*' || this.vehicleType === vehicleType)
    );
  }
}

module.exports = RateItem;
```

### models/rate_card_version.js
```javascript
/**
 * RateCardVersion model - Represents a historical version of a rate card
 */
class RateCardVersion {
  constructor({
    id = null,
    rateCardId,
    versionNumber,
    effectiveFrom,
    createdBy,
    createdAt = new Date(),
    rateItems = []
  }) {
    this.id = id || generateUUID();
    this.rateCardId = rateCardId;
    this.versionNumber = versionNumber;
    this.effectiveFrom = effectiveFrom instanceof Date ? effectiveFrom : new Date(effectiveFrom);
    this.createdBy = createdBy;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.rateItems = rateItems;
  }

  /**
   * Restore this version as the current version of the rate card
   * @returns {void}
   */
  restore() {
    // This would be implemented with repository calls in a real implementation
    console.log(`Restoring version ${this.versionNumber} for rate card ${this.rateCardId}`);
  }

  /**
   * Compare this version with another version
   * @param {string} versionId - ID of the version to compare with
   * @returns {VersionDifference} Difference between versions
   */
  compare(versionId) {
    // In a real implementation, would fetch the other version and compare
    return {
      addedItems: [],
      removedItems: [],
      modifiedItems: []
    };
  }
}

module.exports = RateCardVersion;
```

### models/additional_charge.js
```javascript
/**
 * AdditionalCharge model - Represents an additional charge applied to a rate item
 */
class AdditionalCharge {
  constructor({
    id = null,
    rateItemId,
    name,
    type,
    value,
    isPercentage = false,
    conditions = []
  }) {
    this.id = id || generateUUID();
    this.rateItemId = rateItemId;
    this.name = name;
    this.type = type;
    this.value = parseFloat(value);
    this.isPercentage = isPercentage;
    this.conditions = conditions;
  }

  /**
   * Calculate the charge amount
   * @param {number} baseAmount - The base amount to calculate from
   * @param {TripData} tripData - Trip data for conditional logic
   * @returns {number} The calculated charge amount
   */
  calculate(baseAmount, tripData) {
    // Check if all conditions are met
    const allConditionsMet = this.conditions.every(condition => 
      condition.evaluate(tripData)
    );
    
    if (!allConditionsMet) {
      return 0; // Don't apply charge if conditions aren't met
    }
    
    if (this.isPercentage) {
      return (baseAmount * this.value) / 100;
    } else {
      return this.value;
    }
  }
}

module.exports = AdditionalCharge;
```

### models/rate_condition.js
```javascript
/**
 * RateCondition model - Represents a condition for applying a rate item
 */
class RateCondition {
  constructor({
    id = null,
    rateItemId,
    parameter,
    operator,
    value
  }) {
    this.id = id || generateUUID();
    this.rateItemId = rateItemId;
    this.parameter = parameter;
    this.operator = operator;
    this.value = value;
  }

  /**
   * Evaluate if the condition is met for the given trip data
   * @param {TripData} tripData - Data about the trip
   * @returns {boolean} True if condition is met
   */
  evaluate(tripData) {
    // Get the parameter value from trip data
    const paramValue = tripData[this.parameter];
    
    if (paramValue === undefined) {
      return false; // Parameter not found
    }
    
    // Evaluate based on operator
    switch (this.operator) {
      case ConditionOperator.EQUALS:
        return paramValue == this.value;
        
      case ConditionOperator.NOT_EQUALS:
        return paramValue != this.value;
        
      case ConditionOperator.GREATER_THAN:
        return paramValue > parseFloat(this.value);
        
      case ConditionOperator.LESS_THAN:
        return paramValue < parseFloat(this.value);
        
      case ConditionOperator.GREATER_THAN_EQUAL:
        return paramValue >= parseFloat(this.value);
        
      case ConditionOperator.LESS_THAN_EQUAL:
        return paramValue <= parseFloat(this.value);
        
      case ConditionOperator.BETWEEN:
        const [min, max] = this.value.split(',').map(v => parseFloat(v.trim()));
        return paramValue >= min && paramValue <= max;
        
      case ConditionOperator.IN:
        const values = this.value.split(',').map(v => v.trim());
        return values.includes(paramValue.toString());
        
      case ConditionOperator.NOT_IN:
        const excludedValues = this.value.split(',').map(v => v.trim());
        return !excludedValues.includes(paramValue.toString());
        
      case ConditionOperator.CONTAINS:
        return paramValue.toString().includes(this.value);
        
      default:
        throw new Error(`Unsupported condition operator: ${this.operator}`);
    }
  }
}

module.exports = RateCondition;
```

### models/fuel_adjustment.js
```javascript
/**
 * FuelAdjustment model - Represents fuel price adjustment for a rate
 */
class FuelAdjustment {
  constructor({
    enabled = false,
    basePrice = 0,
    currentPrice = 0,
    adjustmentFactor = 0
  }) {
    this.enabled = enabled;
    this.basePrice = parseFloat(basePrice);
    this.currentPrice = parseFloat(currentPrice);
    this.adjustmentFactor = parseFloat(adjustmentFactor);
  }

  /**
   * Calculate the fuel adjustment amount
   * @param {number} baseRate - The base rate to adjust
   * @returns {number} The calculated adjustment amount
   */
  calculate(baseRate) {
    if (!this.enabled || this.basePrice === 0) {
      return 0;
    }
    
    // Calculate the percentage change in fuel price
    const priceChange = this.currentPrice - this.basePrice;
    const percentageChange = (priceChange / this.basePrice) * 100;
    
    // Apply the adjustment factor
    const adjustmentAmount = (baseRate * percentageChange * this.adjustmentFactor) / 100;
    
    return adjustmentAmount;
  }
}

module.exports = FuelAdjustment;
```

### models/charge_calculation.js
```javascript
/**
 * ChargeCalculation model - Represents the result of a rate calculation
 */
class ChargeCalculation {
  constructor({
    baseCharge,
    additionalCharges = new Map(),
    fuelAdjustment = 0,
    discounts = new Map(),
    surcharges = new Map()
  }) {
    this.baseCharge = baseCharge;
    this.additionalCharges = additionalCharges;
    this.fuelAdjustment = fuelAdjustment;
    this.discounts = discounts;
    this.surcharges = surcharges;
    
    // Calculate total charge
    this.totalCharge = this.calculateTotalCharge();
  }

  /**
   * Calculate the total charge including all components
   * @returns {number} The total charge
   */
  calculateTotalCharge() {
    let total = this.baseCharge;
    
    // Add additional charges
    for (const amount of this.additionalCharges.values()) {
      total += amount;
    }
    
    // Add fuel adjustment
    total += this.fuelAdjustment;
    
    // Add surcharges
    for (const amount of this.surcharges.values()) {
      total += amount;
    }
    
    // Subtract discounts
    for (const amount of this.discounts.values()) {
      total -= amount;
    }
    
    return total;
  }

  /**
   * Get a detailed breakdown of the charge calculation
   * @returns {ChargeBreakdown} The charge breakdown
   */
  breakdown() {
    const additionalChargesArray = [];
    for (const [name, amount] of this.additionalCharges.entries()) {
      additionalChargesArray.push({ name, amount });
    }
    
    const discountsArray = [];
    for (const [name, amount] of this.discounts.entries()) {
      discountsArray.push({ name, amount });
    }
    
    const surchargesArray = [];
    for (const [name, amount] of this.surcharges.entries()) {
      surchargesArray.push({ name, amount });
    }
    
    return {
      baseCharge: this.baseCharge,
      additionalCharges: additionalChargesArray,
      fuelAdjustment: this.fuelAdjustment,
      discounts: discountsArray,
      surcharges: surchargesArray,
      totalCharge: this.totalCharge
    };
  }
}

module.exports = ChargeCalculation;
```

### models/enums.js
```javascript
/**
 * Enum for rate card status values
 * @readonly
 * @enum {string}
 */
const RateCardStatus = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  ARCHIVED: 'ARCHIVED'
});

/**
 * Enum for rate types
 * @readonly
 * @enum {string}
 */
const RateType = Object.freeze({
  FIXED: 'FIXED',
  PER_KM: 'PER_KM',
  PER_KG: 'PER_KG',
  PER_CBM: 'PER_CBM',
  SLAB_BASED: 'SLAB_BASED',
  ZONE_BASED: 'ZONE_BASED'
});

/**
 * Enum for additional charge types
 * @readonly
 * @enum {string}
 */
const ChargeType = Object.freeze({
  LOADING: 'LOADING',
  UNLOADING: 'UNLOADING',
  DETENTION: 'DETENTION',
  TOLL: 'TOLL',
  PERMIT: 'PERMIT',
  MULTIPLE_DELIVERY: 'MULTIPLE_DELIVERY',
  OTHER: 'OTHER'
});

/**
 * Enum for condition operators
 * @readonly
 * @enum {string}
 */
const ConditionOperator = Object.freeze({
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  GREATER_THAN_EQUAL: 'GREATER_THAN_EQUAL',
  LESS_THAN_EQUAL: 'LESS_THAN_EQUAL',
  BETWEEN: 'BETWEEN',
  IN: 'IN',
  NOT_IN: 'NOT_IN',
  CONTAINS: 'CONTAINS'
});

module.exports = {
  RateCardStatus,
  RateType,
  ChargeType,
  ConditionOperator
};
```

## Service Layer

### services/rate_card_service.js
```javascript
/**
 * Service for managing rate cards
 */
class RateCardService {
  /**
   * Constructor
   * @param {RateCardRepository} repository - Rate card repository
   * @param {RateCardValidator} validator - Rate card validator
   * @param {RateCalculator} calculator - Rate calculator
   * @param {RateCardImportExport} importExport - Import/export service
   * @param {WorkflowService} workflowService - Workflow service for approvals
   * @param {AuthService} authService - Authentication service
   */
  constructor(repository, validator, calculator, importExport, workflowService, authService) {
    this.repository = repository;
    this.validator = validator;
    this.calculator = calculator;
    this.importExport = importExport;
    this.workflowService = workflowService;
    this.authService = authService;
  }

  /**
   * Create a new rate card
   * @param {RateCardDTO} rateCardData - The rate card data
   * @returns {Promise<RateCard>} The created rate card
   * @throws {ValidationError} If validation fails
   * @throws {AuthorizationError} If user is not authorized
   */
  async createRateCard(rateCardData) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'create');
    
    // Validate rate card data
    const validationResult = this.validator.validateRateCard(rateCardData);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Check for overlapping date ranges
    const overlapResult = this.validator.checkForOverlaps(rateCardData);
    if (!overlapResult.isValid) {
      throw new ValidationError(overlapResult.errors);
    }
    
    // Create rate card entity
    const rateCard = new RateCard({
      name: rateCardData.name,
      clientId: rateCardData.clientId,
      description: rateCardData.description,
      effectiveFrom: new Date(rateCardData.effectiveFrom),
      effectiveTo: rateCardData.effectiveTo ? new Date(rateCardData.effectiveTo) : null,
      status: RateCardStatus.DRAFT,
      createdBy: this.authService.getCurrentUserId(),
      createdAt: new Date(),
      updatedBy: this.authService.getCurrentUserId(),
      updatedAt: new Date()
    });
    
    // Add rate items
    if (rateCardData.rateItems && Array.isArray(rateCardData.rateItems)) {
      for (const itemData of rateCardData.rateItems) {
        const itemValidation = this.validator.validateRateItem(itemData);
        if (!itemValidation.isValid) {
          throw new ValidationError(itemValidation.errors);
        }
        
        const rateItem = this._createRateItemFromDTO(itemData, rateCard.id);
        rateCard.addRateItem(rateItem);
      }
    }
    
    // Save to repository
    const savedRateCard = await this.repository.save(rateCard);
    
    // Create initial version
    const version = savedRateCard.createNewVersion();
    await this.repository.saveVersion(version);
    
    return savedRateCard;
  }

  /**
   * Update an existing rate card
   * @param {string} id - Rate card ID
   * @param {RateCardDTO} rateCardData - The updated rate card data
   * @returns {Promise<RateCard>} The updated rate card
   * @throws {NotFoundError} If rate card is not found
   * @throws {ValidationError} If validation fails
   * @throws {AuthorizationError} If user is not authorized
   */
  async updateRateCard(id, rateCardData) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'update');
    
    // Get existing rate card
    const existingRateCard = await this.repository.findById(id);
    if (!existingRateCard) {
      throw new NotFoundError(`Rate card with ID ${id} not found`);
    }
    
    // Check if update is allowed based on status
    if (existingRateCard.status !== RateCardStatus.DRAFT && 
        existingRateCard.status !== RateCardStatus.REJECTED) {
      throw new ValidationError(`Cannot update rate card with status ${existingRateCard.status}`);
    }
    
    // Validate updated data
    const validationResult = this.validator.validateRateCard(rateCardData);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Check for overlaps (excluding this rate card)
    const overlapResult = this.validator.checkForOverlaps({
      ...rateCardData,
      id: existingRateCard.id // Include ID to exclude this card from overlap check
    });
    if (!overlapResult.isValid) {
      throw new ValidationError(overlapResult.errors);
    }
    
    // Update properties
    existingRateCard.name = rateCardData.name || existingRateCard.name;
    existingRateCard.description = rateCardData.description || existingRateCard.description;
    
    if (rateCardData.effectiveFrom) {
      existingRateCard.effectiveFrom = new Date(rateCardData.effectiveFrom);
    }
    
    if (rateCardData.effectiveTo !== undefined) {
      existingRateCard.effectiveTo = rateCardData.effectiveTo ? new Date(rateCardData.effectiveTo) : null;
    }
    
    existingRateCard.updatedBy = this.authService.getCurrentUserId();
    existingRateCard.updatedAt = new Date();
    
    // Handle rate items
    if (rateCardData.rateItems && Array.isArray(rateCardData.rateItems)) {
      // Clear existing items (simplified approach - in practice might be more nuanced)
      existingRateCard.clearRateItems();
      
      // Add new items
      for (const itemData of rateCardData.rateItems) {
        const itemValidation = this.validator.validateRateItem(itemData);
        if (!itemValidation.isValid) {
          throw new ValidationError(itemValidation.errors);
        }
        
        const rateItem = this._createRateItemFromDTO(itemData, existingRateCard.id);
        existingRateCard.addRateItem(rateItem);
      }
    }
    
    // Save updated rate card
    const updatedRateCard = await this.repository.save(existingRateCard);
    
    // Create new version
    const newVersion = updatedRateCard.createNewVersion();
    await this.repository.saveVersion(newVersion);
    
    return updatedRateCard;
  }

  /**
   * Get rate card by ID
   * @param {string} id - Rate card ID
   * @returns {Promise<RateCard>} The rate card
   * @throws {NotFoundError} If rate card is not found
   * @throws {AuthorizationError} If user is not authorized
   */
  async getRateCard(id) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'read');
    
    // Get rate card
    const rateCard = await this.repository.findById(id);
    if (!rateCard) {
      throw new NotFoundError(`Rate card with ID ${id} not found`);
    }
    
    return rateCard;
  }

  /**
   * List rate cards with optional filtering
   * @param {RateCardFilter} filters - Filters to apply
   * @returns {Promise<RateCardList>} List of rate cards with pagination
   * @throws {AuthorizationError} If user is not authorized
   */
  async listRateCards(filters) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'list');
    
    // Get rate cards
    return await this.repository.findAll(filters);
  }

  /**
   * Delete a rate card
   * @param {string} id - Rate card ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If rate card is not found
   * @throws {AuthorizationError} If user is not authorized
   * @throws {ValidationError} If rate card is in use
   */
  async deleteRateCard(id) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'delete');
    
    // Get rate card
    const rateCard = await this.repository.findById(id);
    if (!rateCard) {
      throw new NotFoundError(`Rate card with ID ${id} not found`);
    }
    
    // Check if rate card can be deleted
    if (rateCard.status !== RateCardStatus.DRAFT && rateCard.status !== RateCardStatus.REJECTED) {
      throw new ValidationError(`Cannot delete rate card with status ${rateCard.status}`);
    }
    
    // Delete rate card
    await this.repository.delete(id);
  }

  /**
   * Submit a rate card for approval
   * @param {string} id - Rate card ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If rate card is not found
   * @throws {AuthorizationError} If user is not authorized
   * @throws {ValidationError} If rate card status is not DRAFT
   */
  async submitForApproval(id) {
    // Check authorization
    this.authService.checkPermission('rate_card', 'submit_for_approval');
    
    // Get rate card
    const rateCard = await this.repository.findById(id);
    if (!rateCard) {
      throw new NotFoundError(`Rate card with ID ${id} not found`);
    }
    
    // Validate rate card can be submitted
    if (rateCard.status !== RateCardStatus.DRAFT && rateCard.status !== RateCardStatus.REJECTED) {
      throw new ValidationError(`Cannot submit rate card with status ${rateCard.status}`);
    }
    
    // Final validation before submission
    const validationResult = this.validator.validateRateCard(rateCard);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Update status
    rateCard.status = RateCardStatus.PENDING_APPROVAL;
    rateCard.updatedBy = this.authService.getCurrentUserId();
    rateCard.updatedAt = new Date();
    
    // Save updated rate card