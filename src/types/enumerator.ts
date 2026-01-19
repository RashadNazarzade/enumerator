import type { EnumerateNestedDict, EnumerateOptions } from "./base";
import type { ObjectGenerator } from './generators'
import type { WhenNestedDict } from "./utilities";

export type EnumerateGenerator<EnumObj> = WhenNestedDict<EnumObj, ObjectGenerator<EnumObj>>

export type { EnumerateNestedDict as Dict, EnumerateOptions as Options }