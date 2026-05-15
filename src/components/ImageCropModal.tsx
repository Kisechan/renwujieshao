import { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { getCroppedImage } from '../lib/cropImage';
import type { CropResult, RoleItem } from '../types';

type ImageCropModalProps = {
  isOpen: boolean;
  role: RoleItem | null;
  source: string | null;
  onClose: () => void;
  onConfirm: (result: CropResult) => void;
  onError: (message: string) => void;
};

type CropSessionProps = Omit<ImageCropModalProps, 'isOpen'> & {
  role: RoleItem;
  source: string;
};

function CropSession({
  role,
  source,
  onClose,
  onConfirm,
  onError,
}: CropSessionProps) {
  const [crop, setCrop] = useState(() => role.cropState.crop);
  const [zoom, setZoom] = useState(() => role.cropState.zoom);
  const [rotation, setRotation] = useState(() => role.cropState.rotation);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      onError('请先调整图片裁剪区域。');
      return;
    }

    setSubmitting(true);

    try {
      const imageSrc = await getCroppedImage(source, croppedAreaPixels, rotation);
      onConfirm({
        imageSrc,
        cropState: {
          crop,
          zoom,
          rotation,
        },
      });
    } catch {
      onError('图片裁剪失败，请尝试重新上传。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-stone-300 bg-[#f9f7f1] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Crop Image
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {role.title || '角色图片'} 裁剪
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              拖拽图片调整位置，使用缩放和旋转微调，确认后会应用到当前角色卡片。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800"
          >
            关闭
          </button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-stone-300 bg-stone-950">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape={role.shape === 'circle' ? 'round' : 'rect'}
              showGrid={false}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, croppedArea) => setCroppedAreaPixels(croppedArea)}
            />
          </div>

          <div className="space-y-5 rounded-[24px] border border-stone-300 bg-white p-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>缩放</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              <span className="text-xs text-stone-500">{zoom.toFixed(2)}x</span>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>旋转</span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
              />
              <span className="text-xs text-stone-500">{rotation}°</span>
            </label>

            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
              建议使用接近正方形的人像素材。最终会按当前角色的形状裁切显示，并支持在图片上叠加标题。
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-400"
              >
                {submitting ? '应用中...' : '确认裁剪'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCropModal({
  isOpen,
  role,
  source,
  onClose,
  onConfirm,
  onError,
}: ImageCropModalProps) {
  if (!isOpen || !role || !source) {
    return null;
  }

  return (
    <CropSession
      key={`${role.id}-${source}`}
      role={role}
      source={source}
      onClose={onClose}
      onConfirm={onConfirm}
      onError={onError}
    />
  );
}

export default ImageCropModal;
