import { FileModel } from '@/types/file';
import { HandoutCardProps } from '@/components/Handouts/types';
import { buildImagePath } from '@/utils/buildImagePath';

type Translate = (key: string, options?: Record<string, never>) => string;

/** Shared `FileModel[]` → `HandoutCardProps[]` mapper. Dedupes by `file.url`. */
export const createResourceHandouts = (
  resources: FileModel[] | undefined,
  translate?: Translate
): HandoutCardProps[] => {
  const seen = new Set<string>();
  return (resources ?? [])
    .filter(resource => {
      const url = resource?.file?.url;
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((resource): HandoutCardProps => {
      const resolvedUrl = resource?.file?.path ? buildImagePath(resource.file.path) : resource?.file?.url;
      const title = resource?.title ?? '';
      return {
        id: resolvedUrl ?? '',
        title,
        ariaLabel: `Download ${title}`,
        url: resolvedUrl,
        quantity: resource?.quantity,
        unit: resource?.unit
          ? translate
            ? translate(`activityDetailPage.sideRail.suppliesAndHandouts.unit.${resource.unit}`)
            : resource.unit
          : undefined,
      };
    });
};
