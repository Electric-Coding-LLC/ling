import { LingMark } from "./brand";

export default function Loading() {
  return (
    <main aria-busy="true" className="loading-shell">
      <div aria-live="polite" className="loading-lockup" role="status">
        <div className="loading-brand" aria-label="Ling">
          <LingMark className="loading-brand-mark" />
          <span>Ling</span>
        </div>
        <svg aria-hidden="true" className="loading-network" viewBox="0 0 180 72">
          <path className="loading-network-sound" d="M90 24h70" />
          <circle className="loading-network-terminal" cx="160" cy="24" r="6" />
          <g className="loading-network-pulse">
            <circle className="loading-network-station-outer" cx="90" cy="24" r="6" />
            <circle className="loading-network-station-inner" cx="90" cy="24" r="3" />
          </g>
        </svg>
        <p>Opening your network…</p>
      </div>
    </main>
  );
}
