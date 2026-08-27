import { ProgramLevelIds } from '@/types/programLevel';
import {
  AllProgramsIcon,
  AmbassadorIcon,
  BrownieIcon,
  CadetteIcon,
  DaisyIcon,
  JuniorIcon,
  SeniorIcon,
} from '@/components/svgs';

export const tagIconMapping = {
  [ProgramLevelIds.DAISY]: DaisyIcon,
  [ProgramLevelIds.BROWNIE]: BrownieIcon,
  [ProgramLevelIds.JUNIOR]: JuniorIcon,
  [ProgramLevelIds.CADETTE]: CadetteIcon,
  [ProgramLevelIds.SENIOR]: SeniorIcon,
  [ProgramLevelIds.AMBASSADOR]: AmbassadorIcon,
  [ProgramLevelIds.ALL]: AllProgramsIcon,
  [ProgramLevelIds.MULTI]: AllProgramsIcon,
};
