// dateUtils.js
const CHICAGO = 'America/Chicago';

/* Convert any JS Date to a new Date that represents the same *wall time*
   in Chicago. */
export const toCentralTime = (date) =>
  new Date(date.toLocaleString('en-US', { timeZone: CHICAGO }));

/* Convert a Chicago wall-time Date back to UTC */
export const toUTC = (date) =>
  new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));

export const formatDateToCentral = (date) =>
  toCentralTime(date).toISOString().split('T')[0];

export const getCurrentCentralDate = () => toCentralTime(new Date());

export const isSameDayInCentral = (a, b) =>
  formatDateToCentral(a) === formatDateToCentral(b);
