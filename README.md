# Obsidian Black Hole

A **gravitational lensing black hole** that floats inside your Obsidian workspace. It
wraps the [ghostty-blackhole](https://github.com/s0xDk/ghostty-blackhole) shader —
Schwarzschild geodesic ray tracing with accretion disk, photon ring, and relativistic
Doppler beaming — as a WebGL2 overlay for Obsidian.

![demo](https://github.com/s0xDk/ghostty-blackhole/raw/main/demo.gif)

> Demo GIF from the original Ghostty project, not a recording of this plugin.
> This plugin adapts its shader; quality, transparency and optional workspace capture differ.

> Refactor status and verified boundaries: [REVIEW.md](REVIEW.md). Hardware WebGL is required; software rendering is safely refused by the plugin. Workspace capture is opt-in and may be disabled automatically on expensive workspaces.

## What it does

The black hole renders on a **transparent WebGL2 canvas** cropped around the
effect, positioned within your Obsidian window — your notes and UI stay fully visible and clickable, and
the hole floats on top, free to drift anywhere. The canvas is opaque only where
the hole actually is; everywhere else it's transparent. Every pixel near the
hole integrates its own null geodesic through the Schwarzschild metric on the
GPU.

- **Shadow** — rays with impact parameter under `b_crit` spiral through the
  horizon and return black. Text near the edge is stretched into the photon ring
  before it disappears.
- **Gravitational lensing** — escaped rays are projected back onto the workspace
  "sky" plane: your notes bend, magnify, and mirror inside the Einstein ring.
- **Accretion disk** — a thin Keplerian disk with blackbody colour from a
  Shakura–Sunyaev temperature profile, shifted and beamed by the relativistic
  factor. The far side arcs over and under the shadow (the _Interstellar_ look).
- **Photon ring** — emergent from rays winding near the `1.5 r_s` photon sphere.
- **Lensed starfield** — faint procedural stars sampled with the bent ray
  direction, so they smear into arcs around the hole.
- **Gravitational time dilation** — the disk's inner orbits visibly freeze as
  the hole grows heavier.

## Default animation and reset

Fresh installs use the upstream 42-second **Demo** tour, so the effect works
without note text or a Claude token signal. The Inferno look and size formula
follow [ghostty-blackhole at b49fa0a](https://github.com/s0xDk/ghostty-blackhole/blob/b49fa0ab2eaf0644a690f4cb386d70c21eb9f969/blackhole.glsl):
hole radius 0.02, disk outer radius 8, token area range 0.01–0.5, with no extra
size attenuation. The upstream default mode itself is Token; this plugin chooses
its self-running Demo for the requested out-of-box animation. The tour intentionally
returns to a small seed every 42 seconds, as upstream does.

Settings → Black Hole → **Restore defaults** restores the animation and performance
parameters, keeps language and the on/off switch, and turns workspace capture off.
Old untouched tiny defaults are migrated; customized settings are preserved—use
Restore defaults to switch those to the new showcase.

The overlay is an adaptation, not pixel-identical to Ghostty: it uses transparent
composition, optional approximate DOM capture, a pixel budget and 64 rather than
48 integration steps. Normal compositor presentation, deferred resize and stable crop dimensions
avoid blank presentations between draws. Hardware FPS still depends on the GPU.

## Size modes

What drives the hole's growth is selected in settings:

| Mode             | Behaviour                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pomodoro** (0) | Wall-clock 55/5 work/break cycle. Grows through your work hour, shrinks at break time. Includes a typing detector — stop using the keyboard and the hole fades away.                    |
| **Token** (1)    | Driven by a metric in your vault. Choose from: current note word count, vault-wide word count estimate, file count, or open tab count. The hole grows as your writing / vault fills up. |
| **Demo** (2)     | Self-running 42 s showcase loop that tours 8 visual presets (Inferno → Gargantua → M87\* donut → Face-on ember → Quasar → Blazar → Pure lens → Inferno).                                |

## Install

### From source

```sh
git clone https://github.com/VKKKV/obsidian-blackhole.git
cd obsidian-blackhole
npm install
npm run build
```

Then copy `main.js`, `manifest.json`, and `styles.css` to your vault's
`.obsidian/plugins/obsidian-blackhole/` directory.

### From BRAT

If you use the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, add
`VKKKV/obsidian-blackhole` as a beta plugin.

## Settings

Open Obsidian Settings → Community Plugins → Black Hole. The settings tab gives
you control over every shader tunable:

- **Mode**: Pomodoro / Token / Demo
- **Token metric**: what drives the hole in token mode
- **Hole & lensing**: size, lens depth, starfield brightness
- **Accretion disk**: inner/outer radius, inclination, temperature, opacity,
  Doppler mix, beaming, streak pattern, speed, winding
- **Pomodoro**: work period, break length, idle fade time
- **Performance**: geodesic integration steps (N_STEPS), render scale (lower =
  faster on weak/software GPUs; also auto-drops if the frame rate stays low),
  capture on/off, and capture interval

## How it works

The plugin mounts a dynamically cropped `<canvas>` overlay with `pointer-events: none`,
so it never intercepts clicks. A **WebGL2** render loop targets 60 FPS on a cropped effect canvas, executing the same GLSL shader used by the original Ghostty version —
except the final output uses straight alpha, so the canvas is transparent away
from the hole and your live notes show through:

| Ghostty                                    | Obsidian                                                      |
| ------------------------------------------ | ------------------------------------------------------------- |
| `iChannel0` (terminal pixels)              | `uTexture` (your workspace, captured via `dom-to-image-more`) |
| Token level, activity and wall-clock state | CPU effect state → `uEffect` center/radius/intensity          |
| `SIZE_MODE` compile-time define            | `uSizeMode` runtime uniform                                   |

Ghostty samples the terminal as a free GPU texture; Obsidian's notes are DOM,
which WebGL can't sample directly. Optional `dom-to-image-more` snapshots run
on the main thread; decoupling their cadence does not make DOM cloning nonblocking.
Snapshots are requested on content/layout/scroll changes, with a cooldown measured
from completion and bounded-DOM preflight. Slow or failed capture falls back to
black-hole/disk/starfield rendering without a workspace texture. Capture filters
media and resource styles, so it is an approximate text/layout snapshot.

The plugin rejects software WebGL before compiling the effect. On hardware it
uses 64 integration steps by default and a cropped canvas with a maximum
262,144 backing pixels. The requested render scale defaults to 0.75; the pixel
budget reduces actual resolution on large windows without shrinking the effect.
GPU fences prevent queued frames from accumulating. Reducing integration to 6–10 steps is not a supported performance
mode: it prevents representative rays from reaching the black hole.

## Development

```sh
npm install
npm run dev      # esbuild watch → rebuilds main.js on save (pair with the Hot Reload plugin)
npm run harness  # standalone shader playground at http://localhost:8000 — no Obsidian needed
npm run check    # TypeScript + deterministic regression tests
npm run build -- --outdir=/tmp/blackhole-release  # build without deploying
npm run build    # production build to root main.js; may trigger Hot Reload
```

The **harness** renders the shader over mock "notes" in a plain browser page
with live param sliders, so you can iterate on the shader (the bulk of the
work) without launching Obsidian. The playground explicitly permits software WebGL for
testing, unlike the plugin. Its procedural texture is not a screenshot of the DOM.
Optional real-WebGL tests: `python tests/webgl_smoke.py` and
`python tests/animation_smoke.py` (Python Playwright and Pillow required). The animation test
saves sampled screenshots and compositor-retention checks under `/tmp/blackhole-animation-artifacts`.

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).

The shader physics is adapted from
[ghostty-blackhole](https://github.com/s0xDk/ghostty-blackhole) by
[s0xDk](https://github.com/s0xDk), which was in turn inspired by
[Eric Bruneton's black hole shader](https://ebruneton.github.io/black_hole_shader/)
(BSD-3-Clause). No code from Bruneton's project is used here — this shader is an
independent screen-space approximation written from scratch.

Shader source: `src/shader.ts` → `makeFS()` generates the complete GLSL with all
tunable consts baked in.
