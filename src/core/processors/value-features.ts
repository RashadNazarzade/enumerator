import type { EnumerateValue } from '@/types/base';
import { isEnumerateValueWithMetadata } from '../guards/type-guards';

export const createValueFeature = <const T extends EnumerateValue>(
    enumValue: T
) => {
    if (isEnumerateValueWithMetadata(enumValue)) {
        const [value, meta] = enumValue;

        return {
            value,
            meta,
            equals: (check: unknown) => check === value,
        }
    }

    
    return {
        value: enumValue,
        equals: (check: unknown) => check === enumValue,
    }
};

