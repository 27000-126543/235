import { create } from 'zustand';
import {
  User, Department, Bed, EmergencyPatient, Medicine,
  OperationRoom, InstrumentPack, WasteBin, EmergencyPlan,
  PurchaseRequest, DailyReport, UserRole
} from '../types';

const mockUsers: User[] = [
  { id: '1', name: '张护士', role: 'nurse', department: '内科' },
  { id: '2', name: '李医生', role: 'doctor', department: '外科' },
  { id: '3', name: '王主任', role: 'director', department: '急诊科' },
  { id: '4', name: '赵院长', role: 'admin', department: '院办' },
];

const mockDepartments: Department[] = [
  {
    id: 'dept1', name: '内科', queueCount: 28, openWindows: 3, maxWindows: 5,
    doctors: [
      { id: 'd1', name: '张医生', title: '主任医师', department: '内科', isOnDuty: true, todayPatients: 45 },
      { id: 'd2', name: '李医生', title: '副主任医师', department: '内科', isOnDuty: true, todayPatients: 38 },
      { id: 'd3', name: '王医生', title: '主治医师', department: '内科', isOnDuty: false, todayPatients: 20 },
    ]
  },
  {
    id: 'dept2', name: '外科', queueCount: 35, openWindows: 4, maxWindows: 5,
    doctors: [
      { id: 'd4', name: '赵医生', title: '主任医师', department: '外科', isOnDuty: true, todayPatients: 52 },
      { id: 'd5', name: '刘医生', title: '副主任医师', department: '外科', isOnDuty: true, todayPatients: 41 },
    ]
  },
  {
    id: 'dept3', name: '儿科', queueCount: 42, openWindows: 4, maxWindows: 6,
    doctors: [
      { id: 'd6', name: '陈医生', title: '主任医师', department: '儿科', isOnDuty: true, todayPatients: 58 },
      { id: 'd7', name: '孙医生', title: '主治医师', department: '儿科', isOnDuty: true, todayPatients: 45 },
      { id: 'd8', name: '周医生', title: '主治医师', department: '儿科', isOnDuty: true, todayPatients: 39 },
    ]
  },
  {
    id: 'dept4', name: '妇产科', queueCount: 18, openWindows: 2, maxWindows: 4,
    doctors: [
      { id: 'd9', name: '吴医生', title: '主任医师', department: '妇产科', isOnDuty: true, todayPatients: 32 },
      { id: 'd10', name: '郑医生', title: '副主任医师', department: '妇产科', isOnDuty: true, todayPatients: 28 },
    ]
  },
];

const mockBeds: Bed[] = Array.from({ length: 50 }, (_, i) => {
  const floor = Math.floor(i / 10) + 1;
  const roomNum = Math.floor(i / 2) + 1;
  const bedNum = (i % 2) + 1;
  const isAbnormal = Math.random() > 0.9;
  return {
    id: `bed${i + 1}`,
    roomNumber: `${floor}${String(roomNum).padStart(2, '0')}`,
    bedNumber: String(bedNum),
    floor,
    isOccupied: Math.random() > 0.15,
    nursingLevel: ['normal', 'secondary', 'primary', 'critical'][Math.floor(Math.random() * 4)] as any,
    patient: Math.random() > 0.15 ? {
      id: `p${i + 1}`,
      name: ['张三', '李四', '王五', '赵六', '陈七'][Math.floor(Math.random() * 5)],
      age: 20 + Math.floor(Math.random() * 60),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      diagnosis: ['高血压', '糖尿病', '冠心病', '肺炎', '骨折'][Math.floor(Math.random() * 5)],
      admissionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    } : null,
    vitalSigns: {
      heartRate: 60 + Math.floor(Math.random() * 40),
      bloodPressure: `${100 + Math.floor(Math.random() * 40)}/${60 + Math.floor(Math.random() * 20)}`,
      temperature: 36 + Math.random() * 2,
      oxygenSaturation: 95 + Math.floor(Math.random() * 5),
      respiratoryRate: 12 + Math.floor(Math.random() * 8),
      lastUpdate: new Date().toISOString(),
    },
    isAbnormal,
  };
});

const mockEmergencyPatients: EmergencyPatient[] = [
  { id: 'ep1', name: '急诊患者1', age: 45, triageLevel: 'red', condition: '急性心梗', arrivalTime: '10:30', assignedArea: '红区-1', status: 'treating' },
  { id: 'ep2', name: '急诊患者2', age: 32, triageLevel: 'yellow', condition: '严重外伤', arrivalTime: '10:45', assignedArea: '黄区-2', status: 'treating' },
  { id: 'ep3', name: '急诊患者3', age: 28, triageLevel: 'green', condition: '感冒发热', arrivalTime: '11:00', assignedArea: '绿区-3', status: 'waiting' },
  { id: 'ep4', name: '急诊患者4', age: 67, triageLevel: 'red', condition: '脑溢血', arrivalTime: '11:15', assignedArea: '红区-2', status: 'treating' },
  { id: 'ep5', name: '急诊患者5', age: 55, triageLevel: 'yellow', condition: '腹痛待查', arrivalTime: '11:20', assignedArea: '黄区-1', status: 'waiting' },
];

const mockMedicines: Medicine[] = [
  { id: 'm1', name: '阿莫西林胶囊', specification: '0.5g*24粒', manufacturer: '华北制药', stock: 120, safetyStock: 100, unit: '盒', expiryDate: '2025-12-31', price: 25.5, isLowStock: false, isExpiringSoon: false },
  { id: 'm2', name: '头孢克肟片', specification: '0.1g*6片', manufacturer: '白云山制药', stock: 45, safetyStock: 80, unit: '盒', expiryDate: '2025-06-30', price: 45.0, isLowStock: true, isExpiringSoon: true },
  { id: 'm3', name: '布洛芬缓释胶囊', specification: '0.3g*20粒', manufacturer: '中美史克', stock: 200, safetyStock: 150, unit: '盒', expiryDate: '2026-03-15', price: 18.8, isLowStock: false, isExpiringSoon: false },
  { id: 'm4', name: '盐酸二甲双胍片', specification: '0.5g*30片', manufacturer: '中美上海施贵宝', stock: 30, safetyStock: 100, unit: '盒', expiryDate: '2025-08-20', price: 32.0, isLowStock: true, isExpiringSoon: false },
  { id: 'm5', name: '硝苯地平控释片', specification: '30mg*7片', manufacturer: '拜耳医药', stock: 85, safetyStock: 60, unit: '盒', expiryDate: '2025-10-10', price: 58.0, isLowStock: false, isExpiringSoon: false },
  { id: 'm6', name: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', manufacturer: '阿斯利康', stock: 60, safetyStock: 80, unit: '盒', expiryDate: '2025-05-15', price: 65.0, isLowStock: true, isExpiringSoon: true },
  { id: 'm7', name: '氯雷他定片', specification: '10mg*6片', manufacturer: '扬子江药业', stock: 150, safetyStock: 100, unit: '盒', expiryDate: '2026-01-20', price: 22.0, isLowStock: false, isExpiringSoon: false },
  { id: 'm8', name: '阿托伐他汀钙片', specification: '20mg*7片', manufacturer: '辉瑞制药', stock: 25, safetyStock: 50, unit: '盒', expiryDate: '2025-09-30', price: 78.0, isLowStock: true, isExpiringSoon: false },
];

const mockPurchaseRequests: PurchaseRequest[] = [
  { id: 'pr1', medicineId: 'm2', medicineName: '头孢克肟片', quantity: 100, requestDate: '2025-01-15', status: 'pending_director', applicant: '药房管理员' },
  { id: 'pr2', medicineId: 'm4', medicineName: '盐酸二甲双胍片', quantity: 150, requestDate: '2025-01-14', status: 'pending_pharmacy', applicant: '药房管理员' },
  { id: 'pr3', medicineId: 'm6', medicineName: '奥美拉唑肠溶胶囊', quantity: 80, requestDate: '2025-01-13', status: 'approved', applicant: '药房管理员' },
];

const mockSurgeries = [
  { id: 's1', patientName: '患者A', surgeryName: '阑尾切除术', surgeon: '李医生', startTime: '08:00', endTime: '09:30', status: 'completed' as const, roomId: 'or1' },
  { id: 's2', patientName: '患者B', surgeryName: '胆囊切除术', surgeon: '赵医生', startTime: '09:00', endTime: '11:00', status: 'in_progress' as const, roomId: 'or1' },
  { id: 's3', patientName: '患者C', surgeryName: '膝关节置换', surgeon: '王医生', startTime: '10:00', endTime: '13:00', status: 'scheduled' as const, roomId: 'or2' },
  { id: 's4', patientName: '患者D', surgeryName: '剖宫产', surgeon: '张医生', startTime: '14:00', endTime: '16:00', status: 'scheduled' as const, roomId: 'or3' },
];

const mockOperationRooms: OperationRoom[] = [
  { id: 'or1', name: '手术室1', floor: 5, status: 'occupied', currentSurgery: mockSurgeries[1], schedule: mockSurgeries.filter(s => s.roomId === 'or1') },
  { id: 'or2', name: '手术室2', floor: 5, status: 'available', currentSurgery: null, schedule: mockSurgeries.filter(s => s.roomId === 'or2') },
  { id: 'or3', name: '手术室3', floor: 5, status: 'available', currentSurgery: null, schedule: mockSurgeries.filter(s => s.roomId === 'or3') },
  { id: 'or4', name: '手术室4', floor: 5, status: 'cleaning', currentSurgery: null, schedule: [] },
  { id: 'or5', name: '手术室5', floor: 6, status: 'maintenance', currentSurgery: null, schedule: [] },
];

const mockInstrumentPacks: InstrumentPack[] = [
  { id: 'ip1', name: '外科手术包A', type: '通用手术包', status: 'cleaning', lastCleanTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), cleaningDuration: 180, isOverdue: true },
  { id: 'ip2', name: '骨科手术包B', type: '骨科专用', status: 'disinfecting', lastCleanTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), cleaningDuration: 60, isOverdue: false },
  { id: 'ip3', name: '妇产科手术包C', type: '妇产科专用', status: 'ready', lastCleanTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), cleaningDuration: 30, isOverdue: false },
  { id: 'ip4', name: '眼科手术包D', type: '眼科专用', status: 'packaging', lastCleanTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), cleaningDuration: 120, isOverdue: true },
  { id: 'ip5', name: '牙科手术包E', type: '牙科专用', status: 'in_use', lastCleanTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), cleaningDuration: 240, isOverdue: false },
];

const mockWasteBins: WasteBin[] = [
  { id: 'wb1', location: '门诊大厅-1号', type: 'infectious', fillLevel: 45, lastEmptyTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb2', location: '急诊科-2号', type: 'infectious', fillLevel: 85, lastEmptyTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), needsPickup: true },
  { id: 'wb3', location: '住院楼-3号', type: 'ordinary', fillLevel: 60, lastEmptyTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb4', location: '手术室-4号', type: 'pathological', fillLevel: 90, lastEmptyTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), needsPickup: true },
  { id: 'wb5', location: '检验科-5号', type: 'chemical', fillLevel: 30, lastEmptyTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb6', location: '住院楼-6号', type: 'infectious', fillLevel: 75, lastEmptyTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), needsPickup: false },
];

const mockEmergencyPlans: EmergencyPlan[] = [
  { id: 'plan1', name: '火灾应急预案', type: 'fire', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan2', name: '传染病暴发预案', type: 'infectious', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan3', name: '批量伤员救治预案', type: 'mass_casualty', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan4', name: '停电应急预案', type: 'power_outage', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
];

interface HospitalState {
  currentUser: User | null;
  isLoggedIn: boolean;
  currentView: string;
  departments: Department[];
  beds: Bed[];
  emergencyPatients: EmergencyPatient[];
  medicines: Medicine[];
  purchaseRequests: PurchaseRequest[];
  operationRooms: OperationRoom[];
  instrumentPacks: InstrumentPack[];
  wasteBins: WasteBin[];
  emergencyPlans: EmergencyPlan[];
  activeEmergencyPlan: EmergencyPlan | null;
  notifications: string[];
  setCurrentUser: (user: User | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  setCurrentView: (view: string) => void;
  login: (username: string, password: string, useFaceRecognition?: boolean) => Promise<boolean>;
  logout: () => void;
  updateWindowCount: (deptId: string, delta: number) => void;
  addNotification: (msg: string) => void;
  clearNotification: (index: number) => void;
  approvePurchaseRequest: (id: string, role: UserRole) => void;
  rejectPurchaseRequest: (id: string, role: UserRole) => void;
  activateEmergencyPlan: (id: string) => void;
  deactivateEmergencyPlan: () => void;
  addPurchaseRequest: (medicineId: string, quantity: number) => void;
  scheduleSurgery: (surgery: any, roomId: string) => boolean;
  pickupWaste: (binId: string) => void;
  generateDailyReport: (date: string) => DailyReport;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  currentView: 'overview',
  departments: mockDepartments,
  beds: mockBeds,
  emergencyPatients: mockEmergencyPatients,
  medicines: mockMedicines,
  purchaseRequests: mockPurchaseRequests,
  operationRooms: mockOperationRooms,
  instrumentPacks: mockInstrumentPacks,
  wasteBins: mockWasteBins,
  emergencyPlans: mockEmergencyPlans,
  activeEmergencyPlan: null,
  notifications: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setCurrentView: (view) => set({ currentView: view }),

  login: async (username, password, useFaceRecognition = false) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const user = mockUsers.find(u => u.name.includes(username) || username === 'admin');
    if (user || username === 'admin') {
      set({ currentUser: user || mockUsers[3], isLoggedIn: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, isLoggedIn: false, currentView: 'overview' });
  },

  updateWindowCount: (deptId, delta) => {
    set(state => ({
      departments: state.departments.map(d => {
        if (d.id === deptId) {
          const newCount = Math.max(1, Math.min(d.maxWindows, d.openWindows + delta));
          return { ...d, openWindows: newCount };
        }
        return d;
      })
    }));
  },

  addNotification: (msg) => {
    set(state => ({ notifications: [...state.notifications, msg] }));
  },

  clearNotification: (index) => {
    set(state => ({ notifications: state.notifications.filter((_, i) => i !== index) }));
  },

  approvePurchaseRequest: (id, role) => {
    set(state => ({
      purchaseRequests: state.purchaseRequests.map(pr => {
        if (pr.id === id) {
          if (role === 'director' && pr.status === 'pending_director') {
            return { ...pr, status: 'pending_vice' };
          } else if (role === 'admin' && pr.status === 'pending_vice') {
            return { ...pr, status: 'approved' };
          }
        }
        return pr;
      })
    }));
  },

  rejectPurchaseRequest: (id, role) => {
    set(state => ({
      purchaseRequests: state.purchaseRequests.map(pr => {
        if (pr.id === id) {
          return { ...pr, status: 'rejected' };
        }
        return pr;
      })
    }));
  },

  activateEmergencyPlan: (id) => {
    const plan = get().emergencyPlans.find(p => p.id === id);
    if (plan) {
      const availableBeds = get().beds.filter(b => !b.isOccupied).slice(0, 10).map(b => b.id);
      const availableRooms = get().operationRooms.filter(r => r.status === 'available').map(r => r.id);
      const staff = mockUsers.filter(u => u.role !== 'nurse').map(u => u.id);
      
      set({
        activeEmergencyPlan: {
          ...plan,
          isActive: true,
          startTime: new Date().toISOString(),
          involvedBeds: availableBeds,
          involvedRooms: availableRooms,
          involvedStaff: staff,
        },
        emergencyPlans: get().emergencyPlans.map(p => p.id === id ? { ...p, isActive: true } : p)
      });
      get().addNotification(`应急预案已启动: ${plan.name}`);
    }
  },

  deactivateEmergencyPlan: () => {
    const plan = get().activeEmergencyPlan;
    if (plan) {
      set({
        activeEmergencyPlan: null,
        emergencyPlans: get().emergencyPlans.map(p => p.id === plan.id ? { ...p, isActive: false } : p)
      });
      get().addNotification(`应急预案已解除: ${plan.name}`);
    }
  },

  addPurchaseRequest: (medicineId, quantity) => {
    const medicine = get().medicines.find(m => m.id === medicineId);
    if (medicine) {
      const newRequest: PurchaseRequest = {
        id: `pr${Date.now()}`,
        medicineId,
        medicineName: medicine.name,
        quantity,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending_pharmacy',
        applicant: get().currentUser?.name || '系统',
      };
      set(state => ({ purchaseRequests: [...state.purchaseRequests, newRequest] }));
      get().addNotification(`已生成采购申请: ${medicine.name}`);
    }
  },

  scheduleSurgery: (surgery, roomId) => {
    const room = get().operationRooms.find(r => r.id === roomId);
    if (!room) return false;
    
    const hasConflict = room.schedule.some(s => {
      if (s.status === 'cancelled') return false;
      return (surgery.startTime < s.endTime && surgery.endTime > s.startTime);
    });
    
    if (hasConflict) {
      get().addNotification(`手术室${room.name}档期冲突，已自动调整`);
      return false;
    }
    
    set(state => ({
      operationRooms: state.operationRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, schedule: [...r.schedule, { ...surgery, roomId, status: 'scheduled' }] };
        }
        return r;
      })
    }));
    return true;
  },

  pickupWaste: (binId) => {
    set(state => ({
      wasteBins: state.wasteBins.map(wb => {
        if (wb.id === binId) {
          return { ...wb, fillLevel: 0, needsPickup: false, lastEmptyTime: new Date().toISOString() };
        }
        return wb;
      })
    }));
    get().addNotification(`垃圾桶已清运: ${get().wasteBins.find(w => w.id === binId)?.location}`);
  },

  generateDailyReport: (date) => {
    return {
      date,
      outpatients: Math.floor(Math.random() * 500) + 800,
      surgeries: Math.floor(Math.random() * 20) + 15,
      pharmacyTurnover: Math.floor(Math.random() * 50000) + 80000,
      emergencyCount: Math.floor(Math.random() * 30) + 20,
      emergencyResolved: Math.floor(Math.random() * 25) + 18,
      avgWaitTime: Math.floor(Math.random() * 30) + 15,
      bedOccupancyRate: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
    };
  },
}));
