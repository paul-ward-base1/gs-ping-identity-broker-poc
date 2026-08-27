import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAwardHandouts,
  createAwardStep,
  createAwardClosingQuestions,
  createAwardSideRailBoxItems,
  resolveAwardProgramLevel,
  resolveAwardProgramLevelTags,
} from '@/components/AwardPageClient/awardData';
import { AwardModel, NextAwardItem, AwardStepModel } from '@/types/award';
import { ProgramLevel, ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { ContentModulesTypes } from '@/types/contentModules';
import { ProgramLevelFilter, FilterModel } from '@/types/filter';
import { SideRailBoxType } from '@/components/SideRailBox/types';

// ---------- helpers ----------
const mkLevel = (name: string): ProgramLevel => ({ name, id: '', backgroundImage: { path: '' } });

const aemLevels: ProgramLevelFilter[] = [
  { id: ProgramLevelIds.JUNIOR, name: ProgramLevelEnum.JUNIOR, order: 2, backgroundImage: { path: '' } },
  { id: ProgramLevelIds.CADETTE, name: ProgramLevelEnum.CADETTE, order: 3, backgroundImage: { path: '' } },
  { id: ProgramLevelIds.SENIOR, name: ProgramLevelEnum.SENIOR, order: 4, backgroundImage: { path: '' } },
  { id: ProgramLevelIds.AMBASSADOR, name: ProgramLevelEnum.AMBASSADOR, order: 5, backgroundImage: { path: '' } },
];

const filters: FilterModel = { programLevels: aemLevels };

// Pretends to be react-i18next's `t` — returns the dictionary key so we can
// assert the helper is asking for the right keys.
const translateEcho = (key: string) => key;

// No-op click factory matching `(path: string) => () => void`.
const noopClick = (_path: string) => () => undefined;

// Convenience wrapper for the createAwardStep signature so individual tests
// don't repeat the translate/click/filters args.
const buildStep = (step: AwardStepModel, index = 0, level = ProgramLevelIds.JUNIOR) =>
  createAwardStep(step, index, level, translateEcho, noopClick, filters);

// ---------- createAwardHandouts ----------
describe('createAwardHandouts', () => {
  beforeEach(() => {
    vi.stubEnv('AEM_DAM_PATH', 'content/dam/gsusa-vtk-redesign');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('delegates to createResourceHandouts with relatedResources', () => {
    const award: AwardModel = {
      relatedResources: [{ title: 'Worksheet', file: { url: 'https://example.com/w.pdf' } }],
    };
    expect(createAwardHandouts(award)).toEqual([
      {
        id: 'https://example.com/w.pdf',
        title: 'Worksheet',
        ariaLabel: 'Download Worksheet',
        url: 'https://example.com/w.pdf',
      },
    ]);
  });

  it('returns [] when relatedResources is missing', () => {
    expect(createAwardHandouts({})).toEqual([]);
  });
});

// ---------- createAwardStep ----------
describe('createAwardStep', () => {
  it('maps basic step fields and assigns 1-based stepNumber', () => {
    const step: AwardStepModel = {
      path: '/dam/.../steps/explore-your-values',
      name: 'Explore your values',
      description: { plaintext: 'Discover…', html: '<p>Discover…</p>' },
    };
    expect(buildStep(step)).toMatchObject({
      path: '/dam/.../steps/explore-your-values',
      name: 'Explore your values',
      description: 'Discover…',
      descriptionHtml: '<p>Discover…</p>',
      stepNumber: 1,
    });
  });

  it('handles missing name + description gracefully', () => {
    const result = buildStep({});
    expect(result.name).toBe('');
    expect(result.description).toBeUndefined();
    expect(result.descriptionHtml).toBeUndefined();
  });

  it('defaults activities to an empty array when missing', () => {
    expect(buildStep({}).activities).toEqual([]);
  });

  it('maps activities to AccordionItemProps with title + timeRange + button handlers + tags', () => {
    const step: AwardStepModel = {
      activities: [
        {
          path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/write-a-values-journal/write-a-values-journal',
          name: 'Write a values journal',
          timeRange: '20-30 minutes',
          programLevel: [mkLevel(ProgramLevelEnum.JUNIOR)],
        },
      ],
    };
    const [item] = buildStep(step).activities;
    expect(item).toMatchObject({
      title: 'Write a values journal',
      timeRange: '20-30 minutes',
      hasAllLevels: false,
    });
    expect(item.primaryButton?.label).toBe('awardDetailPage.button.activity.label');
    expect(item.secondaryButton?.label).toBe('awardDetailPage.button.activityPreview.label');
    expect(item.secondaryButton?.icon).toBe('eye');
    expect(item.tags).toEqual([{ id: ProgramLevelIds.JUNIOR, level: ProgramLevelEnum.JUNIOR, type: 'content' }]);
    // Primary button is now a native link (Task 253); preview stays an onClick handler.
    expect(item.primaryButton?.link?.url).toBe('/en/activity/badge/m-r/write-a-values-journal');
    expect(item.primaryButton?.onClick).toBeUndefined();
    item.secondaryButton?.onClick?.();
  });

  it('marks activities as hasAllLevels when they span every program level', () => {
    const step: AwardStepModel = {
      activities: [
        {
          path: '/act/all',
          name: 'All-level activity',
          programLevel: [
            mkLevel(ProgramLevelEnum.DAISY),
            mkLevel(ProgramLevelEnum.BROWNIE),
            mkLevel(ProgramLevelEnum.JUNIOR),
            mkLevel(ProgramLevelEnum.CADETTE),
            mkLevel(ProgramLevelEnum.SENIOR),
            mkLevel(ProgramLevelEnum.AMBASSADOR),
          ],
        },
      ],
    };
    const allLevelFilters: FilterModel = {
      programLevels: [
        ...aemLevels,
        { id: ProgramLevelIds.DAISY, name: ProgramLevelEnum.DAISY, order: 0, backgroundImage: { path: '' } },
        { id: ProgramLevelIds.BROWNIE, name: ProgramLevelEnum.BROWNIE, order: 1, backgroundImage: { path: '' } },
      ],
    };
    const result = createAwardStep(step, 0, ProgramLevelIds.MULTI, translateEcho, noopClick, allLevelFilters);
    expect(result.activities[0].hasAllLevels).toBe(true);
  });

  it('parses CalloutModel content modules and forwards the program level', () => {
    const step: AwardStepModel = {
      contentModules: [
        {
          type: ContentModulesTypes.CalloutModel,
          path: '/cm/discover',
          title: 'Discover Your Why',
          icon: { alt: 'idea-bulb' },
          description: { html: '<p>...</p>' },
        },
      ],
    };
    expect(buildStep(step, 0, ProgramLevelIds.SENIOR).contentModules).toEqual([
      {
        id: 0,
        path: '/cm/discover',
        type: ContentModulesTypes.CalloutModel,
        title: 'Discover Your Why',
        iconName: 'idea-bulb',
        descriptionHtml: '<p>...</p>',
        level: ProgramLevelIds.SENIOR,
      },
    ]);
  });

  it('parses RichTextModel content modules', () => {
    const step: AwardStepModel = {
      contentModules: [{ type: ContentModulesTypes.RichTextModel, path: '/cm/r', content: { html: '<p>rt</p>' } }],
    };
    expect(buildStep(step).contentModules).toEqual([
      { id: 0, path: '/cm/r', type: ContentModulesTypes.RichTextModel, content: '<p>rt</p>' },
    ]);
  });

  it('parses AccordionModel content modules and stamps the level', () => {
    const step: AwardStepModel = {
      contentModules: [
        {
          type: ContentModulesTypes.AccordionModel,
          path: '/cm/a',
          header: 'Acc Title',
          label: 'Acc Label',
          items: [{ html: '<p>one</p>' }, { html: '<p>two</p>' }],
        },
      ],
    };
    expect(buildStep(step).contentModules).toEqual([
      {
        id: 0,
        path: '/cm/a',
        type: ContentModulesTypes.AccordionModel,
        title: 'Acc Title',
        header: 'Acc Label',
        level: ProgramLevelIds.JUNIOR,
        items: [{ value: '<p>one</p>' }, { value: '<p>two</p>' }],
      },
    ]);
  });

  it('drops unknown content-module types', () => {
    const step: AwardStepModel = {
      contentModules: [
        // @ts-expect-error — exercising the default switch branch
        { type: 'UnknownModel', path: '/cm/?' },
        { type: ContentModulesTypes.RichTextModel, content: { html: '<p>kept</p>' } },
      ],
    };
    const result = buildStep(step);
    expect(result.contentModules).toHaveLength(1);
    expect(result.contentModules?.[0].type).toBe(ContentModulesTypes.RichTextModel);
  });

  it('stepNumber follows the (index + 1) contract', () => {
    expect(buildStep({}, 4).stepNumber).toBe(5);
  });
});

// ---------- createAwardClosingQuestions ----------
describe('createAwardClosingQuestions', () => {
  it('returns null when no closing data is present', () => {
    expect(createAwardClosingQuestions({})).toBeNull();
  });

  it('returns null when only an empty closingQuestionContent array is present', () => {
    expect(createAwardClosingQuestions({ closingQuestionContent: [] })).toBeNull();
  });

  it('returns a block when only the header fields are present', () => {
    expect(
      createAwardClosingQuestions({
        closingQuestionTitle: 'Reflect and Grow',
        closingQuestionDescription: { html: '<p>Think…</p>' },
      })
    ).toEqual({
      title: 'Reflect and Grow',
      descriptionHtml: '<p>Think…</p>',
      questions: [],
      uePath: undefined,
      ueLabel: undefined,
    });
  });

  it('returns a block with full title + description + questions', () => {
    const result = createAwardClosingQuestions({
      path: '/dam/.../true-north',
      badgeName: 'True North Award',
      closingQuestionTitle: 'Reflect and Grow',
      closingQuestionDescription: { html: '<p>Think…</p>' },
      closingQuestionContent: ['What worked?', 'What challenged you?'],
    });
    expect(result).toEqual({
      title: 'Reflect and Grow',
      descriptionHtml: '<p>Think…</p>',
      questions: ['What worked?', 'What challenged you?'],
      uePath: '/dam/.../true-north',
      ueLabel: 'True North Award',
    });
  });

  it('filters out falsy question entries', () => {
    const result = createAwardClosingQuestions({
      closingQuestionContent: ['real', '', 'another'],
    });
    expect(result?.questions).toEqual(['real', 'another']);
  });

  it('defaults missing title/descriptionHtml to empty strings', () => {
    const result = createAwardClosingQuestions({
      closingQuestionContent: ['only a question'],
    });
    expect(result?.title).toBe('');
    expect(result?.descriptionHtml).toBe('');
  });
});

// ---------- resolveAwardProgramLevel ----------
describe('resolveAwardProgramLevel', () => {
  it('returns MULTI when the award has no levels', () => {
    expect(resolveAwardProgramLevel({}, filters)).toEqual({ level: '', id: ProgramLevelIds.MULTI });
  });

  it('returns the single level mapped via aemLevels', () => {
    const award: AwardModel = { programLevel: [mkLevel(ProgramLevelEnum.SENIOR)] };
    expect(resolveAwardProgramLevel(award, filters)).toEqual({
      level: ProgramLevelEnum.SENIOR,
      id: ProgramLevelIds.SENIOR,
    });
  });

  it('returns MULTI when more than one level is set (e.g. True North)', () => {
    const award: AwardModel = {
      programLevel: [
        mkLevel(ProgramLevelEnum.JUNIOR),
        mkLevel(ProgramLevelEnum.CADETTE),
        mkLevel(ProgramLevelEnum.SENIOR),
        mkLevel(ProgramLevelEnum.AMBASSADOR),
      ],
    };
    expect(resolveAwardProgramLevel(award, filters)).toEqual({ level: '', id: ProgramLevelIds.MULTI });
  });

  it('falls back to MULTI when filters is missing/empty', () => {
    const award: AwardModel = { programLevel: [mkLevel('Unknown')] };
    expect(resolveAwardProgramLevel(award, filters).id).toBe(ProgramLevelIds.MULTI);
  });
});

// ---------- resolveAwardProgramLevelTags ----------
describe('resolveAwardProgramLevelTags', () => {
  it('returns an empty array when no levels are set', () => {
    expect(resolveAwardProgramLevelTags({}, filters)).toEqual([]);
  });

  it('returns one tag per level, preserving order', () => {
    const award: AwardModel = {
      programLevel: [mkLevel(ProgramLevelEnum.JUNIOR), mkLevel(ProgramLevelEnum.SENIOR)],
    };
    expect(resolveAwardProgramLevelTags(award, filters)).toEqual([
      { level: ProgramLevelEnum.JUNIOR, id: ProgramLevelIds.JUNIOR },
      { level: ProgramLevelEnum.SENIOR, id: ProgramLevelIds.SENIOR },
    ]);
  });

  it('falls back unknown level names to MULTI', () => {
    const award: AwardModel = { programLevel: [mkLevel('Unknown')] };
    expect(resolveAwardProgramLevelTags(award, filters)[0].id).toBe(ProgramLevelIds.MULTI);
  });
});

// ---------- createAwardSideRailBoxItems ----------
describe('createAwardSideRailBoxItems', () => {
  beforeEach(() => {
    vi.stubEnv('AEM_DAM_PATH', 'content/dam/gsusa-vtk-redesign');
  });
  afterEach(() => vi.unstubAllEnvs());

  const callBoxes = (
    overrides: {
      nextAwards?: NextAwardItem[];
      multiProgramLevel?: AwardModel[];
      allAwards?: AwardModel[];
      handouts?: Parameters<typeof createAwardSideRailBoxItems>[0]['handouts'];
      devEnv?: boolean;
    } = {}
  ) =>
    createAwardSideRailBoxItems({
      translate: translateEcho,
      nextAwards: overrides.nextAwards ?? [],
      multiProgramLevel: overrides.multiProgramLevel ?? [],
      allAwards: overrides.allAwards ?? [],
      aemProgramLevels: aemLevels,
      handouts: overrides.handouts ?? [],
      devEnv: overrides.devEnv,
    });

  it('returns [] when all inputs are empty', () => {
    expect(callBoxes()).toEqual([]);
  });

  it('emits a Next Awards box with trophy icon and a leading SECTION description', () => {
    const next: NextAwardItem[] = [
      {
        path: '/content/dam/gsusa-vtk-redesign/en/awards/bronze-award/bronze-award',
        badgeName: 'Bronze Award',
        badgeId: 'Cadette-BronzeAward-2026',
      },
    ];
    const [box] = callBoxes({ nextAwards: next });
    expect(box.id).toBe('award-side-rail-next');
    expect(box.icon).toBe('trophy');
    expect(box.type).toBe(SideRailBoxType.NEXT_AWARDS);
    expect(box.count).toBe(1);
    expect(box.title).toBe('awardDetailPage.sideRail.nextAwards.header');
    expect(box.items?.[0]).toMatchObject({
      type: SideRailBoxType.SECTION,
      value: 'awardDetailPage.sideRail.nextAwards.description',
    });
  });

  it('produces a NextAward card with MULTI fallback level + a pre-resolved hrefOverride', () => {
    const next: NextAwardItem[] = [
      {
        path: '/content/dam/gsusa-vtk-redesign/en/awards/bronze-award/bronze-award',
        badgeName: 'Bronze Award',
        badgeId: 'Cadette-BronzeAward-2026',
      },
    ];
    const [box] = callBoxes({ nextAwards: next });
    const cardItem = box.items?.[1] as unknown as Record<string, unknown>;
    expect(cardItem).toMatchObject({
      type: SideRailBoxType.NEXT_AWARDS,
      badgeId: 'Cadette-BronzeAward-2026',
      badgeName: 'Bronze Award',
      hrefOverride: '/en/award/bronze-award',
      programLevel: { id: ProgramLevelIds.MULTI, level: '' },
      theme: '',
    });
  });

  it('emits a multi-program-level box with usersThree icon + section + cards', () => {
    const related: AwardModel[] = [
      {
        path: '/content/dam/gsusa-vtk-redesign/en/awards/true-north-award/true-north-award',
        badgeId: 'True-North-2026',
        badgeName: 'True North Award',
        programLevel: [mkLevel(ProgramLevelEnum.JUNIOR), mkLevel(ProgramLevelEnum.CADETTE)],
        theme: { name: 'Leadership Awards' },
      },
    ];
    const [box] = callBoxes({ multiProgramLevel: related });
    expect(box.id).toBe('award-side-rail-multi-level');
    expect(box.icon).toBe('usersThree');
    expect(box.type).toBe(SideRailBoxType.MULTI_LEVEL_GROUP);
    expect(box.count).toBe(1);
    expect(box.items?.[0]).toMatchObject({ type: SideRailBoxType.SECTION });
    const cardItem = box.items?.[1] as unknown as Record<string, unknown>;
    expect(cardItem).toMatchObject({
      type: SideRailBoxType.MULTI_LEVEL_GROUP,
      badgeName: 'True North Award',
      hrefOverride: '/en/award/true-north-award',
      programLevel: { id: ProgramLevelIds.JUNIOR },
      additionalProgramLevels: [{ id: ProgramLevelIds.CADETTE, level: ProgramLevelEnum.CADETTE }],
      theme: 'Leadership Awards',
    });
  });

  it('emits a Handouts box wrapping items into a HANDOUT_ITEMS shape', () => {
    const [box] = callBoxes({
      handouts: [{ id: 'h1', title: 'Worksheet', ariaLabel: 'Download Worksheet', url: 'https://example.com/w.pdf' }],
    });
    expect(box.icon).toBe('files');
    expect(box.type).toBe(SideRailBoxType.HANDOUTS);
    expect(box.title).toBe('awardDetailPage.section.relatedHandouts.header');
    const inner = box.items?.[0] as unknown as Record<string, unknown>;
    expect(inner.type).toBe(SideRailBoxType.HANDOUT_ITEMS);
    expect(inner.header).toBe('awardDetailPage.sideRail.handouts.header');
    expect((inner.handouts as unknown[]).length).toBe(1);
  });

  it('emits all three boxes (in order) when all three inputs are populated', () => {
    const next: NextAwardItem[] = [
      { path: '/dam/.../awards/bronze-award/bronze-award', badgeName: 'Bronze', badgeId: 'b' },
    ];
    const related: AwardModel[] = [
      {
        path: '/dam/.../awards/silver-award/silver-award',
        badgeId: 's',
        badgeName: 'Silver',
        programLevel: [mkLevel(ProgramLevelEnum.SENIOR)],
      },
    ];
    const handouts = [
      { id: 'h1', title: 'Worksheet', ariaLabel: 'Download Worksheet', url: 'https://example.com/w.pdf' },
    ];
    const boxes = callBoxes({ nextAwards: next, multiProgramLevel: related, handouts });
    expect(boxes.map(b => b.id)).toEqual([
      'award-side-rail-next',
      'award-side-rail-multi-level',
      'award-side-rail-handouts',
    ]);
  });

  it('passes the devEnv flag through to RelatedBadge cards', () => {
    const next: NextAwardItem[] = [
      { path: '/dam/.../awards/bronze-award/bronze-award', badgeName: 'Bronze', badgeId: 'b' },
    ];
    const [box] = callBoxes({ nextAwards: next, devEnv: true });
    const cardItem = box.items?.[1] as unknown as Record<string, unknown>;
    expect(cardItem.devEnv).toBe(true);
  });
});
