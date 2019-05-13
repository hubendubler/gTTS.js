import { PreProcessorRegex } from "./PreProcessorRegex";
import { PatternFunction } from "./RegexBuilder";

export class PreProcessorSub {
    public preProcessors: PreProcessorRegex[];

    constructor(subPairs: Array<Array<string|RegExp>>, ignoreCase: boolean = true) {

        const searchFunc: PatternFunction = (x) => x.normalize();
        const flags = ignoreCase ? "i" : "";

        // Create pre-processor list
        this.preProcessors = [];
        for ( let subPair of subPairs ) {
            // RegExp => String
            subPair = subPair.map((el) => {
                if ( el instanceof RegExp ) {
                    return el.source;
                }
                return el;
            });
            const [pattern, repl] = subPair as string[];
            const pp = new PreProcessorRegex([pattern], searchFunc, repl, flags);
            this.preProcessors.push(pp);
        }
    }

    public run(text: string) {
        for (const pp of this.preProcessors ) {
            text = pp.run(text);
        }
        return text;
    }

    public toString() {
        return this.preProcessors.map((el) => el.toString()).join(", ");
    }
}
