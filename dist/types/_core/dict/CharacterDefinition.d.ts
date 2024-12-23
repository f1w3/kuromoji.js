import CharacterClass from "./CharacterClass";
import InvokeDefinitionMap from "./InvokeDefinitionMap";
declare class CharacterDefinition {
    character_category_map: Uint8Array;
    compatible_category_map: Uint32Array;
    invoke_definition_map: null | InvokeDefinitionMap;
    /**
     * CharacterDefinition represents char.def file and
     * defines behavior of unknown word processing
     * @constructor
     */
    constructor();
    /**
     * Load CharacterDefinition
     * @param {Uint8Array} cat_map_buffer
     * @param {Uint32Array} compat_cat_map_buffer
     * @param {Uint8Array} invoke_def_buffer
     * @returns {CharacterDefinition}
     */
    load(cat_map_buffer: Uint8Array, compat_cat_map_buffer: Uint32Array, invoke_def_buffer: Uint8Array): CharacterDefinition;
    static parseCharCategory(class_id: number, parsed_category_def: RegExpExecArray): CharacterClass | null;
    static parseCategoryMapping(parsed_category_mapping: RegExpExecArray): {
        start: number;
        default: string;
        compatible: string[];
    };
    static parseRangeCategoryMapping(parsed_category_mapping: RegExpExecArray): {
        start: number;
        end: number;
        default: string;
        compatible: string[];
    };
    /**
     * Initializing method
     * @param {Array} category_mapping Array of category mapping
     */
    initCategoryMappings(category_mapping: {
        start: number;
        end?: number;
        default: string;
        compatible: string[];
    }[]): void;
    /**
     * Lookup compatible categories for a character (not included 1st category)
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {Array.<CharacterClass>} character classes
     */
    lookupCompatibleCategory(ch: string): CharacterClass[];
    /**
     * Lookup category for a character
     * @param {string} ch UCS2 character (just 1st character is effective)
     * @returns {CharacterClass} character class
     */
    lookup(ch: string): CharacterClass;
}
export default CharacterDefinition;
