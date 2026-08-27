import { describe, it, expect } from 'vitest';
import { createActivityAccordionItem } from '@/components/BadgePageClient/badgePdfData';
import { ActivityModel } from '@/types/activity';
import { FilterModel } from '@/types/filter';

const translateEcho = (key: string) => key;
const noopSelection = (_path: string) => () => undefined;
const filters: FilterModel = { programLevels: [] };

const VALID_PATH =
  '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/play-a-vehicle-matching-game/play-a-vehicle-matching-game';

describe('createActivityAccordionItem — primary button is a link (Task 253)', () => {
  it('sets primaryButton.link.url to the normalized activity path and no onClick', () => {
    const activity = { name: 'Vehicle Matching Game', path: VALID_PATH, programLevel: [] } as ActivityModel;
    const item = createActivityAccordionItem(activity, translateEcho, noopSelection, filters);
    expect(item.primaryButton?.link?.url).toBe('/en/activity/badge/m-r/play-a-vehicle-matching-game');
    expect(item.primaryButton?.onClick).toBeUndefined();
  });

  it('omits the link (no crash) for a malformed activity path', () => {
    const activity = { name: 'Broken', path: '/invalid/path', programLevel: [] } as ActivityModel;
    const item = createActivityAccordionItem(activity, translateEcho, noopSelection, filters);
    expect(item.primaryButton?.link).toBeUndefined();
    expect(item.primaryButton?.onClick).toBeUndefined();
    expect(item.primaryButton?.label).toBe('badgeDetailPage.button.activity.label');
  });

  it('keeps the preview (secondary) button as an onClick handler', () => {
    const activity = { name: 'X', path: VALID_PATH, programLevel: [] } as ActivityModel;
    const item = createActivityAccordionItem(activity, translateEcho, noopSelection, filters);
    expect(typeof item.secondaryButton?.onClick).toBe('function');
    expect(item.secondaryButton?.icon).toBe('eye');
  });
});
