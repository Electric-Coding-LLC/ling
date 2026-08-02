import { LingWordmark } from "../brand";
import { MapIcon } from "../map-icon";
import { WelcomeGuide } from "./welcome-guide";
import { WelcomeMapLink } from "./welcome-map-link";

export const dynamic = "force-static";

export default function WelcomePage() {
  return (
    <main className="shell welcome-shell">
      <header className="topbar welcome-topbar">
        <LingWordmark className="wordmark" />
        <WelcomeMapLink
          aria-label="Dismiss the Welcome to Ling guide and return to the map"
          className="topbar-map-link"
          title="Map"
        >
          <MapIcon />
        </WelcomeMapLink>
      </header>
      <WelcomeGuide />
    </main>
  );
}
