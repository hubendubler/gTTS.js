# gTTS.js

[![Build Status](https://travis-ci.com/hubendubler/gTTS.svg?token=J3pmS2iu8QRB9YmWfb9y&branch=master)](https://travis-ci.com/hubendubler/gTTS)

This is a Promise based Node.js/TypeScript port of the python gTTS library.

## Install

`npm install gtts.js`

## How to use

Note: The CLI is currently not supported.

```js
const gTTS = require("gtts.js").gTTS;
const tts = new gTTS("Hello");
tts.save("hello.mp3")
.then(() => {
    // Save successful
})
.catch((err) => {
    // Process failed
});
```

### TypeScript

```ts
import { gTTS } from "gtts.js";
```
