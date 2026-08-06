# Kanji Track Curriculum Contract

[Back to the execution map](./EXECMAP.md)

## Goal

Define an honest first Kanji learning sequence that develops written-word decoding without duplicating the Vocabulary line or pretending three stations finish Kanji.

## Tasks

### Track structure

The map replaces the overloaded Writing category with two first-class Foundation lines, each with its own color:

- `Kana` branches to `Hiragana` and `Katakana`; they join at `Dakuten & Handakuten`, then continue to `Yōon`.
- `Kanji` is the introduction and first written-word station, then continues to `Compounds` and `Endings`.
- The retired visible `Writing` category redirects to `Kana`, and a stored `writing` map focus normalizes to `kana`.
- The first tranche ends at `Endings` because the current word corpus does not yet justify a full station about changing readings or continuous text. Ending the rendered line there is an honest content boundary, not the end of Kanji study.

The optional station footer completes the Kana system before entering the Kanji row: `Kana` → `Hiragana` → `Katakana` → `Dakuten & Handakuten` → `Yōon` → `Kanji` → `Compounds` → `Endings` → `Vocabulary`.

### Station content

All entries reference canonical items from `src/modules/learning/vocabulary.ts`; Kanji content does not own copied readings, meanings, pitch data, or audio paths.

| Station | Purpose | Canonical word IDs |
| --- | --- | --- |
| Kanji | Read high-value words written with one Kanji character. | `watashi`, `hito`, `mizu`, `eki`, `kuruma`, `ima`, `asa`, `hiru`, `yoru` |
| Compounds | Read words whose written form combines two or more meaning-bearing characters. | `namae`, `tomodachi`, `kazoku`, `sensei`, `densha`, `chikatetsu`, `kyou`, `ashita`, `kinou`, `jikan` |
| Endings | Read words where Kanji carries the lexical core and Kana completes the word. | `tabemono`, `iku`, `taberu`, `nomu`, `miru`, `kiku`, `hanasu`, `kau`, `matsu`, `ookii`, `chiisai`, `atsui`, `samui`, `takai`, `yasui` |

`子ども`, `お茶`, and `ご飯` remain visible in Vocabulary but are deliberately omitted from this first tranche: their mixed orthographic patterns would blur the three initial concepts. Katakana-only and Kana-only words are also omitted.

### Learning directions and completion

- `writing-to-reading`: prompt with the written word; reveal Kana reading, meaning, and audio.
- `reading-to-writing`: prompt with the Kana reading; reveal written word, meaning, and audio.
- Progress is keyed by user, canonical vocabulary item ID, and Kanji review direction in a dedicated table.
- Completing a station requires every scoped word in both directions.
- Completion means the learner marked these written-word associations as known. It does not mean every reading or use of the component characters is mastered.

### Station explanations

- `Kanji`: Kanji carry meaning in written words, but the whole word—not a character in isolation—is the learning unit. A character can be read differently in another word.
- `Compounds`: adjacent Kanji can combine into one word; learn the combination's word reading rather than assembling it from memorized character readings.
- `Endings`: many verbs and adjectives combine a Kanji core with a Kana ending. Read both parts as one word; later grammar can change the Kana ending while the core remains recognizable.

## Constraints

- Do not add prerequisites, levels, scores, streaks, or a generic course engine.
- Do not store duplicate content or audio metadata in the Kanji module.
- Do not infer mastery of a character across unlearned words.
- Do not introduce a `Readings` station until recurring characters with meaningfully different word readings exist in the canonical vocabulary.
- Do not imply that `Endings` is the end of the Kanji track.

## Exit Criteria

- The three word sets are mutually exclusive, pedagogically coherent, and resolve to canonical Vocabulary items.
- The two review directions and separate progress semantics are explicit.
- The map topology and optional footer sequence are explicit.
- Current exclusions and the criterion for extending the track are explicit.
