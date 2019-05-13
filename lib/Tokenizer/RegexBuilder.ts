
export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export type PatternFunction = (text: string) => string;
export type PatternArgs = string | string[];

/**
 * Builds regex using arguments passed into a pattern template.
 *
 * Builds a regex object for which the pattern is made from an argument
 * passed into a template. If more than one argument is passed (iterable),
 * each pattern is joined by "|" (regex alternation 'or') to create a
 * single pattern.
 *
 * Example:
 *     To create a simple regex that matches on the characters "a", "b",
 *     or "c", followed by a period::
 *         >>> let rb = new RegexBuilder("abc", (x) => `${x}\.`)
 *     Looking at rb.regex.source we get the following compiled regex::
 *         >>> console.log(rb.regex.source)
 *         "a\.|b\.|c\."
 *     The above is fairly simple, but this class can help in writing more
 *     complex repetitive regex, making them more readable and easier to
 *     create by using existing data structures.
 * Example:
 *     To match the character following the words "lorem", "ipsum", "meili"
 *     or "koda":
 *         >>> const words = ["lorem", "ipsum", "meili", "koda"]
 *         >>> rb = new RegexBuilder(words, (x) => `(?<=${x}).`)
 *     Looking at rb.regex.source we get the following compiled regex::
 *         >>> console.log(rb.regex.source)
 *         "(?<=lorem).|(?<=ipsum).|(?<=meili).|(?<=koda)."
 *
 * @export
 * @class RegexBuilder
 */
export class RegexBuilder {
    /**
     * String element(s) to be each passed to
     * "patternFunc" to create a regex pattern. Each element is
     * regex escapedd before being passed.
     *
     * @type {PatternArgs}
     * @memberof RegexBuilder
     */
    public patternArgs: PatternArgs;

    /**
     * A 'template' function that should take a
     * string and return a string. It should take an element of
     * "patternArgs" and return a valid regex pattern group string.
     *
     * @type {PatternFunction}
     * @memberof RegexBuilder
     */
    public patternFunc: PatternFunction;

    /**
     * flag(s) to compile with the regex
     *
     * @type {string}
     * @memberof RegexBuilder
     */
    public flags: string;

    /**
     * Compiled regular expression
     *
     * @type {RegExp}
     * @memberof RegexBuilder
     */
    public regex: RegExp;

    /**
     * Builds regex using arguments passed into a pattern template.
     *
     * @param {PatternArgs} patternArgs
     *     String element(s) to be each passed to
     *     "patternFunc" to create a regex pattern. Each element is
     *     regex escapedd before being passed.
     * @param {PatternFunction} patternFunc
     *     A 'template' function that should take a
     *     string and return a string. It should take an element of
     *     "patternArgs" and return a valid regex pattern group string.
     * @param {string} [flags=""] flag(s) to compile with the regex
     * @memberof RegexBuilder
     */
    constructor(patternArgs: PatternArgs, patternFunc: PatternFunction, flags: string = "") {
        this.patternArgs = patternArgs;
        this.patternFunc = patternFunc;
        this.flags = flags;

        this.regex = this.compile();
    }

    private compile(): RegExp {
        const alts = [];
        for ( let arg of this.patternArgs ) {
            arg = escapeRegExp(arg);
            const alt = this.patternFunc(arg);
            alts.push(alt);
        }
        const pattern = alts.join("|");
        return new RegExp(pattern, this.flags);
    }
}
