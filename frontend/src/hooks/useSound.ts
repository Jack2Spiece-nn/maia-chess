import { useCallback, useRef, useEffect, useState } from 'react';

interface SoundConfig {
  volume: number;
  enabled: boolean;
}

interface ChessSounds {
  move: string;
  capture: string;
  check: string;
  checkmate: string;
  gameStart: string;
  gameEnd: string;
  buttonClick: string;
  notification: string;
}

const soundUrls: ChessSounds = {
  move: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAfX2O3KdCgEJ4HR8dmLOgkXV6vj66ZVFAx',
  capture: 'data:audio/wav;base64,UklGRuAGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YbwGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAw',
  check: 'data:audio/wav;base64,UklGRuoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcYGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAePs9b1vGMcBBl2xe/XgjMKL3zB8NmDOQkZVK7k7K1VEgxDn+LvwWckBzuI0fPQdyoGJoLM8NWHPQgVY7Xr7atXGQpNn+LvwWggCDaP1PLRdSgGJ4LM8NWHPQgVY7Xr7atXGQpNn+LvwWggCDaP1PLRdSgGJ4LM8NWHPQgVY7Xr7atXGQo',
  checkmate: 'data:audio/wav;base64,UklGRvQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAw1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAw=',
  gameStart: 'data:audio/wav;base64,UklGRngGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAwO',
  gameEnd: 'data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAw',
  buttonClick: 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAw',
  notification: 'data:audio/wav;base64,UklGRmwGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUgGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmglBkeKz/LLdCcHKobN8dWRQAkUXrPq66xWHAc1k9n1u2YdBSJ+y/LRfS0GLHzM8dyTRAwRYbbr7KpWHApOn+PxxGsgBzuM0/LNdSUELIDP8tmLOgkXV6vj66ZVFAwR'
};

export const useChessSound = () => {
  const audioRefs = useRef<{ [key in keyof ChessSounds]?: HTMLAudioElement }>({});
  const [config, setConfig] = useState<SoundConfig>({ volume: 0.5, enabled: true });

  useEffect(() => {
    // Preload all sounds
    Object.entries(soundUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = config.volume;
      audioRefs.current[key as keyof ChessSounds] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  useEffect(() => {
    // Update volume for all audio elements
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = config.volume;
      }
    });
  }, [config.volume]);

  const playSound = useCallback((soundType: keyof ChessSounds) => {
    if (!config.enabled) return;

    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore play errors (e.g., user hasn't interacted with page yet)
      });
    }
  }, [config.enabled]);

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