# kuromoji.js

[![test](https://github.com/f1w3/kuromoji.js/actions/workflows/test.yml/badge.svg)](https://github.com/f1w3/kuromoji.js/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](/LICENSE.txt)

[English](/docs/README-en.md)・[日本語](/docs/README-ja.md)

## このレポジトリは[@takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js)のフォークです

また以下のレポジトリのアイディアから生まれました

- **[@MijinkoSD/kuromoji.ts](https://github.com/MijinkoSD/kuromoji.ts)**

感謝を申し上げます!

## futures

- [x] テストを100%にする :partying_face:
- [x] asyncライブラリからpromise/awaitへ書き換え :partying_face:
- [x] ブラウザへの対応 :partying_face:
- [x] init関数を非同期にする(eg. `await kuromoji.builder()`) :partying_face:
- [ ] Streamを実装する
- [ ] kuromoji-serverを実装する
- [ ] ユーザー辞書を実装する
- [ ] サーチモードを実装する
- [ ] N-best解の出力をサポートする
- [ ] NAIST-jdic, Unidicのサポートをする
- [ ] 辞書サイズの低減

## About

日本語の形態素解析専用のtypescriptライブラリです

このレポジトリは[Kuromoji](https://www.atilika.com/ja/kuromoji/)の完全な移植版です

kuromoji.jsがどのように動くかは[オンラインデモ](https://coco-ly.com/kuromoji.js/)にて体験出来ます

## Directory

ディレクトリは以下のようになっております:
```
.github       -- Githubの設定ファイル
dict/         -- 辞書ファイル
docs/         -- kuromoji.jsのドキュメント
   - demo/     -- kuromoji.jsデモページ (https://coco-ly.com/kuromoji.js/)
   - example/  -- 使い方の例
scripts/      -- ビルドスクリプト
src/          -- ソースコード
```

## Usage

インストールには以下のいずれかのコマンドを使用できます。
```
npm install kuromoji.js
pnpm install kuromoji.js
bun install kuromoji.js
```

以下のコードのようにファイルを読み込んでください
```typescript
import kuromoji from "kuromoji.js";
const kuromoji = require("kuromoji.js").default;
//browser
import kuromoji from 'https://cdn.jsdelivr.net/npm/kuromoji.js/dist/browser/index.min.js'
```

わずか5行のコードで文章をトークン化できます。

もっと動作例が必要な場合は、[exampleディレクトリ](/example/)の下のファイルを参照してください。

```typescript
import kuromoji from "kuromoji.js";

kuromoji.builder().build((err, tokenizer) => {
    // tokenizer is ready
    const path = tokenizer.tokenize("すもももももももものうち");
    console.log(path);
});
```

トップレベルawaitを用いたロードもサポートされるようになりました！
```typescript
import kuromoji from "kuromoji.js/promise";

const tokenizer = await kuromoji.builder().build();

const path = tokenizer.tokenize("すもももももももものうち");
console.log(path.length);
```

## Build Dictionary

私たちは現在、辞書にmecab-ipadicを使っていますが
mecab-ipadicと互換性がある限り、独自の辞書を作成して使用することができます。
```
bun build-dict <output path> <dict input path>
```

## API

`tokenize()`関数は以下のようなjson配列を返します:

```typescript
[ {
    // 辞書内での単語ID
    word_id: 509800,
    // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
    word_type: 'KNOWN',
    // 単語の開始位置
    word_position: 1,
    // 表層形
    surface_form: '黒文字',
    // 品詞
    pos: '名詞',
    // 品詞細分類1
    pos_detail_1: '一般',
    // 品詞細分類2
    pos_detail_2: '*',
    // 品詞細分類3
    pos_detail_3: '*',
    // 活用型
    conjugated_type: '*',
    // 活用型
    conjugated_form: '*',
    // 基本形
    basic_form: '黒文字',
    // 読み
    reading: 'クロモジ',
    // 発音
    pronunciation: 'クロモジ'
} ]
```

(上記は[src/_core/util/IpadicFormatter.ts](/src/_core/util/IpadicFormatter.ts)にて実装されています)
