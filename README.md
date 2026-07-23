# BA-MC-Skins

[English](#english) | [中文](#中文) <br>

---

<a id="english"></a>

## English

### Project Description

**BA-MC-Skins** is a **collaborative management and visualization platform** for Minecraft skins themed around *Blue Archive*.

Built on **Git** for data storage and version control, it uses **GitHub Actions** pipelines to automatically build an interactive preview and download site from static assets, and provides image diff views for collaborators. Anyone can submit new skins or modify existing ones via Pull Request. Once merged, the site is automatically rebuilt and deployed.

---

### Directory Structure

```
BA-MC-Skins/
├── skins/                    # Asset root
│   └── {character}/          # Character directory
│       └── {variant}.png     # Skin file
├── src/                      # Frontend source code
├── scripts/                  # Build and tool scripts
├── .github/workflows/        # GitHub Actions pipelines
├── index.html
├── package.json
└── vite.config.ts
```

---

### Contribution Guidelines

We welcome Pull Requests for new BA character skins or modifications to existing ones. Please follow the rules below:

#### Directory Naming

- When creating a new character under `skins/`, **the directory name must be the full English name of the character**.
- Use **lowercase** and separate words with hyphens, e.g. `hoshino-takanashi`.

#### Variant Naming

Skin variant names **must** be one of the following standard names:

- `Default`
- `Swimsuit`
- `Summer`
- `Sports`
- `NewYear`
- `Valentine`
- `Christmas`
- `Casual`
- `School`
- `Party`

#### File Format

- Only **PNG** format is accepted.
- The filename must exactly match the variant name from the list above.

---

<a id="中文"></a>

## 中文

### 项目描述

**BA-MC-Skins** 是一个围绕《蔚蓝档案》主题 Minecraft 皮肤资源构建的**协作管理与可视化平台**。

用 **Git** 做数据存储和版本控制，通过 **GitHub Actions** 自动化流水线从静态资源构建可交互的预览和下载站点，并为协作者提供图像差异对比视图。任何人都可以通过 Pull Request 提交新的或修改已有的皮肤，合并后自动构建并部署。

---

### 目录结构

```
BA-MC-Skins/
├── skins/                    # 资源根目录
│   └── {character}/          # 角色目录
│       └── {variant}.png     # 皮肤文件
├── src/                      # 前端源代码
├── scripts/                  # 构建与工具脚本
├── .github/workflows/        # GitHub Actions 流水线
├── index.html
├── package.json
└── vite.config.ts
```

---

### 贡献要求

欢迎通过 Pull Request 提交新的 BA 角色皮肤或修改现有皮肤，请在遵循以下规范的前提下：

#### 目录命名

- 在 `skins/` 目录下创建新角色时，**目录名必须使用该角色的完整英文名称**
- 使用**小写字母**，单词间以连字符分隔，如 `hoshino-takanashi`

#### 变体命名

皮肤变体名称**必须**使用以下标准命名之一：

- `Default`
- `Swimsuit`
- `Summer`
- `Sports`
- `NewYear`
- `Valentine`
- `Christmas`
- `Casual`
- `School`
- `Party`

#### 文件格式

- 仅接受 **PNG** 格式
- 文件名必须与上述变体名称列表完全一致

---

Made with ❤️ by ENA