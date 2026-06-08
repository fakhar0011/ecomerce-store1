// Frontend environment configuration
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

export const tokenKeys = {
  token: 'auth_token',
  user: 'auth_user',
} as const;
