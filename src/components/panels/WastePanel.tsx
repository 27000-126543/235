import React from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';

const WastePanel: React.FC = () => {
  const { wasteBins, pickupWaste, addNotification } = useHospitalStore();

  const typeColors: Record<string, string> = {
    infectious: 'bg-yellow-500',
    pathological: 'bg-red-500',
    chemical: 'bg-orange-500',
    ordinary: 'bg-gray-500',
  };

  const typeNames: Record<string, string> = {
    infectious: '感染性废物',
    pathological: '病理性废物',
    chemical: '化学性废物',
    ordinary: '生活垃圾',
  };

  const handlePickup = (binId: string) => {
    pickupWaste(binId);
  };

  const handleNotifyAll = () => {
    const binsToPickup = wasteBins.filter(w => w.needsPickup);
    binsToPickup.forEach(bin => pickupWaste(bin.id));
    addNotification(`已通知转运 ${binsToPickup.length} 个垃圾桶`);
  };

  const binsToPickup = wasteBins.filter(w => w.needsPickup);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-amber-700 rounded" />
        医疗废物处理站 - 智能监控
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">垃圾桶总数</div>
          <div className="text-2xl font-bold text-white mt-1">{wasteBins.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">待清运</div>
          <div className="text-2xl font-bold text-danger mt-1">{binsToPickup.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">平均填充率</div>
          <div className="text-2xl font-bold text-warning mt-1">
            {Math.round(wasteBins.reduce((sum, w) => sum + w.fillLevel, 0) / wasteBins.length)}%
          </div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">批量操作</div>
            </div>
            <button
              onClick={handleNotifyAll}
              disabled={binsToPickup.length === 0}
              className="px-3 py-2 bg-amber-700/20 text-amber-600 rounded hover:bg-amber-700/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              一键通知转运
            </button>
          </div>
        </div>
      </div>

      {binsToPickup.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
          <h3 className="text-danger font-semibold mb-3 flex items-center gap-2">
            <span className="animate-pulse">⚠️</span>
            需要立即清运的垃圾桶 ({binsToPickup.length}个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {binsToPickup.map(bin => (
              <div key={bin.id} className="p-3 bg-danger/20 rounded-lg border border-danger/50 pulse-red">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${typeColors[bin.type]}`} />
                  <span className="text-white font-medium">{bin.location}</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">{typeNames[bin.type]}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-dark/50 rounded-full h-2">
                      <div
                        className="bg-danger h-2 rounded-full"
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                    <div className="text-danger text-xs mt-1">{bin.fillLevel}% 已满</div>
                  </div>
                  <button
                    onClick={() => handlePickup(bin.id)}
                    className="px-3 py-1 bg-danger text-white text-xs rounded hover:bg-danger/80 transition-colors"
                  >
                    清运
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">垃圾桶状态监控</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {wasteBins.map(bin => (
            <div
              key={bin.id}
              className={`p-4 rounded-lg border transition-all ${
                bin.needsPickup
                  ? 'bg-danger/10 border-danger/50'
                  : bin.fillLevel > 60
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-dark/30 border-gray-700'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-20 mb-3">
                  <div className="absolute bottom-0 w-full h-full bg-gray-800 rounded-t-lg border-2 border-gray-600">
                    <div
                      className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${typeColors[bin.type]}`}
                      style={{ height: `${bin.fillLevel}%`, opacity: 0.8 }}
                    />
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-700 rounded-t-full" />
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-medium truncate w-full">{bin.location}</div>
                  <div className="text-gray-400 text-xs">{typeNames[bin.type]}</div>
                  <div className={`text-lg font-bold mt-1 ${
                    bin.fillLevel >= 80 ? 'text-danger' :
                    bin.fillLevel >= 60 ? 'text-warning' : 'text-success'
                  }`}>
                    {bin.fillLevel}%
                  </div>
                </div>
                {bin.needsPickup && (
                  <button
                    onClick={() => handlePickup(bin.id)}
                    className="mt-2 w-full py-1 bg-danger/30 text-danger text-xs rounded hover:bg-danger/40 transition-colors"
                  >
                    通知清运
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">废物分类说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typeNames).map(([type, name]) => (
            <div key={type} className="p-3 bg-dark/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${typeColors[type]}`} />
                <span className="text-white font-medium">{name}</span>
              </div>
              <p className="text-gray-400 text-xs">
                {type === 'infectious' && '携带病原微生物具有感染性疾病传播危险'}
                {type === 'pathological' && '诊疗过程中产生的人体废弃物和医学实验动物尸体'}
                {type === 'chemical' && '具有毒性、腐蚀性、易燃易爆性的废弃化学物品'}
                {type === 'ordinary' && '日常生活和医疗服务活动中产生的生活垃圾'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WastePanel;
