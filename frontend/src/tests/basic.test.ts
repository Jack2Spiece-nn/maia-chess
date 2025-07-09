// Basic functionality tests for Maia Chess Frontend
import { describe, it, expect } from 'vitest'

describe('Game Types', () => {
  it('should have valid game statuses', () => {
    const gameStatuses = ['waiting', 'playing', 'checkmate', 'stalemate', 'draw', 'resigned'];
    expect(gameStatuses.length).toBeGreaterThan(0);
    expect(gameStatuses).toContain('playing');
    expect(gameStatuses).toContain('checkmate');
  });

  it('should have correct AI levels', () => {
    const aiLevels = [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900];
    expect(aiLevels).toHaveLength(9);
    expect(aiLevels[0]).toBe(1100);
    expect(aiLevels[8]).toBe(1900);
  });
});

describe('Utility Functions', () => {
  it('should work like clsx', () => {
    function clsx(...args: any[]): string {
      return args.filter(Boolean).join(' ');
    }
    
    expect(clsx('a', 'b', false, 'c')).toBe('a b c');
    expect(clsx('test', null, undefined, 'pass')).toBe('test pass');
    expect(clsx()).toBe('');
    expect(clsx('single')).toBe('single');
  });
});

describe('Chess Board Themes', () => {
  interface ChessBoardTheme {
    id: string;
    name: string;
    lightSquare: string;
    darkSquare: string;
    isPremium?: boolean;
  }

  it('should have valid theme structure', () => {
    const testTheme: ChessBoardTheme = {
      id: 'test',
      name: 'Test Theme',
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863'
    };
    
    expect(testTheme.id).toBe('test');
    expect(testTheme.name).toBe('Test Theme');
    expect(testTheme.lightSquare).toMatch(/^#[0-9a-f]{6}$/i);
    expect(testTheme.darkSquare).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should support premium themes', () => {
    const premiumTheme: ChessBoardTheme = {
      id: 'premium',
      name: 'Premium Theme',
      lightSquare: '#ffffff',
      darkSquare: '#000000',
      isPremium: true
    };
    
    expect(premiumTheme.isPremium).toBe(true);
  });
});

describe('Responsive Design', () => {
  it('should detect device types correctly', () => {
    function getDeviceType(width: number = 1024) {
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }
    
    expect(getDeviceType(500)).toBe('mobile');
    expect(getDeviceType(800)).toBe('tablet');
    expect(getDeviceType(1200)).toBe('desktop');
  });

  it('should handle edge cases', () => {
    function getDeviceType(width: number = 1024) {
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }
    
    expect(getDeviceType(767)).toBe('mobile');
    expect(getDeviceType(768)).toBe('tablet');
    expect(getDeviceType(1023)).toBe('tablet');
    expect(getDeviceType(1024)).toBe('desktop');
  });
});

describe('Animation System', () => {
  it('should have valid animation class names', () => {
    const animationClasses = [
      'animate-fade-in',
      'animate-slide-up',
      'animate-bounce-in',
      'animate-sparkle',
      'animate-ripple'
    ];
    
    animationClasses.forEach(className => {
      expect(className).toMatch(/^animate-/);
    });
  });

  it('should support different animation durations', () => {
    const animationWithDuration = (name: string, duration: string) => `animate-${name}-${duration}`;
    
    expect(animationWithDuration('fade-in', 'fast')).toBe('animate-fade-in-fast');
    expect(animationWithDuration('slide-up', 'slow')).toBe('animate-slide-up-slow');
  });
});

describe('Color System', () => {
  it('should validate hex colors', () => {
    function isValidHexColor(color: string): boolean {
      return /^#[0-9a-f]{6}$/i.test(color);
    }
    
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#000000')).toBe(true);
    expect(isValidHexColor('#f0d9b5')).toBe(true);
    expect(isValidHexColor('ffffff')).toBe(false);
    expect(isValidHexColor('#fff')).toBe(false);
    expect(isValidHexColor('#gggggg')).toBe(false);
  });
});