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