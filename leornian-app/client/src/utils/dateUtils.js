// Convert UTC date to US Central time
export const toCentralTime = (date) => {
  const centralDate = new Date(date);
  centralDate.setHours(centralDate.getHours() - 5); // UTC to Central (UTC-5)
  return centralDate;
};

// Convert US Central time to UTC
export const toUTC = (date) => {
  const utcDate = new Date(date);
  utcDate.setHours(utcDate.getHours() + 5); // Central to UTC (UTC+5)
  return utcDate;
};

// Format date to YYYY-MM-DD in Central time
export const formatDateToCentral = (date) => {
  const centralDate = toCentralTime(date);
  return centralDate.toISOString().split('T')[0];
};

// Get current date in Central time
export const getCurrentCentralDate = () => {
  return toCentralTime(new Date());
};

// Check if two dates are the same day in Central time
export const isSameDayInCentral = (date1, date2) => {
  const central1 = toCentralTime(date1);
  const central2 = toCentralTime(date2);
  return central1.toISOString().split('T')[0] === central2.toISOString().split('T')[0];
}; 