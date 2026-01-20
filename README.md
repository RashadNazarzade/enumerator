# @glitchproof/enumerator

Type-safe enumerations with metadata, nesting, and built-in validation.

```typescript
import { enumerate } from "@glitchproof/enumerator";

const Status = enumerate({
  ACTIVE: ["active", { icon: "✅", color: "green" }],
  INACTIVE: ["inactive", { icon: "⭕", color: "gray" }],
  PENDING: "pending",
});

Status.ACTIVE.value; // 'active'
Status.ACTIVE.meta.icon; // '✅'
Status.ACTIVE.equals("active"); // true (type guard!)
Status.contains(userInput); // Runtime validation
```

## Features

- ✅ **Type-safe** - Full TypeScript inference and type narrowing
- ✅ **Metadata** - Attach rich data to each value
- ✅ **Nesting** - Organize enums hierarchically
- ✅ **Type guards** - `equals()`, `contains()`, `containsOneOf()`
- ✅ **Validation** - Runtime checking with type narrowing
- ✅ **Immutable** - All values frozen with `Object.freeze()`
- ✅ **Performant** - Lazy evaluation with caching

## Installation

```bash
npm install @glitchproof/enumerator
```

## Quick Start

```typescript
import { enumerate } from "@glitchproof/enumerator";

// Simple values
const Status = enumerate({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
});

Status.ACTIVE.value; // 'active'
Status.ACTIVE.equals(userInput); // Type guard
Status.contains(apiResponse); // Validation

// With metadata
const HTTP = enumerate({
  OK: [200, { message: "Success", retry: false }],
  ERROR: [500, { message: "Server error", retry: true }],
});

HTTP.OK.value; // 200
HTTP.OK.meta.message; // 'Success'

// Nested
const API = enumerate({
  V1: { USERS: "/v1/users", POSTS: "/v1/posts" },
  V2: { USERS: "/v2/users", POSTS: "/v2/posts" },
});

API.V1.USERS.value; // '/v1/users'

// Or wrap existing TypeScript enums
enum LegacyStatus {
  ACTIVE = "active",
  PENDING = "pending",
}
const Legacy = enumerate(LegacyStatus);

Legacy.ACTIVE.value; // 'active'
Legacy.contains("active"); // true
```

## API

### Individual Values

```typescript
Status.ACTIVE.value; // 'active' - The enum value
Status.ACTIVE.meta; // { icon: '✅' } - Metadata (if defined)
Status.ACTIVE.equals(x); // boolean - Type guard (uses Object.is)
```

### Enum Object

**Validation:**

```typescript
Status.contains(value); // Check if value exists
Status.containsOneOf(value, ["active", "pending"]); // Check subset (array)
Status.containsOneOf(value, "active", "pending"); // Check subset (rest params)
Status.containsOneOf(value, (s) => s.ACTIVE); // Check subset (callback)
```

**Access:**

```typescript
Status.values; // ['active', 'inactive', 'pending'] - Frozen array
Status.asType; // { ACTIVE: 'active', ... } - Key-value object (lazy, frozen)
```

**Iteration:**

```typescript
// Callbacks receive { value, meta } objects
Status.forEach(({ value, meta }, idx, items) => {
  console.log(value, meta?.icon); // meta is undefined if not defined
});

Status.map(({ value, meta }) => ({
  label: value,
  icon: meta?.icon || "?",
}));
```

**Configuration:**

```typescript
enumerate(definition, { maxDepth: 5 }); // Limit nesting (default: 10)
```

## Examples

### API Error Handling

```typescript
const APIError = enumerate({
  NETWORK: ["network", { message: "Connection failed", retry: true }],
  AUTH: ["auth", { message: "Please login", retry: false }],
  RATE_LIMIT: [
    "rate_limit",
    { message: "Too many requests", retry: true, wait: 60 },
  ],
  SERVER: ["server", { message: "Server error", retry: true }],
});

async function fetchWithRetry(url: string) {
  try {
    return await fetch(url);
  } catch (error) {
    const errorType = classifyError(error);

    APIError.forEach(({ value, meta }) => {
      if (value === errorType && meta.retry) {
        setTimeout(() => fetchWithRetry(url), meta.wait || 1000);
      }
    });
  }
}
```

### Theme Design Tokens

```typescript
const Color = enumerate({
  PRIMARY: ["#3b82f6", { name: "Blue", dark: "#1e40af" }],
  SUCCESS: ["#22c55e", { name: "Green", dark: "#15803d" }],
  DANGER: ["#ef4444", { name: "Red", dark: "#b91c1c" }],
  WARNING: ["#f59e0b", { name: "Amber", dark: "#b45309" }],
});

function getThemeColor(color: string, isDark: boolean) {
  let result = color;
  Color.forEach(({ value, meta }) => {
    if (value === color) {
      result = isDark ? meta.dark : value;
    }
  });
  return result;
}

// Generate CSS variables
const cssVars = Color.map(
  ({ value, meta }) => `--color-${meta.name.toLowerCase()}: ${value};`,
).join("\n");
```

### Workflow States

```typescript
const TaskStatus = enumerate({
  TODO: ["todo", { next: ["in_progress"], canEdit: true }],
  IN_PROGRESS: ["in_progress", { next: ["review", "todo"], canEdit: true }],
  REVIEW: ["review", { next: ["done", "in_progress"], canEdit: false }],
  DONE: ["done", { next: [], canEdit: false }],
});

function canTransition(current: string, next: string): boolean {
  let valid = false;
  TaskStatus.forEach(({ value, meta }) => {
    if (value === current) {
      valid = meta.next.includes(next);
    }
  });
  return valid;
}
```

## TypeScript

Full type inference and narrowing:

```typescript
const Status = enumerate({
  ACTIVE: ["active", { icon: "✅" }],
  INACTIVE: "inactive",
});

// Type narrowing with guards
function handle(status: unknown) {
  if (Status.ACTIVE.equals(status)) {
    status; // Narrowed to: 'active'
  }

  if (Status.contains(status)) {
    status; // Narrowed to: 'active' | 'inactive'
  }
}

// Extract types
type Value = typeof Status.ACTIVE.value; // 'active'
type Meta = typeof Status.ACTIVE.meta; // { icon: '✅' }
```

## Advanced

### Filter by Metadata

```typescript
const Features = enumerate({
  ANALYTICS: ["analytics", { enabled: true }],
  AI_CHAT: ["ai_chat", { enabled: false }],
  EXPORT: ["export", { enabled: true }],
});

const enabled = Features.map((item) => item)
  .filter((item) => item.meta?.enabled)
  .map((item) => item.value);
// ['analytics', 'export']
```

### Edge Cases

`.equals()` uses `Object.is()` for correct NaN and ±0 handling:

```typescript
const Nums = enumerate({ ZERO: 0, NEG_ZERO: -0, NAN: NaN });

Nums.ZERO.equals(0); // true
Nums.ZERO.equals(-0); // false (distinguishes +0 from -0)
Nums.NAN.equals(NaN); // true (handles NaN correctly)
```

## Best Practices

```typescript
// ✅ Keep metadata consistent
const Status = enumerate({
  ACTIVE: ["active", { icon: "✅", color: "green" }],
  INACTIVE: ["inactive", { icon: "⭕", color: "gray" }],
});

// ✅ Limit nesting depth (2-3 levels)
const API = enumerate({
  V1: { USERS: "/v1/users" },
  V2: { USERS: "/v2/users" },
});

// ✅ Use for external configs only
const config = { ACTIVE: "active" } as const;
const Status = enumerate(config);
```

## Migration from TS Enums

### Option 1: Wrap Existing Enums

```typescript
// Existing TypeScript enum
enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

// Wrap it directly - gets all enumerator features!
const StatusEnum = enumerate(Status);

StatusEnum.ACTIVE.value; // 'active'
StatusEnum.ACTIVE.equals("active"); // true (type guard!)
StatusEnum.contains(userInput); // Runtime validation
StatusEnum.values; // ['active', 'inactive', 'pending']
```

**Best for:** Gradual migration of legacy code.

**Note:** Works best with string enums. Numeric enums have reverse mappings that create extra entries.

### Option 2: Replace with Enumerator

```typescript
// Before
enum Status {
  ACTIVE = "active",
}
const meta = { [Status.ACTIVE]: { icon: "✅" } };

// After
const Status = enumerate({
  ACTIVE: ["active", { icon: "✅" }],
});
```

**Best for:** New code or full refactors.

**Changes:** `Status.ACTIVE` → `Status.ACTIVE.value`, metadata now inline, validation built-in.

## Why This Package?

**Better than TypeScript enum:**

- ✅ Metadata support
- ✅ Runtime validation
- ✅ Type guards included
- ✅ Nested structures
- ✅ Actually immutable

**Better than `as const`:**

- ✅ Built-in validation
- ✅ Type guards
- ✅ Iteration helpers
- ✅ Metadata support

**When NOT to use:**

- Zero dependencies required (company policy)
- Ultra-simple cases (3 values, no metadata)
- Need reverse numeric mapping

## Performance

- Lazy evaluation (zero overhead if unused)
- Aggressive caching (compute once, use forever)
