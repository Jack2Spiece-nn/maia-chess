import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  apiResponseTime: number | null;
  lastMoveTime: number | null;
  networkStatus: 'online' | 'offline' | 'slow';
  touchLatency: number | null;
  renderFPS: number | null;
}

interface TouchEvent {
  timestamp: number;
  type: 'start' | 'end';
  target: string;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: null,
    lastMoveTime: null,
    networkStatus: 'online',
    touchLatency: null,
    renderFPS: null,
  });

  const [touchEvents, setTouchEvents] = useState<TouchEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setMetrics(prev => ({ ...prev, networkStatus: 'offline' }));
        return;
      }

      // Simple network speed test using a small image
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        const status = loadTime > 2000 ? 'slow' : 'online';
        setMetrics(prev => ({ ...prev, networkStatus: status }));
      };
      
      img.onerror = () => {
        setMetrics(prev => ({ ...prev, networkStatus: 'offline' }));
      };
      
      img.src = '/favicon.ico?' + Math.random(); // Cache bust
    };

    updateNetworkStatus();
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const interval = setInterval(updateNetworkStatus, 30000); // Check every 30s
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      clearInterval(interval);
    };
  }, []);

  // FPS monitoring for performance
  useEffect(() => {
    if (!isMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, renderFPS: fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMonitoring]);

  // API response time tracking
  const trackApiCall = useCallback(async <T>(
    apiCall: Promise<T>,
    callType: string = 'api'
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall;
      const responseTime = performance.now() - startTime;
      
      setMetrics(prev => ({ 
        ...prev, 
        apiResponseTime: responseTime,
        lastMoveTime: callType === 'move' ? responseTime : prev.lastMoveTime 
      }));
      
      // Log performance for debugging
      console.log(`[Performance] ${callType} took ${responseTime.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error(`[Performance] ${callType} failed after ${responseTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  // Touch latency measurement
  const measureTouchLatency = useCallback((target: string) => {
    const timestamp = performance.now();
    
    setTouchEvents(prev => {
      const newEvents = [...prev, { timestamp, type: 'start', target }];
      
      // Keep only recent events (last 10 seconds)
      const cutoff = timestamp - 10000;
      return newEvents.filter(event => event.timestamp > cutoff);
    });
    
    // Return a function to mark touch end
    return () => {
      const endTime = performance.now();
      const latency = endTime - timestamp;
      
      setMetrics(prev => ({ ...prev, touchLatency: latency }));
      setTouchEvents(prev => [...prev, { timestamp: endTime, type: 'end' as const, target }]);
      
      console.log(`[Performance] Touch latency for ${target}: ${latency.toFixed(2)}ms`);
    };
  }, []);

  // Start/stop monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    console.log('[Performance] Performance monitoring started');
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('[Performance] Performance monitoring stopped');
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return {
      ...metrics,
      touchEventCount: touchEvents.length,
      averageApiTime: metrics.apiResponseTime,
      status: {
        network: metrics.networkStatus,
        performance: metrics.renderFPS && metrics.renderFPS > 30 ? 'good' : 'poor',
        touch: metrics.touchLatency && metrics.touchLatency < 100 ? 'responsive' : 'slow'
      }
    };
  }, [metrics, touchEvents]);

  return {
    metrics,
    trackApiCall,
    measureTouchLatency,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    getPerformanceSummary,
  };
};