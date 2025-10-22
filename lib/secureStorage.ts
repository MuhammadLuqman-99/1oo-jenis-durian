/**
 * Secure Storage Utility with Encryption
 * Provides encrypted localStorage operations for sensitive data
 */

// Simple XOR-based encryption (for demo - use crypto-js for production)
const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'durian-farm-2025-secure';

/**
 * Simple encryption using XOR cipher
 * Note: For production, use a proper encryption library like crypto-js
 */
function encryptData(data: string): string {
  try {
    const encoded = btoa(data); // Base64 encode first
    let encrypted = '';

    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }

    return btoa(encrypted); // Base64 encode the encrypted string
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Fallback to unencrypted if error
  }
}

/**
 * Simple decryption using XOR cipher
 */
function decryptData(encrypted: string): string {
  try {
    const decoded = atob(encrypted); // Base64 decode first
    let decrypted = '';

    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }

    return atob(decrypted); // Base64 decode to get original data
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted; // Fallback to encrypted data if error
  }
}

/**
 * Securely store data in localStorage with encryption
 */
export function setSecureItem(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const serialized = JSON.stringify(value);
    const encrypted = encryptData(serialized);
    localStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error(`Error storing secure item ${key}:`, error);
    return false;
  }
}

/**
 * Retrieve and decrypt data from localStorage
 */
export function getSecureItem<T>(key: string, defaultValue: T | null = null): T | null {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;

    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error(`Error retrieving secure item ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove item from localStorage
 */
export function removeSecureItem(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing secure item ${key}:`, error);
    return false;
  }
}

/**
 * Clear all secure storage
 */
export function clearSecureStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
}

/**
 * Check if key exists in secure storage
 */
export function hasSecureItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}

/**
 * Migration utility: Convert plain localStorage to encrypted
 */
export function migrateToSecureStorage(keys: string[]): void {
  if (typeof window === 'undefined') return;

  keys.forEach(key => {
    try {
      const plainValue = localStorage.getItem(key);
      if (plainValue) {
        // Check if already encrypted (starts with valid base64)
        try {
          JSON.parse(decryptData(plainValue));
          // Already encrypted, skip
          return;
        } catch {
          // Not encrypted, needs migration
          const parsed = JSON.parse(plainValue);
          setSecureItem(key, parsed);
          console.log(`Migrated ${key} to secure storage`);
        }
      }
    } catch (error) {
      console.error(`Error migrating ${key}:`, error);
    }
  });
}

/**
 * Storage with automatic expiry
 */
interface StorageItem<T> {
  value: T;
  expiresAt: number | null;
}

export function setSecureItemWithExpiry<T>(
  key: string,
  value: T,
  expiryMinutes?: number
): boolean {
  const item: StorageItem<T> = {
    value,
    expiresAt: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null,
  };

  return setSecureItem(key, item);
}

export function getSecureItemWithExpiry<T>(key: string): T | null {
  const item = getSecureItem<StorageItem<T>>(key);

  if (!item) return null;

  // Check if expired
  if (item.expiresAt && Date.now() > item.expiresAt) {
    removeSecureItem(key);
    return null;
  }

  return item.value;
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  used: number;
  available: number;
  percentage: number;
} {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, percentage: 0 };
  }

  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  const available = 5 * 1024 * 1024; // ~5MB typical limit
  const percentage = (used / available) * 100;

  return {
    used,
    available,
    percentage: Math.round(percentage * 100) / 100,
  };
}
