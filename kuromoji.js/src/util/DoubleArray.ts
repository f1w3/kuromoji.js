// DoubleArray.ts MIT License
// Copyright (c) 2014 Takuya Asano All Rights Reserved.
/*
 *
 * rewrite by f1w3_ | 2024
 * All rights reserved by Takuya Asano.
 * See above for more information.
 *  
 */

"use strict";

const TERM_CHAR = "\u0000"; // terminal character
const TERM_CODE = 0;        // terminal character code
const ROOT_ID = 0;          // index of root node
const NOT_FOUND = -1;       // traverse() returns if no nodes found
const BASE_SIGNED = true;
const CHECK_SIGNED = true;
const BASE_BYTES = 4;
const CHECK_BYTES = 4;
const MEMORY_EXPAND_RATIO = 2;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Array utility functions
const newArrayBuffer = (signed: boolean, bytes: number, size: number) => {
    if (signed) {
        switch (bytes) {
            case 1:
                return new Int8Array(size);
            case 2:
                return new Int16Array(size);
            case 4:
                return new Int32Array(size);
            default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
        }
    } else {
        switch (bytes) {
            case 1:
                return new Uint8Array(size);
            case 2:
                return new Uint16Array(size);
            case 4:
                return new Uint32Array(size);
            default:
                throw new RangeError("Invalid newArray parameter element_bytes:" + bytes);
        }
    }
};

const arrayCopy = (src: Uint8Array, src_offset: number, length: number) => {
    return src.slice(src_offset, src_offset + length);
};

type ArrayBuffer = Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array;

type BaseCheck = {
    signed: boolean,
    bytes: number,
    array: ArrayBuffer | null
};

class BufferController {
    private first_unused_node: number;
    private base: BaseCheck;
    private check: BaseCheck;

    constructor(initial_size: number = 1024) {
        this.first_unused_node = ROOT_ID + 1;

        this.base = {
            signed: BASE_SIGNED,
            bytes: BASE_BYTES,
            array: newArrayBuffer(BASE_SIGNED, BASE_BYTES, initial_size)
        };

        this.check = {
            signed: CHECK_SIGNED,
            bytes: CHECK_BYTES,
            array: newArrayBuffer(CHECK_SIGNED, CHECK_BYTES, initial_size)
        };

        if (!this.base.array || !this.check.array) {
            throw new Error("Initialization failed: Arrays are null");
        }

        // Initialize root node
        this.base.array[ROOT_ID] = 1;
        this.check.array[ROOT_ID] = ROOT_ID;

        // Initialize BASE and CHECK arrays
        this.initBase(this.base.array, ROOT_ID + 1, this.base.array.length);
        this.initCheck(this.check.array, ROOT_ID + 1, this.check.array.length);
    }

    private initBase(_base: ArrayBuffer, start: number, end: number) {
        if (!this.base.array || !this.check.array) {
            throw new Error("initBase() failed: Arrays not initialized");
        }
        for (let i = start; i < end; i++) {
            _base[i] = -i + 1;
        }
        if (0 < this.check.array[this.check.array.length - 1]) {
            let last_used_id = this.check.array.length - 2;
            while (0 < this.check.array[last_used_id]) {
                last_used_id--;
            }
            _base[start] = -last_used_id;
        }
    }

    private initCheck(_check: ArrayBuffer, start: number, end: number) {
        for (let i = start; i < end; i++) {
            _check[i] = -i - 1;
        }
    }

    private realloc(min_size: number) {
        if (!this.base.array || !this.check.array) {
            throw new Error("initBase() failed: Arrays not initialized");
        }
        const new_size = min_size * MEMORY_EXPAND_RATIO;
        const base_new_array = newArrayBuffer(this.base.signed, this.base.bytes, new_size);
        this.initBase(base_new_array, this.base.array.length, new_size);
        base_new_array.set(this.base.array);
        this.base.array = base_new_array;

        const check_new_array = newArrayBuffer(this.check.signed, this.check.bytes, new_size);
        this.initCheck(check_new_array, this.check.array.length, new_size);
        check_new_array.set(this.check.array);
        this.check.array = check_new_array;
    }

    getBaseBuffer() {
        return this.base.array;
    }

    getCheckBuffer() {
        return this.check.array;
    }

    loadBaseBuffer(base_buffer: ArrayBuffer) {
        this.base.array = base_buffer;
        return this;
    }

    loadCheckBuffer(check_buffer: ArrayBuffer) {
        this.check.array = check_buffer;
        return this;
    }

    size() {
        if (!this.base.array || !this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        return Math.max(this.base.array.length, this.check.array.length);
    }

    getBase(index: number) {
        if (!this.base.array) {
            throw new Error("failed: Arrays not initialized");
        }
        if (this.base.array.length - 1 < index) {
            return -index + 1;
        }
        return this.base.array[index];
    }

    getCheck(index: number) {
        if (!this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        if (this.check.array.length - 1 < index) {
            return -index - 1;
        }
        return this.check.array[index];
    }

    setBase(index: number, base_value: number) {
        if (!this.base.array) {
            throw new Error("failed: Arrays not initialized");
        }
        if (this.base.array.length - 1 < index) {
            this.realloc(index);
        }
        this.base.array[index] = base_value;
    }

    setCheck(index: number, check_value: number) {
        if (!this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        if (this.check.array.length - 1 < index) {
            this.realloc(index);
        }
        this.check.array[index] = check_value;
    }

    setFirstUnusedNode(index: number) {
        this.first_unused_node = index;
    }

    getFirstUnusedNode() {
        return this.first_unused_node;
    }

    shrink() {
        if (!this.base.array || !this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        let last_index = Math.max(this.base.array.length, this.check.array.length) - 1;
        while (0 <= this.check.array[last_index]) {
            last_index--;
        }
        this.base.array = this.base.array.subarray(0, last_index + 2);
        this.check.array = this.check.array.subarray(0, last_index + 2);
    }

    calc() {
        if (!this.base.array || !this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        let unused_count = 0;
        const size = this.check.array.length;
        for (let i = 0; i < size; i++) {
            if (this.check.array[i] < 0) {
                unused_count++;
            }
        }
        return {
            all: size,
            unused: unused_count,
            efficiency: (size - unused_count) / size
        };
    }

    dump() {
        if (!this.base.array || !this.check.array) {
            throw new Error("failed: Arrays not initialized");
        }
        let dump_base = "";
        let dump_check = "";

        for (const data of this.base.array) {
            dump_base += " " + data;
        }
        for (const data of this.check.array) {
            dump_check += " " + data;
        }

        console.log("base:" + dump_base);
        console.log("check:" + dump_check);

        return "base:" + dump_base + " check:" + dump_check;
    }
}

/**
 * Factory method of double array
 */
class DoubleArrayBuilder {
    bufferController: BufferController;
    keys: { k: string, v: number }[]
    constructor(initial_size: number = 1024) {
        this.bufferController = new BufferController(initial_size);  // BASE and CHECK
        this.keys = [];
    }

    /**
    * Append a key to initialize set
    * (This method should be called by dictionary ordered key)
    *
    * @param {String} key
    * @param {Number} value Integer value from 0 to max signed integer number - 1
    */
    append(key: string, record: number) {
        this.keys.push({ k: key, v: record });
        return this;
    };

    /**
    * Build double array for given keys
    *
    * @param {Array} keys Array of keys. A key is a Object which has properties 'k', 'v'.
    * 'k' is a key string, 'v' is a record assigned to that key.
    * @return {DoubleArray} Compiled double array
    */
    build(keys: { k: string, v: number }[] = this.keys, sorted: boolean = false) {
        if (keys == null) {
            return new DoubleArray(this.bufferController);
        }
        // Convert key string to ArrayBuffer
        let buff_keys: { k: any; v: number; }[] | null = keys.map((k) => {
            return {
                k: encoder.encode(k.k + TERM_CHAR),
                v: k.v
            };
        });

        // Sort keys by byte order
        if (sorted) {
            this.keys = buff_keys;
        } else {
            this.keys = buff_keys.sort((k1, k2) => {
                const b1 = k1.k;
                const b2 = k2.k;
                const min_length = Math.min(b1.length, b2.length);
                for (let pos = 0; pos < min_length; pos++) {
                    if (b1[pos] === b2[pos]) {
                        continue;
                    }
                    return b1[pos] - b2[pos];
                }
                return b1.length - b2.length;
            });
        }

        buff_keys = null;  // explicit GC

        this._build(ROOT_ID, 0, 0, this.keys.length);
        return new DoubleArray(this.bufferController);
    };

    /**
    * Append nodes to BASE and CHECK array recursively
    */
    _build(parent_index: number, position: number, start: number, length: number) {
        const children_info = this.getChildrenInfo(position, start, length);
        const _base = this.findAllocatableBase(children_info);

        this.setBC(parent_index, children_info, _base);

        for (let i = 0; i < children_info.length; i = i + 3) {
            const child_code = children_info[i];
            if (child_code === TERM_CODE) {
                continue;
            }
            const child_start = children_info[i + 1];
            const child_len = children_info[i + 2];
            const child_index = _base + child_code;
            this._build(child_index, position + 1, child_start, child_len);
        }
    };

    getChildrenInfo(position: number, start: number, length: number) {
        let current_char = this.keys[start].k[position];
        let children_info = new Int32Array(length * 3);
        let i = 0;

        children_info[i++] = parseInt(current_char);  // char (current)
        children_info[i++] = start;         // start index (current)

        let next_pos = start;
        let start_pos = start;
        for (; next_pos < start + length; next_pos++) {
            const next_char = this.keys[next_pos].k[position];
            if (current_char !== next_char) {
                children_info[i++] = next_pos - start_pos;  // length (current)

                children_info[i++] = parseInt(next_char);             // char (next)
                children_info[i++] = next_pos;              // start index (next)
                current_char = next_char;
                start_pos = next_pos;
            }
        }
        children_info[i++] = next_pos - start_pos;
        children_info = children_info.subarray(0, i);

        return children_info;
    };

    setBC(parent_id: number, children_info: Int32Array, _base: number) {
        const bc = this.bufferController;
        bc.setBase(parent_id, _base);  // Update BASE of parent node
        let i;
        for (i = 0; i < children_info.length; i = i + 3) {
            const code = children_info[i];
            const child_id = _base + code;

            // Update linked list of unused nodes

            // Assertion
            // if (child_id < 0) {
            //     throw 'assertion error: child_id is negative'
            // }

            const prev_unused_id = - bc.getBase(child_id);
            const next_unused_id = - bc.getCheck(child_id);
            // if (prev_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            // if (next_unused_id < 0) {
            //     throw 'assertion error: setBC'
            // }
            if (child_id !== bc.getFirstUnusedNode()) {
                bc.setCheck(prev_unused_id, - next_unused_id);
            } else {
                // Update first_unused_node
                bc.setFirstUnusedNode(next_unused_id);
            }
            bc.setBase(next_unused_id, - prev_unused_id);

            const check = parent_id;         // CHECK is parent node index
            bc.setCheck(child_id, check);  // Update CHECK of child node

            // Update record
            if (code === TERM_CODE) {
                const start_pos = children_info[i + 1];
                // var len = children_info[i + 2];
                // if (len != 1) {
                //     throw 'assertion error: there are multiple terminal nodes. len:' + len;
                // }
                let value = this.keys[start_pos].v;

                if (value == null) {
                    value = 0;
                }

                const base = - value - 1;       // BASE is inverted record value
                bc.setBase(child_id, base);  // Update BASE of child(leaf) node
            }
        }
    };

    /**
    * Find BASE value that all children are allocatable in double array's region
    */
    findAllocatableBase(children_info: Int32Array) {
        const bc = this.bufferController;

        // Assertion: keys are sorted by byte order
        // var c = -1;
        // for (var i = 0; i < children_info.length; i = i + 3) {
        //     if (children_info[i] < c) {
        //         throw 'assertion error: not sort key'
        //     }
        //     c = children_info[i];
        // }

        // iterate linked list of unused nodes
        let _base: number;
        let curr = bc.getFirstUnusedNode();  // current index
        // if (curr < 0) {
        //     throw 'assertion error: getFirstUnusedNode returns negative value'
        // }

        while (true) {
            _base = curr - children_info[0];

            if (_base < 0) {
                curr = - bc.getCheck(curr);  // next

                // if (curr < 0) {
                //     throw 'assertion error: getCheck returns negative value'
                // }

                continue;
            }

            let empty_area_found = true;
            for (let i = 0; i < children_info.length; i = i + 3) {
                const code = children_info[i];
                const candidate_id = _base + code;

                if (!this.isUnusedNode(candidate_id)) {
                    // candidate_id is used node
                    // next
                    curr = - bc.getCheck(curr);
                    // if (curr < 0) {
                    //     throw 'assertion error: getCheck returns negative value'
                    // }

                    empty_area_found = false;
                    break;
                }
            }
            if (empty_area_found) {
                // Area is free
                return _base;
            }
        }
    }

    /**
    * Check this double array index is unused or not
    */
    isUnusedNode(index: number) {
        const bc = this.bufferController;
        const check = bc.getCheck(index);

        // if (index < 0) {
        //     throw 'assertion error: isUnusedNode index:' + index;
        // }

        if (index === ROOT_ID) {
            // root node
            return false;
        }
        if (check < 0) {
            // unused
            return true;
        }

        // used node (incl. leaf)
        return false;
    };
}

/**
* Factory method of double array
*/
class DoubleArray {
    bufferController: BufferController;
    constructor(bc: BufferController) {
        this.bufferController = bc;  // BASE and CHECK
        this.bufferController.shrink();
    }

    /**
     * Look up a given key in this trie
     *
     * @param {String} key
     * @return {Boolean} True if this trie contains a given key
     */
    contain(key: string) {
        const bc = this.bufferController;
        key += TERM_CHAR;
        const buffer = encoder.encode(key);
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];

            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return false;
            }

            if (bc.getBase(child) <= 0) {
                // leaf node
                return true;
            } else {
                // not leaf
                parent = child;
                continue;
            }
        }
        return false;
    };

    /**
    * Look up a given key in this trie
    *
    * @param {String} key
    * @return {Number} Record value assgned to this key, -1 if this key does not contain
    */
    lookup(key: string) {
        key += TERM_CHAR;
        const buffer = encoder.encode(key);
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child === NOT_FOUND) {
                return NOT_FOUND;
            }
            parent = child;
        }
        const base = this.bufferController.getBase(child);
        if (base <= 0) {
            // leaf node
            return - base - 1;
        } else {
            // not leaf
            return NOT_FOUND;
        }
    };


    /**
    * Common prefix search
    *
    * @param {String} key
    * @return {Array} Each result object has 'k' and 'v' (key and record,
    * respectively) properties assigned to matched string
    */
    commonPrefixSearch(key: string): { k: string, v: number }[] {
        const buffer = encoder.encode(key);
        const result: { k: string, v: number }[] = [];
        let parent = ROOT_ID;
        let child = NOT_FOUND;
        for (let i = 0; i < buffer.length; i++) {
            const code = buffer[i];
            child = this.traverse(parent, code);
            if (child !== NOT_FOUND) {
                parent = child;
                // look forward by terminal character code to check this node is a leaf or not
                const grand_child = this.traverse(child, TERM_CODE);
                if (grand_child !== NOT_FOUND) {
                    const base = this.bufferController.getBase(grand_child);
                    const r: { k: string, v: number } = {
                        k: "",
                        v: 0
                    };

                    if (base <= 0) {
                        // If child is a leaf node, add record to result
                        r.v = - base - 1;
                    }
                    // If child is a leaf node, add word to result
                    r.k = decoder.decode(arrayCopy(buffer, 0, i + 1));
                    result.push(r);
                }
                continue;
            } else {
                break;
            }
        }
        return result;
    };

    traverse(parent: number, code: number) {
        const child = this.bufferController.getBase(parent) + code;
        if (this.bufferController.getCheck(child) === parent) {
            return child;
        } else {
            return NOT_FOUND;
        }
    };

    size() {
        return this.bufferController.size();
    };

    calc() {
        return this.bufferController.calc();
    };

    dump() {
        return this.bufferController.dump();
    };
}

const doublearray = {
    builder: (initial_size: number = 1024) => {
        return new DoubleArrayBuilder(initial_size);
    },
    load: (base_buffer: ArrayBuffer, check_buffer: ArrayBuffer) => {
        const bufferController = new BufferController(0);
        bufferController.loadBaseBuffer(base_buffer);
        bufferController.loadCheckBuffer(check_buffer);
        return new DoubleArray(bufferController);
    }
};

export { DoubleArrayBuilder, DoubleArray };

export default doublearray;
