import { api } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  profile_image: string | null;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Create FormData for the login request (FastAPI expects form data for OAuth)
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    // POST to the token endpoint
    const response = await fetch('http://localhost:8000/token', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage for API requests
    localStorage.setItem('token', data.access_token);
    
    // Also store token in cookies for middleware
    document.cookie = `token=${data.access_token}; path=/; max-age=${60 * 30}`; // 30 minutes
    
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0'; // Delete the cookie
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // A simple function to decode the JWT token payload
  // This is not secure for sensitive operations but useful for basic info
  getTokenPayload: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}; 