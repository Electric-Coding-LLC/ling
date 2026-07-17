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
          <path className="loading-network-sound" d="M8 24h164" />
          <path className="loading-network-script" d="M90 24v40" />
          <circle className="loading-network-terminal" cx="160" cy="24" r="6" />
          <g className="loading-network-pulse">
            <circle className="loading-network-interchange-outer" cx="90" cy="24" r="11" />
            <circle className="loading-network-interchange-inner" cx="90" cy="24" r="5" />
          </g>
        </svg>
        <p>Opening your network…</p>
      </div>
    </main>
  );
}
