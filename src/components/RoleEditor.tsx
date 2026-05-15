import type { ChangeEvent, ReactNode } from 'react';
import type { RoleItem } from '../types';

type RoleEditorProps = {
  role: RoleItem;
  index: number;
  onChange: (patch: Partial<RoleItem>) => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRecrop: () => void;
  onRemoveImage: () => void;
};

const SHAPE_OPTIONS = [
  { label: '圆形', value: 'circle' },
  { label: '方形', value: 'square' },
  { label: '圆角方形', value: 'rounded' },
] as const;

const DISPLAY_OPTIONS = [
  { label: '文字', value: 'text' },
  { label: '图片', value: 'image' },
] as const;

const FONT_WEIGHTS = [
  { label: '400 常规', value: 400 },
  { label: '500 中等', value: 500 },
  { label: '600 半粗', value: 600 },
  { label: '700 粗体', value: 700 },
  { label: '800 特粗', value: 800 },
];

function inputClassName() {
  return 'w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-300';
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RoleEditor({
  role,
  index,
  onChange,
  onImageUpload,
  onRecrop,
  onRemoveImage,
}: RoleEditorProps) {
  return (
    <details
      open={index === 0}
      className="overflow-hidden rounded-[26px] border border-stone-300 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
            Role {index + 1}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-950">
            {role.title || `角色 ${index + 1}`}
          </h3>
        </div>
        <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600">
          {role.displayType === 'image' ? '图片模式' : '文字模式'}
        </span>
      </summary>

      <div className="grid gap-4 border-t border-stone-200 px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="主标题">
            <input
              className={inputClassName()}
              value={role.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </Field>
          <Field label="展示类型">
            <select
              className={inputClassName()}
              value={role.displayType}
              onChange={(event) =>
                onChange({
                  displayType: event.target.value as RoleItem['displayType'],
                })
              }
            >
              {DISPLAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="简介文字">
          <textarea
            className={`${inputClassName()} min-h-24 resize-y`}
            value={role.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="形状">
            <select
              className={inputClassName()}
              value={role.shape}
              onChange={(event) =>
                onChange({ shape: event.target.value as RoleItem['shape'] })
              }
            >
              {SHAPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="主标题字号">
            <input
              type="number"
              min={18}
              max={120}
              className={inputClassName()}
              value={role.titleFontSize}
              onChange={(event) =>
                onChange({ titleFontSize: Number(event.target.value) || 58 })
              }
            />
          </Field>
          <Field label="主标题字重">
            <select
              className={inputClassName()}
              value={role.titleFontWeight}
              onChange={(event) =>
                onChange({ titleFontWeight: Number(event.target.value) || 700 })
              }
            >
              {FONT_WEIGHTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="主标题颜色">
            <input
              type="color"
              className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
              value={role.titleColor}
              onChange={(event) => onChange({ titleColor: event.target.value })}
            />
          </Field>
          <Field label="简介颜色">
            <input
              type="color"
              className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
              value={role.descriptionColor}
              onChange={(event) =>
                onChange({ descriptionColor: event.target.value })
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="简介字号">
            <input
              type="number"
              min={14}
              max={64}
              className={inputClassName()}
              value={role.descriptionFontSize}
              onChange={(event) =>
                onChange({
                  descriptionFontSize:
                    Number(event.target.value) || 28,
                })
              }
            />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={role.descriptionWrap}
              onChange={(event) =>
                onChange({ descriptionWrap: event.target.checked })
              }
            />
            简介自动换行
          </label>
        </div>

        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">图片素材</p>
                <p className="text-xs leading-5 text-stone-500">
                  上传后会先进入裁剪弹窗，可调整缩放、拖拽和旋转。
                </p>
              </div>
              {role.imageSrc ? (
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-stone-300 bg-white">
                  <img
                    src={role.imageSrc}
                    alt={`${role.title} preview`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="block w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 file:mr-3 file:rounded-xl file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onRecrop}
                disabled={!role.originalImageSrc}
                className="rounded-2xl border border-stone-400 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
              >
                重新裁剪
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                disabled={!role.imageSrc}
                className="rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
              >
                移除图片
              </button>
            </div>

            {role.displayType === 'image' ? (
              <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={role.overlayTitleOnImage}
                  onChange={(event) =>
                    onChange({ overlayTitleOnImage: event.target.checked })
                  }
                />
                在图片上叠加主标题
              </label>
            ) : null}
          </div>
        </div>
      </div>
    </details>
  );
}

export default RoleEditor;
