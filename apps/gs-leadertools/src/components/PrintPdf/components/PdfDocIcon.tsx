import React from 'react';
import { Svg, Path } from '@react-pdf/renderer';
import { colors } from '../styles';

interface PdfDocIconProps {
  size?: number;
  color?: string;
}

export const PdfDocIcon = ({ size = 9, color = colors.neutral70 }: PdfDocIconProps) => (
  <Svg
    viewBox="2 2 18 20"
    style={{
      width: size * (18 / 20),
      height: size,
      flexShrink: 0,
      // Nudges the icon down so its visible centre aligns with the
      // sibling text's cap-height instead of its line-box.
      marginTop: 1,
    }}
  >
    <Path
      d="M5 2 H14 L19 7 V21 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 V3 a1 1 0 0 1 1 -1 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path d="M14 2 V7 H19" fill="none" stroke={color} strokeWidth={1.5} />
    <Path d="M7 12 H16" stroke={color} strokeWidth={1.2} />
    <Path d="M7 16 H13" stroke={color} strokeWidth={1.2} />
  </Svg>
);
