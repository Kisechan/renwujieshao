import type { MemeConfig, RoleItem } from '../types';

export const LOCAL_STORAGE_KEY = 'meme-character-intro-draft';

const defaultRoles: RoleItem[] = [
  {
    id: 'role-1',
    title: 'live',
    description: 'eplus已中选',
    displayType: 'text',
    shape: 'circle',
    imageSrc: null,
    originalImageSrc: null,
    showTitleOverlay: true,
  },
  {
    id: 'role-2',
    title: '娃娃',
    description: '痛包已装满',
    displayType: 'text',
    shape: 'circle',
    imageSrc: null,
    originalImageSrc: null,
    showTitleOverlay: true,
  },
  {
    id: 'role-3',
    title: '航班',
    description: '已抵达浦东机场',
    displayType: 'text',
    shape: 'circle',
    imageSrc: null,
    originalImageSrc: null,
    showTitleOverlay: true,
  },
  {
    id: 'role-4',
    title: '老板',
    description: '周末有个需求你加下班',
    displayType: 'text',
    shape: 'circle',
    imageSrc: null,
    originalImageSrc: null,
    showTitleOverlay: true,
  },
];

export const defaultCanvasSettings: MemeConfig['settings'] = {
  backgroundColor: '#ffffff',
  textColor: '#111111',
  borderColor: '#111111',
  borderWidth: 6,
  roleSize: 258,
  gridGap: 68,
  canvasPadding: 86,
  titleGap: 34,
  titleFontSize: 64,
  titleFontFamily: '',
  roleTitleFontSize: 52,
  descriptionFontSize: 28,
  bodyFontFamily: '',
};

export function createDefaultMemeConfig(): MemeConfig {
  return {
    title: '登场人物介绍',
    roles: defaultRoles.map((role) => ({ ...role })),
    settings: { ...defaultCanvasSettings },
  };
}
