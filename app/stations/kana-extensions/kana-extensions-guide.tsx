"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KanaExtensionPatternId } from "@/src/modules/learning/kana-extensions";

type PatternCard = {
  readonly audio: string;
  readonly cue: string;
  readonly example: string;
  readonly exampleAudio: string;
  readonly id: KanaExtensionPatternId;
  readonly kana: string;
  readonly translation: string;
};

type ExtensionChartCell = {
  readonly cue: string;
  readonly hiragana: string;
  readonly katakana: string;
};

const MARKED_SOUND_COLUMNS = ["ah", "ee", "oo", "eh", "oh"] as const;
const DUPLICATE_MARKED_KATAKANA = new Set(["ベ", "ペ"]);
const MARKED_SOUND_ROWS: readonly (readonly ExtensionChartCell[])[] = [
  [
    { cue: "gah", hiragana: "が", katakana: "ガ" },
    { cue: "gee", hiragana: "ぎ", katakana: "ギ" },
    { cue: "goo", hiragana: "ぐ", katakana: "グ" },
    { cue: "geh", hiragana: "げ", katakana: "ゲ" },
    { cue: "goh", hiragana: "ご", katakana: "ゴ" },
  ],
  [
    { cue: "zah", hiragana: "ざ", katakana: "ザ" },
    { cue: "jee", hiragana: "じ", katakana: "ジ" },
    { cue: "zoo", hiragana: "ず", katakana: "ズ" },
    { cue: "zeh", hiragana: "ぜ", katakana: "ゼ" },
    { cue: "zoh", hiragana: "ぞ", katakana: "ゾ" },
  ],
  [
    { cue: "dah", hiragana: "だ", katakana: "ダ" },
    { cue: "jee", hiragana: "ぢ", katakana: "ヂ" },
    { cue: "zoo", hiragana: "づ", katakana: "ヅ" },
    { cue: "deh", hiragana: "で", katakana: "デ" },
    { cue: "doh", hiragana: "ど", katakana: "ド" },
  ],
  [
    { cue: "bah", hiragana: "ば", katakana: "バ" },
    { cue: "bee", hiragana: "び", katakana: "ビ" },
    { cue: "boo", hiragana: "ぶ", katakana: "ブ" },
    { cue: "beh", hiragana: "べ", katakana: "ベ" },
    { cue: "boh", hiragana: "ぼ", katakana: "ボ" },
  ],
  [
    { cue: "pah", hiragana: "ぱ", katakana: "パ" },
    { cue: "pee", hiragana: "ぴ", katakana: "ピ" },
    { cue: "poo", hiragana: "ぷ", katakana: "プ" },
    { cue: "peh", hiragana: "ぺ", katakana: "ペ" },
    { cue: "poh", hiragana: "ぽ", katakana: "ポ" },
  ],
];

const SOUND_MARK_FLASHCARDS: readonly PatternCard[] = [
  { audio: "/audio/ja-ga.wav", cue: "gah", example: "がくせい", exampleAudio: "/audio/ja-gakusei.wav", id: "dakuten-k", kana: "が", translation: "student" },
  { audio: "/audio/ja-marks-gi.wav", cue: "gee", example: "ぎんこう", exampleAudio: "/audio/ja-marks-ginkou.wav", id: "sound-hiragana-gi", kana: "ぎ", translation: "bank" },
  { audio: "/audio/ja-marks-gu.wav", cue: "goo", example: "ぐあい", exampleAudio: "/audio/ja-marks-guai.wav", id: "sound-hiragana-gu", kana: "ぐ", translation: "condition" },
  { audio: "/audio/ja-marks-ge.wav", cue: "geh", example: "げんき", exampleAudio: "/audio/ja-marks-genki.wav", id: "sound-hiragana-ge", kana: "げ", translation: "well" },
  { audio: "/audio/ja-marks-go.wav", cue: "goh", example: "ごはん", exampleAudio: "/audio/ja-marks-gohan.wav", id: "sound-hiragana-go", kana: "ご", translation: "rice" },
  { audio: "/audio/ja-za.wav", cue: "zah", example: "かざん", exampleAudio: "/audio/ja-kazan.wav", id: "dakuten-s", kana: "ざ", translation: "volcano" },
  { audio: "/audio/ja-marks-ji.wav", cue: "jee", example: "じかん", exampleAudio: "/audio/ja-marks-jikan.wav", id: "sound-hiragana-ji", kana: "じ", translation: "time" },
  { audio: "/audio/ja-marks-zu.wav", cue: "zoo", example: "ずぼん", exampleAudio: "/audio/ja-marks-zubon.wav", id: "sound-hiragana-zu", kana: "ず", translation: "trousers" },
  { audio: "/audio/ja-marks-ze.wav", cue: "zeh", example: "ぜんぶ", exampleAudio: "/audio/ja-marks-zenbu.wav", id: "sound-hiragana-ze", kana: "ぜ", translation: "all" },
  { audio: "/audio/ja-marks-zo.wav", cue: "zoh", example: "ぞう", exampleAudio: "/audio/ja-marks-zou.wav", id: "sound-hiragana-zo", kana: "ぞ", translation: "elephant" },
  { audio: "/audio/ja-da.wav", cue: "dah", example: "くだもの", exampleAudio: "/audio/ja-kudamono.wav", id: "dakuten-t", kana: "だ", translation: "fruit" },
  { audio: "/audio/ja-marks-di.wav", cue: "jee", example: "はなぢ", exampleAudio: "/audio/ja-marks-hanadi.wav", id: "sound-hiragana-di", kana: "ぢ", translation: "nosebleed" },
  { audio: "/audio/ja-marks-du.wav", cue: "zoo", example: "つづく", exampleAudio: "/audio/ja-marks-tsuzuku.wav", id: "sound-hiragana-du", kana: "づ", translation: "to continue" },
  { audio: "/audio/ja-marks-de.wav", cue: "deh", example: "でんしゃ", exampleAudio: "/audio/ja-marks-densha.wav", id: "sound-hiragana-de", kana: "で", translation: "train" },
  { audio: "/audio/ja-marks-do.wav", cue: "doh", example: "どうぶつ", exampleAudio: "/audio/ja-marks-doubutsu.wav", id: "sound-hiragana-do", kana: "ど", translation: "animal" },
  { audio: "/audio/ja-ba.wav", cue: "bah", example: "かばん", exampleAudio: "/audio/ja-kaban.wav", id: "dakuten-h", kana: "ば", translation: "bag" },
  { audio: "/audio/ja-marks-bi.wav", cue: "bee", example: "びょういん", exampleAudio: "/audio/ja-marks-byouin.wav", id: "sound-hiragana-bi", kana: "び", translation: "hospital" },
  { audio: "/audio/ja-marks-bu.wav", cue: "boo", example: "ぶた", exampleAudio: "/audio/ja-marks-buta.wav", id: "sound-hiragana-bu", kana: "ぶ", translation: "pig" },
  { audio: "/audio/ja-marks-be.wav", cue: "beh", example: "べんとう", exampleAudio: "/audio/ja-marks-bentou.wav", id: "sound-hiragana-be", kana: "べ", translation: "boxed lunch" },
  { audio: "/audio/ja-marks-bo.wav", cue: "boh", example: "ぼうし", exampleAudio: "/audio/ja-marks-boushi.wav", id: "sound-hiragana-bo", kana: "ぼ", translation: "hat" },
  { audio: "/audio/ja-pa.wav", cue: "pah", example: "ぱん", exampleAudio: "/audio/ja-pan.wav", id: "handakuten-h", kana: "ぱ", translation: "bread" },
  { audio: "/audio/ja-marks-pi.wav", cue: "pee", example: "ぴかぴか", exampleAudio: "/audio/ja-marks-pikapika.wav", id: "sound-hiragana-pi", kana: "ぴ", translation: "sparkling" },
  { audio: "/audio/ja-marks-pu.wav", cue: "poo", example: "ぷりん", exampleAudio: "/audio/ja-marks-purin.wav", id: "sound-hiragana-pu", kana: "ぷ", translation: "pudding" },
  { audio: "/audio/ja-marks-pe.wav", cue: "peh", example: "ぺん", exampleAudio: "/audio/ja-marks-pen-hiragana.wav", id: "sound-hiragana-pe", kana: "ぺ", translation: "pen" },
  { audio: "/audio/ja-marks-po.wav", cue: "poh", example: "ぽすと", exampleAudio: "/audio/ja-marks-posuto-hiragana.wav", id: "sound-hiragana-po", kana: "ぽ", translation: "mailbox" },
  { audio: "/audio/ja-ga.wav", cue: "gah", example: "ガラス", exampleAudio: "/audio/ja-marks-garasu.wav", id: "sound-katakana-ga", kana: "ガ", translation: "glass" },
  { audio: "/audio/ja-marks-gi.wav", cue: "gee", example: "ギター", exampleAudio: "/audio/ja-marks-gitaa.wav", id: "sound-katakana-gi", kana: "ギ", translation: "guitar" },
  { audio: "/audio/ja-marks-gu.wav", cue: "goo", example: "グラス", exampleAudio: "/audio/ja-marks-gurasu.wav", id: "sound-katakana-gu", kana: "グ", translation: "drinking glass" },
  { audio: "/audio/ja-marks-ge.wav", cue: "geh", example: "ゲーム", exampleAudio: "/audio/ja-marks-geemu.wav", id: "sound-katakana-ge", kana: "ゲ", translation: "game" },
  { audio: "/audio/ja-marks-go.wav", cue: "goh", example: "ゴルフ", exampleAudio: "/audio/ja-marks-gorufu.wav", id: "sound-katakana-go", kana: "ゴ", translation: "golf" },
  { audio: "/audio/ja-za.wav", cue: "zah", example: "ザック", exampleAudio: "/audio/ja-marks-zakku.wav", id: "sound-katakana-za", kana: "ザ", translation: "backpack" },
  { audio: "/audio/ja-marks-ji.wav", cue: "jee", example: "ジャム", exampleAudio: "/audio/ja-marks-jamu.wav", id: "sound-katakana-ji", kana: "ジ", translation: "jam" },
  { audio: "/audio/ja-marks-zu.wav", cue: "zoo", example: "ズーム", exampleAudio: "/audio/ja-marks-zuumu.wav", id: "sound-katakana-zu", kana: "ズ", translation: "zoom" },
  { audio: "/audio/ja-marks-ze.wav", cue: "zeh", example: "ゼリー", exampleAudio: "/audio/ja-marks-zerii.wav", id: "sound-katakana-ze", kana: "ゼ", translation: "jelly" },
  { audio: "/audio/ja-marks-zo.wav", cue: "zoh", example: "ゾンビ", exampleAudio: "/audio/ja-marks-zonbi.wav", id: "sound-katakana-zo", kana: "ゾ", translation: "zombie" },
  { audio: "/audio/ja-da.wav", cue: "dah", example: "ダンス", exampleAudio: "/audio/ja-marks-dansu.wav", id: "sound-katakana-da", kana: "ダ", translation: "dance" },
  { audio: "/audio/ja-marks-di.wav", cue: "jee", example: "チヂミ", exampleAudio: "/audio/ja-marks-chijimi.wav", id: "sound-katakana-di", kana: "ヂ", translation: "Korean pancake" },
  { audio: "/audio/ja-marks-du.wav", cue: "zoo", example: "ヅラ", exampleAudio: "/audio/ja-marks-zura.wav", id: "sound-katakana-du", kana: "ヅ", translation: "wig" },
  { audio: "/audio/ja-marks-de.wav", cue: "deh", example: "デザート", exampleAudio: "/audio/ja-marks-dezaato.wav", id: "sound-katakana-de", kana: "デ", translation: "dessert" },
  { audio: "/audio/ja-marks-do.wav", cue: "doh", example: "ドア", exampleAudio: "/audio/ja-marks-doa.wav", id: "sound-katakana-do", kana: "ド", translation: "door" },
  { audio: "/audio/ja-ba.wav", cue: "bah", example: "バス", exampleAudio: "/audio/ja-marks-basu.wav", id: "sound-katakana-ba", kana: "バ", translation: "bus" },
  { audio: "/audio/ja-marks-bi.wav", cue: "bee", example: "ビル", exampleAudio: "/audio/ja-marks-biru.wav", id: "sound-katakana-bi", kana: "ビ", translation: "building" },
  { audio: "/audio/ja-marks-bu.wav", cue: "boo", example: "ブラシ", exampleAudio: "/audio/ja-marks-burashi.wav", id: "sound-katakana-bu", kana: "ブ", translation: "brush" },
  { audio: "/audio/ja-marks-bo.wav", cue: "boh", example: "ボタン", exampleAudio: "/audio/ja-marks-botan.wav", id: "sound-katakana-bo", kana: "ボ", translation: "button" },
  { audio: "/audio/ja-pa.wav", cue: "pah", example: "パン", exampleAudio: "/audio/ja-katakana-pan.wav", id: "sound-katakana-pa", kana: "パ", translation: "bread" },
  { audio: "/audio/ja-marks-pi.wav", cue: "pee", example: "ピアノ", exampleAudio: "/audio/ja-marks-piano.wav", id: "sound-katakana-pi", kana: "ピ", translation: "piano" },
  { audio: "/audio/ja-marks-pu.wav", cue: "poo", example: "プール", exampleAudio: "/audio/ja-marks-puuru.wav", id: "sound-katakana-pu", kana: "プ", translation: "pool" },
  { audio: "/audio/ja-marks-po.wav", cue: "poh", example: "ポスト", exampleAudio: "/audio/ja-marks-posuto.wav", id: "sound-katakana-po", kana: "ポ", translation: "mailbox" },
];

const SOUND_MARK_FLASHCARD_BY_KANA = new Map(
  SOUND_MARK_FLASHCARDS.map((entry) => [entry.kana, entry]),
);

const COMBINED_SOUND_COLUMNS = ["ah", "oo", "oh"] as const;
const COMBINED_SOUND_ROWS: readonly (readonly ExtensionChartCell[])[] = [
  [{ cue: "kyah", hiragana: "きゃ", katakana: "キャ" }, { cue: "kyoo", hiragana: "きゅ", katakana: "キュ" }, { cue: "kyoh", hiragana: "きょ", katakana: "キョ" }],
  [{ cue: "shah", hiragana: "しゃ", katakana: "シャ" }, { cue: "shoo", hiragana: "しゅ", katakana: "シュ" }, { cue: "shoh", hiragana: "しょ", katakana: "ショ" }],
  [{ cue: "chah", hiragana: "ちゃ", katakana: "チャ" }, { cue: "choo", hiragana: "ちゅ", katakana: "チュ" }, { cue: "choh", hiragana: "ちょ", katakana: "チョ" }],
  [{ cue: "nyah", hiragana: "にゃ", katakana: "ニャ" }, { cue: "nyoo", hiragana: "にゅ", katakana: "ニュ" }, { cue: "nyoh", hiragana: "にょ", katakana: "ニョ" }],
  [{ cue: "hyah", hiragana: "ひゃ", katakana: "ヒャ" }, { cue: "hyoo", hiragana: "ひゅ", katakana: "ヒュ" }, { cue: "hyoh", hiragana: "ひょ", katakana: "ヒョ" }],
  [{ cue: "myah", hiragana: "みゃ", katakana: "ミャ" }, { cue: "myoo", hiragana: "みゅ", katakana: "ミュ" }, { cue: "myoh", hiragana: "みょ", katakana: "ミョ" }],
  [{ cue: "ryah", hiragana: "りゃ", katakana: "リャ" }, { cue: "ryoo", hiragana: "りゅ", katakana: "リュ" }, { cue: "ryoh", hiragana: "りょ", katakana: "リョ" }],
  [{ cue: "gyah", hiragana: "ぎゃ", katakana: "ギャ" }, { cue: "gyoo", hiragana: "ぎゅ", katakana: "ギュ" }, { cue: "gyoh", hiragana: "ぎょ", katakana: "ギョ" }],
  [{ cue: "jah", hiragana: "じゃ", katakana: "ジャ" }, { cue: "joo", hiragana: "じゅ", katakana: "ジュ" }, { cue: "joh", hiragana: "じょ", katakana: "ジョ" }],
  [{ cue: "byah", hiragana: "びゃ", katakana: "ビャ" }, { cue: "byoo", hiragana: "びゅ", katakana: "ビュ" }, { cue: "byoh", hiragana: "びょ", katakana: "ビョ" }],
  [{ cue: "pyah", hiragana: "ぴゃ", katakana: "ピャ" }, { cue: "pyoo", hiragana: "ぴゅ", katakana: "ピュ" }, { cue: "pyoh", hiragana: "ぴょ", katakana: "ピョ" }],
];

const COMBINED_SOUND_FLASHCARDS: readonly PatternCard[] = [
  { audio: "/audio/ja-yoon-kya.wav", cue: "kyah", example: "きゃく", exampleAudio: "/audio/ja-yoon-hiragana-kya.wav", id: "small-kya", kana: "きゃ", translation: "guest" },
  { audio: "/audio/ja-yoon-kyu.wav", cue: "kyoo", example: "きゅう", exampleAudio: "/audio/ja-yoon-hiragana-kyu.wav", id: "yoon-hiragana-kyu", kana: "きゅ", translation: "nine" },
  { audio: "/audio/ja-yoon-kyo.wav", cue: "kyoh", example: "きょう", exampleAudio: "/audio/ja-yoon-hiragana-kyo.wav", id: "yoon-hiragana-kyo", kana: "きょ", translation: "today" },
  { audio: "/audio/ja-yoon-sha.wav", cue: "shah", example: "しゃしん", exampleAudio: "/audio/ja-yoon-hiragana-sha.wav", id: "yoon-hiragana-sha", kana: "しゃ", translation: "photograph" },
  { audio: "/audio/ja-yoon-shu.wav", cue: "shoo", example: "しゅみ", exampleAudio: "/audio/ja-yoon-hiragana-shu.wav", id: "small-shu", kana: "しゅ", translation: "hobby" },
  { audio: "/audio/ja-yoon-sho.wav", cue: "shoh", example: "しょくじ", exampleAudio: "/audio/ja-yoon-hiragana-sho.wav", id: "yoon-hiragana-sho", kana: "しょ", translation: "meal" },
  { audio: "/audio/ja-yoon-cha.wav", cue: "chah", example: "おちゃ", exampleAudio: "/audio/ja-yoon-hiragana-cha.wav", id: "yoon-hiragana-cha", kana: "ちゃ", translation: "tea" },
  { audio: "/audio/ja-yoon-chu.wav", cue: "choo", example: "ちゅうい", exampleAudio: "/audio/ja-yoon-hiragana-chu.wav", id: "yoon-hiragana-chu", kana: "ちゅ", translation: "caution" },
  { audio: "/audio/ja-yoon-cho.wav", cue: "choh", example: "ちょきん", exampleAudio: "/audio/ja-yoon-hiragana-cho.wav", id: "small-cho", kana: "ちょ", translation: "savings" },
  { audio: "/audio/ja-yoon-nya.wav", cue: "nyah", example: "にゃんこ", exampleAudio: "/audio/ja-yoon-hiragana-nya.wav", id: "yoon-hiragana-nya", kana: "にゃ", translation: "kitty" },
  { audio: "/audio/ja-yoon-nyu.wav", cue: "nyoo", example: "にゅうがく", exampleAudio: "/audio/ja-yoon-hiragana-nyu.wav", id: "small-nyu", kana: "にゅ", translation: "school admission" },
  { audio: "/audio/ja-yoon-nyo.wav", cue: "nyoh", example: "にょろにょろ", exampleAudio: "/audio/ja-yoon-hiragana-nyo.wav", id: "yoon-hiragana-nyo", kana: "にょ", translation: "slithering" },
  { audio: "/audio/ja-yoon-hya.wav", cue: "hyah", example: "ひゃく", exampleAudio: "/audio/ja-yoon-hiragana-hya.wav", id: "yoon-hiragana-hya", kana: "ひゃ", translation: "hundred" },
  { audio: "/audio/ja-yoon-hyu.wav", cue: "hyoo", example: "ひゅうひゅう", exampleAudio: "/audio/ja-yoon-hiragana-hyu.wav", id: "yoon-hiragana-hyu", kana: "ひゅ", translation: "whistling" },
  { audio: "/audio/ja-yoon-hyo.wav", cue: "hyoh", example: "ひょう", exampleAudio: "/audio/ja-yoon-hiragana-hyo.wav", id: "yoon-hiragana-hyo", kana: "ひょ", translation: "leopard" },
  { audio: "/audio/ja-yoon-mya.wav", cue: "myah", example: "みゃく", exampleAudio: "/audio/ja-yoon-hiragana-mya.wav", id: "yoon-hiragana-mya", kana: "みゃ", translation: "pulse" },
  { audio: "/audio/ja-yoon-myu.wav", cue: "myoo", example: "みゅーじっく", exampleAudio: "/audio/ja-yoon-hiragana-myu.wav", id: "yoon-hiragana-myu", kana: "みゅ", translation: "music" },
  { audio: "/audio/ja-yoon-myo.wav", cue: "myoh", example: "みょうじ", exampleAudio: "/audio/ja-yoon-hiragana-myo.wav", id: "yoon-hiragana-myo", kana: "みょ", translation: "surname" },
  { audio: "/audio/ja-yoon-rya.wav", cue: "ryah", example: "りゃく", exampleAudio: "/audio/ja-yoon-hiragana-rya.wav", id: "yoon-hiragana-rya", kana: "りゃ", translation: "abbreviation" },
  { audio: "/audio/ja-yoon-ryu.wav", cue: "ryoo", example: "りゅう", exampleAudio: "/audio/ja-yoon-hiragana-ryu.wav", id: "yoon-hiragana-ryu", kana: "りゅ", translation: "dragon" },
  { audio: "/audio/ja-yoon-ryo.wav", cue: "ryoh", example: "りょこう", exampleAudio: "/audio/ja-yoon-hiragana-ryo.wav", id: "small-ryo", kana: "りょ", translation: "travel" },
  { audio: "/audio/ja-yoon-gya.wav", cue: "gyah", example: "ぎゃく", exampleAudio: "/audio/ja-yoon-hiragana-gya.wav", id: "yoon-hiragana-gya", kana: "ぎゃ", translation: "opposite" },
  { audio: "/audio/ja-yoon-gyu.wav", cue: "gyoo", example: "ぎゅうにゅう", exampleAudio: "/audio/ja-yoon-hiragana-gyu.wav", id: "yoon-hiragana-gyu", kana: "ぎゅ", translation: "milk" },
  { audio: "/audio/ja-yoon-gyo.wav", cue: "gyoh", example: "ぎょかい", exampleAudio: "/audio/ja-yoon-hiragana-gyo.wav", id: "yoon-hiragana-gyo", kana: "ぎょ", translation: "fishing industry" },
  { audio: "/audio/ja-yoon-ja.wav", cue: "jah", example: "じゃま", exampleAudio: "/audio/ja-yoon-hiragana-ja.wav", id: "yoon-hiragana-ja", kana: "じゃ", translation: "obstruction" },
  { audio: "/audio/ja-yoon-ju.wav", cue: "joo", example: "じゅぎょう", exampleAudio: "/audio/ja-yoon-hiragana-ju.wav", id: "yoon-hiragana-ju", kana: "じゅ", translation: "class" },
  { audio: "/audio/ja-yoon-jo.wav", cue: "joh", example: "じょせい", exampleAudio: "/audio/ja-yoon-hiragana-jo.wav", id: "yoon-hiragana-jo", kana: "じょ", translation: "woman" },
  { audio: "/audio/ja-yoon-bya.wav", cue: "byah", example: "びゃくや", exampleAudio: "/audio/ja-yoon-hiragana-bya.wav", id: "yoon-hiragana-bya", kana: "びゃ", translation: "midnight sun" },
  { audio: "/audio/ja-yoon-byu.wav", cue: "byoo", example: "びゅうびゅう", exampleAudio: "/audio/ja-yoon-hiragana-byu.wav", id: "yoon-hiragana-byu", kana: "びゅ", translation: "howling wind" },
  { audio: "/audio/ja-yoon-byo.wav", cue: "byoh", example: "びょういん", exampleAudio: "/audio/ja-yoon-hiragana-byo.wav", id: "yoon-hiragana-byo", kana: "びょ", translation: "hospital" },
  { audio: "/audio/ja-yoon-pya.wav", cue: "pyah", example: "ぴゃっと", exampleAudio: "/audio/ja-yoon-hiragana-pya.wav", id: "yoon-hiragana-pya", kana: "ぴゃ", translation: "in a flash" },
  { audio: "/audio/ja-yoon-pyu.wav", cue: "pyoo", example: "ぴゅあ", exampleAudio: "/audio/ja-yoon-hiragana-pyu.wav", id: "yoon-hiragana-pyu", kana: "ぴゅ", translation: "pure" },
  { audio: "/audio/ja-yoon-pyo.wav", cue: "pyoh", example: "ぴょん", exampleAudio: "/audio/ja-yoon-hiragana-pyo.wav", id: "yoon-hiragana-pyo", kana: "ぴょ", translation: "hop" },
  { audio: "/audio/ja-yoon-kya.wav", cue: "kyah", example: "キャベツ", exampleAudio: "/audio/ja-yoon-katakana-kya.wav", id: "yoon-katakana-kya", kana: "キャ", translation: "cabbage" },
  { audio: "/audio/ja-yoon-kyu.wav", cue: "kyoo", example: "キューブ", exampleAudio: "/audio/ja-yoon-katakana-kyu.wav", id: "yoon-katakana-kyu", kana: "キュ", translation: "cube" },
  { audio: "/audio/ja-yoon-kyo.wav", cue: "kyoh", example: "キョロキョロ", exampleAudio: "/audio/ja-yoon-katakana-kyo.wav", id: "yoon-katakana-kyo", kana: "キョ", translation: "looking around" },
  { audio: "/audio/ja-yoon-sha.wav", cue: "shah", example: "シャツ", exampleAudio: "/audio/ja-yoon-katakana-sha.wav", id: "yoon-katakana-sha", kana: "シャ", translation: "shirt" },
  { audio: "/audio/ja-yoon-shu.wav", cue: "shoo", example: "シュート", exampleAudio: "/audio/ja-yoon-katakana-shu.wav", id: "yoon-katakana-shu", kana: "シュ", translation: "shot" },
  { audio: "/audio/ja-yoon-sho.wav", cue: "shoh", example: "ショップ", exampleAudio: "/audio/ja-yoon-katakana-sho.wav", id: "yoon-katakana-sho", kana: "ショ", translation: "shop" },
  { audio: "/audio/ja-yoon-cha.wav", cue: "chah", example: "チャンス", exampleAudio: "/audio/ja-yoon-katakana-cha.wav", id: "yoon-katakana-cha", kana: "チャ", translation: "chance" },
  { audio: "/audio/ja-yoon-chu.wav", cue: "choo", example: "チューブ", exampleAudio: "/audio/ja-yoon-katakana-chu.wav", id: "yoon-katakana-chu", kana: "チュ", translation: "tube" },
  { audio: "/audio/ja-yoon-cho.wav", cue: "choh", example: "チョコ", exampleAudio: "/audio/ja-yoon-katakana-cho.wav", id: "yoon-katakana-cho", kana: "チョ", translation: "chocolate" },
  { audio: "/audio/ja-yoon-nya.wav", cue: "nyah", example: "ニャンコ", exampleAudio: "/audio/ja-yoon-katakana-nya.wav", id: "yoon-katakana-nya", kana: "ニャ", translation: "kitty" },
  { audio: "/audio/ja-yoon-nyu.wav", cue: "nyoo", example: "ニュース", exampleAudio: "/audio/ja-yoon-katakana-nyu.wav", id: "yoon-katakana-nyu", kana: "ニュ", translation: "news" },
  { audio: "/audio/ja-yoon-nyo.wav", cue: "nyoh", example: "ニョロニョロ", exampleAudio: "/audio/ja-yoon-katakana-nyo.wav", id: "yoon-katakana-nyo", kana: "ニョ", translation: "slithering" },
  { audio: "/audio/ja-yoon-hya.wav", cue: "hyah", example: "ヒャッハー", exampleAudio: "/audio/ja-yoon-katakana-hya.wav", id: "yoon-katakana-hya", kana: "ヒャ", translation: "woo-hoo" },
  { audio: "/audio/ja-yoon-hyu.wav", cue: "hyoo", example: "ヒューマン", exampleAudio: "/audio/ja-yoon-katakana-hyu.wav", id: "yoon-katakana-hyu", kana: "ヒュ", translation: "human" },
  { audio: "/audio/ja-yoon-hyo.wav", cue: "hyoh", example: "ヒョウ", exampleAudio: "/audio/ja-yoon-katakana-hyo.wav", id: "yoon-katakana-hyo", kana: "ヒョ", translation: "leopard" },
  { audio: "/audio/ja-yoon-mya.wav", cue: "myah", example: "ミャンマー", exampleAudio: "/audio/ja-yoon-katakana-mya.wav", id: "yoon-katakana-mya", kana: "ミャ", translation: "Myanmar" },
  { audio: "/audio/ja-yoon-myu.wav", cue: "myoo", example: "ミュージック", exampleAudio: "/audio/ja-yoon-katakana-myu.wav", id: "yoon-katakana-myu", kana: "ミュ", translation: "music" },
  { audio: "/audio/ja-yoon-myo.wav", cue: "myoh", example: "ミョウジ", exampleAudio: "/audio/ja-yoon-katakana-myo.wav", id: "yoon-katakana-myo", kana: "ミョ", translation: "surname" },
  { audio: "/audio/ja-yoon-rya.wav", cue: "ryah", example: "リャク", exampleAudio: "/audio/ja-yoon-katakana-rya.wav", id: "yoon-katakana-rya", kana: "リャ", translation: "abbreviation" },
  { audio: "/audio/ja-yoon-ryu.wav", cue: "ryoo", example: "リュック", exampleAudio: "/audio/ja-yoon-katakana-ryu.wav", id: "yoon-katakana-ryu", kana: "リュ", translation: "backpack" },
  { audio: "/audio/ja-yoon-ryo.wav", cue: "ryoh", example: "リョウリ", exampleAudio: "/audio/ja-yoon-katakana-ryo.wav", id: "yoon-katakana-ryo", kana: "リョ", translation: "cooking" },
  { audio: "/audio/ja-yoon-gya.wav", cue: "gyah", example: "ギャップ", exampleAudio: "/audio/ja-yoon-katakana-gya.wav", id: "yoon-katakana-gya", kana: "ギャ", translation: "gap" },
  { audio: "/audio/ja-yoon-gyu.wav", cue: "gyoo", example: "ギュッ", exampleAudio: "/audio/ja-yoon-katakana-gyu.wav", id: "yoon-katakana-gyu", kana: "ギュ", translation: "squeeze" },
  { audio: "/audio/ja-yoon-gyo.wav", cue: "gyoh", example: "ギョーザ", exampleAudio: "/audio/ja-yoon-katakana-gyo.wav", id: "yoon-katakana-gyo", kana: "ギョ", translation: "dumpling" },
  { audio: "/audio/ja-yoon-ja.wav", cue: "jah", example: "ジャム", exampleAudio: "/audio/ja-yoon-katakana-ja.wav", id: "yoon-katakana-ja", kana: "ジャ", translation: "jam" },
  { audio: "/audio/ja-yoon-ju.wav", cue: "joo", example: "ジュース", exampleAudio: "/audio/ja-yoon-katakana-ju.wav", id: "yoon-katakana-ju", kana: "ジュ", translation: "juice" },
  { audio: "/audio/ja-yoon-jo.wav", cue: "joh", example: "ジョギング", exampleAudio: "/audio/ja-yoon-katakana-jo.wav", id: "yoon-katakana-jo", kana: "ジョ", translation: "jogging" },
  { audio: "/audio/ja-yoon-bya.wav", cue: "byah", example: "ビャクヤ", exampleAudio: "/audio/ja-yoon-katakana-bya.wav", id: "yoon-katakana-bya", kana: "ビャ", translation: "midnight sun" },
  { audio: "/audio/ja-yoon-byu.wav", cue: "byoo", example: "ビュッフェ", exampleAudio: "/audio/ja-yoon-katakana-byu.wav", id: "yoon-katakana-byu", kana: "ビュ", translation: "buffet" },
  { audio: "/audio/ja-yoon-byo.wav", cue: "byoh", example: "ビョウイン", exampleAudio: "/audio/ja-yoon-katakana-byo.wav", id: "yoon-katakana-byo", kana: "ビョ", translation: "hospital" },
  { audio: "/audio/ja-yoon-pya.wav", cue: "pyah", example: "ピャッ", exampleAudio: "/audio/ja-yoon-katakana-pya.wav", id: "yoon-katakana-pya", kana: "ピャ", translation: "in a flash" },
  { audio: "/audio/ja-yoon-pyu.wav", cue: "pyoo", example: "ピュア", exampleAudio: "/audio/ja-yoon-katakana-pyu.wav", id: "yoon-katakana-pyu", kana: "ピュ", translation: "pure" },
  { audio: "/audio/ja-yoon-pyo.wav", cue: "pyoh", example: "ピョン", exampleAudio: "/audio/ja-yoon-katakana-pyo.wav", id: "yoon-katakana-pyo", kana: "ピョ", translation: "hop" },
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completeDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const resetDialogRef = useRef<HTMLDialogElement | null>(null);
  const stationOptionsRef = useRef<HTMLDetailsElement | null>(null);
  const [activeTest, setActiveTest] = useState<ExtensionTest | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
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

  async function playAudio(src: string) {
    setAudioError(false);
    setAudioPlaying(false);
    const audio = audioRef.current;
    if (!audio) {
      setAudioError(true);
      return;
    }

    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch {
      setAudioError(true);
      setAudioPlaying(false);
    }
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudioPlaying(false);
  }

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

  function revealPronunciation() {
    if (!activeCard) return;
    setPronunciationRevealed(true);
    void playAudio(activeCard.audio);
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
          onEnded={() => setAudioPlaying(false)}
          onError={() => {
            setAudioError(true);
            setAudioPlaying(false);
          }}
          onPause={() => setAudioPlaying(false)}
          onPlaying={() => setAudioPlaying(true)}
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
              <div
                className="hiragana-test-card hiragana-test-card-with-example"
                data-playing={audioPlaying ? "true" : undefined}
              >
                <span aria-hidden="true" className="hiragana-test-playing-indicator"><span /><span /><span /></span>
                <button
                  aria-label={`Play ${activeCard.kana} and reveal the pronunciation`}
                  className="hiragana-test-reveal"
                  onClick={revealPronunciation}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="hiragana-test-pronunciation"
                    data-revealed={pronunciationRevealed ? "true" : undefined}
                  >
                    {pronunciationRevealed ? activeCard.cue : "\u00a0"}
                  </span>
                  <span className="hiragana-test-card-kana" lang="ja">{activeCard.kana}</span>
                </button>
                <button
                  aria-label={`Play example word ${activeCard.example}`}
                  className="hiragana-test-example"
                  onClick={() => void playAudio(activeCard.exampleAudio)}
                  type="button"
                >
                  <span className="hiragana-test-example-word" lang="ja">{activeCard.example}</span>
                  <span
                    aria-hidden={!pronunciationRevealed}
                    className="hiragana-test-example-translation"
                    data-revealed={pronunciationRevealed ? "true" : undefined}
                  >
                    {activeCard.translation}
                  </span>
                </button>
              </div>
              <span aria-live="polite" className="sr-only">
                {pronunciationRevealed
                  ? `${activeCard.cue}. Example: ${activeCard.example}, ${activeCard.translation}`
                  : ""}
              </span>
              <p className="hiragana-test-instruction">Say the sound, then tap the Kana to reveal the pronunciation and translation.</p>
              <div className="hiragana-test-actions">
                <button className="hiragana-test-answer hiragana-test-answer-no" onClick={() => answerCard(false)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m4 4 8 8M12 4l-8 8" /></svg><span>No</span></button>
                <button className="hiragana-test-answer hiragana-test-answer-yes" onClick={() => answerCard(true)} type="button"><svg aria-hidden="true" className="hiragana-test-answer-icon" viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg><span>Yes</span></button>
              </div>
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
              {MARKED_SOUND_COLUMNS.map((sound) => <th key={sound} scope="col">{sound}</th>)}
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
              {COMBINED_SOUND_COLUMNS.map((sound) => <th key={sound} scope="col">{sound}</th>)}
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
