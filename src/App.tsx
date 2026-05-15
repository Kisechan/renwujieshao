import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import EditorPanel from './components/EditorPanel';
import ImageCropModal from './components/ImageCropModal';
import MemeCanvas from './components/MemeCanvas';
import {
  DRAFT_STORAGE_KEY,
  createDefaultTemplate,
  hydrateMemeConfig,
} from './lib/defaultTemplate';
import { copyStageImageToClipboard, exportStageAsPng } from './lib/exportImage';
import type { CropResult, MemeConfig, RoleItem } from './types';

type FeedbackState = {
  kind: 'success' | 'error';
  message: string;
} | null;

type CropTarget = {
  roleId: string;
  source: string;
};

function loadInitialConfig(): MemeConfig {
  if (typeof window === 'undefined') {
    return createDefaultTemplate();
  }

  const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!savedDraft) {
    return createDefaultTemplate();
  }

  try {
    return hydrateMemeConfig(JSON.parse(savedDraft));
  } catch {
    return createDefaultTemplate();
  }
}

function App() {
  const [config, setConfig] = useState<MemeConfig>(loadInitialConfig);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const deferredConfig = useDeferredValue(config);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  const selectedRole = useMemo(
    () => config.roles.find((role) => role.id === cropTarget?.roleId) ?? null,
    [config.roles, cropTarget?.roleId],
  );

  const updateRole = (roleId: string, patch: Partial<RoleItem>) => {
    setConfig((current) => ({
      ...current,
      roles: current.roles.map((role) =>
        role.id === roleId ? { ...role, ...patch } : role,
      ),
    }));
  };

  const handleTitleChange = (title: string) => {
    setConfig((current) => ({ ...current, title }));
  };

  const handleSettingsChange = (
    patch: Partial<MemeConfig['settings']>,
  ) => {
    setConfig((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  };

  const handleRestoreDefaults = () => {
    const next = createDefaultTemplate();
    setConfig(next);
    setFeedback({ kind: 'success', message: '已恢复默认模板。' });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const openCropper = (roleId: string, source: string) => {
    setCropTarget({ roleId, source });
    setFeedback(null);
  };

  const handleUploadImage = (
    roleId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        openCropper(roleId, reader.result);
      } else {
        setFeedback({ kind: 'error', message: '图片读取失败，请重试。' });
      }
    };
    reader.onerror = () => {
      setFeedback({ kind: 'error', message: '图片读取失败，请重试。' });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = (result: CropResult) => {
    if (!cropTarget) {
      return;
    }

    updateRole(cropTarget.roleId, {
      displayType: 'image',
      imageSrc: result.imageSrc,
      originalImageSrc: cropTarget.source,
      cropState: result.cropState,
    });
    setCropTarget(null);
    setFeedback({ kind: 'success', message: '图片裁剪已应用。' });
  };

  const handleRecrop = (roleId: string) => {
    const role = config.roles.find((item) => item.id === roleId);
    if (role?.originalImageSrc) {
      openCropper(roleId, role.originalImageSrc);
    }
  };

  const handleRemoveImage = (roleId: string) => {
    updateRole(roleId, {
      displayType: 'text',
      imageSrc: null,
      originalImageSrc: null,
      cropState: {
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
      },
    });
    setFeedback({ kind: 'success', message: '已移除角色图片。' });
  };

  const handleExport = async () => {
    if (!stageRef.current) {
      setFeedback({ kind: 'error', message: '当前画布尚未准备完成。' });
      return;
    }

    try {
      await exportStageAsPng(stageRef.current, 'meme-character-intro.png');
      setFeedback({ kind: 'success', message: 'PNG 已导出。' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '导出 PNG 失败，请重试。';
      setFeedback({ kind: 'error', message });
    }
  };

  const handleCopy = async () => {
    if (!stageRef.current) {
      setFeedback({ kind: 'error', message: '当前画布尚未准备完成。' });
      return;
    }

    try {
      await copyStageImageToClipboard(stageRef.current);
      setFeedback({ kind: 'success', message: '图片已复制到剪贴板。' });
    } catch {
      setFeedback({
        kind: 'error',
        message: '当前浏览器不支持直接复制图片，请使用“导出 PNG”。',
      });
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f5ee_0%,#ece7dc_58%,#e3ddcf_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1640px] flex-col gap-6 px-4 py-4 md:px-6 lg:px-8">
        <header className="rounded-[28px] border border-stone-300/80 bg-white/70 px-5 py-4 shadow-[0_18px_50px_rgba(30,20,10,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
            Meme Studio
          </p>
          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1
                className="text-3xl font-semibold tracking-[0.08em] text-stone-950 md:text-4xl"
                style={{
                  fontFamily:
                    '"Songti SC","STSong","SimSun","Noto Serif SC",serif',
                }}
              >
                登场人物介绍 Meme 图生成器
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                React + TypeScript + Vite + Tailwind + Konva。所有编辑都在本地浏览器内完成，支持自动保存草稿、图片裁剪、PNG 导出和复制剪贴板。
              </p>
            </div>
            <div className="rounded-2xl border border-stone-300 bg-stone-950 px-4 py-3 text-xs font-medium leading-5 text-stone-100">
              Cloudflare Pages:
              <span className="ml-2 font-semibold text-white">
                build = npm run build
              </span>
              <span className="ml-2 text-stone-300">output = dist</span>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(360px,460px)_minmax(0,1fr)]">
          <EditorPanel
            config={config}
            feedback={feedback}
            onTitleChange={handleTitleChange}
            onSettingsChange={handleSettingsChange}
            onRoleChange={updateRole}
            onRoleImageUpload={handleUploadImage}
            onRoleRecrop={handleRecrop}
            onRoleRemoveImage={handleRemoveImage}
            onRestoreDefaults={handleRestoreDefaults}
            onExport={handleExport}
            onCopy={handleCopy}
          />

          <section className="flex flex-col gap-4 rounded-[32px] border border-stone-300/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(30,20,10,0.08)] backdrop-blur md:p-6">
            <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  Preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  实时画布预览
                </h2>
              </div>
              <p className="text-sm text-stone-600">
                当前尺寸：
                <span className="ml-1 font-semibold text-stone-900">
                  {config.settings.canvasWidth} × {config.settings.canvasHeight}
                </span>
              </p>
            </div>

            <MemeCanvas config={deferredConfig} stageRef={stageRef} />
          </section>
        </section>
      </div>

      <ImageCropModal
        isOpen={Boolean(cropTarget && selectedRole)}
        role={selectedRole}
        source={cropTarget?.source ?? null}
        onClose={() => setCropTarget(null)}
        onConfirm={handleApplyCrop}
        onError={(message) => setFeedback({ kind: 'error', message })}
      />
    </main>
  );
}

export default App;
