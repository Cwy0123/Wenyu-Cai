# 作品集网站（复古暖色长页 + GSAP）

这是一个用于 GitHub 展示的个人作品集网站：中文、长页面分区、滚动动效（GSAP/ScrollTrigger），部署到 GitHub Pages。

## 本地运行（最常用）

在项目根目录（`D:\\vibecoding`）打开终端：

```bash
npm.cmd install
npm.cmd run dev
```

打开终端提示的本地地址即可预览。

## 版式

当前仅保留 **仪表盘版**（默认）。

## 我该改哪里（更新内容最简单）

### 1) 改文字/链接
编辑：`src/content/content.json`

你会看到这些字段：
- `site`: 标题、名字、一句话定位、联系方式、性格标签
- `hero`: 仪表盘版 Hero（slogan、照片、CTA 等）
- `dashboard`: 仪表盘版能力盘数据（研究 KPI、AI 亮点、项目看板、内容标题、视觉封面）
- `campusWorks`: 校园作品卡片
- `researchProjects`: 科研项目（时间线）
- `psWorks`: PS 作品（图片画廊）
- `honors`: 证书荣誉（图片画廊）

### 2) 换图片/证书
把图片放到：
- `public/assets/ps/`
- `public/assets/honors/`

然后在 `src/content/content.json` 里把 `image` 改成类似：
- `/assets/ps/xxx.jpg`
- `/assets/honors/yyy.png`

说明文件：`public/assets/README.md`

## 构建（检查能否上线）

```bash
npm.cmd run build
```

构建产物在 `dist/`。

## 部署到 GitHub Pages

1. 把本项目推送到你的 GitHub 仓库（仓库名例如：`my-portfolio`）。\n
2. 运行部署命令：\n

```bash
npm.cmd run deploy
```

它会把 `dist/` 推送到 `gh-pages` 分支。\n
3. 打开 GitHub 仓库 Settings → Pages：\n
   - Source 选择 `Deploy from a branch`\n
   - Branch 选择 `gh-pages` / `root`\n
\n
稍等片刻，你的站点地址一般会是：\n
`https://<你的GitHub用户名>.github.io/Wenyu-Cai/`

## 常见问题（Windows/PowerShell）

### Q1: 为什么我用 `npm -v` 会报脚本禁止？
你的 PowerShell 里可能存在 `D:\\npm.ps1` 抢占了 `npm` 命令。\n
本项目所有命令都用 `npm.cmd`，可绕过这个问题。


