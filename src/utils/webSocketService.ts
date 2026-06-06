export interface BedAbnormalEvent {
  bedId: string;
  bedNumber: string;
  patientName: string;
  vitalSign: string;
  value: string;
  severity: 'warning' | 'danger';
  timestamp: string;
}

export type WebSocketMessageType = 
  | 'bed_abnormal'
  | 'vital_signs_update'
  | 'emergency_alert'
  | 'system_status'
  | 'connection_ack';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class HospitalWebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private readonly LOCAL_WS_URL = 'ws://localhost:8080';

  constructor() {}

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.connectionStatus === 'connected') {
        resolve(true);
        return;
      }

      this.connectionStatus = 'connecting';
      this.tryConnect(resolve);
    });
  }

  private tryConnect(resolve: (value: boolean) => void) {
    try {
      console.log(`[WS] 正在连接到本地服务器: ${this.LOCAL_WS_URL}`);
      console.log(`[WS] 提示: 请先运行 'npm run ws-server' 启动WebSocket服务器`);
      
      this.ws = new WebSocket(this.LOCAL_WS_URL);

      this.ws.onopen = () => {
        console.log(`[WS] ✅ 已成功连接到本地WebSocket服务器`);
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.broadcastMessage(message);
        } catch (err) {
          console.error('[WS] 消息解析失败:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.warn(`[WS] ⚠️ 连接错误 (尝试 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        console.warn(`[WS] 💡 请确认已运行: npm run ws-server`);
      };

      this.ws.onclose = () => {
        console.log(`[WS] 连接已关闭`);
        this.stopHeartbeat();
        
        if (this.connectionStatus === 'connected') {
          this.connectionStatus = 'disconnected';
          this.scheduleReconnect();
        } else {
          this.reconnectAttempts++;
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 5000);
            setTimeout(() => {
              this.tryConnect(resolve);
            }, delay);
          } else {
            console.error(`[WS] ❌ 无法连接到本地服务器`);
            console.error(`[WS] 💡 请在另一个终端运行: npm run ws-server`);
            this.connectionStatus = 'disconnected';
            resolve(false);
          }
        }
      };
    } catch (err) {
      console.error('[WS] 创建连接失败:', err);
      this.connectionStatus = 'disconnected';
      resolve(false);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] 已达到最大重连次数');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[WS] ${delay}ms 后尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.tryConnect(() => {});
    }, delay);
  }

  sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendManualAlert(event: BedAbnormalEvent) {
    const message: WebSocketMessage = {
      type: 'manual_alert',
      payload: event,
      timestamp: event.timestamp
    };
    this.sendMessage(message);
  }

  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  private broadcastMessage(message: WebSocketMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (err) {
        console.error('[WS] 处理器错误:', err);
      }
    });
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionStatus = 'disconnected';
    console.log('[WS] 已断开连接');
  }

  getStatus(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionStatus;
  }
}

export const hospitalWS = new HospitalWebSocketService();
