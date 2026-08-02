import { MapIcon } from "../map-icon";
import { NetworkStationSymbol } from "../network-visuals";

export function WelcomeGuide() {
  return (
    <section aria-labelledby="welcome-title" className="welcome-guide">
      <header className="welcome-heading">
        <h1 id="welcome-title" lang="ja">ようこそ</h1>
        <p className="welcome-heading-translation">Welcome</p>
      </header>

      <div className="welcome-intro">
        <p>
          Think of Ling as a map of Japanese. The stations cover things like
          sounds, writing, vocabulary, and everyday situations, and the lines
          show how those ideas connect.
        </p>
        <p>
          You don&apos;t have to follow a set route. Start wherever you&apos;re curious,
          spend as much time there as you need, and move on when you&apos;re ready.
        </p>
      </div>

      <h2 id="welcome-cues-title">A few things to know</h2>
      <ul aria-labelledby="welcome-cues-title" className="welcome-cues">
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <span className="welcome-cue-map">
              <MapIcon />
            </span>
          </span>
          <span>
            <strong>Map</strong>
            The map is the whole course. Lines group things that belong
            together, and the Map button brings you back to where you were.
          </span>
        </li>
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <svg className="welcome-cue-station" viewBox="-18 -18 36 36">
              <NetworkStationSymbol kind="sound" />
            </svg>
          </span>
          <span>
            <strong>Stations</strong>
            Open any station that interests you. Nothing is locked, and
            there&apos;s no required order.
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
            The ring shows how many cards are left in a check. It&apos;s a reminder,
            not a score.
          </span>
        </li>
        <li>
          <span aria-hidden="true" className="welcome-cue-visual">
            <span className="welcome-cue-review">
              <span className="welcome-cue-review-card">
                <span className="welcome-cue-review-kana" lang="ja">あ</span>
              </span>
              <span className="welcome-cue-review-actions">
                <span className="welcome-cue-review-no">
                  <svg viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </span>
                <span className="welcome-cue-review-yes">
                  <svg viewBox="0 0 16 16">
                    <path d="m3 8.5 3 3 7-7" />
                  </svg>
                </span>
              </span>
            </span>
          </span>
          <span>
            <strong>Flashcards &amp; checks</strong>
            Listen first, reveal the example, then choose Not Yet or Good. Use
            Not Yet whenever you want another pass.
          </span>
        </li>
      </ul>
    </section>
  );
}
