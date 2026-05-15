import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { MemeConfig, RoleItem, ShapeType } from '../types';

type MemeCanvasProps = {
  config: MemeConfig;
  stageRef: RefObject<KonvaStage | null>;
};

type TextLayout = {
  fontSize: number;
  text: string;
  height: number;
};

const UI_FONT_FAMILY =
  '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';

function getMeasureContext() {
  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  return canvas.getContext('2d');
}

function wrapParagraph(
  text: string,
  context: CanvasRenderingContext2D,
  maxWidth: number,
  allowWrap: boolean,
) {
  if (!text) {
    return [''];
  }

  if (!allowWrap) {
    return [text];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const character of Array.from(text)) {
    const testLine = `${currentLine}${character}`;
    if (
      currentLine &&
      context.measureText(testLine).width > maxWidth
    ) {
      lines.push(currentLine.trimEnd());
      currentLine = character.trimStart();
    } else {
      currentLine = testLine;
    }
  }

  lines.push(currentLine.trimEnd());
  return lines.filter(Boolean).length > 0 ? lines.filter(Boolean) : [''];
}

function fitText({
  text,
  maxFontSize,
  minFontSize,
  maxWidth,
  maxHeight,
  maxLines,
  fontFamily,
  fontWeight,
  allowWrap,
  lineHeight,
}: {
  text: string;
  maxFontSize: number;
  minFontSize: number;
  maxWidth: number;
  maxHeight: number;
  maxLines: number;
  fontFamily: string;
  fontWeight: number;
  allowWrap: boolean;
  lineHeight: number;
}): TextLayout {
  const context = getMeasureContext();
  if (!context) {
    return {
      fontSize: maxFontSize,
      text,
      height: maxFontSize * lineHeight,
    };
  }

  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    context.font = `${fontWeight >= 600 ? '700' : '400'} ${size}px ${fontFamily}`;
    const lines = text
      .split('\n')
      .flatMap((paragraph) =>
        wrapParagraph(paragraph, context, maxWidth, allowWrap),
      );
    const height = lines.length * size * lineHeight;
    const widestLine = Math.max(
      ...lines.map((line) => context.measureText(line || ' ').width),
      0,
    );

    if (
      lines.length <= maxLines &&
      height <= maxHeight &&
      widestLine <= maxWidth + 1
    ) {
      return { fontSize: size, text: lines.join('\n'), height };
    }
  }

  context.font = `${fontWeight >= 600 ? '700' : '400'} ${minFontSize}px ${fontFamily}`;
  const lines = text
    .split('\n')
    .flatMap((paragraph) =>
      wrapParagraph(paragraph, context, maxWidth, allowWrap),
    )
    .slice(0, maxLines);

  return {
    fontSize: minFontSize,
    text: lines.join('\n'),
    height: lines.length * minFontSize * lineHeight,
  };
}

function useLoadedImage(source: string | null) {
  const [imageRecord, setImageRecord] = useState<{
    source: string;
    image: HTMLImageElement;
  } | null>(null);

  useEffect(() => {
    if (!source) {
      return;
    }

    const nextImage = new window.Image();
    nextImage.onload = () =>
      setImageRecord({
        source,
        image: nextImage,
      });
    nextImage.onerror = () => setImageRecord(null);
    nextImage.src = source;

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [source]);

  if (!source || imageRecord?.source !== source) {
    return null;
  }

  return imageRecord.image;
}

function getRoleTitleFontFamily(title: string, fallback: string) {
  const containsCjk = /[\u3400-\u9fff]/.test(title);
  if (!containsCjk && /[A-Za-z]/.test(title)) {
    return 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
  }

  return fallback;
}

function ShapeFrame({
  shape,
  x,
  y,
  size,
  stroke,
  strokeWidth,
}: {
  shape: ShapeType;
  x: number;
  y: number;
  size: number;
  stroke: string;
  strokeWidth: number;
}) {
  if (shape === 'circle') {
    return (
      <Circle
        x={x + size / 2}
        y={y + size / 2}
        radius={size / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <Rect
      x={x}
      y={y}
      width={size}
      height={size}
      cornerRadius={shape === 'rounded' ? size * 0.14 : 0}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function ShapeClip({
  shape,
  x,
  y,
  size,
  children,
}: {
  shape: ShapeType;
  x: number;
  y: number;
  size: number;
  children: ReactNode;
}) {
  return (
    <Group
      clipFunc={(context) => {
        context.beginPath();
        if (shape === 'circle') {
          context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, false);
          context.closePath();
          return;
        }

        const radius = shape === 'rounded' ? size * 0.14 : 0;
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
      }}
    >
      {children}
    </Group>
  );
}

function RoleArtwork({
  role,
  x,
  y,
  size,
  borderColor,
  borderWidth,
  titleFallbackFamily,
  backgroundColor,
}: {
  role: RoleItem;
  x: number;
  y: number;
  size: number;
  borderColor: string;
  borderWidth: number;
  titleFallbackFamily: string;
  backgroundColor: string;
}) {
  const image = useLoadedImage(role.imageSrc);
  const fontFamily = getRoleTitleFontFamily(role.title, titleFallbackFamily);

  const titleLayout = fitText({
    text: role.title,
    maxFontSize: role.titleFontSize,
    minFontSize: 18,
    maxWidth: size * 0.76,
    maxHeight: size * 0.5,
    maxLines: role.displayType === 'image' && role.overlayTitleOnImage ? 2 : 3,
    fontFamily,
    fontWeight: role.titleFontWeight,
    allowWrap: true,
    lineHeight: 1.08,
  });

  const overlayHeight = size * 0.22;

  return (
    <>
      <ShapeFrame
        shape={role.shape}
        x={x}
        y={y}
        size={size}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {role.displayType === 'image' && image ? (
        <>
          <ShapeClip shape={role.shape} x={x} y={y} size={size}>
            <KonvaImage image={image} x={x} y={y} width={size} height={size} />
            {role.overlayTitleOnImage && role.title ? (
              <Rect
                x={x}
                y={y + size - overlayHeight}
                width={size}
                height={overlayHeight}
                fill="rgba(255,255,255,0.84)"
              />
            ) : null}
          </ShapeClip>

          {role.overlayTitleOnImage && role.title ? (
            <Text
              x={x + size * 0.08}
              y={y + size - overlayHeight + size * 0.03}
              width={size * 0.84}
              height={overlayHeight - size * 0.04}
              align="center"
              verticalAlign="middle"
              text={titleLayout.text}
              fontSize={titleLayout.fontSize}
              fontStyle={role.titleFontWeight >= 600 ? 'bold' : 'normal'}
              fontFamily={fontFamily}
              fill={role.titleColor}
              lineHeight={1.06}
            />
          ) : null}
        </>
      ) : (
        <Text
          x={x + size * 0.12}
          y={y + size * 0.18}
          width={size * 0.76}
          height={size * 0.64}
          align="center"
          verticalAlign="middle"
          text={titleLayout.text}
          fontSize={titleLayout.fontSize}
          fontStyle={role.titleFontWeight >= 600 ? 'bold' : 'normal'}
          fontFamily={fontFamily}
          fill={role.titleColor || backgroundColor}
          lineHeight={1.08}
        />
      )}
    </>
  );
}

function MemeCanvas({ config, stageRef }: MemeCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setAvailableWidth(entry.contentRect.width);
    });

    observer.observe(wrapperRef.current);
    setAvailableWidth(wrapperRef.current.clientWidth);

    return () => observer.disconnect();
  }, []);

  const { stageScale, titleLayout, layout } = useMemo(() => {
    const { canvasWidth, canvasHeight, roleSize, gridGap } = config.settings;
    const previewWidth = availableWidth > 0 ? availableWidth : canvasWidth;
    const scale = Math.min(1, previewWidth / canvasWidth);
    const topPadding = canvasHeight * 0.075;
    const bottomPadding = canvasHeight * 0.06;
    const titleLayoutResult = fitText({
      text: config.title,
      maxFontSize: config.settings.titleFontSize,
      minFontSize: 26,
      maxWidth: canvasWidth - 120,
      maxHeight: canvasHeight * 0.17,
      maxLines: 2,
      fontFamily: config.settings.titleFontFamily,
      fontWeight: config.settings.titleFontWeight,
      allowWrap: true,
      lineHeight: 1.12,
    });

    const lineY =
      topPadding + titleLayoutResult.height + Math.max(16, canvasHeight * 0.02);
    const minGridTop = lineY + config.settings.lineThickness + canvasHeight * 0.04;
    const descGap = Math.max(14, canvasHeight * 0.014);
    const descScale = 0.34;
    const maxGridHeight = canvasHeight - minGridTop - bottomPadding;
    const maxGridWidth = canvasWidth - 2 * Math.max(50, canvasWidth * 0.08);
    const resolvedGap = Math.min(gridGap, maxGridWidth * 0.18);
    const maxRoleByWidth = (maxGridWidth - resolvedGap) / 2;
    const maxRoleByHeight =
      (maxGridHeight - resolvedGap - descGap * 2) / (2 * (1 + descScale));
    const resolvedRoleSize = Math.max(
      160,
      Math.min(roleSize, maxRoleByWidth, maxRoleByHeight),
    );
    const descriptionHeight = resolvedRoleSize * descScale;
    const cardHeight = resolvedRoleSize + descGap + descriptionHeight;
    const gridHeight = cardHeight * 2 + resolvedGap;
    const gridWidth = resolvedRoleSize * 2 + resolvedGap;
    const gridStartX = (canvasWidth - gridWidth) / 2;
    const gridStartY =
      minGridTop + Math.max(0, (maxGridHeight - gridHeight) / 2);

    return {
      stageScale: scale,
      titleLayout: titleLayoutResult,
      layout: {
        topPadding,
        lineY,
        descGap,
        descriptionHeight,
        gridStartX,
        gridStartY,
        resolvedGap,
        resolvedRoleSize,
      },
    };
  }, [availableWidth, config]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        ref={wrapperRef}
        className="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-[28px] border border-stone-300 bg-[linear-gradient(180deg,#fbfaf6_0%,#f0ece2_100%)] p-3 md:p-5"
      >
        <div
          className="rounded-[24px] border border-stone-300 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
          style={{
            width: config.settings.canvasWidth * stageScale + 24,
          }}
        >
          <Stage
            ref={stageRef}
            width={config.settings.canvasWidth}
            height={config.settings.canvasHeight}
            scaleX={stageScale}
            scaleY={stageScale}
            style={{
              width: config.settings.canvasWidth * stageScale,
              height: config.settings.canvasHeight * stageScale,
              display: 'block',
              background: config.settings.backgroundColor,
            }}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={config.settings.canvasWidth}
                height={config.settings.canvasHeight}
                fill={config.settings.backgroundColor}
              />

              <Text
                x={60}
                y={layout.topPadding}
                width={config.settings.canvasWidth - 120}
                align="center"
                text={titleLayout.text}
                fontSize={titleLayout.fontSize}
                fontStyle={
                  config.settings.titleFontWeight >= 600 ? 'bold' : 'normal'
                }
                fontFamily={config.settings.titleFontFamily}
                fill={config.settings.globalTextColor}
                lineHeight={1.12}
              />

              <Line
                points={[
                  config.settings.lineMarginX,
                  layout.lineY,
                  config.settings.canvasWidth - config.settings.lineMarginX,
                  layout.lineY,
                ]}
                stroke={config.settings.lineColor}
                strokeWidth={config.settings.lineThickness}
              />

              {config.roles.map((role, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x =
                  layout.gridStartX +
                  col * (layout.resolvedRoleSize + layout.resolvedGap);
                const y =
                  layout.gridStartY +
                  row *
                    (layout.resolvedRoleSize +
                      layout.descGap +
                      layout.descriptionHeight +
                      layout.resolvedGap);

                const descriptionLayout = fitText({
                  text: role.description,
                  maxFontSize: role.descriptionFontSize,
                  minFontSize: 12,
                  maxWidth: layout.resolvedRoleSize * 1.2,
                  maxHeight: layout.descriptionHeight,
                  maxLines: role.descriptionWrap ? 3 : 1,
                  fontFamily: UI_FONT_FAMILY,
                  fontWeight: 500,
                  allowWrap: role.descriptionWrap,
                  lineHeight: 1.18,
                });

                return (
                  <Group key={role.id}>
                    <RoleArtwork
                      role={role}
                      x={x}
                      y={y}
                      size={layout.resolvedRoleSize}
                      borderColor={config.settings.roleBorderColor}
                      borderWidth={config.settings.roleBorderWidth}
                      titleFallbackFamily={config.settings.titleFontFamily}
                      backgroundColor={config.settings.globalTextColor}
                    />

                    <Text
                      x={x - layout.resolvedRoleSize * 0.1}
                      y={y + layout.resolvedRoleSize + layout.descGap}
                      width={layout.resolvedRoleSize * 1.2}
                      height={layout.descriptionHeight}
                      align="center"
                      verticalAlign="top"
                      text={descriptionLayout.text}
                      fontSize={descriptionLayout.fontSize}
                      fontFamily={UI_FONT_FAMILY}
                      fill={role.descriptionColor || config.settings.globalTextColor}
                      lineHeight={1.18}
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default MemeCanvas;
