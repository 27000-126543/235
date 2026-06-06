import React from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const EmergencyPlanPanel: React.FC = () => {
  const {
    emergencyPlans,
    activeEmergencyPlan,
    activateEmergencyPlan,
    deactivateEmergencyPlan,
    beds,
    operationRooms
  } = useHospitalStore();

  const typeIcons: Record<string, string> = {
    fire: '🔥',
    infectious: '🦠',
    mass_casualty: '🚑',
    power_outage: '⚡',
    other: '⚠️',
  };

  const typeNames: Record<string, string> = {
    fire: '火灾预案',
    infectious: '传染病暴发',
    mass_casualty: '批量伤员救治',
    power_outage: '停电预案',
    other: '其他应急',
  };

  const availableBeds = beds.filter(b => !b.isOccupied).length;
  const availableRooms = operationRooms.filter(r => r.status === 'available').length;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-danger rounded" />
          应急预案 - 一键调度
        </h2>
        {activeEmergencyPlan && (
          <button
            onClick={deactivateEmergencyPlan}
            className="px-4 py-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors text-sm"
          >
            ✅ 解除预案
          </button>
        )}
      </div>

      {activeEmergencyPlan && (
        <div className="bg-danger/10 border-2 border-danger rounded-lg p-6 pulse-red">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-pulse">{typeIcons[activeEmergencyPlan.type]}</span>
              <div>
                <h3 className="text-2xl font-bold text-danger">{activeEmergencyPlan.name}</h3>
                <p className="text-gray-400">
                  启动时间: {activeEmergencyPlan.startTime ? new Date(activeEmergencyPlan.startTime).toLocaleString('zh-CN') : '-'}
                </p>
              </div>
            </div>
            <button
              onClick={deactivateEmergencyPlan}
              className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors font-medium"
            >
              解除预案
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-dark/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-info">{activeEmergencyPlan.involvedBeds.length}</div>
              <div className="text-gray-400 text-sm">预留床位</div>
            </div>
            <div className="bg-dark/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{activeEmergencyPlan.involvedRooms.length}</div>
              <div className="text-gray-400 text-sm">预留手术室</div>
            </div>
            <div className="bg-dark/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-warning">{activeEmergencyPlan.involvedStaff.length}</div>
              <div className="text-gray-400 text-sm">调度人员</div>
            </div>
          </div>

          <div className="bg-dark/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">3D调度路径已激活</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
                <span className="text-sm text-gray-400">手术室 → 急诊</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                <span className="text-sm text-gray-400">住院部 → 急诊</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-gray-400">门诊 → 急诊</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">可用空床位</div>
          <div className="text-2xl font-bold text-success mt-1">{availableBeds}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">可用手术室</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{availableRooms}</div>
        </div>
      </div>

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">应急预案列表</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyPlans.map(plan => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                plan.isActive
                  ? 'bg-danger/10 border-danger'
                  : 'bg-dark/30 border-gray-700 hover:border-danger/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{typeIcons[plan.type]}</span>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{plan.name}</h4>
                    <p className="text-gray-400 text-sm">{typeNames[plan.type]}</p>
                  </div>
                </div>
                {plan.isActive && (
                  <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded animate-pulse">
                    进行中
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-3">启动后将自动执行：</div>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 自动预留10张应急床位</li>
                  <li>• 调度所有可用手术室</li>
                  <li>• 通知所有相关医护人员</li>
                  <li>• 启动3D资源调度路径动画</li>
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                {!plan.isActive ? (
                  <button
                    onClick={() => activateEmergencyPlan(plan.id)}
                    disabled={activeEmergencyPlan !== null}
                    className="flex-1 py-2 bg-danger/20 text-danger rounded hover:bg-danger/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🚨</span>
                    一键启动预案
                  </button>
                ) : (
                  <button
                    onClick={deactivateEmergencyPlan}
                    className="flex-1 py-2 bg-success/20 text-success rounded hover:bg-success/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    解除预案
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">应急调度流程</h3>
        <div className="flex items-center justify-between">
          {[
            { name: '事件上报', icon: '📱' },
            { name: '预案启动', icon: '🚨' },
            { name: '资源调度', icon: '📋' },
            { name: '路径规划', icon: '🗺️' },
            { name: '现场处置', icon: '🏥' },
            { name: '事件结束', icon: '✅' },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                activeEmergencyPlan ? 'bg-danger/20 border-2 border-danger' : 'bg-dark/50 border-2 border-gray-600'
              }`}>
                {step.icon}
              </div>
              <span className="text-xs text-gray-400 mt-2 text-center">{step.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPlanPanel;
