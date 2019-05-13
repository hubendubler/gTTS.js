import { PreProcessorRegex } from "./PreProcessorRegex";
import { PreProcessorSub } from "./PreProcessorSub";
import * as Symbols from "./Symbols";

/**
 * Add a space after tone-modifying punctuation.
 *
 * Because the `toneMarks` tokenizer case will split after a tone-modidfying
 * punctuation mark, make sure there's whitespace after.
 *
 * @export
 * @param {string} text
 * @returns {string}
 */
export function toneMarks(text: string): string {
    return new PreProcessorRegex(Symbols.TONE_MARKS, (x) => `(?<=${x})`, " ").run(text);
}

/**
 * Re-form words cut by end-of-line hyphens.
 *
 * Remove "<hyphen><newline>".
 *
 * @export
 * @param {string} text
 * @returns {string}
 */
export function endOfLine(text: string): string {
    return new PreProcessorRegex("-", (x) => `${x}\n`, "").run(text);
}

/**
 * Remove periods after an abbreviation from a list of known
 * abbrevations that can be spoken the same without that period. This
 * prevents having to handle tokenization of that period.
 *
 * Note:
 *     Could potentially remove the ending period of a sentence.
 * Note:
 *     Abbreviations that Google Translate can't pronounce without
 *     (or even with) a period should be added as a word substitution with a
 *     :class:`PreProcessorSub` pre-processor. Ex.: 'Esq.', 'Esquire'.
 *
 * @export
 * @param {string} text
 * @returns {string}
 */
export function abbreviations(text: string): string {
    return new PreProcessorRegex(Symbols.ABBREVIATIONS, (x) => `(?<=${x})(?=\.).`, "", "i").run(text);
}

/**
 * Word-for-word substitutions.
 *
 * @export
 * @param {string} text
 * @returns {string}
 */
export function wordSub(text: string): string {
    return new PreProcessorSub(Symbols.SUB_PAIRS).run(text);
}
