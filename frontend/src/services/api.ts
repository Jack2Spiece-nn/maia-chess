/**
 * Enhanced API service for Maia Chess with performance optimization
 * and comprehensive error handling
 */

export interface MoveRequest {
  fen: string;
  level: number;
  nodes?: number;
}

export interface MoveResponse {
  move: string;
  level: number;
  nodes: number;
  response_time_ms: number;
  engine_cached: boolean;
  computation_time_ms: number;
  engine_type: string;
  performance_metrics?: {
    memory_usage_mb: number;
    cache_efficiency: boolean;
    optimization_active: boolean;
  };
}

export interface PerformanceMetrics {
  response_time_ms: number;
  status: number;
  connection_type: string;
  timestamp: number;
  cached: boolean;
}

export interface NetworkValidationResult {
  avg_response_time_ms: number;
  success_rate: number;
  connection_quality: 'excellent' | 'good' | 'poor' | 'offline';
  timestamp: number;
}

class MaiaApiService {
  private baseUrl: string;
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Validate network performance by checking API health
   */
  async validateNetworkPerformance(): Promise<NetworkValidationResult> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Log performance metrics
      const metrics: PerformanceMetrics = {
        response_time_ms: responseTime,
        status: response.status,
        connection_type: 'keep-alive',
        timestamp: Date.now(),
        cached: false
      };
      
      this.performanceMetrics.push(metrics);
      
      // Keep only last 50 metrics
      if (this.performanceMetrics.length > 50) {
        this.performanceMetrics = this.performanceMetrics.slice(-50);
      }
      
      console.log('NETWORK_VALIDATION:', metrics);
      
      // Determine connection quality
      let connectionQuality: NetworkValidationResult['connection_quality'] = 'excellent';
      if (responseTime > 2000) connectionQuality = 'poor';
      else if (responseTime > 1000) connectionQuality = 'good';
      
      return {
        avg_response_time_ms: responseTime,
        success_rate: response.ok ? 1.0 : 0.0,
        connection_quality: connectionQuality,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Network validation failed:', error);
      return {
        avg_response_time_ms: 0,
        success_rate: 0.0,
        connection_quality: 'offline',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get recent performance metrics summary
   */
  getPerformanceMetrics(): {
    avgResponseTime: number;
    successRate: number;
    recentMetrics: PerformanceMetrics[];
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 0,
        recentMetrics: []
      };
    }

    const recentMetrics = this.performanceMetrics.slice(-10);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.response_time_ms, 0) / recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => m.status >= 200 && m.status < 400);
    const successRate = successfulRequests.length / recentMetrics.length;

    return {
      avgResponseTime,
      successRate,
      recentMetrics
    };
  }

  /**
   * Enhanced move request with retry logic and performance tracking
   */
  async getMove(request: MoveRequest): Promise<MoveResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}/get_move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          },
          body: JSON.stringify(request)
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: MoveResponse = await response.json();
        
        // Track performance metrics
        const metrics: PerformanceMetrics = {
          response_time_ms: responseTime,
          status: response.status,
          connection_type: 'keep-alive',
          timestamp: Date.now(),
          cached: data.engine_cached
        };
        
        this.performanceMetrics.push(metrics);
        
        // Log successful request
        console.log(`MOVE_REQUEST_SUCCESS: Attempt ${attempt}, Response time: ${responseTime.toFixed(2)}ms, Engine cached: ${data.engine_cached}`);
        
        return data;
        
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Track failed request
        const metrics: PerformanceMetrics = {
          response_time_ms: responseTime,
          status: 0, // Indicate network error
          connection_type: 'failed',
          timestamp: Date.now(),
          cached: false
        };
        
        this.performanceMetrics.push(metrics);
        
        console.error(`MOVE_REQUEST_FAILED: Attempt ${attempt}/${this.maxRetries}, Error:`, lastError.message);
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw new Error(`Failed to get move after ${this.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Get detailed backend metrics for debugging
   */
  async getBackendMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get backend metrics:', error);
      throw error;
    }
  }

  /**
   * Trigger engine performance validation on the backend
   */
  async validateEnginePerformance(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('ENGINE_VALIDATION_RESULT:', result);
      return result;
    } catch (error) {
      console.error('Engine validation failed:', error);
      throw error;
    }
  }

  /**
   * Check if the API is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const maiaApi = new MaiaApiService();

// Export for use in components
export default maiaApi;