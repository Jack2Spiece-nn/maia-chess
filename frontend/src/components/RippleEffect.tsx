import React, { useState, useCallback, useRef } from 'react';
import { clsx } from 'clsx';

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color?: string;
  duration?: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  color?: string;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

const Ripple: React.FC<RippleProps> = ({ x, y, size, color = 'rgba(255, 255, 255, 0.3)', duration = 600 }) => {
  return (
    <span
      className="absolute rounded-full animate-ripple pointer-events-none"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        animationDuration: `${duration}ms`,
      }}
    />
  );
};

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  disabled = false,
  color = 'rgba(99, 102, 241, 0.4)',
  duration = 600,
  intensity = 'medium',
  onClick,
}) => {
  const [ripples, setRipples] = useState<Array<{ key: number; x: number; y: number; size: number }>>([]);
  const nextKey = useRef(0);

  const intensitySettings = {
    low: { multiplier: 1, maxRipples: 3 },
    medium: { multiplier: 1.5, maxRipples: 5 },
    high: { multiplier: 2, maxRipples: 8 },
  };

  const settings = intensitySettings[intensity];

  const addRipple = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * settings.multiplier;

    const newRipple = {
      key: nextKey.current++,
      x,
      y,
      size,
    };

    setRipples((prev) => {
      const updated = [...prev, newRipple];
      // Limit number of ripples
      if (updated.length > settings.maxRipples) {
        return updated.slice(-settings.maxRipples);
      }
      return updated;
    });

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.key !== newRipple.key));
    }, duration);
  }, [disabled, duration, settings]);

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      onMouseDown={addRipple}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      {ripples.map((ripple) => (
        <Ripple
          key={ripple.key}
          x={ripple.x}
          y={ripple.y}
          size={ripple.size}
          color={color}
          duration={duration}
        />
      ))}
    </div>
  );
};

export default RippleEffect;