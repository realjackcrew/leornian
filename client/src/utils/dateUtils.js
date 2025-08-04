const CHICAGO = 'America/Chicago';
export const formatDateAsCentral = (date) => {
  return date.toLocaleDateString('en-CA', { timeZone: CHICAGO });
};
export const getCurrentCentralDate = () => {
  const now = new Date();
  const chicagoDateString = now.toLocaleDateString('en-CA', { timeZone: CHICAGO });
  const [year, month, day] = chicagoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
export const toCentralTime = (date) => {
  const chicagoDateString = date.toLocaleDateString('en-CA', { timeZone: CHICAGO });
  const [year, month, day] = chicagoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
export const isSameDayInCentral = (a, b) => {
  return formatDateAsCentral(a) === formatDateAsCentral(b);
};
