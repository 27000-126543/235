import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { EmergencyPatient } from '../../types';

const EmergencyPanel: React.FC = () => {
  const {
    emergencyPatients,
    addNotification,
    addEmergencyPatient,
    updateEmergencyPatientStatus,
    removeEmergencyPatient
  } = useHospitalStore();
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    triageLevel: 'yellow' as EmergencyPatient['triageLevel'],
    condition: '',
    assignedArea: '',
    status: 'waiting' as EmergencyPatient['status']
  });

  const triageColors: Record<string, string> = {
    red: 'bg-danger',
    yellow: 'bg-warning',
    green: 'bg-success',
  };

  const triageNames: Record<string, string> = {
    red: '红区 - 危重',
    yellow: '黄区 - 急症',
    green: '绿区 - 非急症',
  };

  const generateDispatchPath = (patient: EmergencyPatient) => {
    addNotification(`已生成${patient.name}的急救资源调度路径: 急诊入口 → ${patient.assignedArea} → 相关科室`);
  };

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.condition) {
      const now = new Date();
      const arrivalTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const areaMap: Record<string, string> = { red: '红区', yellow: '黄区', green: '绿区' };
      addEmergencyPatient({
        ...newPatient,
        arrivalTime,
        assignedArea: newPatient.assignedArea || `${areaMap[newPatient.triageLevel]}-${Math.floor(Math.random() * 5) + 1}`
      });
      setShowAddModal(false);
      setNewPatient({
        name: '',
        age: 30,
        triageLevel: 'yellow',
        condition: '',
        assignedArea: '',
        status: 'waiting'
      });
    }
  };

  const handleStatusChange = (id: string, status: EmergencyPatient['status']) => {
    updateEmergencyPatientStatus(id, status);
    if (status === 'transferred') {
      setTimeout(() => {
        removeEmergencyPatient(id);
      }, 2000);
    }
  };

  const areas = {
    red: emergencyPatients.filter(p => p.triageLevel === 'red'),
    yellow: emergencyPatients.filter(p => p.triageLevel === 'yellow'),
    green: emergencyPatients.filter(p => p.triageLevel === 'green'),
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-danger rounded" />
          急诊中心 - 智能分诊与调度
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors text-sm"
        >
          + 新增患者
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(['red', 'yellow', 'green'] as const).map(level => (
          <div key={level} className={`bg-panel panel-border rounded-lg p-4 border-t-4 ${triageColors[level]}`}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
              <span>{triageNames[level]}</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${triageColors[level]}/20 text-white`}>
                  {areas[level].length} 人
                </span>
              </div>
            </h3>
            <div className="space-y-2">
              {areas[level].map(patient => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedPatient?.id === patient.id
                      ? 'bg-white/10 border border-white/30'
                      : 'bg-dark/30 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{patient.name}</span>
                    <span className="text-xs text-gray-400">{patient.age}岁</span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{patient.condition}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{patient.arrivalTime} 到达</span>
                    <select
                      value={patient.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(patient.id, e.target.value as EmergencyPatient['status'])}
                      className={`text-xs px-2 py-0.5 rounded border-0 cursor-pointer ${
                        patient.status === 'treating' ? 'bg-info/20 text-info' :
                        patient.status === 'waiting' ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}
                    >
                      <option value="waiting">等待中</option>
                      <option value="treating">救治中</option>
                      <option value="transferred">已转科</option>
                    </select>
                  </div>
                </div>
              ))}
              {areas[level].length === 0 && (
                <div className="text-gray-500 text-center py-4 text-sm">暂无患者</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">患者详情</h3>
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${triageColors[selectedPatient.triageLevel]}/20 flex items-center justify-center`}>
                  <span className="text-2xl">🚑</span>
                </div>
                <div>
                  <div className="text-xl text-white font-bold">{selectedPatient.name}</div>
                  <div className="text-gray-400">{selectedPatient.age}岁 | {triageNames[selectedPatient.triageLevel]}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-dark/50 rounded-lg">
                  <div className="text-gray-400 text-sm">诊断</div>
                  <div className="text-white font-medium mt-1">{selectedPatient.condition}</div>
                </div>
                <div className="p-3 bg-dark/50 rounded-lg">
                  <div className="text-gray-400 text-sm">分配区域</div>
                  <div className="text-white font-medium mt-1">{selectedPatient.assignedArea}</div>
                </div>
                <div className="p-3 bg-dark/50 rounded-lg">
                  <div className="text-gray-400 text-sm">到达时间</div>
                  <div className="text-white font-medium mt-1">{selectedPatient.arrivalTime}</div>
                </div>
                <div className="p-3 bg-dark/50 rounded-lg">
                  <div className="text-gray-400 text-sm">当前状态</div>
                  <select
                    value={selectedPatient.status}
                    onChange={(e) => handleStatusChange(selectedPatient.id, e.target.value as EmergencyPatient['status'])}
                    className="w-full mt-1 px-2 py-1 bg-dark/50 border border-gray-600 rounded text-white font-medium"
                  >
                    <option value="waiting">等待中</option>
                    <option value="treating">救治中</option>
                    <option value="transferred">已转科</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => generateDispatchPath(selectedPatient)}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-info text-white rounded-lg font-medium hover:from-primary/90 hover:to-info/90 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  生成调度路径
                </button>
                <button
                  onClick={() => removeEmergencyPatient(selectedPatient.id)}
                  className="px-4 py-3 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors"
                >
                  离院
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              点击左侧患者卡片查看详情
            </div>
          )}
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">急救调度路径示意</h3>
          <div className="relative h-64 bg-dark/50 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00ffff" />
                </marker>
              </defs>
              
              <circle cx="50" cy="128" r="20" fill="#1a2a4a" stroke="#0099ff" strokeWidth="2" />
              <text x="50" y="132" textAnchor="middle" fill="#fff" fontSize="10">入口</text>
              
              <circle cx="200" cy="60" r="25" fill="#1a2a4a" stroke="#ff3366" strokeWidth="2" />
              <text x="200" y="64" textAnchor="middle" fill="#fff" fontSize="10">红区</text>
              
              <circle cx="200" cy="128" r="25" fill="#1a2a4a" stroke="#ff9900" strokeWidth="2" />
              <text x="200" y="132" textAnchor="middle" fill="#fff" fontSize="10">黄区</text>
              
              <circle cx="200" cy="196" r="25" fill="#1a2a4a" stroke="#00cc66" strokeWidth="2" />
              <text x="200" y="200" textAnchor="middle" fill="#fff" fontSize="10">绿区</text>
              
              <circle cx="350" cy="128" r="20" fill="#1a2a4a" stroke="#9966ff" strokeWidth="2" />
              <text x="350" y="132" textAnchor="middle" fill="#fff" fontSize="10">检验科</text>
              
              <circle cx="450" cy="60" r="20" fill="#1a2a4a" stroke="#00cccc" strokeWidth="2" />
              <text x="450" y="64" textAnchor="middle" fill="#fff" fontSize="10">住院部</text>
              
              <circle cx="450" cy="196" r="20" fill="#1a2a4a" stroke="#ff6600" strokeWidth="2" />
              <text x="450" y="200" textAnchor="middle" fill="#fff" fontSize="10">手术室</text>
              
              {selectedPatient && (
                <>
                  <path
                    d="M70 128 Q 135 128 175 128"
                    stroke="#00ffff"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="path-animation"
                  />
                  {selectedPatient.triageLevel === 'red' && (
                    <>
                      <path d="M225 60 Q 287 94 330 128" stroke="#00ffff" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="path-animation" />
                      <path d="M370 110 Q 410 85 430 65" stroke="#ff6600" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="path-animation" />
                    </>
                  )}
                  {selectedPatient.triageLevel === 'yellow' && (
                    <path d="M225 128 Q 287 128 330 128" stroke="#00ffff" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="path-animation" />
                  )}
                </>
              )}
            </svg>
            
            {!selectedPatient && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                选择患者查看调度路径
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400">图例:</span>
            <span className="text-xs px-2 py-1 bg-danger/20 text-danger rounded">危重</span>
            <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded">急症</span>
            <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">非急症</span>
            <span className="text-xs px-2 py-1 bg-info/20 text-info rounded">调度路径</span>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel border border-info/30 rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">新增急诊患者</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">患者姓名</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入患者姓名"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">年龄</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">分诊等级</label>
                  <select
                    value={newPatient.triageLevel}
                    onChange={e => setNewPatient({ ...newPatient, triageLevel: e.target.value as EmergencyPatient['triageLevel'] })}
                    className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  >
                    <option value="red">红区（危重）</option>
                    <option value="yellow">黄区（急症）</option>
                    <option value="green">绿区（非急症）</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">病情描述</label>
                <input
                  type="text"
                  value={newPatient.condition}
                  onChange={e => setNewPatient({ ...newPatient, condition: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入病情描述"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">初始状态</label>
                <select
                  value={newPatient.status}
                  onChange={e => setNewPatient({ ...newPatient, status: e.target.value as EmergencyPatient['status'] })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                >
                  <option value="waiting">等待中</option>
                  <option value="treating">救治中</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddPatient}
                className="flex-1 py-2 px-4 bg-danger rounded-lg text-white hover:bg-danger/80 transition-colors"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPanel;
