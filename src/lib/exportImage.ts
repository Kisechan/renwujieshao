import type Konva from 'konva';

export type ExportFormat = 'png' | 'jpeg';

interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
}

function stageToBlob(
  stage: Konva.Stage,
  format: ExportFormat,
  pixelRatio = 2,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    stage.toBlob({
      mimeType,
      quality: format === 'jpeg' ? 0.95 : undefined,
      pixelRatio,
      callback(blob) {
        if (!blob) {
          reject(new Error('图片导出失败'));
          return;
        }

        resolve(blob);
      },
    });
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadStageImage(
  stage: Konva.Stage | null,
  format: ExportFormat,
  options: ExportOptions = {},
) {
  if (!stage) {
    throw new Error('当前画布尚未就绪');
  }

  const pixelRatio = options.pixelRatio ?? 3;
  const blob = await stageToBlob(stage, format, pixelRatio);
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const fileName = options.fileName ?? `meme-export.${extension}`;

  triggerDownload(blob, fileName);
}

export async function copyStageToClipboard(stage: Konva.Stage | null, pixelRatio = 3) {
  if (!stage) {
    throw new Error('当前画布尚未就绪');
  }

  if (!window.ClipboardItem || !navigator.clipboard?.write) {
    throw new Error('当前浏览器不支持复制图片到剪贴板');
  }

  const blob = await stageToBlob(stage, 'png', pixelRatio);
  const clipboardItem = new window.ClipboardItem({
    'image/png': blob,
  });

  await navigator.clipboard.write([clipboardItem]);
}

