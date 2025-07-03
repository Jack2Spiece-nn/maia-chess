import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend axios config to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      requestId: number;
      startTime: number;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Enable logging in development
const isDevelopment = import.meta.env.DEV;

const log = {
  info: (...args: any[]) => isDevelopment && console.log('[API]', ...args),
  warn: (...args: any[]) => isDevelopment && console.warn('[API]', ...args),
  error: (...args: any[]) => console.error('[API]', ...args),
  debug: (...args: any[]) => isDevelopment && console.debug('[API]', ...args),
};

export interface MoveRequest {
  fen: string;
  level?: number;
  nodes?: number;
}

export interface MoveResponse {
  move: string;
  level: number;
  nodes: number;
  response_time?: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
  metrics?: {
    request_count: number;
    error_count: number;
    avg_response_time: number;
  };
}

export interface DetailedStatusResponse {
  server: {
    status: string;
    version: string;
    request_count: number;
    error_count: number;
    avg_response_time: number;
  };
  engines: {
    environment: any;
    cached_engines: number[];
    model_status: Record<number, boolean>;
    weights_dirs: string[];
  };
  timestamp: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // Increased timeout to 30 seconds for higher node counts
  });

  private requestId = 0;

  constructor() {
    // Request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        const currentRequestId = ++this.requestId;
        config.metadata = { requestId: currentRequestId, startTime: Date.now() };
        
        log.info(`Request ${currentRequestId}: ${config.method?.toUpperCase()} ${config.url}`);
        log.debug(`Request ${currentRequestId} payload:`, config.data);
        
        return config;
      },
      (error) => {
        log.error('Request setup error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        const { requestId, startTime } = response.config.metadata || {};
        const duration = Date.now() - (startTime || 0);
        
        log.info(`Response ${requestId}: ${response.status} (${duration}ms)`);
        log.debug(`Response ${requestId} data:`, response.data);
        
        // Log slow requests
        if (duration > 5000) {
          log.warn(`Slow response detected: ${duration}ms for request ${requestId}`);
        }
        
        return response;
      },
      (error: AxiosError) => {
        const { requestId, startTime } = error.config?.metadata || {};
        const duration = Date.now() - (startTime || 0);
        
        log.error(`Request ${requestId} failed (${duration}ms):`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.error || `Server error: ${error.response.status}`,
        status: error.response.status,
        code: data?.code,
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: { timeout: error.code === 'ECONNABORTED' },
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    let lastError: ApiError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as ApiError;
        
        // Don't retry on client errors (4xx) or on the last attempt
        if (
          attempt === maxRetries + 1 ||
          (lastError.status && lastError.status >= 400 && lastError.status < 500)
        ) {
          break;
        }
        
        log.warn(`Request attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if the backend API is healthy
   */
  async healthCheck(): Promise<HealthResponse> {
    log.info('Performing health check');
    
    return this.retryRequest(async () => {
      const response = await this.apiClient.get<HealthResponse>('/');
      return response.data;
    });
  }

  /**
   * Get detailed status information for debugging
   */
  async getDetailedStatus(): Promise<DetailedStatusResponse> {
    log.info('Fetching detailed status');
    
    const response = await this.apiClient.get<DetailedStatusResponse>('/status');
    return response.data;
  }

  /**
   * Get the best move from Maia AI for a given position
   */
  async getMove(fen: string, level: number = 1500, nodes: number = 1): Promise<MoveResponse> {
    log.info(`Requesting move: level=${level}, nodes=${nodes}`);
    log.debug(`FEN: ${fen}`);
    
    // Validate inputs
    if (!fen || typeof fen !== 'string') {
      throw {
        message: 'FEN string is required',
        code: 'VALIDATION_ERROR',
      } as ApiError;
    }
    
    if (![1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900].includes(level)) {
      throw {
        message: 'Invalid AI level. Must be between 1100-1900.',
        code: 'VALIDATION_ERROR',
      } as ApiError;
    }
    
    if (nodes < 1 || nodes > 10000) {
      throw {
        message: 'Nodes must be between 1 and 10000',
        code: 'VALIDATION_ERROR',
      } as ApiError;
    }
    
    return this.retryRequest(async () => {
      const response = await this.apiClient.post<MoveResponse>('/get_move', {
        fen,
        level,
        nodes,
      });
      
      log.info(`Move received: ${response.data.move} (${response.data.response_time || 'unknown'}s)`);
      return response.data;
    });
  }

  /**
   * Test the connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      log.error('Connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;