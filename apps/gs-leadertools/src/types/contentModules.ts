export enum ContentModulesTypes {
  RichTextModel = 'RichTextModel',
  ImageModel = 'ImageModel',
  AccordionModel = 'AccordionModel',
  VideoModel = 'VideoModel',
  CalloutModel = 'CalloutModel',
  FileModel = 'FileModel',
}

export interface RichTextContent {
  html?: string;
}

export interface LabelBaseEntity {
  label?: string;
}

// Rich Text
export interface RichTextModel {
  path?: string;
  type: ContentModulesTypes.RichTextModel;
  content: RichTextContent;
}

// Accordion
export interface AccordionItem {
  html: string;
}

export interface AccordionModel extends LabelBaseEntity, RichTextContent {
  path?: string;
  type: ContentModulesTypes.AccordionModel;
  items: AccordionItem[];
  header?: string; // Based on your usage of `el.header`
}

// Image
export interface ImageFile {
  path?: string;
  url?: string;
  alt?: string;
}

export interface ImageContentModel extends RichTextContent {
  path?: string;
  type: ContentModulesTypes.ImageModel;
  label?: string;
  file: ImageFile;
}

export enum VideoPlatforms {
  Youtube = 'youTube',
  Vimeo = 'vimeo',
}

export interface VideoModel extends RichTextContent {
  path?: string;
  type: ContentModulesTypes.VideoModel;
  title?: string;
  videoId?: string;
  platform?: VideoPlatforms;
}

export interface CalloutModel {
  path?: string;
  type: ContentModulesTypes.CalloutModel;
  title?: string;
  icon?: ImageFile | null;
  description?: RichTextContent;
}

export interface FileContentModel {
  path?: string;
  type: ContentModulesTypes.FileModel;
  title?: string;
  file?: {
    url?: string;
    path?: string;
    title?: string;
    mimeType?: string;
    fileName?: string;
  };
  quantity?: number;
  unit?: string;
  optional?: boolean;
}

export type ContentModule =
  | RichTextModel
  | AccordionModel
  | ImageContentModel
  | VideoModel
  | CalloutModel
  | FileContentModel;
