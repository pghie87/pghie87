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