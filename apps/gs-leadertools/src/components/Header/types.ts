import { ChoiceProps } from '@/components/Choice/types';

export interface NavigationItem {
  label: string;
  url: string;
}

export interface LanguageSwitchDictionaryProps {
  label: string;
  value: string;
  id: string;
  hint?: string;
}

export interface NavigationItemProps {
  title: string;
  url: string;
}

export interface LanguageSwitchDictionaryItemsProps {
  [key: string]: LanguageSwitchDictionaryProps;
}

export interface NavigationItemsProps {
  [key: string]: NavigationItemProps;
}

export interface HeaderProps {
  navigationItems?: NavigationItem[];
  logo?: string;
  logoAlt?: string;
  languageOptions?: ChoiceProps[];
}
