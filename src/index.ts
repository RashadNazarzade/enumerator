import type { Dict, EnumerateGenerator } from "@/types/enumerator";

import { enumerator } from "@/core/enumerator";

export const enumerate = <const Enums extends Dict>(enums: Enums): EnumerateGenerator<Enums> => {
    return enumerator(enums);
}