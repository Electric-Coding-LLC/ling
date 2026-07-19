import Link from "next/link";
import { LingWordmark } from "./brand";
import { NetworkMap, type StationFocus } from "./network-map";
import { isStationAvailableToCurrentUser } from "./station-availability";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  const { focus } = await searchParams;
  const initialStationFocus: StationFocus | undefined =
    focus === "katakana"
      ? "katakana"
      : focus === "mora-timing"
      ? "mora"
      : focus === "hiragana" || focus === "vowels"
        ? "hiragana"
        : undefined;
  const [katakanaAvailable, moraTimingAvailable] = await Promise.all([
    isStationAvailableToCurrentUser("katakana"),
    isStationAvailableToCurrentUser("mora-timing"),
  ]);

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
        <NetworkMap
          initialStationFocus={initialStationFocus}
          katakanaAvailable={katakanaAvailable}
          moraTimingAvailable={moraTimingAvailable}
        />
      </section>
    </main>
  );
}
