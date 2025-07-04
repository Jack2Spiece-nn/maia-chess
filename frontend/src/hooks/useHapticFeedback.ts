import { useCallback } from 'react';
import { useDeviceType } from './useDeviceType';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Navigator.vibrate is already defined in TypeScript's DOM lib
// No need to redeclare it

export const useHapticFeedback = () => {
  const { isMobile, isTouch } = useDeviceType();

  const isHapticSupported = useCallback(() => {
    return isMobile && isTouch && 'vibrate' in navigator;
  }, [isMobile, isTouch]);

  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (!isHapticSupported()) {
      return;
    }

    try {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30],
        selection: [5]
      };

      const vibrationPattern = patterns[pattern] || patterns.light;
      
      if (navigator.vibrate) {
        navigator.vibrate(vibrationPattern);
      }
      
      console.log(`[Haptic] Triggered ${pattern} feedback`);
    } catch (error) {
      console.warn('[Haptic] Failed to trigger haptic feedback:', error);
    }
  }, [isHapticSupported]);

  // Specific haptic feedback functions for chess interactions
  const hapticFeedback = {
    // Touch and selection feedback
    pieceSelect: () => triggerHaptic('selection'),
    pieceMove: () => triggerHaptic('light'),
    pieceCapture: () => triggerHaptic('medium'),
    
    // Game state feedback
    check: () => triggerHaptic('warning'),
    checkmate: () => triggerHaptic('heavy'),
    gameStart: () => triggerHaptic('success'),
    gameEnd: () => triggerHaptic('success'),
    
    // UI feedback
    buttonPress: () => triggerHaptic('light'),
    menuOpen: () => triggerHaptic('selection'),
    error: () => triggerHaptic('error'),
    
    // Custom patterns
    custom: (pattern: HapticPattern) => triggerHaptic(pattern)
  };

  return {
    isSupported: isHapticSupported(),
    ...hapticFeedback,
    triggerHaptic
  };
};