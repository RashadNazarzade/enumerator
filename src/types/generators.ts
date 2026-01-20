import type {
  WhenNestedDict,
  WhenDepthExceeded,
  IncrementDepth,
} from "./utilities";
import type { ValueFeature } from "./features";
import type { ObjectFeatureIfHasValues } from "./helpers";
import type { DefaultMaxDepth } from "./base";

export type ObjectGenerator<
  Obj,
  CurrentDepth extends 1[] = [],
  MaxDepth extends number = DefaultMaxDepth,
> = WhenDepthExceeded<
  CurrentDepth,
  MaxDepth,
  never,
  {
    [Key in keyof Obj]: WhenNestedDict<
      Obj[Key],
      ObjectGenerator<Obj[Key], IncrementDepth<CurrentDepth>, MaxDepth>,
      ValueFeature<Obj[Key]>
    >;
  } & ObjectFeatureIfHasValues<Obj>
>;
