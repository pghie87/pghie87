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