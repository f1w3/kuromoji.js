# kuromoji.js

[English](/kuromoji.js/docs/README-en.md)・[日本語](/kuromoji.js/docs/README-ja.md)

## this is fork of [@takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js)

and, I was inspired by the following repositories

- **[@MijinkoSD/kuromoji.ts](https://github.com/MijinkoSD/kuromoji.ts)**

Once again, I would like to thank you!

## futures

- [x] Tests Pass 100% :partying_face:
- [x] async to promise/await :partying_face:
- [ ] Support and build for browser
- [ ] Asynchronization of init functions(eg. `await kuromoji.builder()`)
- [ ] Support Stream
- [ ] kuromoji-server
- [ ] Support user dictionary
- [ ] Search mode
- [ ] Output of N-best solution
- [ ] Support NAIST-jdic, Unidic
- [ ] Low dictionary size(use fst?)

## About

JavaScript implementation of Japanese morphological analyzer.
This is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).

You can see how kuromoji.js works in [demo site](https://takuyaa.github.io/kuromoji.js/demo/tokenize.html).

## Directory

Directory tree is as follows:

    dict/         -- Dictionaries for tokenizer (gzipped)
    example/      -- Examples to use in Node.js
    src/          -- JavaScript source
    test/         -- Unit test

## Usage

You can tokenize sentences with only 5 lines of code.
If you need working examples, you can see the files under the demo or example directory.

```typescript
import kuromoji from "./src/kuromoji";

kuromoji.builder({ dicPath: "path/to/dictionary/dir/" }).build((err, tokenizer) => {
    // tokenizer is ready
    const path = tokenizer.tokenize("すもももももももものうち");
    console.log(path);
});
```

## API

The function tokenize() returns an JSON array like this:

```typescript
[ {
    // word id in dictionary
    word_id: 509800,
    // word type (KNOWN for words in the dictionary, UNKNOWN for unknown words)
    word_type: 'KNOWN',
    // word start position
    word_position: 1,
    // surface form
    surface_form: '黒文字',
    // part of speech
    pos: '名詞',
    // Part-of-Speech Subdivision 1
    pos_detail_1: '一般',
    // Part-of-Speech Subdivision 2
    pos_detail_2: '*',
    // Part-of-Speech Subdivision 3
    pos_detail_3: '*',
    // conjugated type
    conjugated_type: '*',
    // conjugated form
    conjugated_form: '*',
    // basic form
    basic_form: '黒文字',
    // reading
    reading: 'クロモジ',
    // pronunciation
    pronunciation: 'クロモジ'
} ]
```

(This is defined in [src/util/IpadicFormatter.js](./src/util/IpadicFormatter.ts))
