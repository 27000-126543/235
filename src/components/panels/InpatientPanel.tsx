import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { Bed } from '../../types';

const InpatientPanel: React.FC = () => {
  const { beds, addNotification, updateBedVitalSigns, setBedAbnormal, dischargePatient, admitPatient } = useHospitalStore();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    gender: 'male' as 'male' | 'female',
    diagnosis: '',
    nursingLevel: 'normal' as Bed['nursingLevel']
  });

  const floors = [...new Set(beds.map(b => b.floor))].sort();
  const floorBeds = beds.filter(b => b.floor === selectedFloor);

  const nursingLevelColors: Record<string, string> = {
    critical: 'bg-danger',
    primary: 'bg-warning',
    secondary: 'bg-info',
    normal: 'bg-success',
  };

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
  };

  const handleUpdateVitals = (bedId: string) => {
    updateBedVitalSigns(bedId);
    const updatedBed = beds.find(b => b.id === bedId);
    if (updatedBed?.isAbnormal) {
      addNotification(`⚠️ ${updatedBed.roomNumber}室${updatedBed.bedNumber}床生命体征异常，已推送护士站`, 'danger');
    }
  };

  const handleToggleAbnormal = (bedId: string, current: boolean) => {
    setBedAbnormal(bedId, !current);
    const bed = beds.find(b => b.id === bedId);
    addNotification(
      !current
        ? `⚠️ 手动标记异常: ${bed?.roomNumber}室${bed?.bedNumber}床`
        : `✅ 异常已解除: ${bed?.roomNumber}室${bed?.bedNumber}床`,
      !current ? 'danger' : 'success'
    );
  };

  const handleDischarge = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId);
    dischargePatient(bedId);
    addNotification(`患者已出院: ${bed?.roomNumber}室${bed?.bedNumber}床`, 'success');
    if (selectedBed?.id === bedId) {
      setSelectedBed(null);
    }
  };

  const handleAdmit = () => {
    if (selectedBed && newPatient.name) {
      admitPatient(selectedBed.id, newPatient);
      setShowAdmitModal(false);
      setNewPatient({ name: '', age: 30, gender: 'male', diagnosis: '', nursingLevel: 'normal' });
      const updated = beds.find(b => b.id === selectedBed.id);
      setSelectedBed(updated || null);
    }
  };

  const occupiedCount = beds.filter(b => b.isOccupied).length;
  const abnormalCount = beds.filter(b => b.isAbnormal).length;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-success rounded" />
        住院楼 - 床位监控
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">总床位数</div>
          <div className="text-2xl font-bold text-white mt-1">{beds.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">已占用</div>
          <div className="text-2xl font-bold text-success mt-1">{occupiedCount}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">空闲床位</div>
          <div className="text-2xl font-bold text-info mt-1">{beds.length - occupiedCount}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">异常告警</div>
          <div className="text-2xl font-bold text-danger mt-1 pulse-red">{abnormalCount}</div>
        </div>
      </div>

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

              {selectedBed.isOccupied && selectedBed.patient ? (
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
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className={`font-medium mb-3 flex items-center justify-between ${selectedBed.isAbnormal ? 'text-danger' : 'text-info'}`}>
                      <span>生命体征 {selectedBed.isAbnormal && '⚠️ 异常'}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateVitals(selectedBed.id); }}
                        className="px-2 py-1 text-xs bg-info/20 text-info rounded hover:bg-info/30 transition-colors"
                      >
                        🔄 更新
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">心率</span>
                        <span className={selectedBed.vitalSigns.heartRate > 100 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">体温</span>
                        <span className={selectedBed.vitalSigns.temperature > 38.5 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.temperature.toFixed(1)} °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">血氧</span>
                        <span className={selectedBed.vitalSigns.oxygenSaturation < 95 ? 'text-danger' : 'text-white'}>
                          {selectedBed.vitalSigns.oxygenSaturation} %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <button
                      onClick={() => handleToggleAbnormal(selectedBed.id, selectedBed.isAbnormal)}
                      className={`w-full py-2 rounded text-sm transition-colors ${
                        selectedBed.isAbnormal
                          ? 'bg-success/20 text-success hover:bg-success/30'
                          : 'bg-danger/20 text-danger hover:bg-danger/30'
                      }`}
                    >
                      {selectedBed.isAbnormal ? '✅ 标记正常' : '⚠️ 标记异常'}
                    </button>
                    <button
                      onClick={() => handleDischarge(selectedBed.id)}
                      className="w-full py-2 bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors text-sm"
                    >
                      🏥 办理出院
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => setShowAdmitModal(true)}
                    className="w-full py-3 bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
                  >
                    + 安排患者入院
                  </button>
                </div>
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleBedClick(bed)}
                    className="flex-1 py-1 bg-danger/20 text-danger text-sm rounded hover:bg-danger/30 transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => handleToggleAbnormal(bed.id, true)}
                    className="flex-1 py-1 bg-success/20 text-success text-sm rounded hover:bg-success/30 transition-colors"
                  >
                    解除告警
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            ✅ 当前无异常床位
          </div>
        )}
      </div>

      {showAdmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel border border-info/30 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold text-white mb-4">安排患者入院</h3>
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
                  <label className="block text-gray-400 text-sm mb-1">性别</label>
                  <select
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">诊断</label>
                <input
                  type="text"
                  value={newPatient.diagnosis}
                  onChange={e => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入诊断结果"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">护理等级</label>
                <select
                  value={newPatient.nursingLevel}
                  onChange={e => setNewPatient({ ...newPatient, nursingLevel: e.target.value as Bed['nursingLevel'] })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                >
                  <option value="normal">三级护理</option>
                  <option value="secondary">二级护理</option>
                  <option value="primary">一级护理</option>
                  <option value="critical">特级护理</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdmitModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdmit}
                className="flex-1 py-2 px-4 bg-success rounded-lg text-white hover:bg-success/80 transition-colors"
              >
                确认入院
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InpatientPanel;
