import { describe, test, expect } from 'vitest';
import { createValueFeature, createMetadataValueFeature } from '@/core/processors/value-features';
import { createObjectFeature } from '@/core/processors/obj-features';

describe('Value Processors', () => {
  describe('createValueFeature', () => {
    test('should create feature for string values', () => {
      const feature = createValueFeature('active');
      
      expect(feature.value).toBe('active');
      expect(feature.equals('active')).toBe(true);
      expect(feature.equals('inactive')).toBe(false);
    });

    test('should create feature for number values', () => {
      const feature = createValueFeature(123);
      
      expect(feature.value).toBe(123);
      expect(feature.equals(123)).toBe(true);
      expect(feature.equals(456)).toBe(false);
    });

    test('should have type guard functionality', () => {
      const feature = createValueFeature('test');
      
      const checkValue = (val: unknown) => {
        if (feature.equals(val)) {
          // Type should be narrowed to 'test'
          expect(typeof val).toBe('string');
          expect(val).toBe('test');
        }
      };
      
      checkValue('test');
      checkValue('other');
    });

    test('should handle edge case values', () => {
      // Empty string
      const empty = createValueFeature('');
      expect(empty.value).toBe('');
      expect(empty.equals('')).toBe(true);
      
      // Zero
      const zero = createValueFeature(0);
      expect(zero.value).toBe(0);
      expect(zero.equals(0)).toBe(true);
      expect(zero.equals(false)).toBe(false); // Important: 0 !== false
      
      // Negative number
      const negative = createValueFeature(-1);
      expect(negative.value).toBe(-1);
      expect(negative.equals(-1)).toBe(true);
      
      // Special numbers
      const nan = createValueFeature(NaN);
      expect(nan.value).toBe(NaN);
      expect(nan.equals(NaN)).toBe(true); // Object.is(NaN, NaN) → true
      
      const inf = createValueFeature(Infinity);
      expect(inf.value).toBe(Infinity);
      expect(inf.equals(Infinity)).toBe(true);
    });
  });

  describe('createMetadataValueFeature', () => {
    test('should create feature with metadata', () => {
      const feature = createMetadataValueFeature(['active', { description: 'Active status' }] as const);
      
      expect(feature.value).toBe('active');
      expect(feature.meta).toEqual({ description: 'Active status' });
      expect(feature.equals('active')).toBe(true);
      expect(feature.equals('inactive')).toBe(false);
    });

    test('should handle empty metadata', () => {
      const feature = createMetadataValueFeature(['test', {}] as const);
      
      expect(feature.value).toBe('test');
      expect(feature.meta).toEqual({});
      expect(feature.equals('test')).toBe(true);
    });

    test('should handle complex metadata', () => {
      const meta = {
        description: 'Complex',
        category: 'Test',
        deprecated: true,
        since: 'v1.0.0',
        tags: ['important', 'beta'],
      };
      
      const feature = createMetadataValueFeature(['complex', meta] as const);
      
      expect(feature.value).toBe('complex');
      expect(feature.meta).toEqual(meta);
      expect(feature.meta.tags).toContain('important');
    });

    test('should work with numeric values', () => {
      const feature = createMetadataValueFeature([200, { description: 'OK' }] as const);
      
      expect(feature.value).toBe(200);
      expect(feature.meta.description).toBe('OK');
      expect(feature.equals(200)).toBe(true);
    });
  });
});

describe('Object Processors', () => {
  describe('createObjectFeature', () => {
    test('should create object feature with values array', () => {
      const obj = { ACTIVE: 'active', INACTIVE: 'inactive' };
      const values = ['active', 'inactive'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.values).toEqual(values);
      expect(Object.isFrozen(feature.values)).toBe(true);
    });

    test('should create lazy asType getter', () => {
      const obj = { ACTIVE: 'active', INACTIVE: 'inactive' };
      const values = ['active', 'inactive'];
      
      const feature = createObjectFeature(obj, values);
      
      // First access computes
      const asType = feature.asType;
      expect(asType).toEqual({ ACTIVE: 'active', INACTIVE: 'inactive' });
      expect(Object.isFrozen(asType)).toBe(true);
      
      // Second access returns cached
      expect(feature.asType).toBe(asType); // Same reference
    });

    test('should unwrap metadata tuples in asType', () => {
      const obj = {
        SIMPLE: 'simple',
        WITH_META: ['meta', { description: 'test' }] as const,
      };
      const values = ['simple', 'meta'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.asType).toEqual({
        SIMPLE: 'simple',
        WITH_META: 'meta',
      });
    });

    test('should have contains method', () => {
      const obj = { A: 'a', B: 'b', C: 'c' };
      const values = ['a', 'b', 'c'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.contains('a')).toBe(true);
      expect(feature.contains('b')).toBe(true);
      expect(feature.contains('c')).toBe(true);
      expect(feature.contains('d')).toBe(false);
      expect(feature.contains(123)).toBe(false);
      expect(feature.contains(null)).toBe(false);
    });

    test('should have containsOneOf - array variant', () => {
      const obj = { A: 'a', B: 'b', C: 'c' };
      const values = ['a', 'b', 'c'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.containsOneOf('a', ['a', 'b'])).toBe(true);
      expect(feature.containsOneOf('c', ['a', 'b'])).toBe(false);
      expect(feature.containsOneOf('d', ['a', 'b'])).toBe(false);
    });

    test('should have containsOneOf - rest params variant', () => {
      const obj = { A: 'a', B: 'b', C: 'c' };
      const values = ['a', 'b', 'c'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.containsOneOf('a', 'a', 'b')).toBe(true);
      expect(feature.containsOneOf('c', 'a', 'b')).toBe(false);
    });

    test('should have containsOneOf - callback variant', () => {
      const obj = { A: 'a', B: 'b', C: 'c' };
      const values = ['a', 'b', 'c'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.containsOneOf('a', (o: typeof obj) => [o.A, o.B])).toBe(true);
      expect(feature.containsOneOf('c', (o: typeof obj) => [o.A, o.B])).toBe(false);
      
      // Callback can return single value
      expect(feature.containsOneOf('a', (o: typeof obj) => o.A)).toBe(true);
    });

    test('should handle empty checkWithin arrays', () => {
      const obj = { A: 'a' };
      const values = ['a'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(feature.containsOneOf('a')).toBe(false);
      expect(feature.containsOneOf('a', [])).toBe(false);
    });

    test('should handle edge cases', () => {
      // Empty values
      const empty = createObjectFeature({}, []);
      expect(empty.values).toEqual([]);
      expect(empty.contains('anything')).toBe(false);
      
      // Single value
      const single = createObjectFeature({ ONLY: 'only' }, ['only']);
      expect(single.values).toEqual(['only']);
      expect(single.contains('only')).toBe(true);
      
      // Numeric values
      const numbers = createObjectFeature({ ONE: 1, TWO: 2 }, [1, 2]);
      expect(numbers.contains(1)).toBe(true);
      expect(numbers.contains(2)).toBe(true);
      expect(numbers.contains('1')).toBe(false); // Strict equality
    });

    test('should freeze values array (immutability)', () => {
      const obj = { A: 'a' };
      const values = ['a'];
      
      const feature = createObjectFeature(obj, values);
      
      expect(Object.isFrozen(feature.values)).toBe(true);
      
      // Should not be able to modify
      expect(() => {
        (feature.values as any).push('b');
      }).toThrow();
    });

    test('should freeze asType object (immutability)', () => {
      const obj = { A: 'a' };
      const values = ['a'];
      
      const feature = createObjectFeature(obj, values);
      const asType = feature.asType;
      
      expect(Object.isFrozen(asType)).toBe(true);
    });
  });
});
