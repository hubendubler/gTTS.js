import axios from "axios";
import * as fs from "fs";
import { promisify } from "util";
import { Token } from "./gttsToken";
import { ILanguageDictionary, ttsLangs } from "./lang";
import * as PreProcessors from "./Tokenizer/PreProcessors";
import { Tokenizer } from "./Tokenizer/Tokenizer";
import * as TokenizerCases from "./Tokenizer/TokenizerCases";
import { cleanTokens, minimize } from "./utils";

enum Speed {
    SLOW = 0.3,
    NORMAL = 1,
}

/**
 * gTTS -- Google Text-to-Speech.
 *
 * An interface to Google Translate's Text-to-Speech API.
 *
 * @export
 * @class gTTS
 */
// tslint:disable-next-line: class-name
export class gTTS {
    // CONSTANTS
    private GOOGLE_TTS_MAX_CHARS = 100;  // Max characters the Google TTS API takes at a time
    private GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";
    private GOOGLE_TTS_HEADERS = {
        "Referer": "http://translate.google.com/",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; WOW64)  " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/47.0.2526.106 Safari/537.36",
    };

    // PARAMETERS
    private text: string;
    private speed: Speed;
    private preProcessorFuncs: Array<(text: string) => string>;
    private tokenizerFunc: (text: string) => string[];
    private langList: Promise<ILanguageDictionary>|null;
    private token: Token;
    private lang: string;

    // ...

    /**
     * Creates an instance of gTTS.
     *
     * @param {string} text
     * The text to be read.
     * @param {string} [lang]
     * The language (IETF language tag) to
     * read the text in. Defaults to 'en'.
     * @param {boolean} [slow]
     * Reads text more slowly. Defaults to `false`.
     * @param {boolean} [langCheck]
     * Strictly enforce an existing `lang`,
     * to catch a language error early. If set to `true`,
     * a `ValueError` is raised if `lang` doesn't exist.
     * Default is `true`.
     * @param {Array<(text: string) => string>} [preProcessorFuncs]
     * A list of zero or more functions that are
     * called to transform (pre-process) text before tokenizing. Those
     * functions must take a string and return a string. Defaults to:
     * ```
     *     [
     *         PreProcessors.toneMarks,
     *         PreProcessors.endOfLine,
     *         PreProcessors.abbreviations,
     *         PreProcessors.wordSub,
     *     ]
     * ```
     * @param {(text: string) => string[]} [tokenizerFunc]
     * A function that takes in a string and
     * returns a list of string (tokens). Defaults to:
     * ```
     *     Tokenizer([
     *         tokenizer_cases.tone_marks,
     *         tokenizer_cases.period_comma,
     *         tokenizer_cases.colon,
     *         tokenizer_cases.other_punctuation
     *     ]).run
     * ```
     * @memberof gTTS
     */
    constructor(
        text: string,
        lang: string = "en",
        slow: boolean = false,
        langCheck: boolean = true,
        preProcessorFuncs: Array<(text: string) => string> = [
            PreProcessors.toneMarks,
            PreProcessors.endOfLine,
            PreProcessors.abbreviations,
            PreProcessors.wordSub,
        ],
        tokenizerFunc: (text: string) => string[] = new Tokenizer([
            TokenizerCases.toneMarks,
            TokenizerCases.periodComma,
            TokenizerCases.colon,
            TokenizerCases.otherPunctuation,
        ]).run,
    ) {
        // TODO: Debug

        // Text
        if ( !text ) {
            throw new Error("No text to speak");
        }
        this.text = text;

        // Language (async)
        this.lang = lang;
        this.langList = langCheck ? ttsLangs() : null;

        //  Read speed
        if ( slow ) {
            this.speed = Speed.SLOW;
        } else {
            this.speed = Speed.NORMAL;
        }

        // Pre-processors and tokenizer
        this.preProcessorFuncs = preProcessorFuncs;
        this.tokenizerFunc = tokenizerFunc;

        // Google Translate token (async)
        this.token = new Token();
    }

    public save(savefile: string): Promise<void> {
        return this.process(savefile);
    }

    /**
     * Do the TTS API request and write bytes to a file-like object.
     *
     * @private
     * @param {string} savefile file path to write the `mp3` to.
     * @memberof gTTS
     */
    private async process(savefile: string) {
        // Check language
        if ( this.langList !== null ) {
            const langs = Object.keys(await this.langList).map((el) => el.toLowerCase());
            if ( !langs.includes(this.lang.toLowerCase()) ) {
                throw new Error(`Language not supported: ${this.lang}`);
            }
        }

        // Open file for write access
        const fsOpen = promisify(fs.open);
        const fsWrite = promisify(fs.write);
        let file: number;
        try {
            file = await fsOpen(savefile, "w");
        } catch (err) {
            throw new Error(`Error while accessing file: ${err.message}`);
        }

        // Token
        const textParts = this.tokenize(this.text);
        if ( !textParts ) {
            throw new Error("No text to send to TTS API");
        }

        for ( const [idx, part] of textParts.entries()) {

            await this.token.calculateToken(part)
            .catch((err) => {
                throw new Error(`Connection error during token calculation: ${err.message}`);
            })
            .then((partToken) => {
                const payload = {
                    client: "tw-ob",
                    idx,
                    ie: "UTF-8",
                    q: part,
                    textlen: part.length,
                    tk: partToken,
                    tl: this.lang,
                    total: textParts.length,
                    ttsspeed: this.speed,
                };
                return Promise.resolve(payload);
            })
            .then((payload) => {
                return axios.get(this.GOOGLE_TTS_URL, {
                    headers: this.GOOGLE_TTS_HEADERS,
                    params: payload,
                    responseType: "arraybuffer",
                });
            })
            .catch((err) => {
                throw new Error(`Request failed: ${err.message}`);
            })
            .then((response) => {
                if ( response.status === 403 ) {
                    throw new Error(`Bad token or upstream API changes`);
                } else if ( response.status === 404 && this.langList === null ) {
                    throw new Error(`Unsupported language: ${this.lang}`);
                } else if ( response.status >= 500 ) {
                    throw new Error(`Uptream API error. Try again later`);
                }
                return Promise.resolve(response.data);
            })
            .then((buffer) => {
                return fsWrite(file, buffer);
            })
            .catch((err) => {
                throw new Error(`Error writing the file: ${err.message}`);
            });

        }
    }

    private tokenize(text: string): string[] {
        // Pre-clean
        text = text.trim();

        // Apply pre-processors
        for (const pp of this.preProcessorFuncs) {
            text = pp(text);
        }

        if ( text.length <= this.GOOGLE_TTS_MAX_CHARS ) {
            return cleanTokens([text]);
        }

        // Tokenize
        let tokens = this.tokenizerFunc(text);

        // Clean
        tokens = cleanTokens(tokens);

        // Minimize
        let minTokens: string[] = [];
        for (const t of tokens) {
            minTokens = [...minTokens, ...minimize(t, " ", this.GOOGLE_TTS_MAX_CHARS)];
        }

        return minTokens;
    }

}
