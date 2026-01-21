import { enumerate } from "@/core/enumerator";
import { describe, expectTypeOf, test } from "vitest";

import type { InferType, InferUnionType } from "@/types/base";

describe("Type Infers", () => {
  test("should infer the correct type", () => {
    const Status = enumerate({
      ACTIVE: "active",
      INACTIVE: "inactive",
    });

    expectTypeOf<typeof Status.asValueType>().toEqualTypeOf<
      "active" | "inactive"
    >();
    expectTypeOf<typeof Status.asType>().toEqualTypeOf<{
      readonly ACTIVE: "active";
      readonly INACTIVE: "inactive";
    }>();
  });

  test("should infer type works correctly", () => {
    const Status = enumerate({
      ACTIVE: "active",
      INACTIVE: "inactive",
    });

    expectTypeOf<InferUnionType<typeof Status>>().toEqualTypeOf<
      "active" | "inactive"
    >();
    expectTypeOf<InferType<typeof Status>>().toEqualTypeOf<{
      readonly ACTIVE: "active";
      readonly INACTIVE: "inactive";
    }>();
  });
});
