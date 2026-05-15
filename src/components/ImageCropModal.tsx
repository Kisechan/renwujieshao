import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImage } from '../lib/cropImage';

interface ImageCropModalProps {
  imageSrc: string | null;
  isOpen: boolean;
  roleLabel: string;
  onCancel: () => void;
  onConfirm: (croppedImage: string) => void;
}

export default function ImageCropModal({
  imageSrc,
  isOpen,
  roleLabel,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !imageSrc) {
      return;
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setError(null);
    setIsSaving(false);
  }, [imageSrc, isOpen]);

  if (!isOpen || !imageSrc) {
    return null;
  }

  async function handleConfirm() {
    if (!croppedAreaPixels) {
      setError('请先调整裁剪区域');
      return;
    }

    if (!imageSrc) {
      setError('缺少待裁剪图片');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const croppedImage = await getCroppedImage(imageSrc, croppedAreaPixels, rotation);
      onConfirm(croppedImage);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : '图片裁剪失败');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-black bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-black px-6 py-5">
          <div>
            <div className="section-title">图片裁剪</div>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900">调整 {roleLabel} 的展示区域</h2>
            <p className="mt-1 text-sm text-neutral-600">支持拖拽、缩放和旋转，确认后会应用到当前角色。</p>
          </div>
          <button className="btn btn-secondary" onClick={onCancel} type="button">
            关闭
          </button>
        </div>

        <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[360px] bg-neutral-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>

          <div className="flex flex-col gap-6 border-t border-black px-6 py-5 lg:border-l lg:border-t-0">
            <div className="field">
              <label className="field-label" htmlFor="crop-zoom">
                缩放
              </label>
              <input
                className="w-full"
                id="crop-zoom"
                max={3}
                min={1}
                onChange={(event) => setZoom(Number(event.target.value))}
                step={0.01}
                type="range"
                value={zoom}
              />
              <div className="field-hint">{zoom.toFixed(2)}x</div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="crop-rotation">
                旋转
              </label>
              <input
                className="w-full"
                id="crop-rotation"
                max={180}
                min={-180}
                onChange={(event) => setRotation(Number(event.target.value))}
                step={1}
                type="range"
                value={rotation}
              />
              <div className="field-hint">{rotation}°</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setRotation(0);
                }}
                type="button"
              >
                重置
              </button>
              <button
                className="btn btn-primary"
                disabled={isSaving}
                onClick={handleConfirm}
                type="button"
              >
                {isSaving ? '应用中...' : '应用裁剪'}
              </button>
            </div>

            {error ? (
              <div className="border border-red-300 bg-white px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
