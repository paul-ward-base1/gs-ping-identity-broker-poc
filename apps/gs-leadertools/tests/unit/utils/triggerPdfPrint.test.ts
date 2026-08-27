import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface FakeIframe {
  id: string;
  style: { cssText: string };
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  parentNode: { removeChild: ReturnType<typeof vi.fn> } | null;
  contentWindow: {
    focus: ReturnType<typeof vi.fn>;
    print: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
  };
}

describe('triggerPdfPrint — desktop hidden-iframe printing', () => {
  let iframe: FakeIframe;
  let windowStub: { focus: ReturnType<typeof vi.fn>; open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();

    iframe = {
      id: '',
      style: { cssText: '' },
      src: '',
      onload: null,
      onerror: null,
      parentNode: null,
      contentWindow: {
        focus: vi.fn(),
        print: vi.fn(),
        addEventListener: vi.fn(),
      },
    };

    const body = {
      appendChild: vi.fn((node: FakeIframe) => {
        node.parentNode = { removeChild: vi.fn() };
        return node;
      }),
    };

    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh)', maxTouchPoints: 0 });
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => null),
      createElement: vi.fn(() => iframe),
      body,
    });
    windowStub = { focus: vi.fn(), open: vi.fn() };
    vi.stubGlobal('window', windowStub);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const runPrint = async () => {
    const { triggerPdfPrint } = await import('@/utils/triggerPdfPrint');
    const done = triggerPdfPrint('https://example.com/doc.pdf');
    iframe.onload?.();
    vi.advanceTimersByTime(250);
    await done;
  };

  it('invokes print() on the iframe content window', async () => {
    await runPrint();
    expect(iframe.contentWindow.print).toHaveBeenCalledTimes(1);
  });

  it('does not remove the iframe on a fixed timer while the dialog may still be open', async () => {
    await runPrint();
    vi.advanceTimersByTime(10_000);
    expect(iframe.parentNode?.removeChild).not.toHaveBeenCalled();
  });

  it('removes the iframe when afterprint fires', async () => {
    await runPrint();

    const afterPrint = iframe.contentWindow.addEventListener.mock.calls.find(([type]) => type === 'afterprint')?.[1] as
      | (() => void)
      | undefined;

    expect(afterPrint).toBeTypeOf('function');
    afterPrint?.();
    expect(iframe.parentNode?.removeChild).toHaveBeenCalledWith(iframe);
  });

  it('falls back to window.open and removes the iframe when print() throws', async () => {
    iframe.contentWindow.print.mockImplementation(() => {
      throw new Error('print blocked');
    });

    await runPrint();

    expect(windowStub.open).toHaveBeenCalledWith('https://example.com/doc.pdf', '_blank', 'noopener,noreferrer');
    expect(iframe.parentNode?.removeChild).toHaveBeenCalledWith(iframe);
  });

  it('falls back to window.open and removes the iframe when the iframe fails to load', async () => {
    const { triggerPdfPrint } = await import('@/utils/triggerPdfPrint');
    const done = triggerPdfPrint('https://example.com/doc.pdf');

    iframe.onerror?.();
    await done;

    expect(windowStub.open).toHaveBeenCalledWith('https://example.com/doc.pdf', '_blank', 'noopener,noreferrer');
    expect(iframe.parentNode?.removeChild).toHaveBeenCalledWith(iframe);
    expect(iframe.contentWindow.print).not.toHaveBeenCalled();
  });
});
