import { debugLog } from '@/lib/debug';

interface StoredEntry<V> {
  value: V;
  bytes: number;
  lastAccessedAt: number;
}

export interface ByteBudgetLruCacheOptions<V> {
  name: string;
  maxBytes: number;
  idleTtlMs: number;
  sizeOf: (value: V) => number;
}

// LRU cache bounded by total bytes rather than entry count.
export class ByteBudgetLruCache<V> {
  private readonly store = new Map<string, StoredEntry<V>>();
  private total = 0;

  constructor(private readonly opts: ByteBudgetLruCacheOptions<V>) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.lastAccessedAt > this.opts.idleTtlMs) {
      this.drop(key, entry);
      return undefined;
    }
    entry.lastAccessedAt = Date.now();
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  set(key: string, value: V): void {
    const bytes = this.opts.sizeOf(value);
    const existing = this.store.get(key);
    if (existing) this.total -= existing.bytes;
    this.store.delete(key);
    this.store.set(key, { value, bytes, lastAccessedAt: Date.now() });
    this.total += bytes;
    this.evictUntilUnderBudget();
    debugLog('cache', `${this.opts.name}.set`, {
      key,
      bytes,
      totalBytes: this.total,
      entries: this.store.size,
    });
  }

  clear(): void {
    this.store.clear();
    this.total = 0;
  }

  get totalBytes(): number {
    return this.total;
  }

  get size(): number {
    return this.store.size;
  }

  private drop(key: string, entry: StoredEntry<V>): void {
    this.total -= entry.bytes;
    this.store.delete(key);
  }

  private evictUntilUnderBudget(): void {
    while (this.total > this.opts.maxBytes && this.store.size > 0) {
      const oldestKey = this.store.keys().next().value as string;
      const evicted = this.store.get(oldestKey)!;
      this.drop(oldestKey, evicted);
      debugLog('cache', `${this.opts.name}.evict`, {
        key: oldestKey,
        bytes: evicted.bytes,
        totalBytes: this.total,
      });
    }
  }
}
