import React from 'react';
import { Image, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';

interface PdfFooterProps {
  pageUrl: string;
  qrDataUrl: string;
  copyrightLine: string;
}

export const PdfFooter = ({ pageUrl, qrDataUrl, copyrightLine }: PdfFooterProps) => (
  <View style={styles.footer} fixed>
    {qrDataUrl ? <Image src={qrDataUrl} style={styles.footerQr} /> : null}
    <View style={styles.footerInfo}>
      <Text style={styles.footerLabel}>See full details online</Text>
      <Text style={styles.footerUrl}>{pageUrl}</Text>
      <Text style={styles.footerCopyright}>{copyrightLine}</Text>
    </View>
    <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);
