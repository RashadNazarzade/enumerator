import type {
  EnumerateValueMetadata,
  EnumerateValueWithMeta,
} from "@/types/base";

export type LoopItem<Value, Meta> = {
  readonly value: Value;
  readonly meta: Meta;
};

export type ExtractMetaFromValue<T> = T extends readonly [
  any,
  infer Meta extends EnumerateValueMetadata,
]
  ? Meta
  : undefined;

export type DictValuesToLoopItems<RawValues> = {
  [K in keyof RawValues]: RawValues[K] extends EnumerateValueWithMeta
    ? LoopItem<RawValues[K][0], RawValues[K][1]>
    : LoopItem<RawValues[K], undefined>;
}[keyof RawValues];
