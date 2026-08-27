export interface ImageModel {
  url?: string; // absolute URL returned by AEM GraphQL
  path: string;
  altText?: string;
  title?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  renditionUrl?: string;
}
