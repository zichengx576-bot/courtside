<div align="center">

# COURTSIDE
### 你的私人球鞋顾问

**读懂球鞋科技，也读懂你的打法。**

[中文](README.md) · [English](README_EN.md) · [在线体验](https://zichengx576-bot.github.io/courtside/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-111111?logo=threedotjs&logoColor=white)
![Pages](https://github.com/zichengx576-bot/courtside/actions/workflows/pages.yml/badge.svg)

</div>

COURTSIDE 是一个中英文篮球鞋选鞋与科技展示网站。用真实产品照片、带来源的配置档案、两双对比和可交互中底示意，把复杂配置转成更容易理解的试穿方向。

![COURTSIDE 真实浏览器预览](docs/preview.png)

## 🏀 从你的打法开始

| 体验 | 你可以做什么 |
| --- | --- |
| **17 款球鞋档案** | 浏览 Nike/Jordan、李宁、安踏、adidas 与 PUMA 的配置、图片、适合打法和资料来源 |
| **球鞋 Battle** | 选择两双球鞋，对照五个维度的雷达图、配置与编辑建议分 |
| **个人选鞋建议** | 按体重、打法、场地、位置及脚感偏好筛选候选，查看适配理由和待验证事项 |
| **15 个 NBA 风格模板** | 从控球、无球投射、对抗与内线策应等风格理解选鞋重点 |
| **科技解构** | 旋转中底、调整展开程度、点选部件，查看位置、作用、资料来源和未公开信息 |
| **多角度照片** | 拖动、方向键切换、播放和放大产品实拍 |
| **X-dragon 问答** | 查询档案内的缓震、支撑、重量与推荐依据，支持上下文追问 |
| **中英文与本地保存** | 切换语言；在当前浏览器保存对比选择、个人档案与最近问答记录 |

档案包含 WOW 12、Kobe 6 Protro、Sabrina 4、Ja 4、Book 2、伽马 2、KD19、Air Jordan 41、KAI 3、808 6 Ultra、Harden Vol.10、Luka 5、LeBron 23、Giannis Freak 8、G.T. Cut 1、MB.06 和 Anthony Edwards 2。系列发布时间、赛季定位和配色首售日期分别记录，不能把全部档案理解为同年首发新品。

## 🌐 在线体验与部署范围

**[打开 GitHub Pages →](https://zichengx576-bot.github.io/courtside/)**

| 功能 | 本仓库的 GitHub Pages 展示版 |
| --- | --- |
| 档案、对比、选鞋、照片、3D、语言与本地问答 | 支持 |
| 浏览器保存个人选择与问答 | 支持，清除网站数据后重置 |
| 全站累计访客、社区读写与作者删除 | 不支持，需服务端与存储；界面会显示不可用状态 |

[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) 只托管静态文件，不能执行 `app/api/` 或 `server/` 的后台逻辑。本仓库保留这些源码，但 Pages 不生成虚构统计或模拟社区记录，也不自动连接其他平台的后台。完整网站的已有部署配置由作者单独管理。

## 🛠️ 技术栈

前端使用 React、Vite、Three.js、Motion、Recharts 和 Lucide；样式结合 CSS 与项目现有 Tailwind 工具链。仓库同时保留 Next.js/vinext、Cloudflare D1 路由及既有存储适配代码，供作者维护完整版本。Pages 使用独立的 SPA 构建路径。

## 🚀 本地运行

需要 **Node.js 22.13 或更新版本** 与 npm。

```bash
git clone https://github.com/zichengx576-bot/courtside.git
cd courtside
npm ci
npx vite --config vite.spa.config.mjs --host 127.0.0.1
```

打开终端显示的本地地址。这是前端预览，访客与社区 API 不会因此启动。X-dragon 是本地档案查询器，没有调用外部 AI 模型，无需 AI API 密钥。

### 更新 Pages

```bash
node scripts/build-pages.mjs
git add src public pages scripts README.md README_EN.md
git commit -m "Update Courtside website"
git push origin main
```

构建脚本只更新生成目录 `pages/`，为 `/courtside/` 适配构建产物中的图片路径，并生成 `.nojekyll` 与 `404.html`。原始 HTML/CSS/JS 不因路径适配被修改。GitHub Actions 发布已经提交的 `pages/`，不在云端安装项目依赖；修改源码后须先重新构建并提交产物。

## 🗂️ 项目导航

```text
src/                  React 界面、球鞋档案、选鞋与问答逻辑
public/               球鞋照片、球员照片、形象与素材来源
app/api/ + server/    完整版本后台源码，Pages 不执行
scripts/              检查、翻译与 Pages 构建工具
pages/                已构建的 Pages 静态网站
docs/                 推荐依据与素材权利说明
.github/workflows/    GitHub Pages 发布流程
```

## 🔎 数据与展示边界

- 雷达与匹配分是公开配置和编辑判断形成的初筛建议，未经本站统一实测。轻量建议分不等于克数；身高、脚型与足弓记录不构成经过验证的性能预测。
- 部分鞋款引用独立测试或实穿资料，具体版本、尺码和场地须分别核对。档案中的未知数据与来源冲突保留，不补造参数。
- 中底 3D 是非 1:1 的解释性重建，公开资料没有完整尺寸 CAD。多角度照片不是连续 360° 扫描。
- X-dragon 的答案来自本地档案与规则，不是实时大模型回答、价格查询或购买保证。
- 推荐用于缩小试穿范围；具体尺码、包覆和脚感仍需亲自试穿。

## 🤝 参与完善

欢迎通过 [Issues](https://github.com/zichengx576-bot/courtside/issues) 提交界面问题、配置纠错或希望收录的鞋款。纠错请附原始资料链接、具体版本和配色；界面问题请说明设备、浏览器和复现步骤。提交图片前确认授权并保留归属信息。

## 📄 许可证与素材

原创应用代码目前未指定开源许可证；公开展示不代表授予任意再分发或商用权利。品牌产品图与球员照片分别适用其原始权利和逐张许可证，第三方代码保留原许可证。详见 [素材与代码权利](docs/ASSET-RIGHTS.md)、[球鞋来源](public/shoes/sources.json) 和 [球员照片授权记录](public/players/sources-verified.json)。
