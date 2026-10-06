# 打倒情绪小怪兽

一款零成本、隐私优先、离线可玩的手机端像素街机情绪发泄 PWA。

## 功能

- 情绪 / 人格两种入口，本地 Pixel DNA 生成最多 3 只差异化怪物
- 14 种身体原型、情绪视觉隐喻、四档稀有度与 300+ HP Boss
- 普通拳、重拳、巴掌、上勾拳、下砸、抓摔、旋转投掷和连击爆发
- 明确 HP、伤害数字、暴击、撞墙伤害、Hit Stop 与像素粒子
- K.O. 后手选 DELETE、像素粉碎、压扁、黑洞或踢飞终结技
- 程序化像素 SVG 与 Web Audio 合成音效
- IndexedDB 像素图鉴与“老熟人”机制
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
