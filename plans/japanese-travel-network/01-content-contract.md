# Freeze the purpose, focused copy, phrase inventory, rōmaji boundary, source notes, and bundled-audio manifest for all eight stations.

[Back to Execution Map](./EXECMAP.md)

## Goal

Freeze an accurate, purpose-complete content and audio set that gives each new station one clear job before UI implementation starts.

## Tasks

- Define `Japanese` as a compact network orientation built around `日本語`: introduce Ling as an open-ended map, explain lines/stations/revisiting in plain language, and avoid turning the page into a product tutorial.
- Define `Visit` as a compact practical orientation built around `日本`: explain what the Japan line is for and briefly frame the mixed writing and listening environment a visitor encounters without becoming a culture or tourism article.
- Define `Rōmaji` as a chart-based learning station that mirrors the organization and hidden-answer review of Hiragana and Katakana, uses no dot-separated sound strings, and teaches the few whole-word rules required by later Japan-line phrases.
- Freeze one coherent interaction or compact reference set for each practical station:
  - `Introductions`: independently useful first-meeting phrases for giving a name and origin and asking whether someone speaks Japanese or English.
  - `Navigation`: the smallest useful set for finding places and using trains, buses, or taxis.
  - `Food`: the smallest useful set for ordering, asking, and paying.
  - `Shopping`: the smallest useful set for price, selection, quantity or size, and payment.
  - `Help`: urgent assistance, illness, emergency services, and critical lost-item or language support.
- For every entry, record the exact Japanese text, concise English meaning, any essential one-line usage distinction, audio transcript, stable asset filename, and source/provenance note.
- Source-check naturalness and usage before generating audio; avoid mechanically translating English phrases that do not map cleanly to Japanese.
- Author bundled synthetic speech at its natural speed and define a focused verifier for file presence, decodability, duration bounds, and manifest agreement.
- Apply the rōmaji boundary consistently: `Visit` uses short English sound cues
  with its three starter expressions because Rōmaji has not yet been
  introduced; `Rōmaji` teaches the notation; every later Japan-line phrase may
  use compact rōmaji. Do not use IPA or English pronunciation respellings
  outside this Visit exception.

## Constraints

- Keep the station names and line name to the agreed one-word labels.
- Give `Japanese` and `Visit` no review deck, completion state, or knowledge endpoint.
- Give `Rōmaji` the same per-entry flashcard, completion, reset, and private knowledge behavior as the Kana chart stations. Give the five practical phrase stations shuffled flashcard tests without saved progress.
- Let the complete interaction determine the entry count; do not pad or cut a station merely to hit a number.
- Do not add vocabulary scheduling, grammar progression, speech recording, pronunciation scoring, cultural trivia, or optional display settings.
- Do not generate audio until the exact Japanese transcripts and meanings are frozen.

## Exit Criteria

- A reviewed manifest defines every initial station entry, exact visible text, audio transcript and filename, meaning, essential usage note, and provenance.
- Each station has one concise purpose, the five practical inventories are purpose-complete without padding, and there are no placeholder or speculative items.
- Ambiguous English glosses are corrected with minimal usage context rather than expanded into lessons.
- The romaji treatment is explicit enough that implementation does not need to invent a per-page policy.
- Every audio asset can be generated and mechanically verified directly from the frozen manifest.

## Frozen station purposes

| Station | Purpose |
| --- | --- |
| `Japanese` | Introduce `日本語`, Ling, and the network as an open map of lines and stations that can be revisited in any useful order. |
| `Visit` | Introduce `日本` and the Japan line as an always-available reference for a visitor using Japanese in everyday situations. |
| `Rōmaji` | Teach the standard Roman-letter spellings needed to read every later Japan-line phrase. |
| `Introductions` | Present independently useful first-meeting phrases: introduce yourself, say where you are from, and ask which languages someone speaks. |
| `Navigation` | Help a visitor find a station, confirm a vehicle or platform, locate themselves, and show a destination. |
| `Food` | Help a visitor point, ask, order water, check a basic ingredient, and request the bill. |
| `Shopping` | Help a visitor ask about price, choose an item, ask about color or size, try clothing, and confirm card payment. |
| `Help` | Help a visitor request urgent assistance, describe illness or pain, reach emergency services, and handle a lost passport or language barrier. |

`Japanese` and `Visit` each have one playable title word rather than a phrase
deck. `Rōmaji` has complete basic and combined sound charts, hidden-answer
flashcards, private per-entry knowledge, and five compact conventions.
`Introductions`, `Food`, `Shopping`, and `Help` each have eight independently
playable reference cards; `Navigation` has six. All five practical stations
include shuffled flashcard tests without saved results. The Japan-line stations
remain independently accessible; only Rōmaji tracks learning progress.

## Frozen content and audio manifest

### Japanese

| Japanese | English | Audio | Provenance |
| --- | --- | --- | --- |
| `日本語` | Japanese | `/audio/ja-travel-nihongo.wav` | Authored title word; standard dictionary form. |

Intro copy: “Ling maps Japanese as a network. Lines connect related parts of
the language, and stations are places to listen, learn, and revisit. Start
wherever is useful; the map can grow with you.”

### Visit

| Japanese | English | Audio | Provenance |
| --- | --- | --- | --- |
| `日本` | Japan | `/audio/ja-travel-nihon.wav` | Authored title word; standard dictionary form. |

Intro copy: “The Japan line is a small, always-available reference for using
Japanese in Japan. You will meet kanji, kana, and romaji in the world around
you; Ling keeps Japanese writing and listening primary while giving you the
English meaning you need.”

### Rōmaji

The station uses the same five-column `ah`, `ee`, `oo`, `eh`, `oh` sound
headings as Hiragana and Katakana. Its 46 basic entries use the current official
Hepburn-based spellings, including `shi`, `chi`, `tsu`, `fu`, `o` for `を`, and
`n` for `ん`. A second chart adds all 33 combined readings from `kya` through
`pyo`. Each chart cell shows only its Rōmaji prompt and opens the shared
hidden-answer flashcard; reveal plays the corresponding bundled Kana sound and
shows its short English sound cue. Good/Not Yet answers persist privately and
update the station progress ring.

Five rows below the charts cover doubled consonants, long vowels, apostrophes
that separate `n` or adjacent vowels, and the spoken spellings of three
particles. The station introduces no visible Kana; examples use separate cells.

### Introductions

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `はじめまして、クリスです` | Nice to meet you. I’m Chris. | One complete opening, translated at the utterance level. | `/audio/ja-travel-hajimemashite-kurisu-desu.wav` | Japan Foundation Irodori Starter L3 self-introduction model. |
| `よろしくお願いします` | It’s a pleasure to meet you. | — | `/audio/ja-travel-yoroshiku-onegaishimasu.wav` | Japan Foundation Irodori Starter L3 self-introduction model. |
| `ご出身は？` | Where are you from? | A natural first-meeting follow-up about country or hometown. | `/audio/ja-travel-goshusshin-wa.wav` | Japan Foundation Irodori Starter L3. |
| `アメリカから来ました` | I’m from the United States. | Answer with your country or hometown. | `/audio/ja-travel-amerika-kara-kimashita.wav` | Japan Foundation Irodori Starter L3 self-introduction model. |
| `日本語、できますか？` | Do you speak Japanese? | — | `/audio/ja-travel-nihongo-dekimasu-ka.wav` | Japan Foundation Irodori Starter L2. |
| `はい、少しできます` | Yes, a little. | — | `/audio/ja-travel-hai-sukoshi-dekimasu.wav` | Japan Foundation Irodori Starter L2. |
| `英語、できますか？` | Do you speak English? | — | `/audio/ja-travel-eigo-dekimasu-ka.wav` | Japan Foundation Irodori Starter L2 language-practice pattern. |
| `はい、できます` | Yes, I do. | — | `/audio/ja-travel-hai-dekimasu.wav` | Japan Foundation Irodori Starter L2. |

The station begins directly with the phrases. It adds no visible scene-setting
or playback instruction above the cards.

### Navigation

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `トイレはどこですか？` | Where is the restroom? | — | `/audio/ja-travel-toire-wa-doko-desu-ka.wav` | JNTO Japanese language basics. |
| `何番線ですか？` | Which platform? | — | `/audio/ja-travel-nanban-sen-desu-ka.wav` | Japan Foundation Irodori Starter L13. |
| `ここまでお願いします` | To here, please | Show a map or address to a taxi driver. | `/audio/ja-travel-koko-made-onegaishimasu.wav` | Standard taxi request assembled from the Irodori destination and request patterns. |
| `この電車で合っていますか？` | Is this the right train? | — | `/audio/ja-travel-kono-densha-de-atteimasu-ka.wav` | Japan Foundation Irodori transport confirmation pattern. |
| `どこで乗り換えますか？` | Where do I transfer? | — | `/audio/ja-travel-doko-de-norikaemasu-ka.wav` | Japan Foundation Irodori transport transfer pattern. |
| `何番出口ですか？` | Which exit? | — | `/audio/ja-travel-nanban-deguchi-desu-ka.wav` | Japan Foundation Irodori station exit pattern. |

### Food

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `二人です` | There are two of us. | — | `/audio/ja-travel-futari-desu.wav` | Japan Foundation Irodori Elementary 2 L3 restaurant entry dialog. |
| `予約しています` | I have a reservation. | — | `/audio/ja-travel-yoyaku-shiteimasu.wav` | Japan Foundation Irodori Elementary 2 L3 restaurant entry dialog. |
| `おすすめは何ですか？` | What do you recommend? | — | `/audio/ja-travel-osusume-wa-nan-desu-ka.wav` | Japan Foundation Irodori restaurant recommendation material. |
| `これをお願いします` | This, please | Point to the item while asking. | `/audio/ja-travel-kore-o-onegaishimasu.wav` | Japan Foundation Irodori request patterns. |
| `お水をお願いします` | Water, please | — | `/audio/ja-travel-omizu-o-onegaishimasu.wav` | JNTO Tourist’s Language Handbook restaurant requests. |
| `卵は入っていますか？` | Does this contain egg? | Replace egg with the ingredient you need to check. | `/audio/ja-travel-tamago-wa-haitteimasu-ka.wav` | Japan Foundation Irodori ingredient-check pattern. |
| `お会計、お願いします` | The bill, please | — | `/audio/ja-travel-okaikei-onegaishimasu.wav` | Japan Foundation Irodori restaurant word list. |
| `ごちそうさまでした` | Thank you for the meal. | — | `/audio/ja-travel-gochisousama-deshita.wav` | JNTO Japanese dining etiquette guidance. |

### Shopping

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `これ、いくらですか？` | How much is this? | — | `/audio/ja-travel-kore-ikura-desu-ka.wav` | Japan Foundation Irodori Starter L16; JNTO price pattern. |
| `これをください` | This, please | Use when choosing an item to buy. | `/audio/ja-travel-kore-o-kudasai.wav` | Japan Foundation Irodori Starter purchasing pattern. |
| `ほかの色、ありますか？` | Do you have another color? | — | `/audio/ja-travel-hoka-no-iro-arimasu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `ほかのサイズ、ありますか？` | Do you have another size? | — | `/audio/ja-travel-hoka-no-saizu-arimasu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `試着してもいいですか？` | May I try it on? | For clothing. | `/audio/ja-travel-shichaku-shite-mo-ii-desu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `カードは使えますか？` | Can I use a card? | — | `/audio/ja-travel-kaado-wa-tsukaemasu-ka.wav` | Standard payment question; checked against Irodori payment contexts. |
| `免税できますか？` | Can I buy this tax-free? | — | `/audio/ja-travel-menzei-dekimasu-ka.wav` | JNTO tax-free shopping guidance. |
| `袋をお願いします` | A bag, please | — | `/audio/ja-travel-fukuro-o-onegaishimasu.wav` | Japan Foundation Irodori shopping request pattern. |

### Help

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `助けてください` | Please help me. | — | `/audio/ja-travel-tasukete-kudasai.wav` | Japan Foundation Irodori emergency assistance patterns. |
| `気分が悪いです` | I feel sick. | — | `/audio/ja-travel-kibun-ga-warui-desu.wav` | JNTO medical assistance guidance. |
| `ここが痛いです` | It hurts here. | Point to where it hurts. | `/audio/ja-travel-koko-ga-itai-desu.wav` | Japan Tourism Agency medical communication guide. |
| `救急車を呼んでください` | Please call an ambulance. | — | `/audio/ja-travel-kyuukyuusha-o-yonde-kudasai.wav` | Japan Foundation Irodori Pre-Intermediate L12. |
| `警察を呼んでください` | Please call the police. | — | `/audio/ja-travel-keisatsu-o-yonde-kudasai.wav` | Japan Foundation Irodori Pre-Intermediate L12. |
| `病院はどこですか？` | Where is the hospital? | — | `/audio/ja-travel-byouin-wa-doko-desu-ka.wav` | JNTO medical assistance guidance. |
| `パスポートをなくしました` | I lost my passport. | — | `/audio/ja-travel-pasupooto-o-nakushimashita.wav` | JNTO lost passport guidance. |
| `英語を話せる人はいますか？` | Is there someone who speaks English? | — | `/audio/ja-travel-eigo-o-hanaseru-hito-wa-imasu-ka.wav` | Japan Foundation Irodori language assistance pattern. |

## Source boundary

The implementation may cite or link to these official references but does not
copy their audio:

- [JNTO Japanese language basics](https://www.japan.travel/en/plan/japanese-language/)
- [JNTO Japanese manners](https://www.japan.travel/en/guide/japanese-manners-dos-and-donts/)
- [Japan Foundation Irodori Starter](https://www.irodori.jpf.go.jp/en/starter/pdf.html)
- [Japan Foundation Irodori Elementary 2 Lesson 11](https://www.irodori.jpf.go.jp/assets/data/elementary02/pdf/Z_L11.pdf)
- [Japan Agency for Cultural Affairs, Rōmaji orthography](https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/pdf/94303201_01.pdf)

All files are locally authored synthetic speech using the frozen transcript
verbatim. The Rōmaji chart reuses the corresponding Kana sound assets. Visit’s
three starter expressions use short English sound cues. Japan-line phrase rows
after the Rōmaji station use concise, source-checked rōmaji and never use IPA or
English pronunciation respellings.
