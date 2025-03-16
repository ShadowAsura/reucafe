import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Program API calls
export const getPrograms = async (params) => {
  try {
    const response = await api.get('/programs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

export const getProgramById = async (id) => {
  try {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching program ${id}:`, error);
    throw error;
  }
};

export const suggestProgram = async (programData) => {
  try {
    const response = await api.post('/programs/suggest', programData);
    return response.data;
  } catch (error) {
    console.error('Error suggesting program:', error);
    throw error;
  }
};

// Auth API calls
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// User API calls
export const saveProgram = async (programId) => {
  try {
    const response = await api.post(`/users/save-program/${programId}`);
    return response.data;
  } catch (error) {
    console.error(`Error saving program ${programId}:`, error);
    throw error;
  }
};

export const unsaveProgram = async (programId) => {
  try {
    const response = await api.delete(`/users/save-program/${programId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unsaving program ${programId}:`, error);
    throw error;
  }
};

export const getSavedPrograms = async () => {
  try {
    const response = await api.get('/users/saved-programs');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved programs:', error);
    throw error;
  }
};