// Simple date utilities using native JavaScript Date methods
const CHICAGO = 'America/Chicago';

// Convert a Date to a 'yyyy-MM-dd' string in Chicago timezone
export const formatDateAsCentral = (date) => {
  return date.toLocaleDateString('en-CA', { timeZone: CHICAGO });
};

// Get the current date in Chicago timezone
export const getCurrentCentralDate = () => {
  const now = new Date();
  const chicagoDateString = now.toLocaleDateString('en-CA', { timeZone: CHICAGO });
  const [year, month, day] = chicagoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Convert a UTC Date to Chicago time
export const toCentralTime = (date) => {
  const chicagoDateString = date.toLocaleDateString('en-CA', { timeZone: CHICAGO });
  const [year, month, day] = chicagoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Check if two Date objects represent the same calendar day in Chicago time
export const isSameDayInCentral = (a, b) => {
  return formatDateAsCentral(a) === formatDateAsCentral(b);
};
