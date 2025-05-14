// API Base URL - pointing to your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

// Default request options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Generic request function
async function request(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null, 
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    method,
  };

  if (data) {
    if (data instanceof FormData) {
      // FormData should be sent without Content-Type to let the browser set it
      delete requestOptions.headers?.['Content-Type'];
      requestOptions.body = data;
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const response = await fetch(url, requestOptions);
  return handleResponse(response);
}

// API methods
export const api = {
  get: (endpoint: string, options = {}) => 
    request(endpoint, 'GET', null, options),
  
  post: (endpoint: string, data: any, options = {}) => 
    request(endpoint, 'POST', data, options),
  
  put: (endpoint: string, data: any, options = {}) => 
    request(endpoint, 'PUT', data, options),
  
  delete: (endpoint: string, data: any = null, options = {}) => 
    request(endpoint, 'DELETE', data, options),
}; 