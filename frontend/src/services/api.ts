import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Debug logging to help troubleshoot deployment issues
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

export interface MoveRequest {
  fen: string;
  level?: number;
}

export interface MoveResponse {
  move: string;
  level: number;
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
    timeout: 10000, // 10 second timeout
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
  async getMove(fen: string, level: number = 1500): Promise<MoveResponse> {
    try {
      console.log(`🎯 Making API call to: ${API_BASE_URL}/get_move`);
      console.log(`📋 Request data:`, { fen, level });
      
      const response = await this.apiClient.post<MoveResponse>('/get_move', {
        fen,
        level,
      });
      
      console.log(`✅ API response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error:`, error);
      console.error(`📍 URL attempted:`, `${API_BASE_URL}/get_move`);
      console.error(`🔍 Error details:`, {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        config: error?.config
      });
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;