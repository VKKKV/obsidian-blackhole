# Obsidian Black Hole — Handoff

> 给下一个 AI 的完整上下文。项目已构建（build 通过），但未在真实 Obsidian 中运行过，**一定有 bug**。

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

- `npm run build` 通过，产出 `main.js` 82KB
- 所有 TS 源文件合计 ~1200 行
- **未在真实 Obsidian 中运行过** — 代码是写的，不是调试出来的
- 无 git 仓库（`git init` 都没跑）

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

### 1. 致命级

- **Token glide 未启用**: shader 里定义了 `glidedToken()` 函数，但 `main()` 中直接用了 `uTokenLevel` uniform，没用 glide 插值。Token 模式下数值跳变时会瞬移。修复方法：传两个 uniform (`uTokenPrev`, `uTokenChangeTime`)，在 shader 里调用 `glidedToken()`。

- **capture 首次帧空白**: `capture()` 是异步的（dom-to-image promise），插件启动后 `latestCanvas` 为 null，前几百毫秒 shader 拿空白纹理渲染。解决方法：启动时立即触发一次 capture，或用黑色 canvas 作为 fallback（已有 `blankCanvas` 但没正确衔接）。

- **shader 里 L.star 改成了 STAR_GAIN**: 在 `makeFS()` 生成的主循环末尾，星场亮度用了 `STAR_GAIN` 而不是 `L.star`（`L.star` 在 demo 模式下是 crossfade 后的值）。这导致 demo 模式星场不跟随预设。定位在 shader 最后的 `stars(dd) * STAR_GAIN` 两处，应改回 `L.star`。

### 2. 重要

- **`activeLeaf.containerEl` 是 private API**: Obsidian 的 `WorkspaceLeaf` 没有暴露 `containerEl` 的 public 类型，`findCaptureTarget()` 用了 `(activeLeaf as any).containerEl`。可能在未来版本 break。更稳的方法：通过 `workspace.rootSplit.children` 遍历找 `view-content`。

- **ribbon icon 'goal' 可能不存在**: Obsidian 的 ribbon icon 基于 Lucide。`'goal'` 不是标准 Lucide 图标名。如果 Obsidian 版本不支持，会静默不显示。改成 `'circle-dot'` 或 `'target'` 等已知存在的图标。

- **shader recompile 阻塞**: settings 里每个 slider 拖动都触发 `onModeChange()` → `renderer.recompile()`，导致每帧重编译一次 shader。拖动过程中可能卡顿。修复：debounce（比如只保存不重编译，等用户关闭 settings tab 时再 recompile）。

### 3. 可优化

- **dom-to-image 性能**: 每隔 300ms 截取整个 workspace leaf（0.5x 分辨率），CPU 开销较大。考虑：只有当 hole visible 且 token level > 0.1 时才 capture；或降低到 1fps。

- **canvas z-index 冲突**: `z-index: 10` 在 Obsidian 复杂的 stacking context 里可能偏低（modals = 100+）。应设为 `var(--layer-cover)` 或至少 100。但 `pointer-events: none` 保证了点击穿透。

- **无 git 仓库**: 不方便 diff 和回退。建议 `git init && git add . && git commit -m "init: obsidian blackhole plugin scaffold"`。

- **World-count polling 500ms**: 大文件的 `editor.getValue()` + `split` 每 500ms 执行可能引起卡顿。考虑缓存 editor content hash，只有变化时才重新计算。

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
    ├── main.ts         — 227 lines
    ├── renderer.ts     — 223 lines
    ├── shader.ts       — 418 lines (核心 GLSL ~360 行)
    ├── capture.ts      — 78 lines
    └── settings.ts     — 219 lines
```

## 推荐的下一步

1. 修掉 **致命级 3 个 bug**（token glide、首次空白帧、STAR_GAIN 变量名错误）
2. 在真实 Obsidian 中加载，修 WebGL compile / runtime 错误
3. 加上 debounced recompile
4. `git init` 建立版本管理
5. 优化 capture 性能（降低频率 + 条件触发）
