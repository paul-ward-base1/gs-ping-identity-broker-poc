export interface HandoutCardProps {
  id: string;
  title: string;
  ariaLabel: string;
  url?: string;
  quantity?: number;
  unit?: string;
}

export interface HandoutsProps {
  title: string;
  cards?: HandoutCardProps[];
}
