export const isNetworkError = (err) => {
  return (
    err?.name === 'NetworkError' ||
    (err?.message && err.message.includes('Network')) ||
    (err?.message && err.message.includes('fetch')) ||
    (err?.message && err.message.includes('Failed to fetch'))
  );
};
export const getErrorMessage = (err, defaultMessage = 'An error occurred. Please try again.') => {
  if (isNetworkError(err)) {
    return 'Server is starting up. Please wait a moment and try again.';
  }
  if (err?.message) {
    return err.message;
  }
  return defaultMessage;
};
export const shouldRetry = (err) => {
  return isNetworkError(err);
};
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