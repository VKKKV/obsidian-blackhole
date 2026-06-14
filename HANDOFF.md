# Obsidian Black Hole — Handoff

> 给下一个 AI 的完整上下文。项目已构建（build 通过）。已做过多轮修复：bug 修复、错误处理加固、性能/GPU、以及**渲染模型重构（透明全窗口 overlay）**。仍需在真实 Obsidian 中充分验证视觉效果（GLSL alpha 合成无法在无 GPU 的环境里验证）。

## 项目目标

把 [ghostty-blackhole](https://github.com/VKKKV/blackhole_ghostty)（一个在 Ghostty 终端里用 GLSL shader 实时 ray-trace 的黑洞，含引力透镜、吸积盘、光子环）迁移为 **Obsidian 插件**。

核心：在**整个 Obsidian 窗口**上覆盖一层**透明** WebGL2 canvas，用同样的 Schwarzschild 测地线积分 shader 渲染黑洞。canvas 只在黑洞附近不透明，其余区域透明 → 真实 DOM（笔记/界面）正常可见且可交互，黑洞悬浮其上、可在全窗口移动；黑洞附近用最近一次 workspace 截图做引力透镜扭曲。

## 渲染模型（重要——与原版差异最大处）

- **透明 overlay，不是不透明替换**：shader 输出 straight alpha `vec4(rgb, coverage)`。远离黑洞 coverage→0（透明，露出真实 DOM）；shadow 内 coverage=1（不透明黑）；吸积盘亮处 coverage=亮度；中间用 `window*shield` 做透镜淡出。passthrough 分支输出 `vec4(0.0)`。
- **canvas 挂在 `.app-container`（整窗）**，`position:fixed; inset:0; z-index:90; pointer-events:none`。
- **capture 与渲染解耦（关键性能点）**：GPU 60fps 对着"上一张截图"动画;dom-to-image 只**偶发**运行（默认 1.5s 间隔 + 事件触发：active-leaf-change / layout-change / 滚动停止 debounce）。截取目标是整窗 `.app-container`，与 canvas 对齐。
  - ⚠️ 代价：滚动时洞附近的透镜贴图会滞后 ~250ms 直到重新截图。
  - 为什么不能像 Ghostty 那样零成本：DOM 不是现成 GPU 纹理；唯一来源是 CPU 光栅化(dom-to-image，慢)或 Electron 屏幕捕获(插件拿不到主进程 API)。所以走"偶发截图 + GPU 动画"折中。

## 架构概览

```
src/
  main.ts      — 插件入口，生命周期，全窗 canvas 创建/销毁，事件驱动 capture，token 指标轮询
  renderer.ts  — WebGL2 渲染器，shader 编译，uniform，RAF loop，render scale，软件渲染器探测/自适应降质
  shader.ts    — GLSL 工厂函数（makeFS），ShaderParams → fragment shader（透明 alpha 输出）
  capture.ts   — dom-to-image-more 截取整窗，自适应退避，可开关
  settings.ts  — Obsidian 设置面板（含 Render Scale / Capture Workspace / Capture Interval）
dev/
  index.html, harness.ts — 独立浏览器 shader harness（npm run harness）
main.js        — 编译产物（含 bundled dom-to-image-more）
styles.css     — canvas overlay 定位（position: fixed, 全窗, pointer-events: none, z-index 90）
```

## 当前状态

- `npm run build` 通过，`npx tsc --noEmit` 干净（仅剩 tsconfig `baseUrl` 弃用警告）
- 已有 git 仓库 + GitHub remote (`VKKKV/obsidian-blackhole`)，最新 commit 含透明 overlay 重构
- Hot Reload 已装入 vault；`data.json`（运行时设置）已 untrack + gitignore
- **未在真实 Obsidian 充分视觉验证** overlay 重构 — 下一个 AI 优先做这个（见末尾推荐步骤）

## 已修复 / 已改（按时间）

- ✅ **透明全窗 overlay 重构**（最新）：见上方「渲染模型」。解决了"显示黑洞后看不到任何内容、只剩背景色"+"想全窗口移动"+"还是卡"。
- ✅ **性能/GPU**：`powerPreference:'high-performance'` + `desynchronized`；探测软件渲染器(SwiftShader/llvmpipe)→警告并自动降质；Render Scale 设置 + RAF 内自适应降分辨率；capture 自适应退避 + 可关闭开关。
- ✅ **致命崩溃修复**：dom-to-image 抓取 `app://` 字体/图片资源 → Obsidian 主进程 `decodeURIComponent` 抛 "URI malformed" 整个崩溃。关掉 `disableEmbedFonts`/`disableInlineImages` + `filterUrls` 只允 data: + `ignoreCSSRuleErrors`。
- ✅ **Token glide**: shader 调用 `glidedToken(uTokenLevel, uTokenPrev, uTokenChangeTime)`；renderer 用 `lastTokenLevel` 检测变化。
- ✅ **STAR_GAIN → L.star**（两处星场，demo 跟随预设）。
- ✅ **首次空白帧**、**ribbon icon `circle-dot`**、**debounced recompile**、**Integration Steps slider 现在会 recompile**。
- ✅ **错误处理加固**：RAF loop / `start()` / 两个 interval / `computeTokenLevel()` 全包 try/catch；首次 start 延到 `onLayoutReady`；capture 同步 throw + 连续失败 5 次停用。
- ✅ **MutationObserver → workspace events**（`active-leaf-change`/`layout-change`，`offref` 清理）。
- ✅ **findCaptureTarget**：去私有 `containerEl`，现取整窗 `.app-container`（透明 overlay 下与 canvas 对齐）。
- ✅ **license 一致性**：`package.json` → `GPL-3.0-or-later`。

## Shader 说明

`src/shader.ts` 导出一个 `makeFS(params: ShaderParams): string` 工厂函数，把所有可调参数作为 compile-time `const float` 注入 GLSL 源码。物理逻辑与原始 blackhole.glsl **完全一致**（仅最终输出改为 straight alpha overlay）：

- Binet-form 光子加速度 `a = -(3/2) h² x / r⁵`，leapfrog 积分
- 弱场解析偏折 + 近场测地线 trace（N_STEPS 步）
- 吸积盘：Shakura-Sunyaev 温度剖面，relativistic Doppler + beaming
- 光子环、shadow、引力时间 dilation
- 程序化星场
- MODE_DEMO：42s 自动巡览 8 个预设

改动点（vs 原始 Ghostty 版）：

| Ghostty | Obsidian WebGL2 |
|---------|----------------|
| `iChannel0` (terminal texture) | `uTexture` (workspace capture via dom-to-image) |
| `iCurrentCursorColor` → token decode | `uTokenLevel` uniform (JS 计算的 word count 等) |
| `iDate` | `uDate` vec4 (JS Date) |
| `iTimeCursorChange` | `uLastActivity` (键盘/鼠标事件时间) |
| `SIZE_MODE` #define | `uSizeMode` uniform (0/1/2) |

所有 tunable const（HOLE_RADIUS, DISK_\*, TOKEN_\*, N_STEPS 等）由 `makeFS()` 通过 `${p.xxx}` 模板注入，settings 变更时调用 `renderer.recompile()` 重新编译 shader。

## 已知 Bug / 待修项

### 1. 致命级 — 均已修复 ✅

- ✅ Token glide（见上方「已修复」）
- ✅ capture 首次帧空白
- ✅ `STAR_GAIN` → `L.star`

### 2. 重要 — 多数已修复

- ✅ **`activeLeaf.containerEl` private API**: `findCaptureTarget()` 已改用 DOM 查询 `.workspace-leaf.mod-active .view-content`，不再依赖私有字段。
- ✅ **ribbon icon 'goal'**: 改为 `'circle-dot'`。
- ✅ **shader recompile 阻塞**: 已 debounce（`onParamsChange` 200ms），mode 切换不再 recompile。

### 3. 可优化（仍待处理）

- ✅ **dom-to-image 性能 / 卡顿**: 已大幅缓解。capture 默认降到 ~700ms / 0.4x,并做**自适应退避**(单次 capture 耗时 ×3 作为下次间隔上限,最高 4s),避免"capture 比渲染还慢"导致的死锁式冻结;新增 **Capture Workspace 开关**(关掉则只透镜星场,零主线程开销)。重复纹理不再重复上传。

- ✅ **GPU 加速 / 软件渲染**: WebGL context 现请求 `powerPreference:'high-performance'` + `desynchronized`。启动时探测 `WEBGL_debug_renderer_info`,若是 SwiftShader/llvmpipe 等**软件渲染器**会 console.warn 并自动:
  - 降到 `mediump` float precision（~2x fragment throughput）
  - auto-quality 3 秒内开始自动降分辨率（不再是 60 帧后才触发）
  - 默认 `renderScale` 已改为 0.6（原 1.0）

- **canvas z-index 冲突**: `z-index: 10` 在 Obsidian 复杂 stacking context 里可能偏低（modals = 100+）。`pointer-events: none` 保证点击穿透,所以暂未改动；若发现被遮挡可设 `var(--layer-cover)` 或 ≥100。

- **World-count polling 500ms**: 大文件的 `editor.getValue()` + `split` 每 500ms 执行可能卡顿。考虑缓存 editor content hash,只有变化时才重新计算。（已包 try/catch,不会再因此抛 uncaught。）

- ✅ **`enabled` 状态未持久化**: ribbon 关闭后重载插件会重新开启（`enabled` 不在 settings 里）。可加入 settings 持久化。

### 5. 最新性能修复 (2026-06-14)

解决了"五秒一帧"的完全冻结问题：

- **默认 `nSteps` 48→24**：测地线积分步数减半，shader 每个像素工作量减半
- **默认 `renderScale` 1.0→0.6**：GPU 只需渲染 ~36% 的像素
- **`captureEnabled` 默认关闭**：新装插件不再自动启用 dom-to-image 截屏（opt-in 走设置开启）
- **auto-quality 时间基触发**：不再等 60 帧（软件渲染下需 5 分钟），而是运行 3 秒后开始检查，低于 30fps 就自动降分辨率
- **软件渲染 → `mediump` 精度**：检测到 SwiftShader/llvmpipe 时 shader 用 `mediump float`，吞吐量约 2x
- **capture scale 0.4→0.25**：dom-to-image 截取分辨率降为 ~6%，透镜效果模糊不影响观感
- **capture/metric 轮询 500→1000ms**：主线程压力减半
- **word-count 缓存**：内容长度未变时直接返回上次结果，跳过 `getValue()` + `split()` 大数组分配

### 开发工具

- **shader harness**: `npm run harness` → http://localhost:8000,脱离 Obsidian 调 shader(详见 README / dev/)。
- **Hot Reload**: 已装入 vault 并加入 community-plugins.json,插件目录有 `.git` + `.hotreload` 标记。配合 `npm run dev`(esbuild watch)改 `main.js` 自动重载。

### 4. 缺失功能

- **Pomodoro 模式未测试 wall-clock 对齐**: Obsidian 中 `Date` 是准确的，但 RAF（`uTime`）在窗口隐藏时会暂停。pomodoro 用 `uDate.w`（wall clock seconds）做主驱动，RAF 仅用于 TIME_SCALE 测试加速——这个逻辑与原始一致，建议验证。

- **无热重载**: 开发时需要手动 `npm run build` + Obsidian 重载插件。建议装 Hot-Reload 插件或添加 file watcher。

- **无 demo GIF / presets 截图**: 原始项目有 `demo.gif` 和 `presets-grid.png`，本插件没有。用户看不到效果预览。

## 开发 / 调试

插件目录是 vault 里的**软链接** (`knowledge/.obsidian/plugins/obsidian-blackhole` → 本仓库)，所以 build 即部署。

- **改 shader / 视觉**：`npm run harness` → http://localhost:8000，浏览器里调，不用开 Obsidian。harness 的 canvas 背后有 mock 笔记，可验证透明 overlay。
- **改插件 / 集成**：`npm run dev`（esbuild watch）→ 保存即重建 `main.js`；Hot Reload 已装入 vault，会自动重载插件（目录有 `.git` + `.hotreload` 标记触发）。
- 看 DevTools console (`Ctrl+Shift+I`)：shader 报错打印 `Shader compile error:`；本插件错误都带 `BlackHole:` 前缀；启动会打印 `BlackHole: WebGL renderer = …`（确认是否硬件加速）。

## 关键决策点

- 所有 tunable 用 compile-time const（而非 uniform），让编译器做 constant folding。代价是 settings 变更需要 recompile shader（~1ms，已 debounce）。
- **透明 overlay + 偶发截图**：见上方「渲染模型」。这是为了在没有"免费 GPU 纹理"的前提下，既保留招牌透镜效果、又不卡、又能看到真实内容的折中。
- 截取用 `dom-to-image-more`（SVG foreignObject）。必须禁用字体/图片内联，否则抓 `app://` 资源会让 Obsidian 主进程崩溃（见已修复）。如需更快的实时纹理，未来可探索 Electron `desktopCapturer`（需主进程权限，插件较难拿到）。
- 窗口隐藏时 RAF 暂停，但 `uDate` 继续走 wall clock，所以 pomodoro 模式不受影响。

## 文件清单

```
obsidian-blackhole/
├── manifest.json       — 插件元数据 (id: obsidian-blackhole)
├── main.js             — 编译产物（含 bundled dom-to-image-more）
├── styles.css          — canvas overlay 样式（fixed 全窗）
├── package.json        — 依赖；scripts: build / dev / harness
├── esbuild.config.js   — 构建配置（含 harness serve 模式）
├── tsconfig.json       — TypeScript 配置（include src + dev）
├── .gitignore          — 忽略 node_modules / dev/harness.js / .hotreload / data.json
├── dev/
│   ├── index.html      — harness 页面（mock 笔记 + 调参面板）
│   └── harness.ts      — 176 lines，独立 shader harness 入口
└── src/
    ├── main.ts         — 307 lines
    ├── renderer.ts     — 301 lines
    ├── shader.ts       — 433 lines (核心 GLSL ~360 行)
    ├── capture.ts      — 155 lines
    └── settings.ts     — 270 lines
```

## 推荐的下一步

1. **在真实 Obsidian 验证透明 overlay 重构**（最重要，未验证）：reload 插件 → 应能看到笔记正常显示、黑洞透明悬浮其上、洞附近透镜扭曲。若洞看起来像个不透明方块 / 边缘 ghosting / 完全看不到 → 调 shader 末尾的 coverage（`window*shield` 淡出、`emitLum`）。先在 harness 里调最快。
2. 验证三种模式：Token（改字数看平滑 glide）、Pomodoro（wall-clock 对齐）、Demo（42s 巡览）。
3. 调透镜质量：overlay 下 alpha 混合可能在透镜边缘有 ghosting（位移贴图与真实 DOM 叠加）。可加锐化的 coverage 曲线或可调"透镜边缘"参数。
4. 持久化 `enabled` 开关状态（现在 reload 会重置为开）。
5. 补 demo GIF / presets 截图到 README。
