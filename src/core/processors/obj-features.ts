import type { EnumerateValue, EnumerateValType, EnumerateValueMetadata } from "@/types/base";
import type { LoopItem } from "@/types/features/obj";

import { enumDirectiveToValueConverter } from "@/utilities";

import { isEnumerateValueWithMetadata } from "../guards";

export const createObjectFeature = <const T extends Record<string, any>>(
    obj: T,
    directValues: EnumerateValue[]
) => {
    const values = directValues.map(enumDirectiveToValueConverter);
    let cachedAsType: Record<string, EnumerateValue>;
    let cachedLoopItems: LoopItem<EnumerateValType, EnumerateValueMetadata | undefined>[];

    return {
        // Type only property
        asValueType: null,

        values: Object.freeze(values),

        get asType(): Record<string, EnumerateValue> {
            if (cachedAsType === undefined) {
                cachedAsType = Object.create(null);

                for (const [key, value] of Object.entries(obj)) {
                    if (isEnumerateValueWithMetadata(value)) {
                        const [enumerateValue] = value;
                        cachedAsType[key] = enumerateValue;
                        continue;
                    }

                    cachedAsType[key] = value;
                }

                Object.freeze(cachedAsType);
            }

            return cachedAsType;
        },

        contains(check: unknown): check is EnumerateValue {
            return values.includes(check as EnumerateValue);
        },

        containsOneOf<Val extends EnumerateValue>(check: unknown, ...checkWithin: any[]): check is Val {
            if (!checkWithin?.length) return false;

            const firstArg = checkWithin[0];

            if (typeof firstArg === 'function') {
                const selectees = firstArg(this.asType);

                if (Array.isArray(selectees)) {
                    return selectees.includes(check as Val);
                }

                return selectees === check;
            }

            if (Array.isArray(firstArg)) {
                return firstArg.includes(check as Val);
            }


            return checkWithin.includes(check as Val);
        },

        map<MappedValue>(
            callback: (item: LoopItem<EnumerateValType, EnumerateValueMetadata | undefined>, idx: number, items: LoopItem<EnumerateValType, EnumerateValueMetadata | undefined>[]) => MappedValue
        ): MappedValue[] {
          
            if (cachedLoopItems === undefined) {
                cachedLoopItems = directValues.map((enumValue) => {
                    if (isEnumerateValueWithMetadata(enumValue)) {
                        const [value, meta] = enumValue;

                        return Object.freeze({ value, meta });
                    }

                    return Object.freeze({ value: enumValue, meta: undefined });
                });
                
                Object.freeze(cachedLoopItems);
            }

            return cachedLoopItems.map(callback);
        },

        forEach(
            callback: (item: LoopItem<EnumerateValType, EnumerateValueMetadata | undefined>, idx: number, items: LoopItem<EnumerateValType, EnumerateValueMetadata | undefined>[]) => void
        ): void {
           
            if (cachedLoopItems === undefined) {
                cachedLoopItems = directValues.map((enumValue) => {
                    if (isEnumerateValueWithMetadata(enumValue)) {
                        const [value, meta] = enumValue;
                        return Object.freeze({ value, meta });
                    }
                    return Object.freeze({ value: enumValue, meta: undefined });
                });
                Object.freeze(cachedLoopItems);
            }

            cachedLoopItems.forEach(callback);
        },

    }
}