# Freeze the purpose, minimal copy, phrase inventory, romaji boundary, source notes, and bundled-audio manifest for all six stations.

[Back to Execution Map](./EXECMAP.md)

## Goal

Freeze the smallest accurate content and audio set that gives each new station one clear job before UI implementation starts.

## Tasks

- Define `Japanese` as a compact network orientation built around `日本語`: introduce Ling as an open-ended map, explain lines/stations/revisiting in plain language, and avoid turning the page into a product tutorial.
- Define `Japan` as a compact practical orientation built around `日本`: explain what the Travel line is for and briefly frame the mixed writing and listening environment a visitor encounters without becoming a culture or tourism article.
- Freeze no more than six entries for each practical station:
  - `Greetings`: common greetings and courtesies, initially including good morning, hello, good evening, please/requesting, thank you, and excuse me/apology.
  - `Navigation`: the smallest useful set for finding places and using trains, buses, or taxis.
  - `Food`: the smallest useful set for ordering, asking, and paying.
  - `Shopping`: the smallest useful set for price, selection, quantity or size, and payment.
- For every entry, record the exact Japanese text, concise English meaning, any essential one-line usage distinction, audio transcript, stable asset filename, and source/provenance note.
- Source-check naturalness and usage before generating audio; avoid mechanically translating English phrases that do not map cleanly to Japanese.
- Author bundled synthetic speech at its natural speed and define a focused verifier for file presence, decodability, duration bounds, and manifest agreement.
- Apply the romaji boundary consistently: Japanese writing and audio remain primary; ordinary phrase rows do not gain pronunciation-subtitle romaji; real-world romaji may appear only when the station is explicitly teaching an encountered sign, place name, or spelling.

## Constraints

- Keep the station names and line name to the agreed one-word labels.
- Give `Japanese` and `Japan` no review deck, completion state, or knowledge endpoint.
- Give each practical station no more than six entries and no review deck in this slice.
- Do not add vocabulary scheduling, grammar progression, speech recording, pronunciation scoring, cultural trivia, or optional display settings.
- Do not generate audio until the exact Japanese transcripts and meanings are frozen.

## Exit Criteria

- A reviewed manifest defines every initial station entry, exact visible text, audio transcript and filename, meaning, essential usage note, and provenance.
- Each station has one concise purpose, the four practical inventories stay at six entries or fewer, and there are no placeholder or speculative items.
- Ambiguous English glosses are corrected with minimal usage context rather than expanded into lessons.
- The romaji treatment is explicit enough that implementation does not need to invent a per-page policy.
- Every audio asset can be generated and mechanically verified directly from the frozen manifest.

## Frozen station purposes

| Station | Purpose |
| --- | --- |
| `Japanese` | Introduce `日本語`, Ling, and the network as an open map of lines and stations that can be revisited in any useful order. |
| `Japan` | Introduce `日本` and the Travel line as an always-available reference for a visitor using Japanese in everyday situations. |
| `Greetings` | Keep the six greetings and courtesies most useful at the beginning of an interaction. |
| `Navigation` | Help a visitor find a station, confirm a vehicle or platform, locate themselves, and show a destination. |
| `Food` | Help a visitor point, ask, order water, check a basic ingredient, and request the bill. |
| `Shopping` | Help a visitor ask about price, choose an item, ask about color or size, try clothing, and confirm card payment. |

`Japanese` and `Japan` each have one playable title word rather than a phrase
deck. The four practical stations have exactly six independently playable
reference rows. None of the six stations has review, completion, progress,
knowledge persistence, or prerequisites.

## Frozen content and audio manifest

### Japanese

| Japanese | English | Audio | Provenance |
| --- | --- | --- | --- |
| `日本語` | Japanese | `/audio/ja-travel-nihongo.wav` | Authored title word; standard dictionary form. |

Intro copy: “Ling maps Japanese as a network. Lines connect related parts of
the language, and stations are places to listen, learn, and revisit. Start
wherever is useful; the map can grow with you.”

### Japan

| Japanese | English | Audio | Provenance |
| --- | --- | --- | --- |
| `日本` | Japan | `/audio/ja-travel-nihon.wav` | Authored title word; standard dictionary form. |

Intro copy: “The Travel line is a small, always-available reference for using
Japanese in Japan. You will meet kanji, kana, and romaji in the world around
you; Ling keeps Japanese writing and listening primary while giving you the
English meaning you need.”

### Greetings

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `おはようございます` | Good morning | — | `/audio/ja-travel-ohayou-gozaimasu.wav` | JNTO basic greeting; Japan Foundation Irodori Starter L1. |
| `こんにちは` | Hello | Most common during the day. | `/audio/ja-travel-konnichiwa.wav` | JNTO basic greeting. |
| `こんばんは` | Good evening | — | `/audio/ja-travel-konbanwa.wav` | JNTO basic greeting. |
| `お願いします` | Please | Use when making or confirming a request. | `/audio/ja-travel-onegaishimasu.wav` | Japan Foundation Irodori Starter request patterns. |
| `ありがとうございます` | Thank you | Polite and broadly useful. | `/audio/ja-travel-arigatou-gozaimasu.wav` | JNTO basic courtesy; polite form frozen for visitor use. |
| `すみません` | Excuse me / I’m sorry | Also useful for getting someone’s attention. | `/audio/ja-travel-sumimasen.wav` | JNTO basic courtesy and etiquette guidance. |

### Navigation

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `駅はどこですか？` | Where is the station? | — | `/audio/ja-travel-eki-wa-doko-desu-ka.wav` | JNTO `どこですか` travel pattern; authored with `駅`. |
| `この電車は東京に行きますか？` | Does this train go to Tokyo? | Replace Tokyo with the destination you need. | `/audio/ja-travel-kono-densha-wa-toukyou-ni-ikimasu-ka.wav` | Japan Foundation Irodori Starter L13 vehicle/destination pattern. |
| `何番線ですか？` | Which platform? | — | `/audio/ja-travel-nanban-sen-desu-ka.wav` | Japan Foundation Irodori Starter L13. |
| `今、どこですか？` | Where are we now? | — | `/audio/ja-travel-ima-doko-desu-ka.wav` | Japan Foundation Irodori Starter L13. |
| `ここまでお願いします` | To here, please | Show a map or address to a taxi driver. | `/audio/ja-travel-koko-made-onegaishimasu.wav` | Standard taxi request assembled from the Irodori destination and request patterns. |
| `駅まで、どうやって行きますか？` | How do I get to the station? | — | `/audio/ja-travel-eki-made-douyatte-ikimasu-ka.wav` | Japan Foundation Irodori Starter L13 route pattern. |

### Food

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `これをお願いします` | This, please | Point to the item while asking. | `/audio/ja-travel-kore-o-onegaishimasu.wav` | Japan Foundation Irodori request patterns. |
| `おすすめは何ですか？` | What do you recommend? | — | `/audio/ja-travel-osusume-wa-nan-desu-ka.wav` | Japan Foundation Irodori restaurant recommendation material. |
| `水、お願いします` | Water, please | — | `/audio/ja-travel-mizu-onegaishimasu.wav` | Japan Foundation Irodori Starter L5. |
| `これは何ですか？` | What is this? | — | `/audio/ja-travel-kore-wa-nan-desu-ka.wav` | Japan Foundation Irodori meal dialog pattern. |
| `肉は入っていますか？` | Does this contain meat? | Ask about one ingredient; it is not a complete allergy explanation. | `/audio/ja-travel-niku-wa-haitteimasu-ka.wav` | Japan Foundation Irodori ingredient-check pattern. |
| `お会計、お願いします` | The bill, please | — | `/audio/ja-travel-okaikei-onegaishimasu.wav` | Japan Foundation Irodori restaurant word list. |

### Shopping

| Japanese | English | Essential usage note | Audio | Provenance |
| --- | --- | --- | --- | --- |
| `これ、いくらですか？` | How much is this? | — | `/audio/ja-travel-kore-ikura-desu-ka.wav` | Japan Foundation Irodori Starter L16; JNTO price pattern. |
| `これをください` | This, please | Use when choosing an item to buy. | `/audio/ja-travel-kore-o-kudasai.wav` | Japan Foundation Irodori Starter purchasing pattern. |
| `ほかの色、ありますか？` | Do you have another color? | — | `/audio/ja-travel-hoka-no-iro-arimasu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `もうちょっと大きいの、ありますか？` | Do you have a slightly larger one? | — | `/audio/ja-travel-mou-chotto-ookii-no-arimasu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `試着してもいいですか？` | May I try it on? | For clothing. | `/audio/ja-travel-shichaku-shite-mo-ii-desu-ka.wav` | Japan Foundation Irodori Elementary 2 L11. |
| `カードは使えますか？` | Can I use a card? | — | `/audio/ja-travel-kaado-wa-tsukaemasu-ka.wav` | Standard payment question; checked against Irodori payment contexts. |

## Source boundary

The implementation may cite or link to these official references but does not
copy their audio:

- [JNTO Japanese language basics](https://www.japan.travel/en/plan/japanese-language/)
- [JNTO Japanese manners](https://www.japan.travel/en/guide/japanese-manners-dos-and-donts/)
- [Japan Foundation Irodori Starter](https://www.irodori.jpf.go.jp/en/starter/pdf.html)
- [Japan Foundation Irodori Elementary 2 Lesson 11](https://www.irodori.jpf.go.jp/assets/data/elementary02/pdf/Z_L11.pdf)

All files are locally authored synthetic speech using the frozen transcript
verbatim. Ordinary rows never show pronunciation-subtitle romaji. The word
“romaji” appears only in the `Japan` orientation copy because encountered
Latin-letter writing is itself the subject there.
