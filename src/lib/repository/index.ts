import { IFinanceRepository } from './FinanceRepository';
import { IndexedDbRepository } from './IndexedDbRepository';
import { Capacitor } from '@capacitor/core';

let instance: IFinanceRepository | null = null;

export function getFinanceRepository(): IFinanceRepository {
  if (!instance) {
    // When packaged as native Android APK, Capacitor is detected
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      // In native mode, IndexedDb is also supported in WebView, or we can use Capacitor SQLite plugin
      // For standard Capacitor Android WebView, IndexedDB provides ACID, persistent offline storage backed by Android SQLite/LevelDB
      instance = new IndexedDbRepository();
    } else {
      // Web preview and PWA
      instance = new IndexedDbRepository();
    }
  }
  return instance;
}

export const db = getFinanceRepository();
export * from './FinanceRepository';
