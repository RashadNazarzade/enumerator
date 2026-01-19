import { describe, test, expect } from 'vitest';
import { enumerator } from '@/core/enumerator';
import { EnumeratorDepthError, EnumeratorValueError } from '@/constants/errors';

describe('Edge Cases & Bug Detection', () => {
  describe('Unusual but Valid Inputs', () => {
    test('should handle Unicode characters in values', () => {
      const Unicode = enumerator({
        EMOJI: '😀',
        CHINESE: '你好',
        ARABIC: 'مرحبا',
        RUSSIAN: 'Привет',
      } as const);

      expect(Unicode.EMOJI.value).toBe('😀');
      expect(Unicode.CHINESE.value).toBe('你好');
      expect(Unicode.EMOJI.equals('😀')).toBe(true);
      expect(Unicode.contains('你好')).toBe(true);
    });

    test('should handle special characters in keys', () => {
      const Special = enumerator({
        'KEY-WITH-DASHES': 'value1',
        'KEY_WITH_UNDERSCORES': 'value2',
        'KEY.WITH.DOTS': 'value3',
      } as const);

      expect(Special['KEY-WITH-DASHES'].value).toBe('value1');
      expect(Special['KEY_WITH_UNDERSCORES'].value).toBe('value2');
      expect(Special['KEY.WITH.DOTS'].value).toBe('value3');
    });

    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const Long = enumerator({
        LONG: longString,
      } as const);

      expect(Long.LONG.value).toBe(longString);
      expect(Long.LONG.value.length).toBe(10000);
      expect(Long.LONG.equals(longString)).toBe(true);
    });

    test('should handle whitespace-only values', () => {
      const Whitespace = enumerator({
        SPACE: ' ',
        TAB: '\t',
        NEWLINE: '\n',
        MULTIPLE: '   ',
      } as const);

      expect(Whitespace.SPACE.value).toBe(' ');
      expect(Whitespace.TAB.value).toBe('\t');
      expect(Whitespace.NEWLINE.value).toBe('\n');
    });

    test('should handle extreme numbers', () => {
      const Numbers = enumerator({
        MAX_SAFE: Number.MAX_SAFE_INTEGER,
        MIN_SAFE: Number.MIN_SAFE_INTEGER,
        MAX_VALUE: Number.MAX_VALUE,
        MIN_VALUE: Number.MIN_VALUE,
        EPSILON: Number.EPSILON,
      } as const);

      expect(Numbers.MAX_SAFE.value).toBe(Number.MAX_SAFE_INTEGER);
      expect(Numbers.MIN_VALUE.value).toBe(Number.MIN_VALUE);
    });
  });

  describe('Potential Bug Scenarios', () => {
    test('should not confuse 0 with false', () => {
      const Falsy = enumerator({
        ZERO: 0,
        EMPTY: '',
      } as const);

      expect(Falsy.ZERO.equals(0)).toBe(true);
      expect(Falsy.ZERO.equals(false)).toBe(false);
      expect(Falsy.ZERO.equals('')).toBe(false);
      expect(Falsy.ZERO.equals(null)).toBe(false);
      expect(Falsy.ZERO.equals(undefined)).toBe(false);

      expect(Falsy.EMPTY.equals('')).toBe(true);
      expect(Falsy.EMPTY.equals(0)).toBe(false);
      expect(Falsy.EMPTY.equals(false)).toBe(false);
    });

    test('should differentiate +0 and -0 (Object.is behavior)', () => {
      const Zeros = enumerator({
        POSITIVE_ZERO: 0,
        NEGATIVE_ZERO: -0,
      });

      // Object.is distinguishes +0 and -0 (unlike ===)
      expect(Zeros.POSITIVE_ZERO.equals(0)).toBe(true);
      expect(Zeros.POSITIVE_ZERO.equals(-0)).toBe(false);
      
      expect(Zeros.NEGATIVE_ZERO.equals(-0)).toBe(true);
      expect(Zeros.NEGATIVE_ZERO.equals(0)).toBe(false);
      
      // This is better than === which treats them as equal
      expect(0 === -0).toBe(true); // === behavior
      expect(Object.is(0, -0)).toBe(false); // Object.is behavior ✅
    });

    test('should handle NaN correctly (Object.is behavior)', () => {
      const Special = enumerator({
        NAN: NaN,
        NUMBER: 123,
      });

      expect(Special.NAN.equals(NaN)).toBe(true);
      expect(Special.NAN.value).toBe(NaN);
      expect(Number.isNaN(Special.NAN.value)).toBe(true);

      // Array.includes() also uses SameValueZero which matches NaN
      expect(Special.contains(NaN)).toBe(true);
      
      // Object.is provides consistent behavior:
      // Object.is(NaN, NaN) → true (equals)
      // [NaN].includes(NaN) → true (contains)
    });

    test('should handle array-like objects vs actual arrays', () => {
      const arrayLike = {
        0: 'value',
        1: { description: 'meta' },
        length: 2,
      };

      // Array-like should NOT be treated as metadata tuple
      const Test = enumerator({
        ARRAY_LIKE: arrayLike,
      } as any);

      // Should treat as nested dict, not metadata
      expect(Test.ARRAY_LIKE).toBeDefined();
    });

    test('should differentiate between similar nested structures', () => {
      const Nested = enumerator({
        SIMPLE_OBJECT: { value: 'nested' },
        WITH_VALUE_KEY: { value: 'test', other: 'data' },
      } as const);

      // Both should be treated as nested dicts
      expect(Nested.SIMPLE_OBJECT.value.value).toBe('nested');
      expect(Nested.WITH_VALUE_KEY.value.value).toBe('test');
    });


    test('should handle empty nested objects correctly', () => {
      const WithEmpty = enumerator({
        EMPTY_NESTED: {},
        VALUE: 'value',
        NESTED_WITH_EMPTY: {
          INNER_EMPTY: {},
          INNER_VALUE: 'inner',
        },
      } as const);

      expect(WithEmpty.VALUE.value).toBe('value');
      expect(WithEmpty.NESTED_WITH_EMPTY.INNER_VALUE.value).toBe('inner');
      // Empty nested objects should exist but have no values
      expect(WithEmpty.EMPTY_NESTED).toBeDefined();
    });

    test('should preserve exact number precision', () => {
      const Precise = enumerator({
        FLOAT: 3.14159265359,
        NEGATIVE: -0.0001,
        SCIENTIFIC: 1.23e-10,
      } as const);

      expect(Precise.FLOAT.value).toBe(3.14159265359);
      expect(Precise.NEGATIVE.value).toBe(-0.0001);
      expect(Precise.SCIENTIFIC.value).toBe(1.23e-10);
    });
  });

  describe('Stress Tests', () => {
    test('should handle very wide flat structure', () => {
      const wide: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        wide[`KEY_${i}`] = `value_${i}`;
      }

      const Wide = enumerator(wide);

      expect(Wide?.KEY_0?.value).toBe('value_0');
      expect(Wide?.KEY_999?.value).toBe('value_999');
      expect(Wide.values.length).toBe(1000);
      expect(Wide.contains('value_500')).toBe(true);
    });

    test('should handle maximum safe depth', () => {
      const createDeep = (depth: number): any => {
        if (depth === 0) return { LEAF: 'value' };
        return { LEVEL: createDeep(depth - 1) };
      };

      // Depth 9 should work (maxDepth defaults to 10)
      const deep = createDeep(9);
      const Deep = enumerator(deep);

      let current: any = Deep;
      for (let i = 0; i < 9; i++) {
        current = current.LEVEL;
      }
      expect(current.LEAF.value).toBe('value');
    });

    test('should handle mixed depth levels', () => {
      const Mixed = enumerator({
        FLAT: 'flat',
        SHALLOW: {
          VALUE: 'shallow',
        },
        DEEP: {
          L2: {
            L3: {
              L4: {
                VALUE: 'deep',
              },
            },
          },
        },
      } as const);

      expect(Mixed.FLAT.value).toBe('flat');
      expect(Mixed.SHALLOW.VALUE.value).toBe('shallow');
      expect(Mixed.DEEP.L2.L3.L4.VALUE.value).toBe('deep');
    });
  });

  describe('Error Detection', () => {
    test('should throw on invalid value types', () => {
      expect(() => {
        enumerator({
          INVALID: true as any, // boolean not allowed
        });
      }).toThrow(EnumeratorValueError);

      expect(() => {
        enumerator({
          INVALID: null as any,
        });
      }).toThrow(EnumeratorValueError);

      expect(() => {
        enumerator({
          INVALID: undefined as any,
        });
      }).toThrow(EnumeratorValueError);
    });

    test('should throw on depth exceeded', () => {
      const deep = {
        L1: { L2: { L3: { L4: { L5: {
          L6: { L7: { L8: { L9: { L10: {
            L11: 'too-deep',
          }}}}}
        }}}}}
      } as any;

      expect(() => {
        enumerator(deep);
      }).toThrow(EnumeratorDepthError);
    });

    test('should provide helpful error messages', () => {
      try {
        enumerator({
          VALID: 'valid',
          INVALID: { invalid: true } as any,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EnumeratorValueError);
        const message = (error as Error).message;
        expect(message).toContain('Invalid enum value');
        expect(message).toContain('Expected one of');
      }
    });
  });

  describe('Immutability Tests', () => {
    test('values array should be immutable', () => {
      const Status = enumerator({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const);

      expect(Object.isFrozen(Status.values)).toBe(true);

      expect(() => {
        (Status.values as any).push('invalid');
      }).toThrow();

      expect(() => {
        (Status.values as any)[0] = 'changed';
      }).toThrow();
    });

    test('asType should be immutable', () => {
      const Status = enumerator({
        ACTIVE: 'active',
      } as const);

      const asType = Status.asType;
      expect(Object.isFrozen(asType)).toBe(true);

      expect(() => {
        (asType as any).ACTIVE = 'changed';
      }).toThrow();

      expect(() => {
        (asType as any).NEW = 'new';
      }).toThrow();
    });

    test('should not mutate original input', () => {
      const original = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
      } as const;

      const Status = enumerator(original);

      // Original should remain unchanged
      expect(original.ACTIVE).toBe('active');
      expect(original.INACTIVE).toBe('inactive');

      // Should be different objects
      expect(Status).not.toBe(original);
    });
  });

  describe('Performance Edge Cases', () => {
    test('should handle containsOneOf with large subset', () => {
      const large: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        large[`KEY_${i}`] = `value_${i}`;
      }

      const Large = enumerator(large);

      const subset = Array.from({ length: 50 }, (_, i) => `value_${i}`);
      expect(Large.containsOneOf('value_25', subset)).toBe(true);
      expect(Large.containsOneOf('value_75', subset)).toBe(false);
    });

    test('should cache asType computation', () => {
      const Status = enumerator({
        A: 'a',
        B: 'b',
        C: 'c',
      } as const);

      const first = Status.asType;
      const second = Status.asType;

      // Should return same reference (cached)
      expect(first).toBe(second);
    });
  });
});
