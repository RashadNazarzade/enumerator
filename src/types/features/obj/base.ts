import type { DictMapToTuple, Simplify } from "@/types/utilities";

export type ObjectBase<Obj, Val> = {
  asType: Obj;
  asValueType: Val;
  values: Simplify<DictMapToTuple<Obj>>;
};
