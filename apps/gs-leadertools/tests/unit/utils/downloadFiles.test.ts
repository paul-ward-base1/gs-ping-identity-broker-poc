import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// `vi.hoisted` is the repo convention for module mocks (see awardLoader.test.ts):
// the mock fn must be hoisted so vi.mock's factory can reference it.
const { clickTrackerMock } = vi.hoisted(() => ({ clickTrackerMock: vi.fn() }));
vi.mock('@/utils/gtmTracker', () => ({ clickTracker: clickTrackerMock }));

interface FakeAnchor {
  href: string;
  download: string;
  rel: string;
  style: { display: string };
  click: ReturnType<typeof vi.fn>;
}

describe('downloadFiles', () => {
  let anchors: FakeAnchor[];
  let appendChild: ReturnType<typeof vi.fn>;
  let removeChild: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    clickTrackerMock.mockClear();
    anchors = [];
    appendChild = vi.fn();
    removeChild = vi.fn();
    vi.stubGlobal('document', {
      createElement: vi.fn(() => {
        const a: FakeAnchor = { href: '', download: '', rel: '', style: { display: '' }, click: vi.fn() };
        anchors.push(a);
        return a;
      }),
      body: { appendChild, removeChild },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('triggers one download per valid url and tracks each file', async () => {
    const { downloadFiles } = await import('@/utils/downloadFiles');
    downloadFiles(['/dam/a.pdf', 'https://x.test/b.pdf']);
    vi.runAllTimers();

    expect(anchors).toHaveLength(2);
    expect(anchors[0].href).toBe('/dam/a.pdf');
    expect(anchors[0].download).toBe('');
    expect(anchors[0].click).toHaveBeenCalledTimes(1);
    expect(anchors[1].href).toBe('/api/download?url=https%3A%2F%2Fx.test%2Fb.pdf');
    expect(appendChild).toHaveBeenCalledTimes(2);
    expect(removeChild).toHaveBeenCalledTimes(2);
    expect(clickTrackerMock).toHaveBeenCalledTimes(2);
    expect(clickTrackerMock).toHaveBeenNthCalledWith(1, 'pdf', '/dam/a.pdf', 'a.pdf');
    expect(clickTrackerMock).toHaveBeenNthCalledWith(2, 'pdf', 'https://x.test/b.pdf', 'b.pdf');
  });

  it('skips falsy urls without creating anchors or tracking', async () => {
    const { downloadFiles } = await import('@/utils/downloadFiles');
    downloadFiles([undefined, '']);
    vi.runAllTimers();
    expect(anchors).toHaveLength(0);
    expect(clickTrackerMock).not.toHaveBeenCalled();
  });
});
