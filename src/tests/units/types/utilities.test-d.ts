import { expectTypeOf, test } from 'vitest';
import type {
  WhenNever,
  WhenNestedDict,
  WhenDictValue,
  ExtractDictValues,
  ExtractDictNonValues,
  PickDictValues,
  DictMapToTuple,
} from '@/types/utilities';


test('whenNever - should return Truthy when never', () => {
  type Result = WhenNever<never, 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'yes'>();
});

test('whenNever - should return Falsy when not never', () => {
  type Result = WhenNever<string, 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'no'>();
});

test('whenDict - should return Truthy for EnumerateDict', () => {
  type TestDict = { nested: { value: string } };
  type Result = WhenNestedDict<TestDict, 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'yes'>();
});

test('whenDict - should return Falsy for non-dict', () => {
  type Result = WhenNestedDict<string, 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'no'>();
});

test('whenDictVal - should return Truthy for EnumerateVal', () => {
  type Result = WhenDictValue<'value', 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'yes'>();
});

test('whenDictVal - should work with numbers', () => {
  type Result = WhenDictValue<123, 'yes', 'no'>;
  expectTypeOf<Result>().toEqualTypeOf<'yes'>();
});

test('ExtractDictValues - should extract only value keys', () => {
  type TestDict = {
    VALUE1: 'val1';
    VALUE2: 123;
    NESTED: {
      INNER: 'inner';
    };
  };

  type Result = ExtractDictValues<TestDict>;
  
  expectTypeOf<Result>().toEqualTypeOf<{
    VALUE1: 'val1';
    VALUE2: 123;
  }>();
});

test('ExtractDictValues - should unwrap EnumerateValMeta tuples', () => {
  type TestDict = {
    SIMPLE: 'value';
    WITH_META: readonly ['meta-value', { description: 'test' }];
  };

  type Result = ExtractDictValues<TestDict>;
  
  expectTypeOf<Result>().toEqualTypeOf<{
    SIMPLE: 'value';
    WITH_META: 'meta-value';
  }>();
});

test('ExtractDictNonValues - should extract only nested dict keys', () => {
  type TestDict = {
    VALUE: 'val';
    NESTED: {
      INNER: 'inner';
    };
  };

  type Result = ExtractDictNonValues<TestDict>;
  
  expectTypeOf<Result>().toEqualTypeOf<{
    NESTED: {
      INNER: 'inner';
    };
  }>();
});

test('PickDictValues - should create union of all values', () => {
  type TestDict = {
    A: 'valueA';
    B: 'valueB';
    C: 123;
  };

  type Result = PickDictValues<TestDict>;
  
  expectTypeOf<Result>().toEqualTypeOf<'valueA' | 'valueB' | 123>();
});

test('DictMapToTuple - should convert union to tuple when no keys provided', () => {
  type TestObj = {
    A: 'a';
    B: 'b';
    C: 'c';
  };

  type Result = DictMapToTuple<TestObj>;

  expectTypeOf<Result>().toEqualTypeOf<['a', 'b', 'c']>();
});

test('DictMapToTuple - should map specific keys to tuple', () => {
  type TestObj = {
    FIRST: 'first';
    SECOND: 'second';
    THIRD: 'third';
  };

  type Result = DictMapToTuple<TestObj, ['FIRST', 'THIRD']>;
  
  expectTypeOf<Result>().toEqualTypeOf<['first', 'third']>();
});


test('DictMapToTuple - should handle empty objects', () => {
  type EmptyObj = Record<string, never>;
  type Result = DictMapToTuple<EmptyObj>;
  
  expectTypeOf<Result>().toEqualTypeOf<[]>();
});

test('ExtractDictValues - should handle mixed deeply nested structure', () => {
  type ComplexDict = {
    SIMPLE: 'value';
    WITH_META: readonly ['meta', { description: 'desc' }];
    NESTED: {
      INNER_VALUE: 'inner';
      DEEPER: {
        DEEP_VALUE: 123;
      };
    };
  };

  type Values = ExtractDictValues<ComplexDict>;
  
  expectTypeOf<Values>().toEqualTypeOf<{
    SIMPLE: 'value';
    WITH_META: 'meta';
  }>();
});
