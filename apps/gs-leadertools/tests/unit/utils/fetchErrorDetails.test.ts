import { describe, expect, it } from 'vitest';
import { fetchErrorDetails } from '@/utils/fetchErrorDetails';

describe('fetchErrorDetails', () => {
  it('extracts message from a plain Error', () => {
    expect(fetchErrorDetails(new Error('boom'))).toEqual({
      message: 'boom',
      code: undefined,
      syscall: undefined,
      address: undefined,
      port: undefined,
    });
  });

  it('extracts cause fields from an undici-style fetch failure', () => {
    const cause = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:3000'), {
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3000,
    });
    const err = Object.assign(new TypeError('fetch failed'), { cause });

    expect(fetchErrorDetails(err)).toEqual({
      message: 'fetch failed',
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3000,
    });
  });

  it('extracts code from a TLS-layer cause (no address/port)', () => {
    const cause = Object.assign(new Error('wrong version number'), { code: 'ERR_SSL_WRONG_VERSION_NUMBER' });
    const err = Object.assign(new TypeError('fetch failed'), { cause });

    expect(fetchErrorDetails(err)).toEqual({
      message: 'fetch failed',
      code: 'ERR_SSL_WRONG_VERSION_NUMBER',
      syscall: undefined,
      address: undefined,
      port: undefined,
    });
  });

  it('handles undefined input', () => {
    expect(fetchErrorDetails(undefined)).toEqual({
      message: 'undefined',
      code: undefined,
      syscall: undefined,
      address: undefined,
      port: undefined,
    });
  });

  it('handles non-Error input by stringifying', () => {
    expect(fetchErrorDetails('something exploded')).toEqual({
      message: 'something exploded',
      code: undefined,
      syscall: undefined,
      address: undefined,
      port: undefined,
    });
  });
});
