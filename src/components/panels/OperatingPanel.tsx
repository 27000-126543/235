import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { OperationRoom } from '../../types';

const OperatingPanel: React.FC = () => {
  const { operationRooms, scheduleSurgery, cancelSurgery, setRoomStatus, addNotification } = useHospitalStore();
  const [selectedRoom, setSelectedRoom] = useState<OperationRoom | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSurgery, setNewSurgery] = useState({
    patientName: '',
    surgeryName: '',
    surgeon: '',
    startTime: '08:00',
    endTime: '09:00',
  });

  const statusColors: Record<string, string> = {
    available: 'bg-success',
    occupied: 'bg-danger',
    cleaning: 'bg-warning',
    maintenance: 'bg-gray-500',
  };

  const statusNames: Record<string, string> = {
    available: '空闲',
    occupied: '使用中',
    cleaning: '清洁中',
    maintenance: '维护中',
  };

  const surgeryStatusNames: Record<string, string> = {
    scheduled: '已预约',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };

  const handleSchedule = () => {
    if (selectedRoom) {
      const success = scheduleSurgery(newSurgery, selectedRoom.id);
      if (success) {
        setShowScheduleModal(false);
        setNewSurgery({ patientName: '', surgeryName: '', surgeon: '', startTime: '08:00', endTime: '09:00' });
      }
    }
  };

  const handleStatusChange = (roomId: string, status: OperationRoom['status']) => {
    setRoomStatus(roomId, status);
    const room = operationRooms.find(r => r.id === roomId);
    addNotification(`手术室${room?.name}状态更新为: ${statusNames[status]}`, 'info');
  };

  const handleCancelSurgery = (roomId: string, surgeryId: string) => {
    cancelSurgery(roomId, surgeryId);
    addNotification('手术已取消', 'warning');
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded" />
        手术室 - 智能排班与档期管理
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {operationRooms.map(room => (
          <div
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`bg-panel panel-border rounded-lg p-4 cursor-pointer transition-all ${
              selectedRoom?.id === room.id ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{room.name}</span>
              <span className={`w-3 h-3 rounded-full ${statusColors[room.status]} ${room.status === 'occupied' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="text-gray-400 text-sm">{room.floor}楼</div>
            <select
              value={room.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleStatusChange(room.id, e.target.value as OperationRoom['status'])}
              className={`w-full mt-2 px-2 py-1 text-sm bg-dark/50 border border-gray-700 rounded cursor-pointer ${
                room.status === 'available' ? 'text-success' :
                room.status === 'occupied' ? 'text-danger' :
                room.status === 'cleaning' ? 'text-warning' : 'text-gray-400'
              }`}
            >
              <option value="available">空闲</option>
              <option value="occupied">使用中</option>
              <option value="cleaning">清洁中</option>
              <option value="maintenance">维护中</option>
            </select>
            {room.currentSurgery && (
              <div className="mt-2 p-2 bg-dark/50 rounded text-xs">
                <div className="text-white">{room.currentSurgery.surgeryName}</div>
                <div className="text-gray-400">{room.currentSurgery.surgeon}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedRoom ? `${selectedRoom.name} 排班表` : '请选择手术室查看排班'}
            </h3>
            {selectedRoom && selectedRoom.status === 'available' && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors text-sm"
              >
                + 预约手术
              </button>
            )}
          </div>

          {selectedRoom ? (
            <div className="space-y-3">
              {selectedRoom.schedule.map((surgery, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    surgery.status === 'completed' ? 'bg-gray-800/30 border-gray-700 opacity-60' :
                    surgery.status === 'in_progress' ? 'bg-danger/10 border-danger/30' :
                    surgery.status === 'cancelled' ? 'bg-gray-800/20 border-gray-700 opacity-40' :
                    'bg-dark/50 border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium">{surgery.surgeryName}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        surgery.status === 'scheduled' ? 'bg-info/20 text-info' :
                        surgery.status === 'in_progress' ? 'bg-danger/20 text-danger' :
                        surgery.status === 'completed' ? 'bg-success/20 text-success' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {surgeryStatusNames[surgery.status]}
                      </span>
                      {surgery.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelSurgery(selectedRoom.id, surgery.id)}
                          className="text-xs px-2 py-0.5 bg-danger/20 text-danger rounded hover:bg-danger/30 transition-colors"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-400">患者: {surgery.patientName}</span>
                    <span className="text-gray-400">主刀: {surgery.surgeon}</span>
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {surgery.startTime} - {surgery.endTime}
                  </div>
                </div>
              ))}
              {selectedRoom.schedule.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  暂无手术安排
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              请在上方选择手术室
            </div>
          )}
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">手术室时间轴</h3>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-700" />
            <div className="space-y-4">
              {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 text-right text-gray-500 text-sm pt-1">{time}</div>
                  <div className="flex-1 h-8 bg-dark/30 rounded relative">
                    {selectedRoom?.schedule.map((surgery, sIdx) => {
                      const startHour = parseInt(surgery.startTime.split(':')[0]);
                      const endHour = parseInt(surgery.endTime.split(':')[0]);
                      const startMin = parseInt(surgery.startTime.split(':')[1]);
                      const endMin = parseInt(surgery.endTime.split(':')[1]);
                      const timelineStart = 8 + idx * 2;
                      const timelineEnd = timelineStart + 2;
                      
                      const surgeryStart = startHour + startMin / 60;
                      const surgeryEnd = endHour + endMin / 60;
                      
                      if (surgeryEnd <= timelineStart || surgeryStart >= timelineEnd) return null;
                      
                      const left = Math.max(0, (surgeryStart - timelineStart) / 2 * 100);
                      const width = Math.min(100 - left, (surgeryEnd - surgeryStart) / 2 * 100);
                      
                      return (
                        <div
                          key={sIdx}
                          className={`absolute top-1 bottom-1 rounded text-xs flex items-center justify-center text-white overflow-hidden ${
                            surgery.status === 'completed' ? 'bg-success/50' :
                            surgery.status === 'in_progress' ? 'bg-danger animate-pulse' :
                            surgery.status === 'cancelled' ? 'bg-gray-500/50' :
                            'bg-purple-500/70'
                          }`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <span className="truncate px-1">{surgery.surgeryName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">智能排班说明</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 系统自动检测档期冲突</li>
              <li>• 冲突时自动推荐备用手术室</li>
              <li>• 紧急手术可优先安排</li>
              <li>• 支持一键调整手术时间</li>
            </ul>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel border border-info/30 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold text-white mb-4">预约手术</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">患者姓名</label>
                <input
                  type="text"
                  value={newSurgery.patientName}
                  onChange={e => setNewSurgery({ ...newSurgery, patientName: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入患者姓名"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">手术名称</label>
                <input
                  type="text"
                  value={newSurgery.surgeryName}
                  onChange={e => setNewSurgery({ ...newSurgery, surgeryName: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入手术名称"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">主刀医生</label>
                <input
                  type="text"
                  value={newSurgery.surgeon}
                  onChange={e => setNewSurgery({ ...newSurgery, surgeon: e.target.value })}
                  className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  placeholder="请输入主刀医生"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">开始时间</label>
                  <input
                    type="time"
                    value={newSurgery.startTime}
                    onChange={e => setNewSurgery({ ...newSurgery, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">结束时间</label>
                  <input
                    type="time"
                    value={newSurgery.endTime}
                    onChange={e => setNewSurgery({ ...newSurgery, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSchedule}
                className="flex-1 py-2 px-4 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
              >
                确认预约
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatingPanel;
