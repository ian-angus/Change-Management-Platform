import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Interceptor to log requests (optional, for debugging)
apiClient.interceptors.request.use(request => {
  console.log('Starting Request to:', request.url);
  console.log('Request baseURL:', request.baseURL);
  return request;
});

export default apiClient;

