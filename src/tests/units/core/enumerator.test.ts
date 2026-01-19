import { describe, test, expect } from 'vitest';
import { enumerator } from '@/core/enumerator';
import { EnumeratorDepthError } from '@/constants/errors';

describe('Enumerator - Core Functionality', () => {
  describe('Basic Enum Creation', () => {
    test('should create simple flat enum', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const);

      expect(Status.ACTIVE.value).toBe('active');
      expect(Status.INACTIVE.value).toBe('inactive');
      expect(Status.ACTIVE.equals('active')).toBe(true);
      expect(Status.INACTIVE.equals('inactive')).toBe(true);
    });

    test('should create enum with numbers', () => {
      const Priority = enumerator({
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      } as const);

      expect(Priority.HIGH.value).toBe(1);
      expect(Priority.MEDIUM.value).toBe(2);
      expect(Priority.LOW.value).toBe(3);
    });

    test('should create enum with metadata', () => {
      const Status = enumerator({
        ACTIVE: ['active', { description: 'User is active' }] as const,
        INACTIVE: ['inactive', { description: 'User is inactive' }] as const,
      });

      expect(Status.ACTIVE.value).toBe('active');
      expect(Status.ACTIVE.meta).toEqual({ description: 'User is active' });
      expect(Status.INACTIVE.value).toBe('inactive');
      expect(Status.INACTIVE.meta).toEqual({ description: 'User is inactive' });
    });

    test('should create mixed enum (values + metadata)', () => {
      const Mixed = enumerator({
        SIMPLE: 'simple',
        WITH_META: ['meta', { description: 'Has metadata' }] as const,
        NUMBER: 123,
      } as const);

      expect(Mixed.SIMPLE.value).toBe('simple');
      expect(Mixed.WITH_META.value).toBe('meta');
      expect(Mixed.WITH_META.meta).toBeDefined();
      expect(Mixed.NUMBER.value).toBe(123);
    });
  });

  describe('Nested Enums', () => {
    test('should handle nested structure', () => {
      const Config = enumerator({
        API: {
          SUCCESS: 200,
          ERROR: 400,
        },
        STATUS: {
          ACTIVE: 'active',
          INACTIVE: 'inactive',
        },
      } as const);

      expect(Config.API.SUCCESS.value).toBe(200);
      expect(Config.API.ERROR.value).toBe(400);
      expect(Config.STATUS.ACTIVE.value).toBe('active');
      expect(Config.STATUS.INACTIVE.value).toBe('inactive');
    });

    test('should handle deep nesting', () => {
      const Deep = enumerator({
        LEVEL1: {
          LEVEL2: {
            LEVEL3: {
              VALUE: 'deep',
            },
          },
        },
      } as const);

      expect(Deep.LEVEL1.LEVEL2.LEVEL3.VALUE.value).toBe('deep');
    });

    test('should handle mixed nested and flat', () => {
      const Mixed = enumerator({
        FLAT: 'flat-value',
        NESTED: {
          INNER: 'inner-value',
        },
        ANOTHER: 'another-value',
      } as const);

      expect(Mixed.FLAT.value).toBe('flat-value');
      expect(Mixed.NESTED.INNER.value).toBe('inner-value');
      expect(Mixed.ANOTHER.value).toBe('another-value');
    });
  });

  describe('ObjectFeature Methods', () => {
    test('should add contains method to flat enums', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
      } as const);

      expect(Status.contains('active')).toBe(true);
      expect(Status.contains('inactive')).toBe(true);
      expect(Status.contains('pending')).toBe(true);
      expect(Status.contains('invalid')).toBe(false);
      expect(Status.contains(123)).toBe(false);
    });

    test('should add contains to nested levels', () => {
      const Config = enumerator({
        HTTP: {
          SUCCESS: 200,
          ERROR: 400,
        },
      } as const);

      expect(Config.HTTP.contains(200)).toBe(true);
      expect(Config.HTTP.contains(400)).toBe(true);
      expect(Config.HTTP.contains(404)).toBe(false);
    });

    test('should have containsOneOf method', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
      } as const);

      // Array variant
      expect(Status.containsOneOf('active', ['active', 'pending'])).toBe(true);
      expect(Status.containsOneOf('inactive', ['active', 'pending'])).toBe(false);

      // Rest params variant
      expect(Status.containsOneOf('active', 'active', 'pending')).toBe(true);

      // Callback variant
      expect(Status.containsOneOf('active', (s) => [s.ACTIVE, s.PENDING])).toBe(true);
      expect(Status.containsOneOf('inactive', (s) => [s.ACTIVE, s.PENDING])).toBe(false);
    });

    test('should have values array', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const);

      expect(Status.values).toContain('active');
      expect(Status.values).toContain('inactive');
      expect(Status.values.length).toBe(2);
      expect(Object.isFrozen(Status.values)).toBe(true);
    });

    test('should have asType property', () => {
      const Status = enumerator({
        ACTIVE: ['active', { description: 'Active' }] as const,
        INACTIVE: 'inactive',
      } as const);

      expect(Status.asType.ACTIVE).toBe('active');
      expect(Status.asType.INACTIVE).toBe('inactive');
      expect(Object.isFrozen(Status.asType)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string values', () => {
      const Empty = enumerator({
        EMPTY: '',
      } as const);

      expect(Empty.EMPTY.value).toBe('');
      expect(Empty.EMPTY.equals('')).toBe(true);
      expect(Empty.contains('')).toBe(true);
    });

    test('should handle zero values', () => {
      const Zero = enumerator({
        ZERO: 0,
      } as const);

      expect(Zero.ZERO.value).toBe(0);
      expect(Zero.ZERO.equals(0)).toBe(true);
      expect(Zero.ZERO.equals(false)).toBe(false); // Strict equality
      expect(Zero.contains(0)).toBe(true);
    });

    test('should handle negative numbers', () => {
      const Negative = enumerator({
        MINUS_ONE: -1,
        MINUS_INFINITY: -Infinity,
      } as const);

      expect(Negative.MINUS_ONE.value).toBe(-1);
      expect(Negative.MINUS_INFINITY.value).toBe(-Infinity);
    });

    test('should handle special numbers', () => {
      const Special = enumerator({
        NAN: NaN,
        INFINITY: Infinity,
      } as const);

      expect(Special.NAN.value).toBe(NaN);
      expect(Special.INFINITY.value).toBe(Infinity);
      expect(Special.NAN.equals(NaN)).toBe(true); // Object.is(NaN, NaN) → true
      expect(Special.INFINITY.equals(Infinity)).toBe(true);
    });

    test('should handle single value enum', () => {
      const Single = enumerator({
        ONLY: 'only',
      } as const);

      expect(Single.ONLY.value).toBe('only');
      expect(Single.contains('only')).toBe(true);
      expect(Single.values.length).toBe(1);
    });

    test('should handle large number of values', () => {
      const obj: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        obj[`KEY_${i}`] = `value_${i}`;
      }

      const Large = enumerator(obj);

      expect(Large?.KEY_0?.value).toBe('value_0');
      expect(Large?.KEY_99?.value).toBe('value_99');
      expect(Large.values.length).toBe(100);
      expect(Large.contains('value_50')).toBe(true);
    });

    test('should handle empty object at nested level', () => {
      const WithEmpty = enumerator({
        EMPTY: {},
        VALUE: 'value',
      } as const);

      expect(WithEmpty.VALUE.value).toBe('value');
      expect(WithEmpty.EMPTY).toBeDefined();
    });
  });

  describe('Depth Limiting', () => {
    test('should enforce default maxDepth (10)', () => {
      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: 'value' };
        return { LEVEL: createDeep(depth - 1) };
      };

      // Depth 9 should work (0-9 = 10 levels)
      expect(() => {
        enumerator(createDeep(9));
      }).not.toThrow();

      // Depth 10 should throw (0-10 = 11 levels)
      expect(() => {
        enumerator(createDeep(10));
      }).toThrow(EnumeratorDepthError);
    });

    test('should respect custom maxDepth', () => {
      const deep = {
        L1: { L2: { L3: { L4: { L5: 'value' } } } },
      } as const;

      // Should throw with maxDepth 3
      expect(() => {
        enumerator(deep, { maxDepth: 3 });
      }).toThrow(EnumeratorDepthError);

      // Should work with maxDepth 5
      expect(() => {
        enumerator(deep, { maxDepth: 5 });
      }).not.toThrow();
    });

    test('should include path in depth error', () => {
      const deep = {
        API: {
          V1: {
            USERS: {
              ENDPOINTS: {
                CREATE: {
                  TOO: {
                    DEEP: {
                      VALUE: {
                        HERE: {
                          IS: {
                            THE: {
                              PROBLEM: 'value',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      try {
        enumerator(deep);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EnumeratorDepthError);
        expect((error as Error).message).toContain('Path:');
      }
    });
  });

  describe('Type Guard Functionality', () => {
    test('equals should narrow types', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const);

      const checkStatus = (input: unknown) => {
        if (Status.ACTIVE.equals(input)) {
          // Type should be narrowed
          const typed: 'active' = input;
          expect(typed).toBe('active');
          return true;
        }
        return false;
      };

      expect(checkStatus('active')).toBe(true);
      expect(checkStatus('other')).toBe(false);
    });

    test('contains should narrow types', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const);

      const checkStatus = (input: unknown) => {
        if (Status.contains(input)) {
          // Type should be narrowed to 'active' | 'inactive'
          expect(['active', 'inactive']).toContain(input);
          return true;
        }
        return false;
      };

      expect(checkStatus('active')).toBe(true);
      expect(checkStatus('invalid')).toBe(false);
    });
  });

  describe('Real-World Scenarios', () => {
    test('HTTP status codes', () => {
      const HttpStatus = enumerator({
        SUCCESS: {
          OK: 200,
          CREATED: 201,
          NO_CONTENT: 204,
        },
        ERROR: {
          BAD_REQUEST: 400,
          UNAUTHORIZED: 401,
          NOT_FOUND: 404,
          INTERNAL_ERROR: 500,
        },
      } as const);

      expect(HttpStatus.SUCCESS.OK.value).toBe(200);
      expect(HttpStatus.ERROR.NOT_FOUND.value).toBe(404);
      expect(HttpStatus.SUCCESS.contains(200)).toBe(true);
      expect(HttpStatus.ERROR.contains(404)).toBe(true);
      expect(HttpStatus.SUCCESS.contains(404)).toBe(false);
    });

    test('User permissions', () => {
      const Permissions = enumerator({
        ADMIN: ['admin', { description: 'Full access' }] as const,
        EDITOR: ['editor', { description: 'Can edit content' }] as const,
        VIEWER: ['viewer', { description: 'Read-only access' }] as const,
      });

      expect(Permissions.ADMIN.value).toBe('admin');
      expect(Permissions.ADMIN.meta.description).toBe('Full access');
      expect(Permissions.contains('admin')).toBe(true);
      expect(Permissions.containsOneOf('editor', ['admin', 'editor'])).toBe(true);
    });

    test('API routes', () => {
      const Routes = enumerator({
        API: {
          V1: {
            USERS: '/api/v1/users',
            POSTS: '/api/v1/posts',
          },
          V2: {
            USERS: '/api/v2/users',
            POSTS: '/api/v2/posts',
          },
        },
      } as const);

      expect(Routes.API.V1.USERS.value).toBe('/api/v1/users');
      expect(Routes.API.V2.POSTS.value).toBe('/api/v2/posts');
      expect(Routes.API.V1.contains('/api/v1/users')).toBe(true);
    });
  });
});
