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
/*
 *
 * rewrite by f1w3_ | 2024
 * All rights reserved by Takuya Asano.
 * See above for more information.
 *  
 */

"use strict";

import Tokenizer from "./Tokenizer";
import DictionaryLoader from "./loader/NodeDictionaryLoader";

export type TokenizerBuilderOption = {
    dicPath?: string | undefined;
}

class TokenizerBuilder {
    dic_path: string;

    constructor(option: TokenizerBuilderOption) {
        if (option.dicPath == undefined) {
            this.dic_path = "dict/";
        } else {
            this.dic_path = option.dicPath;
        }
    }

    build(callback: (err: Error[] | null, tokenizer: Tokenizer) => void) {
        const loader = new DictionaryLoader(this.dic_path);
        loader.load((err, dic) => {
            callback(err, new Tokenizer(dic));
        });
    }
}

export default TokenizerBuilder;