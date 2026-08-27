import { afterEach, describe, expect, it, vi } from 'vitest';
import { ByteBudgetLruCache } from '@/lib/byteBudgetLruCache';

const makeCache = (maxBytes: number, idleTtlMs = 1000) =>
  new ByteBudgetLruCache<Buffer>({
    name: 'test',
    maxBytes,
    idleTtlMs,
    sizeOf: b => b.byteLength,
  });

describe('ByteBudgetLruCache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves a value and tracks total bytes', () => {
    const cache = makeCache(100);
    cache.set('a', Buffer.alloc(10));
    expect(cache.get('a')?.byteLength).toBe(10);
    expect(cache.totalBytes).toBe(10);
    expect(cache.size).toBe(1);
  });

  it('returns undefined for a missing key', () => {
    expect(makeCache(100).get('nope')).toBeUndefined();
  });

  it('evicts the least-recently-used entry when over the byte budget', () => {
    const cache = makeCache(30);
    cache.set('a', Buffer.alloc(10));
    cache.set('b', Buffer.alloc(10));
    cache.set('c', Buffer.alloc(10)); // 30, at budget
    cache.get('a'); // a becomes most-recently-used
    cache.set('d', Buffer.alloc(10)); // 40 > 30 -> evict LRU (b)

    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBeDefined();
    expect(cache.get('c')).toBeDefined();
    expect(cache.get('d')).toBeDefined();
    expect(cache.totalBytes).toBe(30);
  });

  it('evicts by bytes not entry count (one big entry evicts several small ones)', () => {
    const cache = makeCache(100);
    cache.set('s1', Buffer.alloc(20));
    cache.set('s2', Buffer.alloc(20));
    cache.set('s3', Buffer.alloc(20)); // 60
    cache.set('big', Buffer.alloc(80)); // 140 > 100 -> evict s1, then s2 -> 100

    expect(cache.get('s1')).toBeUndefined();
    expect(cache.get('s2')).toBeUndefined();
    expect(cache.get('s3')).toBeDefined();
    expect(cache.get('big')).toBeDefined();
    expect(cache.totalBytes).toBe(100);
  });

  it('adjusts total bytes when overwriting an existing key', () => {
    const cache = makeCache(100);
    cache.set('a', Buffer.alloc(10));
    cache.set('a', Buffer.alloc(30));
    expect(cache.totalBytes).toBe(30);
    expect(cache.size).toBe(1);
  });

  it('expires an entry after the idle TTL elapses', () => {
    vi.useFakeTimers();
    const cache = makeCache(100, 1000);
    cache.set('a', Buffer.alloc(10));
    vi.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.totalBytes).toBe(0);
  });

  it('keeps an entry alive while it is accessed within the TTL', () => {
    vi.useFakeTimers();
    const cache = makeCache(100, 1000);
    cache.set('a', Buffer.alloc(10));
    vi.advanceTimersByTime(800);
    expect(cache.get('a')).toBeDefined(); // refreshes lastAccessedAt
    vi.advanceTimersByTime(800);
    expect(cache.get('a')).toBeDefined();
  });

  it('clear() empties the cache and resets total bytes', () => {
    const cache = makeCache(100);
    cache.set('a', Buffer.alloc(10));
    cache.set('b', Buffer.alloc(10));
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.totalBytes).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });
});
