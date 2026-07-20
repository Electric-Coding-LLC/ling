import Link from "next/link";
import { LingWordmark } from "./brand";
import { NetworkMap, type StationFocus } from "./network-map";
import { getStationAvailabilityForCurrentUser } from "./station-availability";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  const { focus } = await searchParams;
  const initialStationFocus: StationFocus | undefined =
    focus === "kana" || focus === "vowels"
      ? "kana"
      : focus === "katakana"
      ? "katakana"
      : focus === "mora-timing"
      ? "mora"
      : focus === "hiragana"
        ? "hiragana"
        : undefined;
  const {
    hiragana: hiraganaAvailable,
    katakana: katakanaAvailable,
    "mora-timing": moraTimingAvailable,
  } = await getStationAvailabilityForCurrentUser();

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
          hiraganaAvailable={hiraganaAvailable}
          initialStationFocus={initialStationFocus}
          katakanaAvailable={katakanaAvailable}
          moraTimingAvailable={moraTimingAvailable}
        />
      </section>
    </main>
  );
}
