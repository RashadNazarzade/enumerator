import { describe, test, expect } from "vitest";
import {
  isEnumerateValue,
  isMetaData,
  isEnumerateValueWithMetadata,
  isNestedDict,
} from "@/core/guards/type-guards";

describe("Type Guards", () => {
  describe("isEnumerateValue", () => {
    test("should return true for strings", () => {
      expect(isEnumerateValue("active")).toBe(true);
      expect(isEnumerateValue("")).toBe(true);
      expect(isEnumerateValue("123")).toBe(true);
    });

    test("should return true for numbers", () => {
      expect(isEnumerateValue(0)).toBe(true);
      expect(isEnumerateValue(123)).toBe(true);
      expect(isEnumerateValue(-1)).toBe(true);
      expect(isEnumerateValue(3.14)).toBe(true);
      expect(isEnumerateValue(NaN)).toBe(true);
      expect(isEnumerateValue(Infinity)).toBe(true);
    });

    test("should return false for other types", () => {
      expect(isEnumerateValue(true)).toBe(false);
      expect(isEnumerateValue(false)).toBe(false);
      expect(isEnumerateValue(null)).toBe(false);
      expect(isEnumerateValue(undefined)).toBe(false);
      expect(isEnumerateValue({})).toBe(false);
      expect(isEnumerateValue([])).toBe(false);
      expect(isEnumerateValue(() => {})).toBe(false);
      expect(isEnumerateValue(Symbol("test"))).toBe(false);
      expect(isEnumerateValue(BigInt(123))).toBe(false);
    });
  });

  describe("isMetaData", () => {
    test("should return true for plain objects", () => {
      expect(isMetaData({})).toBe(true);
      expect(isMetaData({ description: "test" })).toBe(true);
      expect(isMetaData({ a: 1, b: 2 })).toBe(true);
      expect(isMetaData(Object.create(null))).toBe(true);
    });

    test("should return false for null", () => {
      expect(isMetaData(null)).toBe(false);
    });

    test("should return false for arrays", () => {
      expect(isMetaData([])).toBe(false);
      expect(isMetaData([1, 2, 3])).toBe(false);
      expect(isMetaData(["test"])).toBe(false);
    });

    test("should return false for primitives", () => {
      expect(isMetaData("string")).toBe(false);
      expect(isMetaData(123)).toBe(false);
      expect(isMetaData(true)).toBe(false);
      expect(isMetaData(undefined)).toBe(false);
    });

    test("should return true for class instances (edge case)", () => {
      class MyClass {}
      expect(isMetaData(new MyClass())).toBe(true);
      expect(isMetaData(new Date())).toBe(true);
    });
  });

  describe("isEnumerateValueWithMetadata", () => {
    test("should return true for valid metadata tuples", () => {
      expect(isEnumerateValueWithMetadata(["active", {}])).toBe(true);
      expect(
        isEnumerateValueWithMetadata(["active", { description: "test" }]),
      ).toBe(true);
      expect(isEnumerateValueWithMetadata([123, { category: "numbers" }])).toBe(
        true,
      );
    });

    test("should return false for non-arrays", () => {
      expect(isEnumerateValueWithMetadata("active")).toBe(false);
      expect(isEnumerateValueWithMetadata(123)).toBe(false);
      expect(isEnumerateValueWithMetadata({})).toBe(false);
      expect(isEnumerateValueWithMetadata(null)).toBe(false);
    });

    test("should return false for arrays with wrong length", () => {
      expect(isEnumerateValueWithMetadata([])).toBe(false);
      expect(isEnumerateValueWithMetadata(["active"])).toBe(false);
      expect(isEnumerateValueWithMetadata(["active", {}, "extra"])).toBe(false);
    });

    test("should return false if first element is not a value", () => {
      expect(isEnumerateValueWithMetadata([{}, {}])).toBe(false);
      expect(isEnumerateValueWithMetadata([null, {}])).toBe(false);
      expect(isEnumerateValueWithMetadata([[], {}])).toBe(false);
      expect(isEnumerateValueWithMetadata([true, {}])).toBe(false);
    });

    test("should return false if second element is not metadata", () => {
      expect(isEnumerateValueWithMetadata(["active", "not-object"])).toBe(
        false,
      );
      expect(isEnumerateValueWithMetadata(["active", 123])).toBe(false);
      expect(isEnumerateValueWithMetadata(["active", null])).toBe(false);
      expect(isEnumerateValueWithMetadata(["active", []])).toBe(false);
    });

    test("should handle edge cases", () => {
      // Empty string is valid value
      expect(isEnumerateValueWithMetadata(["", {}])).toBe(true);

      // Zero is valid value
      expect(isEnumerateValueWithMetadata([0, {}])).toBe(true);

      // Nested object as metadata
      expect(
        isEnumerateValueWithMetadata(["active", { nested: { deep: true } }]),
      ).toBe(true);
    });
  });

  describe("isNestedDict", () => {
    test("should return true for nested dictionaries", () => {
      expect(isNestedDict({ ACTIVE: "active" })).toBe(true);
      expect(isNestedDict({ nested: { value: "test" } })).toBe(true);
      expect(isNestedDict({})).toBe(true);
    });

    test("should return false for metadata tuples", () => {
      expect(isNestedDict(["active", {}])).toBe(false);
      expect(isNestedDict(["active", { description: "test" }])).toBe(false);
    });

    test("should return false for primitive values", () => {
      expect(isNestedDict("active")).toBe(false);
      expect(isNestedDict(123)).toBe(false);
      expect(isNestedDict(true)).toBe(false);
      expect(isNestedDict(null)).toBe(false);
      expect(isNestedDict(undefined)).toBe(false);
    });

    test("should return false for non-metadata objects", () => {
      expect(isNestedDict(null)).toBe(false);
      expect(isNestedDict([])).toBe(false);
    });

    test("should handle edge cases", () => {
      // Empty object is valid nested dict
      expect(isNestedDict({})).toBe(true);

      // Object.create(null) is valid
      expect(isNestedDict(Object.create(null))).toBe(true);

      // Class instances should be true (edge case)
      class MyClass {}
      expect(isNestedDict(new MyClass())).toBe(true);
    });
  });

  describe("Edge Cases - Type Guard Combinations", () => {
    test("should handle unusual but valid inputs", () => {
      // Empty string
      expect(isEnumerateValue("")).toBe(true);
      expect(isEnumerateValueWithMetadata(["", {}])).toBe(true);

      // Zero
      expect(isEnumerateValue(0)).toBe(true);
      expect(isEnumerateValueWithMetadata([0, {}])).toBe(true);

      // Negative numbers
      expect(isEnumerateValue(-1)).toBe(true);
      expect(isEnumerateValue(-Infinity)).toBe(true);

      // Special numbers
      expect(isEnumerateValue(NaN)).toBe(true);
      expect(isEnumerateValue(Infinity)).toBe(true);
    });

    test("should correctly differentiate between similar types", () => {
      const plainObject = { key: "value" };
      const metadataTuple = ["value", { description: "test" }];
      const array = ["value", "value2"];

      // Plain object
      expect(isMetaData(plainObject)).toBe(true);
      expect(isEnumerateValueWithMetadata(plainObject)).toBe(false);
      expect(isNestedDict(plainObject)).toBe(true);

      // Metadata tuple
      expect(isMetaData(metadataTuple)).toBe(false);
      expect(isEnumerateValueWithMetadata(metadataTuple)).toBe(true);
      expect(isNestedDict(metadataTuple)).toBe(false);

      // Regular array
      expect(isMetaData(array)).toBe(false);
      expect(isEnumerateValueWithMetadata(array)).toBe(false);
      expect(isNestedDict(array)).toBe(false);
    });
  });
});
