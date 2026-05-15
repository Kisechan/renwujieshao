import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import type { RefObject } from 'react';
import type { MemeConfig, RoleItem, RoleShape } from '../types';

interface MemeCanvasProps {
  config: MemeConfig;
  stageRef: RefObject<Konva.Stage | null>;
}

interface PreviewImageProps {
  role: RoleItem;
  x: number;
  y: number;
  size: number;
  borderWidth: number;
  borderColor: string;
  textColor: string;
  bodyFontFamily: string;
  roleTitleFontSize: number;
}

const measurementCanvas = document.createElement('canvas');
const measurementContext = measurementCanvas.getContext('2d');

function resolveFontFamily(fontFamily: string) {
  return fontFamily.trim() || 'sans-serif';
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight: number,
) {
  if (!measurementContext) {
    return [text];
  }

  measurementContext.font = `${fontWeight} ${fontSize}px ${resolveFontFamily(fontFamily)}`;

  const lines: string[] = [];

  for (const rawLine of text.split('\n')) {
    let currentLine = '';

    for (const char of Array.from(rawLine || ' ')) {
      const testLine = currentLine + char;
      const testWidth = measurementContext.measureText(testLine).width;

      if (testWidth <= maxWidth || currentLine.length === 0) {
        currentLine = testLine;
        continue;
      }

      lines.push(currentLine);
      currentLine = char;
    }

    lines.push(currentLine || ' ');
  }

  return lines;
}

function fitTextBlock({
  text,
  maxWidth,
  maxHeight,
  maxFontSize,
  minFontSize,
  maxLines,
  fontFamily,
  fontWeight = 700,
  lineHeight = 1.18,
}: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxFontSize: number;
  minFontSize: number;
  maxLines: number;
  fontFamily: string;
  fontWeight?: number;
  lineHeight?: number;
}) {
  if (!measurementContext) {
    return {
      fontSize: minFontSize,
      lines: [text],
      lineHeight,
      fontWeight,
    };
  }

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    measurementContext.font = `${fontWeight} ${fontSize}px ${resolveFontFamily(fontFamily)}`;
    const lines = wrapText(text, maxWidth, fontSize, fontFamily, fontWeight);
    const height = lines.length * fontSize * lineHeight;

    if (lines.length <= maxLines && height <= maxHeight) {
      return {
        fontSize,
        lines,
        lineHeight,
        fontWeight,
      };
    }
  }

  const lines = wrapText(text, maxWidth, minFontSize, fontFamily, fontWeight).slice(0, maxLines);

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1];
    lines[maxLines - 1] = lastLine.length > 1 ? `${lastLine.slice(0, -1)}…` : `${lastLine}…`;
  }

  return {
    fontSize: minFontSize,
    lines,
    lineHeight,
    fontWeight,
  };
}

function useElementWidth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(node);
    setWidth(node.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

function useLoadedImage(src: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const nextImage = new window.Image();
    nextImage.crossOrigin = 'anonymous';
    nextImage.src = src;
    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => setImage(null);

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);

  return image;
}

function getShapeConfig(shape: RoleShape, x: number, y: number, size: number) {
  if (shape === 'circle') {
    return {
      clipFunc(context: Konva.Context) {
        context.beginPath();
        context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        context.closePath();
      },
      rectProps: null,
      isCircle: true,
    };
  }

  if (shape === 'rounded') {
    const radius = size * 0.2;
    return {
      clipFunc(context: Konva.Context) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + size - radius, y);
        context.quadraticCurveTo(x + size, y, x + size, y + radius);
        context.lineTo(x + size, y + size - radius);
        context.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        context.lineTo(x + radius, y + size);
        context.quadraticCurveTo(x, y + size, x, y + size - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
      },
      rectProps: {
        cornerRadius: radius,
      },
      isCircle: false,
    };
  }

  return {
    clipFunc: undefined,
    rectProps: {
      cornerRadius: 0,
    },
    isCircle: false,
  };
}

function PreviewImage({
  role,
  x,
  y,
  size,
  borderWidth,
  borderColor,
  textColor,
  bodyFontFamily,
  roleTitleFontSize,
}: PreviewImageProps) {
  const image = useLoadedImage(role.imageSrc);
  const shapeConfig = getShapeConfig(role.shape, x, y, size);
  const titleLayout = fitTextBlock({
    text: role.title || '未命名',
    maxWidth: size - 28,
    maxHeight: size * 0.36,
    maxFontSize: roleTitleFontSize,
    minFontSize: 16,
    maxLines: 2,
    fontFamily: bodyFontFamily,
    fontWeight: 800,
  });

  return (
    <>
      {shapeConfig.clipFunc ? (
        <Group clipFunc={shapeConfig.clipFunc}>
          {image ? (
            <KonvaImage height={size} image={image} width={size} x={x} y={y} />
          ) : (
            <Rect fill="#f5f5f5" height={size} width={size} x={x} y={y} />
          )}
        </Group>
      ) : image ? (
        <KonvaImage height={size} image={image} width={size} x={x} y={y} />
      ) : (
        <Rect fill="#f5f5f5" height={size} width={size} x={x} y={y} />
      )}

      {role.showTitleOverlay ? (
        <>
          <Rect
            fill="rgba(255,255,255,0.84)"
            height={Math.max(56, titleLayout.lines.length * titleLayout.fontSize * titleLayout.lineHeight + 18)}
            width={size}
            x={x}
            y={y + size - Math.max(56, titleLayout.lines.length * titleLayout.fontSize * titleLayout.lineHeight + 18)}
          />
          <Text
            align="center"
            fill={textColor}
            fontFamily={bodyFontFamily || undefined}
            fontSize={titleLayout.fontSize}
            fontStyle="bold"
            height={Math.max(56, titleLayout.lines.length * titleLayout.fontSize * titleLayout.lineHeight + 18)}
            lineHeight={titleLayout.lineHeight}
            text={titleLayout.lines.join('\n')}
            verticalAlign="middle"
            width={size - 20}
            x={x + 10}
            y={y + size - Math.max(56, titleLayout.lines.length * titleLayout.fontSize * titleLayout.lineHeight + 18)}
          />
        </>
      ) : null}

      {shapeConfig.isCircle ? (
        <Rect
          cornerRadius={size / 2}
          fillEnabled={false}
          height={size}
          hitStrokeWidth={0}
          stroke={borderColor}
          strokeWidth={borderWidth}
          width={size}
          x={x}
          y={y}
        />
      ) : (
        <Rect
          {...shapeConfig.rectProps}
          fillEnabled={false}
          height={size}
          stroke={borderColor}
          strokeWidth={borderWidth}
          width={size}
          x={x}
          y={y}
        />
      )}
    </>
  );
}

function RoleCard({
  role,
  x,
  y,
  size,
  descriptionHeight,
  settings,
}: {
  role: RoleItem;
  x: number;
  y: number;
  size: number;
  descriptionHeight: number;
  settings: MemeConfig['settings'];
}) {
  const titleLayout = fitTextBlock({
    text: role.title || '未命名',
    maxWidth: size - 28,
    maxHeight: size - 28,
    maxFontSize: settings.roleTitleFontSize,
    minFontSize: 18,
    maxLines: 3,
    fontFamily: settings.bodyFontFamily,
    fontWeight: 800,
  });

  const descriptionLayout = fitTextBlock({
    text: role.description || ' ',
    maxWidth: size + 34,
    maxHeight: descriptionHeight - 12,
    maxFontSize: settings.descriptionFontSize,
    minFontSize: 14,
    maxLines: 3,
    fontFamily: settings.bodyFontFamily,
    fontWeight: 600,
  });

  const shapeConfig = getShapeConfig(role.shape, x, y, size);

  return (
    <Group>
      {role.displayType === 'image' ? (
        <PreviewImage
          bodyFontFamily={settings.bodyFontFamily}
          borderColor={settings.borderColor}
          borderWidth={settings.borderWidth}
          role={role}
          roleTitleFontSize={settings.roleTitleFontSize}
          size={size}
          textColor={settings.textColor}
          x={x}
          y={y}
        />
      ) : (
        <>
          {shapeConfig.isCircle ? (
            <Rect
              cornerRadius={size / 2}
              fillEnabled={false}
              height={size}
              stroke={settings.borderColor}
              strokeWidth={settings.borderWidth}
              width={size}
              x={x}
              y={y}
            />
          ) : (
            <Rect
              {...shapeConfig.rectProps}
              fillEnabled={false}
              height={size}
              stroke={settings.borderColor}
              strokeWidth={settings.borderWidth}
              width={size}
              x={x}
              y={y}
            />
          )}

          <Text
            align="center"
            fill={settings.textColor}
            fontFamily={settings.bodyFontFamily || undefined}
            fontSize={titleLayout.fontSize}
            fontStyle="bold"
            height={size - 22}
            lineHeight={titleLayout.lineHeight}
            text={titleLayout.lines.join('\n')}
            verticalAlign="middle"
            width={size - 22}
            x={x + 11}
            y={y + 11}
          />
        </>
      )}

      <Text
        align="center"
        fill={settings.textColor}
        fontFamily={settings.bodyFontFamily || undefined}
        fontSize={descriptionLayout.fontSize}
        fontStyle="normal"
        height={descriptionHeight}
        lineHeight={descriptionLayout.lineHeight}
        text={descriptionLayout.lines.join('\n')}
        verticalAlign="middle"
        width={size + 42}
        x={x - 21}
        y={y + size + 8}
      />
    </Group>
  );
}

export default function MemeCanvas({ config, stageRef }: MemeCanvasProps) {
  const { containerRef, width } = useElementWidth();
  const { settings } = config;

  const titleLayout = fitTextBlock({
    text: config.title || '登场人物介绍',
    maxWidth: settings.canvasPadding * 2 + settings.roleSize * 2 + settings.gridGap - settings.canvasPadding * 0.6,
    maxHeight: settings.titleFontSize * 2.6,
    maxFontSize: settings.titleFontSize,
    minFontSize: 26,
    maxLines: 2,
    fontFamily: settings.titleFontFamily,
    fontWeight: 900,
    lineHeight: 1.05,
  });

  const descriptionHeight = Math.max(84, settings.descriptionFontSize * 3.6);
  const canvasWidth = settings.canvasPadding * 2 + settings.roleSize * 2 + settings.gridGap;
  const titleHeight = Math.max(96, titleLayout.lines.length * titleLayout.fontSize * titleLayout.lineHeight + 28);
  const canvasHeight =
    settings.canvasPadding * 2 +
    titleHeight +
    settings.titleGap +
    settings.roleSize * 2 +
    descriptionHeight * 2 +
    settings.gridGap;

  const previewScale = width > 0 ? Math.min(1, width / canvasWidth) : 1;

  const positions = config.roles.map((role, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);

    return {
      role,
      x: settings.canvasPadding + column * (settings.roleSize + settings.gridGap),
      y:
        settings.canvasPadding +
        titleHeight +
        settings.titleGap +
        row * (settings.roleSize + descriptionHeight + settings.gridGap),
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="section-title">实时预览</div>
          <h2 className="mt-1 text-2xl font-bold text-neutral-900">只导出右侧白底画布</h2>
        </div>
        <div className="border border-black bg-white px-3 py-2 text-sm text-neutral-700">
          {Math.round(canvasWidth)} × {Math.round(canvasHeight)}
        </div>
      </div>

      <div className="preview-grid min-h-[420px] overflow-auto border border-black p-4">
        <div className="w-full" ref={containerRef}>
          <div
            className="overflow-hidden border border-neutral-300 bg-white"
            style={{
              height: canvasHeight * previewScale,
              width: canvasWidth * previewScale,
            }}
          >
            <Stage
              height={canvasHeight}
              ref={stageRef}
              style={{
                overflow: 'hidden',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
              width={canvasWidth}
            >
              <Layer>
                <Rect fill={settings.backgroundColor} height={canvasHeight} width={canvasWidth} x={0} y={0} />

                <Text
                  align="center"
                  fill={settings.textColor}
                  fontFamily={settings.titleFontFamily || undefined}
                  fontSize={titleLayout.fontSize}
                  fontStyle="bold"
                  height={titleHeight}
                  lineHeight={titleLayout.lineHeight}
                  text={titleLayout.lines.join('\n')}
                  verticalAlign="middle"
                  width={canvasWidth - settings.canvasPadding * 1.2}
                  x={settings.canvasPadding * 0.6}
                  y={settings.canvasPadding * 0.32}
                />

                {positions.map(({ role, x, y }) => (
                  <RoleCard
                    descriptionHeight={descriptionHeight}
                    key={role.id}
                    role={role}
                    settings={settings}
                    size={settings.roleSize}
                    x={x}
                    y={y}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}
