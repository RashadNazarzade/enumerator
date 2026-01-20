import type {
  DefaultMaxDepth,
  EnumerateNestedDict,
  EnumerateOptions,
  EnumerateOptionsDefault,
} from "./base";
import type { ObjectGenerator } from "./generators";
import type { WhenNestedDict } from "./utilities";

export type EnumerateGenerator<
  EnumObj,
  Opt extends EnumerateOptions = EnumerateOptionsDefault,
> = WhenNestedDict<
  EnumObj,
  ObjectGenerator<
    EnumObj,
    [],
    Opt["maxDepth"] extends number ? Opt["maxDepth"] : DefaultMaxDepth
  >
>;

export type { EnumerateNestedDict as Dict, EnumerateOptions as Options };
