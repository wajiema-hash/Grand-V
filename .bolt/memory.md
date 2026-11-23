# Project memory

## Product intent & audience

- **Grand-V**: browser-based GTA V launcher/front-end project.
- Repo serves as a web launcher page; the actual game engine and assets are external, supplied by a Rust desktop back-end host app (`LauncherApp/rust`).
- Audience: players wanting browser-based GTA V access; the web page acts as a launch surface, not the game itself.

## Brand personality & voice

- Gaming-oriented, direct, and honest about technical limitations.
- Practical tone: device checks, capability flags, and launch states presented plainly.

## Visual design & UX direction

- Root web page centers on Grand-V logo and a launcher flow.
- Core UI components: mode selection (Story Mode / Sandbox), graphics settings panel, device-capability checker, Play button with launch/progress state.
- Graphics settings include resolution, frame-rate limit (24/30/60/120 FPS), and low-memory mode toggle.
- Device checker auto-detects WebGPU, WebGL 2, and related browser features; flags missing capabilities.
- Story Mode and Sandbox maintain separate save profiles.
- TypeScript + CSS imports in use; CSS module declarations added to satisfy build.

## Decisions, constraints & rationale

- Scaffolded a working web launcher at project root because Bolt preview expects a servable web page there; previously only a leftover `package-lock.json` existed with no `package.json`, causing `npm install` failures.
- Full GTA V gameplay cannot run from this repo alone — game assets are external and delivered by the desktop back-end host app described in the README.
- Build verified clean after adding TypeScript and CSS declaration support.

## Open questions & assumptions

- Connection mechanism between this web launcher front-end and the Rust desktop back-end / game engine is not yet implemented or documented here.
- Source and packaging of the external game assets referenced by the README are unknown.
- Whether the launcher should communicate with the local Rust host at runtime (e.g., via local API/socket) is unresolved.