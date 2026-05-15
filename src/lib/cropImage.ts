import type { Area } from 'react-easy-crop';

function createImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed'));
    image.src = source;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const radians = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(radians) * width) +
      Math.abs(Math.sin(radians) * height),
    height:
      Math.abs(Math.sin(radians) * width) +
      Math.abs(Math.cos(radians) * height),
  };
}

export async function getCroppedImage(
  source: string,
  pixelCrop: Area,
  rotation = 0,
) {
  const image = await createImage(source);
  const radians = getRadianAngle(rotation);
  const boundingBox = rotateSize(image.width, image.height, rotation);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas context unavailable');
  }

  canvas.width = boundingBox.width;
  canvas.height = boundingBox.height;

  context.translate(boundingBox.width / 2, boundingBox.height / 2);
  context.rotate(radians);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedContext = croppedCanvas.getContext('2d');

  if (!croppedContext) {
    throw new Error('Canvas context unavailable');
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return croppedCanvas.toDataURL('image/png');
}
