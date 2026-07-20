import axios from 'axios';
import { Message, Flight, Gate, Baggage, PublicFlight, PublicGate } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, role: 'admin' | 'passenger' = 'admin'): Promise<{ token: string }> => {
    const response = await apiClient.post('/api/auth/register', { email, password, role });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (sessionId: string, message: string): Promise<Message> => {
    const response = await apiClient.post('/api/chat/message', { sessionId, message });
    return response.data;
  },

  getHistory: async (sessionId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/api/chat/history/${sessionId}`);
    return response.data.messages;
  },
};

// Public flight board API (no auth required — same info shown on terminal display boards)
export const publicAPI = {
  getFlights: async (direction?: 'arrivals' | 'departures', limit = 20): Promise<PublicFlight[]> => {
    const response = await apiClient.get('/api/public/flights', { params: { direction, limit } });
    return response.data.flights;
  },

  getGates: async (): Promise<PublicGate[]> => {
    const response = await apiClient.get('/api/public/gates');
    return response.data.gates;
  },
};

// Flight API
export const flightAPI = {
  getAll: async (query?: object): Promise<Flight[]> => {
    const response = await apiClient.get('/api/flights', { params: query });
    return response.data.flights;
  },

  getById: async (flightNumber: string): Promise<Flight> => {
    const response = await apiClient.get(`/api/flights/${flightNumber}`);
    return response.data.flight;
  },

  create: async (flight: Partial<Flight>): Promise<Flight> => {
    const response = await apiClient.post('/api/flights', flight);
    return response.data.flight;
  },

  update: async (flightNumber: string, updates: Partial<Flight>): Promise<Flight> => {
    const response = await apiClient.patch(`/api/flights/${flightNumber}`, updates);
    return response.data.flight;
  },

  delete: async (flightNumber: string): Promise<void> => {
    await apiClient.delete(`/api/flights/${flightNumber}`);
  },
};

// Gate API
export const gateAPI = {
  getAll: async (): Promise<Gate[]> => {
    const response = await apiClient.get('/api/gates');
    return response.data.gates;
  },

  getById: async (gateNumber: string): Promise<Gate> => {
    const response = await apiClient.get(`/api/gates/${gateNumber}`);
    return response.data.gate;
  },

  create: async (gate: Partial<Gate>): Promise<Gate> => {
    const response = await apiClient.post('/api/gates', gate);
    return response.data.gate;
  },

  update: async (gateNumber: string, updates: Partial<Gate>): Promise<Gate> => {
    const response = await apiClient.patch(`/api/gates/${gateNumber}`, updates);
    return response.data.gate;
  },

  delete: async (gateNumber: string): Promise<void> => {
    await apiClient.delete(`/api/gates/${gateNumber}`);
  },
};

// Baggage API
export const baggageAPI = {
  getByTagId: async (tagId: string): Promise<Baggage> => {
    const response = await apiClient.get(`/api/baggage/${tagId}`);
    return response.data.baggage;
  },

  getByFlightNumber: async (flightNumber: string): Promise<Baggage[]> => {
    const response = await apiClient.get(`/api/baggage/flight/${flightNumber}`);
    return response.data.baggage;
  },

  create: async (baggage: Partial<Baggage>): Promise<Baggage> => {
    const response = await apiClient.post('/api/baggage', baggage);
    return response.data.baggage;
  },

  update: async (tagId: string, updates: Partial<Baggage>): Promise<Baggage> => {
    const response = await apiClient.patch(`/api/baggage/${tagId}`, updates);
    return response.data.baggage;
  },

  delete: async (tagId: string): Promise<void> => {
    await apiClient.delete(`/api/baggage/${tagId}`);
  },
};
