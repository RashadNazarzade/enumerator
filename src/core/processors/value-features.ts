import type { EnumerateValue, EnumerateValueWithMeta } from '@/types/base';

export const createValueFeature = <const T extends EnumerateValue>(
    enumValue: T
) => ({
    value: enumValue,
    equals: (check: unknown) => Object.is(check, enumValue),
});

export const createMetadataValueFeature = <const T extends EnumerateValueWithMeta>(
    enumValue: T
) => {

    const [value, meta] = enumValue;

    return Object.assign(createValueFeature(value), { meta });
}; 