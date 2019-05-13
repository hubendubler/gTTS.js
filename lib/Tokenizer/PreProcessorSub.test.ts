import "jest";
import { PreProcessorSub } from "./PreProcessorSub";

describe("Test PreProcessorSub", () => {

    const subPairs = [["Mac", "PC"], ["Firefox", "Chrome"]];
    const pp = new PreProcessorSub(subPairs);

    test("Verify toString function", () => {
        expect(pp.toString()).toBe("(Mac, repl='PC'), (Firefox, repl='Chrome')");
    });
    test("Verify output", () => {
        expect(pp.run("I use firefox on my mac")).toBe("I use Chrome on my PC");
    });
});
