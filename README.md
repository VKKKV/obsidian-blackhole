# Obsidian Black Hole

A **gravitational lensing black hole** that floats inside your Obsidian workspace. It
wraps the [ghostty-blackhole](https://github.com/s0xDk/ghostty-blackhole) shader —
Schwarzschild geodesic ray tracing with accretion disk, photon ring, and relativistic
Doppler beaming — as a WebGL2 overlay for Obsidian.

![demo](https://github.com/s0xDk/ghostty-blackhole/raw/main/demo.gif)

> Demo GIF from the original Ghostty project. The Obsidian plugin renders the same shader.
> The accretion disk and starfield are identical; the lensed background is your workspace.

## What it does

The black hole renders on a **transparent WebGL2 canvas** stretched over your
whole Obsidian window — your notes and UI stay fully visible and clickable, and
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
  factor. The far side arcs over and under the shadow (the *Interstellar* look).
- **Photon ring** — emergent from rays winding near the `1.5 r_s` photon sphere.
- **Lensed starfield** — faint procedural stars sampled with the bent ray
  direction, so they smear into arcs around the hole.
- **Gravitational time dilation** — the disk's inner orbits visibly freeze as
  the hole grows heavier.

## Size modes

What drives the hole's growth is selected in settings:

| Mode | Behaviour |
|------|-----------|
| **Pomodoro** (0) | Wall-clock 55/5 work/break cycle. Grows through your work hour, shrinks at break time. Includes a typing detector — stop using the keyboard and the hole fades away. |
| **Token** (1) | Driven by a metric in your vault. Choose from: current note word count, vault-wide word count estimate, file count, or open tab count. The hole grows as your writing / vault fills up. |
| **Demo** (2) | Self-running 42 s showcase loop that tours 8 visual presets (Inferno → Gargantua → M87\* donut → Face-on ember → Quasar → Blazar → Pure lens → Inferno). |

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

The plugin mounts a full-window `<canvas>` overlay with `pointer-events: none`,
so it never intercepts clicks. A **WebGL2** render loop runs at display refresh
rate, executing the same GLSL shader used by the original Ghostty version —
except the final output uses straight alpha, so the canvas is transparent away
from the hole and your live notes show through:

| Ghostty | Obsidian |
|---------|----------|
| `iChannel0` (terminal pixels) | `uTexture` (your workspace, captured via `dom-to-image-more`) |
| `iCurrentCursorColor` → token level | `uTokenLevel` uniform (word count / metric ratio) |
| `iTimeCursorChange` | `uLastActivity` (keyboard + mouse events) |
| `iDate` | `uDate` (JavaScript `Date`) |
| `SIZE_MODE` compile-time define | `uSizeMode` runtime uniform |

Ghostty samples the terminal as a free GPU texture; Obsidian's notes are DOM,
which WebGL can't sample directly. So the plugin snapshots the window with
`dom-to-image-more` — but **rendering and capture are decoupled**: the GPU
animates the lens every frame against the *last* snapshot, while the (expensive,
main-thread) capture only runs occasionally and on events (note switch, layout
change, after scrolling settles). That keeps the lensing smooth without the
per-frame screenshot cost. If capture still stutters on your machine, turn it
off in settings — the hole then lenses the starfield only, at zero CPU cost.

## Development

```sh
npm install
npm run dev      # esbuild watch → rebuilds main.js on save (pair with the Hot Reload plugin)
npm run harness  # standalone shader playground at http://localhost:8000 — no Obsidian needed
npm run build    # production build
```

The **harness** renders the shader over mock "notes" in a plain browser page
with live param sliders, so you can iterate on the shader (the bulk of the
work) without launching Obsidian.

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
