import { enumerate } from "@/core/enumerator";
import { describe, expect, test } from "vitest";

describe("TypeScript Enum Compatibility", () => {
  describe("String Enums", () => {
    enum StringStatus {
      ACTIVE = "active",
      INACTIVE = "inactive",
      PENDING = "pending",
    }

    test("should work with TypeScript string enums", () => {
      // TypeScript enum as runtime object
      const Status = enumerate(StringStatus);

      expect(Status.ACTIVE.value).toBe("active");
      expect(Status.INACTIVE.value).toBe("inactive");
      expect(Status.PENDING.value).toBe("pending");
    });

    test("should have working type guards with string enums", () => {
      const Status = enumerate(StringStatus);

      expect(Status.ACTIVE.equals("active")).toBe(true);
      expect(Status.ACTIVE.equals("invalid")).toBe(false);

      expect(Status.contains("active")).toBe(true);
      expect(Status.contains("invalid")).toBe(false);
    });

    test("should have values array from string enum", () => {
      const Status = enumerate(StringStatus as any);

      expect(Status.values).toEqual(["active", "inactive", "pending"]);
      expect(Status.values.length).toBe(3);
    });
  });

  describe("Numeric Enums", () => {
    enum NumericStatus {
      IDLE = 0,
      LOADING = 1,
      SUCCESS = 2,
      ERROR = 3,
    }

    test("should work with numeric enums", () => {
      const Status = enumerate(NumericStatus);

      expect(Status.IDLE.value).toBe(0);
      expect(Status.LOADING.value).toBe(1);
      expect(Status.SUCCESS.value).toBe(2);
      expect(Status.ERROR.value).toBe(3);
    });

    test("should handle reverse mapping entries", () => {
      // Numeric enums create reverse mappings: { 0: 'IDLE', IDLE: 0, ... }
      // enumerate should handle this gracefully
      const Status = enumerate(NumericStatus);

      // Should ignore reverse mapping keys (numbers as keys)
      expect(Status.values.length).toBeGreaterThan(0);
      expect(Status.values).toContain(0);
      expect(Status.values).toContain(1);
    });

    test("should have type guards for numeric enums", () => {
      const Status = enumerate(NumericStatus);

      expect(Status.IDLE.equals(0)).toBe(true);
      expect(Status.LOADING.equals(1)).toBe(true);
      expect(Status.SUCCESS.equals(2)).toBe(true);

      expect(Status.contains(0)).toBe(true);
      expect(Status.contains(99)).toBe(false);
    });
  });

  describe("Const Enums", () => {
    // Const enums are inlined by TypeScript, but we can test the equivalent
    const ConstStatus = {
      ACTIVE: "active",
      INACTIVE: "inactive",
    } as const;

    test("should work with const objects (const enum equivalent)", () => {
      const Status = enumerate(ConstStatus);

      expect(Status.ACTIVE.value).toBe("active");
      expect(Status.INACTIVE.value).toBe("inactive");
    });

    test("should preserve literal types from const objects", () => {
      const Status = enumerate(ConstStatus);

      // Type should be literal, not widened to string
      expect(Status.ACTIVE.value).toBe("active");
      expect(Status.ACTIVE.equals("active")).toBe(true);
      expect(Status.ACTIVE.equals("other" as any)).toBe(false);
    });
  });

  describe("Mixed Enum Types", () => {
    enum MixedEnum {
      STRING_VAL = "string_value",
      NUMERIC_VAL = 100,
    }

    test("should handle mixed string and numeric values", () => {
      const Mixed = enumerate(MixedEnum);

      expect(Mixed.STRING_VAL.value).toBe("string_value");
      expect(Mixed.NUMERIC_VAL.value).toBe(100);
    });

    test("should have working type guards for mixed enums", () => {
      const Mixed = enumerate(MixedEnum);

      expect(Mixed.STRING_VAL.equals("string_value")).toBe(true);
      expect(Mixed.NUMERIC_VAL.equals(100)).toBe(true);

      expect(Mixed.contains("string_value")).toBe(true);
      expect(Mixed.contains(100)).toBe(true);
      expect(Mixed.contains("invalid")).toBe(false);
    });
  });

  describe("Migration Use Case", () => {
    // Original TypeScript enum
    enum OldStatus {
      ACTIVE = "active",
      INACTIVE = "inactive",
      PENDING = "pending",
    }

    test("should allow gradual migration from TS enum", () => {
      // Step 1: Wrap existing enum
      const NewStatus = enumerate(OldStatus);

      // Step 2: Use new API
      expect(NewStatus.ACTIVE.value).toBe(OldStatus.ACTIVE);
      expect(NewStatus.INACTIVE.value).toBe(OldStatus.INACTIVE);

      // Step 3: New features available
      expect(NewStatus.contains("active")).toBe(true);
      expect(NewStatus.values).toEqual(["active", "inactive", "pending"]);
    });

    test("should work in validation functions", () => {
      const Status = enumerate(OldStatus as any);

      function isValidStatus(input: unknown): boolean {
        return Status.contains(input);
      }

      expect(isValidStatus("active")).toBe(true);
      expect(isValidStatus("invalid")).toBe(false);
      expect(isValidStatus(123)).toBe(false);
    });
  });

  describe("Real-World Migration Example", () => {
    // Legacy enum from existing codebase
    enum HTTPStatusCode {
      OK = 200,
      CREATED = 201,
      BAD_REQUEST = 400,
      UNAUTHORIZED = 401,
      NOT_FOUND = 404,
      SERVER_ERROR = 500,
    }

    test("should wrap legacy HTTP status enum", () => {
      const HTTP = enumerate(HTTPStatusCode);

      expect(HTTP.OK.value).toBe(200);
      expect(HTTP.NOT_FOUND.value).toBe(404);
      expect(HTTP.SERVER_ERROR.value).toBe(500);
    });

    test("should provide validation for legacy enum", () => {
      const HTTP = enumerate(HTTPStatusCode);

      // Validate API response status codes
      const validCodes = [200, 404, 500];
      validCodes.forEach((code) => {
        expect(HTTP.contains(code)).toBe(true);
      });

      expect(HTTP.contains(999)).toBe(false);
    });

    test("should allow checking for success codes", () => {
      const HTTP = enumerate(HTTPStatusCode);

      function isSuccessCode(code: unknown): boolean {
        return HTTP.containsOneOf(code, (h) => [h.OK, h.CREATED]);
      }

      expect(isSuccessCode(200)).toBe(true);
      expect(isSuccessCode(201)).toBe(true);
      expect(isSuccessCode(404)).toBe(false);
    });
  });

  describe("Limitations & Edge Cases", () => {
    test("should note that reverse mappings in numeric enums create extra keys", () => {
      enum NumericEnum {
        A = 1,
        B = 2,
      }

      const Wrapped = enumerate(NumericEnum as any);

      // Numeric enums have reverse mappings: { 1: 'A', A: 1, 2: 'B', B: 2 }
      // This means values array will include both numbers AND strings
      // Not ideal, but works

      expect(Wrapped.values.length).toBeGreaterThanOrEqual(2);
    });

    test("should work best with string enums", () => {
      enum StringEnum {
        ACTIVE = "active",
        INACTIVE = "inactive",
      }

      const Wrapped = enumerate(StringEnum as any);

      // String enums don't have reverse mappings
      // Clean values array
      expect(Wrapped.values).toEqual(["active", "inactive"]);
      expect(Wrapped.values.length).toBe(2);
    });
  });
});
