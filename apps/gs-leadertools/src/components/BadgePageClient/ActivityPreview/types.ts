import { TagProps } from '@/components/Tag/types';
import { MaterialModel } from '@/types/material';
import { ButtonProps } from '@/components/Button/types';
import { HandoutCardProps } from '@/components/Handouts/types';

export interface ActivityDetailsProp {
  name: string;
  description?: string;
  timeRange?: string;
  tags?: TagProps[];
  hasAllLevels?: boolean;
  materials?: MaterialModel[];
  handouts?: HandoutCardProps[];
  fullDetailsButton?: ButtonProps;
  closeButton?: ButtonProps;
}

export interface ActivityPreviewProps {
  isOpen: boolean;
  handleClose: () => void;
  activityPath: string;
}
