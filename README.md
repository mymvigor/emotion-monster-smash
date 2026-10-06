# 打倒情绪小怪兽

一款零成本、隐私优先、离线可玩的手机端像素街机情绪发泄 PWA。

## 功能

- 街机主菜单、情绪 / 人格两种入口，本地生成最多 3 只差异化怪物
- `UNDERSTAND → CREATE → Semantic Check` 中文语义生成，不依赖固定怪物名单
- 几何、器官、机械部件、道具等 Visual Primitives 自由组合，保证剪影差异
- 普通拳、重拳、巴掌、上勾拳、下砸、抓摔、旋转投掷和连击爆发
- 明确 HP、伤害数字、暴击、撞墙伤害、Hit Stop 与像素粒子
- K.O. 后手选 DELETE、像素粉碎、压扁、黑洞或踢飞，Canvas 粒子完成真实终结动画
- 46 个原创程序化 WAV 组成永久本地音频库，包含首页、战斗、Boss、胜利和多组随机 SFX
- 音频按场景懒解码；退出战斗立即释放 Canvas、粒子、音频源和战斗音频缓冲
- IndexedDB 像素图鉴与“老熟人”机制
- 默认不保存原始输入，不联网，不需要账户或 API Key
- Service Worker 缓存完整音频库，首次成功加载后可离线游玩并支持添加到 iPhone 主屏幕

## 资源预算

运行 `node scripts/verify-budget.mjs` 会强制检查体积预算。当前首屏核心约 0.28 MB，完整 `dist` 约 1.58 MB；门槛分别为 10 MB 和 50 MB（绝不允许达到 100 MB）。

音频文件由 `scripts/generate-audio.mjs` 一次性生成并保存在 `dist/assets/audio/`。运行时不会调用图片、音乐、音效、动画或战斗相关的 AI/API。

## 本地运行

任何静态服务器均可，例如：

```powershell
python -m http.server 4173 --directory dist
```

然后访问 `http://localhost:4173`。

## 部署

仓库已包含 GitHub Actions 工作流，推送到 `main` 后会自动部署到 GitHub Pages。
