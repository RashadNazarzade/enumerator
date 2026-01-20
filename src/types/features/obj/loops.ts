import type { Simplify } from "@/types/utilities/transformers";
import type { ExtractRawDictValues } from "@/types/utilities/extractors";

import type { DictValuesToLoopItems } from "./loop-item";

export type ObjectLoops<Obj, RawObject = ExtractRawDictValues<Obj>> = {
  forEach(
    callback: (
      item: Simplify<DictValuesToLoopItems<RawObject>>,
      idx: number,
      items: Simplify<DictValuesToLoopItems<RawObject>>[],
    ) => void,
  ): void;

  map<MappedValue>(
    callback: (
      item: Simplify<DictValuesToLoopItems<RawObject>>,
      idx: number,
      items: Simplify<DictValuesToLoopItems<RawObject>>[],
    ) => MappedValue,
  ): MappedValue[];
};
