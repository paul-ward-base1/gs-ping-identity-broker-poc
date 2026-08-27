import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildImagePath } from '@/utils/buildImagePath';

describe('buildImagePath', () => {
  beforeEach(() => {
    vi.stubEnv('AEM_DAM_PATH', 'content/dam/gsusa-vtk-redesign');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns empty string for undefined path', () => {
    expect(buildImagePath(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(buildImagePath('')).toBe('');
  });

  it('returns storybook paths unchanged', () => {
    expect(buildImagePath('.storybook/assets/image.png')).toBe('.storybook/assets/image.png');
  });

  it('strips dam path and returns /img/ route (leading slash)', () => {
    expect(buildImagePath('/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/image.png')).toBe(
      '/img/common/media/images/badge-images/image.png'
    );
  });

  it('strips dam path and returns /img/ route (no leading slash)', () => {
    expect(buildImagePath('content/dam/gsusa-vtk-redesign/common/media/images/badge-images/image.png')).toBe(
      '/img/common/media/images/badge-images/image.png'
    );
  });
});
