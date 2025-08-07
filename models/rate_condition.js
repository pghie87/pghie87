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