export type DisplayType = 'text' | 'image';
export type ShapeType = 'circle' | 'square' | 'rounded';

export type CropState = {
  crop: {
    x: number;
    y: number;
  };
  zoom: number;
  rotation: number;
};

export type RoleItem = {
  id: string;
  title: string;
  description: string;
  displayType: DisplayType;
  shape: ShapeType;
  titleFontSize: number;
  titleFontWeight: number;
  titleColor: string;
  descriptionFontSize: number;
  descriptionColor: string;
  descriptionWrap: boolean;
  overlayTitleOnImage: boolean;
  imageSrc: string | null;
  originalImageSrc: string | null;
  cropState: CropState;
};

export type CanvasSettings = {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  titleFontSize: number;
  titleFontWeight: number;
  titleFontFamily: string;
  globalTextColor: string;
  lineColor: string;
  lineThickness: number;
  lineMarginX: number;
  roleBorderColor: string;
  roleBorderWidth: number;
  roleSize: number;
  gridGap: number;
};

export type MemeConfig = {
  title: string;
  settings: CanvasSettings;
  roles: RoleItem[];
};

export type CropResult = {
  imageSrc: string;
  cropState: CropState;
};
