export const JAPANESE_VOWEL_SOUND_CUES = ["ah", "ee", "oo", "eh", "oh"] as const;
export const JAPANESE_YOON_VOWEL_SOUND_CUES = ["ah", "oo", "oh"] as const;

const BASIC_KANA_SOUND_CUES: Readonly<Record<string, string>> = {
  あ: "ah",
  い: "ee",
  う: "oo",
  え: "eh",
  お: "oh",
  か: "kah",
  き: "kee",
  く: "koo",
  け: "keh",
  こ: "koh",
  さ: "sah",
  し: "shee",
  す: "soo",
  せ: "seh",
  そ: "soh",
  た: "tah",
  ち: "chee",
  つ: "tsoo",
  て: "teh",
  と: "toh",
  な: "nah",
  に: "nee",
  ぬ: "noo",
  ね: "neh",
  の: "noh",
  は: "hah",
  ひ: "hee",
  ふ: "foo",
  へ: "heh",
  ほ: "hoh",
  ま: "mah",
  み: "mee",
  む: "moo",
  め: "meh",
  も: "moh",
  や: "yah",
  ゆ: "yoo",
  よ: "yoh",
  ら: "rah",
  り: "ree",
  る: "roo",
  れ: "reh",
  ろ: "roh",
  わ: "wah",
  を: "oh",
  ん: "nn",
  が: "gah",
  ぎ: "gee",
  ぐ: "goo",
  げ: "geh",
  ご: "goh",
  ざ: "zah",
  じ: "jee",
  ず: "zoo",
  ぜ: "zeh",
  ぞ: "zoh",
  だ: "dah",
  ぢ: "jee",
  づ: "zoo",
  で: "deh",
  ど: "doh",
  ば: "bah",
  び: "bee",
  ぶ: "boo",
  べ: "beh",
  ぼ: "boh",
  ぱ: "pah",
  ぴ: "pee",
  ぷ: "poo",
  ぺ: "peh",
  ぽ: "poh",
};

const YOON_SOUND_CUE_ONSETS: Readonly<Record<string, string>> = {
  き: "ky",
  し: "sh",
  ち: "ch",
  に: "ny",
  ひ: "hy",
  み: "my",
  り: "ry",
  ぎ: "gy",
  じ: "j",
  び: "by",
  ぴ: "py",
};

const YOON_SOUND_CUE_VOWELS: Readonly<Record<string, string>> = {
  ゃ: "ah",
  ゅ: "oo",
  ょ: "oh",
};

export function getJapaneseSoundCue(kana: string): string {
  const hiragana = toHiragana(kana);
  const basic = BASIC_KANA_SOUND_CUES[hiragana];
  if (basic) return basic;

  const characters = [...hiragana];
  if (characters.length === 2) {
    const onset = YOON_SOUND_CUE_ONSETS[characters[0]];
    const vowel = YOON_SOUND_CUE_VOWELS[characters[1]];
    if (onset && vowel) return `${onset}${vowel}`;
  }

  throw new Error(`Missing sound cue for ${kana}`);
}

export function getJapaneseWordSoundCue(word: string): string {
  const morae = splitJapaneseMorae(toHiragana(word));
  return getJapaneseMoraSoundCues(word)
    .map((soundCue, index) => (
      `${getJapaneseMoraSoundCueSeparator(morae, index)}${soundCue}`
    ))
    .join("");
}

export function getJapaneseMoraSoundCues(word: string): string[] {
  const morae = splitJapaneseMorae(toHiragana(word));

  return morae.map((mora, index) => {
    if (mora === "ー") {
      if (index === 0) throw new Error(`Long sound mark has no sound to extend in ${word}`);
      return "—";
    }

    if (mora === "っ") {
      const nextMora = morae[index + 1];
      if (!nextMora || nextMora === "ー" || nextMora === "っ") return "’";
      return `${getHeldConsonant(getJapaneseSoundCue(nextMora))}-`;
    }

    return getJapaneseSoundCue(mora);
  });
}

export function getJapaneseMoraSoundCueSeparator(
  morae: readonly string[],
  index: number,
): "" | " " {
  if (index === 0) return "";

  const currentMora = toHiragana(morae[index] ?? "");
  const previousMora = toHiragana(morae[index - 1] ?? "");
  return currentMora === "っ" || previousMora === "っ" || currentMora === "ー"
    ? ""
    : " ";
}

export function splitJapaneseMorae(word: string): string[] {
  const morae: string[] = [];

  for (const character of word) {
    if ("ゃゅょぁぃぅぇぉャュョァィゥェォ".includes(character) && morae.length > 0) {
      morae[morae.length - 1] = `${morae[morae.length - 1]}${character}`;
    } else {
      morae.push(character);
    }
  }

  return morae;
}

function getHeldConsonant(nextCue: string): string {
  if (nextCue.startsWith("ch")) return "t";
  if (nextCue.startsWith("sh")) return "s";
  return nextCue[0] ?? "";
}

function toHiragana(kana: string): string {
  return [...kana].map((character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined || codePoint < 0x30a1 || codePoint > 0x30f6) {
      return character;
    }
    return String.fromCodePoint(codePoint - 0x60);
  }).join("");
}
