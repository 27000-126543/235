import { create } from 'zustand';
import {
  User, Department, Bed, EmergencyPatient, Medicine,
  OperationRoom, InstrumentPack, WasteBin, EmergencyPlan,
  PurchaseRequest, DailyReport, UserRole, Surgery
} from '../types';
import { idbService, IDBRequest } from '../utils/indexedDB';

const mockUsers: User[] = [
  { id: '1', name: '张护士', role: 'nurse', department: '内科' },
  { id: '2', name: '李医生', role: 'doctor', department: '外科' },
  { id: '3', name: '王主任', role: 'director', department: '药剂科' },
  { id: '4', name: '赵院长', role: 'admin', department: '院办' },
];

const initialDepartments: Department[] = [
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

const initialBeds: Bed[] = Array.from({ length: 50 }, (_, i) => {
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
      temperature: parseFloat((36 + Math.random() * 2).toFixed(1)),
      oxygenSaturation: 95 + Math.floor(Math.random() * 5),
      respiratoryRate: 12 + Math.floor(Math.random() * 8),
      lastUpdate: new Date().toISOString(),
    },
    isAbnormal,
  };
});

const initialEmergencyPatients: EmergencyPatient[] = [
  { id: 'ep1', name: '急诊患者1', age: 45, triageLevel: 'red', condition: '急性心梗', arrivalTime: '10:30', assignedArea: '红区-1', status: 'treating' },
  { id: 'ep2', name: '急诊患者2', age: 32, triageLevel: 'yellow', condition: '严重外伤', arrivalTime: '10:45', assignedArea: '黄区-2', status: 'treating' },
  { id: 'ep3', name: '急诊患者3', age: 28, triageLevel: 'green', condition: '感冒发热', arrivalTime: '11:00', assignedArea: '绿区-3', status: 'waiting' },
  { id: 'ep4', name: '急诊患者4', age: 67, triageLevel: 'red', condition: '脑溢血', arrivalTime: '11:15', assignedArea: '红区-2', status: 'treating' },
  { id: 'ep5', name: '急诊患者5', age: 55, triageLevel: 'yellow', condition: '腹痛待查', arrivalTime: '11:20', assignedArea: '黄区-1', status: 'waiting' },
];

const initialMedicines: Medicine[] = [
  { id: 'm1', name: '阿莫西林胶囊', specification: '0.5g*24粒', manufacturer: '华北制药', stock: 120, safetyStock: 100, unit: '盒', expiryDate: '2026-12-31', price: 25.5, isLowStock: false, isExpiringSoon: false },
  { id: 'm2', name: '头孢克肟片', specification: '0.1g*6片', manufacturer: '白云山制药', stock: 45, safetyStock: 80, unit: '盒', expiryDate: '2026-06-30', price: 45.0, isLowStock: true, isExpiringSoon: true },
  { id: 'm3', name: '布洛芬缓释胶囊', specification: '0.3g*20粒', manufacturer: '中美史克', stock: 200, safetyStock: 150, unit: '盒', expiryDate: '2026-03-15', price: 18.8, isLowStock: false, isExpiringSoon: false },
  { id: 'm4', name: '盐酸二甲双胍片', specification: '0.5g*30片', manufacturer: '中美上海施贵宝', stock: 30, safetyStock: 100, unit: '盒', expiryDate: '2025-08-20', price: 32.0, isLowStock: true, isExpiringSoon: false },
  { id: 'm5', name: '硝苯地平控释片', specification: '30mg*7片', manufacturer: '拜耳医药', stock: 85, safetyStock: 60, unit: '盒', expiryDate: '2026-10-10', price: 58.0, isLowStock: false, isExpiringSoon: false },
  { id: 'm6', name: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', manufacturer: '阿斯利康', stock: 60, safetyStock: 80, unit: '盒', expiryDate: '2025-05-15', price: 65.0, isLowStock: true, isExpiringSoon: true },
  { id: 'm7', name: '氯雷他定片', specification: '10mg*6片', manufacturer: '扬子江药业', stock: 150, safetyStock: 100, unit: '盒', expiryDate: '2026-01-20', price: 22.0, isLowStock: false, isExpiringSoon: false },
  { id: 'm8', name: '阿托伐他汀钙片', specification: '20mg*7片', manufacturer: '辉瑞制药', stock: 25, safetyStock: 50, unit: '盒', expiryDate: '2026-09-30', price: 78.0, isLowStock: true, isExpiringSoon: false },
];

const initialSurgeries: Surgery[] = [
  { id: 's1', patientName: '患者A', surgeryName: '阑尾切除术', surgeon: '李医生', startTime: '08:00', endTime: '09:30', status: 'completed', roomId: 'or1' },
  { id: 's2', patientName: '患者B', surgeryName: '胆囊切除术', surgeon: '赵医生', startTime: '09:00', endTime: '11:00', status: 'in_progress', roomId: 'or1' },
  { id: 's3', patientName: '患者C', surgeryName: '膝关节置换', surgeon: '王医生', startTime: '10:00', endTime: '13:00', status: 'scheduled', roomId: 'or2' },
  { id: 's4', patientName: '患者D', surgeryName: '剖宫产', surgeon: '张医生', startTime: '14:00', endTime: '16:00', status: 'scheduled', roomId: 'or3' },
];

const initialOperationRooms: OperationRoom[] = [
  { id: 'or1', name: '手术室1', floor: 5, status: 'occupied', currentSurgery: initialSurgeries[1], schedule: initialSurgeries.filter(s => s.roomId === 'or1') },
  { id: 'or2', name: '手术室2', floor: 5, status: 'available', currentSurgery: null, schedule: initialSurgeries.filter(s => s.roomId === 'or2') },
  { id: 'or3', name: '手术室3', floor: 5, status: 'available', currentSurgery: null, schedule: initialSurgeries.filter(s => s.roomId === 'or3') },
  { id: 'or4', name: '手术室4', floor: 5, status: 'cleaning', currentSurgery: null, schedule: [] },
  { id: 'or5', name: '手术室5', floor: 6, status: 'maintenance', currentSurgery: null, schedule: [] },
];

const initialInstrumentPacks: InstrumentPack[] = [
  { id: 'ip1', name: '外科手术包A', type: '通用手术包', status: 'cleaning', lastCleanTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), cleaningDuration: 180, isOverdue: true },
  { id: 'ip2', name: '骨科手术包B', type: '骨科专用', status: 'disinfecting', lastCleanTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), cleaningDuration: 60, isOverdue: false },
  { id: 'ip3', name: '妇产科手术包C', type: '妇产科专用', status: 'ready', lastCleanTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), cleaningDuration: 30, isOverdue: false },
  { id: 'ip4', name: '眼科手术包D', type: '眼科专用', status: 'packaging', lastCleanTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), cleaningDuration: 120, isOverdue: true },
  { id: 'ip5', name: '牙科手术包E', type: '牙科专用', status: 'in_use', lastCleanTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), cleaningDuration: 240, isOverdue: false },
];

const initialWasteBins: WasteBin[] = [
  { id: 'wb1', location: '门诊大厅-1号', type: 'infectious', fillLevel: 45, lastEmptyTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb2', location: '急诊科-2号', type: 'infectious', fillLevel: 85, lastEmptyTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), needsPickup: true },
  { id: 'wb3', location: '住院楼-3号', type: 'ordinary', fillLevel: 60, lastEmptyTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb4', location: '手术室-4号', type: 'pathological', fillLevel: 90, lastEmptyTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), needsPickup: true },
  { id: 'wb5', location: '检验科-5号', type: 'chemical', fillLevel: 30, lastEmptyTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), needsPickup: false },
  { id: 'wb6', location: '住院楼-6号', type: 'infectious', fillLevel: 75, lastEmptyTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), needsPickup: false },
];

const initialEmergencyPlans: EmergencyPlan[] = [
  { id: 'plan1', name: '火灾应急预案', type: 'fire', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan2', name: '传染病暴发预案', type: 'infectious', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan3', name: '批量伤员救治预案', type: 'mass_casualty', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
  { id: 'plan4', name: '停电应急预案', type: 'power_outage', isActive: false, involvedBeds: [], involvedRooms: [], involvedStaff: [] },
];

interface ResourceMovement {
  id: string;
  type: 'bed' | 'staff' | 'equipment';
  from: [number, number, number];
  to: [number, number, number];
  progress: number;
}

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
  notifications: { id: string; message: string; type: 'info' | 'warning' | 'danger' | 'success'; timestamp: string }[];
  resourceMovements: ResourceMovement[];
  wsConnected: boolean;

  initDB: () => Promise<void>;
  loadPurchaseRequests: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  setCurrentView: (view: string) => void;
  login: (username: string, password: string, useFaceRecognition?: boolean) => Promise<boolean>;
  logout: () => void;

  updateWindowCount: (deptId: string, delta: number) => void;
  updateQueueCount: (deptId: string, delta: number) => void;
  updateDoctorPatients: (deptId: string, doctorId: string, delta: number) => void;

  updateBedVitalSigns: (bedId: string) => void;
  setBedAbnormal: (bedId: string, abnormal: boolean) => void;
  dischargePatient: (bedId: string) => void;
  admitPatient: (bedId: string, patient: any) => void;

  addMedicineStock: (medicineId: string, amount: number) => void;
  reduceMedicineStock: (medicineId: string, amount: number) => void;
  updateMedicineStock: (medicineId: string, newStock: number) => void;

  approvePurchaseRequest: (id: string, role: UserRole) => Promise<void>;
  rejectPurchaseRequest: (id: string, role: UserRole) => Promise<void>;
  addPurchaseRequest: (medicineId: string, quantity: number) => Promise<void>;

  scheduleSurgery: (surgery: Pick<Surgery, 'patientName' | 'surgeryName' | 'surgeon' | 'startTime' | 'endTime'>, roomId: string) => boolean;
  cancelSurgery: (roomId: string, surgeryId: string) => void;
  setRoomStatus: (roomId: string, status: OperationRoom['status']) => void;

  pickupWaste: (binId: string) => void;
  updateWasteLevel: (binId: string, level: number) => void;

  addEmergencyPatient: (patient: Omit<EmergencyPatient, 'id'>) => void;
  updateEmergencyPatientStatus: (id: string, status: EmergencyPatient['status']) => void;
  removeEmergencyPatient: (id: string) => void;

  updateInstrumentPackStatus: (id: string, status: InstrumentPack['status']) => void;

  activateEmergencyPlan: (id: string) => void;
  deactivateEmergencyPlan: () => void;

  addNotification: (message: string, type?: 'info' | 'warning' | 'danger' | 'success') => void;
  clearNotification: (id: string) => void;

  startVitalSignsSimulation: () => void;
  stopVitalSignsSimulation: () => void;

  generateDailyReport: (date: string) => DailyReport;
}

let vitalSignsInterval: number | null = null;
let wsSimulationInterval: number | null = null;

export const useHospitalStore = create<HospitalState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  currentView: 'overview',
  departments: initialDepartments,
  beds: initialBeds,
  emergencyPatients: initialEmergencyPatients,
  medicines: initialMedicines,
  purchaseRequests: [],
  operationRooms: initialOperationRooms,
  instrumentPacks: initialInstrumentPacks,
  wasteBins: initialWasteBins,
  emergencyPlans: initialEmergencyPlans,
  activeEmergencyPlan: null,
  notifications: [],
  resourceMovements: [],
  wsConnected: false,

  initDB: async () => {
    try {
      await idbService.init();
      await get().loadPurchaseRequests();
    } catch (e) {
      console.error('Failed to init IndexedDB:', e);
    }
  },

  loadPurchaseRequests: async () => {
    try {
      const requests = await idbService.getAllPurchaseRequests();
      const converted: PurchaseRequest[] = requests.map(r => ({
        id: r.id!,
        medicineId: r.medicineId,
        medicineName: r.medicineName,
        quantity: r.quantity,
        requestDate: r.requestDate,
        status: r.status,
        applicant: r.applicant,
      }));
      
      if (converted.length === 0) {
        const defaultRequests: PurchaseRequest[] = [
          { id: 'pr1', medicineId: 'm2', medicineName: '头孢克肟片', quantity: 100, requestDate: '2025-01-15', status: 'pending_director', applicant: '药房管理员' },
          { id: 'pr2', medicineId: 'm4', medicineName: '盐酸二甲双胍片', quantity: 150, requestDate: '2025-01-14', status: 'pending_pharmacy', applicant: '药房管理员' },
          { id: 'pr3', medicineId: 'm6', medicineName: '奥美拉唑肠溶胶囊', quantity: 80, requestDate: '2025-01-13', status: 'approved', applicant: '药房管理员' },
        ];
        for (const pr of defaultRequests) {
          await idbService.addPurchaseRequest(pr);
        }
        set({ purchaseRequests: defaultRequests });
      } else {
        set({ purchaseRequests: converted });
      }
    } catch (e) {
      console.error('Failed to load purchase requests:', e);
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setCurrentView: (view) => set({ currentView: view }),

  login: async (username, _password, _useFaceRecognition = false) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let user = mockUsers.find(u => u.name.includes(username));
    if (!user && (username === 'admin' || username === 'face_user')) {
      user = mockUsers[3];
    }
    if (user) {
      set({ currentUser: user, isLoggedIn: true });
      await get().initDB();
      get().startVitalSignsSimulation();
      return true;
    }
    return false;
  },

  logout: () => {
    get().stopVitalSignsSimulation();
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

  updateQueueCount: (deptId, delta) => {
    set(state => ({
      departments: state.departments.map(d => {
        if (d.id === deptId) {
          return { ...d, queueCount: Math.max(0, d.queueCount + delta) };
        }
        return d;
      })
    }));
  },

  updateDoctorPatients: (deptId, doctorId, delta) => {
    set(state => ({
      departments: state.departments.map(d => {
        if (d.id === deptId) {
          return {
            ...d,
            doctors: d.doctors.map(doc => {
              if (doc.id === doctorId) {
                return { ...doc, todayPatients: Math.max(0, doc.todayPatients + delta) };
              }
              return doc;
            })
          };
        }
        return d;
      })
    }));
  },

  updateBedVitalSigns: (bedId) => {
    set(state => ({
      beds: state.beds.map(b => {
        if (b.id === bedId && b.isOccupied) {
          const newHeartRate = 60 + Math.floor(Math.random() * 40);
          const newTemp = parseFloat((36 + Math.random() * 2).toFixed(1));
          const newSpO2 = 95 + Math.floor(Math.random() * 5);
          const isAbnormal = newHeartRate > 100 || newTemp > 38.5 || newSpO2 < 95;
          
          return {
            ...b,
            vitalSigns: {
              ...b.vitalSigns,
              heartRate: newHeartRate,
              temperature: newTemp,
              oxygenSaturation: newSpO2,
              lastUpdate: new Date().toISOString(),
            },
            isAbnormal,
          };
        }
        return b;
      })
    }));
  },

  setBedAbnormal: (bedId, abnormal) => {
    set(state => ({
      beds: state.beds.map(b => {
        if (b.id === bedId) {
          return { ...b, isAbnormal: abnormal };
        }
        return b;
      })
    }));
  },

  dischargePatient: (bedId) => {
    set(state => ({
      beds: state.beds.map(b => {
        if (b.id === bedId) {
          return {
            ...b,
            isOccupied: false,
            patient: null,
            isAbnormal: false,
            nursingLevel: 'normal',
          };
        }
        return b;
      })
    }));
  },

  admitPatient: (bedId, patient) => {
    set(state => ({
      beds: state.beds.map(b => {
        if (b.id === bedId) {
          return {
            ...b,
            isOccupied: true,
            patient: {
              id: `p_${Date.now()}`,
              ...patient,
            },
            isAbnormal: false,
          };
        }
        return b;
      })
    }));
  },

  addMedicineStock: (medicineId, amount) => {
    set(state => ({
      medicines: state.medicines.map(m => {
        if (m.id === medicineId) {
          const newStock = m.stock + amount;
          return {
            ...m,
            stock: newStock,
            isLowStock: newStock < m.safetyStock,
          };
        }
        return m;
      })
    }));
  },

  reduceMedicineStock: (medicineId, amount) => {
    set(state => ({
      medicines: state.medicines.map(m => {
        if (m.id === medicineId) {
          const newStock = Math.max(0, m.stock - amount);
          return {
            ...m,
            stock: newStock,
            isLowStock: newStock < m.safetyStock,
          };
        }
        return m;
      })
    }));
  },

  updateMedicineStock: (medicineId, newStock) => {
    set(state => ({
      medicines: state.medicines.map(m => {
        if (m.id === medicineId) {
          return {
            ...m,
            stock: Math.max(0, newStock),
            isLowStock: newStock < m.safetyStock,
          };
        }
        return m;
      })
    }));
  },

  approvePurchaseRequest: async (id, role) => {
    const request = get().purchaseRequests.find(pr => pr.id === id);
    if (!request) return;

    let newStatus = request.status;
    if (role === 'director' && request.status === 'pending_director') {
      newStatus = 'pending_vice';
    } else if (role === 'admin' && request.status === 'pending_vice') {
      newStatus = 'approved';
    }

    try {
      await idbService.updatePurchaseRequest(id, { status: newStatus });
      set(state => ({
        purchaseRequests: state.purchaseRequests.map(pr => {
          if (pr.id === id) {
            return { ...pr, status: newStatus };
          }
          return pr;
        })
      }));
      get().addNotification(`采购申请已${newStatus === 'approved' ? '批准' : '提交到下一审批'}`, 'success');
    } catch (e) {
      console.error('Failed to approve:', e);
    }
  },

  rejectPurchaseRequest: async (id, _role) => {
    try {
      await idbService.updatePurchaseRequest(id, { status: 'rejected' });
      set(state => ({
        purchaseRequests: state.purchaseRequests.map(pr => {
          if (pr.id === id) {
            return { ...pr, status: 'rejected' };
          }
          return pr;
        })
      }));
      get().addNotification('采购申请已拒绝', 'warning');
    } catch (e) {
      console.error('Failed to reject:', e);
    }
  },

  addPurchaseRequest: async (medicineId, quantity) => {
    const medicine = get().medicines.find(m => m.id === medicineId);
    if (medicine) {
      const newRequest: IDBRequest = {
        medicineId,
        medicineName: medicine.name,
        quantity,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending_pharmacy',
        applicant: get().currentUser?.name || '系统',
      };

      try {
        await idbService.addPurchaseRequest(newRequest);
        await get().loadPurchaseRequests();
        get().addNotification(`已生成采购申请: ${medicine.name}`, 'info');
      } catch (e) {
        console.error('Failed to add request:', e);
      }
    }
  },

  scheduleSurgery: (surgery, roomId) => {
    const room = get().operationRooms.find(r => r.id === roomId);
    if (!room) return false;
    
    const hasConflict = room.schedule.some(s => {
      if (s.status === 'cancelled' || s.status === 'completed') return false;
      return (surgery.startTime < s.endTime && surgery.endTime > s.startTime);
    });
    
    if (hasConflict) {
      get().addNotification(`手术室${room.name}档期冲突，请调整时间`, 'warning');
      return false;
    }
    
    const newSurgery = { ...surgery, id: `s_${Date.now()}`, roomId, status: 'scheduled' as const };
    set(state => ({
      operationRooms: state.operationRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, schedule: [...r.schedule, newSurgery] };
        }
        return r;
      })
    }));
    get().addNotification(`手术已预约到${room.name}`, 'success');
    return true;
  },

  cancelSurgery: (roomId, surgeryId) => {
    set(state => ({
      operationRooms: state.operationRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            schedule: r.schedule.map(s => s.id === surgeryId ? { ...s, status: 'cancelled' as const } : s)
          };
        }
        return r;
      })
    }));
  },

  setRoomStatus: (roomId, status) => {
    set(state => ({
      operationRooms: state.operationRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, status };
        }
        return r;
      })
    }));
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
    const bin = get().wasteBins.find(w => w.id === binId);
    get().addNotification(`垃圾桶已清运: ${bin?.location}`, 'success');
  },

  updateWasteLevel: (binId, level) => {
    set(state => ({
      wasteBins: state.wasteBins.map(wb => {
        if (wb.id === binId) {
          const newLevel = Math.max(0, Math.min(100, level));
          return { ...wb, fillLevel: newLevel, needsPickup: newLevel >= 80 };
        }
        return wb;
      })
    }));
  },

  addEmergencyPatient: (patient) => {
    const newPatient = { ...patient, id: `ep_${Date.now()}` };
    set(state => ({
      emergencyPatients: [...state.emergencyPatients, newPatient]
    }));
    get().addNotification(`新急诊患者已登记: ${patient.name}`, 'info');
  },

  updateEmergencyPatientStatus: (id, status) => {
    set(state => ({
      emergencyPatients: state.emergencyPatients.map(p => {
        if (p.id === id) {
          return { ...p, status };
        }
        return p;
      })
    }));
  },

  removeEmergencyPatient: (id) => {
    const patient = get().emergencyPatients.find(p => p.id === id);
    set(state => ({
      emergencyPatients: state.emergencyPatients.filter(p => p.id !== id)
    }));
    if (patient) {
      get().addNotification(`患者已离院: ${patient.name}`, 'success');
    }
  },

  updateInstrumentPackStatus: (id, status) => {
    set(state => ({
      instrumentPacks: state.instrumentPacks.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status,
            lastCleanTime: status === 'cleaning' ? new Date().toISOString() : p.lastCleanTime,
            isOverdue: false
          };
        }
        return p;
      })
    }));
    const pack = get().instrumentPacks.find(p => p.id === id);
    if (pack) {
      get().addNotification(`器械包状态更新: ${pack.name} -> ${status}`, 'info');
    }
  },

  activateEmergencyPlan: (id) => {
    const plan = get().emergencyPlans.find(p => p.id === id);
    if (plan) {
      const availableBeds = get().beds.filter(b => !b.isOccupied).slice(0, 10).map(b => b.id);
      const availableRooms = get().operationRooms.filter(r => r.status === 'available').map(r => r.id);
      const staff = mockUsers.filter(u => u.role !== 'nurse').map(u => u.id);

      const movements: ResourceMovement[] = [
        ...availableBeds.slice(0, 5).map((_bedId, i) => ({
          id: `move_bed_${i}`,
          type: 'bed' as const,
          from: [0, 12, -12] as [number, number, number],
          to: [15, 8, -8] as [number, number, number],
          progress: 0,
        })),
        ...availableRooms.slice(0, 2).map((_roomId, i) => ({
          id: `move_staff_${i}`,
          type: 'staff' as const,
          from: [0, 8, 8] as [number, number, number],
          to: [15, 8, -8] as [number, number, number],
          progress: 0,
        })),
      ];

      set(state => ({
        activeEmergencyPlan: {
          ...plan,
          isActive: true,
          startTime: new Date().toISOString(),
          involvedBeds: availableBeds,
          involvedRooms: availableRooms,
          involvedStaff: staff,
        },
        emergencyPlans: state.emergencyPlans.map(p => p.id === id ? { ...p, isActive: true } : p),
        resourceMovements: movements,
      }));
      get().addNotification(`🚨 应急预案已启动: ${plan.name}`, 'danger');
    }
  },

  deactivateEmergencyPlan: () => {
    const plan = get().activeEmergencyPlan;
    if (plan) {
      set(state => ({
        activeEmergencyPlan: null,
        emergencyPlans: state.emergencyPlans.map(p => p.id === plan.id ? { ...p, isActive: false } : p),
        resourceMovements: [],
      }));
      get().addNotification(`应急预案已解除: ${plan.name}`, 'info');
    }
  },

  addNotification: (message, type = 'info') => {
    const id = `notif_${Date.now()}`;
    set(state => ({
      notifications: [...state.notifications, { id, message, type, timestamp: new Date().toISOString() }]
    }));
    
    setTimeout(() => {
      get().clearNotification(id);
    }, 8000);
  },

  clearNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  startVitalSignsSimulation: () => {
    if (vitalSignsInterval) return;
    
    vitalSignsInterval = window.setInterval(() => {
      const beds = get().beds;
      const randomBed = beds[Math.floor(Math.random() * beds.length)];
      if (randomBed && randomBed.isOccupied) {
        get().updateBedVitalSigns(randomBed.id);
        
        const updatedBed = get().beds.find(b => b.id === randomBed.id);
        if (updatedBed?.isAbnormal && !randomBed.isAbnormal) {
          get().addNotification(
            `⚠️ 生命体征异常: ${updatedBed.roomNumber}室${updatedBed.bedNumber}床 - ${updatedBed.patient?.name || '患者'}`,
            'danger'
          );
        }
      }
    }, 5000);

    wsSimulationInterval = window.setInterval(() => {
      set({ wsConnected: true });
    }, 1000);

    set({ wsConnected: true });
  },

  stopVitalSignsSimulation: () => {
    if (vitalSignsInterval) {
      clearInterval(vitalSignsInterval);
      vitalSignsInterval = null;
    }
    if (wsSimulationInterval) {
      clearInterval(wsSimulationInterval);
      wsSimulationInterval = null;
    }
    set({ wsConnected: false });
  },

  generateDailyReport: (date) => {
    const state = get();
    return {
      date,
      outpatients: state.departments.reduce((sum, d) => sum + d.queueCount + d.doctors.reduce((s, doc) => s + doc.todayPatients, 0), 0),
      surgeries: state.operationRooms.reduce((sum, r) => sum + r.schedule.filter(s => s.status === 'completed' || s.status === 'in_progress').length, 0),
      pharmacyTurnover: state.medicines.reduce((sum, m) => sum + m.stock * m.price, 0),
      emergencyCount: state.emergencyPatients.length,
      emergencyResolved: state.emergencyPatients.filter(p => p.status === 'transferred').length,
      avgWaitTime: Math.floor(Math.random() * 30) + 15,
      bedOccupancyRate: parseFloat((state.beds.filter(b => b.isOccupied).length / state.beds.length).toFixed(2)),
    };
  },
}));
