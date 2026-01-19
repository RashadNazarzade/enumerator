import { bench, describe } from 'vitest';
import { enumerator } from '@/core/enumerator';

describe('Memory Efficiency', () => {
  describe('Object Creation Overhead', () => {
    bench('create 100 small enums', () => {
      for (let i = 0; i < 100; i++) {
        enumerator({
          A: 'a',
          B: 'b',
          C: 'c',
        });
      }
    });

    bench('create 10 medium enums', () => {
      for (let i = 0; i < 10; i++) {
        const obj: Record<string, string> = {};
        for (let j = 0; j < 50; j++) {
          obj[`KEY_${j}`] = `value_${j}`;
        }
        enumerator(obj);
      }
    });

    bench('create 1 large enum', () => {
      const obj: Record<string, string> = {};
      for (let j = 0; j < 1000; j++) {
        obj[`KEY_${j}`] = `value_${j}`;
      }
      enumerator(obj);
    });
  });

  describe('Reuse vs Recreation', () => {
    const config = {
      STATUS: { ACTIVE: 'active', INACTIVE: 'inactive' },
      PRIORITY: { HIGH: 1, LOW: 0 },
    } as const;

    let cached: ReturnType<typeof enumerator<typeof config>>;

    bench('create new enum each time', () => {
      for (let i = 0; i < 100; i++) {
        const _Status = enumerator(config);
        void _Status.STATUS.ACTIVE.value;
      }
    });

    bench('reuse cached enum', () => {
      if (!cached) cached = enumerator(config);
      for (let i = 0; i < 100; i++) {
        void cached.STATUS.ACTIVE.value;
      }
    });
  });

  describe('Feature Access Patterns', () => {
    const Status = enumerator({
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
    });

    bench('access value property 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        void Status.ACTIVE.value;
      }
    });

    bench('access equals method 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        void Status.ACTIVE.equals;
      }
    });

    bench('access contains method 1000x', () => {
      for (let i = 0; i < 1000; i++) {
        void Status.contains;
      }
    });
  });
});
