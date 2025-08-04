const useLocal = import.meta.env.VITE_USE_LOCAL === 'true';
const localUrl = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:4000';
const prodUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = useLocal ? localUrl : prodUrl;
console.log(`Using ${useLocal ? 'local' : 'production'} API URL: ${API_BASE_URL}`); 