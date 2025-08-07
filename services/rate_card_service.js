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