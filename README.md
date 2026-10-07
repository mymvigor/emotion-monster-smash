# 打倒情绪小怪兽 V4

一款隐私优先、手机优先、可完整离线游玩的像素街机情绪发泄 PWA。输入一段情绪或一种讨厌的行为，系统会把它变成拥有独立外形、象征护甲、战斗性格、场景和台词的怪物。

## V4 的核心循环

1. 选择「脑内作战」或「人间奇葩」。
2. 选择生成导演：`OFFLINE` 或 `AI DIRECTOR`。
3. 输入一句话，生成统一的 `EncounterDNA`。
4. 经历 `DEFIANT → CRACKED → BREAKDOWN` 三个阶段，打碎 1–3 件象征护甲和可破坏场景。
5. HP 归零只会触发 `BREAK`，随后进入 8 秒以上的 `RELEASE` 自由追打阶段。
6. 用招式多样性、连击、暴击、撞墙、场景破坏、武器和隐藏招式提高释放值；达到 100% 会触发 `FULL RELEASE`。
7. 玩家亲自选择复合终结技，场景化终结后进入短暂静默，再显示「清净了。」和战斗统计。

## 双导演模式

### OFFLINE

- 本地中文语义分析和组合式怪物生成，不调用任何 AI 网络接口。
- 免费、可离线、无需账号或 API Key。
- 使用语义积木、视觉积木、象征护甲、场景、故事、台词和变异规则组合遭遇，而不是从固定完整怪物名单中抽取。
- 最近 12 次遭遇参与新颖度控制，减少剪影、场景和变异重复。

### AI DIRECTOR

- 先在本机 IndexedDB 的 AI 怪物库中做语义匹配。
- 高匹配直接复用并变异；两个兼容的中等匹配可以融合成新怪物。
- 没有匹配时提供一次性 ChatGPT 手动桥接：复制严格提示词、粘贴 JSON、校验后存入本地库。
- 当前 GitHub Pages 版本不会伪造「Sign in with ChatGPT」，也不会把 OAuth 凭据、API Key 或会话令牌放进静态前端。
- 每个新语义最多需要一次外部文本生成；保存后，相似输入优先复用本地资产。

AI 资产包含语义核心、别名、触发概念、视觉隐喻、视觉积木、象征护甲、场景、战斗性格、微故事、分阶段台词和可复用元素。运行时统一转换为 `EncounterDNA`，所以离线导演和 AI 导演共用同一套战斗系统。

这里选择手动桥接而不是伪造登录：OpenAI 的 [Sign in with ChatGPT quickstart](https://developers.openai.com/siwc/quickstart) 将网站登录与开源计划调用区分开；[开源计划接入](https://developers.openai.com/siwc/token-sharing-open-source) 需要 Host ID、OAuth 交换和受保护的凭据存储；[网站集成](https://developers.openai.com/siwc/website) 目前也要求获批的 Client ID、精确回调地址和后端会话。纯静态 GitHub Pages 无法安全承担这些职责。项目已保留 `AIDirectorAdapter` 边界，未来具备正式资格和安全后端时可以替换 provider，而不改战斗系统。

## 战斗系统

- 点按拳击、横划巴掌、上划升龙、下划砸地、斜划旋转、长按重击，以及场景武器。
- 各招式拥有不同伤害、Hit Stop、击退方向、音效、动画和释放收益。
- 10 / 20 / 30 连击会逐级升级反馈，30 连击进入 `RAGE`。
- 风格等级：`C / B / A / S / CHAOS`。
- 隐藏招式包括镜像巴掌、墙壁回声、怒气陨坑和奖杯反击。
- 怪物会挑衅、闪动、绕场或摆架势，但不会以无敌或强制反击破坏玩家主导感。
- 完整台词由导演每 3–7 秒调度；普通命中只发短促哼声，阶段变化、暴击、护甲破裂和秘密发现才会触发完整台词。

## 程序化场景与长期系统

- `stage / office / corridor / factory / void / ranking / maze` 等场景由本地积木生成。
- 道具有 `normal → damaged → broken → destroyed` 四态，部分破损道具可作为武器。
- 变异包含低重力、双反弹、巨大化、迷你化、分身、故障场景、额外道具、多层护甲、粘墙和超级击退；未触发前可保持隐藏。
- 重复语义会培养宿敌，记录代数、击败次数、终结历史、变异历史、伤痕和偏好场景。
- 图鉴分为遭遇、AI 库、宿敌、发现四页；首页有轻量随机待机事件和每日混乱规则。

## 隐私与本地数据

- 默认不保存原始输入；只有用户主动打开「保留原始输入」才会将原文保存在当前设备。
- 怪物、遭遇摘要、AI 资产、宿敌、发现和设置保存在 IndexedDB。
- 升级数据库时保留 V3 的 `monsters / history / settings` 数据。
- AI 手动桥接的复制与粘贴由用户主动完成；游戏不会暗中发送输入。
- 「清空全部本地数据」会清除所有上述对象仓库。

## 音画与资源释放

- 46 个原创程序化 WAV 全部随 PWA 提供。
- 战斗音频分为 base、percussion、rage、break、release、full、finisher 和 silence 层；只在需要时解码。
- 怪物和场景由 HTML / CSS / SVG 程序化绘制；Canvas 只负责短生命期粒子和终结效果。
- 离开战斗会取消定时器、停止并断开音频源、删除战斗音频缓冲、清空粒子数组、将 Canvas 尺寸归零并移除 DOM。

## PWA 与资源预算

Service Worker 预缓存 V4 核心模块、图标和完整本地音频库。首次成功加载后可离线游玩，并支持添加到 iPhone 主屏幕。

```powershell
node scripts/verify-budget.mjs
```

当前自动检查结果：首屏核心约 **0.31 MB**（要求 `< 10 MB`），完整 `dist` 约 **1.67 MB**（目标 `< 50 MB`，硬上限 `< 100 MB`）。

## 验证

```powershell
node scripts/verify.mjs
node scripts/verify-v4.mjs
node scripts/verify-budget.mjs
node scripts/browser-qa.mjs
```

- `verify.mjs`：V3 数据/语义兼容、8 组中文输入、安全分流、46 个本地 WAV、V4 离线缓存。
- `verify-v4.mjs`：500 局遭遇模拟、阶段与护甲、BREAK/RELEASE/终结、10 变体新颖度、场景四态、AI JSON 校验、语义匹配、复用/融合和离线网络守卫。
- `verify-budget.mjs`：首屏和完整离线包硬性体积门槛。
- `browser-qa.mjs`：用本机 Edge 的 390×844 手机视口连续完成 20 局真实 DOM/手势战斗，并验证 AI 手动桥接、JSON 报错、导入、本地复用、退出后的 Canvas/音频释放和断网重载后的离线开战。

## 本地运行

```powershell
python -m http.server 4173 --directory dist
```

访问 `http://localhost:4173`。

## 部署

仓库现有 GitHub Actions 工作流会把 `dist/` 部署到 GitHub Pages。推送到 `main` 后无需额外构建步骤。
