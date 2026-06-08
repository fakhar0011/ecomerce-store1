// 'use client';

// import { apiConfig, tokenKeys } from './api-config';
// import { APIResponse, APIClientError } from './api-types';
// export type { APIClientError } from './api-types';

// interface RequestOptions {
//   method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//   headers?: Record<string, string>;
//   body?: any;
//   timeout?: number;
//   retry?: boolean;
// }

// export class EnhancedAPIClient {
//   private baseURL: string;
//   private timeout: number;

//   constructor(baseURL: string = apiConfig.baseURL, timeout: number = apiConfig.timeout) {
//     this.baseURL = baseURL;
//     this.timeout = timeout;
//   }

//   /**
//    * Get auth token from localStorage
//    */
//   private getAuthToken(): string | null {
//     if (typeof window === 'undefined') return null;
//     return localStorage.getItem(tokenKeys.token);
//   }

//   /**
//    * Create abort signal with timeout
//    */
//   private createAbortSignal(timeout: number): AbortSignal {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), timeout);
//     return controller.signal;
//   }

//   /**
//    * Build request headers
//    */
//   private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       ...customHeaders,
//     };

//     const token = this.getAuthToken();
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     return headers;
//   }

//   /**
//    * Main request method with retry logic
//    */
//   private async request<T = any>(
//     endpoint: string,
//     options: RequestOptions = {},
//     retryCount: number = 0
//   ): Promise<APIResponse<T>> {
//     const url = `${this.baseURL}${endpoint}`;
//     const timeout = options.timeout || this.timeout;
//     const shouldRetry = options.retry !== false;

//     try {
//       const response = await fetch(url, {
//         method: options.method || 'GET',
//         headers: this.buildHeaders(options.headers),
//         body: options.body ? JSON.stringify(options.body) : undefined,
//         signal: this.createAbortSignal(timeout),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new APIClientError(response.status, data.message || 'API request failed', data);
//       }

//       return data;
//     } catch (error) {
//       // Retry logic for network errors
//       if (
//         shouldRetry &&
//         retryCount < apiConfig.retryAttempts &&
//         (error instanceof TypeError || (error instanceof APIClientError && error.statusCode >= 500))
//       ) {
//         await new Promise(resolve => setTimeout(resolve, apiConfig.retryDelay * (retryCount + 1)));
//         return this.request<T>(endpoint, options, retryCount + 1);
//       }

//       if (error instanceof APIClientError) {
//         throw error;
//       }

//       throw new APIClientError(
//         0,
//         error instanceof Error ? error.message : 'Unknown error occurred',
//         error
//       );
//     }
//   }

//   /**
//    * GET request
//    */
//   async get<T = any>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { ...options, method: 'GET' });
//   }

//   /**
//    * POST request
//    */
//   async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { ...options, method: 'POST', body });
//   }

//   /**
//    * PUT request
//    */
//   async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { ...options, method: 'PUT', body });
//   }

//   /**
//    * PATCH request
//    */
//   async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
//   }

//   /**
//    * DELETE request
//    */
//   async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
//     return this.request<T>(endpoint, { ...options, method: 'DELETE' });
//   }

//   /**
//    * Check if user is authenticated
//    */
//   isAuthenticated(): boolean {
//     return !!this.getAuthToken();
//   }

//   /**
//    * Store auth token
//    */
//   setAuthToken(token: string): void {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(tokenKeys.token, token);
//     }
//   }

//   /**
//    * Clear auth token
//    */
//   clearAuthToken(): void {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem(tokenKeys.token);
//       localStorage.removeItem(tokenKeys.user);
//     }
//   }
// }

// // Export singleton instance
// export const apiClient = new EnhancedAPIClient();
