import React from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const OverviewPanel: React.FC = () => {
  const { departments, beds, emergencyPatients, medicines, operationRooms, instrumentPacks, wasteBins } = useHospitalStore();

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

  const recentAlerts = [
    { type: 'danger', text: '住院楼102床患者生命体征异常', time: '刚刚' },
    { type: 'warning', text: '头孢克肟片库存低于安全线', time: '5分钟前' },
    { type: 'warning', text: '急诊科2号垃圾桶已满85%', time: '10分钟前' },
    { type: 'info', text: '手术室1手术即将结束', time: '15分钟前' },
    { type: 'warning', text: '外科手术包A清洗超时', time: '20分钟前' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-info rounded" />
        医院运营总览
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-panel panel-border rounded-lg p-4">
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
          <h3 className="text-lg font-semibold text-white mb-4">实时告警</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === 'danger' ? 'bg-danger/10 border border-danger/30' :
                alert.type === 'warning' ? 'bg-warning/10 border border-warning/30' :
                'bg-info/10 border border-info/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  alert.type === 'danger' ? 'bg-danger' :
                  alert.type === 'warning' ? 'bg-warning' : 'bg-info'
                } animate-pulse`} />
                <span className="flex-1 text-white text-sm">{alert.text}</span>
                <span className="text-gray-500 text-xs">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">科室排队情况</h3>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{dept.name}</span>
                  <span className="text-info font-mono">{dept.queueCount} 人</span>
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
          <h3 className="text-lg font-semibold text-white mb-4">急诊分诊</h3>
          <div className="space-y-3">
            {['red', 'yellow', 'green'].map(level => {
              const count = emergencyPatients.filter(p => p.triageLevel === level).length;
              const labels: Record<string, string> = { red: '红区（危重）', yellow: '黄区（急症）', green: '绿区（非急症）' };
              const colors: Record<string, string> = { red: 'bg-danger', yellow: 'bg-warning', green: 'bg-success' };
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colors[level]}/20 flex items-center justify-center`}>
                    <span className={`font-bold ${colors[level].replace('bg-', 'text-')}`}>{count}</span>
                  </div>
                  <span className="text-white text-sm">{labels[level]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">床位护理等级</h3>
          <div className="space-y-3">
            {[
              { level: 'critical', label: '特级护理', color: 'bg-danger' },
              { level: 'primary', label: '一级护理', color: 'bg-warning' },
              { level: 'secondary', label: '二级护理', color: 'bg-info' },
              { level: 'normal', label: '三级护理', color: 'bg-success' },
            ].map(item => {
              const count = beds.filter(b => b.nursingLevel === item.level).length;
              return (
                <div key={item.level} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                    <span className={`font-bold ${item.color.replace('bg-', 'text-')}`}>{count}</span>
                  </div>
                  <span className="text-white text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
