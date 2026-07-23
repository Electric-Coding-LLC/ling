"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KanaExtensionPatternId } from "@/src/modules/learning/kana-extensions";
import {
  getJapaneseSoundCue,
  getJapaneseWordSoundCue,
  JAPANESE_VOWEL_SOUND_CUES,
  JAPANESE_YOON_VOWEL_SOUND_CUES,
  splitJapaneseMorae,
} from "@/src/modules/learning/japanese-sound-cues";
import { FlashcardContent, FlashcardReview } from "../flashcard-review";
import { useFlashcardAudio } from "../use-flashcard-audio";

type PatternCard = {
  readonly audio: string;
  readonly example: string;
  readonly exampleAudio: string;
  readonly id: KanaExtensionPatternId;
  readonly kana: string;
  readonly translation: string;
};

type ExtensionChartCell = {
  readonly hiragana: string;
  readonly katakana: string;
};

const DUPLICATE_MARKED_KATAKANA = new Set(["ベ", "ペ"]);
const MARKED_SOUND_ROWS: readonly (readonly ExtensionChartCell[])[] = [
  [
    { hiragana: "が", katakana: "ガ" },
    { hiragana: "ぎ", katakana: "ギ" },
    { hiragana: "ぐ", katakana: "グ" },
    { hiragana: "げ", katakana: "ゲ" },
    { hiragana: "ご", katakana: "ゴ" },
  ],
  [
    { hiragana: "ざ", katakana: "ザ" },
    { hiragana: "じ", katakana: "ジ" },
    { hiragana: "ず", katakana: "ズ" },
    { hiragana: "ぜ", katakana: "ゼ" },
    { hiragana: "ぞ", katakana: "ゾ" },
  ],
  [
    { hiragana: "だ", katakana: "ダ" },
    { hiragana: "ぢ", katakana: "ヂ" },
    { hiragana: "づ", katakana: "ヅ" },
    { hiragana: "で", katakana: "デ" },
    { hiragana: "ど", katakana: "ド" },
  ],
  [
    { hiragana: "ば", katakana: "バ" },
    { hiragana: "び", katakana: "ビ" },
    { hiragana: "ぶ", katakana: "ブ" },
    { hiragana: "べ", katakana: "ベ" },
    { hiragana: "ぼ", katakana: "ボ" },
  ],
  [
    { hiragana: "ぱ", katakana: "パ" },
    { hiragana: "ぴ", katakana: "ピ" },
    { hiragana: "ぷ", katakana: "プ" },
    { hiragana: "ぺ", katakana: "ペ" },
    { hiragana: "ぽ", katakana: "ポ" },
  ],
];

const SOUND_MARK_FLASHCARDS: readonly PatternCard[] = [
  { audio: "/audio/ja-ga.wav", example: "がくせい", exampleAudio: "/audio/ja-gakusei.wav", id: "dakuten-k", kana: "が", translation: "student" },
  { audio: "/audio/ja-marks-gi.wav", example: "ぎんこう", exampleAudio: "/audio/ja-marks-ginkou.wav", id: "sound-hiragana-gi", kana: "ぎ", translation: "bank" },
  { audio: "/audio/ja-marks-gu.wav", example: "ぐあい", exampleAudio: "/audio/ja-marks-guai.wav", id: "sound-hiragana-gu", kana: "ぐ", translation: "condition" },
  { audio: "/audio/ja-marks-ge.wav", example: "げんき", exampleAudio: "/audio/ja-marks-genki.wav", id: "sound-hiragana-ge", kana: "げ", translation: "well" },
  { audio: "/audio/ja-marks-go.wav", example: "ごはん", exampleAudio: "/audio/ja-marks-gohan.wav", id: "sound-hiragana-go", kana: "ご", translation: "rice" },
  { audio: "/audio/ja-za.wav", example: "かざん", exampleAudio: "/audio/ja-kazan.wav", id: "dakuten-s", kana: "ざ", translation: "volcano" },
  { audio: "/audio/ja-marks-ji.wav", example: "じかん", exampleAudio: "/audio/ja-marks-jikan.wav", id: "sound-hiragana-ji", kana: "じ", translation: "time" },
  { audio: "/audio/ja-marks-zu.wav", example: "ずぼん", exampleAudio: "/audio/ja-marks-zubon.wav", id: "sound-hiragana-zu", kana: "ず", translation: "trousers" },
  { audio: "/audio/ja-marks-ze.wav", example: "ぜんぶ", exampleAudio: "/audio/ja-marks-zenbu.wav", id: "sound-hiragana-ze", kana: "ぜ", translation: "all" },
  { audio: "/audio/ja-marks-zo.wav", example: "ぞう", exampleAudio: "/audio/ja-marks-zou.wav", id: "sound-hiragana-zo", kana: "ぞ", translation: "elephant" },
  { audio: "/audio/ja-da.wav", example: "くだもの", exampleAudio: "/audio/ja-kudamono.wav", id: "dakuten-t", kana: "だ", translation: "fruit" },
  { audio: "/audio/ja-marks-di.wav", example: "はなぢ", exampleAudio: "/audio/ja-marks-hanadi.wav", id: "sound-hiragana-di", kana: "ぢ", translation: "nosebleed" },
  { audio: "/audio/ja-marks-du.wav", example: "つづく", exampleAudio: "/audio/ja-marks-tsuzuku.wav", id: "sound-hiragana-du", kana: "づ", translation: "to continue" },
  { audio: "/audio/ja-marks-de.wav", example: "でぐち", exampleAudio: "/audio/ja-marks-deguchi.wav", id: "sound-hiragana-de", kana: "で", translation: "exit" },
  { audio: "/audio/ja-marks-do.wav", example: "どうぶつ", exampleAudio: "/audio/ja-marks-doubutsu.wav", id: "sound-hiragana-do", kana: "ど", translation: "animal" },
  { audio: "/audio/ja-ba.wav", example: "かばん", exampleAudio: "/audio/ja-kaban.wav", id: "dakuten-h", kana: "ば", translation: "bag" },
  { audio: "/audio/ja-marks-bi.wav", example: "びわ", exampleAudio: "/audio/ja-marks-biwa.wav", id: "sound-hiragana-bi", kana: "び", translation: "loquat" },
  { audio: "/audio/ja-marks-bu.wav", example: "ぶた", exampleAudio: "/audio/ja-marks-buta.wav", id: "sound-hiragana-bu", kana: "ぶ", translation: "pig" },
  { audio: "/audio/ja-marks-be.wav", example: "べんとう", exampleAudio: "/audio/ja-marks-bentou.wav", id: "sound-hiragana-be", kana: "べ", translation: "boxed lunch" },
  { audio: "/audio/ja-marks-bo.wav", example: "ぼうし", exampleAudio: "/audio/ja-marks-boushi.wav", id: "sound-hiragana-bo", kana: "ぼ", translation: "hat" },
  { audio: "/audio/ja-pa.wav", example: "ぱん", exampleAudio: "/audio/ja-pan.wav", id: "handakuten-h", kana: "ぱ", translation: "bread" },
  { audio: "/audio/ja-marks-pi.wav", example: "ぴかぴか", exampleAudio: "/audio/ja-marks-pikapika.wav", id: "sound-hiragana-pi", kana: "ぴ", translation: "sparkling" },
  { audio: "/audio/ja-marks-pu.wav", example: "ぷりん", exampleAudio: "/audio/ja-marks-purin.wav", id: "sound-hiragana-pu", kana: "ぷ", translation: "pudding" },
  { audio: "/audio/ja-marks-pe.wav", example: "ぺん", exampleAudio: "/audio/ja-marks-pen-hiragana.wav", id: "sound-hiragana-pe", kana: "ぺ", translation: "pen" },
  { audio: "/audio/ja-marks-po.wav", example: "ぽすと", exampleAudio: "/audio/ja-marks-posuto-hiragana.wav", id: "sound-hiragana-po", kana: "ぽ", translation: "mailbox" },
  { audio: "/audio/ja-ga.wav", example: "ガラス", exampleAudio: "/audio/ja-marks-garasu.wav", id: "sound-katakana-ga", kana: "ガ", translation: "glass" },
  { audio: "/audio/ja-marks-gi.wav", example: "ギフト", exampleAudio: "/audio/ja-marks-gifuto.wav", id: "sound-katakana-gi", kana: "ギ", translation: "gift" },
  { audio: "/audio/ja-marks-gu.wav", example: "グラス", exampleAudio: "/audio/ja-marks-gurasu.wav", id: "sound-katakana-gu", kana: "グ", translation: "drinking glass" },
  { audio: "/audio/ja-marks-ge.wav", example: "ゲスト", exampleAudio: "/audio/ja-marks-gesuto.wav", id: "sound-katakana-ge", kana: "ゲ", translation: "guest" },
  { audio: "/audio/ja-marks-go.wav", example: "ゴルフ", exampleAudio: "/audio/ja-marks-gorufu.wav", id: "sound-katakana-go", kana: "ゴ", translation: "golf" },
  { audio: "/audio/ja-za.wav", example: "ザリガニ", exampleAudio: "/audio/ja-marks-zarigani.wav", id: "sound-katakana-za", kana: "ザ", translation: "crayfish" },
  { audio: "/audio/ja-marks-ji.wav", example: "ジム", exampleAudio: "/audio/ja-marks-jimu.wav", id: "sound-katakana-ji", kana: "ジ", translation: "gym" },
  { audio: "/audio/ja-marks-zu.wav", example: "ズボン", exampleAudio: "/audio/ja-marks-zubon.wav", id: "sound-katakana-zu", kana: "ズ", translation: "trousers" },
  { audio: "/audio/ja-marks-ze.wav", example: "ゼロ", exampleAudio: "/audio/ja-marks-zero.wav", id: "sound-katakana-ze", kana: "ゼ", translation: "zero" },
  { audio: "/audio/ja-marks-zo.wav", example: "ゾンビ", exampleAudio: "/audio/ja-marks-zonbi.wav", id: "sound-katakana-zo", kana: "ゾ", translation: "zombie" },
  { audio: "/audio/ja-da.wav", example: "ダンス", exampleAudio: "/audio/ja-marks-dansu.wav", id: "sound-katakana-da", kana: "ダ", translation: "dance" },
  { audio: "/audio/ja-marks-di.wav", example: "チヂミ", exampleAudio: "/audio/ja-marks-chijimi.wav", id: "sound-katakana-di", kana: "ヂ", translation: "Korean pancake" },
  { audio: "/audio/ja-marks-du.wav", example: "ヅラ", exampleAudio: "/audio/ja-marks-zura.wav", id: "sound-katakana-du", kana: "ヅ", translation: "wig" },
  { audio: "/audio/ja-marks-de.wav", example: "デニム", exampleAudio: "/audio/ja-marks-denimu.wav", id: "sound-katakana-de", kana: "デ", translation: "denim" },
  { audio: "/audio/ja-marks-do.wav", example: "ドア", exampleAudio: "/audio/ja-marks-doa.wav", id: "sound-katakana-do", kana: "ド", translation: "door" },
  { audio: "/audio/ja-ba.wav", example: "バス", exampleAudio: "/audio/ja-marks-basu.wav", id: "sound-katakana-ba", kana: "バ", translation: "bus" },
  { audio: "/audio/ja-marks-bi.wav", example: "ビル", exampleAudio: "/audio/ja-marks-biru.wav", id: "sound-katakana-bi", kana: "ビ", translation: "building" },
  { audio: "/audio/ja-marks-bu.wav", example: "ブラシ", exampleAudio: "/audio/ja-marks-burashi.wav", id: "sound-katakana-bu", kana: "ブ", translation: "brush" },
  { audio: "/audio/ja-marks-bo.wav", example: "ボタン", exampleAudio: "/audio/ja-marks-botan.wav", id: "sound-katakana-bo", kana: "ボ", translation: "button" },
  { audio: "/audio/ja-pa.wav", example: "パン", exampleAudio: "/audio/ja-katakana-pan.wav", id: "sound-katakana-pa", kana: "パ", translation: "bread" },
  { audio: "/audio/ja-marks-pi.wav", example: "ピアノ", exampleAudio: "/audio/ja-marks-piano.wav", id: "sound-katakana-pi", kana: "ピ", translation: "piano" },
  { audio: "/audio/ja-marks-pu.wav", example: "プラス", exampleAudio: "/audio/ja-marks-purasu.wav", id: "sound-katakana-pu", kana: "プ", translation: "plus" },
  { audio: "/audio/ja-marks-po.wav", example: "ポスト", exampleAudio: "/audio/ja-marks-posuto.wav", id: "sound-katakana-po", kana: "ポ", translation: "mailbox" },
];

const SOUND_MARK_FLASHCARD_BY_KANA = new Map(
  SOUND_MARK_FLASHCARDS.map((entry) => [entry.kana, entry]),
);

const COMBINED_SOUND_ROWS: readonly (readonly ExtensionChartCell[])[] = [
  [{ hiragana: "きゃ", katakana: "キャ" }, { hiragana: "きゅ", katakana: "キュ" }, { hiragana: "きょ", katakana: "キョ" }],
  [{ hiragana: "しゃ", katakana: "シャ" }, { hiragana: "しゅ", katakana: "シュ" }, { hiragana: "しょ", katakana: "ショ" }],
  [{ hiragana: "ちゃ", katakana: "チャ" }, { hiragana: "ちゅ", katakana: "チュ" }, { hiragana: "ちょ", katakana: "チョ" }],
  [{ hiragana: "にゃ", katakana: "ニャ" }, { hiragana: "にゅ", katakana: "ニュ" }, { hiragana: "にょ", katakana: "ニョ" }],
  [{ hiragana: "ひゃ", katakana: "ヒャ" }, { hiragana: "ひゅ", katakana: "ヒュ" }, { hiragana: "ひょ", katakana: "ヒョ" }],
  [{ hiragana: "みゃ", katakana: "ミャ" }, { hiragana: "みゅ", katakana: "ミュ" }, { hiragana: "みょ", katakana: "ミョ" }],
  [{ hiragana: "りゃ", katakana: "リャ" }, { hiragana: "りゅ", katakana: "リュ" }, { hiragana: "りょ", katakana: "リョ" }],
  [{ hiragana: "ぎゃ", katakana: "ギャ" }, { hiragana: "ぎゅ", katakana: "ギュ" }, { hiragana: "ぎょ", katakana: "ギョ" }],
  [{ hiragana: "じゃ", katakana: "ジャ" }, { hiragana: "じゅ", katakana: "ジュ" }, { hiragana: "じょ", katakana: "ジョ" }],
  [{ hiragana: "びゃ", katakana: "ビャ" }, { hiragana: "びゅ", katakana: "ビュ" }, { hiragana: "びょ", katakana: "ビョ" }],
  [{ hiragana: "ぴゃ", katakana: "ピャ" }, { hiragana: "ぴゅ", katakana: "ピュ" }, { hiragana: "ぴょ", katakana: "ピョ" }],
];

const COMBINED_SOUND_FLASHCARDS: readonly PatternCard[] = [
  { audio: "/audio/ja-yoon-kya.wav", example: "きゃく", exampleAudio: "/audio/ja-yoon-hiragana-kya.wav", id: "small-kya", kana: "きゃ", translation: "guest" },
  { audio: "/audio/ja-yoon-kyu.wav", example: "きゅう", exampleAudio: "/audio/ja-yoon-hiragana-kyu.wav", id: "yoon-hiragana-kyu", kana: "きゅ", translation: "nine" },
  { audio: "/audio/ja-yoon-kyo.wav", example: "きょう", exampleAudio: "/audio/ja-yoon-hiragana-kyo.wav", id: "yoon-hiragana-kyo", kana: "きょ", translation: "today" },
  { audio: "/audio/ja-yoon-sha.wav", example: "しゃしん", exampleAudio: "/audio/ja-yoon-hiragana-sha.wav", id: "yoon-hiragana-sha", kana: "しゃ", translation: "photograph" },
  { audio: "/audio/ja-yoon-shu.wav", example: "しゅみ", exampleAudio: "/audio/ja-yoon-hiragana-shu.wav", id: "small-shu", kana: "しゅ", translation: "hobby" },
  { audio: "/audio/ja-yoon-sho.wav", example: "しょくじ", exampleAudio: "/audio/ja-yoon-hiragana-sho.wav", id: "yoon-hiragana-sho", kana: "しょ", translation: "meal" },
  { audio: "/audio/ja-yoon-cha.wav", example: "おちゃ", exampleAudio: "/audio/ja-yoon-hiragana-cha.wav", id: "yoon-hiragana-cha", kana: "ちゃ", translation: "tea" },
  { audio: "/audio/ja-yoon-chu.wav", example: "ちゅうい", exampleAudio: "/audio/ja-yoon-hiragana-chu.wav", id: "yoon-hiragana-chu", kana: "ちゅ", translation: "caution" },
  { audio: "/audio/ja-yoon-cho.wav", example: "ちょきん", exampleAudio: "/audio/ja-yoon-hiragana-cho.wav", id: "small-cho", kana: "ちょ", translation: "savings" },
  { audio: "/audio/ja-yoon-nya.wav", example: "にゃんこ", exampleAudio: "/audio/ja-yoon-hiragana-nya.wav", id: "yoon-hiragana-nya", kana: "にゃ", translation: "kitty" },
  { audio: "/audio/ja-yoon-nyu.wav", example: "にゅうがく", exampleAudio: "/audio/ja-yoon-hiragana-nyu.wav", id: "small-nyu", kana: "にゅ", translation: "school admission" },
  { audio: "/audio/ja-yoon-nyo.wav", example: "にょろにょろ", exampleAudio: "/audio/ja-yoon-hiragana-nyo.wav", id: "yoon-hiragana-nyo", kana: "にょ", translation: "slithering" },
  { audio: "/audio/ja-yoon-hya.wav", example: "ひゃく", exampleAudio: "/audio/ja-yoon-hiragana-hya.wav", id: "yoon-hiragana-hya", kana: "ひゃ", translation: "hundred" },
  { audio: "/audio/ja-yoon-hyu.wav", example: "ひゅうひゅう", exampleAudio: "/audio/ja-yoon-hiragana-hyu.wav", id: "yoon-hiragana-hyu", kana: "ひゅ", translation: "whistling" },
  { audio: "/audio/ja-yoon-hyo.wav", example: "ひょう", exampleAudio: "/audio/ja-yoon-hiragana-hyo.wav", id: "yoon-hiragana-hyo", kana: "ひょ", translation: "leopard" },
  { audio: "/audio/ja-yoon-mya.wav", example: "みゃく", exampleAudio: "/audio/ja-yoon-hiragana-mya.wav", id: "yoon-hiragana-mya", kana: "みゃ", translation: "pulse" },
  { audio: "/audio/ja-yoon-myu.wav", example: "みゅおん", exampleAudio: "/audio/ja-yoon-safe-myuon.wav", id: "yoon-hiragana-myu", kana: "みゅ", translation: "muon" },
  { audio: "/audio/ja-yoon-myo.wav", example: "みょうじ", exampleAudio: "/audio/ja-yoon-hiragana-myo.wav", id: "yoon-hiragana-myo", kana: "みょ", translation: "surname" },
  { audio: "/audio/ja-yoon-rya.wav", example: "りゃく", exampleAudio: "/audio/ja-yoon-hiragana-rya.wav", id: "yoon-hiragana-rya", kana: "りゃ", translation: "abbreviation" },
  { audio: "/audio/ja-yoon-ryu.wav", example: "りゅう", exampleAudio: "/audio/ja-yoon-hiragana-ryu.wav", id: "yoon-hiragana-ryu", kana: "りゅ", translation: "dragon" },
  { audio: "/audio/ja-yoon-ryo.wav", example: "りょこう", exampleAudio: "/audio/ja-yoon-hiragana-ryo.wav", id: "small-ryo", kana: "りょ", translation: "travel" },
  { audio: "/audio/ja-yoon-gya.wav", example: "ぎゃく", exampleAudio: "/audio/ja-yoon-hiragana-gya.wav", id: "yoon-hiragana-gya", kana: "ぎゃ", translation: "opposite" },
  { audio: "/audio/ja-yoon-gyu.wav", example: "ぎゅうにゅう", exampleAudio: "/audio/ja-yoon-hiragana-gyu.wav", id: "yoon-hiragana-gyu", kana: "ぎゅ", translation: "milk" },
  { audio: "/audio/ja-yoon-gyo.wav", example: "ぎょかい", exampleAudio: "/audio/ja-yoon-hiragana-gyo.wav", id: "yoon-hiragana-gyo", kana: "ぎょ", translation: "fishing industry" },
  { audio: "/audio/ja-yoon-ja.wav", example: "じゃま", exampleAudio: "/audio/ja-yoon-hiragana-ja.wav", id: "yoon-hiragana-ja", kana: "じゃ", translation: "obstruction" },
  { audio: "/audio/ja-yoon-ju.wav", example: "じゅぎょう", exampleAudio: "/audio/ja-yoon-hiragana-ju.wav", id: "yoon-hiragana-ju", kana: "じゅ", translation: "class" },
  { audio: "/audio/ja-yoon-jo.wav", example: "じょせい", exampleAudio: "/audio/ja-yoon-hiragana-jo.wav", id: "yoon-hiragana-jo", kana: "じょ", translation: "woman" },
  { audio: "/audio/ja-yoon-bya.wav", example: "びゃくや", exampleAudio: "/audio/ja-yoon-hiragana-bya.wav", id: "yoon-hiragana-bya", kana: "びゃ", translation: "midnight sun" },
  { audio: "/audio/ja-yoon-byu.wav", example: "びゅうびゅう", exampleAudio: "/audio/ja-yoon-hiragana-byu.wav", id: "yoon-hiragana-byu", kana: "びゅ", translation: "howling wind" },
  { audio: "/audio/ja-yoon-byo.wav", example: "びょういん", exampleAudio: "/audio/ja-yoon-hiragana-byo.wav", id: "yoon-hiragana-byo", kana: "びょ", translation: "hospital" },
  { audio: "/audio/ja-yoon-pya.wav", example: "ぴゃあ", exampleAudio: "/audio/ja-yoon-safe-pyaa.wav", id: "yoon-hiragana-pya", kana: "ぴゃ", translation: "squeal" },
  { audio: "/audio/ja-yoon-pyu.wav", example: "ぴゅあ", exampleAudio: "/audio/ja-yoon-hiragana-pyu.wav", id: "yoon-hiragana-pyu", kana: "ぴゅ", translation: "pure" },
  { audio: "/audio/ja-yoon-pyo.wav", example: "ぴょん", exampleAudio: "/audio/ja-yoon-hiragana-pyo.wav", id: "yoon-hiragana-pyo", kana: "ぴょ", translation: "hop" },
  { audio: "/audio/ja-yoon-kya.wav", example: "キャベツ", exampleAudio: "/audio/ja-yoon-katakana-kya.wav", id: "yoon-katakana-kya", kana: "キャ", translation: "cabbage" },
  { audio: "/audio/ja-yoon-kyu.wav", example: "キュウリ", exampleAudio: "/audio/ja-yoon-safe-kyuuri.wav", id: "yoon-katakana-kyu", kana: "キュ", translation: "cucumber" },
  { audio: "/audio/ja-yoon-kyo.wav", example: "キョロキョロ", exampleAudio: "/audio/ja-yoon-katakana-kyo.wav", id: "yoon-katakana-kyo", kana: "キョ", translation: "looking around" },
  { audio: "/audio/ja-yoon-sha.wav", example: "シャツ", exampleAudio: "/audio/ja-yoon-katakana-sha.wav", id: "yoon-katakana-sha", kana: "シャ", translation: "shirt" },
  { audio: "/audio/ja-yoon-shu.wav", example: "シュウマイ", exampleAudio: "/audio/ja-yoon-safe-shuumai.wav", id: "yoon-katakana-shu", kana: "シュ", translation: "shumai" },
  { audio: "/audio/ja-yoon-sho.wav", example: "ショコラ", exampleAudio: "/audio/ja-yoon-safe-shokora.wav", id: "yoon-katakana-sho", kana: "ショ", translation: "chocolate" },
  { audio: "/audio/ja-yoon-cha.wav", example: "チャンス", exampleAudio: "/audio/ja-yoon-katakana-cha.wav", id: "yoon-katakana-cha", kana: "チャ", translation: "chance" },
  { audio: "/audio/ja-yoon-chu.wav", example: "チュロス", exampleAudio: "/audio/ja-yoon-safe-churosu.wav", id: "yoon-katakana-chu", kana: "チュ", translation: "churros" },
  { audio: "/audio/ja-yoon-cho.wav", example: "チョコ", exampleAudio: "/audio/ja-yoon-katakana-cho.wav", id: "yoon-katakana-cho", kana: "チョ", translation: "chocolate" },
  { audio: "/audio/ja-yoon-nya.wav", example: "ニャンコ", exampleAudio: "/audio/ja-yoon-katakana-nya.wav", id: "yoon-katakana-nya", kana: "ニャ", translation: "kitty" },
  { audio: "/audio/ja-yoon-nyu.wav", example: "ニュアンス", exampleAudio: "/audio/ja-yoon-safe-nyuansu.wav", id: "yoon-katakana-nyu", kana: "ニュ", translation: "nuance" },
  { audio: "/audio/ja-yoon-nyo.wav", example: "ニョロニョロ", exampleAudio: "/audio/ja-yoon-katakana-nyo.wav", id: "yoon-katakana-nyo", kana: "ニョ", translation: "slithering" },
  { audio: "/audio/ja-yoon-hya.wav", example: "ヒャク", exampleAudio: "/audio/ja-yoon-hiragana-hya.wav", id: "yoon-katakana-hya", kana: "ヒャ", translation: "hundred" },
  { audio: "/audio/ja-yoon-hyu.wav", example: "ヒュウヒュウ", exampleAudio: "/audio/ja-yoon-hiragana-hyu.wav", id: "yoon-katakana-hyu", kana: "ヒュ", translation: "whistling" },
  { audio: "/audio/ja-yoon-hyo.wav", example: "ヒョウ", exampleAudio: "/audio/ja-yoon-katakana-hyo.wav", id: "yoon-katakana-hyo", kana: "ヒョ", translation: "leopard" },
  { audio: "/audio/ja-yoon-mya.wav", example: "ミャク", exampleAudio: "/audio/ja-yoon-hiragana-mya.wav", id: "yoon-katakana-mya", kana: "ミャ", translation: "pulse" },
  { audio: "/audio/ja-yoon-myu.wav", example: "ミュオン", exampleAudio: "/audio/ja-yoon-safe-myuon.wav", id: "yoon-katakana-myu", kana: "ミュ", translation: "muon" },
  { audio: "/audio/ja-yoon-myo.wav", example: "ミョウジ", exampleAudio: "/audio/ja-yoon-katakana-myo.wav", id: "yoon-katakana-myo", kana: "ミョ", translation: "surname" },
  { audio: "/audio/ja-yoon-rya.wav", example: "リャク", exampleAudio: "/audio/ja-yoon-katakana-rya.wav", id: "yoon-katakana-rya", kana: "リャ", translation: "abbreviation" },
  { audio: "/audio/ja-yoon-ryu.wav", example: "リュウ", exampleAudio: "/audio/ja-yoon-hiragana-ryu.wav", id: "yoon-katakana-ryu", kana: "リュ", translation: "dragon" },
  { audio: "/audio/ja-yoon-ryo.wav", example: "リョウリ", exampleAudio: "/audio/ja-yoon-katakana-ryo.wav", id: "yoon-katakana-ryo", kana: "リョ", translation: "cooking" },
  { audio: "/audio/ja-yoon-gya.wav", example: "ギャク", exampleAudio: "/audio/ja-yoon-hiragana-gya.wav", id: "yoon-katakana-gya", kana: "ギャ", translation: "opposite" },
  { audio: "/audio/ja-yoon-gyu.wav", example: "ギュウニュウ", exampleAudio: "/audio/ja-yoon-hiragana-gyu.wav", id: "yoon-katakana-gyu", kana: "ギュ", translation: "milk" },
  { audio: "/audio/ja-yoon-gyo.wav", example: "ギョカイ", exampleAudio: "/audio/ja-yoon-hiragana-gyo.wav", id: "yoon-katakana-gyo", kana: "ギョ", translation: "fishing industry" },
  { audio: "/audio/ja-yoon-ja.wav", example: "ジャム", exampleAudio: "/audio/ja-yoon-katakana-ja.wav", id: "yoon-katakana-ja", kana: "ジャ", translation: "jam" },
  { audio: "/audio/ja-yoon-ju.wav", example: "ジュギョウ", exampleAudio: "/audio/ja-yoon-hiragana-ju.wav", id: "yoon-katakana-ju", kana: "ジュ", translation: "class" },
  { audio: "/audio/ja-yoon-jo.wav", example: "ジョギング", exampleAudio: "/audio/ja-yoon-katakana-jo.wav", id: "yoon-katakana-jo", kana: "ジョ", translation: "jogging" },
  { audio: "/audio/ja-yoon-bya.wav", example: "ビャクヤ", exampleAudio: "/audio/ja-yoon-katakana-bya.wav", id: "yoon-katakana-bya", kana: "ビャ", translation: "midnight sun" },
  { audio: "/audio/ja-yoon-byu.wav", example: "ビュウビュウ", exampleAudio: "/audio/ja-yoon-hiragana-byu.wav", id: "yoon-katakana-byu", kana: "ビュ", translation: "howling wind" },
  { audio: "/audio/ja-yoon-byo.wav", example: "ビョウイン", exampleAudio: "/audio/ja-yoon-katakana-byo.wav", id: "yoon-katakana-byo", kana: "ビョ", translation: "hospital" },
  { audio: "/audio/ja-yoon-pya.wav", example: "ピャア", exampleAudio: "/audio/ja-yoon-safe-pyaa.wav", id: "yoon-katakana-pya", kana: "ピャ", translation: "squeal" },
  { audio: "/audio/ja-yoon-pyu.wav", example: "ピュア", exampleAudio: "/audio/ja-yoon-katakana-pyu.wav", id: "yoon-katakana-pyu", kana: "ピュ", translation: "pure" },
  { audio: "/audio/ja-yoon-pyo.wav", example: "ピョン", exampleAudio: "/audio/ja-yoon-katakana-pyo.wav", id: "yoon-katakana-pyo", kana: "ピョ", translation: "hop" },
];

const COMBINED_SOUND_FLASHCARD_BY_KANA = new Map(
  COMBINED_SOUND_FLASHCARDS.map((entry) => [entry.kana, entry]),
);

type ExtensionTest = {
  cards: PatternCard[];
  title: string;
};

type KanaPatternGuideProps = {
  readonly chart: (renderCard: (entry: PatternCard) => ReactNode) => ReactNode;
  readonly flashcards: readonly PatternCard[];
  readonly intro: ReactNode;
  readonly nextStation: string;
  readonly stationName: string;
  readonly stationSlug: "combined-sounds" | "sound-marks";
};

export function SoundMarksGuide() {
  return (
    <KanaPatternGuide
      chart={(renderCard) => <SoundMarksChart renderCard={renderCard} />}
      flashcards={SOUND_MARK_FLASHCARDS}
      intro={<p>Dakuten and handakuten are marks added to Kana you already know. Each mark changes the sound of the Kana it sits beside.</p>}
      nextStation="Yōon"
      stationName="Dakuten & Handakuten"
      stationSlug="sound-marks"
    />
  );
}

export function CombinedSoundsGuide() {
  return (
    <KanaPatternGuide
      chart={(renderCard) => <CombinedSoundsChart renderCard={renderCard} />}
      flashcards={COMBINED_SOUND_FLASHCARDS}
      intro={(
        <>
          <p>Yōon is a way of writing one sound with two Kana. A small <strong lang="ja">ゃ</strong>, <strong lang="ja">ゅ</strong>, or <strong lang="ja">ょ</strong> changes the sound of the Kana before it, and the pair is read together.</p>
          <p>For example, <strong lang="ja">き</strong> is kee. With a small <strong lang="ja">ゃ</strong>, <strong lang="ja">きゃ</strong> is kyah—not kee-yah. Katakana follows the same pattern with <strong lang="ja">ャ</strong>, <strong lang="ja">ュ</strong>, and <strong lang="ja">ョ</strong>.</p>
        </>
      )}
      nextStation="Mora timing"
      stationName="Yōon"
      stationSlug="combined-sounds"
    />
  );
}

function KanaPatternGuide({
  chart,
  flashcards,
  intro,
  nextStation,
  stationName,
  stationSlug,
}: KanaPatternGuideProps) {
  const allEntries = flashcards;
  const entryIds: ReadonlySet<string> = useMemo(
    () => new Set(allEntries.map((entry) => entry.id)),
    [allEntries],
  );
  const knowledgePath = `/api/stations/${stationSlug}/knowledge`;
  const {
    activeAudioIndex,
    activeBeatIndex,
    audioError,
    audioPlaying,
    audioRef,
    handleAudioEnded,
    handleAudioError,
    playAudio,
    stopAudio,
  } = useFlashcardAudio();
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [activeTest, setActiveTest] = useState<ExtensionTest | null>(null);
  const [bulkKnowledgeAction, setBulkKnowledgeAction] = useState<"complete" | "reset" | null>(null);
  const [knowledgeError, setKnowledgeError] = useState(false);
  const [knownPatterns, setKnownPatterns] = useState<Set<KanaExtensionPatternId>>(() => new Set());
  const [pronunciationRevealed, setPronunciationRevealed] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const activeCard = activeTest?.cards[testIndex] ?? null;
  const allPatternsKnown = knownPatterns.size === allEntries.length;
  const hasProgress = knownPatterns.size > 0;

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/stations/${stationSlug}/introduction`, { method: "POST" });

    void fetch(knowledgePath, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Knowledge could not load");
        return response.json() as Promise<{ known?: unknown }>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
        setKnownPatterns(new Set(
          payload.known.filter(
            (patternId): patternId is KanaExtensionPatternId => (
              typeof patternId === "string" && entryIds.has(patternId)
            ),
          ),
        ));
      })
      .catch(() => {
        if (!controller.signal.aborted) setKnowledgeError(true);
      });

    return () => controller.abort();
  }, [entryIds, knowledgePath, stationSlug]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeTest && dialog && !dialog.open) dialog.showModal();
  }, [activeTest]);

  useEffect(() => {
    function dismissStationOptions(event: PointerEvent) {
      const stationOptions = stationOptionsRef.current;
      if (
        stationOptions?.open
        && event.target instanceof Node
        && !stationOptions.contains(event.target)
      ) {
        stationOptions.open = false;
      }
    }

    function closeStationOptionsWithEscape(event: KeyboardEvent) {
      const stationOptions = stationOptionsRef.current;
      if (event.key !== "Escape" || !stationOptions?.open) return;

      stationOptions.open = false;
      stationOptions.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("pointerdown", dismissStationOptions);
    document.addEventListener("keydown", closeStationOptionsWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissStationOptions);
      document.removeEventListener("keydown", closeStationOptionsWithEscape);
    };
  }, []);

  function openTest(title: string, entries: readonly PatternCard[]) {
    stopAudio();
    setKnowledgeError(false);
    setPronunciationRevealed(false);
    setTestIndex(0);
    setActiveTest({ cards: shuffle(entries), title });
  }

  function closeTest() {
    stopAudio();
    dialogRef.current?.close();
    setActiveTest(null);
    setPronunciationRevealed(false);
    setTestIndex(0);
  }

  function activateCard() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    playAudio({ index: 0, src: activeCard.audio });
  }

  function playExample() {
    if (!activeCard) return;
    playAudio({
      beatCount: splitJapaneseMorae(activeCard.example).length,
      index: 1,
      src: activeCard.exampleAudio,
    });
  }

  function answerCard(known: boolean) {
    if (!activeCard || !activeTest) return;

    stopAudio();
    setPronunciationRevealed(false);
    const patternId = activeCard.id;
    const wasKnown = knownPatterns.has(patternId);
    updateKnownState(patternId, known);
    setKnowledgeError(false);

    void fetch(knowledgePath, {
      body: JSON.stringify({ patternId, known }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Knowledge could not save");
    }).catch(() => {
      updateKnownState(patternId, wasKnown);
      setKnowledgeError(true);
    });

    if (testIndex + 1 >= activeTest.cards.length) closeTest();
    else setTestIndex((current) => current + 1);
  }

  function updateKnownState(patternId: KanaExtensionPatternId, known: boolean) {
    setKnownPatterns((current) => {
      const next = new Set(current);
      if (known) next.add(patternId);
      else next.delete(patternId);
      return next;
    });
  }

  async function setAllKnowledge(known: boolean) {
    setBulkKnowledgeAction(known ? "complete" : "reset");
    setKnowledgeError(false);

    try {
      const response = await fetch(knowledgePath, {
        body: JSON.stringify({ known }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Knowledge could not save");

      const payload = await response.json() as { known?: unknown };
      if (!Array.isArray(payload.known)) throw new Error("Knowledge is invalid");
      const nextKnown = payload.known.filter(
        (patternId): patternId is KanaExtensionPatternId => (
          typeof patternId === "string" && entryIds.has(patternId)
        ),
      );
      if (nextKnown.length !== payload.known.length) throw new Error("Knowledge is invalid");

      setKnownPatterns(new Set(nextKnown));
      closeStationOptions();
      if (known) completeDialogRef.current?.close();
      else resetDialogRef.current?.close();
    } catch {
      setKnowledgeError(true);
    } finally {
      setBulkKnowledgeAction(null);
    }
  }

  function closeStationOptions() {
    if (stationOptionsRef.current) stationOptionsRef.current.open = false;
  }

  function renderTestButton(
    title: string,
    entries: readonly PatternCard[],
  ) {
    const knownCount = entries.filter((entry) => knownPatterns.has(entry.id)).length;
    const remainingCount = entries.length - knownCount;
    const testLabel = remainingCount === 0
      ? `Test ${title}. Complete.`
      : `Test ${title}. ${remainingCount} remaining.`;

    return (
      <span className="hiragana-test-trigger-wrap">
        <button
          aria-label={testLabel}
          className="hiragana-test-trigger"
          data-complete={remainingCount === 0 ? "true" : undefined}
          onClick={() => openTest(title, entries)}
          style={{ "--hiragana-test-progress": `${knownCount / entries.length}turn` } as CSSProperties}
          type="button"
        >
          <span className="hiragana-test-progress-text">
            {remainingCount === 0 ? (
              <svg aria-hidden="true" className="hiragana-test-complete-icon" viewBox="0 0 16 16">
                <path d="m3 8.5 3 3 7-7" />
              </svg>
            ) : remainingCount}
          </span>
        </button>
        <span className="network-tooltip hiragana-test-tooltip">{testLabel}</span>
      </span>
    );
  }

  function renderChartCard(entry: PatternCard) {
    const isKnown = knownPatterns.has(entry.id);
    return (
      <button
        aria-label={`Study ${entry.kana}${isKnown ? ", marked known" : ""}`}
        className={`hiragana-button${isKnown ? " hiragana-button-known" : ""}`}
        data-known={isKnown ? "true" : undefined}
        onClick={() => openTest(stationName, [entry])}
        type="button"
      >
        <span lang="ja">{entry.kana}</span>
      </button>
    );
  }

  return (
    <>
      <header className="station-heading">
        <div className="station-heading-row">
          <div aria-label="Lines" className="station-memberships">
            <span className="station-membership station-membership-writing" data-line="writing">
              Kana
            </span>
          </div>
          <div className="station-heading-actions">
            <details className="station-options" ref={stationOptionsRef}>
              <summary aria-label="Station options">
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </summary>
              <div aria-label="Station options" className="station-options-menu">
                <button aria-label="Close station options" className="station-options-close" onClick={closeStationOptions} type="button">
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
                {!allPatternsKnown ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      completeDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg>
                    <span>I know this</span>
                  </button>
                ) : null}
                {hasProgress ? (
                  <button
                    className="station-options-action"
                    disabled={bulkKnowledgeAction !== null}
                    onClick={() => {
                      closeStationOptions();
                      resetDialogRef.current?.showModal();
                    }}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M12.5 5.5A5 5 0 1 0 13 10" /><path d="M12.5 2.5v3h-3" /></svg>
                    <span>Reset station</span>
                  </button>
                ) : null}
              </div>
            </details>
            {renderTestButton(`All ${stationName}`, allEntries)}
          </div>
        </div>
        <h1>{stationName}</h1>
      </header>

      <section className="kana-extensions-guide">
        <audio
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="none"
          ref={audioRef}
        />
        <div className="station-intro kana-extensions-intro">
          {intro}
        </div>

        {chart(renderChartCard)}

        {audioError ? <p className="station-audio-error" role="alert">Audio could not play. Try again.</p> : null}
        {knowledgeError ? <p className="station-knowledge-error" role="alert">Your {stationName} progress could not sync. Try again.</p> : null}

        {activeTest && activeCard ? (
          <dialog
            aria-labelledby={`${stationSlug}-test-title`}
            className="hiragana-test-dialog"
            onCancel={(event) => {
              event.preventDefault();
              closeTest();
            }}
            onClose={() => setActiveTest(null)}
            ref={dialogRef}
          >
            <div className="hiragana-test-modal">
              <header className="hiragana-test-modal-heading">
                <h2 id={`${stationSlug}-test-title`}>{activeTest.title}</h2>
                <button aria-label="Close test" className="hiragana-test-close" onClick={closeTest} type="button"><span aria-hidden="true">×</span></button>
              </header>
              <FlashcardReview
                activationLabel={pronunciationRevealed
                  ? `Replay ${activeCard.kana}`
                  : `Reveal and play ${activeCard.kana}`}
                announcement={pronunciationRevealed
                  ? `${getJapaneseSoundCue(activeCard.kana)}. Example: ${activeCard.example}, ${getJapaneseWordSoundCue(activeCard.example)}, ${activeCard.translation}`
                  : ""}
                key={`${testIndex}-${activeCard.id}`}
                onActivate={activateCard}
                onAnswer={answerCard}
                playing={audioPlaying}
              >
                <FlashcardContent
                  activeAudio={activeAudioIndex === 0
                    ? "pronunciation"
                    : activeAudioIndex === 1 ? "example" : null}
                  activeExampleBeatIndex={activeBeatIndex}
                  example={activeCard.example}
                  examplePronunciation={getJapaneseWordSoundCue(activeCard.example)}
                  kana={activeCard.kana}
                  onPlayExample={playExample}
                  onReveal={activateCard}
                  pronunciation={getJapaneseSoundCue(activeCard.kana)}
                  revealed={pronunciationRevealed}
                  translation={activeCard.translation}
                />
              </FlashcardReview>
            </div>
          </dialog>
        ) : null}

        <dialog aria-labelledby={`${stationSlug}-complete-title`} className="station-confirm-dialog" onCancel={(event) => { event.preventDefault(); completeDialogRef.current?.close(); }} ref={completeDialogRef}>
          <div className="station-confirm-modal">
            <h2 id={`${stationSlug}-complete-title`}>Mark {stationName} complete?</h2>
            <p>This marks all {allEntries.length} patterns in this station as complete and unlocks {nextStation}.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => completeDialogRef.current?.close()} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>Cancel</span></button>
              <button className="hiragana-test-answer hiragana-test-answer-yes" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(true)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg><span>{bulkKnowledgeAction === "complete" ? "Completing…" : "Complete"}</span></button>
            </div>
          </div>
        </dialog>

        <dialog aria-labelledby={`${stationSlug}-reset-title`} className="station-confirm-dialog" onCancel={(event) => { event.preventDefault(); resetDialogRef.current?.close(); }} ref={resetDialogRef}>
          <div className="station-confirm-modal">
            <h2 id={`${stationSlug}-reset-title`}>Reset {stationName}?</h2>
            <p>This marks all {allEntries.length} patterns in this station as incomplete. Later stations stay hidden until {stationName} is complete again.</p>
            <div className="hiragana-test-actions">
              <button className="hiragana-test-answer hiragana-test-answer-no" disabled={bulkKnowledgeAction !== null} onClick={() => resetDialogRef.current?.close()} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>Cancel</span></button>
              <button className="hiragana-test-answer station-confirm-reset" disabled={bulkKnowledgeAction !== null} onClick={() => void setAllKnowledge(false)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="M12.5 5.5A5 5 0 1 0 13 10" /><path d="M12.5 2.5v3h-3" /></svg><span>{bulkKnowledgeAction === "reset" ? "Resetting…" : "Reset"}</span></button>
            </div>
          </div>
        </dialog>
      </section>
    </>
  );
}

type SoundMarksChartProps = {
  readonly renderCard: (entry: PatternCard) => ReactNode;
};

function SoundMarksChart({ renderCard }: SoundMarksChartProps) {
  function cardFor(kana: string) {
    const entry = SOUND_MARK_FLASHCARD_BY_KANA.get(kana);
    if (!entry) throw new Error(`Missing Dakuten & Handakuten flashcard for ${kana}`);
    return renderCard(entry);
  }

  return (
    <div className="kana-extension-charts">
      <section className="kana-extension-chart-section">
        <div aria-label="Dakuten and handakuten marks" className="kana-extension-mark-legend">
          <div>
            <span className="sr-only" lang="ja">゛</span>
            <svg aria-hidden="true" className="kana-extension-mark-glyph" viewBox="0 0 48 48">
              <path d="m13 16 8 14M27 12l8 14" />
            </svg>
            <span>Dakuten</span>
          </div>
          <div>
            <span className="sr-only" lang="ja">゜</span>
            <svg aria-hidden="true" className="kana-extension-mark-glyph" viewBox="0 0 48 48">
              <circle cx="24" cy="22" r="9" />
            </svg>
            <span>Handakuten</span>
          </div>
        </div>
        <table aria-label="All marked Hiragana and Katakana sounds" className="hiragana-table kana-extension-all-sounds-chart">
          <thead>
            <tr>
              {JAPANESE_VOWEL_SOUND_CUES.map((sound) => <th key={sound} scope="col">{sound}</th>)}
            </tr>
          </thead>
          <tbody>
            {MARKED_SOUND_ROWS.flatMap((row, rowIndex) => [
              <tr key={`${rowIndex}-hiragana`}>
                {row.map((cell) => {
                  const sharedGlyph = DUPLICATE_MARKED_KATAKANA.has(cell.katakana);
                  return (
                    <td key={cell.hiragana} rowSpan={sharedGlyph ? 2 : undefined}>
                      {cardFor(cell.hiragana)}
                    </td>
                  );
                })}
              </tr>,
              <tr key={`${rowIndex}-katakana`}>
                {row.filter((cell) => !DUPLICATE_MARKED_KATAKANA.has(cell.katakana)).map((cell) => (
                  <td key={cell.katakana}>
                    {cardFor(cell.katakana)}
                  </td>
                ))}
              </tr>,
            ])}
          </tbody>
        </table>
      </section>
    </div>
  );
}

type CombinedSoundsChartProps = {
  readonly renderCard: (entry: PatternCard) => ReactNode;
};

function CombinedSoundsChart({ renderCard }: CombinedSoundsChartProps) {
  function cardFor(kana: string) {
    const entry = COMBINED_SOUND_FLASHCARD_BY_KANA.get(kana);
    if (!entry) throw new Error(`Missing Yōon flashcard for ${kana}`);
    return renderCard(entry);
  }

  return (
    <div className="kana-extension-charts">
      <section aria-label="Yōon" className="kana-extension-chart-section">
        <table aria-label="All combined Hiragana and Katakana sounds" className="hiragana-table kana-extension-all-sounds-chart">
          <thead>
            <tr>
              {JAPANESE_YOON_VOWEL_SOUND_CUES.map((sound) => <th key={sound} scope="col">{sound}</th>)}
            </tr>
          </thead>
          <tbody>
            {COMBINED_SOUND_ROWS.flatMap((row, rowIndex) => [
              <tr key={`${rowIndex}-hiragana`}>
                {row.map((cell) => (
                  <td key={cell.hiragana}>{cardFor(cell.hiragana)}</td>
                ))}
              </tr>,
              <tr key={`${rowIndex}-katakana`}>
                {row.map((cell) => (
                  <td key={cell.katakana}>{cardFor(cell.katakana)}</td>
                ))}
              </tr>,
            ])}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function shuffle<T>(entries: readonly T[]): T[] {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }
  return shuffled;
}
