'use client';

export const pushToDataLayer = (data: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(data);
  }
};
