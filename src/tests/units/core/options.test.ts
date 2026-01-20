import { EnumeratorDepthError } from "@/constants/errors";
import { enumerate } from "@/core/enumerator";
import type { Options } from "@/types/enumerator";
import { describe, expect, test } from "vitest";

describe("Options - Runtime Behavior", () => {
  describe("maxDepth option", () => {
    test("should use default maxDepth (10) when no options provided", () => {
      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: "value" };
        return { LEVEL: createDeep(depth - 1) };
      };

      expect(() => enumerate(createDeep(9))).not.toThrow();

      expect(() => enumerate(createDeep(10))).toThrow(EnumeratorDepthError);
    });

    test("should respect custom maxDepth option", () => {
      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: "value" };
        return { LEVEL: createDeep(depth - 1) };
      };

      const options: Options = { maxDepth: 5 };

      expect(() => enumerate(createDeep(4), options)).not.toThrow();

      expect(() => enumerate(createDeep(5), options)).toThrow(
        EnumeratorDepthError,
      );
    });

    test("should allow depth of 1 (minimal nesting)", () => {
      expect(() =>
        enumerate(
          {
            FLAT: "value",
          },
          { maxDepth: 1 },
        ),
      ).not.toThrow();

      expect(() =>
        enumerate(
          {
            NESTED: {
              VALUE: "value",
            },
          },
          { maxDepth: 1 },
        ),
      ).toThrow(EnumeratorDepthError);
    });

    test("should work with very high maxDepth", () => {
      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: "value" };
        return { LEVEL: createDeep(depth - 1) };
      };

      expect(() => enumerate(createDeep(19), { maxDepth: 20 })).not.toThrow();
    });
  });

  describe("Options object behavior", () => {
    test("should work with options as const", () => {
      const options = { maxDepth: 5 } as const;

      const Status = enumerate(
        {
          ACTIVE: "active",
          INACTIVE: "inactive",
        },
        options,
      );

      expect(Status.ACTIVE.value).toBe("active");
      expect(Status.INACTIVE.value).toBe("inactive");
    });

    test("should work with inline options", () => {
      const Status = enumerate(
        {
          ACTIVE: "active",
        },
        { maxDepth: 3 },
      );

      expect(Status.ACTIVE.value).toBe("active");
    });

    test("should work with undefined maxDepth (falls back to default)", () => {
      const options: Options = {
        maxDepth: undefined,
      };

      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: "value" };
        return { LEVEL: createDeep(depth - 1) };
      };

      expect(() => enumerate(createDeep(9), options)).not.toThrow();
      expect(() => enumerate(createDeep(10), options)).toThrow(
        EnumeratorDepthError,
      );
    });

    test("should work with reused options object", () => {
      const options: Options = { maxDepth: 3 };

      const Status1 = enumerate({ A: "a" }, options);
      const Status2 = enumerate({ B: "b" }, options);

      expect(Status1.A.value).toBe("a");
      expect(Status2.B.value).toBe("b");
    });
  });

  describe("Options with different enum structures", () => {
    test("should work with flat enums", () => {
      const Flat = enumerate(
        {
          ONE: 1,
          TWO: 2,
          THREE: 3,
        },
        { maxDepth: 1 },
      );

      expect(Flat.ONE.value).toBe(1);
      expect(Flat.values).toEqual([1, 2, 3]);
    });

    test("should work with metadata tuples", () => {
      const WithMeta = enumerate(
        {
          ACTIVE: ["active", { icon: "✅" }],
          INACTIVE: ["inactive", { icon: "⭕" }],
        } as const,
        { maxDepth: 2 },
      );

      expect(WithMeta.ACTIVE.value).toBe("active");
      expect(WithMeta.ACTIVE.meta.icon).toBe("✅");
    });

    test("should work with nested structures", () => {
      const API = enumerate(
        {
          V1: {
            USERS: "/v1/users",
            POSTS: "/v1/posts",
          },
          V2: {
            USERS: "/v2/users",
          },
        },
        { maxDepth: 3 },
      );

      expect(API.V1.USERS.value).toBe("/v1/users");
      expect(API.V2.USERS.value).toBe("/v2/users");
    });

    test("should work with mixed structures", () => {
      const Mixed = enumerate(
        {
          FLAT: "flat",
          NESTED: {
            VALUE: "nested",
          },
          WITH_META: ["meta", { description: "test" }],
        } as const,
        { maxDepth: 5 },
      );

      expect(Mixed.FLAT.value).toBe("flat");
      expect(Mixed.NESTED.VALUE.value).toBe("nested");
      expect(Mixed.WITH_META.value).toBe("meta");
      expect(Mixed.WITH_META.meta.description).toBe("test");
    });
  });

  describe("Options validation", () => {
    test("should throw on depth exceeded with custom maxDepth", () => {
      try {
        enumerate(
          {
            L1: { L2: { L3: { L4: { L5: "too-deep" } } } },
          },
          { maxDepth: 3 },
        );
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(EnumeratorDepthError);
        const message = (error as Error).message;
        expect(message).toContain("Maximum nesting depth (3) exceeded");
      }
    });

    test("should include path in depth error", () => {
      try {
        enumerate(
          {
            OUTER: {
              INNER: {
                DEEP: {
                  TOO_DEEP: "value",
                },
              },
            },
          },
          { maxDepth: 2 },
        );
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(EnumeratorDepthError);
        const message = (error as Error).message;
        expect(message).toContain("Path:");
      }
    });
  });

  describe("Options with TypeScript enums", () => {
    test("should work with string enums", () => {
      enum StringEnum {
        ACTIVE = "active",
        INACTIVE = "inactive",
      }

      const Status = enumerate(StringEnum, { maxDepth: 1 });

      expect(Status.ACTIVE.value).toBe("active");
      expect(Status.INACTIVE.value).toBe("inactive");
    });

    test("should work with numeric enums", () => {
      enum NumericEnum {
        ZERO = 0,
        ONE = 1,
        TWO = 2,
      }

      const Numbers = enumerate(NumericEnum, { maxDepth: 1 });

      expect(Numbers.ZERO.value).toBe(0);
      expect(Numbers.ONE.value).toBe(1);
    });
  });
});
