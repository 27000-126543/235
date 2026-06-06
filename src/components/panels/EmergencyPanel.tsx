import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { EmergencyPatient } from '../../types';

const EmergencyPanel: React.FC = () => {
  const { emergencyPatients, addNotification } = useHospitalStore();
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);

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

  const statusNames: Record<string, string> = {
    waiting: '等待中',
    treating: '救治中',
    transferred: '已转科',
  };

  const generateDispatchPath = (patient: EmergencyPatient) => {
    addNotification(`已生成${patient.name}的急救资源调度路径: 急诊入口 → ${patient.assignedArea} → 相关科室`);
  };

  const areas = {
    red: emergencyPatients.filter(p => p.triageLevel === 'red'),
    yellow: emergencyPatients.filter(p => p.triageLevel === 'yellow'),
    green: emergencyPatients.filter(p => p.triageLevel === 'green'),
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-danger rounded" />
        急诊中心 - 智能分诊与调度
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {(['red', 'yellow', 'green'] as const).map(level => (
          <div key={level} className={`bg-panel panel-border rounded-lg p-4 border-t-4 ${triageColors[level]}`}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
              <span>{triageNames[level]}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${triageColors[level]}/20 text-white`}>
                {areas[level].length} 人
              </span>
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
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      patient.status === 'treating' ? 'bg-info/20 text-info' :
                      patient.status === 'waiting' ? 'bg-warning/20 text-warning' :
                      'bg-success/20 text-success'
                    }`}>
                      {statusNames[patient.status]}
                    </span>
                  </div>
                </div>
              ))}
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
                  <div className="text-white font-medium mt-1">{statusNames[selectedPatient.status]}</div>
                </div>
              </div>

              <button
                onClick={() => generateDispatchPath(selectedPatient)}
                className="w-full py-3 bg-gradient-to-r from-primary to-info text-white rounded-lg font-medium hover:from-primary/90 hover:to-info/90 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                生成急救资源调度路径
              </button>
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
    </div>
  );
};

export default EmergencyPanel;
