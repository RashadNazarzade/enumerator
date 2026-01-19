import { expectTypeOf, test } from 'vitest';
import type { ObjectFeature, ValueFeature } from '@/types/features';
import type { ValueBase, ValueEquals } from '@/types/features/val';
import type {
  ObjectBase,
  ObjectContains,
} from '@/types/features/obj';

test('ValueFeature - should have value property for simple value', () => {
  type Feature = ValueFeature<'active'>;
  
  expectTypeOf<Feature>().toMatchObjectType<{ value: 'active' }>();
});

test('ValueFeature - should have value and meta for metadata tuple', () => {
  type MetaValue = readonly ['active', { description: 'Active status' }];
  type Feature = ValueFeature<MetaValue>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    value: 'active';
    meta: { description: 'Active status' };
  }>();
});

test('ValueFeature - should have equals type guard', () => {
  type Feature = ValueFeature<'active'>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    equals: (check: unknown) => check is 'active';
  }>();
});

test('ValueFeature - should work with numeric values', () => {
  type Feature = ValueFeature<123>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    value: 123;
    equals: (check: unknown) => check is 123;
  }>();
});

// ValueBase tests
test('ValueBase - should only have value when no description', () => {
  type Feature = ValueBase<'test', never>;
  
  expectTypeOf<Feature>().toEqualTypeOf<{ value: 'test' }>();
});

test('ValueBase - should have value and meta when description exists', () => {
  type Meta = { description: 'Test description' };
  type Feature = ValueBase<'test', Meta>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    value: 'test';
    meta: Meta;
  }>();
});

test('IsValueFeature - should have equals method', () => {
  type Feature = ValueEquals<'test'>;
  
  expectTypeOf<Feature>().toEqualTypeOf<{
    equals: (check: unknown) => check is 'test';
  }>();
});

test('ObjectFeature - should have asType property', () => {
  type TestEnum = {
    A: 'a';
    B: 'b';
  };
  
  type Feature = ObjectFeature<TestEnum>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    asType: { A: 'a'; B: 'b' };
  }>();
});

test('ObjectFeature - should have asValueType union', () => {
  type TestEnum = {
    A: 'a';
    B: 'b';
    C: 123;
  };
  
  type Feature = ObjectFeature<TestEnum>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    asValueType: 'a' | 'b' | 123;
  }>();
});

test('ObjectFeature - should have values tuple', () => {
  type TestEnum = {
    A: 'a';
    B: 'b';
  };
  
  type Feature = ObjectFeature<TestEnum>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    values: ['a', 'b'];
  }>();
});

test('ObjectFeature - should have contains type guard', () => {
  type TestEnum = {
    A: 'a';
    B: 'b';
  };
  
  type Feature = ObjectFeature<TestEnum>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    contains: (check: unknown) => check is 'a' | 'b';
  }>();
});


test('ObjectBase - should have all common properties', () => {
  type EnumValObj = { A: 'a'; B: 'b' };
  type EnumVal = 'a' | 'b';
  
  type Feature = ObjectBase<EnumValObj, EnumVal>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    asType: EnumValObj;
    asValueType: EnumVal;
    values: ['a', 'b'];
  }>();
});


test('IsObjectFeature - should have contains method', () => {
  type Feature = ObjectContains<'a' | 'b' | 'c'>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    contains: (check: unknown) => check is 'a' | 'b' | 'c';
  }>();
});



test('ObjectFeature - should work with complex nested structure', () => {
  type ComplexEnum = {
    SIMPLE: 'simple';
    WITH_META: readonly ['meta', { description: 'Metadata value' }];
    NESTED: {
      INNER: 'inner';
    };
  };
  
  type Feature = ObjectFeature<ComplexEnum>;
  
  expectTypeOf<Feature>().toMatchObjectType<{
    asType: { SIMPLE: 'simple'; WITH_META: 'meta' };
    asValueType: 'simple' | 'meta';
  }>();
});

test('ValueFeature and ObjectFeature - should be distinct types', () => {
  type VFeature = ValueFeature<'test'>;
  type OFeature = ObjectFeature<{ A: 'a' }>;

  expectTypeOf<VFeature>().not.toEqualTypeOf<OFeature>();
  expectTypeOf<OFeature>().not.toEqualTypeOf<VFeature>();
});
