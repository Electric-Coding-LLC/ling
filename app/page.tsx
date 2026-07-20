import Link from "next/link";
import { LingWordmark } from "./brand";
import { NetworkMap } from "./network-map";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <Link aria-label="Ling home" className="brand-link" href="/">
          <LingWordmark className="wordmark" />
        </Link>
      </header>
      <section className="network-home" aria-labelledby="network-title">
        <h1 className="sr-only" id="network-title">
          Japanese mastery network
        </h1>
        <NetworkMap />
      </section>
    </main>
  );
}
