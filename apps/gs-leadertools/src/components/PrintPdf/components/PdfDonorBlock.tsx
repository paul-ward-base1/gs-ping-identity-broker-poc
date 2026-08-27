import React from 'react';
import { Image, Text, View } from '@react-pdf/renderer';
import { DonorModel } from '@/types/donorRecognition';
import { buildImagePath } from '@/utils/buildImagePath';
import { styles } from '../styles';
import { printImageSrc } from '@/utils/printImageSrc';
import { PdfHtml } from './PdfHtml';
import { resolveBaseUrl } from '../resolveBaseUrl';

interface PdfDonorBlockProps {
  donors?: DonorModel[];
  baseUrl?: string;
  /** Render donor logos / embedded images in full color instead of grayscale. */
  color?: boolean;
}

const resolveDonorLogoSrc = (donor: DonorModel, baseUrl: string, color: boolean): string | undefined => {
  const raw = donor.donorImage?.path ? buildImagePath(donor.donorImage.path) : donor.donorImage?.url;
  if (!raw) return undefined;
  if (raw.startsWith('/')) {
    if (!baseUrl) {
      throw new Error('PdfDonorBlock needs a baseUrl prop (or a browser context) to resolve relative donor logo URLs');
    }
    return printImageSrc(`${baseUrl}${raw}`, color);
  }
  return printImageSrc(raw, color);
};

// AEM authors sometimes paste the donor logo into bodyCopy in addition to
// setting the donorImage field. We render the logo once above; strip any
// embedded <img> from the body so it doesn't appear twice.
const stripImagesAndEmptyAnchors = (html: string): string =>
  html.replace(/<img\b[^>]*>/gi, '').replace(/<a\b[^>]*>\s*<\/a>/gi, '');

export const PdfDonorBlock = ({ donors, baseUrl: explicitBaseUrl, color = false }: PdfDonorBlockProps) => {
  const baseUrl = resolveBaseUrl(explicitBaseUrl);
  const visible = (donors ?? []).filter(d => !d.hidden);
  if (!visible.length) return null;

  return (
    <View style={styles.donorBlock} wrap={false}>
      {visible.map((donor, idx) => {
        const logoSrc = resolveDonorLogoSrc(donor, baseUrl, color);
        return (
          <View key={idx}>
            {donor.sectionTitle ? <Text style={styles.donorTitle}>{donor.sectionTitle}</Text> : null}
            {logoSrc ? <Image src={logoSrc} style={styles.donorLogo} /> : null}
            {donor.bodyCopy?.html ? (
              <PdfHtml html={stripImagesAndEmptyAnchors(donor.bodyCopy.html)} baseUrl={baseUrl} color={color} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};
