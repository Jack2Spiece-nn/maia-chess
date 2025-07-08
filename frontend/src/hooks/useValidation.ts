import { useCallback, useEffect } from 'react';

export interface ValidationMetrics {
  // Engine Quality
  engineTypeDistribution: Record<string, number>;
  averageSessionDurationByEngine: Record<string, number>;
  userSatisfactionRatings: Record<string, number>;
  
  // Performance
  pageLoadTimes: number[];
  apiResponseTimes: number[];
  bundleSizeImpact: Record<string, any>;
  mobilePerformanceScores: Record<string, number>;
}

// Extended performance interface for memory tracking
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
}

export const useValidation = () => {
  // Track user perception of AI quality
  const logAIBehaviorFeedback = useCallback((moveCount: number, aiLevel: number, userRating?: number) => {
    console.log(`[VALIDATION] AI_BEHAVIOR: MoveCount=${moveCount}, AILevel=${aiLevel}, UserRating=${userRating}`);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ai_behavior_validation', {
        move_count: moveCount,
        ai_level: aiLevel,
        user_rating: userRating
      });
    }
  }, []);
  
  // Track connection quality
  const logConnectionQuality = useCallback((responseTime: number, networkStatus: string) => {
    console.log(`[VALIDATION] CONNECTION_QUALITY: ResponseTime=${responseTime}ms, Status=${networkStatus}`);
  }, []);

  // Bundle loading performance
  const logBundlePerformance = useCallback(() => {
    if (typeof window !== 'undefined' && performance.getEntriesByType) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadComplete = navigation.loadEventEnd - navigation.fetchStart;
        const domComplete = navigation.domComplete - navigation.fetchStart;
        
        console.log(`[VALIDATION] BUNDLE_PERFORMANCE: LoadTime=${loadComplete}ms, DOMTime=${domComplete}ms`);
        
        // Track specific metrics
        const metrics = {
          bundle_load_time: loadComplete,
          dom_ready_time: domComplete,
          bundle_size: '360KB', // From build output
          deprecated_deps: ['rimraf', 'glob', 'eslint@8.57.1']
        };
        
        console.log('[VALIDATION] PERFORMANCE_METRICS:', metrics);
      } catch (error) {
        console.warn('[VALIDATION] Failed to collect bundle performance metrics:', error);
      }
    }
  }, []);

  // Mobile performance validation
  const logMobilePerformance = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const connection = (navigator as any).connection;
      if (connection) {
        console.log(`[VALIDATION] MOBILE_NETWORK: EffectiveType=${connection.effectiveType}, Downlink=${connection.downlink}`);
      }
      
      // Memory usage tracking
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory.memory) {
        const memory = performanceWithMemory.memory;
        console.log(`[VALIDATION] MEMORY_USAGE: Used=${memory.usedJSHeapSize}, Limit=${memory.jsHeapSizeLimit}`);
      }
      
      // Device characteristics
      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: screen.width,
        screenHeight: screen.height,
        devicePixelRatio: window.devicePixelRatio,
        touchSupport: 'ontouchstart' in window
      };
      
      console.log('[VALIDATION] DEVICE_INFO:', deviceInfo);
    } catch (error) {
      console.warn('[VALIDATION] Failed to collect mobile performance metrics:', error);
    }
  }, []);

  // Track game session quality
  const logGameSession = useCallback((sessionData: {
    duration: number;
    moveCount: number;
    aiLevel: number;
    completionReason: 'checkmate' | 'resigned' | 'draw' | 'abandoned';
    engineType?: string;
  }) => {
    console.log('[VALIDATION] GAME_SESSION:', sessionData);
    
    // Track session quality indicators
    const qualityScore = sessionData.moveCount > 10 ? 
      (sessionData.completionReason === 'checkmate' ? 100 : 
       sessionData.completionReason === 'draw' ? 80 : 60) : 40;
    
    console.log(`[VALIDATION] SESSION_QUALITY: Score=${qualityScore}, AILevel=${sessionData.aiLevel}, EngineType=${sessionData.engineType}`);
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Log initial bundle performance
    const timer = setTimeout(() => {
      logBundlePerformance();
      logMobilePerformance();
    }, 1000); // Wait for page to stabilize

    return () => clearTimeout(timer);
  }, [logBundlePerformance, logMobilePerformance]);

  return {
    logAIBehaviorFeedback,
    logConnectionQuality,
    logBundlePerformance,
    logMobilePerformance,
    logGameSession
  };
};