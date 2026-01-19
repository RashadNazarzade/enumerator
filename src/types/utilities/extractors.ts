import type { EnumerateValueWithMeta } from "../base"; 
import type { WhenDictValue, WhenNestedDict } from "./conditionals";

export type ExtractDictValues<Dict> = {
    [Key in keyof Dict as WhenDictValue<Dict[Key], Key>]: Dict[Key] extends EnumerateValueWithMeta ? Dict[Key][0] : Dict[Key]
}

export type ExtractDictNonValues<Dict> = WhenNestedDict<Dict, {
    [Key in keyof Dict as WhenDictValue<Dict[Key], never, Key>]: Dict[Key]
}>;
