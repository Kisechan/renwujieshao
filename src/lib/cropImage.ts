const TO_RADIANS = Math.PI / 180;

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('图片加载失败')));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = src;
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = rotation * TO_RADIANS;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
  rotation = 0,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('浏览器不支持 Canvas');
  }

  const safeArea = rotateSize(image.width, image.height, rotation);
  canvas.width = safeArea.width;
  canvas.height = safeArea.height;

  context.translate(safeArea.width / 2, safeArea.height / 2);
  context.rotate(rotation * TO_RADIANS);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedContext = croppedCanvas.getContext('2d');

  if (!croppedContext) {
    throw new Error('浏览器不支持裁剪');
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

