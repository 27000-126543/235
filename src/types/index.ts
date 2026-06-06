export type UserRole = 'nurse' | 'doctor' | 'director' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  queueCount: number;
  openWindows: number;
  maxWindows: number;
  doctors: Doctor[];
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: string;
  isOnDuty: boolean;
  todayPatients: number;
}

export interface Bed {
  id: string;
  roomNumber: string;
  bedNumber: string;
  floor: number;
  patient: Patient | null;
  isOccupied: boolean;
  nursingLevel: 'normal' | 'secondary' | 'primary' | 'critical';
  vitalSigns: VitalSigns;
  isAbnormal: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  diagnosis: string;
  admissionDate: string;
}

export interface VitalSigns {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  lastUpdate: string;
}

export interface EmergencyPatient {
  id: string;
  name: string;
  age: number;
  triageLevel: 'red' | 'yellow' | 'green';
  condition: string;
  arrivalTime: string;
  assignedArea: string;
  status: 'waiting' | 'treating' | 'transferred';
}

export interface Medicine {
  id: string;
  name: string;
  specification: string;
  manufacturer: string;
  stock: number;
  safetyStock: number;
  unit: string;
  expiryDate: string;
  price: number;
  isLowStock: boolean;
  isExpiringSoon: boolean;
}

export interface PurchaseRequest {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  requestDate: string;
  status: 'pending_pharmacy' | 'pending_director' | 'pending_vice' | 'approved' | 'rejected';
  applicant: string;
}

export interface OperationRoom {
  id: string;
  name: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  currentSurgery: Surgery | null;
  schedule: Surgery[];
}

export interface Surgery {
  id: string;
  patientName: string;
  surgeryName: string;
  surgeon: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  roomId: string;
}

export interface InstrumentPack {
  id: string;
  name: string;
  type: string;
  status: 'cleaning' | 'disinfecting' | 'packaging' | 'ready' | 'in_use';
  lastCleanTime: string;
  cleaningDuration: number;
  isOverdue: boolean;
}

export interface WasteBin {
  id: string;
  location: string;
  type: 'infectious' | 'pathological' | 'chemical' | 'ordinary';
  fillLevel: number;
  lastEmptyTime: string;
  needsPickup: boolean;
}

export interface EmergencyPlan {
  id: string;
  name: string;
  type: 'fire' | 'infectious' | 'mass_casualty' | 'power_outage' | 'other';
  isActive: boolean;
  startTime?: string;
  involvedBeds: string[];
  involvedRooms: string[];
  involvedStaff: string[];
}

export interface DailyReport {
  date: string;
  outpatients: number;
  surgeries: number;
  pharmacyTurnover: number;
  emergencyCount: number;
  emergencyResolved: number;
  avgWaitTime: number;
  bedOccupancyRate: number;
}

export type AreaType = 'outpatient' | 'inpatient' | 'emergency' | 'pharmacy' | 'operating' | 'cssd' | 'waste';
