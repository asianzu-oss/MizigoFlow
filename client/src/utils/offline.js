import { openDB } from 'idb';

const DB_NAME = 'mizigoflow_offline';
const DB_VERSION = 1;

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for pending gate check-ins
      if (!db.objectStoreNames.contains('pending_checkins')) {
        db.createObjectStore('pending_checkins', { keyPath: 'id', autoIncrement: true });
      }

      // Store for pending GRNs
      if (!db.objectStoreNames.contains('pending_grns')) {
        db.createObjectStore('pending_grns', { keyPath: 'id', autoIncrement: true });
      }

      // Store for cached vehicles
      if (!db.objectStoreNames.contains('cached_vehicles')) {
        db.createObjectStore('cached_vehicles', { keyPath: 'id' });
      }

      // Store for cached drivers
      if (!db.objectStoreNames.contains('cached_drivers')) {
        db.createObjectStore('cached_drivers', { keyPath: 'id' });
      }

      // Store for cached products
      if (!db.objectStoreNames.contains('cached_products')) {
        db.createObjectStore('cached_products', { keyPath: 'id' });
      }
    },
  });
  return db;
};

// Save pending check-in when offline
export const savePendingCheckIn = async (data) => {
  const db = await initDB();
  await db.add('pending_checkins', { ...data, timestamp: new Date().toISOString() });
};

// Save pending GRN when offline
export const savePendingGRN = async (data) => {
  const db = await initDB();
  await db.add('pending_grns', { ...data, timestamp: new Date().toISOString() });
};

// Get all pending check-ins
export const getPendingCheckIns = async () => {
  const db = await initDB();
  return db.getAll('pending_checkins');
};

// Get all pending GRNs
export const getPendingGRNs = async () => {
  const db = await initDB();
  return db.getAll('pending_grns');
};

// Clear synced check-in
export const clearPendingCheckIn = async (id) => {
  const db = await initDB();
  await db.delete('pending_checkins', id);
};

// Clear synced GRN
export const clearPendingGRN = async (id) => {
  const db = await initDB();
  await db.delete('pending_grns', id);
};

// Cache vehicles for offline use
export const cacheVehicles = async (vehicles) => {
  const db = await initDB();
  const tx = db.transaction('cached_vehicles', 'readwrite');
  await tx.store.clear();
  for (const vehicle of vehicles) {
    await tx.store.add(vehicle);
  }
  await tx.done;
};

// Cache drivers for offline use
export const cacheDrivers = async (drivers) => {
  const db = await initDB();
  const tx = db.transaction('cached_drivers', 'readwrite');
  await tx.store.clear();
  for (const driver of drivers) {
    await tx.store.add(driver);
  }
  await tx.done;
};

// Cache products for offline use
export const cacheProducts = async (products) => {
  const db = await initDB();
  const tx = db.transaction('cached_products', 'readwrite');
  await tx.store.clear();
  for (const product of products) {
    await tx.store.add(product);
  }
  await tx.done;
};

// Get cached vehicles
export const getCachedVehicles = async () => {
  const db = await initDB();
  return db.getAll('cached_vehicles');
};

// Get cached drivers
export const getCachedDrivers = async () => {
  const db = await initDB();
  return db.getAll('cached_drivers');
};

// Get cached products
export const getCachedProducts = async () => {
  const db = await initDB();
  return db.getAll('cached_products');
};

// Check if online
export const isOnline = () => navigator.onLine;

// Sync pending data when back online
export const syncPendingData = async (api) => {
  if (!isOnline()) return;

  const pendingCheckIns = await getPendingCheckIns();
  for (const checkIn of pendingCheckIns) {
    try {
      const { id, timestamp, ...data } = checkIn;
      await api.post('/gates/checkin', data);
      await clearPendingCheckIn(id);
      console.log('Synced check-in:', id);
    } catch (error) {
      console.error('Failed to sync check-in:', error);
    }
  }

  const pendingGRNs = await getPendingGRNs();
  for (const grn of pendingGRNs) {
    try {
      const { id, timestamp, ...data } = grn;
      await api.post('/inventory/grn', data);
      await clearPendingGRN(id);
      console.log('Synced GRN:', id);
    } catch (error) {
      console.error('Failed to sync GRN:', error);
    }
  }
};