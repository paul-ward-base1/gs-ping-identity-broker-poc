import { ImageModel } from '@/types/image';

export interface FileModelContentReference {
  url: string;
  title?: string;
  mimeType?: string;
  size?: number;
  fileName?: string;
  extension?: string;
  _path?: string;
  path?: string;
}

export interface FileModel {
  title?: string;
  label?: string;
  file?: FileModelContentReference;
  thumbnail?: ImageModel;
  quantity?: number;
  unit?: string;
  isOptional?: boolean;
}
