import { Meta, StoryObj } from '@storybook/react';

import { SearchBox as Component } from './SearchBox';
import { SearchBoxProps } from './types';
import { useState } from 'react';

export default {
  title: 'Components/SearchBox',
  component: Component,
  parameters: {
    layout: 'centered',
  },
} as Meta;

const SearchBoxWrapper = (args: SearchBoxProps) => {
  const [value, setValue] = useState('');

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  return <Component {...args} value={value} handleSearchChange={handleChange} />;
};

export const SearchBox: StoryObj = {
  render: args => {
    return <SearchBoxWrapper {...args} />;
  },
};
