import { enumerate } from "@/core/enumerator";
import { bench, describe } from "vitest";

const Status = enumerate({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
  DELETED: "deleted",
  ARCHIVED: "archived",
  BLOCKED: "blocked",
  UNVERIFIED: "unverified",
});

const values = [
  "active",
  "inactive",
  "pending",
  "invalid",
  "test",
  "foo",
  "bar",
  "baz",
];

describe("Feature Method Performance", () => {
  describe("equals() - Type Guards", () => {
    bench("equals() - match", () => {
      void Status.ACTIVE.equals("active");
    });

    bench("equals() - no match", () => {
      void Status.ACTIVE.equals("invalid");
    });

    bench("equals() - 1000 checks", () => {
      for (let i = 0; i < 1000; i++) {
        Status.ACTIVE.equals(values[i % values.length]);
      }
    });
  });

  describe("contains() - Type Guards", () => {
    bench("contains() - match", () => {
      void Status.contains("active");
    });

    bench("contains() - no match", () => {
      void Status.contains("invalid");
    });

    bench("contains() - 1000 checks", () => {
      for (let i = 0; i < 1000; i++) {
        Status.contains(values[i % values.length]);
      }
    });
  });

  describe("containsOneOf() - Type Guards", () => {
    bench("containsOneOf() - array variant", () => {
      void Status.containsOneOf("active", ["active", "inactive"]);
    });

    bench("containsOneOf() - rest params variant", () => {
      void Status.containsOneOf("active", "active", "inactive");
    });

    bench("containsOneOf() - callback variant", () => {
      void Status.containsOneOf("active", (s) => [s.ACTIVE, s.INACTIVE]);
    });

    bench("containsOneOf() - 1000 checks (array)", () => {
      for (let i = 0; i < 1000; i++) {
        Status.containsOneOf(values[i % values.length], [
          "active",
          "inactive",
          "pending",
        ]);
      }
    });
  });

  describe("Lazy Property Access", () => {
    bench("asType - first access", () => {
      const S = enumerate({ A: "a", B: "b", C: "c" });
      void S.asType; // First access computes
    });

    bench("asType - cached access", () => {
      void Status.asType; // Already cached
    });

    bench("asType - 1000 accesses (cached)", () => {
      for (let i = 0; i < 1000; i++) {
        void Status.asType;
      }
    });

    bench("values - array access", () => {
      void Status.values[0];
    });

    bench("values - iteration", () => {
      for (const _val of Status.values) {
        void _val;
      }
    });
  });
});
