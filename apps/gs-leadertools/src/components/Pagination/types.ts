export interface PaginationProps {
  prefixLabel: string;
  suffixLabel: string;
  resultsLabel: string;
  handleNext: () => void;
  handlePrevious: () => void;
  ariaLabelNext?: string;
  ariaLabelPrev?: string;
  disabledNext?: boolean;
  disabledPrevious?: boolean;
}
