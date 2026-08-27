export interface DownloadAllButtonProps {
  /** Handout URLs to download (already filtered to defined values). */
  urls: string[];
  /** 'inline' = link beside a section title; 'footer' = full-width panel footer. */
  variant: 'inline' | 'footer';
}
