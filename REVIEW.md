# Black Hole: review and refactor

## Confirmed baseline defects

Reviewed revision: `72d4d804ae70e28bd854e42473a7c8e84ee068dc`.

- `main.ts`: idle-only startup stopped the renderer, then unconditionally restarted it; an unload before layout-ready did not invalidate the deferred startup callback.
- `renderer.ts`: intentional 18/10 FPS scheduling was compared against a 30 FPS threshold. Healthy scheduling reduced quality. The minimum scale of .25 overrode the UI's .15 and software policy's .22.
- `capture.ts`: cooldown was measured from capture start, capped below the user's 6000ms setting, and reset by UI events. Slow successful captures could repeat without a recovery interval.
- `shader.ts`: 6–10 integration steps were insufficient to reach the event horizon on the center ray. In a controlled SwiftShader run, three default-parameter samples contained nonzero alpha but zero RGB.
- CPU crop coordinates and the shader's vertical UV direction disagreed; token interpolation state was changed after crop calculation.
- Pomodoro settings did not update running shader parameters, unchanged notes were fully recounted each second, and the harness uploaded a texture without enabling sampling.

These are reproducible defects, not proof of the unique cause of a particular Obsidian freeze. No real vault or running Obsidian instance was accessed.

## Initial anti-freeze refactor boundaries (8728525)

Startup and recompile are asynchronous and generation-guarded. Idle-only playback and document visibility gate initial GPU initialization, rendering and capture. A context loss or fatal renderer error stops the session instead of continuing to draw. Software WebGL is rejected before shader compilation in the plugin; only the isolated shader playground/tests may explicitly opt into it.

The renderer computes a single effect center/radius/intensity state for both crop and GLSL. Integration uses highp and defaults to 64 steps (48–96), while performance is bounded primarily by cropped pixel area, .15–.35 effective render scale and intentional frame cadence. This restores useful integration, not a claim of physically exact ray tracing or universal convergence.

Workspace capture remains opt-in and approximate. It is dirty-driven, honors completion-based cooldown, invalidates stale asynchronous results, and trips a circuit on oversized DOM or excessive capture duration. Resource-bearing elements/styles are filtered. This is NOT a network sandbox; timers cannot interrupt synchronous DOM work. An unresolved underlying library operation keeps the shared capture lock until it actually settles.

## Verification

Run from the repository:

```sh
npm ci
npm run check
npm run build -- --outdir=/tmp/blackhole-release
# Optional browser tests; requires Python Playwright and its Chromium:
python tests/webgl_smoke.py
python tests/capture_smoke.py
```

`CHROMIUM_EXECUTABLE=/absolute/path/to/chrome` selects an existing browser installation. Node tests mock Obsidian/WebGL and exercise actual bundled TypeScript; they do not pretend to reproduce Electron driver behavior. The browser test uses real Chromium WebGL/SwiftShader, explicitly allowed in that isolated test only, and checks colored output, vertical crop/texture orientation, software rejection, frame cadence, and context loss.

The root `main.js` is intentionally NOT rebuilt during this review, because the project may be linked into a vault with Hot Reload. Build into an explicit output directory; copy the resulting main.js with manifest.json and styles.css only when ready to test deployment.

## Verified results

- User manually tested the refactored plugin in Obsidian and reported that it no longer freezes. Remaining visual feedback: the effect is too small and appears to flicker; visual parity with the Ghostty reference is a separate follow-up.
- TypeScript check and 21 Node regression tests pass.
- Real Chromium/SwiftShader smoke passes: three colored samples, no WebGL errors, top-left crop/texture orientation, transparent capture alpha, deliberate cadence without false downscale, software renderer rejection and context-loss shutdown.
- Real DOM capture smoke passes: a scrolled text fixture captures the visible blue text (not the offscreen red text), and preserves its opaque `[220,220,220,255]` background.
- Adversarial review found an init-continuation resource resurrection, stripped background colors and an inverted token-area setting. New tests reproduced the first two before patching; the final suite covers all three.
- Production bundle builds into an isolated output directory; `git diff --check` passes. Root `main.js` remains the pre-refactor artifact deliberately, not an updated plugin.

## Visual follow-up

User manually confirmed the initial refactor no longer froze Obsidian, then
reported a tiny effect, apparent flicker and missing reset. The follow-up uses
upstream shader parameters/formulas from `s0xDk/ghostty-blackhole` commit
`b49fa0ab2eaf0644a690f4cb386d70c21eb9f969`, choosing its 42-second Demo tour for
fresh/reset installs rather than the upstream Claude-driven Token default.

- Removed hard size/area clamps and the double 0.55 radius attenuation.
- Disable desynchronized presentation, defer resize/scale mutations to the next
  draw, reuse crop dimensions and align its origin to backing pixels. Keep
  preserveDrawingBuffer=false: late readPixels can be empty while the compositor
  still displays the previous frame; actual screenshots verify retention.
- Target 60 FPS on hardware; cap backing pixels at 262,144 and poll a GPU fence
  without waiting, so increased visual size does not create an unbounded GPU queue.
- Add one-click reset with preserved language/on-off state; old untouched tiny
  settings migrate, customized configurations remain available.
- Follow-up validation: 29 Node regressions and TypeScript pass; real Chromium
  WebGL, capture and full-tour sampling pass. The 1000×700 fixture grows its
  shadow diameter from 23.6 to 166.9 CSS pixels while staying under the backing
  pixel budget. The test's RAF timing describes that isolated environment, not
  guaranteed plugin FPS on the user's GPU.
- Final independent diff review found no confirmed high-risk remainder; it also
  checked 35 viewport/scale combinations, zero-size recovery and GPU fence transitions.
- Independent geometry tests compare the upstream radius formula. Real Chromium
  animation tests sample the full tour and check nonblank presentation after RAF
  and resize invalidation. Twelve successive presented screenshots remain identical
  without drawing or clearing the bitmap. These checks do not prove universal
  smoothness in Electron. The upstream tour intentionally resets every 42 seconds.

## Remaining acceptance work

- Test the packaged plugin in a disposable Obsidian vault with the user's actual Electron/GPU configuration. Record renderer name and startup phase timings if a freeze persists.
- Verify real reading/editor panes, scroll offsets, multiple panes and themes with opt-in capture. The capture may intentionally refuse a large workspace.
- Confirm appearance and responsiveness on hardware WebGL. Software-test correctness does not establish a hardware FPS guarantee.
- Shader compilation without `KHR_parallel_shader_compile` may still block in the driver status query. A JavaScript timeout cannot preempt the driver.
