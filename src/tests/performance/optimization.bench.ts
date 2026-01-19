import { bench, describe } from 'vitest';

describe('Optimization Comparisons', () => {
  describe('Array Pre-allocation vs Dynamic Growth', () => {
    const size = 1000;

    bench('dynamic array growth', () => {
      const arr: number[] = [];
      for (let i = 0; i < size; i++) {
        arr.push(i);
      }
    });

    bench('pre-allocated array', () => {
      const arr = new Array(size);
      for (let i = 0; i < size; i++) {
        arr[i] = i;
      }
    });

    bench('pre-allocated + trim', () => {
      const arr = new Array(size);
      let index = 0;
      for (let i = 0; i < size; i++) {
        if (i % 2 === 0) {
          arr[index++] = i;
        }
      }
      arr.length = index;
    });
  });

  describe('Object Creation Strategies', () => {
    bench('Object literal {}', () => {
      const obj: Record<string, number> = {};
      for (let i = 0; i < 100; i++) {
        obj[`key${i}`] = i;
      }
    });

    bench('Object.create(null)', () => {
      const obj = Object.create(null);
      for (let i = 0; i < 100; i++) {
        obj[`key${i}`] = i;
      }
    });
  });

  describe('Object Iteration Strategies', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
      obj[`key${i}`] = i;
    }

    bench('Object.keys + forEach', () => {
      Object.keys(obj).forEach((key) => {
        void obj[key]; 
      });
    });

    bench('Object.entries + forEach', () => {
      Object.entries(obj).forEach(([_key, _val]) => {
        // use key and val
      });
    });

    bench('for...in loop', () => {
      for (const key in obj) {
        void obj[key]; 
      }
    });

    bench('Object.entries + for...of', () => {
      for (const [_key, _val] of Object.entries(obj)) {
        void _key;
        void _val;
      }
    });
  });

  describe('Type Checking Strategies', () => {
    const testCases = ['string', 123, true, null, undefined, [], {}, ['val', {}]];

    bench('typeof checks', () => {
      for (const val of testCases) {
        void (typeof val === 'string');
        void (typeof val === 'number');
      }
    });

    bench('Array.isArray checks', () => {
      for (const val of testCases) {
        void Array.isArray(val);
      }
    });

    bench('combined checks (current approach)', () => {
      for (const val of testCases) {
        void (typeof val === 'string' || typeof val === 'number');
        void (Array.isArray(val) && val.length === 2);
        void (typeof val === 'object' && val !== null && !Array.isArray(val));
      }
    });
  });

  describe('Getter vs Direct Property', () => {
    let cachedValue: string | undefined;

    const objWithGetter = {
      get computed() {
        if (!cachedValue) {
          cachedValue = 'expensive computation';
        }
        return cachedValue;
      },
    };

    const objWithDirect = {
      computed: 'direct value',
    };

    bench('lazy getter - first access', () => {
      cachedValue = undefined;
      void objWithGetter.computed;
    });

    bench('lazy getter - cached access', () => {
      void objWithGetter.computed;
    });

    bench('direct property access', () => {
      void objWithDirect.computed;
    });
  });

  describe('Object.freeze Performance', () => {
    bench('without freeze', () => {
      const _arr = [1, 2, 3, 4, 5];
      const _obj = { a: 1, b: 2, c: 3 };
      void _arr;
      void _obj;
    });

    bench('with freeze', () => {
      const _arr = Object.freeze([1, 2, 3, 4, 5]);
      const _obj = Object.freeze({ a: 1, b: 2, c: 3 });
      void _arr;
      void _obj;
    });

    bench('access frozen array', () => {
      const arr = Object.freeze([1, 2, 3, 4, 5]);
      void arr[0];
      void arr.length;
    });

    bench('access frozen object', () => {
      const obj = Object.freeze({ a: 1, b: 2, c: 3 });
      void obj.a;
      void obj.b;
    });
  });
});
