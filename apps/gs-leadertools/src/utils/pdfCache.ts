const PDF_CACHE_MAX_ENTRIES = 300;
const PDF_CACHE_IDLE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface PdfCacheEntry {
  buf: Buffer;
  filename: string;
}

interface StoredEntry extends PdfCacheEntry {
  lastAccessedAt: number;
}

class PdfLruCache {
  private readonly store = new Map<string, StoredEntry>();
  private _totalBytes = 0;

  constructor(private readonly name: string) {}

  get(key: string): PdfCacheEntry | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.lastAccessedAt > PDF_CACHE_IDLE_TTL_MS) {
      this._totalBytes -= entry.buf.byteLength;
      this.store.delete(key);
      return undefined;
    }
    entry.lastAccessedAt = Date.now();
    return entry;
  }

  set(key: string, value: PdfCacheEntry): void {
    const existing = this.store.get(key);
    if (existing) this._totalBytes -= existing.buf.byteLength;
    this.store.set(key, { ...value, lastAccessedAt: Date.now() });
    this._totalBytes += value.buf.byteLength;
    this.evictLruIfNeeded();
    console.log(
      JSON.stringify({
        event: 'pdf.cache.set',
        cache: this.name,
        key,
        bytes: value.buf.byteLength,
        totalBytes: this._totalBytes,
        entries: this.store.size,
      })
    );
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() - entry.lastAccessedAt > PDF_CACHE_IDLE_TTL_MS) {
      this._totalBytes -= entry.buf.byteLength;
      this.store.delete(key);
      return false;
    }
    return true;
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
    this._totalBytes = 0;
  }

  private evictLruIfNeeded(): void {
    if (this.store.size <= PDF_CACHE_MAX_ENTRIES) return;
    let oldestKey: string | undefined;
    let oldestTime = Infinity;
    for (const [k, v] of this.store) {
      if (v.lastAccessedAt < oldestTime) {
        oldestTime = v.lastAccessedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) {
      const evicted = this.store.get(oldestKey)!;
      this._totalBytes -= evicted.buf.byteLength;
      this.store.delete(oldestKey);
      console.log(JSON.stringify({ event: 'pdf.cache.evict.lru', cache: this.name, key: oldestKey }));
    }
  }
}

export const pdfBadgeCache = new PdfLruCache('badge');
export const pdfActivityCache = new PdfLruCache('activity');
export const pdfAwardCache = new PdfLruCache('award');

export const clearPdfCache = (): void => {
  pdfBadgeCache.clear();
  pdfActivityCache.clear();
  pdfAwardCache.clear();
};
