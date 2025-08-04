/**
 * Utility functions for handling API errors and providing user-friendly messages
 */

/**
 * Detects if an error is a network error (server not reachable)
 * @param {Error} err - The error object from fetch
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (err) => {
  return (
    err?.name === 'NetworkError' ||
    (err?.message && err.message.includes('Network')) ||
    (err?.message && err.message.includes('fetch')) ||
    (err?.message && err.message.includes('Failed to fetch'))
  );
};

/**
 * Gets a user-friendly error message based on the error type
 * @param {Error} err - The error object from fetch
 * @param {string} defaultMessage - Default message if error type is unknown
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (err, defaultMessage = 'An error occurred. Please try again.') => {
  // Network errors (server not reachable)
  if (isNetworkError(err)) {
    return 'Server is starting up. Please wait a moment and try again.';
  }

  // Generic error with message
  if (err?.message) {
    return err.message;
  }

  return defaultMessage;
};

/**
 * Determines if an error should trigger a retry with delay
 * @param {Error} err - The error object from fetch
 * @returns {boolean} - True if the error suggests retrying might help
 */
export const shouldRetry = (err) => {
  return isNetworkError(err);
};

/**
 * Creates a retry function that waits before retrying
 * @param {Function} fn - The function to retry
 * @param {number} delayMs - Delay in milliseconds before retry
 * @returns {Function} - Function that will retry the original function
 */
export const createRetryFunction = (fn, delayMs = 2000) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (shouldRetry(err)) {
        console.log(`Retrying after ${delayMs}ms due to:`, err.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return await fn(...args);
      }
      throw err;
    }
  };
}; 