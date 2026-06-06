import React, { useState, useEffect } from 'react';
import { useHospitalStore } from '../store/useHospitalStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const Header: React.FC = () => {
  const { currentUser, logout, activeEmergencyPlan, deactivateEmergencyPlan, generateDailyReport } = useHospitalStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExportReport = () => {
    const report = generateDailyReport(selectedDate);
    const data = [
      { '项目': '日期', '数值': report.date },
      { '项目': '门诊量', '数值': report.outpatients },
      { '项目': '手术量', '数值': report.surgeries },
      { '项目': '药房营业额(元)', '数值': report.pharmacyTurnover },
      { '项目': '急诊接诊数', '数值': report.emergencyCount },
      { '项目': '急诊处置数', '数值': report.emergencyResolved },
      { '项目': '平均等待时间(分钟)', '数值': report.avgWaitTime },
      { '项目': '床位使用率', '数值': `${(report.bedOccupancyRate * 100).toFixed(1)}%` },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '运营日报');
    XLSX.writeFile(wb, `医院运营日报_${selectedDate}.xlsx`);
    setShowExportModal(false);
  };

  const roleNames: Record<string, string> = {
    nurse: '护士',
    doctor: '医生',
    director: '科主任',
    admin: '院长',
  };

  return (
    <header className="h-16 bg-panel border-b border-info/30 flex items-center justify-between px-6 relative z-50">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-white glow-text flex items-center gap-2">
          <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          3D智慧医院综合运营与应急调度可视化平台
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {activeEmergencyPlan && (
          <div className="px-4 py-2 bg-danger/20 border border-danger rounded-lg flex items-center gap-3 pulse-red">
            <span className="w-3 h-3 bg-danger rounded-full animate-pulse" />
            <span className="text-danger font-medium">{activeEmergencyPlan.name} 进行中</span>
            <button
              onClick={deactivateEmergencyPlan}
              className="px-3 py-1 bg-danger text-white text-sm rounded hover:bg-danger/80 transition-colors"
            >
              解除预案
            </button>
          </div>
        )}

        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-success/20 border border-success/50 rounded-lg text-success hover:bg-success/30 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出日报
        </button>

        <div className="text-right">
          <div className="text-white font-medium">
            {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </div>
          <div className="text-info text-lg font-mono">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>

        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-dark/50 border border-info/30 hover:border-info/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-info to-primary flex items-center justify-center text-white font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{currentUser.name}</div>
                <div className="text-xs text-gray-400">
                  {roleNames[currentUser.role]} | {currentUser.department}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-panel border border-info/30 rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-info/20">
                  <div className="text-sm text-gray-400">当前角色</div>
                  <div className="text-white font-medium">{roleNames[currentUser.role]}</div>
                </div>
                <div className="p-3 border-b border-info/20">
                  <div className="text-sm text-gray-400">所属部门</div>
                  <div className="text-white font-medium">{currentUser.department}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full p-3 text-left text-danger hover:bg-danger/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel border border-info/30 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold text-white mb-4">导出运营日报</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">选择日期</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExportReport}
                className="flex-1 py-2 px-4 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
              >
                导出Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
