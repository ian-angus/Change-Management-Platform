import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Interceptor to log requests (optional, for debugging)
apiClient.interceptors.request.use(request => {
  console.log('Starting Request to:', request.url);
  console.log('Request baseURL:', request.baseURL);
  const token = localStorage.getItem('access_token'); // or whatever key you use
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

// RESPONSE INTERCEPTOR: Handle expired token
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.msg === 'Token has expired') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('brightfoldUser');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

