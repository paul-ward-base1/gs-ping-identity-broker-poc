export interface CalloutProps {
  title?: string;
  description?: string;
  descriptionHtml?: string;
  iconName?: string;
  iconPath?: string;
  iconAlt?: string;
  /** Program-level id used to tint the icon badge (defaults to neutral/multi). */
  level?: string;
}
