export interface DonorImageModel {
  path?: string;
  url?: string;
  mimeType?: string;
}

export interface DonorModel {
  path?: string;
  hidden?: boolean;
  sectionTitle?: string;
  donorImage?: DonorImageModel;
  imageUrl?: string;
  imageTarget?: string;
  imageAltText?: string;
  bodyCopy?: {
    html?: string;
  };
}
