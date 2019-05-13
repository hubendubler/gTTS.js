import { PatternArgs, PatternFunction, RegexBuilder } from "./RegexBuilder";

/**
 * Regex-based substitution text pre-processor.
 *
 * Example:
 *     Add "!" after the words "lorem" or "ipsum", while ignoring case::
 *         >>> import re
 *         >>> words = ['lorem', 'ipsum']
 *         >>> pp = PreProcessorRegex(words,
 *         ...                        lambda x: "({})".format(x), r'\\1!',
 *         ...                        re.IGNORECASE)
 *     In this case, the regex is a group and the replacement uses its
 *     backreference ``\\1`` (as a raw string). Looking at ``pp`` we get the
 *     following list of search/replacement pairs::
 *         >>> print(pp)
 *         (re.compile('(lorem)', re.IGNORECASE), repl='\1!'),
 *         (re.compile('(ipsum)', re.IGNORECASE), repl='\1!')
 *     It can then be run on any string of text::
 *         >>> pp.run("LOREM ipSuM")
 *         "LOREM! ipSuM!"
 *
 * @export
 * @class PreProcessorRegex
 */
export class PreProcessorRegex {
    public repl: string;
    public regexes: RegExp[];

    /**
     * Regex-based substitution text pre-processor.
     * @param {PatternArgs} searchArgs
     *     String element(s) to be each passed to
     *     `search_func` to create a regex pattern. Each element is
     *     `re.escape`'d before being passed.
     * @param {PatternFunction} searchFunc
     *     A 'template' function that should take a
     *     string and return a string. It should take an element of
     *     `search_args` and return a valid regex search pattern string.
     * @param {string} repl
     *     The common replacement passed to the `sub` method for
     *     each `regex`. Can be a raw string (the case of a regex
     *     backreference, for example)
     * @param {string} [flags=""] flag(s) to compile with each `regex`.
     * @memberof PreProcessorRegex
     */
    constructor(searchArgs: PatternArgs, searchFunc: PatternFunction, repl: string | RegExp, flags: string = "") {
        if ( repl instanceof RegExp ) {
            repl = repl.source;
            repl = repl.replace("\\\\1", "$1");
        }
        this.repl = repl.replace("\\1", "$1");

        // Create regex list
        this.regexes = [];
        for ( const arg of searchArgs ) {
            const rb = new RegexBuilder([arg], searchFunc, flags);
            this.regexes.push(rb.regex);
        }
    }

    /**
     * Run each regex substitution on `text`.
     *
     * @param {string} text the input text.
     * @returns {string} text after all substitutions have been sequentially applied.
     * @memberof PreProcessorRegex
     */
    public run(text: string): string {
        for ( const regex of this.regexes ) {
            text = text.replace(regex, this.repl);
        }
        return text;
    }

    public toString(): string {
        const subsStrs = [];
        for ( const r of this.regexes ) {
            subsStrs.push(`(${r.source}, repl='${this.repl}')`);
        }
        return subsStrs.join(", ");
    }
}
