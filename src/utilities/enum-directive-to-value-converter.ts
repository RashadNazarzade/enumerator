import type { EnumerateValue } from "@/types/base";
import { isEnumerateValueWithMetadata } from "@/core/guards";

export const enumDirectiveToValueConverter = <const T extends EnumerateValue>(
    enumValue: T,
    _idx: number
): EnumerateValue => {
   if(isEnumerateValueWithMetadata(enumValue)) {
    return enumValue[0];
   }

   return enumValue;
}