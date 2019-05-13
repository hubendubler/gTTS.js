import "jest";
import { RegexBuilder } from "./RegexBuilder";

describe("Test RegexBuilder", () => {
    const rb = new RegexBuilder("abc", (x) => `${x}\.`);

    const words = ["lorem", "ipsum", "meili", "koda"];
    const rb2 = new RegexBuilder(words, (x) => `(?<=${x}).`);

    test("Verify regex source with string input", () => {
        expect(rb.regex.source).toBe("a.|b.|c.");
    });
    test("Verify regex source with array input", () => {
        expect(rb2.regex.source).toBe("(?<=lorem).|(?<=ipsum).|(?<=meili).|(?<=koda).");
    });
});
