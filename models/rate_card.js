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