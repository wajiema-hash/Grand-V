import { useCallback, useEffect, useState } from "react";

type LaunchStatus = "idle" | "launching" | "ready";

interface GpuCheck {
  label: string;
  detail: string;
  state: "pass" | "fail" | "unknown";
}

const checkGpu = async (): Promise<GpuCheck[]> => {
  const checks: GpuCheck[] = [];
  const nav = navigator as Navigator & { gpu?: unknown };

  checks.push({
    label: "WebAssembly",
    detail: typeof WebAssembly !== "undefined" ? "Supported" : "Missing",
    state: typeof WebAssembly !== "undefined" ? "pass" : "fail",
  });

  if (nav.gpu) {
    try {
      const adapter = await (
        nav.gpu as {
          requestAdapter: () => Promise<unknown>;
        }
      ).requestAdapter();
      checks.push({
        label: "WebGPU",
        detail: adapter ? "Hardware adapter found" : "No adapter available",
        state: adapter ? "pass" : "fail",
      });
    } catch {
      checks.push({
        label: "WebGPU",
        detail: "Adapter request failed",
        state: "fail",
      });
    }
  } else {
    checks.push({
      label: "WebGPU",
      detail: "Not available — use up-to-date Chrome or Edge",
      state: "fail",
    });
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
  checks.push({
    label: "WebGL 2",
    detail: gl ? "Supported" : "Missing",
    state: gl ? "pass" : "fail",
  });
  gl?.getExtension("WEBGL_lose_context")?.loseContext();

  checks.push({
    label: "SharedArrayBuffer",
    detail:
      typeof SharedArrayBuffer !== "undefined"
        ? "Available"
        : "Requires secure context (HTTPS or localhost)",
    state: typeof SharedArrayBuffer !== "undefined" ? "pass" : "fail",
  });

  return checks;
};

export default function App() {
  const [mode, setMode] = useState<"story" | "sandbox">("story");
  const [resolution, setResolution] = useState("1280x720");
  const [fpsLimit, setFpsLimit] = useState("60");
  const [lowMemory, setLowMemory] = useState(false);
  const [checks, setChecks] = useState<GpuCheck[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<LaunchStatus>("idle");

  const runChecks = useCallback(async () => {
    setChecking(true);
    const results = await checkGpu();
    setChecks(results);
    setChecking(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  const handlePlay = () => {
    setStatus("launching");
    window.setTimeout(() => setStatus("ready"), 1800);
  };

  const blockingFail = checks?.some((c) => c.state === "fail") ?? false;

  return (
    <div className="app">
      <header className="brand">
        <img src="/grand-logo-v2.png" alt="Grand-V logo" />
        <div>
          <h1>Grand-V</h1>
          <p>Browser-based GTA V launcher — Story and Sandbox modes</p>
        </div>
      </header>

      <section className="card">
        <h2>Choose a mode</h2>
        <div className="mode-grid">
          <button
            type="button"
            className={`mode-btn ${mode === "story" ? "selected" : ""}`}
            onClick={() => setMode("story")}
          >
            <h3>Story Mode</h3>
            <p>Play through the campaign with a separate save profile.</p>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "sandbox" ? "selected" : ""}`}
            onClick={() => setMode("sandbox")}
          >
            <h3>Sandbox</h3>
            <p>Free roam with its own saves, separate from Story.</p>
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Graphics &amp; performance</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="resolution">Resolution</label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              <option value="1280x720">1280 × 720</option>
              <option value="1600x900">1600 × 900</option>
              <option value="1920x1080">1920 × 1080</option>
              <option value="2560x1440">2560 × 1440</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="fps">Frame rate limit</label>
            <select
              id="fps"
              value={fpsLimit}
              onChange={(e) => setFpsLimit(e.target.value)}
            >
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
              <option value="120">120 FPS (experimental)</option>
            </select>
          </div>
        </div>
        <label className="field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={lowMemory}
            onChange={(e) => setLowMemory(e.target.checked)}
            style={{ width: "auto" }}
          />
          <span style={{ fontSize: 14, color: "var(--text)" }}>
            Low memory mode (recommended for 8 GB devices)
          </span>
        </label>
      </section>

      <section className="card">
        <h2>Check this device</h2>
        {checking || checks === null ? (
          <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Checking your device…</p>
        ) : (
          <div className="check-grid">
            {checks.map((c) => (
              <div key={c.label} className={`check-item ${c.state}`}>
                <span className="dot" />
                <span>
                  {c.label}
                  <small>{c.detail}</small>
                </span>
              </div>
            ))}
          </div>
        )}
        {blockingFail && (
          <div className="notice">
            Some browser or graphics features are missing. The game needs an
            up-to-date Chrome or Edge with hardware acceleration enabled.
          </div>
        )}
      </section>

      <section className="card">
        <button
          type="button"
          className="play-btn"
          onClick={handlePlay}
          disabled={status !== "idle"}
        >
          {status === "idle"
            ? `Play ${mode === "story" ? "Story Mode" : "Sandbox"}`
            : "Launching…"}
        </button>
        <p className="fps-note">
          First launch downloads game assets and can take a while. Keep the tab
          open and the device plugged in.
        </p>
        {status === "launching" && (
          <div className="status launching">
            <span className="spinner" />
            Preparing world in {resolution} at {fpsLimit} FPS…
          </div>
        )}
        {status === "ready" && (
          <div className="status">
            Launcher ready. Connect the Grand-V back-end host with your game
            folder to load assets and start playing.
          </div>
        )}
      </section>
    </div>
  );
}
