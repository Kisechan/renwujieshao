# 登场人物介绍 Meme 图生成器

一个可部署到 Cloudflare Pages 的纯前端 Meme 图生成器，基于 React + TypeScript + Vite + Tailwind CSS + react-konva + react-easy-crop。所有状态都保存在前端内存中，并自动同步到浏览器 `localStorage` 草稿。

## 功能特性

- 可编辑顶部标题、横线样式、画布尺寸、背景色和全局排版。
- 固定 2×2 角色卡布局，每个角色支持文字模式或图片模式。
- 图片上传后可裁剪、缩放、拖拽、旋转，再应用到角色卡。
- 使用 `react-konva` 渲染最终画布，并支持高清 PNG 导出。
- 浏览器支持时可直接复制图片到剪贴板。
- 响应式布局：桌面端左右分栏，移动端上预览下编辑。
- 自动本地草稿保存，支持一键恢复默认模板。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- react-konva / konva
- react-easy-crop

## 项目结构

```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── EditorPanel.tsx
│   │   ├── ImageCropModal.tsx
│   │   ├── MemeCanvas.tsx
│   │   └── RoleEditor.tsx
│   ├── lib/
│   │   ├── cropImage.ts
│   │   ├── defaultTemplate.ts
│   │   └── exportImage.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 本地运行

```bash
npm install
npm run dev
```

默认会启动 Vite 开发服务器，通常访问 [http://localhost:5173](http://localhost:5173)。

## 构建

```bash
npm run build
```

- Build command: `npm run build`
- Build output directory: `dist`

本项目为纯静态前端，不依赖 Node.js 服务端 API，也不需要数据库。

## Cloudflare Pages 部署配置

在 Cloudflare Pages 创建项目时，使用以下配置：

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` 或留空

如果你使用 Git 仓库持续部署，直接把当前项目推送到仓库后接入 Cloudflare Pages 即可。由于资源路径由 Vite 处理，构建产物可直接作为静态站点部署。

## 默认模板内容

- 标题：`登场人物介绍`
- 角色 1：主标题 `live`，简介 `eplus已中选`
- 角色 2：主标题 `娃娃`，简介 `痛包已装满`
- 角色 3：主标题 `航班`，简介 `已抵达浦东机场`
- 角色 4：主标题 `老板`，简介 `周末有个需求你加下班`
