export interface OutlinedCardProps {
  title?: string;
  ariaLabel?: string;
  url?: string;
  /** `outlined` (default) = white card; `filled` = gray card for in-step File modules. */
  variant?: 'outlined' | 'filled';
}
