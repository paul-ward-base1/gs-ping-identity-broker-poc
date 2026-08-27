declare global {
  interface Window {
    __AEM_API__?: string;
  }
}

export function getAemBase(): string {
  if (typeof window !== 'undefined') {
    return window.__AEM_API__ ?? '';
  }
  return process.env.AEM_API ?? '';
}
