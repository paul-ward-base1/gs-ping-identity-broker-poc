import React, { FormEvent } from 'react';
import {ChoicePropsTypes} from "@/components/Choice/types";


export interface ChoiceGroupProps {
  children?: React.ReactNode;
  className?: string;
  legend?: string;
  required?: boolean;
  label?: string;
  name?: string;
  type?: ChoicePropsTypes;
  disabled?: boolean;
  error?: boolean;
  secondaryLabel?: string;
  errorMessage?: string;
  hiddenLegend?: boolean;
  onChange?(e: FormEvent<HTMLFieldSetElement>): void;
}
