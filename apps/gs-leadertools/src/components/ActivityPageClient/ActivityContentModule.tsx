import { ContentModulesTypes } from '@/types/contentModules';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Callout } from '@/components/Callout';
import { OutlinedCard } from '@/components/OutlinedCard';
import { ParsedContentModule } from './types';
import { AccordionModule, RichTextModule, ImageModule } from './ContentModules';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const renderModule = (props: ParsedContentModule) => {
  switch (props.type) {
    case ContentModulesTypes.AccordionModel:
      return <AccordionModule {...props} />;
    case ContentModulesTypes.RichTextModel:
      return <RichTextModule {...props} />;
    case ContentModulesTypes.VideoModel:
      return props.platform && props.videoId ? (
        <VideoPlayer title={props.title} videoId={props.videoId} platform={props.platform} />
      ) : null;
    case ContentModulesTypes.ImageModel:
      return <ImageModule {...props} />;
    case ContentModulesTypes.CalloutModel:
      return (
        <Callout
          title={props.title}
          descriptionHtml={props.descriptionHtml}
          iconName={props.iconName}
          iconPath={props.iconPath}
          iconAlt={props.iconName}
          level={props.level}
        />
      );
    case ContentModulesTypes.FileModel:
      return props.url ? (
        <OutlinedCard
          title={props.title ?? ''}
          ariaLabel={props.ariaLabel ?? `Download ${props.title ?? ''}`}
          url={props.url}
          variant="filled"
        />
      ) : null;
    default:
      return null;
  }
};

export const ActivityContentModule = (props: ParsedContentModule) => {
  const isAuthorMode = useIsAuthorMode();
  const content = renderModule(props);

  if (isAuthorMode && props.path) {
    return (
      <div data-aue-resource={`urn:aemconnection:${props.path}/jcr:content/data/master`} data-aue-label={props.type}>
        {content}
      </div>
    );
  }

  return content;
};
