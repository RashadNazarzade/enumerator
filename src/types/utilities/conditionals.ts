import type {
  EnumerateNestedDict,
  EnumerateFlatObject,
  EnumerateValue,
} from "@/types/base";

import type { IsDepthExceeded } from "./depth";

export type WhenNever<V, Truthy, Falsy = never> = [V] extends [never]
  ? Truthy
  : Falsy;
export type WhenNestedDict<
  V,
  Truthy,
  Falsy = never,
> = V extends EnumerateNestedDict ? Truthy : Falsy;
export type WhenDictValue<V, Truthy, Falsy = never> = V extends EnumerateValue
  ? Truthy
  : Falsy;
export type WhenDictFlatObject<
  V,
  Truthy,
  Falsy = never,
> = V extends EnumerateFlatObject ? Truthy : Falsy;
export type WhenDepthExceeded<
  CurrentDepth extends 1[],
  MaxDepth extends number,
  Exceeded,
  NotExceeded,
> =
  IsDepthExceeded<CurrentDepth, MaxDepth> extends true ? Exceeded : NotExceeded;
