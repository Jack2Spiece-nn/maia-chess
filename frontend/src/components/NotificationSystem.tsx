import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
  position: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose, position }) => {
  const { isMobile } = useDeviceType();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleClose = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  }, [notification.id, onClose]);

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={clsx(iconClass, "text-green-400")} />;
      case 'error':
        return <AlertCircle className={clsx(iconClass, "text-red-400")} />;
      case 'warning':
        return <AlertTriangle className={clsx(iconClass, "text-yellow-400")} />;
      case 'info':
        return <Info className={clsx(iconClass, "text-blue-400")} />;
      default:
        return <Info className={clsx(iconClass, "text-blue-400")} />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/10',
          accent: 'border-l-green-500'
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          accent: 'border-l-red-500'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          accent: 'border-l-yellow-500'
        };
      case 'info':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          accent: 'border-l-blue-500'
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          accent: 'border-l-blue-500'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      className={clsx(
        "relative group max-w-sm w-full",
        "glass-morphism-strong rounded-2xl shadow-2xl",
        "border border-white/20 backdrop-blur-xl",
        colors.border,
        colors.bg,
        "p-4 transform transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-glow",
        isVisible && !isRemoving && "translate-x-0 opacity-100",
        !isVisible && "translate-x-full opacity-0",
        isRemoving && "translate-x-full opacity-0 scale-95",
        isMobile ? "mx-2" : "mr-4"
      )}
      style={{
        transform: `translateY(${position * 80}px) ${isVisible && !isRemoving ? 'translateX(0)' : 'translateX(100%)'}`,
      }}
    >
      {/* Accent border */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", colors.accent)} />
      
      {/* Content */}
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white truncate">
              {notification.title}
            </h4>
            <button
              onClick={handleClose}
              className={clsx(
                "ml-2 p-1 rounded-full transition-all duration-200",
                "hover:bg-white/10 hover:scale-110",
                "text-white/60 hover:text-white/90"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {notification.message && (
            <p className="mt-1 text-xs text-white/80 leading-relaxed">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={clsx(
                "mt-2 px-3 py-1 text-xs font-medium rounded-lg",
                "transition-all duration-200 transform hover:scale-105",
                "bg-white/10 hover:bg-white/20 text-white",
                "border border-white/20 hover:border-white/30"
              )}
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {!notification.persistent && notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/30 rounded-b-2xl origin-left animate-progress"
            style={{ animationDuration: `${notification.duration}ms` }}
          />
        </div>
      )}

      {/* Sparkle effect for success notifications */}
      {notification.type === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-sparkle"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onClose,
  position = 'top-right'
}) => {
  const { isMobile } = useDeviceType();

  const getPositionClasses = () => {
    if (isMobile) {
      return 'top-4 left-0 right-0';
    }
    
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) return null;

  return createPortal(
    <div className={clsx("fixed z-50 pointer-events-none", getPositionClasses())}>
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onClose={onClose}
              position={index}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

// Hook for using the notification system
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

export default NotificationSystem;