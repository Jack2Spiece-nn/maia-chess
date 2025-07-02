import { useCallback, useState } from 'react';

interface SoundConfig {
  volume: number;
  enabled: boolean;
}

export const useChessSound = () => {
  const [config, setConfig] = useState<SoundConfig>({ volume: 0.5, enabled: true });

  const playSound = useCallback((soundType: string) => {
    if (!config.enabled) return;

    // Simple sound using Web Audio API or basic audio feedback
    try {
      // For now, we'll use a simple beep sound that works across browsers
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sound types
      let frequency = 440; // Default A note
      switch (soundType) {
        case 'move':
          frequency = 523; // C note
          break;
        case 'capture':
          frequency = 659; // E note
          break;
        case 'check':
          frequency = 784; // G note
          break;
        case 'checkmate':
          frequency = 1047; // High C note
          break;
        default:
          frequency = 440;
      }
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(config.volume * 0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Fallback: silent operation if audio isn't available
      console.log('Audio not available');
    }
  }, [config.enabled, config.volume]);

  const setVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  return {
    playSound,
    setVolume,
    toggleEnabled,
    volume: config.volume,
    enabled: config.enabled
  };
};