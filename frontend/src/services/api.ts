import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface MoveRequest {
  fen: string;
  level?: number;
  nodes?: number;
}

export interface MoveResponse {
  move: string;
  level: number;
  nodes: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}

class ApiService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout for render deployment
  });

  /**
   * Check if the backend API is healthy
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await this.apiClient.get<HealthResponse>('/');
    return response.data;
  }

  /**
   * Get the best move from Maia AI for a given position
   */
  async getMove(fen: string, level: number = 1500, nodes: number = 1): Promise<MoveResponse> {
    try {
      const response = await this.apiClient.post<MoveResponse>('/get_move', {
        fen,
        level,
        nodes,
      });
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for render deployment
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Maia is taking too long to respond');
      } else if (error.response?.status === 404) {
        throw new Error(`AI level ${level} is not available`);
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid request parameters');
      } else if (error.response?.status >= 500) {
        throw new Error('Maia server is currently unavailable. Please try again.');
      } else if (error.message?.includes('Network Error')) {
        throw new Error('Network connection issue. Please check your internet connection.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;