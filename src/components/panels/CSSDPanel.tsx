import React from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const CSSDPanel: React.FC = () => {
  const { instrumentPacks, addNotification } = useHospitalStore();

  const statusColors: Record<string, string> = {
    cleaning: 'bg-info',
    disinfecting: 'bg-warning',
    packaging: 'bg-purple-500',
    ready: 'bg-success',
    in_use: 'bg-danger',
  };

  const statusNames: Record<string, string> = {
    cleaning: '清洗中',
    disinfecting: '消毒中',
    packaging: '打包中',
    ready: '已就绪',
    in_use: '使用中',
  };

  const getTimeElapsed = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    return `${hours}小时${minutes % 60}分钟`;
  };

  const handleTrack = (packId: string) => {
    const pack = instrumentPacks.find(p => p.id === packId);
    if (pack) {
      addNotification(`已生成${pack.name}的追踪记录`);
    }
  };

  const overduePacks = instrumentPacks.filter(p => p.isOverdue);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-cyan-500 rounded" />
        消毒供应中心 - 器械包追踪
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusNames).map(([status, name]) => {
          const count = instrumentPacks.filter(p => p.status === status).length;
          return (
            <div key={status} className="bg-panel panel-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                <span className="text-gray-400 text-sm">{name}</span>
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          );
        })}
      </div>

      {overduePacks.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
          <h3 className="text-danger font-semibold mb-3 flex items-center gap-2">
            <span className="animate-pulse">⚠️</span>
            清洗超时告警 ({overduePacks.length}个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {overduePacks.map(pack => (
              <div key={pack.id} className="p-3 bg-danger/20 rounded-lg border border-danger/50 pulse-red">
                <div className="text-white font-medium">{pack.name}</div>
                <div className="text-gray-400 text-sm">{pack.type}</div>
                <div className="text-danger text-sm mt-1">
                  已超时: {getTimeElapsed(pack.lastCleanTime)}
                </div>
                <button
                  onClick={() => handleTrack(pack.id)}
                  className="mt-2 w-full py-1 bg-danger/30 text-danger text-xs rounded hover:bg-danger/40 transition-colors"
                >
                  生成追踪记录
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">器械包列表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 text-gray-400">器械包名称</th>
                <th className="text-left py-3 px-2 text-gray-400">类型</th>
                <th className="text-left py-3 px-2 text-gray-400">状态</th>
                <th className="text-left py-3 px-2 text-gray-400">上次清洗</th>
                <th className="text-left py-3 px-2 text-gray-400">清洗时长</th>
                <th className="text-left py-3 px-2 text-gray-400">状态</th>
                <th className="text-left py-3 px-2 text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {instrumentPacks.map(pack => (
                <tr key={pack.id} className={`border-b border-gray-800 ${pack.isOverdue ? 'bg-danger/5' : ''}`}>
                  <td className="py-3 px-2 text-white font-medium">{pack.name}</td>
                  <td className="py-3 px-2 text-gray-400">{pack.type}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusColors[pack.status]}/20`}>
                      <span className={`w-2 h-2 rounded-full ${statusColors[pack.status]}`} />
                      <span className="text-white">{statusNames[pack.status]}</span>
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400">{getTimeElapsed(pack.lastCleanTime)}前</td>
                  <td className="py-3 px-2 text-gray-400">{pack.cleaningDuration}分钟</td>
                  <td className="py-3 px-2">
                    {pack.isOverdue ? (
                      <span className="text-danger text-xs">⚠️ 超时</span>
                    ) : (
                      <span className="text-success text-xs">正常</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleTrack(pack.id)}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded hover:bg-cyan-500/30 transition-colors"
                    >
                      追踪
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">消毒流程可视化</h3>
        <div className="flex items-center justify-between">
          {[
            { name: '回收', icon: '📥' },
            { name: '分类', icon: '📋' },
            { name: '清洗', icon: '🧼' },
            { name: '消毒', icon: '🔥' },
            { name: '检查', icon: '🔍' },
            { name: '打包', icon: '📦' },
            { name: '灭菌', icon: '⚡' },
            { name: '储存', icon: '🏪' },
            { name: '发放', icon: '🚚' },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-dark/50 border-2 border-cyan-500/30 flex items-center justify-center text-2xl">
                {step.icon}
              </div>
              <span className="text-xs text-gray-400 mt-2">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => (
            <div key={idx} className="flex-1 h-0.5 mx-2 bg-cyan-500/30" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CSSDPanel;
