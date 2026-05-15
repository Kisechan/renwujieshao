# 登场人物介绍生成器

纯前端登场人物介绍 Meme 图生成器，使用 React + TypeScript + Vite + Tailwind CSS + react-konva + react-easy-crop 实现。

## 功能概览

- 所见即所得的 2×2 登场人物介绍画布
- 支持标题、四个角色、样式参数的实时编辑
- 支持文字模式 / 图片模式
- 支持圆形 / 方形 / 圆角方形
- 支持图片上传、裁剪、缩放、拖拽、旋转
- 支持导出 PNG / JPG
- 支持复制图片到剪贴板
- 支持 `localStorage` 自动保存草稿
- 响应式布局：桌面端左侧编辑右侧预览，移动端上方预览下方编辑

## 本地运行

```bash
npm install
npm run dev
```

默认会启动 Vite 开发服务器。

## 构建方法

```bash
npm run build
```

构建产物输出到：

```text
dist
```

如需本地预览构建结果：

```bash
npm run preview
```

## Cloudflare Pages 部署配置

- Framework preset: `None` 或 `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 仓库根目录

本项目为纯静态前端，不依赖 Node.js 服务端、数据库或后端 API，可直接部署到 Cloudflare Pages。

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Konva / react-konva
- react-easy-crop

