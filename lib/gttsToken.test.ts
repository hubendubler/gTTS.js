/**
 * @jest-environment node
 */
import axios from "axios";
import "jest";
import { Token } from "./gttsToken";

describe("Test gttsToken", () => {

    const tokenizer = new Token();

    test("Verify gtts Token 1", async () => {
        expect.assertions(1);
        const data = await tokenizer.calculateToken("test", "406986.2817744745");
        expect(data).toBe("278125.134055");
    });
    test("Verify gtts Token 2", async () => {
        expect.assertions(1);
        const data = await tokenizer.calculateToken("test2", "432709.1557755164");
        expect(data).toBe("914741.749424");
    });
    test("Verify fetched Token key", async () => {
        // expect.assertions(1);
        const text = "Hello";
        const token = await tokenizer.calculateToken(text);
        const payload = {
            client: "t",
            q: text,
            tk: token,
            tl: "en",
        };

        const r = await axios.get("https://translate.google.com/translate_tts", {
            params: payload,
        });
        expect(r.status).toBe(200);
    });
});
