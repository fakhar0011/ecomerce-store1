export interface APIError {
  success: false;
  message: string;
  error?: any;
  statusCode: number;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode: number;
  timestamp: string;
}

export class APIClientError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}
