import { WebSocketServer } from 'ws';

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

const mockBeds = [
  { id: 'bed1', roomNumber: '101', bedNumber: '1', patientName: '张三' },
  { id: 'bed2', roomNumber: '101', bedNumber: '2', patientName: '李四' },
  { id: 'bed5', roomNumber: '103', bedNumber: '1', patientName: '王五' },
  { id: 'bed8', roomNumber: '104', bedNumber: '2', patientName: '赵六' },
  { id: 'bed12', roomNumber: '201', bedNumber: '2', patientName: '陈七' },
  { id: 'bed15', roomNumber: '202', bedNumber: '1', patientName: '刘八' },
  { id: 'bed20', roomNumber: '205', bedNumber: '2', patientName: '周九' },
  { id: 'bed25', roomNumber: '301', bedNumber: '1', patientName: '吴十' },
];

const vitalSigns = [
  { name: '心率', values: ['45次/分', '130次/分', '150次/分'] },
  { name: '血压', values: ['180/110mmHg', '85/50mmHg', '190/120mmHg'] },
  { name: '血氧', values: ['88%', '85%', '82%'] },
  { name: '体温', values: ['39.5°C', '35.2°C', '40.1°C'] },
];

console.log(`🏥 医院WebSocket服务器启动中...`);
console.log(`📡 监听端口: ${PORT}`);
console.log(`🔗 WebSocket地址: ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log(`✅ 新客户端连接 - 当前连接数: ${wss.clients.size}`);

  const welcomeMsg = {
    type: 'connection_ack',
    payload: { 
      message: '已连接到医院实时数据推送服务',
      serverTime: new Date().toISOString(),
      clientCount: wss.clients.size
    },
    timestamp: new Date().toISOString()
  };
  ws.send(JSON.stringify(welcomeMsg));

  const systemStatusInterval = setInterval(() => {
    if (ws.readyState === 1) {
      const statusMsg = {
        type: 'system_status',
        payload: {
          serverTime: new Date().toISOString(),
          connectedClients: wss.clients.size,
          systemLoad: (Math.random() * 30 + 10).toFixed(1) + '%'
        },
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(statusMsg));
    }
  }, 15000);

  const abnormalInterval = setInterval(() => {
    if (ws.readyState === 1 && Math.random() > 0.6) {
      const randomBed = mockBeds[Math.floor(Math.random() * mockBeds.length)];
      const randomVital = vitalSigns[Math.floor(Math.random() * vitalSigns.length)];
      const randomValue = randomVital.values[Math.floor(Math.random() * randomVital.values.length)];
      
      const event = {
        bedId: randomBed.id,
        bedNumber: `${randomBed.roomNumber}室${randomBed.bedNumber}床`,
        patientName: randomBed.patientName,
        vitalSign: randomVital.name,
        value: randomValue,
        severity: Math.random() > 0.5 ? 'danger' : 'warning',
        timestamp: new Date().toISOString()
      };

      const alertMsg = {
        type: 'bed_abnormal',
        payload: event,
        timestamp: event.timestamp
      };
      
      ws.send(JSON.stringify(alertMsg));
      console.log(`🚨 推送异常告警: ${event.bedNumber} - ${event.patientName} ${event.vitalSign}: ${event.value}`);
    }
  }, 10000);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 收到客户端消息:`, message.type || message);
      
      if (message.type === 'manual_alert') {
        const alertMsg = {
          type: 'bed_abnormal',
          payload: message.payload,
          timestamp: new Date().toISOString()
        };
        
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(alertMsg));
          }
        });
        console.log(`📢 广播手动告警:`, message.payload);
      }
      
    } catch (err) {
      console.log(`📨 收到原始消息:`, data.toString());
    }
  });

  ws.on('close', () => {
    console.log(`❌ 客户端断开 - 当前连接数: ${wss.clients.size}`);
    clearInterval(systemStatusInterval);
    clearInterval(abnormalInterval);
  });

  ws.on('error', (err) => {
    console.error(`❌ WebSocket错误:`, err);
  });
});

wss.on('error', (err) => {
  console.error(`❌ 服务器错误:`, err);
});

console.log(`✅ 服务器启动完成!`);
console.log(`💡 提示: 请确保前端连接地址为 ws://localhost:${PORT}`);
