import { enumerate } from "@/core/enumerator";
import type { Options } from "@/types/enumerator";
import { expectTypeOf, test } from "vitest";

test("Options - should infer default maxDepth when no options provided", () => {
  const Status = enumerate({
    ACTIVE: "active",
    INACTIVE: "inactive",
  } as const);

  expectTypeOf(Status.ACTIVE).toHaveProperty("value");
  expectTypeOf(Status.ACTIVE).toHaveProperty("equals");
});

test("Options - should accept custom maxDepth option", () => {
  const Deep = enumerate(
    {
      L1: {
        L2: {
          L3: "value",
        },
      },
    } as const,
    { maxDepth: 5 },
  );

  expectTypeOf(Deep.L1.L2.L3).toHaveProperty("value");
});

test("Options - should type-check maxDepth value", () => {
  const options: Options = {
    maxDepth: 5,
  };

  expectTypeOf(options.maxDepth).toEqualTypeOf<number | undefined>();
});

test("Options - should work with const options", () => {
  const options = { maxDepth: 5 } as const;

  const Status = enumerate(
    {
      ACTIVE: "active",
      INACTIVE: "inactive",
    } as const,
    options,
  );

  expectTypeOf(Status.ACTIVE).toHaveProperty("value");
  expectTypeOf(Status.ACTIVE.value).toEqualTypeOf<"active">();
});

test("Options - overload should infer correctly without options", () => {
  const A = enumerate({
    VALUE: "value",
  } as const);

  expectTypeOf(A.VALUE.value).toEqualTypeOf<"value">();
});

test("Options - overload should infer correctly with options", () => {
  const B = enumerate(
    {
      VALUE: "value",
    } as const,
    { maxDepth: 5 },
  );

  expectTypeOf(B.VALUE.value).toEqualTypeOf<"value">();
});

test("Options - should preserve literal types with custom depth", () => {
  const HTTP = enumerate(
    {
      OK: [200, { message: "Success" }],
      ERROR: [500, { message: "Error" }],
    } as const,
    { maxDepth: 3 },
  );

  expectTypeOf(HTTP.OK.value).toEqualTypeOf<200>();
  expectTypeOf(HTTP.ERROR.value).toEqualTypeOf<500>();
  expectTypeOf(HTTP.OK.meta.message).toEqualTypeOf<"Success">();
});

test("Options - should handle undefined maxDepth", () => {
  const options: Options = {
    maxDepth: undefined,
  };

  const Status = enumerate(
    {
      ACTIVE: "active",
    } as const,
    options,
  );

  expectTypeOf(Status.ACTIVE).toHaveProperty("value");
});

test("Options - readonly options should work", () => {
  const options: Readonly<Options> = {
    maxDepth: 5,
  };

  const Status = enumerate(
    {
      ACTIVE: "active",
    } as const,
    options,
  );

  expectTypeOf(Status.ACTIVE.value).toEqualTypeOf<"active">();
});
