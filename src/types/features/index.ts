import type { EnumerateValueWithMeta } from "@/types/base";
import type { ExtractDictValues, PickDictValues } from "@/types/utilities";

import type { ValueBase, ValueEquals } from "./val";
import type { ObjectBase, ObjectContains, ObjectContainsOneOf } from "./obj";

export type ObjectFeature<
  Obj,
  ValObj = ExtractDictValues<Obj>,
  Val = PickDictValues<ValObj>
> = ObjectBase<ValObj, Val> &
  ObjectContains<Val> &
  ObjectContainsOneOf<ValObj, Val>;

export type ValueFeature<
  EnumVal,
  Val = EnumVal extends EnumerateValueWithMeta ? EnumVal[0] : EnumVal,
  Description = EnumVal extends EnumerateValueWithMeta ? EnumVal[1] : never
> = ValueBase<Val, Description> & ValueEquals<Val>;
