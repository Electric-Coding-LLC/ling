import { LingMark } from "./brand";

export function LoadingScreen({
  overlay = false,
  station,
}: {
  overlay?: boolean;
  station?: string;
}) {
  return (
    <div
      aria-busy="true"
      className={`loading-shell${overlay ? " loading-shell-overlay" : ""}`}
      data-station={station?.toLowerCase().replaceAll(" ", "-")}
    >
      <div aria-live="polite" className="loading-lockup" role="status">
        <LingMark className="loading-brand-mark" />
        <p className="loading-kicker">{station ? "Opening station" : "Opening"}</p>
        <p className="loading-title">{station ?? "Ling"}</p>
        <span aria-hidden="true" className="loading-track" />
      </div>
    </div>
  );
}
