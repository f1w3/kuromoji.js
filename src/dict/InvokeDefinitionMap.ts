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

import ByteBuffer from "../util/ByteBuffer";
import CharacterClass from "./CharacterClass";

/**
 * InvokeDefinitionMap represents invoke definition a part of char.def
 * @constructor
 */
class InvokeDefinitionMap {
    map: CharacterClass[];
    lookup_table: { [key: string]: number };
    constructor() {
        this.map = [];
        this.lookup_table = {};  // Just for building dictionary
    }

    /**
    * Load InvokeDefinitionMap from buffer
    * @param {Uint8Array} invoke_def_buffer
    * @returns {InvokeDefinitionMap}
    */
    static load(invoke_def_buffer: Uint8Array): InvokeDefinitionMap {
        const invoke_def = new InvokeDefinitionMap();
        const character_category_definition: CharacterClass[] = [];

        const buffer = new ByteBuffer(invoke_def_buffer);
        while (buffer.position + 1 < buffer.size()) {
            const class_id = character_category_definition.length;
            const is_always_invoke = Boolean(buffer.get());
            const is_grouping = Boolean(buffer.get());
            const max_length = buffer.getInt();
            const class_name = buffer.getString();
            character_category_definition.push(new CharacterClass(class_id, class_name, is_always_invoke, is_grouping, max_length));
        }

        invoke_def.init(character_category_definition);

        return invoke_def;
    };

    /**
    * Initializing method
    * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
    */
    init(character_category_definition: CharacterClass[]) {
        if (character_category_definition == null) {
            return;
        }
        const ccd_length = character_category_definition.length;
        for (let i = 0; i < ccd_length; i++) {
            const character_class = character_category_definition[i];
            this.map[i] = character_class;
            this.lookup_table[character_class.class_name] = i;
        }
    };

    /**
    * Get class information by class ID
    * @param {number} class_id
    * @returns {CharacterClass}
    */
    getCharacterClass(class_id: number) {
        return this.map[class_id];
    };

    /**
    * For building character definition dictionary
    * @param {string} class_name character
    * @returns {number} class_id
    */
    lookup(class_name: string): number | null {
        const class_id = this.lookup_table[class_name];
        if (class_id == null) {
            return null;
        }
        return class_id;
    };

    /**
    * Transform from map to binary buffer
    * @returns {Uint8Array}
    */
    toBuffer() {
        const buffer = new ByteBuffer();
        for (let i = 0; i < this.map.length; i++) {
            const char_class = this.map[i];
            buffer.put(char_class.is_always_invoke);
            buffer.put(char_class.is_grouping);
            buffer.putInt(char_class.max_length);
            buffer.putString(char_class.class_name);
        }
        buffer.shrink();
        return buffer.buffer;
    };
}

export default InvokeDefinitionMap;