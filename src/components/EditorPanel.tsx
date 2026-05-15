import type { ReactNode } from 'react';
import type { MemeConfig, RoleItem } from '../types';
import RoleEditor from './RoleEditor';

interface EditorPanelProps {
  config: MemeConfig;
  busyAction: string | null;
  notice: { type: 'error' | 'success'; message: string } | null;
  onConfigChange: (next: MemeConfig) => void;
  onReset: () => void;
  onExportPng: () => void;
  onExportJpg: () => void;
  onCopy: () => void;
  onSelectRoleImage: (roleId: string, file: File) => void;
  onRecropRoleImage: (roleId: string) => void;
}

interface RangeFieldProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
}

function RangeField({ id, label, min, max, step = 1, suffix = '', value, onChange }: RangeFieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full"
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <div className="field-hint">
        {value}
        {suffix}
      </div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="section-block" open={defaultOpen}>
      <summary className="section-toggle">
        <span>{title}</span>
        <span className="text-xs font-normal text-neutral-500">展开 / 折叠</span>
      </summary>
      <div className="grid gap-4 pb-4">{children}</div>
    </details>
  );
}

export default function EditorPanel({
  config,
  busyAction,
  notice,
  onConfigChange,
  onReset,
  onExportPng,
  onExportJpg,
  onCopy,
  onSelectRoleImage,
  onRecropRoleImage,
}: EditorPanelProps) {
  const { settings } = config;

  function updateRole(roleId: string, patch: Partial<RoleItem>) {
    onConfigChange({
      ...config,
      roles: config.roles.map((role) => (role.id === roleId ? { ...role, ...patch } : role)),
    });
  }

  function updateSettings<K extends keyof MemeConfig['settings']>(key: K, value: MemeConfig['settings'][K]) {
    onConfigChange({
      ...config,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  }

  return (
    <aside className="border border-black bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-black px-4 py-4">
        <div>
          <div className="section-title">编辑器</div>
          <h1 className="mt-1 text-2xl font-bold">登场人物介绍 Meme</h1>
          <p className="mt-1 text-sm text-neutral-700">左侧调整内容与样式，右侧画布实时更新。</p>
        </div>
        <button className="btn btn-secondary shrink-0" onClick={onReset} type="button">
          恢复默认
        </button>
      </div>

      <div className="px-4 py-2">
        <Section title="导出" defaultOpen>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="btn btn-primary"
              disabled={busyAction !== null}
              onClick={onExportPng}
              type="button"
            >
              {busyAction === 'png' ? '导出中...' : '导出 PNG'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={busyAction !== null}
              onClick={onExportJpg}
              type="button"
            >
              {busyAction === 'jpg' ? '导出中...' : '导出 JPG'}
            </button>
          </div>
          <button className="btn btn-secondary" disabled={busyAction !== null} onClick={onCopy} type="button">
            {busyAction === 'copy' ? '复制中...' : '复制图片到剪贴板'}
          </button>
          <div
            className={`plain-note ${notice?.type === 'error' ? 'border-red-400 text-red-700' : notice?.type === 'success' ? 'border-green-500 text-green-700' : ''}`}
          >
            {notice?.message ?? '浏览器不支持图片剪贴板时，建议直接使用下载按钮保存。'}
          </div>
        </Section>

        <Section title="基础内容" defaultOpen>
          <div className="field">
            <label className="field-label" htmlFor="meme-title">
              顶部标题
            </label>
            <input
              className="control"
              id="meme-title"
              maxLength={28}
              onChange={(event) => onConfigChange({ ...config, title: event.target.value })}
              placeholder="输入标题"
              type="text"
              value={config.title}
            />
          </div>
        </Section>

        <Section title="整体样式" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label className="field-label" htmlFor="background-color">
                背景色
              </label>
              <div className="flex gap-2">
                <input
                  className="h-10 w-14 border border-black bg-transparent"
                  id="background-color"
                  onChange={(event) => updateSettings('backgroundColor', event.target.value)}
                  type="color"
                  value={settings.backgroundColor}
                />
                <input
                  className="control"
                  onChange={(event) => updateSettings('backgroundColor', event.target.value)}
                  type="text"
                  value={settings.backgroundColor}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="text-color">
                全局文字颜色
              </label>
              <div className="flex gap-2">
                <input
                  className="h-10 w-14 border border-black bg-transparent"
                  id="text-color"
                  onChange={(event) => updateSettings('textColor', event.target.value)}
                  type="color"
                  value={settings.textColor}
                />
                <input
                  className="control"
                  onChange={(event) => updateSettings('textColor', event.target.value)}
                  type="text"
                  value={settings.textColor}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="border-color">
                角色框线颜色
              </label>
              <div className="flex gap-2">
                <input
                  className="h-10 w-14 border border-black bg-transparent"
                  id="border-color"
                  onChange={(event) => updateSettings('borderColor', event.target.value)}
                  type="color"
                  value={settings.borderColor}
                />
                <input
                  className="control"
                  onChange={(event) => updateSettings('borderColor', event.target.value)}
                  type="text"
                  value={settings.borderColor}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RangeField
              id="title-font-size"
              label="标题字号"
              max={104}
              min={32}
              onChange={(value) => updateSettings('titleFontSize', value)}
              value={settings.titleFontSize}
            />
            <RangeField
              id="role-title-font-size"
              label="角色标题字号"
              max={88}
              min={20}
              onChange={(value) => updateSettings('roleTitleFontSize', value)}
              value={settings.roleTitleFontSize}
            />
            <RangeField
              id="description-font-size"
              label="简介字号"
              max={52}
              min={16}
              onChange={(value) => updateSettings('descriptionFontSize', value)}
              value={settings.descriptionFontSize}
            />
            <RangeField
              id="border-width"
              label="角色框线宽度"
              max={16}
              min={1}
              onChange={(value) => updateSettings('borderWidth', value)}
              value={settings.borderWidth}
            />
            <RangeField
              id="role-size"
              label="角色框大小"
              max={360}
              min={160}
              onChange={(value) => updateSettings('roleSize', value)}
              suffix="px"
              value={settings.roleSize}
            />
            <RangeField
              id="grid-gap"
              label="四宫格间距"
              max={120}
              min={20}
              onChange={(value) => updateSettings('gridGap', value)}
              suffix="px"
              value={settings.gridGap}
            />
          </div>
        </Section>

        <Section title="角色内容" defaultOpen>
          <div className="grid gap-0 border-t border-black">
            {config.roles.map((role, index) => (
              <RoleEditor
                index={index}
                key={role.id}
                onChange={(patch) => updateRole(role.id, patch)}
                onRecrop={() => onRecropRoleImage(role.id)}
                onRemoveImage={() =>
                  updateRole(role.id, {
                    imageSrc: null,
                    originalImageSrc: null,
                  })
                }
                onSelectImage={(file) => onSelectRoleImage(role.id, file)}
                role={role}
              />
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}
