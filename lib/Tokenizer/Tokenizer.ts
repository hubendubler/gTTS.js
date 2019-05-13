import { PreProcessorRegex } from "./PreProcessorRegex";
import { PreProcessorSub } from "./PreProcessorSub";
import { RegexBuilder } from "./RegexBuilder";

export class Tokenizer {
    public regexFuncs: Array<() => RegExp>;
    public flags: string;
    public totalRegex: RegExp;

    constructor(regexFuncs: Array<() => RegExp>, flags: string = "i") {
        this.regexFuncs = regexFuncs;
        this.flags = flags;

        try {
            // Combine
            this.totalRegex = this.combineRegex();
        } catch (err) {
            throw new TypeError("Tokenizer() expects a list of functions returning " +
                                "regular expression objects (i.e. re.compile). " + err);
        }
    }

    public run(text: string): string[] {
        return text.split(this.totalRegex);
    }

    public toString(): string {
        return `${this.totalRegex.source} from: ${this.regexFuncs}`;
    }

    private combineRegex() {
        const alts = [];
        for ( const func of this.regexFuncs ) {
            alts.push(func());
        }

        const pattern = alts.map((alt) => alt.source).join("|");
        return new RegExp(pattern, this.flags);
    }
}

/*
export * from "./PreProcessorRegex";
export * from "./PreProcessorSub";
export * from "./RegexBuilder";
export * from "./Symbols";
*/
