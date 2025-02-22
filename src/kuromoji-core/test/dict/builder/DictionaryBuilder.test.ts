/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";

import type DynamicDictionaries from "../../../dict/DynamicDictionaries";
import kuromoji from "../../../../kuromoji.js";

const DIC_DIR = "src/kuromoji-core/test/_resource/minimum-dic/";
const connection_costs_file = `${DIC_DIR}matrix.def`;
const char_def_file = `${DIC_DIR}char.def`;
const unk_def_file = `${DIC_DIR}unk.def`;
const tid_dic_file = `${DIC_DIR}minimum.csv`;

describe("DictionaryBuilder", () => {
    let kuromoji_dic: DynamicDictionaries | null = null; // target object of DynamicDictionaries to build
    beforeEach((done) => {
        // Build token info dictionary
        const builder = kuromoji.dictionaryBuilder();
        const tokenInfo = fs.readFileSync(tid_dic_file, "utf-8");
        tokenInfo.split("\n").map((line) => {
            builder.addTokenInfoDictionary(line);
        });

        // Build connection costs matrix
        const cc_text = fs.readFileSync(connection_costs_file, "ascii");
        const cc_lines = cc_text.split("\n");
        cc_lines.map((line) => {
            builder.putCostMatrixLine(line);
        });

        // Build unknown dictionary
        const cd_text = fs.readFileSync(char_def_file, "utf-8");
        const cd_lines = cd_text.split("\n");
        cd_lines.map((line) => {
            builder.putCharDefLine(line);
        });
        const unk_text = fs.readFileSync(unk_def_file, "utf-8");
        const unk_lines = unk_text.split("\n");
        unk_lines.map((line) => {
            builder.putUnkDefLine(line);
        });

        kuromoji_dic = builder.build();

        done();
    });

    it("Dictionary not to be null", () => {
        if (!kuromoji_dic) {
            throw new Error("kuromoji_dic is null");
        }
        expect(kuromoji_dic).not.toBeNull();
    });
    it("TokenInfoDictionary not to be null", () => {
        if (!kuromoji_dic) {
            throw new Error("kuromoji_dic is null");
        }
        expect(kuromoji_dic.token_info_dictionary).not.toBeNull();
    });
    it("TokenInfoDictionary", () => {
        if (!kuromoji_dic) {
            throw new Error("kuromoji_dic is null");
        }
        // expect(kuromoji_dic.token_info_dictionary.getFeatures("1467000")).to.have.length.above(1);
        expect(kuromoji_dic.token_info_dictionary.dictionary.buffer.length).toBeGreaterThanOrEqual(1);
    });
    it("DoubleArray not to be null", () => {
        if (!kuromoji_dic) {
            throw new Error("kuromoji_dic is null");
        }
        expect(kuromoji_dic.trie).not.toBeNull();
    });
    it("ConnectionCosts not to be null", () => {
        if (!kuromoji_dic) {
            throw new Error("kuromoji_dic is null");
        }
        expect(kuromoji_dic.connection_costs).not.toBeNull();
    });
});
