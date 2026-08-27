import { FilterProps } from './types';

export const filterOptions = [
  { id: 'junior', name: 'junior', label: 'Junior' },
  { id: 'brownie', name: 'brownie', label: 'Brownie' },
  { id: 'daisy', name: 'daisy', label: 'Daisy' },
  { id: 'junior1', name: 'junior', label: 'Junior' },
  { id: 'brownie1', name: 'brownie', label: 'Brownie' },
  { id: 'daisy1', name: 'daisy', label: 'Daisy' },
  { id: 'junior2', name: 'junior', label: 'Junior' },
  { id: 'brownie2', name: 'brownie', label: 'Brownie' },
  { id: 'daisy2', name: 'daisy', label: 'Daisy' },
];

export const defaultFilterProps: FilterProps = {
  options: filterOptions,
  label: 'Program Level',
  optionType: 'checkbox',
  optionsPosition: 'left',
};
