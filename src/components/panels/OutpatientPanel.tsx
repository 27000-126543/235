import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const OutpatientPanel: React.FC = () => {
  const { departments, updateWindowCount, addNotification } = useHospitalStore();
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id);

  const currentDept = departments.find(d => d.id === selectedDept);

  const handleAutoAdjust = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;
    
    const predictedQueue = dept.queueCount * 1.2;
    const optimalWindows = Math.ceil(predictedQueue / 15);
    const delta = optimalWindows - dept.openWindows;
    
    if (delta !== 0) {
      updateWindowCount(deptId, delta);
      addNotification(`根据历史预测，${dept.name}已自动调整开放窗口至${optimalWindows}个`);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-info rounded" />
        门诊大厅 - 实时监控
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map(dept => (
          <div
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`bg-panel panel-border rounded-lg p-4 cursor-pointer transition-all ${
              selectedDept === dept.id ? 'ring-2 ring-info' : 'hover:border-info/50'
            }`}
          >
            <div className="text-lg font-semibold text-white mb-2">{dept.name}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-info">{dept.queueCount}</span>
              <span className="text-gray-400 text-sm">人排队</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">窗口: {dept.openWindows}/{dept.maxWindows}</span>
              <span className="text-success">{dept.doctors.filter(d => d.isOnDuty).length}人值班</span>
            </div>
          </div>
        ))}
      </div>

      {currentDept && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-panel panel-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{currentDept.name} - 窗口管理</h3>
              <button
                onClick={() => handleAutoAdjust(currentDept.id)}
                className="px-3 py-1 bg-info/20 text-info text-sm rounded hover:bg-info/30 transition-colors"
              >
                智能调整窗口
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {Array.from({ length: currentDept.maxWindows }, (_, i) => {
                const isOpen = i < currentDept.openWindows;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                      isOpen
                        ? 'bg-success/20 border-2 border-success animate-pulse'
                        : 'bg-gray-800/50 border border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{isOpen ? '🟢' : '🔴'}</span>
                    <span className={`text-xs mt-1 ${isOpen ? 'text-success' : 'text-gray-500'}`}>
                      窗口{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateWindowCount(currentDept.id, -1)}
                disabled={currentDept.openWindows <= 1}
                className="flex-1 py-2 bg-danger/20 text-danger rounded hover:bg-danger/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                关闭窗口
              </button>
              <button
                onClick={() => updateWindowCount(currentDept.id, 1)}
                disabled={currentDept.openWindows >= currentDept.maxWindows}
                className="flex-1 py-2 bg-success/20 text-success rounded hover:bg-success/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                开启窗口
              </button>
            </div>

            <div className="mt-4 p-3 bg-dark/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">预测分析</div>
              <div className="text-white">
                当前排队: {currentDept.queueCount}人 | 
                预计等待: {Math.ceil(currentDept.queueCount / currentDept.openWindows * 5)}分钟
              </div>
            </div>
          </div>

          <div className="bg-panel panel-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{currentDept.name} - 医生排班</h3>
            <div className="space-y-3">
              {currentDept.doctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`p-3 rounded-lg border ${
                    doctor.isOnDuty
                      ? 'bg-success/10 border-success/30'
                      : 'bg-gray-800/30 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        doctor.isOnDuty ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{doctor.name}</div>
                        <div className="text-gray-400 text-sm">{doctor.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${doctor.isOnDuty ? 'text-success' : 'text-gray-500'}`}>
                        {doctor.isOnDuty ? '值班中' : '已下班'}
                      </div>
                      <div className="text-gray-400 text-xs">今日接诊: {doctor.todayPatients}人</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">3D窗口动画模拟</h3>
        <div className="flex items-end justify-center gap-4 h-40">
          {departments.map((dept, deptIdx) => (
            <div key={dept.id} className="flex flex-col items-center">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: dept.maxWindows }, (_, i) => {
                  const isOpen = i < dept.openWindows;
                  return (
                    <div
                      key={i}
                      className={`w-6 h-10 rounded-t transition-all duration-500 ${
                        isOpen
                          ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                          : 'bg-gray-700'
                      }`}
                      style={{
                        transform: isOpen ? 'scaleY(1)' : 'scaleY(0.3)',
                        transformOrigin: 'bottom',
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-gray-400">{dept.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutpatientPanel;
