import Link from "next/link";
import { LingWordmark } from "./brand";
import { NetworkMap, type MobileFocus } from "./network-map";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  const { focus } = await searchParams;
  const initialMobileFocus: MobileFocus | undefined =
    focus === "mora-timing" ? "mora" : focus === "vowels" ? "vowels" : undefined;

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
        <NetworkMap initialMobileFocus={initialMobileFocus} />
      </section>
    </main>
  );
}
