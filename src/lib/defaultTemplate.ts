import type { MemeConfig, RoleItem } from '../types';

export const DRAFT_STORAGE_KEY = 'meme-character-intro-draft';

export const TITLE_FONT_OPTIONS = [
  {
    label: '报刊宋体',
    value: '"Songti SC","STSong","SimSun","Noto Serif SC",serif',
  },
  {
    label: '思源宋体',
    value: '"Noto Serif SC","Source Han Serif SC","Songti SC",serif',
  },
  {
    label: '现代黑体',
    value: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
  },
] as const;

function createRole(
  id: string,
  title: string,
  description: string,
): RoleItem {
  return {
    id,
    title,
    description,
    displayType: 'text',
    shape: 'circle',
    titleFontSize: 58,
    titleFontWeight: 700,
    titleColor: '#111111',
    descriptionFontSize: 28,
    descriptionColor: '#111111',
    descriptionWrap: true,
    overlayTitleOnImage: true,
    imageSrc: null,
    originalImageSrc: null,
    cropState: {
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
    },
  };
}

export function createDefaultTemplate(): MemeConfig {
  return {
    title: '登场人物介绍',
    settings: {
      canvasWidth: 1080,
      canvasHeight: 1080,
      backgroundColor: '#ffffff',
      titleFontSize: 78,
      titleFontWeight: 700,
      titleFontFamily: TITLE_FONT_OPTIONS[0].value,
      globalTextColor: '#111111',
      lineColor: '#111111',
      lineThickness: 6,
      lineMarginX: 132,
      roleBorderColor: '#111111',
      roleBorderWidth: 6,
      roleSize: 288,
      gridGap: 88,
    },
    roles: [
      createRole('role-1', 'live', 'eplus已中选'),
      createRole('role-2', '娃娃', '痛包已装满'),
      createRole('role-3', '航班', '已抵达浦东机场'),
      createRole('role-4', '老板', '周末有个需求你加下班'),
    ],
  };
}

export function hydrateMemeConfig(value: unknown): MemeConfig {
  const fallback = createDefaultTemplate();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const input = value as Partial<MemeConfig>;
  const roles = Array.isArray(input.roles) ? input.roles : [];

  return {
    title: typeof input.title === 'string' ? input.title : fallback.title,
    settings: {
      ...fallback.settings,
      ...(input.settings && typeof input.settings === 'object'
        ? input.settings
        : {}),
    },
    roles: fallback.roles.map((role, index) => {
      const nextRole = roles[index];
      if (!nextRole || typeof nextRole !== 'object') {
        return role;
      }

      return {
        ...role,
        ...nextRole,
        cropState: {
          ...role.cropState,
          ...(nextRole.cropState ?? {}),
        },
      };
    }),
  };
}
