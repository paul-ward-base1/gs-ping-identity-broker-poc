// Shared between AuthControls (opener) and the popup-complete page (popup)
// so the two independently-loaded windows agree on the postMessage shape.
export const POPUP_AUTH_MESSAGE_SOURCE = 'gs-leadertools-auth';

export interface PopupAuthMessage {
  source: typeof POPUP_AUTH_MESSAGE_SOURCE;
  status: 'complete' | 'error';
  error?: string;
}
