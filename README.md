# Skin Ark – Universal Minecraft Skin Collaboration Platform

[English](#english) | [中文](#chinese)

---

<a id="english"></a>

## English

### Project Description

**Skin Ark** is a **universal Minecraft skin collaboration and visualization platform** built on **Git** for data storage and version control. It uses **GitHub Actions** pipelines to automatically build an interactive preview and download site from static assets, and provides image diff views for collaborators. Anyone can submit new skins or modify existing ones via Pull Request. Once merged, the site is automatically rebuilt and deployed.

The platform is **configuration‑driven** – you can customize the site title, theme colors, display names, search behavior, and even enforce import policies, all through a single `site.config.json` file.

---

### Directory Structure

```
Skin-Ark/
├── skins/                          # Skin asset root
│   └── {game}/                     # Game / franchise directory
│       ├── {character}.png         # Simplified mode – uses default variant
│       ├── {character}/            # Standard mode – character subfolder
│       │   ├── {variant}.png       # Skin file
│       │   └── {variant}.meta.json # Optional metadata for that variant
│       └── Default.meta.json       # Optional – applies to simplified mode
├── public/                         # Generated assets (ignored in Git)
│   ├── data.json                   # Auto‑generated skin manifest
│   └── site.config.json            # Copied from root (for runtime)
├── src/                            # Frontend source code
├── scripts/                        # Build and tool scripts
├── .github/workflows/              # GitHub Actions pipelines
├── site.config.json                # Main configuration
├── index.html
├── package.json
└── vite.config.ts
```

#### Skin Storage Modes

1. **Simplified mode**  
   Place a PNG directly under `skins/{game}/` with the character’s name, e.g. `skins/stardew/abigail.png`.  
   The variant is automatically set to the `defaultVariant` from `site.config.json` (default: `Default`).  
   A `.meta.json` can be placed alongside it (named `Default.meta.json`).

2. **Standard mode**  
   Create a subfolder for the character, e.g. `skins/stardew/abigail/`.  
   Inside, place one or more variant PNGs (e.g. `summer.png`, `formal.png`).  
   Each variant can have a companion `.meta.json` with the same base name (e.g. `summer.meta.json`).

#### Metadata (`.meta.json`)

Optional JSON file that enriches a skin entry. Supported fields:

- `originalAuthor` – string, name of the original creator
- `originalSource` – string or null, URL or description of original source
- `license` – string, e.g. "CC BY‑NC‑SA"
- `note` – string or null, any additional notes
- `isOriginal` – boolean (if not provided, inferred from `originalSource` – if source exists, `isOriginal` defaults to `false`)

---

### Configuration (`site.config.json`)

Place this file in the project root. It is read both at build time and at runtime.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `siteTitle` | string | Browser tab title and header fallback | `"Skin Gallery"` |
| `siteDescription` | string | Meta description for SEO | `"A community-driven skin gallery"` |
| `repoOwner` | string | GitHub username/organization | `"unknown"` |
| `repoName` | string | Repository name | `"unknown"` |
| `branch` | string | Branch used for raw URLs | `"main"` |
| `theme.primaryColor` | CSS color | Primary color for buttons, hover backgrounds | `"#2d2d2d"` |
| `theme.secondaryColor` | CSS color | Borders, separators | `"#888888"` |
| `theme.bgPattern` | CSS background value | Site background pattern | `"repeating-linear-gradient(...)"` |
| `theme.textColor` | CSS color | Main text color | `"#1f2937"` |
| `theme.textLight` | CSS color | Muted text | `"#6b7280"` |
| `displayNameMap` | object | Map internal directory names to display names, e.g. `{"stardew-valley":"Stardew Valley"}` | `{}` |
| `enableSearch` | boolean | Show/hide the global search box | `true` |
| `defaultVariant` | string | Variant name used for simplified mode | `"Default"` |
| `allowExternalImports` | boolean | Whether to allow imported (non‑original) skins | `false` |
| `requireSourceForImports` | boolean | If importing, force `originalSource` to be provided | `true` |

---

### Contribution Guidelines

We welcome Pull Requests for new skins or modifications. Please follow the rules below:

#### Directory and File Naming

- **Game directory** (top‑level under `skins/`) must use **lowercase** and hyphens (`-`) for spaces, e.g. `stardew-valley`.
- **Character names** also use lowercase and hyphens, e.g. `abigail`.
- **Variant names** are **not restricted** – but we recommend semantic names like `summer`, `formal`, `sport`, `halloween`, etc.

#### Adding Skins

You can add skins in two ways:

1. **Single skin (simplified mode)** – place `{character}.png` directly under the game folder. The variant will be the `defaultVariant` (e.g. `Default`). You may also add a `Default.meta.json` next to it.

2. **Multiple variants (standard mode)** – create a subfolder named after the character, and place any number of `{variant}.png` files inside. Each variant can have its own `.meta.json`.

#### Metadata Requirements for Imports

If the skin is **not original** (i.e., it was created by someone else), you **must** provide a `.meta.json` file that includes at least:

- `originalAuthor` – who originally made the skin
- `originalSource` – link or description of where it came from (required if `requireSourceForImports` is `true`)

If `isOriginal` is not explicitly set, the system will treat it as imported when `originalSource` is present.

---

### Development & Deployment

#### Local Development

```bash
npm install
npm run dev
```

This runs the build script to generate `public/data.json` and then starts the Vite dev server. The site will be available at `http://localhost:5173/` (or the sub‑path defined in `vite.config.ts`).

#### Build for Production

```bash
npm run build
```

This compiles the frontend and runs the asset build script, producing a `dist/` folder ready for deployment.

#### Deploy to GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) that automatically builds and deploys the `dist/` folder to the `gh-pages` branch.

**Important:** If your site is hosted under a sub‑path (e.g., `https://<username>.github.io/<repo>/`), update the `base` option in `vite.config.ts` accordingly. For example:

```js
export default defineConfig({
  base: '/Skin-Ark/',
  // ...
});
```

Then the frontend will correctly load assets and configuration.

---

<a id="chinese"></a>

## 中文

### 项目简介

**Skin Ark** 是一个**通用的 Minecraft 皮肤协作管理与可视化平台**，基于 **Git** 进行数据存储和版本控制，通过 **GitHub Actions** 自动化流水线从静态资源构建可交互的预览和下载站点，并为协作者提供图像差异对比视图。任何人都可以通过 Pull Request 提交新的或修改已有的皮肤，合并后自动构建并部署。

该平台采用**配置驱动**设计，只需编辑 `site.config.json` 即可自定义网站标题、主题颜色、显示名称映射、搜索开关以及搬运政策等。

---

### 目录结构

```
Skin-Ark/
├── skins/                          # 皮肤资源根目录
│   └── {game}/                     # 游戏/系列目录
│       ├── {character}.png         # 简写模式 – 使用默认变体
│       ├── {character}/            # 标准模式 – 角色子文件夹
│       │   ├── {variant}.png       # 皮肤文件
│       │   └── {variant}.meta.json # 该变体的元数据（可选）
│       └── Default.meta.json       # 可选 – 应用于简写模式
├── public/                         # 生成的资源（不提交 Git）
│   ├── data.json                   # 自动生成的皮肤清单
│   └── site.config.json            # 从根目录复制（供前端使用）
├── src/                            # 前端源代码
├── scripts/                        # 构建与工具脚本
├── .github/workflows/              # GitHub Actions 流水线
├── site.config.json                # 主配置文件
├── index.html
├── package.json
└── vite.config.ts
```

#### 皮肤存储模式

1. **简写模式**  
   直接将 PNG 放在 `skins/{game}/` 下，文件名为角色名，例如 `skins/stardew/abigail.png`。  
   变体名自动使用 `site.config.json` 中的 `defaultVariant`（默认为 `Default`）。  
   可附带同名的 `Default.meta.json` 元数据文件。

2. **标准模式**  
   为角色创建子文件夹，例如 `skins/stardew/abigail/`。  
   在内部放置一个或多个变体 PNG（如 `summer.png`、`formal.png`）。  
   每个变体可拥有同名的 `.meta.json`（例如 `summer.meta.json`）。

#### 元数据（`.meta.json`）

可选的 JSON 文件，用于丰富皮肤信息。支持以下字段：

- `originalAuthor` – 字符串，原作者名称
- `originalSource` – 字符串或 null，来源链接或描述
- `license` – 字符串，例如 "CC BY‑NC‑SA"
- `note` – 字符串或 null，附加说明
- `isOriginal` – 布尔值（未提供时根据 `originalSource` 推断：若有来源则默认 `false`）

---

### 配置说明（`site.config.json`）

将文件置于项目根目录。它会在构建时和运行时均被读取。

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `siteTitle` | string | 浏览器标签标题及顶部栏回退名称 | `"Skin Gallery"` |
| `siteDescription` | string | SEO 元描述 | `"A community-driven skin gallery"` |
| `repoOwner` | string | GitHub 用户名/组织名 | `"unknown"` |
| `repoName` | string | 仓库名称 | `"unknown"` |
| `branch` | string | 生成原始文件 URL 所用的分支 | `"main"` |
| `theme.primaryColor` | CSS 颜色 | 主色（按钮、悬停背景） | `"#2d2d2d"` |
| `theme.secondaryColor` | CSS 颜色 | 边框、分隔线 | `"#888888"` |
| `theme.bgPattern` | CSS 背景值 | 网站背景图案 | `"repeating-linear-gradient(...)"` |
| `theme.textColor` | CSS 颜色 | 主要文字颜色 | `"#1f2937"` |
| `theme.textLight` | CSS 颜色 | 较淡文字 | `"#6b7280"` |
| `displayNameMap` | object | 将内部目录名映射为显示名称，例如 `{"stardew-valley":"星露谷物语"}` | `{}` |
| `enableSearch` | boolean | 是否显示全局搜索框 | `true` |
| `defaultVariant` | string | 简写模式使用的变体名称 | `"Default"` |
| `allowExternalImports` | boolean | 是否允许搬运（非原创）皮肤 | `false` |
| `requireSourceForImports` | boolean | 若允许搬运，是否强制要求提供来源 | `true` |

---

### 贡献指南

欢迎通过 Pull Request 提交新皮肤或修改现有皮肤，请遵循以下规范：

#### 目录和文件命名

- **游戏目录**（`skins/` 下的第一级）必须使用**小写字母**，单词间以连字符分隔，例如 `stardew-valley`。
- **角色名**同样小写并用连字符，例如 `abigail`。
- **变体名** **无限制**，但建议使用语义化名称，如 `summer`、`formal`、`sport`、`halloween` 等。

#### 添加皮肤

你可以通过两种方式添加：

1. **单皮肤（简写模式）** – 在游戏目录下直接放置 `{character}.png`，变体自动设为 `defaultVariant`（如 `Default`）。可同时添加 `Default.meta.json`。

2. **多变体（标准模式）** – 为角色创建子文件夹，在其中放置任意数量的 `{variant}.png`。每个变体可拥有独立的 `.meta.json`。

#### 搬运皮肤的元数据要求

如果皮肤**并非原创**（即由他人创作），你**必须**提供 `.meta.json` 文件，其中至少包含：

- `originalAuthor` – 原作者
- `originalSource` – 来源链接或说明（若 `requireSourceForImports` 为 `true` 则此项必填）

如果未显式设置 `isOriginal`，系统会在存在 `originalSource` 时自动将其视为搬运。

---

### 开发与部署

#### 本地开发

```bash
npm install
npm run dev
```

该命令会先运行构建脚本生成 `public/data.json`，然后启动 Vite 开发服务器。站点将在 `http://localhost:5173/` 访问（若配置了 `base` 子路径，则相应调整）。

#### 生产构建

```bash
npm run build
```

编译前端并运行资源构建脚本，生成 `dist/` 目录，可用于部署。

#### 部署到 GitHub Pages

仓库已包含 GitHub Actions 工作流（`.github/workflows/build-and-deploy.yml`），会在推送时自动构建并将 `dist/` 目录部署到 `gh-pages` 分支。

**重要提示：** 若站点托管在子路径下（例如 `https://<用户名>.github.io/<仓库名>/`），需在 `vite.config.ts` 中正确设置 `base` 选项，例如：

```js
export default defineConfig({
   base: '/Skin-Ark/',
   // ...
});
```

这样前端才能正确加载资源和配置文件。

---

Made with ❤️ by ENA