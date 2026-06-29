import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:5001/api', // Update if deployed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      // Usually we don't automatically redirect to login to prevent loops, 
      // but we can let AuthContext handle the redirect if needed.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
