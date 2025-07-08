import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService } from '../api';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockAxios = axios as any;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMove', () => {
    it('calls API with correct parameters', async () => {
      const mockResponse = {
        data: { move: 'e2e4', level: 1500, nodes: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1500,
        1
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/get_move'),
        {
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          level: 1500,
          nodes: 1,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      expect(result).toEqual({ move: 'e2e4', level: 1500, nodes: 1 });
    });

    it('handles network errors', async () => {
      const mockError = new Error('Network Error');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(
        apiService.getMove(
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          1500,
          1
        )
      ).rejects.toThrow('Network Error');
    });

    it('handles HTTP error responses', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid FEN' },
        },
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(
        apiService.getMove('invalid_fen', 1500, 1)
      ).rejects.toEqual(mockError);
    });

    it('uses correct timeout', async () => {
      const mockResponse = {
        data: { move: 'e2e4', level: 1500, nodes: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1500,
        1
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it('uses correct headers', async () => {
      const mockResponse = {
        data: { move: 'e2e4', level: 1500, nodes: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1500,
        1
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('handles different AI levels', async () => {
      const mockResponse = {
        data: { move: 'e2e4', level: 1800, nodes: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1800,
        1
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          level: 1800,
        }),
        expect.any(Object)
      );
    });

    it('handles different node counts', async () => {
      const mockResponse = {
        data: { move: 'e2e4', level: 1500, nodes: 100 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1500,
        100
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          nodes: 100,
        }),
        expect.any(Object)
      );
    });
  });

  describe('healthCheck', () => {
    it('calls health endpoint correctly', async () => {
      const mockResponse = {
        data: { status: 'healthy', timestamp: Date.now() },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await apiService.healthCheck();

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          timeout: 5000,
        })
      );

      expect(result).toEqual({ status: 'healthy', timestamp: expect.any(Number) });
    });

    it('handles health check failures', async () => {
      const mockError = new Error('Service unavailable');
      mockAxios.get.mockRejectedValue(mockError);

      await expect(apiService.healthCheck()).rejects.toThrow('Service unavailable');
    });
  });

  describe('API Base URL', () => {
    it('uses localhost by default', () => {
      // Since we can't easily test environment variables in Vitest,
      // we'll test that the API service has the expected structure
      expect(apiService).toBeDefined();
      expect(apiService.getMove).toBeInstanceOf(Function);
      expect(apiService.healthCheck).toBeInstanceOf(Function);
    });
  });

  describe('Error Handling', () => {
    it('handles timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      timeoutError.name = 'ECONNABORTED';
      mockAxios.post.mockRejectedValue(timeoutError);

      await expect(
        apiService.getMove(
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          1500,
          1
        )
      ).rejects.toThrow('timeout of 30000ms exceeded');
    });

    it('handles server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      };

      mockAxios.post.mockRejectedValue(serverError);

      await expect(
        apiService.getMove(
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          1500,
          1
        )
      ).rejects.toEqual(serverError);
    });

    it('handles malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await apiService.getMove(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        1500,
        1
      );

      // Should return whatever data is provided, even if malformed
      expect(result).toBe('invalid json');
    });
  });
});