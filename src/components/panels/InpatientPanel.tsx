import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { Bed } from '../../types';

const InpatientPanel: React.FC = () => {
  const { beds, addNotification } = useHospitalStore();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const floors = [...new Set(beds.map(b => b.floor))].sort();
  const floorBeds = beds.filter(b => b.floor === selectedFloor);

  const nursingLevelColors: Record<string, string> = {
    critical: 'bg-danger',
    primary: 'bg-warning',
    secondary: 'bg-info',
    normal: 'bg-success',
  };

  const nursingLevelNames: Record<string, string> = {
    critical: '特级护理',
    primary: '一级护理',
    secondary: '二级护理',
    normal: '三级护理',
  };

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    if (bed.isAbnormal) {
      addNotification(`护士站已收到告警: ${bed.roomNumber}室${bed.bedNumber}床生命体征异常`);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-success rounded" />
        住院楼 - 床位监控
      </h2>

      <div className="flex gap-2 mb-4">
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFloor === floor
                ? 'bg-success/20 text-success border border-success/50'
                : 'bg-dark/50 text-gray-400 border border-gray-700 hover:border-success/30'
            }`}
          >
            {floor}楼
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">{selectedFloor}楼 床位分布</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {floorBeds.map(bed => (
              <div
                key={bed.id}
                onClick={() => handleBedClick(bed)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                  bed.isAbnormal
                    ? 'bg-danger/30 border-danger pulse-red'
                    : bed.isOccupied
                    ? 'bg-success/20 border-success/50 hover:border-success'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-lg">🛏️</span>
                <span className={`text-xs ${bed.isOccupied ? 'text-white' : 'text-gray-500'}`}>
                  {bed.roomNumber}-{bed.bedNumber}
                </span>
                {bed.isOccupied && (
                  <div className={`w-2 h-2 rounded-full mt-1 ${nursingLevelColors[bed.nursingLevel]}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">床位详情</h3>
          {selectedBed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">床位号</span>
                <span className="text-white font-medium">{selectedBed.roomNumber}室 {selectedBed.bedNumber}床</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">使用状态</span>
                <span className={selectedBed.isOccupied ? 'text-success' : 'text-gray-400'}>
                  {selectedBed.isOccupied ? '已占用' : '空闲'}
                </span>
              </div>
              {selectedBed.isOccupied && selectedBed.patient && (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-info font-medium mb-3">患者信息</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">姓名</span>
                        <span className="text-white">{selectedBed.patient.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">年龄</span>
                        <span className="text-white">{selectedBed.patient.age}岁</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">性别</span>
                        <span className="text-white">{selectedBed.patient.gender === 'male' ? '男' : '女'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">诊断</span>
                        <span className="text-white">{selectedBed.patient.diagnosis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">入院日期</span>
                        <span className="text-white">{selectedBed.patient.admissionDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-info font-medium">护理等级</span>
                      <span className={`px-2 py-1 rounded text-xs ${nursingLevelColors[selectedBed.nursingLevel]}/20 text-white`}>
                        {nursingLevelNames[selectedBed.nursingLevel]}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className={`font-medium mb-3 ${selectedBed.isAbnormal ? 'text-danger' : 'text-info'}`}>
                      生命体征 {selectedBed.isAbnormal && '⚠️ 异常'}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">心率</span>
                        <span className={selectedBed.vitalSigns.heartRate > 100 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">血压</span>
                        <span className="text-white">{selectedBed.vitalSigns.bloodPressure} mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">体温</span>
                        <span className={selectedBed.vitalSigns.temperature > 38.5 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.temperature.toFixed(1)} °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">血氧饱和度</span>
                        <span className={selectedBed.vitalSigns.oxygenSaturation < 95 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.oxygenSaturation} %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">呼吸频率</span>
                        <span className="text-white">{selectedBed.vitalSigns.respiratoryRate} 次/分</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              点击左侧床位查看详情
            </div>
          )}
        </div>
      </div>

      <div className="bg-panel panel-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">异常床位告警</h3>
        {beds.filter(b => b.isAbnormal).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {beds.filter(b => b.isAbnormal).map(bed => (
              <div
                key={bed.id}
                className="p-3 bg-danger/10 border border-danger/30 rounded-lg pulse-red"
              >
                <div className="flex items-center gap-2 text-danger font-medium">
                  <span>⚠️</span>
                  <span>{bed.roomNumber}室 {bed.bedNumber}床</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {bed.patient?.name || '未知患者'}
                </div>
                <button
                  onClick={() => handleBedClick(bed)}
                  className="mt-2 w-full py-1 bg-danger/20 text-danger text-sm rounded hover:bg-danger/30 transition-colors"
                >
                  推送护士站
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            ✅ 当前无异常床位
          </div>
        )}
      </div>
    </div>
  );
};

export default InpatientPanel;
