import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInternalBaseUrl } from '@/utils/internalBaseUrl';

describe('getInternalBaseUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns INTERNAL_BASE_URL verbatim when set', () => {
    vi.stubEnv('INTERNAL_BASE_URL', 'http://internal-host:8080');
    expect(getInternalBaseUrl()).toBe('http://internal-host:8080');
  });

  it('strips trailing slashes from INTERNAL_BASE_URL', () => {
    vi.stubEnv('INTERNAL_BASE_URL', 'http://internal-host:8080/');
    expect(getInternalBaseUrl()).toBe('http://internal-host:8080');
  });

  it('strips multiple trailing slashes from INTERNAL_BASE_URL', () => {
    vi.stubEnv('INTERNAL_BASE_URL', 'http://internal-host:8080///');
    expect(getInternalBaseUrl()).toBe('http://internal-host:8080');
  });

  it('trims surrounding whitespace from INTERNAL_BASE_URL', () => {
    vi.stubEnv('INTERNAL_BASE_URL', '  http://internal-host:8080  ');
    expect(getInternalBaseUrl()).toBe('http://internal-host:8080');
  });

  it('falls back to loopback with PORT when INTERNAL_BASE_URL is empty string', () => {
    vi.stubEnv('INTERNAL_BASE_URL', '');
    vi.stubEnv('PORT', '80');
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:80');
  });

  it('defaults to http://127.0.0.1:80 when PORT=80 (production container)', () => {
    vi.stubEnv('PORT', '80');
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:80');
  });

  it('defaults to http://127.0.0.1:3000 when PORT is unset (next dev / next start default)', () => {
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:3000');
  });

  it('honors a custom PORT', () => {
    vi.stubEnv('PORT', '4000');
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:4000');
  });

  it('falls back to 3000 and warns when PORT is not a valid number', () => {
    vi.stubEnv('PORT', 'foo');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:3000');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PORT="foo" is not a valid port number'));
    warn.mockRestore();
  });

  it('falls back to 3000 and warns when PORT is out of range', () => {
    vi.stubEnv('PORT', '99999');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getInternalBaseUrl()).toBe('http://127.0.0.1:3000');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PORT="99999" is not a valid port number'));
    warn.mockRestore();
  });
});
