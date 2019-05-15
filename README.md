# gTTS.js

[![Build Status](https://travis-ci.com/hubendubler/gTTS.js.svg?branch=master)](https://travis-ci.com/hubendubler/gTTS.js)

This is a Promise based Node.js/TypeScript port of the [python gTTS Google Text-To-Speech library](https://github.com/pndurette/gTTS).

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
