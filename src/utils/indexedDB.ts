const DB_NAME = 'SmartHospitalDB';
const DB_VERSION = 1;
const STORE_NAMES = {
  PURCHASE_REQUESTS: 'purchaseRequests',
  OPERATIONS: 'operations',
  NOTIFICATIONS: 'notifications',
  MEDICINES: 'medicines',
};

interface IDBRequest {
  id?: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  requestDate: string;
  status: 'pending_pharmacy' | 'pending_director' | 'pending_vice' | 'approved' | 'rejected';
  applicant: string;
  approver1?: string;
  approver2?: string;
  approveTime1?: string;
  approveTime2?: string;
  remark?: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAMES.PURCHASE_REQUESTS)) {
          const store = db.createObjectStore(STORE_NAMES.PURCHASE_REQUESTS, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('requestDate', 'requestDate', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.OPERATIONS)) {
          const store = db.createObjectStore(STORE_NAMES.OPERATIONS, { keyPath: 'id' });
          store.createIndex('roomId', 'roomId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.NOTIFICATIONS)) {
          const store = db.createObjectStore(STORE_NAMES.NOTIFICATIONS, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.MEDICINES)) {
          const store = db.createObjectStore(STORE_NAMES.MEDICINES, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async addPurchaseRequest(request: IDBRequest): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const req = store.add({ ...request, id: request.id || `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAllPurchaseRequests(): Promise<IDBRequest[]> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as IDBRequest[]);
      req.onerror = () => reject(req.error);
    });
  }

  async getPurchaseRequestsByStatus(status: string): Promise<IDBRequest[]> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const index = store.index('status');
      const req = index.getAll(status);
      req.onsuccess = () => resolve(req.result as IDBRequest[]);
      req.onerror = () => reject(req.error);
    });
  }

  async updatePurchaseRequest(id: string, updates: Partial<IDBRequest>): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const getReq = store.get(id);
      
      getReq.onsuccess = () => {
        const existing = getReq.result as IDBRequest;
        if (!existing) {
          reject(new Error('Request not found'));
          return;
        }
        const updated = { ...existing, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deletePurchaseRequest(id: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll(): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PURCHASE_REQUESTS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PURCHASE_REQUESTS);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const idbService = new IndexedDBService();
export type { IDBRequest };
