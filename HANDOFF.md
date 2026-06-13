# Obsidian Black Hole — Handoff

> 给下一个 AI 的完整上下文。项目已构建（build 通过）。已做过一轮 bug 修复 + 错误处理加固，但仍需在真实 Obsidian 中充分验证。

## 项目目标

把 [ghostty-blackhole](https://github.com/VKKKV/blackhole_ghostty)（一个在 Ghostty 终端里用 GLSL shader 实时 ray-trace 的黑洞，含引力透镜、吸积盘、光子环）迁移为 **Obsidian 插件**。

核心：在 Obsidian workspace 上覆盖一层 **WebGL2 canvas**，用同样的 Schwarzschild 测地线积分 shader 渲染黑洞，对 workspace 内容（笔记等）产生引力透镜扭曲效果。

## 架构概览

```
src/
  main.ts      — 插件入口，生命周期，canvas 创建/销毁，activity/monitor/driver
  renderer.ts  — WebGL2 渲染器，shader 编译，uniform 管理，RAF loop
  shader.ts    — GLSL 工厂函数（makeFS），接收 ShaderParams 生成完整 fragment shader
  capture.ts   — 用 dom-to-image-more 异步截取 workspace DOM 到 canvas
  settings.ts  — Obsidian 原生设置面板
main.js        — 编译产物（82KB，含 bundled dom-to-image-more）
manifest.json
styles.css     — canvas overlay 定位（position: absolute, pointer-events: none）
```

## 当前状态

- `npm run build` 通过，`npx tsc --noEmit` 干净（仅剩 tsconfig `baseUrl` 弃用警告）
- 所有 TS 源文件合计 ~1300 行
- 已有 git 仓库 + GitHub remote (`VKKKV/obsidian-blackhole`)
- **已修一轮 bug + 错误处理加固**（见下方 ✅ 标记），但真实 Obsidian 运行验证仍不充分

## 已修复（本轮）

- ✅ **Token glide**: shader `main()` 现调用 `glidedToken(uTokenLevel, uTokenPrev, uTokenChangeTime)`；renderer 用私有 `lastTokenLevel` 检测变化，把变化前的值作为 glide 起点，并上传两个新 uniform。
- ✅ **STAR_GAIN → L.star**: 两处星场亮度改回 `L.star`，demo 模式星场重新跟随预设。
- ✅ **首次空白帧**: `start()` 立即触发一次 capture，不再等 ~350ms。
- ✅ **ribbon icon**: `'goal'` → `'circle-dot'`（确定存在的 Lucide 图标）。
- ✅ **debounced recompile**: slider 拖动改用 `onParamsChange()`（`debounce(…, 200)`）；mode 切换不再 recompile（`uSizeMode` 是 uniform）；text 输入也会触发 recompile。
- ✅ **错误处理加固**：
  - RAF loop 包 try/catch，出错只 log 一次并 `stop()`，不再每帧抛 uncaught。
  - `start()` 包 try/catch，失败时清理 + Notice + `enabled=false`。
  - 首次 start 延迟到 `workspace.onLayoutReady()`，避免布局未就绪时查询/截取。
  - capture/metric 两个 interval 回调各自 try/catch。
  - `computeTokenLevel()` 整体 try/catch。
  - capture：`domToImage.toCanvas` 同步调用包 try/catch；连续失败 5 次后自动停用（`failed=true`）。
- ✅ **MutationObserver → workspace events**: 原先监听整个 `document.body` subtree（每次按键都触发），改为 `active-leaf-change` + `layout-change`，`stop()` 里用 `offref` 清理。
- ✅ **findCaptureTarget 去私有 API**: 不再用 `(activeLeaf as any).containerEl`，改 DOM 查询 `.workspace-leaf.mod-active .view-content`。
- ✅ **license 一致性**: `package.json` 由 `MIT` 改为 `GPL-3.0-or-later`（与 LICENSE / README 一致）。

## Shader 说明

`src/shader.ts` 导出一个 `makeFS(params: ShaderParams): string` 工厂函数，把所有可调参数作为 compile-time `const float` 注入 GLSL 源码。物理逻辑与原始 blackhole.glsl **完全一致**：

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

- **dom-to-image 性能**: 仍每隔 ~350ms 截取整个 workspace leaf（0.5x 分辨率），CPU 开销较大。下一步可考虑：只有当 hole visible 且 token level > 0.1 时才 capture；或降到 1fps。（连续失败 5 次会自动停用，但正常路径未做条件触发。）

- **canvas z-index 冲突**: `z-index: 10` 在 Obsidian 复杂 stacking context 里可能偏低（modals = 100+）。`pointer-events: none` 保证点击穿透，所以暂未改动；若发现被遮挡可设 `var(--layer-cover)` 或 ≥100。

- **World-count polling 500ms**: 大文件的 `editor.getValue()` + `split` 每 500ms 执行可能卡顿。考虑缓存 editor content hash，只有变化时才重新计算。（已包 try/catch，不会再因此抛 uncaught。）

- **`enabled` 状态未持久化**: ribbon 关闭后重载插件会重新开启（`enabled` 不在 settings 里）。可加入 settings 持久化。

### 4. 缺失功能

- **Pomodoro 模式未测试 wall-clock 对齐**: Obsidian 中 `Date` 是准确的，但 RAF（`uTime`）在窗口隐藏时会暂停。pomodoro 用 `uDate.w`（wall clock seconds）做主驱动，RAF 仅用于 TIME_SCALE 测试加速——这个逻辑与原始一致，建议验证。

- **无热重载**: 开发时需要手动 `npm run build` + Obsidian 重载插件。建议装 Hot-Reload 插件或添加 file watcher。

- **无 demo GIF / presets 截图**: 原始项目有 `demo.gif` 和 `presets-grid.png`，本插件没有。用户看不到效果预览。

## 如何在 Obsidian 中调试

1. `npm run build` 产出 `main.js`
2. 把 `main.js` + `manifest.json` + `styles.css` 复制到 vault 的 `.obsidian/plugins/obsidian-blackhole/`
3. Obsidian → Settings → Community plugins → 刷新列表 → 启用 Black Hole
4. 看 DevTools console (`Ctrl+Shift+I`) 的 WebGL 错误 / shader compile log
5. Shader 报错会在 console 打印 `Shader compile error:`

## 关键决策点

- 所有 tunable 用 compile-time const（而非 uniform），让编译器做 constant folding。代价是 settings 变更需要 recompile shader（~1ms）。
- 截取 workspace 到纹理用的是 `dom-to-image-more`（SVG foreignObject 方案），而不是 `html2canvas`（基于 canvas drawing，通常更快但精度低）。如果性能有问题可以换。
- 窗口隐藏时 RAF 暂停，但 `uDate` 继续走 wall clock，所以 pomodoro 模式不受影响。Token mode 的 word count 由 setInterval 驱动也不依赖 RAF。

## 文件清单

```
obsidian-blackhole/
├── manifest.json       — 插件元数据 (id: obsidian-blackhole)
├── main.js             — 编译产物（82KB）
├── styles.css          — canvas overlay 样式
├── package.json        — 依赖 (obsidian, dom-to-image-more, esbuild...)
├── esbuild.config.js   — 构建配置
├── tsconfig.json       — TypeScript 配置
├── .gitignore
└── src/
    ├── main.ts         — 272 lines
    ├── renderer.ts     — 243 lines
    ├── shader.ts       — 420 lines (核心 GLSL ~360 行)
    ├── capture.ts      — 100 lines
    └── settings.ts     — 220 lines
```

## 推荐的下一步

1. **在真实 Obsidian 中加载验证**（最重要）：刷新插件 → 看 DevTools console 有无 shader compile / WebGL runtime 错误，确认黑洞实际渲染、引力透镜对笔记生效。
2. 验证三种模式：Token（改字数看 hole 平滑 glide）、Pomodoro（wall-clock 对齐）、Demo（42s 巡览 + 星场跟随预设）。
3. 优化 capture 性能（条件触发：仅 hole visible 且 token level > 0.1 时截取；或降到 1fps）。
4. 持久化 `enabled` 开关状态。
5. 补 demo GIF / presets 截图到 README。
