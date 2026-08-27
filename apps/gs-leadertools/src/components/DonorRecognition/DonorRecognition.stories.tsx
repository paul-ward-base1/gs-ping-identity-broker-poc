import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DonorRecognition } from './DonorRecognition';

const meta = {
  title: 'Components/DonorRecognition',
  component: DonorRecognition,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  // Wrap with the page-level color band so stories match the Figma context
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ backgroundColor: '#faf7fe', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonorRecognition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: {
    donors: [
      {
        sectionTitle: 'Made possible by General Motors®',
      },
    ],
  },
};

export const TitleAndBody: Story = {
  args: {
    donors: [
      {
        sectionTitle: 'Made possible by General Motors®',
        bodyCopy: {
          html: "<p>Thanks to General Motors® generous support of Girl Scouts of the USA, together we're building the next generation of female STEM leaders. Through innovative programming across the country, we're inspiring girls to pursue STEM careers, reducing economic inequalities, and creating lasting change.</p>",
        },
      },
    ],
  },
};

export const TitleLogoAndBody: Story = {
  args: {
    donors: [
      {
        sectionTitle: 'Made possible by General Motors®',
        donorImage: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/General_Motors_logo.svg/200px-General_Motors_logo.svg.png',
        },
        imageAltText: 'General Motors logo',
        bodyCopy: {
          html: "<p>Thanks to General Motors® generous support of Girl Scouts of the USA, together we're building the next generation of female STEM leaders. Through innovative programming across the country, we're inspiring girls to pursue STEM careers, reducing economic inequalities, and creating lasting change.</p>",
        },
      },
    ],
  },
};

export const LogoWithLink: Story = {
  args: {
    donors: [
      {
        sectionTitle: 'Made possible by General Motors®',
        donorImage: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/General_Motors_logo.svg/200px-General_Motors_logo.svg.png',
        },
        imageAltText: 'General Motors logo',
        imageUrl: 'https://www.gm.com',
        imageTarget: '_blank',
        bodyCopy: {
          html: "<p>Thanks to General Motors® generous support of Girl Scouts of the USA, together we're building the next generation of female STEM leaders.</p>",
        },
      },
    ],
  },
};

export const MultipleDonors: Story = {
  args: {
    donors: [
      {
        sectionTitle: 'Made possible by General Motors®',
        donorImage: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/General_Motors_logo.svg/200px-General_Motors_logo.svg.png',
        },
        imageAltText: 'General Motors logo',
        imageUrl: 'https://www.gm.com',
        imageTarget: '_blank',
        bodyCopy: {
          html: "<p>Thanks to General Motors® generous support of Girl Scouts of the USA, together we're building the next generation of female STEM leaders.</p>",
        },
      },
      {
        sectionTitle: 'Supported by Acme Corp',
        bodyCopy: {
          html: '<p>Acme Corp has partnered with Girl Scouts to bring innovative programs to girls nationwide.</p>',
        },
      },
    ],
  },
};

export const HiddenDonor: Story = {
  name: 'Hidden donor (hidden: true)',
  args: {
    donors: [
      {
        hidden: true,
        sectionTitle: 'This donor should not appear',
      },
    ],
  },
};

export const NoFieldsAuthored: Story = {
  name: 'No fields authored (renders nothing)',
  args: {
    donors: [],
  },
};
