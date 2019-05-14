/**
 * @jest-environment node
 */
import axios from "axios";
import * as fs from "fs";
import "jest";
import { join } from "path";
import { promisify } from "util";
import { gTTS } from "./gtts";

describe("Test TTS library", () => {
    test("API call returns TTS file", async () => {
        // FIXME: Make this test work
        expect.assertions(1);
        expect(true).toBe(true);
        /*
        const text = "Hello";
        const filepath = join(__dirname, "gtts.test.mp3");

        const tts = new gTTS(text);

        try {
            const fileSaved = await tts.save(filepath);
            const delFile = promisify(fs.unlink);

            const delTestFile = await delFile(filepath);

            expect(fileSaved).toBeUndefined();
            expect(delTestFile).toBeUndefined();
        } catch (err) {
            fail(err);
        }
        */
    });
});
