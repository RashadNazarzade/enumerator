import { bench, describe } from 'vitest';
import { enumerator } from '@/core/enumerator';
import type { Dict } from '@/types/enumerator';


const createNested = (depth: number, width: number = 3): Dict => {
  if (depth === 0) return { LEAF: 'value' };
  
  const result: Dict = {};
  for (let i = 0; i < width; i++) {
    result[`LEVEL_${i}`] = createNested(depth - 1, width);
  }
  return result;
};

const createFlat = (count: number): Dict => {
  const result: Dict = {};
  for (let i = 0; i < count; i++) {
    result[`KEY_${i}`] = `value_${i}`;
  }
  return result;
};

const createMixed = (count: number): Dict => {
  const result: Dict = {};
  for (let i = 0; i < count; i++) {
    if (i % 3 === 0) {
      result[`VAL_${i}`] = `value_${i}`;
    } else if (i % 3 === 1) {
      result[`META_${i}`] = [`meta_${i}`, { description: `Description ${i}` }] as const;
    } else {
      result[`NESTED_${i}`] = { INNER: `inner_${i}` };
    }
  }
  return result;
};

describe('Core Enumerator Performance', () => {
  describe('Small Enums (10 entries)', () => {
    const smallFlat = createFlat(10);
    const smallMixed = createMixed(10);

    bench('flat enum (10 entries)', () => {
      enumerator(smallFlat);
    });

    bench('mixed enum (10 entries)', () => {
      enumerator(smallMixed);
    });
  });

  describe('Medium Enums (100 entries)', () => {
    const mediumFlat = createFlat(100);
    const mediumMixed = createMixed(100);

    bench('flat enum (100 entries)', () => {
      enumerator(mediumFlat);
    });

    bench('mixed enum (100 entries)', () => {
      enumerator(mediumMixed);
    });
  });

  describe('Large Enums (1000 entries)', () => {
    const largeFlat = createFlat(1000);
    const largeMixed = createMixed(1000);

    bench('flat enum (1000 entries)', () => {
      enumerator(largeFlat);
    });

    bench('mixed enum (1000 entries)', () => {
      enumerator(largeMixed);
    });
  });

  describe('Deep Nesting', () => {
    const depth3 = createNested(3);
    const depth5 = createNested(5);
    const depth7 = createNested(7);

    bench('nested enum (depth 3)', () => {
      enumerator(depth3);
    });

    bench('nested enum (depth 5)', () => {
      enumerator(depth5);
    });

    bench('nested enum (depth 7)', () => {
      enumerator(depth7);
    });
  });

  describe('Wide Nesting', () => {
    const width5 = createNested(3, 5);
    const width10 = createNested(3, 10);

    bench('nested enum (width 5, depth 3)', () => {
      enumerator(width5);
    });

    bench('nested enum (width 10, depth 3)', () => {
      enumerator(width10);
    });
  });

  describe('Real-world Examples', () => {
    const httpStatus = {
      SUCCESS: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
      },
      REDIRECT: {
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        NOT_MODIFIED: 304,
      },
      CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
      },
      SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
      },
    } as const;

    const userStatus = {
      ACTIVE: ['active', { description: 'User is active' }] as const,
      INACTIVE: ['inactive', { description: 'User is inactive' }] as const,
      PENDING: ['pending', { description: 'Awaiting approval' }] as const,
      SUSPENDED: ['suspended', { description: 'Account suspended' }] as const,
      DELETED: ['deleted', { description: 'Account deleted' }] as const,
    };

    bench('HTTP status codes', () => {
      enumerator(httpStatus);
    });

    bench('User status with metadata', () => {
      enumerator(userStatus);
    });
  });
});
