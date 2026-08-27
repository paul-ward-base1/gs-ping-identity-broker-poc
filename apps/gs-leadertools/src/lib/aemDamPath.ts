declare global {
  interface Window {
    __AEM_DAM_PATH__?: string;
  }
}

export function getAemDamPath(): string {
  // Runtime sources take precedence so an ops-time AEM_DAM_PATH change is
  // honoured immediately without a rebuild.  NEXT_PUBLIC_AEM_DAM_PATH (baked
  // at build time) is the final fallback for React hydration, keeping SSR and
  // client paths identical.  Use || (not ??) so an empty-string injection from
  // the layout bootstrap script still falls through to the build-time value.
  if (typeof window !== 'undefined') return window.__AEM_DAM_PATH__ || process.env.NEXT_PUBLIC_AEM_DAM_PATH || '';
  return process.env.AEM_DAM_PATH ?? process.env.NEXT_PUBLIC_AEM_DAM_PATH ?? '';
}
