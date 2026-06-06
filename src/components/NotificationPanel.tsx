import React, { useEffect } from 'react';
import { useHospitalStore } from '../store/useHospitalStore';

const NotificationPanel: React.FC = () => {
  const { notifications, clearNotification } = useHospitalStore();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotification(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, clearNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((msg, idx) => (
        <div
          key={idx}
          className="bg-panel border border-info/50 rounded-lg p-4 shadow-xl animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{msg}</p>
            </div>
            <button
              onClick={() => clearNotification(idx)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
