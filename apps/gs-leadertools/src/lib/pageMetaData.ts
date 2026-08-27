export const getPageMetaData = (pathname: string, lang?: string) => {
  const languageCode = lang ?? pathname.split('/')[1] ?? 'en';

  let contentType: string | null = null;
  let badgeId: string | null = null;
  let badgeName: string | null = null;
  let activityName: string | null = null;
  let programLevel: string | null = null;
  let theme: string | null = null;

  const toggleValue = (document.querySelector('#gs-content-toggle') as HTMLInputElement)?.value;
  if (toggleValue) {
    contentType = toggleValue;
  }

  if (!contentType) {
    if (pathname.includes('/badges/')) {
      contentType = 'badge';
      badgeId = pathname.split('/badges/')[1]?.split('/')[0];
      badgeName = document.querySelector('meta[name="badge-name"]')?.getAttribute('content') ?? null;
      programLevel = getProgramLevelsFromDOM();
    } else if (pathname.includes('/activities/')) {
      contentType = 'activity';
      activityName = document.querySelector('meta[name="activity-name"]')?.getAttribute('content') ?? null;
      programLevel = getProgramLevelsFromDOM();
    }
  }

  return {
    event: 'page_view',
    content_type: contentType,
    program_level: programLevel,
    theme,
    badge_id: badgeId,
    badge_name: badgeName,
    activity_name: activityName,
    language_code: languageCode,
  };
};

const getProgramLevelsFromDOM = (): string | null => {
  const levels: string[] = [];
  const possibleLevels = ['Daisy', 'Brownie', 'Junior'];

  possibleLevels.forEach(level => {
    if (document.body.classList.contains(level)) {
      levels.push(level);
    }
  });

  if (levels.length === 0) return null;
  if (levels.length === 3) return 'All';
  return levels.join(', ');
};
