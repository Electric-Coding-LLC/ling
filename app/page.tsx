import { LingWordmark } from "./brand";

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <LingWordmark className="wordmark" />
      </header>
      <section className="canvas" aria-label="Ling">
        <h1>
          <LingWordmark className="hero-wordmark" />
        </h1>
      </section>
    </main>
  );
}
