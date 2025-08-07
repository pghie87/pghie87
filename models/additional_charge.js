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