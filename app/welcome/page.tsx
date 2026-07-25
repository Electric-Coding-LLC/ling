import { LingWordmark } from "../brand";
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
          className="welcome-back-link"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="M13 8H3m4-4L3 8l4 4" />
          </svg>
          Back to map
        </WelcomeMapLink>
      </header>
      <WelcomeGuide />
    </main>
  );
}
