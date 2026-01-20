import { expectTypeOf, test } from "vitest";
import type {
  EnumerateValType,
  EnumerateValueMetadata,
  EnumerateValueWithMeta,
  EnumerateFlatObject,
  EnumerateNestedDict,
} from "@/types/base";

test("EnumerateValType - should accept string or number", () => {
  expectTypeOf<EnumerateValType>().toEqualTypeOf<string | number>();
  expectTypeOf<EnumerateValType>().toEqualTypeOf<string | number>();
  expectTypeOf<boolean>().not.toEqualTypeOf<EnumerateValType>();
});

test("EnumerateValMetaType - should have optional metadata fields", () => {
  const meta: EnumerateValueMetadata = {
    description: "Test description",
    category: "Test category",
    deprecated: true,
    since: "1.0.0",
    tags: ["test", "example"],
  };

  expectTypeOf(meta).toEqualTypeOf<EnumerateValueMetadata>();
});

test("EnumerateValMeta - should be a readonly tuple", () => {
  const valMeta: EnumerateValueWithMeta = [
    "active",
    { description: "Active status" },
  ] as const;

  expectTypeOf(valMeta).toEqualTypeOf<EnumerateValueWithMeta>();
  expectTypeOf(valMeta).toEqualTypeOf<
    readonly [EnumerateValType, EnumerateValueMetadata]
  >();
});

test("EnumerateObj - should be a flat object with EnumerateVal values", () => {
  const obj: EnumerateFlatObject = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: 123,
    COMPLETED: ["completed", { description: "Task completed" }] as const,
  };

  expectTypeOf(obj).toEqualTypeOf<EnumerateFlatObject>();
});

test("EnumerateDict - should allow nested structure", () => {
  const dict: EnumerateNestedDict = {
    STATUS: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
    PRIORITY: {
      HIGH: 1,
      LOW: 0,
    },
    CODE: "simple-value",
  };

  expectTypeOf(dict).toEqualTypeOf<EnumerateNestedDict>();
});

test("EnumerateDict - should support deep nesting", () => {
  const deepDict: EnumerateNestedDict = {
    LEVEL1: {
      LEVEL2: {
        LEVEL3: {
          VALUE: "deep",
        },
      },
    },
  };

  expectTypeOf(deepDict).toEqualTypeOf<EnumerateNestedDict>();
});
