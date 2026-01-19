import { expectTypeOf, test } from 'vitest';
import type { EnumerateGenerator, Dict } from '@/types/enumerator';
import type { ObjectGenerator } from '@/types/generators';
import type { EnumerateNestedDict } from '@/types/base';

test('Enumerate - should generate ObjectGenerator for valid dict', () => {
  type MyEnum = {
    ACTIVE: 'active';
    INACTIVE: 'inactive';
  };

  type Generated = EnumerateGenerator<MyEnum>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<MyEnum>>();
});

test('Enumerate - should handle nested dictionaries', () => {
  type NestedEnum = {
    STATUS: {
      ACTIVE: 'active';
      INACTIVE: 'inactive';
    };
    PRIORITY: {
      HIGH: 1;
      LOW: 0;
    };
  };

  type Generated = EnumerateGenerator<NestedEnum>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<NestedEnum>>();
});

test('Enumerate - should work with const assertions', () => {
  const myEnum = {
    VALUE1: 'val1',
    VALUE2: 'val2',
    NESTED: {
      INNER: 'inner',
    },
  } as const;

  type Generated = EnumerateGenerator<typeof myEnum>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<typeof myEnum>>();
});

test('Dict - should be alias for EnumerateDict', () => {
  expectTypeOf<Dict>().toEqualTypeOf<EnumerateNestedDict>();
});

test('Enumerate - should handle metadata tuples', () => {
  type EnumWithMeta = {
    ACTIVE: readonly ['active', { description: 'Active status' }];
    INACTIVE: readonly ['inactive', { description: 'Inactive status' }];
  };

  type Generated = EnumerateGenerator<EnumWithMeta>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<EnumWithMeta>>();
});

test('Enumerate - real-world HTTP status example', () => {
  const HttpStatus = {
    SUCCESS: {
      OK: 200,
      CREATED: 201,
    },
    ERROR: {
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
    },
  } as const;

  type HttpStatusEnum = EnumerateGenerator<typeof HttpStatus>;

  expectTypeOf<HttpStatusEnum>().toEqualTypeOf<ObjectGenerator<typeof HttpStatus>>();
});

test('Enumerate - should handle mixed depth structures', () => {
  type MixedEnum = {
    SIMPLE: 'simple';
    LEVEL1: {
      LEVEL2: {
        DEEP: 'deep';
      };
      SHALLOW: 'shallow';
    };
    ANOTHER: 123;
  };

  type Generated = EnumerateGenerator<MixedEnum>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<MixedEnum>>();
});

test('Enumerate - should preserve literal types', () => {
  type StrictEnum = {
    LITERAL_STRING: 'exact-string';
    LITERAL_NUMBER: 42;
    // Non-literal values should be never
    LITERAL_BOOLEAN: true;
  };

  type Generated = EnumerateGenerator<StrictEnum>;

  expectTypeOf<Generated['LITERAL_STRING']>().toEqualTypeOf<never>();
});

test('Enumerate - performance test with moderate nesting', () => {
  type ModerateNesting = {
    L1: {
      L2: {
        L3: {
          VALUE: 'deep';
        };
      };
    };
    FLAT: 'flat';
  };

  type Generated = EnumerateGenerator<ModerateNesting>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<ModerateNesting>>();
});

test('Enumerate - should handle wide objects (many keys)', () => {
  type WideEnum = {
    A: 'a'; B: 'b'; C: 'c'; D: 'd'; E: 'e';
    F: 'f'; G: 'g'; H: 'h'; I: 'i'; J: 'j';
  };

  type Generated = EnumerateGenerator<WideEnum>;

  expectTypeOf<Generated>().toEqualTypeOf<ObjectGenerator<WideEnum>>();
});
