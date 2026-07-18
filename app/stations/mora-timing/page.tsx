import { StationTopbar } from "../station-topbar";

export default function MoraTimingPage() {
  return (
    <main className="shell station-shell">
      <StationTopbar current="Mora timing" mapPosition="mora-timing" />
      <div className="station-page">
        <header className="station-heading">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-sound" data-line="sound">
              Sound
            </span>
          </div>
          <h1>Mora timing</h1>
        </header>
        <section aria-labelledby="mora-preview-title" className="station-preview">
          <h2 id="mora-preview-title">Mapped for later</h2>
          <p>This station is mapped, but its lesson has not been built yet.</p>
        </section>
      </div>
    </main>
  );
}
