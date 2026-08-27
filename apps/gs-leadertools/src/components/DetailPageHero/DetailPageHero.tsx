import { cn } from '@/utils/classNames';
import { ProgramLevelIds } from '@/types/programLevel';
import {
  CircleShape,
  DiamondShape,
  FirstDashTrail,
  FlowerShape,
  FrameShape,
  GSMarkShape,
  RectangleShape,
  SecondDashTrail,
  ThirdDashTrail,
  TriangleShape,
} from '@/components/Icons';
import { DetailPageHeroContent } from '@/components/DetailPageHeroContent';
import { Breadcrumb } from '@/components/Breadcrumb';

import { DetailPageHeroProps } from './types';
import './DetailPageHero.scss';

const bem = cn('detail-page-hero');

const shapeMap = {
  [ProgramLevelIds.JUNIOR]: CircleShape,
  [ProgramLevelIds.DAISY]: FlowerShape,
  [ProgramLevelIds.BROWNIE]: TriangleShape,
  [ProgramLevelIds.CADETTE]: DiamondShape,
  [ProgramLevelIds.SENIOR]: RectangleShape,
  [ProgramLevelIds.AMBASSADOR]: FrameShape,
  [ProgramLevelIds.MULTI]: GSMarkShape,
};

export const DetailPageHero = ({
  image,
  imageAlt,
  programLevels,
  theme,
  title,
  description,
  descriptionHtml,
  primaryButton,
  secondaryButtonLabel,
  secondaryButtonClick,
  secondaryButtonAriaLabel,
  ueTitleProp,
}: DetailPageHeroProps) => {
  const level =
    programLevels.length > 1 || programLevels[0]?.id === ProgramLevelIds.ALL
      ? ProgramLevelIds.MULTI
      : (programLevels[0]?.id ?? ProgramLevelIds.JUNIOR);

  const Shape = shapeMap[level];
  const containerClass = bem({ [`level-${level}`]: true });
  const topShapeClass = bem('top-shape', { [`level-${level}`]: true });
  const bottomShapeClass = bem('bottom-shape', { [`level-${level}`]: true });
  const firstDashTrailClass = bem('first-dash-trail', { [`level-${level}`]: true });
  const secondDashTrailClass = bem('second-dash-trail', { [`level-${level}`]: true });
  const thirdDashTrailClass = bem('third-dash-trail', { [`level-${level}`]: true });

  return (
    <div className={containerClass}>
      <Shape className={topShapeClass} aria-hidden="true" />
      <Shape className={bottomShapeClass} aria-hidden="true" />
      <FirstDashTrail className={firstDashTrailClass} aria-hidden="true" />
      <SecondDashTrail className={secondDashTrailClass} aria-hidden="true" />
      <ThirdDashTrail className={thirdDashTrailClass} aria-hidden="true" />
      <div className={bem('content')}>
        <Breadcrumb />
        <DetailPageHeroContent
          image={image}
          imageAlt={imageAlt}
          programLevels={programLevels}
          theme={theme}
          title={title}
          description={description}
          descriptionHtml={descriptionHtml}
          primaryButton={primaryButton}
          secondaryButtonLabel={secondaryButtonLabel}
          secondaryButtonAriaLabel={secondaryButtonAriaLabel}
          secondaryButtonClick={secondaryButtonClick}
          ueTitleProp={ueTitleProp}
        />
      </div>
    </div>
  );
};
