import axios from "axios";
import { JSDOM } from "jsdom";

const URL_BASE = "http://translate.google.com";
const JS_FILE = "translate_m.js";

/**
 * An object of the type {"<lang>": "<name>"}
 *
 * Where "<lang>" is an IETF language tag such as "en" or "pt-br",
 * and "<name>" is the full English name of the language, such as
 * English" or "Portuguese (Brazil)".
 *
 * @interface ILanguageDictionary
 */
export interface ILanguageDictionary {
    [key: string]: string;
}

/**
 * Languages Google Text-to-Speech supports.
 *
 * The dictionnary returned combines languages from two origins:
 *
 * - Languages fetched automatically from Google Translate
 * - Languages that are undocumented variations that were observed to work and
 *   present different dialects or accents.
 *
 * @returns {Promise<ILanguageDictionary>}
 *     An object of the type {"<lang>": "<name>"}
 *     Where "<lang>" is an IETF language tag such as "en" or "pt-br",
 *     and "<name>" is the full English name of the language, such as
 *     English" or "Portuguese (Brazil)".
 */
export async function ttsLangs(): Promise<ILanguageDictionary> {
    try {
        let langs: ILanguageDictionary = {};
        langs = {...langs, ...await fetchLangs()};
        langs = {...langs, ...extra_langs()};
        return langs;
    } catch (err) {
        throw new Error("Unable to get language list: " + err);
    }
}

/**
 * "Fetch (scrape) languages from Google Translate.
 *
 * Google Translate loads a JavaScript Array of 'languages codes' that can
 * be spoken. We intersect this list with all the languages Google Translate
 * provides to get the ones that support text-to-speech.
 *
 * @returns {Promise<ILanguageDictionary>} An ILanguageDictionary of languages from Google Translate
 */
async function fetchLangs(): Promise<ILanguageDictionary> {

    // Load HTML
    const page = await axios.get(URL_BASE);
    const dom = new JSDOM(page.data);

    // JavaScript URL
    // The <script src=""> path can change, but not the file.
    // Ex. /translate/releases/twsfe_nightly_20190503_RC01/r/js/translate_m.js
    const jsPathElement = dom.window.document.querySelector(`script[src*="${JS_FILE}"]`);
    if ( jsPathElement === null ) {
        throw new Error("No script URL found");
    }
    const jsPath = jsPathElement.getAttribute("src");
    const jsURL = `${URL_BASE}/${jsPath}`;

    // Load JavaScript
    const jsContents = await axios.get(jsURL);

    // Approximately extract TTS-enabled language codes
    // RegEx pattern search because minified variables can change.
    // Extra garbage will be dealt with later as we keep languages only.
    // In: "[...]Fv={af:1,ar:1,[...],zh:1,"zh-cn":1,"zh-tw":1}[...]"
    // Out: ['is', '12', [...], 'af', 'ar', [...], 'zh', 'zh-cn', 'zh-tw']
    const pattern = /[{,\"](\w{2}|\w{2}-\w{2,3})(?=:1|\":1)/gm;
    const ttsLangMatches = [];
    let match = pattern.exec(jsContents.data);
    while ( match !== null ) {
        ttsLangMatches.push(match[1]);
        match = pattern.exec(jsContents.data);
    }

    // Build lang. dict. from main page (JavaScript object populating lang. menu)
    // Filtering with the TTS-enabled languages
    // In: "{code:'auto',name:'Detect language'},{code:'af',name:'Afrikaans'},[...]"
    // Out: {'af': 'Afrikaans', [...]}
    const transPattern = /{code:'(.+?[^'])',name:'(.+?[^'])'}/gm;
    const transDict: ILanguageDictionary = {};
    match = transPattern.exec(page.data);
    while ( match !== null ) {
        if ( ttsLangMatches.indexOf(match[1]) !== -1 ) {
            transDict[match[1]] = match[2];
        }
        match = transPattern.exec(page.data);
    }

    return transDict;
}

/**
 * Define extra languages.
 *
 * Variations of the ones fetched by `_fetch_langs`,
 * observed to provide different dialects or accents or
 * just simply accepted by the Google Translate Text-to-Speech API.
 *
 * @returns {ILanguageDictionary} An ILanguageDictionary of extra languages manually defined.
 */
function extra_langs(): ILanguageDictionary {
    return {
        // Chinese
        "zh-cn": "Chinese (Mandarin/China)",
        "zh-tw": "Chinese (Mandarin/Taiwan)",
        // English
        // tslint:disable-next-line: object-literal-sort-keys
        "en-us": "English (US)",
        "en-ca": "English (Canada)",
        "en-uk": "English (UK)",
        "en-gb": "English (UK)",
        "en-au": "English (Australia)",
        "en-gh": "English (Ghana)",
        "en-in": "English (India)",
        "en-ie": "English (Ireland)",
        "en-nz": "English (New Zealand)",
        "en-ng": "English (Nigeria)",
        "en-ph": "English (Philippines)",
        "en-za": "English (South Africa)",
        "en-tz": "English (Tanzania)",
        // French
        "fr-ca": "French (Canada)",
        "fr-fr": "French (France)",
        // Portuguese
        "pt-br": "Portuguese (Brazil)",
        "pt-pt": "Portuguese (Portugal)",
        // Spanish
        "es-es": "Spanish (Spain)",
        "es-us": "Spanish (United States)",
    };
}
