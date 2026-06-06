import React from 'react';
import { useHospitalStore } from '../store/useHospitalStore';

const NotificationPanel: React.FC = () => {
  const { notifications, clearNotification, wsConnected } = useHospitalStore();

  if (notifications.length === 0) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <div className="bg-panel border border-success/30 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400">{wsConnected ? 'WebSocket已连接' : '连接中...'}</span>
        </div>
      </div>
    );
  }

  const typeStyles: Record<string, string> = {
    info: 'border-info bg-info/10',
    warning: 'border-warning bg-warning/10',
    danger: 'border-danger bg-danger/10',
    success: 'border-success bg-success/10',
  };

  const typeIcons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🚨',
    success: '✅',
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`border rounded-lg p-3 shadow-xl ${typeStyles[notif.type] || typeStyles.info}`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{typeIcons[notif.type] || 'ℹ️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">{notif.message}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(notif.timestamp).toLocaleTimeString('zh-CN')}
              </p>
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
