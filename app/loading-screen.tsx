import { LingMark } from "./brand";

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
        <LingMark className="loading-brand-mark" />
        <p className="loading-kicker">{station ? "Opening station" : "Opening"}</p>
        <p className="loading-title">{station ?? "Ling"}</p>
        <span aria-hidden="true" className="loading-track" />
      </div>
    </div>
  );
}
