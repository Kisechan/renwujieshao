export type RoleDisplayType = 'text' | 'image';
export type RoleShape = 'circle' | 'square' | 'rounded';

export interface RoleItem {
  id: string;
  title: string;
  description: string;
  displayType: RoleDisplayType;
  shape: RoleShape;
  imageSrc: string | null;
  originalImageSrc: string | null;
  showTitleOverlay: boolean;
}

export interface CanvasSettings {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  roleSize: number;
  gridGap: number;
  canvasPadding: number;
  titleGap: number;
  titleFontSize: number;
  titleFontFamily: string;
  roleTitleFontSize: number;
  descriptionFontSize: number;
  bodyFontFamily: string;
}

export interface MemeConfig {
  title: string;
  roles: RoleItem[];
  settings: CanvasSettings;
}

export interface CropResult {
  imageSrc: string;
}

