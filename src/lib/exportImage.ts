import type { Stage as KonvaStage } from 'konva/lib/Stage';

async function stageToBlob(stage: KonvaStage, pixelRatio = 2) {
  const canvas = stage.toCanvas({ pixelRatio });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG 导出失败，请重试。'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

export async function exportStageAsPng(
  stage: KonvaStage,
  filename: string,
  pixelRatio = 2.5,
) {
  const blob = await stageToBlob(stage, pixelRatio);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export async function copyStageImageToClipboard(
  stage: KonvaStage,
  pixelRatio = 2.5,
) {
  if (
    !navigator.clipboard ||
    typeof window.ClipboardItem === 'undefined'
  ) {
    throw new Error('Clipboard API unavailable');
  }

  const blob = await stageToBlob(stage, pixelRatio);
  await navigator.clipboard.write([
    new window.ClipboardItem({
      'image/png': blob,
    }),
  ]);
}
