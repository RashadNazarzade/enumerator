import type { Simplify } from "@/types/utilities";

export type ValueEquals<Val> = {
  equals(check: unknown): check is Simplify<Val>;
};
