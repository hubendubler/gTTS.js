import { escapeRegExp } from "./Tokenizer/RegexBuilder";
import { ALL_PUNC as punc } from "./Tokenizer/Symbols";

const ws = /\s/g;

// Regex that matches if an entire line is only comprised of whitespace and punctuation
const puncEscaped = escapeRegExp(punc).replace(/\n/, "\\n");
const puncWsEscaped = `[${puncEscaped}]|[${ws.source}]`;
const ALL_PUNC_OR_SPACE = new RegExp(`^[${puncWsEscaped}]*$`);

/**
 * Recursively split a string in the largest chunks
 * possible from the highest position of a delimiter all the way
 * to a maximum size
 *
 * Every chunk size will be at minimum `text[0:idx]` where `idx`
 * is the highest index of `delim` found in `text`; and at maximum
 * `text[0:max_size]` if no `delim` was found in `text`.
 * In the latter case, the split will occur at `text[max_size]`
 * which can be any character. The function runs itself again on the rest of
 * `text` (`text[idx:]`) until no chunk is larger than `max_size`.
 *
 * @export
 * @param {string} text The string to split.
 * @param {string} delim The delimiter to split on.
 * @param {number} maxSize The maximum size of a chunk.
 * @returns {string[]} the minimized string in tokens
 */
export function minimize(text: string, delim: string, maxSize: number): string[] {
    // Remove `delim` from start of `text`
    // i.e. prevent a recursive infinite loop on `text[0:0]`
    // if `text` starts with `delim` and is larger than `max_size`
    if ( text.startsWith(delim) ) {
        text = text.substr(delim.length);
    }

    if ( text.length > maxSize ) {
        // Find the highest index of `delim` in `text[0:max_size]`
        // i.e. `text` will be cut in half on `delim` index
        let idx = text.lastIndexOf(delim);
        if ( idx === -1 ) {
            idx = maxSize;
        }
        // Call itself again for `the_string[idx:]`
        return [text.substring(0, idx), ...minimize(text.substring(idx), delim, maxSize)];
    } else {
        return [text];
    }
}

/**
 * Clean a list of strings
 *
 * @export
 * @param {string[]} tokens a list of strings (tokens) to clean.
 * @returns {string[]}
 *     stripped strings `tokens` without the original elements
 *     that only consisted of whitespace and/or punctuation characters.
 */
export function cleanTokens(tokens: string[]): string[] {
    return tokens.filter((t) => !ALL_PUNC_OR_SPACE.test(t));
}
