import type { ChangeEvent, ReactNode } from 'react';
import RoleEditor from './RoleEditor';
import { TITLE_FONT_OPTIONS } from '../lib/defaultTemplate';
import type { MemeConfig, RoleItem } from '../types';

type EditorPanelProps = {
  config: MemeConfig;
  feedback: {
    kind: 'success' | 'error';
    message: string;
  } | null;
  onTitleChange: (value: string) => void;
  onSettingsChange: (patch: Partial<MemeConfig['settings']>) => void;
  onRoleChange: (roleId: string, patch: Partial<RoleItem>) => void;
  onRoleImageUpload: (
    roleId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onRoleRecrop: (roleId: string) => void;
  onRoleRemoveImage: (roleId: string) => void;
  onRestoreDefaults: () => void;
  onExport: () => void;
  onCopy: () => void;
};

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

function inputClassName() {
  return 'w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-300';
}

function EditorPanel({
  config,
  feedback,
  onTitleChange,
  onSettingsChange,
  onRoleChange,
  onRoleImageUpload,
  onRoleRecrop,
  onRoleRemoveImage,
  onRestoreDefaults,
  onExport,
  onCopy,
}: EditorPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-[32px] border border-stone-300/80 bg-[#fbfaf6]/92 p-4 shadow-[0_18px_50px_rgba(30,20,10,0.08)] backdrop-blur md:p-5">
      <div className="space-y-4">
        <div className="rounded-[26px] border border-stone-300 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Actions
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onExport}
              className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              导出 PNG
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-2xl border border-stone-400 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              复制图片到剪贴板
            </button>
            <button
              type="button"
              onClick={onRestoreDefaults}
              className="rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200 sm:col-span-2"
            >
              恢复默认模板
            </button>
          </div>

          {feedback ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                feedback.kind === 'success'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-5 text-stone-500">
            草稿会自动保存在当前浏览器的 localStorage 中。
          </p>
        </div>

        <div className="rounded-[26px] border border-stone-300 bg-white p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                Global
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">
                整体样式设置
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="顶部标题">
              <input
                className={inputClassName()}
                value={config.title}
                onChange={(event) => onTitleChange(event.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="画布宽度">
                <input
                  type="number"
                  min={720}
                  max={2160}
                  step={10}
                  className={inputClassName()}
                  value={config.settings.canvasWidth}
                  onChange={(event) =>
                    onSettingsChange({
                      canvasWidth: Number(event.target.value) || 1080,
                    })
                  }
                />
              </Field>
              <Field label="画布高度">
                <input
                  type="number"
                  min={720}
                  max={2160}
                  step={10}
                  className={inputClassName()}
                  value={config.settings.canvasHeight}
                  onChange={(event) =>
                    onSettingsChange({
                      canvasHeight: Number(event.target.value) || 1080,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="背景色">
                <input
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
                  value={config.settings.backgroundColor}
                  onChange={(event) =>
                    onSettingsChange({ backgroundColor: event.target.value })
                  }
                />
              </Field>
              <Field label="全局文字颜色">
                <input
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
                  value={config.settings.globalTextColor}
                  onChange={(event) =>
                    onSettingsChange({ globalTextColor: event.target.value })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="标题字号">
                <input
                  type="number"
                  min={32}
                  max={160}
                  className={inputClassName()}
                  value={config.settings.titleFontSize}
                  onChange={(event) =>
                    onSettingsChange({
                      titleFontSize: Number(event.target.value) || 78,
                    })
                  }
                />
              </Field>
              <Field label="标题字体">
                <select
                  className={inputClassName()}
                  value={config.settings.titleFontFamily}
                  onChange={(event) =>
                    onSettingsChange({ titleFontFamily: event.target.value })
                  }
                >
                  {TITLE_FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="横线颜色">
                <input
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
                  value={config.settings.lineColor}
                  onChange={(event) =>
                    onSettingsChange({ lineColor: event.target.value })
                  }
                />
              </Field>
              <Field label="横线粗细">
                <input
                  type="number"
                  min={1}
                  max={24}
                  className={inputClassName()}
                  value={config.settings.lineThickness}
                  onChange={(event) =>
                    onSettingsChange({
                      lineThickness: Number(event.target.value) || 6,
                    })
                  }
                />
              </Field>
              <Field label="横线左右边距">
                <input
                  type="number"
                  min={30}
                  max={320}
                  className={inputClassName()}
                  value={config.settings.lineMarginX}
                  onChange={(event) =>
                    onSettingsChange({
                      lineMarginX: Number(event.target.value) || 132,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="角色边框颜色">
                <input
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-2xl border border-stone-300 bg-white p-2"
                  value={config.settings.roleBorderColor}
                  onChange={(event) =>
                    onSettingsChange({ roleBorderColor: event.target.value })
                  }
                />
              </Field>
              <Field label="角色边框宽度">
                <input
                  type="number"
                  min={1}
                  max={24}
                  className={inputClassName()}
                  value={config.settings.roleBorderWidth}
                  onChange={(event) =>
                    onSettingsChange({
                      roleBorderWidth: Number(event.target.value) || 6,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="角色框大小">
                <input
                  type="number"
                  min={180}
                  max={480}
                  className={inputClassName()}
                  value={config.settings.roleSize}
                  onChange={(event) =>
                    onSettingsChange({
                      roleSize: Number(event.target.value) || 288,
                    })
                  }
                />
              </Field>
              <Field label="四宫格间距">
                <input
                  type="number"
                  min={20}
                  max={180}
                  className={inputClassName()}
                  value={config.settings.gridGap}
                  onChange={(event) =>
                    onSettingsChange({
                      gridGap: Number(event.target.value) || 88,
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Roles
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">
            四个角色卡片
          </h2>
        </div>

        {config.roles.map((role, index) => (
          <RoleEditor
            key={role.id}
            role={role}
            index={index}
            onChange={(patch) => onRoleChange(role.id, patch)}
            onImageUpload={(event) => onRoleImageUpload(role.id, event)}
            onRecrop={() => onRoleRecrop(role.id)}
            onRemoveImage={() => onRoleRemoveImage(role.id)}
          />
        ))}
      </div>
    </aside>
  );
}

export default EditorPanel;
