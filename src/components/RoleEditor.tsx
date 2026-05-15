import type { RoleDisplayType, RoleItem, RoleShape } from '../types';

interface RoleEditorProps {
  index: number;
  role: RoleItem;
  onChange: (patch: Partial<RoleItem>) => void;
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  onRecrop: () => void;
}

const displayOptions: Array<{ label: string; value: RoleDisplayType }> = [
  { label: '文字', value: 'text' },
  { label: '图片', value: 'image' },
];

const shapeOptions: Array<{ label: string; value: RoleShape }> = [
  { label: '圆形', value: 'circle' },
  { label: '方形', value: 'square' },
  { label: '圆角方形', value: 'rounded' },
];

export default function RoleEditor({
  index,
  role,
  onChange,
  onSelectImage,
  onRemoveImage,
  onRecrop,
}: RoleEditorProps) {
  return (
    <details className="border-b border-black" open>
      <summary className="flex cursor-pointer items-center justify-between gap-3 py-4">
        <div>
          <div className="text-sm text-neutral-600">角色 {index + 1}</div>
          <div className="text-lg font-semibold">{role.title || `未命名角色 ${index + 1}`}</div>
        </div>
        <div className="text-sm text-neutral-600">{role.displayType === 'image' ? '图片模式' : '文字模式'}</div>
      </summary>

      <div className="grid gap-4 pb-4">
        <div className="field">
          <label className="field-label" htmlFor={`${role.id}-title`}>
            主标题
          </label>
          <input
            className="control"
            id={`${role.id}-title`}
            maxLength={24}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="输入角色名"
            type="text"
            value={role.title}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor={`${role.id}-description`}>
            简介文本
          </label>
          <textarea
            className="control min-h-[88px] resize-y"
            id={`${role.id}-description`}
            maxLength={80}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="输入角色简介"
            value={role.description}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label className="field-label" htmlFor={`${role.id}-display-type`}>
              展示类型
            </label>
            <select
              className="control"
              id={`${role.id}-display-type`}
              onChange={(event) =>
                onChange({
                  displayType: event.target.value as RoleDisplayType,
                })
              }
              value={role.displayType}
            >
              {displayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor={`${role.id}-shape`}>
              形状
            </label>
            <select
              className="control"
              id={`${role.id}-shape`}
              onChange={(event) =>
                onChange({
                  shape: event.target.value as RoleShape,
                })
              }
              value={role.shape}
            >
              {shapeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {role.displayType === 'image' ? (
          <div className="grid gap-4 border border-black p-3">
            <div className="field">
              <label className="field-label" htmlFor={`${role.id}-upload`}>
                上传图片
              </label>
              <input
                className="control"
                id={`${role.id}-upload`}
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  onSelectImage(file);
                  event.target.value = '';
                }}
                type="file"
              />
              <div className="field-hint">上传后会自动进入裁剪编辑器。</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-secondary" onClick={onRecrop} type="button">
                重新裁剪
              </button>
              <button className="btn btn-secondary" onClick={onRemoveImage} type="button">
                移除图片
              </button>
            </div>

            <label className="flex items-center gap-3 border border-black px-3 py-2">
              <input
                checked={role.showTitleOverlay}
                onChange={(event) => onChange({ showTitleOverlay: event.target.checked })}
                type="checkbox"
              />
              <span className="text-sm">在图片上叠加主标题</span>
            </label>

            {role.imageSrc ? (
              <div className="border border-black">
                <img alt={`${role.title} 预览`} className="aspect-square w-full object-cover" src={role.imageSrc} />
              </div>
            ) : (
              <div className="border border-dashed border-black px-4 py-8 text-center text-sm text-neutral-600">
                当前还没有应用裁剪后的图片
              </div>
            )}
          </div>
        ) : null}
      </div>
    </details>
  );
}
