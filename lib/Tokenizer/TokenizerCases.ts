import { RegexBuilder } from "./RegexBuilder";
import * as Symbols from "./Symbols";

/**
 * Keep tone-modifying punctuation by matching following character.
 *
 * Assumes the `tone_marks` pre-processor was run for cases where there might
 * not be any space after a tone-modifying punctuation mark.
 *
 * @export
 * @returns {RegExp}
 */
export function toneMarks(): RegExp {
    return new RegexBuilder(Symbols.TONE_MARKS, (x) => `(?<=${x}).`).regex;
}

/**
 * Period and comma case.
 *
 * Match if not preceded by ".<letter>" and only if followed by space.
 * Won't cut in the middle/after dotted abbreviations; won't cut numbers.
 *
 * Note:
 *     Won't match if a dotted abbreviation ends a sentence.
 * Note:
 *     Won't match the end of a sentence if not followed by a space.
 *
 * @export
 * @returns {RegExp}
 */
export function periodComma(): RegExp {
    return new RegexBuilder(Symbols.PERIOD_COMMA, (x) => `(?<!\.[a-z])${x} `).regex;
}

/**
 * Colon case.
 *
 * Match a colon ":" only if not preceeded by a digit.
 * Mainly to prevent a cut in the middle of time notations e.g. 10:01
 *
 * @export
 * @returns {RegExp}
 */
export function colon(): RegExp {
    return new RegexBuilder(Symbols.COLON, (x) => `(?<!\d)${x}`).regex;
}

/**
 * Match other punctuation.
 *
 * Match other punctuation to split on; punctuation that naturally
 * inserts a break in speech.
 *
 * @export
 * @returns {RegExp}
 */
export function otherPunctuation(): RegExp {
    const punc = Array.from(new Set([
        ...Symbols.ALL_PUNC,
        ...Symbols.TONE_MARKS,
        ...Symbols.PERIOD_COMMA,
        ...Symbols.COLON,
    ])).join("");
    return new RegexBuilder(punc, (x) => `${x.normalize()}`).regex;
}

/**
 * Match all punctuation.
 *
 * Use as only tokenizer case to mimic gTTS 1.x tokenization.
 *
 * @export
 * @returns {RegExp}
 */
export function legacyAllPunctuation(): RegExp {
    const punc = Symbols.ALL_PUNC;
    return new RegexBuilder(punc, (x) => `${x.normalize()}`).regex;
}
