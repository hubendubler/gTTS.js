import "jest";
import { RegexBuilder } from "./RegexBuilder";
import { Tokenizer } from "./Tokenizer";

describe("Test Tokenizer", () => {
    function case1() {
        return new RegExp("\,");
    }

    function case2() {
        return new RegexBuilder("abc", (x) => `${x}\\.`).regex;
    }

    const t = new Tokenizer([case1, case2]);

    test("Verify output", () => {
        expect(t.run("Hello, my name is Linda a. Call me Lin, b. I'm your friend"))
        .toEqual(["Hello", " my name is Linda ", " Call me Lin", " ", " I'm your friend"]);
    });
});
