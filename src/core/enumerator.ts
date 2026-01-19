// import type { EnumerateNestedDict, EnumerateValue } from "@/types/base";
import type { Dict } from "@/types/enumerator";

export const enumerator = <Enums extends Dict>(enums: Enums) => {
    const entries = Object.entries(enums);

    for (let i = 0; i < entries.length; i++) {
        // const [key, value] = entries[i] as [string, EnumerateNestedDict | EnumerateValue];


    }
}