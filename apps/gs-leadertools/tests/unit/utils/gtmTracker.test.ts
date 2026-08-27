import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/gtm', () => ({
  pushToDataLayer: vi.fn(),
}));

import { clickTracker } from '@/utils/gtmTracker';
import { pushToDataLayer } from '@/lib/gtm';

const mockedPush = vi.mocked(pushToDataLayer);

describe('clickTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.stubGlobal('window', { location: { href: 'http://localhost/en/badge/brownie/pets' } });
  });

  it('fires cta_click with cta_type, destination_url and link_url', () => {
    clickTracker('sponsor_link', 'https://sponsor.org');
    expect(mockedPush).toHaveBeenCalledWith({
      event: 'cta_click',
      cta_type: 'sponsor_link',
      link_url: 'http://localhost/en/badge/brownie/pets',
      destination_url: 'https://sponsor.org',
    });
  });

  it('includes file_name in payload when provided', () => {
    clickTracker('pdf', 'https://example.com/file.pdf', 'Brownie Pets Handout');
    expect(mockedPush).toHaveBeenCalledWith({
      event: 'cta_click',
      cta_type: 'pdf',
      link_url: 'http://localhost/en/badge/brownie/pets',
      destination_url: 'https://example.com/file.pdf',
      file_name: 'Brownie Pets Handout',
    });
  });

  it('omits file_name key entirely when not provided (backward compatibility)', () => {
    clickTracker('cross_domain', 'https://external.com');
    const payload = mockedPush.mock.calls[0][0];
    expect(payload).not.toHaveProperty('file_name');
  });

  it('omits file_name key when empty string passed', () => {
    clickTracker('pdf', 'https://example.com/file.pdf', '');
    const payload = mockedPush.mock.calls[0][0];
    expect(payload).not.toHaveProperty('file_name');
  });
});
