# Curriculum Contract

[Back to the execution map](./EXECMAP.md)

## Goal

Define the ordered word collections, the first Kanji teaching surface, and the compatibility rules before changing data or routes.

## Tasks

### Vocabulary order

The Vocabulary line uses this optional conceptual order:

| Station | Purpose | Words |
| --- | --- | --- |
| Pointing | Identify things and ask where they are. | これ, それ, あれ, ここ, そこ, あそこ, どこ, なに |
| People | Identify yourself and people around you. | 私, 名前, 人, 友達, 家族, 先生, 子ども |
| Needs | Cover food, drink, and immediate everyday needs. | 水, 食べ物, トイレ, お茶, コーヒー, パン, ご飯 |
| Movement | Recognize common transport and movement words. | 駅, 電車, 行く, バス, 車, タクシー, 地下鉄 |
| Time | Locate everyday events in time. | 今, 今日, 明日, 昨日, 朝, 昼, 夜, 時間 |
| Actions | Build a first set of common verbs. | 食べる, 飲む, 見る, 聞く, 話す, 買う, 待つ |
| Descriptions | Describe quality, size, temperature, and cost. | いい, 大きい, 小さい, 暑い, 寒い, 高い, 安い |

Japanese forms, readings, meanings, and Tokyo accent nuclei follow the Japan Foundation Marugoto Starter vocabulary indexes. When those indexes list a common accent variant, Ling keeps one internally consistent standard contour rather than teaching dialectal or free variation at this stage.

### Kanji scope

- Add one `Kanji` station to Writing after `Hiragana` in the suggested footer path; Katakana remains independently accessible and is not a prerequisite.
- Explain Kanji as meaning-bearing characters learned inside words, always paired with a readable Kana form.
- Teach four representative structures: a single character (`人`), a compound (`名前`), Kanji plus an inflecting Kana ending (`食べる`), and Kanji plus adjective ending (`大きい`).
- Vocabulary begins without Kanji in Pointing, then introduces Kanji in People and continues using it with an explicit Kana reading and Rōmaji.

### Compatibility

- Preserve the existing item IDs `kore`, `koko`, `doko`, `nani`, `watashi`, `namae`, `hito`, `mizu`, `tabemono`, `toire`, `eki`, `densha`, `iku`, `ima`, and `kyou`.
- Keep `vocabulary_knowledge` keyed by user, item ID, and review direction; no destructive migration is needed.
- Scope bulk complete/reset operations to the active station instead of the whole Vocabulary line.
- Keep the current fifteen-word set as a curated pronunciation corpus for Mora/Pitch audio verification rather than treating it as the vocabulary curriculum.
- Redirect `/stations/words` to `/stations/pointing`; translate the legacy stored network focus `words` to `pointing`.
- Keep all routes directly accessible and all suggested order optional.

## Constraints

- Do not reintroduce Nouns, Verbs, or Adjectives as map stations.
- Do not add prerequisite checks or invalidate existing item-level knowledge.
- Do not teach isolated on/kun reading lists before the learner has words that use them.
- Do not imply that Descriptions is the end of Japanese vocabulary.

## Exit Criteria

- Every station has an explicit purpose and bounded word list.
- Existing items have a destination without changing their IDs.
- Kanji has a concrete first interior and a clear relationship to Vocabulary.
- API, progress, route, map, footer, and audio compatibility decisions are explicit.
