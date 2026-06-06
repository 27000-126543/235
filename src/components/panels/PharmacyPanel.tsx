import React, { useState } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { Medicine, PurchaseRequest } from '../../types';

const PharmacyPanel: React.FC = () => {
  const { medicines, purchaseRequests, currentUser, addPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, addNotification } = useHospitalStore();
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState(100);

  const lowStockMedicines = medicines.filter(m => m.isLowStock);
  const expiringMedicines = medicines.filter(m => m.isExpiringSoon);

  const statusNames: Record<string, string> = {
    pending_pharmacy: '待药剂科审核',
    pending_director: '待科主任审批',
    pending_vice: '待分管院长审批',
    approved: '已批准',
    rejected: '已拒绝',
  };

  const canApprove = (status: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'director' && status === 'pending_director') return true;
    if (currentUser.role === 'admin' && status === 'pending_vice') return true;
    return false;
  };

  const handleRequestPurchase = () => {
    if (selectedMedicine) {
      addPurchaseRequest(selectedMedicine.id, requestQuantity);
      setShowRequestModal(false);
      setRequestQuantity(100);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-warning rounded" />
        药房 - 库存管理与采购审批
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">药品总数</div>
          <div className="text-2xl font-bold text-white mt-1">{medicines.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">低库存预警</div>
          <div className="text-2xl font-bold text-danger mt-1">{lowStockMedicines.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">即将过期</div>
          <div className="text-2xl font-bold text-warning mt-1">{expiringMedicines.length}</div>
        </div>
        <div className="bg-panel panel-border rounded-lg p-4">
          <div className="text-gray-400 text-sm">待审批申请</div>
          <div className="text-2xl font-bold text-info mt-1">
            {purchaseRequests.filter(pr => pr.status !== 'approved' && pr.status !== 'rejected').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">药品库存</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-400">药品名称</th>
                  <th className="text-left py-3 px-2 text-gray-400">规格</th>
                  <th className="text-left py-3 px-2 text-gray-400">库存</th>
                  <th className="text-left py-3 px-2 text-gray-400">安全库存</th>
                  <th className="text-left py-3 px-2 text-gray-400">有效期</th>
                  <th className="text-left py-3 px-2 text-gray-400">状态</th>
                  <th className="text-left py-3 px-2 text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(medicine => (
                  <tr
                    key={medicine.id}
                    onClick={() => setSelectedMedicine(medicine)}
                    className={`border-b border-gray-800 cursor-pointer hover:bg-white/5 ${
                      selectedMedicine?.id === medicine.id ? 'bg-info/10' : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-white">{medicine.name}</td>
                    <td className="py-3 px-2 text-gray-400">{medicine.specification}</td>
                    <td className={`py-3 px-2 font-medium ${medicine.isLowStock ? 'text-danger' : 'text-white'}`}>
                      {medicine.stock} {medicine.unit}
                    </td>
                    <td className="py-3 px-2 text-gray-400">{medicine.safetyStock} {medicine.unit}</td>
                    <td className={`py-3 px-2 ${medicine.isExpiringSoon ? 'text-warning' : 'text-gray-400'}`}>
                      {medicine.expiryDate}
                    </td>
                    <td className="py-3 px-2">
                      {medicine.isLowStock && <span className="px-2 py-0.5 bg-danger/20 text-danger text-xs rounded mr-1">低库存</span>}
                      {medicine.isExpiringSoon && <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">即将过期</span>}
                      {!medicine.isLowStock && !medicine.isExpiringSoon && <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded">正常</span>}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMedicine(medicine);
                          setShowRequestModal(true);
                        }}
                        className="px-3 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 transition-colors"
                      >
                        申请采购
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-panel panel-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">采购审批流</h3>
          <div className="space-y-3">
            {purchaseRequests.map(pr => (
              <div key={pr.id} className="p-3 bg-dark/30 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{pr.medicineName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    pr.status === 'approved' ? 'bg-success/20 text-success' :
                    pr.status === 'rejected' ? 'bg-danger/20 text-danger' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {statusNames[pr.status]}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  数量: {pr.quantity} | 申请人: {pr.applicant}
                </div>
                <div className="text-gray-500 text-xs mt-1">{pr.requestDate}</div>
                
                {canApprove(pr.status) && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approvePurchaseRequest(pr.id, currentUser!.role)}
                      className="flex-1 py-1 bg-success/20 text-success text-sm rounded hover:bg-success/30 transition-colors"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => rejectPurchaseRequest(pr.id, currentUser!.role)}
                      className="flex-1 py-1 bg-danger/20 text-danger text-sm rounded hover:bg-danger/30 transition-colors"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-dark/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">审批流程说明</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white">1</div>
                <span className="text-gray-400">药房管理员发起申请</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-warning/50 flex items-center justify-center text-white">2</div>
                <span className="text-gray-400">药剂科主任审批</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-info/50 flex items-center justify-center text-white">3</div>
                <span className="text-gray-400">分管院长审批</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success/50 flex items-center justify-center text-white">4</div>
                <span className="text-gray-400">采购执行</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRequestModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-panel border border-info/30 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold text-white mb-4">采购申请</h3>
            <div className="mb-4">
              <div className="text-gray-400 text-sm">药品名称</div>
              <div className="text-white font-medium">{selectedMedicine.name}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-1">当前库存</div>
              <div className={`font-medium ${selectedMedicine.isLowStock ? 'text-danger' : 'text-white'}`}>
                {selectedMedicine.stock} {selectedMedicine.unit} (安全库存: {selectedMedicine.safetyStock})
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">申请数量 ({selectedMedicine.unit})</label>
              <input
                type="number"
                value={requestQuantity}
                onChange={e => setRequestQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 bg-dark/50 border border-info/30 rounded-lg text-white focus:outline-none focus:border-info"
                min="1"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRequestPurchase}
                className="flex-1 py-2 px-4 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPanel;
