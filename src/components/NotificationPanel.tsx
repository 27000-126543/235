import React, { useEffect, useState } from 'react';
import { useHospitalStore } from '../store/useHospitalStore';
import { hospitalWS } from '../utils/webSocketService';

const NotificationPanel: React.FC = () => {
  const { notifications, clearNotification, wsConnected } = useHospitalStore();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(hospitalWS.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const statusText: Record<string, string> = {
    disconnected: '连接断开',
    connecting: '正在连接...',
    connected: 'WebSocket已连接'
  };

  const statusColor: Record<string, string> = {
    disconnected: 'bg-danger',
    connecting: 'bg-warning animate-pulse',
    connected: 'bg-success animate-pulse'
  };

  if (notifications.length === 0) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <div className="bg-panel border border-success/30 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400">{wsConnected ? 'WebSocket已连接' : '连接中...'}</span>
        </div>
        <div className="mt-2 bg-panel/50 border border-gray-700 rounded px-3 py-1.5 text-xs">
          <span className="text-gray-500">连接状态: </span>
          <span className={connectionStatus === 'connected' ? 'text-success' : connectionStatus === 'connecting' ? 'text-warning' : 'text-danger'}>
            {statusText[connectionStatus]}
          </span>
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
      <div className="bg-panel border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColor[connectionStatus]}`} />
        <span className="text-xs text-gray-400">{statusText[connectionStatus]}</span>
      </div>
      
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
