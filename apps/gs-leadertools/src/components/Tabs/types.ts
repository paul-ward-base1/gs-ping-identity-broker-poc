export interface TabProps {
  label: string;
  ariaLabel: string;
  id?: string;
}

export interface TabsProps {
  tabs: TabProps[];
  activeTabIndex: number;
  onTabChange?: (index: number) => void;
}
