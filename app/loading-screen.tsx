import { LingWordmark } from "./brand";

export function LoadingScreen({
  boot = false,
  departing = false,
  overlay = false,
  returningToMap = false,
  station,
}: {
  boot?: boolean;
  departing?: boolean;
  overlay?: boolean;
  returningToMap?: boolean;
  station?: string;
}) {
  const className = [
    "loading-shell",
    overlay ? "loading-shell-overlay" : "",
    boot ? "loading-shell-boot" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const kicker = station
    ? "Entering station"
    : returningToMap
      ? "Returning to"
      : "Loading";
  const title = station ?? (returningToMap ? "Map" : null);

  return (
    <div
      aria-busy="true"
      className={className}
      data-departing={departing || undefined}
      data-station={station?.toLowerCase().replaceAll(" ", "-")}
    >
      <div aria-live="polite" className="loading-lockup" role="status">
        <LingWordmark className="loading-wordmark" />
        <p className="loading-kicker">{kicker}</p>
        {title ? <p className="loading-title">{title}</p> : null}
        <span aria-hidden="true" className="loading-track" />
      </div>
    </div>
  );
}
