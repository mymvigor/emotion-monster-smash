# 打倒情绪小怪兽

一款零成本、隐私优先、离线可玩的手机端情绪发泄 PWA。

## 功能

- 情绪 / 人格两种入口，本地规则生成最多 3 只独特怪物
- 点击连击、滑动扇飞、长按蓄力、拖拽甩飞
- 程序化 SVG 软胶形变与 Web Audio 合成音效
- IndexedDB 本地图鉴与“老熟人”机制
- 默认不保存原始输入，不联网，不需要账户或 API Key
- Service Worker 离线缓存，支持添加到 iPhone 主屏幕

## 本地运行

任何静态服务器均可，例如：

```powershell
python -m http.server 4173 --directory dist
```

然后访问 `http://localhost:4173`。

## 部署

仓库已包含 GitHub Actions 工作流，推送到 `main` 后会自动部署到 GitHub Pages。
