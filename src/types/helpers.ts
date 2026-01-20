import type { ObjectFeature } from "./features";
import type { ExtractDictValues } from "./utilities";

export type ObjectFeatureIfHasValues<Obj> = [
  keyof ExtractDictValues<Obj>,
] extends [never]
  ? {}
  : ObjectFeature<Obj>;
