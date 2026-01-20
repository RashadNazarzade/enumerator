import type { EnumerateOptionsDefault } from "@/types/base";
import type { Dict, EnumerateGenerator, Options } from "@/types/enumerator";

import { processDictionary } from "./processors";

export function enumerate<const Enums extends Dict>(
  enums: Enums,
): EnumerateGenerator<Enums, EnumerateOptionsDefault>;

export function enumerate<const Enums extends Dict, const Opt extends Options>(
  enums: Enums,
  options: Opt,
): EnumerateGenerator<Enums, Opt>;

export function enumerate<
  const Enums extends Dict,
  const Opt extends Options = EnumerateOptionsDefault,
>(enums: Enums, options?: Opt) {
  return processDictionary(enums, options) as EnumerateGenerator<
    Enums,
    Opt extends undefined ? EnumerateOptionsDefault : Opt
  >;
}
