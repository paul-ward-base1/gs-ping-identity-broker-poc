import type { ProjectName, ViewportName } from './types';
import { QA_ENV, BASE_URL, VIEWPORTS, TEST_DIRS } from './constants';

// Gets the info for 1 project based on the expected configuration
function getProject(project: ProjectName, env: string, viewport?: ViewportName) {
  if (!BASE_URL[project] || !TEST_DIRS[project]) {
    return undefined;
  }

  const device = viewport ? VIEWPORTS[viewport] : {};
  const name = viewport ? `${project}:${viewport}` : project;
  const testDir = TEST_DIRS[project];

  const use = {
    ...device,
    baseURL: BASE_URL[project],
    ignoreHTTPSErrors: true,
  };

  const metadata = {
    project,
    env: env,
    viewport,
  };

  return {
    name,
    testDir,
    use,
    metadata,
  };
}

// Return a list of projects combination for api + (app, storybook)*(desktop, tablet, mobile)
function makeProjects() {
  return ['app', 'storybook', 'api']
    .flatMap(project => {
      return project == 'api'
        ? getProject(project as ProjectName, QA_ENV)
        : Object.keys(VIEWPORTS).map(viewport => getProject(project as ProjectName, QA_ENV, viewport as ViewportName));
    })
    .filter(i => i !== undefined);
}

// Avoid starting local servers if we're not testing locally
function makeWebServers() {
  if (QA_ENV !== 'local') {
    return undefined;
  }

  return [
    {
      command: 'ENV=dev yarn dev',
      url: BASE_URL.app,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'yarn storybook',
      url: BASE_URL.storybook,
      reuseExistingServer: !process.env.CI,
    },
  ];
}

export { makeProjects, makeWebServers };
