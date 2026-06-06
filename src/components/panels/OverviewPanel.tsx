import React from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const OverviewPanel: React.FC = () => {
  const {
    departments,
    beds,
    emergencyPatients,
    medicines,
    operationRooms,
    instrumentPacks,
    wasteBins,
    wsConnected,
    updateQueueCount
  } = useHospitalStore();

  const stats = [
    { label: '今日门诊量', value: departments.reduce((sum, d) => sum + d.queueCount + d.doctors.reduce((s, doc) => s + doc.todayPatients, 0), 0), color: 'text-info', icon: '👥' },
    { label: '在院患者', value: beds.filter(b => b.isOccupied).length, color: 'text-success', icon: '🛏️' },
    { label: '急诊患者', value: emergencyPatients.length, color: 'text-danger', icon: '🚑' },
    { label: '进行中手术', value: operationRooms.filter(r => r.status === 'occupied').length, color: 'text-purple-400', icon: '🏥' },
    { label: '床位使用率', value: `${((beds.filter(b => b.isOccupied).length / beds.length) * 100).toFixed(1)}%`, color: 'text-warning', icon: '📊' },
    { label: '待清运垃圾桶', value: wasteBins.filter(w => w.needsPickup).length, color: 'text-orange-400', icon: '🗑️' },
    { label: '低库存药品', value: medicines.filter(m => m.isLowStock).length, color: 'text-red-400', icon: '💊' },
    { label: '超时器械包', value: instrumentPacks.filter(p => p.isOverdue).length, color: 'text-yellow-400', icon: '🧰' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-info rounded" />
          医院运营总览
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400">{wsConnected ? 'WebSocket 已连接' : 'WebSocket 未连接'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-panel panel-border rounded-lg p-4 hover:border-info/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>科室排队情况</span>
            <span className="text-xs text-gray-500">点击 +/- 调整人数</span>
          </h3>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQueueCount(dept.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-white text-xs hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span className="text-info font-mono w-12 text-center">{dept.queueCount} 人</span>
                    <button
                      onClick={() => updateQueueCount(dept.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-white text-xs hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-full bg-dark/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-info to-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (dept.queueCount / 50) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>开放窗口: {dept.openWindows}/{dept.maxWindows}</span>
                  <span>值班医生: {dept.doctors.filter(d => d.isOnDuty).length}人</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">快速统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-dark/30 rounded-lg">
              <div className="text-gray-400 text-xs">手术室状态</div>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-success/20 text-success text-xs rounded">
                  {operationRooms.filter(r => r.status === 'available').length} 空闲
                </span>
                <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded">
                  {operationRooms.filter(r => r.status === 'occupied').length} 使用
                </span>
              </div>
            </div>
            <div className="p-3 bg-dark/30 rounded-lg">
              <div className="text-gray-400 text-xs">急诊分诊</div>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded">
                  {emergencyPatients.filter(p => p.triageLevel === 'red').length} 危重
                </span>
                <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded">
                  {emergencyPatients.filter(p => p.triageLevel === 'yellow').length} 急症
                </span>
              </div>
            </div>
            <div className="p-3 bg-dark/30 rounded-lg">
              <div className="text-gray-400 text-xs">床位护理等级</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded">
                  {beds.filter(b => b.nursingLevel === 'critical').length} 特级
                </span>
                <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded">
                  {beds.filter(b => b.nursingLevel === 'primary').length} 一级
                </span>
                <span className="px-2 py-1 bg-info/20 text-info text-xs rounded">
                  {beds.filter(b => b.nursingLevel === 'secondary').length} 二级
                </span>
              </div>
            </div>
            <div className="p-3 bg-dark/30 rounded-lg">
              <div className="text-gray-400 text-xs">异常床位</div>
              <div className="mt-2">
                <span className={`px-3 py-1 text-xs rounded ${
                  beds.filter(b => b.isAbnormal).length > 0
                    ? 'bg-danger/20 text-danger pulse-red'
                    : 'bg-success/20 text-success'
                }`}>
                  {beds.filter(b => b.isAbnormal).length > 0
                    ? `⚠️ ${beds.filter(b => b.isAbnormal).length} 床异常`
                    : '✅ 全部正常'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">手术室状态</h3>
          <div className="space-y-2">
            {operationRooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-2 rounded bg-dark/30">
                <span className="text-white text-sm">{room.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  room.status === 'available' ? 'bg-success/20 text-success' :
                  room.status === 'occupied' ? 'bg-danger/20 text-danger' :
                  room.status === 'cleaning' ? 'bg-warning/20 text-warning' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {room.status === 'available' ? '空闲' :
                   room.status === 'occupied' ? '使用中' :
                   room.status === 'cleaning' ? '清洁中' : '维护中'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">药品库存预警</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {medicines.filter(m => m.isLowStock).slice(0, 5).map(medicine => (
              <div key={medicine.id} className="flex items-center justify-between p-2 rounded bg-danger/10 border border-danger/30">
                <span className="text-white text-sm">{medicine.name}</span>
                <span className="text-danger text-xs font-mono">{medicine.stock}/{medicine.safetyStock}</span>
              </div>
            ))}
            {medicines.filter(m => m.isLowStock).length === 0 && (
              <div className="text-gray-500 text-center py-4 text-sm">✅ 无低库存药品</div>
            )}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">系统状态</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-dark/30 rounded">
              <span className="text-gray-400 text-sm">WebSocket</span>
              <span className={`text-xs ${wsConnected ? 'text-success' : 'text-gray-500'}`}>
                {wsConnected ? '● 已连接' : '○ 未连接'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-dark/30 rounded">
              <span className="text-gray-400 text-sm">数据存储</span>
              <span className="text-xs text-info">● IndexedDB</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-dark/30 rounded">
              <span className="text-gray-400 text-sm">生命体征模拟</span>
              <span className="text-xs text-success">● 运行中</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-dark/30 rounded">
              <span className="text-gray-400 text-sm">3D场景</span>
              <span className="text-xs text-success">● 已加载</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
