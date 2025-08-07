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