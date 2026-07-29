import { NetworkGlyph, NetworkStationSymbol } from "../network-visuals";

export function WelcomeGuide() {
  return (
    <section aria-labelledby="welcome-title" className="welcome-guide">
      <header className="welcome-heading">
        <p>Start here</p>
        <h1 id="welcome-title">Welcome to Ling</h1>
      </header>

      <div className="welcome-intro">
        <p>
          Ling is a calm, practical place to build Japanese through sounds,
          words, and useful situations.
        </p>
        <p>
          Inspired by a transit system, Ling shows the entire network from the
          start. Follow the connections in any order that helps you learn.
        </p>
      </div>

      <h2 id="welcome-cues-title">How Ling works</h2>
      <ul aria-labelledby="welcome-cues-title" className="welcome-cues">
        <li>
          <span aria-hidden="true" className="welcome-cue-visual welcome-cue-network">
            <NetworkGlyph position="japanese" />
          </span>
          <span>
            <strong>Network</strong>
            Lines connect related practice. The corner glyph returns to the map
            and shows the current station’s connections.
          </span>
        </li>
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <svg className="welcome-cue-station" viewBox="-36 -36 72 72">
              <NetworkStationSymbol kind="travel-interchange" />
            </svg>
          </span>
          <span>
            <strong>Stations</strong>
            Choose any station to begin. Interchanges connect more than
            one line.
          </span>
        </li>
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <span className="hiragana-test-trigger welcome-cue-progress">
              <span className="hiragana-test-progress-text">4</span>
            </span>
          </span>
          <span>
            <strong>Progress</strong>
            The small ring shows how many cards remain in a station check.
          </span>
        </li>
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <span className="hiragana-test-card welcome-cue-flashcard">
              <span className="hiragana-test-card-kana" lang="ja">あ</span>
            </span>
          </span>
          <span>
            <strong>Flashcards &amp; checks</strong>
            Listen, reveal a useful example, then choose Not Yet or Good. Checks
            stay lightweight: no scores, streaks, or pressure.
          </span>
        </li>
      </ul>
    </section>
  );
}
