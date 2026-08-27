import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/imageProxyCore', () => ({
  fetchUpstreamImage: vi.fn(),
  runSharpTransform: vi.fn(),
}));

import { GET } from '@/app/img/[...path]/route';
import { fetchUpstreamImage, runSharpTransform } from '@/lib/imageProxyCore';
import { clearImageTransformCache } from '@/lib/imageTransformCache';

const fetchMock = vi.mocked(fetchUpstreamImage);
const sharpMock = vi.mocked(runSharpTransform);

// _req is unused by the handler.
const call = (path: string[]) => GET({} as never, { params: Promise.resolve({ path }) });

beforeEach(() => {
  process.env.AEM_API = 'https://aem.test/';
  process.env.AEM_DAM_PATH = 'content/dam/x';
  fetchMock.mockReset();
  sharpMock.mockReset();
  clearImageTransformCache();
});

afterEach(() => clearImageTransformCache());

describe('GET /img/[...path]', () => {
  it('returns 503 when the proxy is not configured', async () => {
    delete process.env.AEM_API;
    const res = await call(['w100', 'q75', 'a.png']);
    expect(res.status).toBe(503);
  });

  it('rejects path traversal with 400', async () => {
    const res = await call(['w100', 'q75', '..', 'etc', 'passwd']);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards a non-200 upstream status', async () => {
    fetchMock.mockResolvedValue({ status: 404 });
    const res = await call(['w100', 'q75', 'missing.png']);
    expect(res.status).toBe(404);
  });

  it('transforms a raster image, then serves the second request from cache', async () => {
    fetchMock.mockResolvedValue({ status: 200, buffer: Buffer.from('master'), contentType: 'image/png' });
    sharpMock.mockResolvedValue({ body: Buffer.from('webp-bytes'), contentType: 'image/webp' });

    const first = await call(['w828', 'q75', 'badge.png']);
    expect(first.status).toBe(200);
    expect(first.headers.get('content-type')).toBe('image/webp');
    expect(first.headers.get('cache-control')).toContain('max-age=86400');

    const second = await call(['w828', 'q75', 'badge.png']);
    expect(second.status).toBe(200);

    // Cache hit: encode runs once, and the second request skips the upstream fetch.
    expect(sharpMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes SVGs through without transforming', async () => {
    fetchMock.mockResolvedValue({ status: 200, buffer: Buffer.from('<svg/>'), contentType: 'image/svg+xml' });
    const res = await call(['w828', 'q75', 'logo.svg']);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/svg+xml');
    expect(sharpMock).not.toHaveBeenCalled();
  });
});
