export interface StorageItem {
  key: string;
  value: any;
  expiresAt?: number;
}

/**
 * Cross-platform storage adapter
 * Works with AsyncStorage (React Native) or localStorage (Web)
 */
export class StorageAdapter {
  private storage: any; // AsyncStorage or localStorage
  private isWeb: boolean;

  constructor(storage?: any) {
    // Auto-detect environment
    this.isWeb = typeof window !== 'undefined';
    
    if (storage) {
      this.storage = storage;
    } else if (this.isWeb) {
      this.storage = localStorage;
    } else {
      // React Native - will be injected
      throw new Error('Storage adapter requires AsyncStorage for React Native');
    }
  }

  async setItem(key: string, value: any, expiresIn?: number): Promise<void> {
    try {
      const item: StorageItem = {
        key,
        value,
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };

      const serialized = JSON.stringify(item);

      if (this.isWeb) {
        localStorage.setItem(key, serialized);
      } else {
        await this.storage.setItem(key, serialized);
      }
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      let serialized: string | null;

      if (this.isWeb) {
        serialized = localStorage.getItem(key);
      } else {
        serialized = await this.storage.getItem(key);
      }

      if (!serialized) return null;

      const item: StorageItem = JSON.parse(serialized);

      // Check expiration
      if (item.expiresAt && item.expiresAt < Date.now()) {
        await this.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.removeItem(key);
      } else {
        await this.storage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.clear();
      } else {
        await this.storage.clear();
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.isWeb) {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        return keys;
      } else {
        return await this.storage.getAllKeys();
      }
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}

export let storage: StorageAdapter;

export function initStorage(asyncStorage?: any): StorageAdapter {
  storage = new StorageAdapter(asyncStorage);
  return storage;
}
