import type { Dict, EnumerateGenerator, Options } from "@/types/enumerator";

import { processDictionary } from "./processors";

export const enumerator = <const Enums extends Dict>(enums: Enums, options?: Options) => {
    return processDictionary(enums, options) as EnumerateGenerator<Enums>;
}
