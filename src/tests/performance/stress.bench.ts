import { enumerate } from "@/core/enumerator";
import type { Dict } from "@/types/enumerator";
import { bench, describe } from "vitest";

/**
 * Stress tests to validate performance under extreme conditions
 */

describe("Stress Tests", () => {
  describe("Very Large Flat Enums", () => {
    const createLarge = (size: number): Dict => {
      const obj: Dict = {};
      for (let i = 0; i < size; i++) {
        obj[`KEY_${i}`] = `value_${i}`;
      }
      return obj;
    };

    bench("5,000 entries", () => {
      enumerate(createLarge(5000));
    });

    bench("10,000 entries", () => {
      enumerate(createLarge(10000));
    });
  });

  describe("Maximum Depth (Near Limit)", () => {
    const createDeep = (depth: number): any => {
      if (depth === 0) return { LEAF: "value" };
      return { LEVEL: createDeep(depth - 1) };
    };

    bench("depth 8 (near max 10)", () => {
      enumerate(createDeep(8), { maxDepth: 10 });
    });

    bench("depth 9 (at max 10)", () => {
      enumerate(createDeep(9), { maxDepth: 10 });
    });
  });

  describe("Wide Shallow Structures", () => {
    const createWide = (width: number): Dict => {
      const obj: Dict = {};
      for (let i = 0; i < width; i++) {
        obj[`CATEGORY_${i}`] = {
          VALUE_A: `a_${i}`,
          VALUE_B: `b_${i}`,
          VALUE_C: `c_${i}`,
        };
      }
      return obj;
    };

    bench("100 categories", () => {
      enumerate(createWide(100));
    });

    bench("500 categories", () => {
      enumerate(createWide(500));
    });
  });

  describe("Heavy Metadata Usage", () => {
    const createWithMeta = (count: number): Dict => {
      const obj: Dict = {};
      for (let i = 0; i < count; i++) {
        obj[`KEY_${i}`] = [
          `value_${i}`,
          {
            description: `Description for key ${i}` as string,
            category: `Category ${i % 10}` as string,
            deprecated: i % 5 === 0,
            since: `v${i}.0.0` as string,
            tags: [`tag1`, `tag2`, `tag3`] as string[],
          },
        ] as const;
      }
      return obj;
    };

    bench("1,000 with metadata", () => {
      enumerate(createWithMeta(1000));
    });
  });

  describe("Complex Mixed Structures", () => {
    const complexEnum = {
      API: {
        V1: {
          USERS: {
            CREATE: ["POST /users", { description: "Create user" }] as const,
            READ: ["GET /users/:id", { description: "Get user" }] as const,
            UPDATE: ["PUT /users/:id", { description: "Update user" }] as const,
            DELETE: [
              "DELETE /users/:id",
              { description: "Delete user" },
            ] as const,
          },
          POSTS: {
            CREATE: ["POST /posts", { description: "Create post" }] as const,
            READ: ["GET /posts/:id", { description: "Get post" }] as const,
            UPDATE: ["PUT /posts/:id", { description: "Update post" }] as const,
            DELETE: [
              "DELETE /posts/:id",
              { description: "Delete post" },
            ] as const,
          },
        },
        V2: {
          USERS: {
            CREATE: [
              "POST /v2/users",
              { description: "Create user v2" },
            ] as const,
            READ: [
              "GET /v2/users/:id",
              { description: "Get user v2" },
            ] as const,
          },
        },
      },
      STATUS: {
        HTTP: {
          SUCCESS: {
            OK: 200,
            CREATED: 201,
            ACCEPTED: 202,
          },
          ERROR: {
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
          },
        },
        USER: {
          ACTIVE: "active",
          INACTIVE: "inactive",
          PENDING: "pending",
        },
      },
    } as const;

    bench("complex API + status enum", () => {
      enumerate(complexEnum);
    });
  });

  describe("Repeated Operations (Simulates Real Usage)", () => {
    const Status = enumerate({
      ACTIVE: "active",
      INACTIVE: "inactive",
      PENDING: "pending",
    });

    bench("10,000 type guard checks", () => {
      const values = ["active", "inactive", "pending", "invalid"];
      for (let i = 0; i < 10000; i++) {
        Status.contains(values[i % values.length]);
      }
    });

    bench("10,000 value accesses", () => {
      for (let i = 0; i < 10000; i++) {
        Status.ACTIVE.value;
        Status.INACTIVE.value;
        Status.PENDING.value;
      }
    });

    bench("10,000 containsOneOf checks", () => {
      for (let i = 0; i < 10000; i++) {
        Status.containsOneOf("active", ["active", "pending"]);
      }
    });
  });
});
