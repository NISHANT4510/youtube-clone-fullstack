// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   withCredentials: true
// });

// // Add request interceptor to inject auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   // Log request details for debugging
//   console.log('Request config:', {
//     url: config.url,
//     method: config.method,
//     headers: config.headers,
//     data: config.data
//   });
//   return config;
// }, (error) => {
//   console.error('Request interceptor error:', error);
//   return Promise.reject(error);
// });

// // Add response interceptor to handle auth errors
// api.interceptors.response.use(
//   (response) => {
//     // Log successful responses for debugging
//     console.log('Response:', {
//       status: response.status,
//       data: response.data
//     });
//     return response;
//   },
//   async (error) => {
//     // Log error responses for debugging
//     console.error('Response error:', {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
    
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
      
//       if (!window.location.pathname.includes('/login')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

// Auto-select backend URL based on environment
const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://youtube-clone-fullstack-1.onrender.com/api'
    : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorResponse = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      isCORSError: error.message === 'Network Error' || error.message.includes('CORS'),
    };

    console.error('Response error:', errorResponse);

    if (errorResponse.isCORSError) {
      console.error('CORS Error: Please check if the server is running and CORS is properly configured');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
