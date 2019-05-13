import "jest";
import { PreProcessorRegex } from "./PreProcessorRegex";

describe("Test PreProcessorRegex", () => {
    const words = ["lorem", "ipsum"];
    const pp = new PreProcessorRegex(words, (x) => `(${x})`, /\\1!/, "i");

    test("Verify toString function", () => {
        expect(pp.toString()).toBe("((lorem), repl='$1!'), ((ipsum), repl='$1!')");
    });
    test("Verify output", () => {
        expect(pp.run("LOREM ipSuM")).toBe("LOREM! ipSuM!");
    });
});
