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
  nodes?: number;
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
  async getMove(
    fen: string,
    level: number = 1500,
    nodes: number = 1,
  ): Promise<MoveResponse> {
    const response = await this.apiClient.post<MoveResponse>('/get_move', {
      fen,
      level,
      nodes,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;