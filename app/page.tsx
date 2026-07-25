import Link from "next/link";
import { LingWordmark } from "./brand";
import { FirstVisitWelcome } from "./first-visit-welcome";
import { NetworkMap } from "./network-map";
import { NavigationLink } from "./navigation-feedback";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar network-topbar">
        <Link aria-label="Ling home" className="brand-link" href="/">
          <LingWordmark className="wordmark" />
        </Link>
        <NavigationLink
          aria-label="About Ling"
          className="network-help-link"
          href="/welcome"
          title="About Ling"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.75 9a2.35 2.35 0 0 1 4.5 1c0 1.75-2.25 1.9-2.25 3.5" />
            <circle className="network-help-dot" cx="12" cy="17" r="0.75" />
          </svg>
        </NavigationLink>
      </header>
      <section className="network-home" aria-labelledby="network-title">
        <h1 className="sr-only" id="network-title">
          Japanese mastery network
        </h1>
        <FirstVisitWelcome />
        <NetworkMap />
      </section>
    </main>
  );
}
