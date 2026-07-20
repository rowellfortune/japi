import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => {
  return uuidv4();
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

export const getSessionIdFromStorage = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem('adminToken', token);
};

export const clearAdminToken = (): void => {
  localStorage.removeItem('adminToken');
};
