import type { DictMapToTuple } from '@/types/utilities';

export type ObjectBase<Obj, Val> = {
   asType: Obj;
   asValueType: Val;
   values: DictMapToTuple<Obj>;
};