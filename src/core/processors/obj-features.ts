import type { EnumerateValue } from "@/types/base";
import { isEnumerateValueWithMetadata } from "../guards";

export const createObjectFeature = <const T extends Record<string, any>>(
    obj: T,
    directValues: EnumerateValue[]
) => {
    let cachedAsType: Record<string, EnumerateValue>;

    return {
        // Type only property
        asValueType: null,

        values: Object.freeze([...directValues]),

        get asType(): Record<string, EnumerateValue> {
            if (cachedAsType === undefined) {
                cachedAsType = Object.create(null);

                for(const [key, value] of Object.entries(obj)){
                    if(isEnumerateValueWithMetadata(value)){
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
            return directValues.includes(check as EnumerateValue);
        },

        containsOneOf<Val extends EnumerateValue>(check: unknown, ...checkWithin: any[]): check is Val {
            if(!checkWithin?.length) return false;

            const firstArg = checkWithin[0];

            if(typeof firstArg === 'function'){
                const selectees = firstArg(this.asType);

                if(Array.isArray(selectees)){
                    return selectees.includes(check as Val);
                }

                return selectees === check;
            }

            if(Array.isArray(firstArg)){
                return firstArg.includes(check as Val);
            }


            return checkWithin.includes(check as Val);
        }
        
    }
}