import { describe, it, expect } from 'vitest';
import { unflatten } from '@/lib/unflatten';

describe('unflatten', () => {
  it('returns empty object for empty input', () => {
    expect(unflatten({})).toEqual({});
  });

  it('returns same key for single-segment key', () => {
    expect(unflatten({ hello: 'world' })).toEqual({ hello: 'world' });
  });

  it('nests two-segment key into nested object', () => {
    expect(unflatten({ 'a.b': 'value' })).toEqual({ a: { b: 'value' } });
  });

  it('nests three-segment key deeply', () => {
    expect(unflatten({ 'a.b.c': 42 })).toEqual({ a: { b: { c: 42 } } });
  });

  it('merges multiple keys sharing a prefix', () => {
    expect(unflatten({ 'a.x': 1, 'a.y': 2 })).toEqual({ a: { x: 1, y: 2 } });
  });

  it('handles mixed nesting depths', () => {
    expect(unflatten({ top: 'flat', 'nested.key': 'deep' })).toEqual({
      top: 'flat',
      nested: { key: 'deep' },
    });
  });

  it('preserves non-string values', () => {
    expect(unflatten({ 'a.b': null, 'a.c': [1, 2, 3] })).toEqual({
      a: { b: null, c: [1, 2, 3] },
    });
  });
});
