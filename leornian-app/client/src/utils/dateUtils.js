import { utcToZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';

const CHICAGO = 'America/Chicago';

// Convert any JS Date to a Date object in the Chicago timezone
export const toCentralTime = (date) => utcToZonedTime(date, CHICAGO);

// Convert a Date that is assumed to be Chicago wall time into UTC
export const toUTC = (date) => zonedTimeToUtc(date, CHICAGO);

export const formatDateToCentral = (date) =>
  format(utcToZonedTime(date, CHICAGO), 'yyyy-MM-dd', { timeZone: CHICAGO });

export const getCurrentCentralDate = () => utcToZonedTime(new Date(), CHICAGO);

export const isSameDayInCentral = (a, b) =>
  formatDateToCentral(a) === formatDateToCentral(b);
