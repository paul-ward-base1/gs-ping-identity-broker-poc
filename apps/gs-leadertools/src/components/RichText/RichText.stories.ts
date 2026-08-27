import type { Meta, StoryObj } from '@storybook/react';
import { RichText } from './RichText';

const meta = {
  title: 'Components/RichText',
  component: RichText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A rich text editor component that supports various text formatting options, links, and images.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  args: {
    value: `
      <h2>Plan a maze game</h2>
      <p>Animals like monkeys and kangaroos live in the wild, so we don't get to spend time with them in their natural homes—their habitats. In this badge, you'll find out about where animals live, how they play, and how we can help them!</p>
    `,
  },
};

export const SubtitleWithList: Story = {
  args: {
    value: `
      <h2>Activity Overview</h2>
      <p>Girl Scouts talk about the difference between tame and wild animals, then create a short video, skit, or puppet show about a wild animal. </p>
      <ol>
        <li>Talk about the difference between tame and wild animals</li>
        <li>Give examples of the tools and methods scientists use to study animals</strong></li>
        <li>Have Juniors choose an animal to explore, then create a video, skit, or puppet show about that animal.</li>
      </ol>
      <span>Or</span>
      <ol>
        <li><strong>Talk about the difference between tame and wild animals</strong></li>
        <li><strong>Give examples of the tools and methods scientists use to study animals</strong></li>
        <li><strong>Have Juniors choose an animal to explore, then create a video, skit, or puppet show about that animal.</strong></li>
      </ol>
    `,
  },
};

export const SubtitleWithBulletPoint: Story = {
  args: {
    value: `
      <h2>Say to the girls</h2>
      <ul>
        <li>What are some examples of wild animals?</li>
      </ul>
      <span>Or</span>
      <ul>
        <li><strong>What are some examples of wild animals?</strong></li>
      </ul>
      <p>Some examples of wild animals are lions, tigers, bears, deer, and wolves. Domestic or tame animals, such as farm animals and pets, live alongside people. These animals depend on us for their food, shelter, and water.</p>
    `,
  },
};

export const WithIndentation: Story = {
  args: {
    value: `
      <p>Normal paragraph</p>
      <p style="margin-left: 20px">Indented once</p>
      <p style="margin-left: 40px">Indented twice</p>
      <p>Back to normal</p>
    `,
  },
};

export const WithLinks: Story = {
  args: {
    value: `
      <h2>Resources</h2>
      <p>Here are some helpful resources for learning about wild animals:</p>
      <ul>
        <li><a href="https://www.nationalgeographic.com/animals">National Geographic Animals</a> - Learn about animals from around the world</li>
        <li><a href="https://www.worldwildlife.org/species">WWF Species Directory</a> - Information about endangered species</li>
        <li><a href="https://kids.nationalgeographic.com/animals">National Geographic Kids</a> - Fun facts about animals for kids</li>
      </ul>
    `,
  },
};

export const WithImages: Story = {
  args: {
    value: `
      <h2>Wild Animals</h2>
      <img src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Tiger in the wild" />
    `,
  },
};
