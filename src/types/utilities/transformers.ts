import type { ExtractDictValues } from "./extractors";

export type Simplify<T> = T extends infer U ? U : never;

export type PickDictValues<Dict, DictObj = ExtractDictValues<Dict>> = Simplify<DictObj[keyof DictObj]>;


type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type LastOf<U> =
    UnionToIntersection<U extends any ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never;

type UnionToTuple<U, Acc extends any[] = []> =
    [U] extends [never]
    ? Acc
    : UnionToTuple<
        Exclude<U, LastOf<U>>,
        [LastOf<U>, ...Acc]
    >;

export type DictMapToTuple<
    EnumValObj,
    Keys extends ReadonlyArray<keyof EnumValObj> | Array<keyof EnumValObj> = never
> = [Keys] extends [never]
    ? UnionToTuple<EnumValObj[keyof EnumValObj]>
    : { [Key in keyof Keys]: EnumValObj[Keys[Key] & keyof EnumValObj] };