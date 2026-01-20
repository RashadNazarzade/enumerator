import { expectTypeOf, test } from "vitest";
import type { ObjectGenerator } from "@/types/generators";
import type { ValueFeature } from "@/types/features";

test("ObjectGenerator - should generate ValueFeature for simple values", () => {
  type SimpleEnum = {
    ACTIVE: "active";
    INACTIVE: "inactive";
  };

  type Generated = ObjectGenerator<SimpleEnum>;

  expectTypeOf<Generated["ACTIVE"]>().toEqualTypeOf<ValueFeature<"active">>();
  expectTypeOf<Generated["INACTIVE"]>().toEqualTypeOf<
    ValueFeature<"inactive">
  >();
});

test("ObjectGenerator - should handle numeric values", () => {
  type NumericEnum = {
    ONE: 1;
    TWO: 2;
    THREE: 3;
  };

  type Generated = ObjectGenerator<NumericEnum>;

  expectTypeOf<Generated["ONE"]>().toEqualTypeOf<ValueFeature<1>>();
  expectTypeOf<Generated["TWO"]>().toEqualTypeOf<ValueFeature<2>>();
});

test("ObjectGenerator - should handle values with metadata", () => {
  type EnumWithMeta = {
    ACTIVE: readonly ["active", { description: "Active status" }];
    INACTIVE: "inactive";
  };

  type Generated = ObjectGenerator<EnumWithMeta>;

  expectTypeOf<Generated["ACTIVE"]>().toEqualTypeOf<
    ValueFeature<readonly ["active", { description: "Active status" }]>
  >();
});

test("ObjectGenerator - should recursively handle nested dictionaries", () => {
  type NestedEnum = {
    STATUS: {
      ACTIVE: "active";
      INACTIVE: "inactive";
    };
    PRIORITY: {
      HIGH: 1;
      LOW: 0;
    };
  };

  type Generated = ObjectGenerator<NestedEnum>;

  expectTypeOf<Generated["STATUS"]>().toEqualTypeOf<
    ObjectGenerator<{
      ACTIVE: "active";
      INACTIVE: "inactive";
    }>
  >();

  expectTypeOf<Generated["STATUS"]["ACTIVE"]>().toEqualTypeOf<
    ValueFeature<"active">
  >();
});

test("ObjectGenerator - should add ObjectFeature when dict has values", () => {
  type FlatEnum = {
    ACTIVE: "active";
    INACTIVE: "inactive";
    PENDING: "pending";
  };

  type Generated = ObjectGenerator<FlatEnum>;

  // Should have ObjectFeature methods
  expectTypeOf<Generated>().toMatchObjectType<{
    contains: (check: unknown) => check is "active" | "inactive" | "pending";
  }>();
});

test("ObjectGenerator - should handle mixed nested and flat values", () => {
  type MixedEnum = {
    SIMPLE: "simple";
    NESTED: {
      INNER1: "inner1";
      INNER2: "inner2";
    };
    ANOTHER: "another";
  };

  type Generated = ObjectGenerator<MixedEnum>;

  expectTypeOf<Generated["SIMPLE"]>().toEqualTypeOf<ValueFeature<"simple">>();
  expectTypeOf<Generated["NESTED"]>().toEqualTypeOf<
    ObjectGenerator<{
      INNER1: "inner1";
      INNER2: "inner2";
    }>
  >();
  expectTypeOf<Generated["ANOTHER"]>().toEqualTypeOf<ValueFeature<"another">>();
});

test("ObjectGenerator - should handle deep nesting (3 levels)", () => {
  type DeepEnum = {
    LEVEL1: {
      LEVEL2: {
        LEVEL3: "deep-value";
      };
    };
  };

  type Generated = ObjectGenerator<DeepEnum>;

  expectTypeOf<Generated["LEVEL1"]["LEVEL2"]["LEVEL3"]>().toEqualTypeOf<
    ValueFeature<"deep-value">
  >();
});

test("ObjectGenerator - should preserve const assertions", () => {
  const myEnum = {
    STATUS: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
    CODE: 123,
  } as const;

  type Generated = ObjectGenerator<typeof myEnum>;

  expectTypeOf<Generated["STATUS"]["ACTIVE"]>().toEqualTypeOf<
    ValueFeature<"active">
  >();
  expectTypeOf<Generated["CODE"]>().toEqualTypeOf<ValueFeature<123>>();
});

test("ObjectGenerator - should work with empty nested objects", () => {
  type EmptyNested = {
    EMPTY: Record<string, never>;
    VALUE: "value";
  };

  type Generated = ObjectGenerator<EmptyNested>;

  expectTypeOf<Generated["VALUE"]>().toEqualTypeOf<ValueFeature<"value">>();
});

test("ObjectGenerator - should handle complex real-world scenario", () => {
  type HttpStatus = {
    SUCCESS: {
      OK: 200;
      CREATED: 201;
      ACCEPTED: 202;
    };
    CLIENT_ERROR: {
      BAD_REQUEST: 400;
      UNAUTHORIZED: 401;
      FORBIDDEN: 403;
      NOT_FOUND: 404;
    };
    SERVER_ERROR: {
      INTERNAL: 500;
      BAD_GATEWAY: 502;
    };
  };

  type Generated = ObjectGenerator<HttpStatus>;

  expectTypeOf<Generated["SUCCESS"]["OK"]>().toEqualTypeOf<ValueFeature<200>>();
  expectTypeOf<Generated["CLIENT_ERROR"]["NOT_FOUND"]>().toEqualTypeOf<
    ValueFeature<404>
  >();
  expectTypeOf<Generated["SERVER_ERROR"]["INTERNAL"]>().toEqualTypeOf<
    ValueFeature<500>
  >();

  expectTypeOf<Generated["SUCCESS"]>().toMatchObjectType<{
    contains: (check: unknown) => check is 200 | 201 | 202;
  }>();
});
