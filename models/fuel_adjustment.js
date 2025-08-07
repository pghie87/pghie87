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