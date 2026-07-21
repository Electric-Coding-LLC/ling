import { LingWordmark } from "./brand";

export function LoadingScreen({
  boot = false,
  overlay = false,
  station,
}: {
  boot?: boolean;
  overlay?: boolean;
  station?: string;
}) {
  const className = [
    "loading-shell",
    overlay ? "loading-shell-overlay" : "",
    boot ? "loading-shell-boot" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      aria-busy="true"
      className={className}
      data-station={station?.toLowerCase().replaceAll(" ", "-")}
    >
      <div aria-live="polite" className="loading-lockup" role="status">
        <LingWordmark className="loading-wordmark" />
        <p className="loading-kicker">{station ? "Entering station" : "Loading"}</p>
        {station ? <p className="loading-title">{station}</p> : null}
        <span aria-hidden="true" className="loading-track" />
      </div>
    </div>
  );
}
